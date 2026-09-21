import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getAuthUser } from '@/lib/auth';
import { serializeProduct, toNumber } from '@/lib/serializers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return apiSuccess({ id: 0, products: [], totalItems: 0 }, 'Wishlist retrieved');
    }

    let wishlist = await prisma.wishlist.findUnique({
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

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { user_id: BigInt(authUser.id) },
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
    }

    const products = wishlist.wishlist_items
      .map((wi: any) => wi.products)
      .filter(Boolean)
      .map(serializeProduct);

    return apiSuccess(
      {
        id: toNumber(wishlist.id),
        products,
        totalItems: products.length,
      },
      'Wishlist retrieved'
    );
  } catch (error: any) {
    console.error('Fetch wishlist error:', error);
    return apiError(error.message || 'Failed to fetch wishlist', 500);
  }
}
