import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getAuthUser } from '@/lib/auth';
import { serializeCart } from '@/lib/serializers';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return apiError('Unauthorized', 401);
    }

    const itemId = parseInt(params.id);
    if (isNaN(itemId)) {
      return apiError('Invalid item ID', 400);
    }

    const { searchParams } = new URL(req.url);
    let quantity = parseInt(searchParams.get('quantity') || '0');

    if (quantity <= 0) {
      try {
        const body = await req.json();
        if (body.quantity) quantity = parseInt(body.quantity);
      } catch (e) {
        // Ignored if json parsing fails
      }
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: BigInt(itemId) },
      include: { carts: true },
    });

    if (!cartItem || cartItem.carts.user_id !== BigInt(authUser.id)) {
      return apiError('Cart item not found', 404);
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: BigInt(itemId) },
      });
    } else {
      await prisma.cartItem.update({
        where: { id: BigInt(itemId) },
        data: { quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartItem.cart_id },
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

    return apiSuccess(serializeCart(updatedCart), 'Cart updated');
  } catch (error: any) {
    console.error('Update cart item error:', error);
    return apiError(error.message || 'Failed to update cart item', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return apiError('Unauthorized', 401);
    }

    const itemId = parseInt(params.id);
    if (isNaN(itemId)) {
      return apiError('Invalid item ID', 400);
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: BigInt(itemId) },
      include: { carts: true },
    });

    if (!cartItem || cartItem.carts.user_id !== BigInt(authUser.id)) {
      return apiError('Cart item not found', 404);
    }

    await prisma.cartItem.delete({
      where: { id: BigInt(itemId) },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartItem.cart_id },
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

    return apiSuccess(serializeCart(updatedCart), 'Item removed from cart');
  } catch (error: any) {
    console.error('Delete cart item error:', error);
    return apiError(error.message || 'Failed to delete cart item', 500);
  }
}
