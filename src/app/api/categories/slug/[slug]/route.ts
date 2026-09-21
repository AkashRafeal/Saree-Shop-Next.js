import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeCategory } from '@/lib/serializers';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    if (!slug) {
      return apiError('Slug is required', 400);
    }

    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return apiError('Category not found', 404);
    }

    return apiSuccess(serializeCategory(category), 'Category retrieved successfully');
  } catch (error: any) {
    console.error('Fetch category by slug error:', error);
    return apiError(error.message || 'Failed to fetch category', 500);
  }
}
