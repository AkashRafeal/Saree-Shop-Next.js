import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeBanner } from '@/lib/serializers';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return apiError('Invalid banner ID', 400);
    }

    const body = await req.json();
    const existing = await prisma.banner.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      return apiError('Banner not found', 404);
    }

    const updated = await prisma.banner.update({
      where: { id: BigInt(id) },
      data: {
        title: body.title !== undefined ? body.title.trim() : existing.title,
        subtitle: body.subtitle !== undefined ? body.subtitle : existing.subtitle,
        image_url: body.imageUrl !== undefined ? body.imageUrl.trim() : existing.image_url,
        target_url: body.targetUrl !== undefined ? body.targetUrl : existing.target_url,
        cta_text: body.ctaText !== undefined ? body.ctaText : existing.cta_text,
        display_order: body.displayOrder !== undefined ? parseInt(String(body.displayOrder)) : existing.display_order,
        active: body.active !== undefined ? Boolean(body.active) : existing.active,
      },
    });

    return apiSuccess(serializeBanner(updated), 'Banner updated successfully');
  } catch (error: any) {
    console.error('Update banner error:', error);
    return apiError(error.message || 'Failed to update banner', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return apiError('Invalid banner ID', 400);
    }

    const existing = await prisma.banner.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      return apiError('Banner not found', 404);
    }

    await prisma.banner.delete({
      where: { id: BigInt(id) },
    });

    return apiSuccess(null, 'Banner deleted successfully');
  } catch (error: any) {
    console.error('Delete banner error:', error);
    return apiError(error.message || 'Failed to delete banner', 500);
  }
}
