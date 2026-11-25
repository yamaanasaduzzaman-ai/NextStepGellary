import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const where: any = {};
    if (!all) where.isPublished = true;

    const pages = await prisma.customPage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ pages });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const {
      title,
      slug,
      content,
      template = 'DEFAULT',
      isPublished = true,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogImage,
      canonicalUrl,
      noIndex = false,
    } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const page = await prisma.customPage.create({
      data: {
        title,
        slug: cleanSlug,
        content: content || '',
        template,
        isPublished: Boolean(isPublished),
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
        ogImage: ogImage || null,
        canonicalUrl: canonicalUrl || null,
        noIndex: Boolean(noIndex),
      },
    });

    return NextResponse.json({ success: true, page });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create page' }, { status: 500 });
  }
}
