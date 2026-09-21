import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getAuthUser } from '@/lib/auth';
import { serializeCart } from '@/lib/serializers';

export async function POST(req: NextRequest) {
  return clearCart(req);
}

export async function DELETE(req: NextRequest) {
  return clearCart(req);
}

async function clearCart(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return apiError('Unauthorized', 401);
    }

    const cart = await prisma.cart.findUnique({
      where: { user_id: BigInt(authUser.id) },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cart_id: cart.id },
      });
    }

    return apiSuccess(serializeCart(null), 'Cart cleared');
  } catch (error: any) {
    console.error('Clear cart error:', error);
    return apiError(error.message || 'Failed to clear cart', 500);
  }
}
