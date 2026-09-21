import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getAuthUser } from '@/lib/auth';
import { serializeCart } from '@/lib/serializers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      // Guest empty cart
      return apiSuccess(serializeCart(null), 'Cart retrieved');
    }

    let cart = await prisma.cart.findUnique({
      where: { user_id: BigInt(authUser.id) },
      include: {
        cart_items: {
          include: {
            products: {
              include: {
                product_images: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          user_id: BigInt(authUser.id),
        },
        include: {
          cart_items: {
            include: {
              products: {
                include: {
                  product_images: true,
                },
              },
            },
          },
        },
      });
    }

    return apiSuccess(serializeCart(cart), 'Cart retrieved successfully');
  } catch (error: any) {
    console.error('Fetch cart error:', error);
    return apiError(error.message || 'Failed to fetch cart', 500);
  }
}
