import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getAuthUser } from '@/lib/auth';
import { serializeProduct, toNumber } from '@/lib/serializers';

async function getWishlistResponse(userId: number) {
  const wishlist = await prisma.wishlist.findUnique({
    where: { user_id: BigInt(userId) },
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

  const products = (wishlist?.wishlist_items || [])
    .map((wi) => wi.products)
    .filter(Boolean)
    .map(serializeProduct);

  return {
    id: wishlist ? toNumber(wishlist.id) : 0,
    products,
    totalItems: products.length,
  };
}

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

    let wishlist = await prisma.wishlist.findUnique({
      where: { user_id: BigInt(authUser.id) },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { user_id: BigInt(authUser.id) },
      });
    }

    const existing = await prisma.wishlistItem.findFirst({
      where: {
        wishlist_id: wishlist.id,
        product_id: BigInt(productId),
      },
    });

    if (!existing) {
      await prisma.wishlistItem.create({
        data: {
          wishlist_id: wishlist.id,
          product_id: BigInt(productId),
        },
      });
    }

    const res = await getWishlistResponse(authUser.id);
    return apiSuccess(res, 'Product added to wishlist');
  } catch (error: any) {
    console.error('Add to wishlist error:', error);
    return apiError(error.message || 'Failed to add to wishlist', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return apiError('Authentication required', 401);
    }

    const productId = parseInt(params.productId);
    if (isNaN(productId)) {
      return apiError('Invalid product ID', 400);
    }

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

    const res = await getWishlistResponse(authUser.id);
    return apiSuccess(res, 'Product removed from wishlist');
  } catch (error: any) {
    console.error('Remove from wishlist error:', error);
    return apiError(error.message || 'Failed to remove from wishlist', 500);
  }
}
