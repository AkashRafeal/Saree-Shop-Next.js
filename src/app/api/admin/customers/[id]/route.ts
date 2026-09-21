import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return apiError('Invalid customer ID', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: BigInt(id) },
    });

    if (!user) {
      return apiError('Customer not found', 404);
    }

    await prisma.user.delete({
      where: { id: BigInt(id) },
    });

    return apiSuccess(null, 'Customer deleted successfully');
  } catch (error: any) {
    console.error('Delete customer error:', error);
    return apiError(error.message || 'Failed to delete customer', 500);
  }
}
