import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeBanner } from '@/lib/serializers';

export async function GET(req: NextRequest) {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { display_order: 'asc' },
    });

    return apiSuccess(banners.map(serializeBanner), 'Banners retrieved successfully');
  } catch (error: any) {
    console.error('Admin banners error:', error);
    return apiError(error.message || 'Failed to fetch banners', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      subtitle,
      imageUrl,
      targetUrl = '/shop',
      ctaText = 'Shop Collection',
      displayOrder = 0,
      active = true,
    } = body;

    if (!title || !imageUrl) {
      return apiError('Banner title and image URL are required', 400);
    }

    const newBanner = await prisma.banner.create({
      data: {
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : null,
        image_url: imageUrl.trim(),
        target_url: targetUrl ? targetUrl.trim() : '/shop',
        cta_text: ctaText ? ctaText.trim() : 'Shop Collection',
        display_order: parseInt(String(displayOrder || 0)),
        active: Boolean(active),
      },
    });

    return apiSuccess(serializeBanner(newBanner), 'Banner created successfully', 201);
  } catch (error: any) {
    console.error('Create banner error:', error);
    return apiError(error.message || 'Failed to create banner', 500);
  }
}
