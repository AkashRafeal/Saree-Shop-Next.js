import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getAuthUser } from '@/lib/auth';
import { serializeCart } from '@/lib/serializers';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return apiError('Authentication required to add items to cart', 401);
    }

    const body = await req.json();
    const productId = parseInt(body.productId);
    const quantity = Math.max(1, parseInt(body.quantity || '1'));

    if (isNaN(productId)) {
      return apiError('Valid productId is required', 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: BigInt(productId) },
    });

    if (!product || !product.active) {
      return apiError('Product not found or unavailable', 404);
    }

    // Get or create user's cart
    let cart = await prisma.cart.findUnique({
      where: { user_id: BigInt(authUser.id) },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { user_id: BigInt(authUser.id) },
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cart_id: cart.id,
        product_id: BigInt(productId),
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cart_id: cart.id,
          product_id: BigInt(productId),
          quantity,
        },
      });
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
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

    return apiSuccess(serializeCart(updatedCart), 'Item added to cart');
  } catch (error: any) {
    console.error('Add to cart error:', error);
    return apiError(error.message || 'Failed to add item to cart', 500);
  }
}
