import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getAuthUser } from '@/lib/auth';
import { serializeProduct, toNumber } from '@/lib/serializers';

export async function POST(req: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return apiError('Authentication required', 401);
    }

    const productId = parseInt(params.productId);
    if (isNaN(productId)) {
      return apiError('Invalid product ID', 400);
    }

    // 1. Remove from wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: { user_id: BigInt(authUser.id) },
    });

    if (wishlist) {
      await prisma.wishlistItem.deleteMany({
        where: {
          wishlist_id: wishlist.id,
          product_id: BigInt(productId),
        },
      });
    }

    // 2. Add to cart
    let cart = await prisma.cart.findUnique({
      where: { user_id: BigInt(authUser.id) },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { user_id: BigInt(authUser.id) },
      });
    }

    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cart_id: cart.id,
        product_id: BigInt(productId),
      },
    });

    if (existingCartItem) {
      await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cart_id: cart.id,
          product_id: BigInt(productId),
          quantity: 1,
        },
      });
    }

    // Return updated wishlist
    const updatedWishlist = await prisma.wishlist.findUnique({
      where: { user_id: BigInt(authUser.id) },
      include: {
        wishlist_items: {
          include: {
            products: {
              include: {
                categories: true,
                product_images: true,
              },
            },
          },
        },
      },
    });

    const products = (updatedWishlist?.wishlist_items || [])
      .map((wi) => wi.products)
      .filter(Boolean)
      .map(serializeProduct);

    return apiSuccess(
      {
        id: updatedWishlist ? toNumber(updatedWishlist.id) : 0,
        products,
        totalItems: products.length,
      },
      'Item moved to cart'
    );
  } catch (error: any) {
    console.error('Move to cart error:', error);
    return apiError(error.message || 'Failed to move item to cart', 500);
  }
}
