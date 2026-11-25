import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !isStaffOrAdmin(user.role)) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

    const uploadedUrls: Array<{ url: string; filename: string; size: number }> = [];

    for (const file of files) {
      if (typeof file === 'string') continue;

      const ext = path.extname(file.name).toLowerCase();
      if (!allowedExtensions.includes(ext) && !allowedMimeTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type || ext} is not supported. Use JPG, PNG, or WebP.` },
          { status: 400 }
        );
      }

      // Max 15MB limit
      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size exceeds maximum 15MB limit' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const sanitizedBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueFilename = `${Date.now()}-${sanitizedBase}${ext}`;
      const filePath = path.join(uploadDir, uniqueFilename);

      fs.writeFileSync(filePath, buffer);
      uploadedUrls.push({
        url: `/uploads/${uniqueFilename}`,
        filename: uniqueFilename,
        size: file.size,
      });
    }

    return NextResponse.json({
      success: true,
      data: uploadedUrls.length === 1 ? uploadedUrls[0] : uploadedUrls,
      files: uploadedUrls,
      url: uploadedUrls[0]?.url,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
