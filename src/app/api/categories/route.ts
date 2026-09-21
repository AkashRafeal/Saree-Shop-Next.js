import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeCategory } from '@/lib/serializers';

export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    return apiSuccess(categories.map(serializeCategory), 'Categories retrieved successfully');
  } catch (error: any) {
    console.error('Fetch categories error:', error);
    return apiError(error.message || 'Failed to fetch categories', 500);
  }
}
