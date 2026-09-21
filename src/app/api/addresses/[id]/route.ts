import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getAuthUser } from '@/lib/auth';
import { serializeAddress } from '@/lib/serializers';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return apiError('Unauthorized', 401);
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return apiError('Invalid address ID', 400);
    }

    const body = await req.json();
    const existing = await prisma.address.findFirst({
      where: {
        id: BigInt(id),
        user_id: BigInt(authUser.id),
      },
    });

    if (!existing) {
      return apiError('Address not found', 404);
    }

    if (body.isDefault) {
      await prisma.address.updateMany({
        where: { user_id: BigInt(authUser.id) },
        data: { is_default: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id: BigInt(id) },
      data: {
        full_name: body.fullName ?? existing.full_name,
        phone: body.phone ?? existing.phone,
        address_line1: body.addressLine1 ?? existing.address_line1,
        address_line2: body.addressLine2 !== undefined ? body.addressLine2 : existing.address_line2,
        city: body.city ?? existing.city,
        state: body.state ?? existing.state,
        postal_code: body.postalCode ?? existing.postal_code,
        country: body.country ?? existing.country,
        address_type: body.addressType ?? existing.address_type,
        is_default: body.isDefault !== undefined ? Boolean(body.isDefault) : existing.is_default,
      },
    });

    return apiSuccess(serializeAddress(updated), 'Address updated successfully');
  } catch (error: any) {
    console.error('Update address error:', error);
    return apiError(error.message || 'Failed to update address', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return apiError('Unauthorized', 401);
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return apiError('Invalid address ID', 400);
    }

    const existing = await prisma.address.findFirst({
      where: {
        id: BigInt(id),
        user_id: BigInt(authUser.id),
      },
    });

    if (!existing) {
      return apiError('Address not found', 404);
    }

    await prisma.address.delete({
      where: { id: BigInt(id) },
    });

    return apiSuccess(null, 'Address deleted successfully');
  } catch (error: any) {
    console.error('Delete address error:', error);
    return apiError(error.message || 'Failed to delete address', 500);
  }
}
