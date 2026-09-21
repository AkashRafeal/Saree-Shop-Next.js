import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getAuthUser } from '@/lib/auth';
import { serializeAddress } from '@/lib/serializers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return apiError('Unauthorized', 401);
    }

    const addresses = await prisma.address.findMany({
      where: { user_id: BigInt(authUser.id) },
      orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
    });

    return apiSuccess(addresses.map(serializeAddress), 'Addresses retrieved successfully');
  } catch (error: any) {
    console.error('Fetch addresses error:', error);
    return apiError(error.message || 'Failed to fetch addresses', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return apiError('Unauthorized', 401);
    }

    const body = await req.json();
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country = 'India',
      addressType = 'HOME',
      isDefault = false,
    } = body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      return apiError('All required address fields must be filled', 400);
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { user_id: BigInt(authUser.id) },
        data: { is_default: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        user_id: BigInt(authUser.id),
        full_name: fullName.trim(),
        phone: phone.trim(),
        address_line1: addressLine1.trim(),
        address_line2: addressLine2 ? addressLine2.trim() : null,
        city: city.trim(),
        state: state.trim(),
        postal_code: postalCode.trim(),
        country: country.trim(),
        address_type: addressType === 'OFFICE' ? 'OFFICE' : addressType === 'OTHER' ? 'OTHER' : 'HOME',
        is_default: Boolean(isDefault),
      },
    });

    return apiSuccess(serializeAddress(newAddress), 'Address added successfully', 201);
  } catch (error: any) {
    console.error('Create address error:', error);
    return apiError(error.message || 'Failed to create address', 500);
  }
}
