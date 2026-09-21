import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeOrder } from '@/lib/serializers';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return apiError('Invalid order ID', 400);
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return apiError('Status is required', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: BigInt(id) },
    });

    if (!order) {
      return apiError('Order not found', 404);
    }

    const updated = await prisma.order.update({
      where: { id: BigInt(id) },
      data: { status },
      include: {
        addresses: true,
        order_items: {
          include: {
            products: true,
          },
        },
      },
    });

    return apiSuccess(serializeOrder(updated), 'Order status updated successfully');
  } catch (error: any) {
    console.error('Update order status error:', error);
    return apiError(error.message || 'Failed to update order status', 500);
  }
}
