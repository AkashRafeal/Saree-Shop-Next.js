import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeBanner } from '@/lib/serializers';

export async function GET(req: NextRequest) {
  try {
    const banners = await prisma.banner.findMany({
      where: { active: true },
      orderBy: { display_order: 'asc' },
    });

    return apiSuccess(banners.map(serializeBanner), 'Banners fetched successfully');
  } catch (error: any) {
    console.error('Fetch banners error:', error);
    return apiError(error.message || 'Failed to fetch banners', 500);
  }
}
