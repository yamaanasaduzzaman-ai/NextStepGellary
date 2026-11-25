import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const page = await prisma.customPage.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const {
      title,
      slug,
      content,
      template,
      isPublished,
      seoTitle,
      seoDescription,
      seoKeywords,
      ogImage,
      canonicalUrl,
      noIndex,
    } = await request.json();

    const page = await prisma.customPage.update({
      where: { id: params.id },
      data: {
        ...(title ? { title } : {}),
        ...(slug ? { slug } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(template ? { template } : {}),
        ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
        ...(seoTitle !== undefined ? { seoTitle } : {}),
        ...(seoDescription !== undefined ? { seoDescription } : {}),
        ...(seoKeywords !== undefined ? { seoKeywords } : {}),
        ...(ogImage !== undefined ? { ogImage } : {}),
        ...(canonicalUrl !== undefined ? { canonicalUrl } : {}),
        ...(noIndex !== undefined ? { noIndex: Boolean(noIndex) } : {}),
      },
    });

    return NextResponse.json({ success: true, page });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update page' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.customPage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Page deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete page' }, { status: 500 });
  }
}
