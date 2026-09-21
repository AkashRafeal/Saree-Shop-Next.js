import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeCategory } from '@/lib/serializers';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return apiError('Invalid category ID', 400);
    }

    const body = await req.json();
    const { name, slug, description, imageUrl, active } = body;

    const existing = await prisma.category.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      return apiError('Category not found', 404);
    }

    const updated = await prisma.category.update({
      where: { id: BigInt(id) },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        slug: slug !== undefined ? slug.trim() : existing.slug,
        description: description !== undefined ? description : existing.description,
        image_url: imageUrl !== undefined ? imageUrl : existing.image_url,
        active: active !== undefined ? Boolean(active) : existing.active,
      },
    });

    return apiSuccess(serializeCategory(updated), 'Category updated successfully');
  } catch (error: any) {
    console.error('Update category error:', error);
    return apiError(error.message || 'Failed to update category', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return apiError('Invalid category ID', 400);
    }

    const existing = await prisma.category.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      return apiError('Category not found', 404);
    }

    await prisma.category.delete({
      where: { id: BigInt(id) },
    });

    return apiSuccess(null, 'Category deleted successfully');
  } catch (error: any) {
    console.error('Delete category error:', error);
    return apiError(error.message || 'Failed to delete category', 500);
  }
}
