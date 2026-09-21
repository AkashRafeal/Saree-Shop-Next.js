import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeReview } from '@/lib/serializers';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return apiError('Invalid review ID', 400);
    }

    const body = await req.json();
    const { approved, status } = body;

    const isApproved = approved !== undefined ? Boolean(approved) : status === 'APPROVED';

    const review = await prisma.review.findUnique({
      where: { id: BigInt(id) },
    });

    if (!review) {
      return apiError('Review not found', 404);
    }

    const updated = await prisma.review.update({
      where: { id: BigInt(id) },
      data: { approved: isApproved },
      include: {
        users: true,
        products: true,
        review_images: true,
      },
    });

    return apiSuccess(serializeReview(updated), 'Review status updated');
  } catch (error: any) {
    console.error('Update review status error:', error);
    return apiError(error.message || 'Failed to update review status', 500);
  }
}
