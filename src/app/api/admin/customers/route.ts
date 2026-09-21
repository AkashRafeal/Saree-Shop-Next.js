import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeUser } from '@/lib/serializers';

export async function GET(req: NextRequest) {
  try {
    const customers = await prisma.user.findMany({
      include: {
        user_roles: {
          include: {
            roles: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return apiSuccess(customers.map(serializeUser), 'Customers retrieved successfully');
  } catch (error: any) {
    console.error('Fetch customers error:', error);
    return apiError(error.message || 'Failed to fetch customers', 500);
  }
}
