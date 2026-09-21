import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { apiError, apiSuccess } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = (formData.get('file') || formData.get('image')) as File | null;

    if (!file) {
      return apiError('No file provided in form data', 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || '.jpg';
    const cleanFileName = `saree_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, cleanFileName);

    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${cleanFileName}`;

    return apiSuccess(
      {
        fileUrl,
        url: fileUrl,
        fileName: cleanFileName,
        size: file.size,
      },
      'File uploaded successfully'
    );
  } catch (error: any) {
    console.error('Upload file error:', error);
    return apiError(error.message || 'File upload failed', 500);
  }
}
