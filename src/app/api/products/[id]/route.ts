import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeProduct } from '@/lib/serializers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return apiError('Invalid product ID', 400);
    }

    const rawProduct = await prisma.product.findUnique({
      where: { id: BigInt(id) },
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
    console.error('Fetch product details error:', error);
    return apiError(error.message || 'Failed to fetch product details', 500);
  }
}
