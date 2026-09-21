import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeProduct } from '@/lib/serializers';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    if (!slug) {
      return apiError('Slug is required', 400);
    }

    const rawProduct = await prisma.product.findUnique({
      where: { sku: slug },
      include: {
        categories: true,
        product_images: true,
      },
    });

    if (!rawProduct) {
      return apiError('Product not found', 404);
    }

    const product = serializeProduct(rawProduct);
    return apiSuccess(product, 'Product details fetched successfully');
  } catch (error: any) {
    console.error('Fetch product by slug error:', error);
    return apiError(error.message || 'Failed to fetch product', 500);
  }
}
