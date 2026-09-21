import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeCoupon } from '@/lib/serializers';

export async function GET(req: NextRequest) {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { active: true },
      orderBy: { created_at: 'desc' },
    });

    return apiSuccess(coupons.map(serializeCoupon), 'Coupons retrieved successfully');
  } catch (error: any) {
    console.error('Fetch coupons error:', error);
    return apiError(error.message || 'Failed to fetch coupons', 500);
  }
}
