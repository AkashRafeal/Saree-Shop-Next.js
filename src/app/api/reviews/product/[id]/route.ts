import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getAuthUser } from '@/lib/auth';
import { serializeReview } from '@/lib/serializers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return apiError('Invalid product ID', 400);
    }

    const reviews = await prisma.review.findMany({
      where: {
        product_id: BigInt(productId),
        approved: true,
      },
      include: {
        users: true,
        products: true,
        review_images: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return apiSuccess(reviews.map(serializeReview), 'Product reviews fetched successfully');
  } catch (error: any) {
    console.error('Fetch product reviews error:', error);
    return apiError(error.message || 'Failed to fetch reviews', 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return apiError('Authentication required to submit review', 401);
    }

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return apiError('Invalid product ID', 400);
    }

    const body = await req.json();
    const { rating, title, comment, images = [] } = body;

    if (!rating || !comment) {
      return apiError('Rating and comment are required', 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: BigInt(productId) },
    });

    if (!product) {
      return apiError('Product not found', 404);
    }

    // Create review
    const newReview = await prisma.review.create({
      data: {
        product_id: BigInt(productId),
        user_id: BigInt(authUser.id),
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        title: title ? title.trim() : null,
        comment: comment.trim(),
        approved: true, // auto-approve for seamless customer experience
        verified_purchase: true,
        review_images: {
          create: images.map((img: string) => ({
            image_url: img,
          })),
        },
      },
      include: {
        users: true,
        products: true,
        review_images: true,
      },
    });

    // Update product rating and review count
    const allReviews = await prisma.review.findMany({
      where: {
        product_id: BigInt(productId),
        approved: true,
      },
      select: { rating: true },
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await prisma.product.update({
      where: { id: BigInt(productId) },
      data: {
        rating: avgRating,
        review_count: allReviews.length,
      },
    });

    return apiSuccess(serializeReview(newReview), 'Review submitted successfully', 201);
  } catch (error: any) {
    console.error('Submit review error:', error);
    return apiError(error.message || 'Failed to submit review', 500);
  }
}
