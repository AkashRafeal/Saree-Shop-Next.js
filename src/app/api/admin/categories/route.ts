import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeCategory } from '@/lib/serializers';

export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return apiSuccess(categories.map(serializeCategory), 'Categories retrieved successfully');
  } catch (error: any) {
    console.error('Admin categories error:', error);
    return apiError(error.message || 'Failed to fetch categories', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, imageUrl, active = true } = body;

    if (!name) {
      return apiError('Category name is required', 400);
    }

    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: categorySlug,
        description: description ? description.trim() : null,
        image_url: imageUrl ? imageUrl.trim() : null,
        active: Boolean(active),
      },
    });

    return apiSuccess(serializeCategory(newCategory), 'Category created successfully', 201);
  } catch (error: any) {
    console.error('Create category error:', error);
    return apiError(error.message || 'Failed to create category', 500);
  }
}
