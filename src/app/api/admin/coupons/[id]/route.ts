import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeCoupon } from '@/lib/serializers';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return apiError('Invalid coupon ID', 400);
    }

    const body = await req.json();
    const existing = await prisma.coupon.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      return apiError('Coupon not found', 404);
    }

    const updated = await prisma.coupon.update({
      where: { id: BigInt(id) },
      data: {
        code: body.code !== undefined ? body.code.trim().toUpperCase() : existing.code,
        description: body.description !== undefined ? body.description : existing.description,
        discount_type: body.discountType !== undefined ? (body.discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE') : existing.discount_type,
        discount_value: body.discountValue !== undefined ? parseFloat(String(body.discountValue)) : existing.discount_value,
        min_order_amount: body.minOrderAmount !== undefined ? parseFloat(String(body.minOrderAmount)) : existing.min_order_amount,
        max_discount_amount: body.maxDiscountAmount !== undefined ? (body.maxDiscountAmount ? parseFloat(String(body.maxDiscountAmount)) : null) : existing.max_discount_amount,
        usage_limit: body.usageLimit !== undefined ? parseInt(String(body.usageLimit)) : existing.usage_limit,
        start_date: body.startDate ? new Date(body.startDate) : existing.start_date,
        expiry_date: body.expiryDate ? new Date(body.expiryDate) : existing.expiry_date,
        active: body.active !== undefined ? Boolean(body.active) : existing.active,
      },
    });

    return apiSuccess(serializeCoupon(updated), 'Coupon updated successfully');
  } catch (error: any) {
    console.error('Update coupon error:', error);
    return apiError(error.message || 'Failed to update coupon', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return apiError('Invalid coupon ID', 400);
    }

    const existing = await prisma.coupon.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      return apiError('Coupon not found', 404);
    }

    await prisma.coupon.delete({
      where: { id: BigInt(id) },
    });

    return apiSuccess(null, 'Coupon deleted successfully');
  } catch (error: any) {
    console.error('Delete coupon error:', error);
    return apiError(error.message || 'Failed to delete coupon', 500);
  }
}
