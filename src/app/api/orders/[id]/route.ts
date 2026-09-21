import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getAuthUser } from '@/lib/auth';
import { serializeOrder } from '@/lib/serializers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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
      include: {
        addresses: true,
        order_items: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!order) {
      return apiError('Order not found', 404);
    }

    // Check ownership if not admin
    if (!authUser.roles.includes('ROLE_ADMIN') && order.user_id !== BigInt(authUser.id)) {
      return apiError('Unauthorized', 403);
    }

    return apiSuccess(serializeOrder(order), 'Order details fetched successfully');
  } catch (error: any) {
    console.error('Fetch order detail error:', error);
    return apiError(error.message || 'Failed to fetch order details', 500);
  }
}
