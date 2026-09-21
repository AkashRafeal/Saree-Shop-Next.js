import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return apiError('Invalid review ID', 400);
    }

    const review = await prisma.review.findUnique({
      where: { id: BigInt(id) },
    });

    if (!review) {
      return apiError('Review not found', 404);
    }

    await prisma.review.delete({
      where: { id: BigInt(id) },
    });

    return apiSuccess(null, 'Review deleted successfully');
  } catch (error: any) {
    console.error('Delete review error:', error);
    return apiError(error.message || 'Failed to delete review', 500);
  }
}
