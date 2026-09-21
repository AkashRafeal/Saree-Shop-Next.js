import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeProduct } from '@/lib/serializers';

export async function GET(req: NextRequest) {
  try {
    const rawProducts = await prisma.product.findMany({
      where: {
        active: true,
        is_new_arrival: true,
      },
      include: {
        categories: true,
        product_images: true,
      },
      orderBy: { created_at: 'desc' },
      take: 8,
    });

    const products = rawProducts.map(serializeProduct);
    return apiSuccess(products, 'New arrivals fetched successfully');
  } catch (error: any) {
    console.error('Fetch new arrivals error:', error);
    return apiError(error.message || 'Failed to fetch new arrivals', 500);
  }
}
