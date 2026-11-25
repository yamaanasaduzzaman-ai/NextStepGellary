import prisma from '../prisma';

export interface ProductFilterOptions {
  query?: string;
  categorySlug?: string;
  collectionSlug?: string;
  brandSlug?: string;
  brandId?: string;
  subcategoryId?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  status?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'bestseller' | 'rating';
  page?: number;
  limit?: number;
  adminView?: boolean;
}

export async function getProducts(options: ProductFilterOptions = {}) {
  const {
    query,
    categorySlug,
    collectionSlug,
    brandSlug,
    brandId,
    subcategoryId,
    gender,
    minPrice,
    maxPrice,
    size,
    color,
    status,
    isFeatured,
    isNewArrival,
    isBestSeller,
    sort = 'newest',
    page = 1,
    limit = 12,
    adminView = false,
  } = options;

  const where: any = {};

  if (!adminView) {
    where.status = 'PUBLISHED';
  } else if (status && status !== 'ALL') {
    where.status = status;
  }

  if (query) {
    where.OR = [
      { name: { contains: query } },
      { description: { contains: query } },
      { sku: { contains: query } },
      { tags: { contains: query } },
    ];
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (collectionSlug) {
    where.collection = { slug: collectionSlug };
  }

  if (brandSlug) {
    where.brand = { slug: brandSlug };
  }

  if (brandId) {
    where.brandId = brandId;
  }

  if (subcategoryId) {
    where.subcategoryId = subcategoryId;
  }

  if (gender && gender !== 'ALL') {
    where.OR = [
      { gender: gender.toUpperCase() },
      { gender: 'UNISEX' },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.regularPrice = {};
    if (minPrice !== undefined) where.regularPrice.gte = minPrice;
    if (maxPrice !== undefined) where.regularPrice.lte = maxPrice;
  }

  if (isFeatured !== undefined) where.isFeatured = isFeatured;
  if (isNewArrival !== undefined) where.isNewArrival = isNewArrival;
  if (isBestSeller !== undefined) where.isBestSeller = isBestSeller;

  if (size || color) {
    where.variants = {
      some: {
        ...(size ? { size: { contains: size } } : {}),
        ...(color ? { color: { contains: color } } : {}),
      },
    };
  }

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price-asc') orderBy = { regularPrice: 'asc' };
  if (sort === 'price-desc') orderBy = { regularPrice: 'desc' };
  if (sort === 'bestseller') orderBy = { isBestSeller: 'desc' };

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        collection: true,
        brand: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: true,
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  // Compute average rating and stock status
  const formattedProducts = products.map((prod) => {
    const totalReviews = prod.reviews.length;
    const avgRating = totalReviews > 0
      ? prod.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
      : 5.0;

    const totalStock = prod.variants.reduce((acc, v) => acc + v.stock, 0);

    return {
      ...prod,
      avgRating: Number(avgRating.toFixed(1)),
      reviewCount: totalReviews,
      totalStock,
      inStock: totalStock > 0,
      primaryImage: prod.images.find((img) => img.isPrimary) || prod.images[0] || null,
    };
  });

  return {
    products: formattedProducts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      collection: true,
      brand: true,
      images: { orderBy: { displayOrder: 'asc' } },
      variants: { orderBy: { size: 'asc' } },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) return null;

  const totalReviews = product.reviews.length;
  const avgRating = totalReviews > 0
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
    : 5.0;

  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);

  return {
    ...product,
    avgRating: Number(avgRating.toFixed(1)),
    reviewCount: totalReviews,
    totalStock,
    inStock: totalStock > 0,
    primaryImage: product.images.find((img) => img.isPrimary) || product.images[0] || null,
  };
}

export async function getRelatedProducts(productId: string, categoryId?: string | null, limit = 4) {
  return prisma.product.findMany({
    where: {
      id: { not: productId },
      status: 'PUBLISHED',
      ...(categoryId ? { categoryId } : {}),
    },
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      variants: true,
      category: true,
    },
    take: limit,
  });
}
