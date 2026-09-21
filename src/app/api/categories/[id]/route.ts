import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeCategory } from '@/lib/serializers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return apiError('Invalid category ID', 400);
    }

    const category = await prisma.category.findUnique({
      where: { id: BigInt(id) },
    });

    if (!category) {
      return apiError('Category not found', 404);
    }

    return apiSuccess(serializeCategory(category), 'Category retrieved successfully');
  } catch (error: any) {
    console.error('Fetch category error:', error);
    return apiError(error.message || 'Failed to fetch category', 500);
  }
}
