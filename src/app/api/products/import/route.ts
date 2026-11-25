import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { items, updateIfExists = false } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items to import' }, { status: 400 });
    }

    const errors: Array<{ row: number; sku: string; message: string }> = [];
    let importedCount = 0;
    let updatedCount = 0;

    // Preload categories and brands
    const existingCategories = await prisma.category.findMany();
    const categoryMap = new Map(existingCategories.map((c) => [c.name.toLowerCase(), c.id]));

    const existingBrands = await prisma.brand.findMany();
    const brandMap = new Map(existingBrands.map((b) => [b.name.toLowerCase(), b.id]));

    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      const rowNum = i + 1;

      if (!row.name || !row.sku || !row.regularPrice) {
        errors.push({
          row: rowNum,
          sku: row.sku || 'UNKNOWN',
          message: 'Missing required fields: Name, SKU, or Regular Price',
        });
        continue;
      }

      const regularPrice = parseFloat(row.regularPrice);
      if (isNaN(regularPrice) || regularPrice <= 0) {
        errors.push({
          row: rowNum,
          sku: row.sku,
          message: `Invalid Regular Price: "${row.regularPrice}"`,
        });
        continue;
      }

      const salePrice = row.salePrice ? parseFloat(row.salePrice) : null;
      const costPrice = row.costPrice ? parseFloat(row.costPrice) : null;

      // Category lookup or auto-creation
      let categoryId: string | null = null;
      if (row.category) {
        const catName = String(row.category).trim();
        const catKey = catName.toLowerCase();
        if (categoryMap.has(catKey)) {
          categoryId = categoryMap.get(catKey)!;
        } else {
          const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const newCat = await prisma.category.create({
            data: { name: catName, slug: catSlug },
          });
          categoryMap.set(catKey, newCat.id);
          categoryId = newCat.id;
        }
      }

      // Brand lookup
      let brandId: string | null = null;
      if (row.brand) {
        const brandName = String(row.brand).trim();
        const brandKey = brandName.toLowerCase();
        if (brandMap.has(brandKey)) {
          brandId = brandMap.get(brandKey)!;
        } else {
          const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const newBrand = await prisma.brand.create({
            data: { name: brandName, slug: brandSlug },
          });
          brandMap.set(brandKey, newBrand.id);
          brandId = newBrand.id;
        }
      }

      // Check if product with SKU already exists
      const existingProduct = await prisma.product.findUnique({
        where: { sku: String(row.sku).trim() },
        include: { variants: true },
      });

      if (existingProduct) {
        if (!updateIfExists) {
          errors.push({
            row: rowNum,
            sku: row.sku,
            message: `Product SKU "${row.sku}" already exists in the catalog. Toggle "Update Existing Products" to overwrite.`,
          });
          continue;
        }

        // Update existing product
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            name: String(row.name).trim(),
            description: row.description || existingProduct.description,
            shortDescription: row.shortDescription || existingProduct.shortDescription,
            regularPrice,
            salePrice,
            costPrice,
            gender: row.gender ? String(row.gender).toUpperCase() : existingProduct.gender,
            fabric: row.fabric || existingProduct.fabric,
            fit: row.fit || existingProduct.fit,
            status: row.status || existingProduct.status,
            categoryId: categoryId || existingProduct.categoryId,
            brandId: brandId || existingProduct.brandId,
          },
        });

        // If stock is specified, update primary/first variant
        if (row.stock !== undefined && existingProduct.variants.length > 0) {
          const targetVariant = existingProduct.variants[0];
          const newStock = parseInt(row.stock, 10) || 0;
          if (newStock !== targetVariant.stock) {
            await prisma.productVariant.update({
              where: { id: targetVariant.id },
              data: { stock: newStock },
            });
            await prisma.inventoryMovement.create({
              data: {
                productId: existingProduct.id,
                variantId: targetVariant.id,
                previousStock: targetVariant.stock,
                newStock,
                quantityChange: newStock - targetVariant.stock,
                movementType: 'MANUAL_ADJUSTMENT',
                reason: 'Stock updated via bulk CSV import',
                performedBy: session.name,
              },
            });
          }
        }

        updatedCount++;
      } else {
        // Create new product
        const cleanSku = String(row.sku).trim();
        const slug =
          (row.slug || row.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') + `-${cleanSku.toLowerCase()}`;

        // Parse sizes and colors
        const sizes: string[] = row.sizes
          ? String(row.sizes).split(',').map((s) => s.trim()).filter(Boolean)
          : ['M'];
        const colors: string[] = row.colors
          ? String(row.colors).split(',').map((c) => c.trim()).filter(Boolean)
          : ['Charcoal Black'];
        const initialStock = parseInt(row.stock, 10) || 10;

        // Image URLs
        const imageUrls: string[] = row.imageUrls
          ? String(row.imageUrls).split(/[|,]/).map((u) => u.trim()).filter(Boolean)
          : row.imageUrl
          ? [String(row.imageUrl).trim()]
          : ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop'];

        const created = await prisma.product.create({
          data: {
            name: String(row.name).trim(),
            sku: cleanSku,
            slug,
            description: row.description || `Luxury ${row.name} tailored by Nexstep Gallery.`,
            shortDescription: row.shortDescription || null,
            regularPrice,
            salePrice,
            costPrice,
            gender: row.gender ? String(row.gender).toUpperCase() : 'UNISEX',
            productType: row.productType || 'Physical',
            status: row.status || 'PUBLISHED',
            fabric: row.fabric || null,
            fit: row.fit || null,
            origin: row.origin || 'Bangladesh',
            categoryId,
            brandId,
            images: {
              create: imageUrls.map((url, idx) => ({
                url,
                altText: row.name,
                isPrimary: idx === 0,
                displayOrder: idx + 1,
              })),
            },
            variants: {
              create: sizes.flatMap((sz) =>
                colors.map((col) => ({
                  sku: `${cleanSku}-${sz}-${col}`.toUpperCase().replace(/\s+/g, ''),
                  size: sz,
                  color: col,
                  colorHex: '#111111',
                  stock: Math.max(1, Math.floor(initialStock / (sizes.length * colors.length) || 5)),
                }))
              ),
            },
          },
          include: {
            variants: true,
          },
        });

        // Record initial stock logs
        for (const v of created.variants) {
          if (v.stock > 0) {
            await prisma.inventoryMovement.create({
              data: {
                productId: created.id,
                variantId: v.id,
                previousStock: 0,
                newStock: v.stock,
                quantityChange: v.stock,
                movementType: 'MANUAL_ADDITION',
                reason: 'Initial stock intake via bulk CSV import',
                performedBy: session.name,
              },
            });
          }
        }

        importedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      importedCount,
      updatedCount,
      errorsCount: errors.length,
      errors,
      message: `Successfully imported ${importedCount} new products, updated ${updatedCount} existing products, encountered ${errors.length} errors.`,
    });
  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ error: error.message || 'Bulk import failed' }, { status: 500 });
  }
}
