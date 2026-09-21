import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeReview } from '@/lib/serializers';

export async function GET(req: NextRequest) {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        users: true,
        products: true,
        review_images: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return apiSuccess(reviews.map(serializeReview), 'Admin reviews retrieved successfully');
  } catch (error: any) {
    console.error('Fetch admin reviews error:', error);
    return apiError(error.message || 'Failed to fetch reviews', 500);
  }
}
