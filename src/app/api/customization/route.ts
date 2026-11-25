import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const draft = searchParams.get('draft') === 'true';

    let customization = await prisma.siteCustomization.findUnique({
      where: { id: 'default' },
    });

    if (!customization) {
      // Return safe defaults if not yet created
      return NextResponse.json({
        themeSettings: {},
        headerSettings: {},
        footerSettings: {},
        homepageSections: [],
        seoSettings: {},
      });
    }

    // Parse JSON
    const parse = (str: string | null) => {
      if (!str) return null;
      try {
        return JSON.parse(str);
      } catch {
        return null;
      }
    };

    const published = {
      themeSettings: parse(customization.themeSettings),
      headerSettings: parse(customization.headerSettings),
      footerSettings: parse(customization.footerSettings),
      homepageSections: parse(customization.homepageSections),
      seoSettings: parse(customization.seoSettings),
    };

    const drafts = {
      themeSettings: parse(customization.draftThemeSettings) || published.themeSettings,
      headerSettings: parse(customization.draftHeaderSettings) || published.headerSettings,
      footerSettings: parse(customization.draftFooterSettings) || published.footerSettings,
      homepageSections: parse(customization.draftHomepageSections) || published.homepageSections,
      seoSettings: parse(customization.draftSeoSettings) || published.seoSettings,
    };

    return NextResponse.json({
      success: true,
      version: customization.version,
      updatedAt: customization.updatedAt,
      data: draft ? drafts : published,
      published,
      drafts,
    });
  } catch (error: any) {
    console.error('Customization GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch customization' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      draftThemeSettings,
      draftHeaderSettings,
      draftFooterSettings,
      draftHomepageSections,
      draftSeoSettings,
      publishImmediately = false,
    } = body;

    const stringify = (val: any) => (val !== undefined ? (typeof val === 'string' ? val : JSON.stringify(val)) : undefined);

    const baseFields: any = {};
    if (draftThemeSettings !== undefined) baseFields.draftThemeSettings = stringify(draftThemeSettings);
    if (draftHeaderSettings !== undefined) baseFields.draftHeaderSettings = stringify(draftHeaderSettings);
    if (draftFooterSettings !== undefined) baseFields.draftFooterSettings = stringify(draftFooterSettings);
    if (draftHomepageSections !== undefined) baseFields.draftHomepageSections = stringify(draftHomepageSections);
    if (draftSeoSettings !== undefined) baseFields.draftSeoSettings = stringify(draftSeoSettings);

    const updateData: any = { ...baseFields };
    if (publishImmediately) {
      if (baseFields.draftThemeSettings) updateData.themeSettings = baseFields.draftThemeSettings;
      if (baseFields.draftHeaderSettings) updateData.headerSettings = baseFields.draftHeaderSettings;
      if (baseFields.draftFooterSettings) updateData.footerSettings = baseFields.draftFooterSettings;
      if (baseFields.draftHomepageSections) updateData.homepageSections = baseFields.draftHomepageSections;
      if (baseFields.draftSeoSettings) updateData.seoSettings = baseFields.draftSeoSettings;
      updateData.version = { increment: 1 };
    }

    const createData: any = {
      id: 'default',
      themeSettings: (publishImmediately && baseFields.draftThemeSettings) ? baseFields.draftThemeSettings : '{}',
      headerSettings: (publishImmediately && baseFields.draftHeaderSettings) ? baseFields.draftHeaderSettings : '{}',
      footerSettings: (publishImmediately && baseFields.draftFooterSettings) ? baseFields.draftFooterSettings : '{}',
      homepageSections: (publishImmediately && baseFields.draftHomepageSections) ? baseFields.draftHomepageSections : '[]',
      seoSettings: (publishImmediately && baseFields.draftSeoSettings) ? baseFields.draftSeoSettings : '{}',
      draftThemeSettings: baseFields.draftThemeSettings || null,
      draftHeaderSettings: baseFields.draftHeaderSettings || null,
      draftFooterSettings: baseFields.draftFooterSettings || null,
      draftHomepageSections: baseFields.draftHomepageSections || null,
      draftSeoSettings: baseFields.draftSeoSettings || null,
      version: 1,
    };

    const updated = await prisma.siteCustomization.upsert({
      where: { id: 'default' },
      update: updateData,
      create: createData,
    });

    return NextResponse.json({
      success: true,
      message: publishImmediately ? 'Customizations published live!' : 'Draft customization saved.',
      customization: updated,
    });
  } catch (error: any) {
    console.error('Customization PUT error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update customization' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !isStaffOrAdmin(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { action } = await request.json();

    const current = await prisma.siteCustomization.findUnique({ where: { id: 'default' } });
    if (!current) {
      return NextResponse.json({ error: 'Customization record not found' }, { status: 404 });
    }

    if (action === 'PUBLISH') {
      const updated = await prisma.siteCustomization.update({
        where: { id: 'default' },
        data: {
          themeSettings: current.draftThemeSettings || current.themeSettings,
          headerSettings: current.draftHeaderSettings || current.headerSettings,
          footerSettings: current.draftFooterSettings || current.footerSettings,
          homepageSections: current.draftHomepageSections || current.homepageSections,
          seoSettings: current.draftSeoSettings || current.seoSettings,
          version: { increment: 1 },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'All draft changes have been successfully published to the live storefront!',
        customization: updated,
      });
    }

    if (action === 'DISCARD_DRAFT') {
      const updated = await prisma.siteCustomization.update({
        where: { id: 'default' },
        data: {
          draftThemeSettings: current.themeSettings,
          draftHeaderSettings: current.headerSettings,
          draftFooterSettings: current.footerSettings,
          draftHomepageSections: current.homepageSections,
          draftSeoSettings: current.seoSettings,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Draft changes discarded. Reverted to currently published settings.',
        customization: updated,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Customization POST error:', error);
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}
