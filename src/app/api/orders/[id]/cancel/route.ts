import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getAuthUser } from '@/lib/auth';
import { serializeOrder } from '@/lib/serializers';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return apiError('Unauthorized', 401);
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return apiError('Invalid order ID', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: BigInt(id) },
      include: { addresses: true, order_items: true },
    });

    if (!order) {
      return apiError('Order not found', 404);
    }

    if (!authUser.roles.includes('ROLE_ADMIN') && order.user_id !== BigInt(authUser.id)) {
      return apiError('Unauthorized', 403);
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      return apiError(`Cannot cancel order in ${order.status} state`, 400);
    }

    const updated = await prisma.order.update({
      where: { id: BigInt(id) },
      data: { status: 'CANCELLED' },
      include: { addresses: true, order_items: true },
    });

    return apiSuccess(serializeOrder(updated), 'Order cancelled successfully');
  } catch (error: any) {
    console.error('Cancel order error:', error);
    return apiError(error.message || 'Failed to cancel order', 500);
  }
}
