import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { toNumber } from '@/lib/serializers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, orderAmount } = body;

    if (!code || orderAmount === undefined) {
      return apiError('Coupon code and order amount are required', 400);
    }

    const orderValue = parseFloat(String(orderAmount));
    if (isNaN(orderValue) || orderValue <= 0) {
      return apiError('Valid order amount is required', 400);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.active) {
      return apiSuccess(
        {
          code,
          description: '',
          discountType: 'PERCENTAGE',
          discountValue: 0,
          calculatedDiscount: 0,
          valid: false,
          message: 'Invalid or expired coupon code',
        },
        'Coupon is invalid'
      );
    }

    // Check expiry
    const now = new Date();
    if (coupon.expiry_date && coupon.expiry_date < now) {
      return apiSuccess(
        {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discount_type,
          discountValue: toNumber(coupon.discount_value),
          calculatedDiscount: 0,
          valid: false,
          message: 'Coupon has expired',
        },
        'Coupon has expired'
      );
    }

    // Check minimum order amount
    const minOrder = toNumber(coupon.min_order_amount);
    if (orderValue < minOrder) {
      return apiSuccess(
        {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discount_type,
          discountValue: toNumber(coupon.discount_value),
          calculatedDiscount: 0,
          valid: false,
          message: `Minimum order amount of ₹${minOrder.toLocaleString('en-IN')} required for this coupon`,
        },
        'Minimum order requirement not met'
      );
    }

    // Check usage limit
    if (coupon.usage_limit && (coupon.usage_count || 0) >= coupon.usage_limit) {
      return apiSuccess(
        {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discount_type,
          discountValue: toNumber(coupon.discount_value),
          calculatedDiscount: 0,
          valid: false,
          message: 'Coupon usage limit has been reached',
        },
        'Coupon limit reached'
      );
    }

    // Calculate discount
    const discountVal = toNumber(coupon.discount_value);
    let calculated = 0;
    if (coupon.discount_type === 'PERCENTAGE') {
      calculated = (orderValue * discountVal) / 100;
      if (coupon.max_discount_amount) {
        const maxDisc = toNumber(coupon.max_discount_amount);
        calculated = Math.min(calculated, maxDisc);
      }
    } else {
      // FIXED
      calculated = Math.min(discountVal, orderValue);
    }

    return apiSuccess(
      {
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discount_type,
        discountValue: discountVal,
        calculatedDiscount: Math.round(calculated * 100) / 100,
        valid: true,
        message: 'Coupon applied successfully!',
      },
      'Coupon is valid'
    );
  } catch (error: any) {
    console.error('Validate coupon error:', error);
    return apiError(error.message || 'Failed to validate coupon', 500);
  }
}
