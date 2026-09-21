import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeCoupon } from '@/lib/serializers';

export async function GET(req: NextRequest) {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { created_at: 'desc' },
    });

    return apiSuccess(coupons.map(serializeCoupon), 'Coupons retrieved successfully');
  } catch (error: any) {
    console.error('Admin coupons error:', error);
    return apiError(error.message || 'Failed to fetch coupons', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      code,
      description,
      discountType = 'PERCENTAGE',
      discountValue,
      minOrderAmount = 0,
      maxDiscountAmount,
      usageLimit = 100,
      startDate,
      expiryDate,
      active = true,
    } = body;

    if (!code || discountValue === undefined) {
      return apiError('Code and discount value are required', 400);
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        description: description ? description.trim() : null,
        discount_type: discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
        discount_value: parseFloat(String(discountValue)),
        min_order_amount: parseFloat(String(minOrderAmount || 0)),
        max_discount_amount: maxDiscountAmount ? parseFloat(String(maxDiscountAmount)) : null,
        usage_limit: parseInt(String(usageLimit || 100)),
        start_date: startDate ? new Date(startDate) : new Date(),
        expiry_date: expiryDate ? new Date(expiryDate) : null,
        active: Boolean(active),
      },
    });

    return apiSuccess(serializeCoupon(newCoupon), 'Coupon created successfully', 201);
  } catch (error: any) {
    console.error('Create coupon error:', error);
    return apiError(error.message || 'Failed to create coupon', 500);
  }
}
