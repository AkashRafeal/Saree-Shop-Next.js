import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeOrder } from '@/lib/serializers';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(0, parseInt(searchParams.get('page') || '0'));
    const size = Math.min(100, Math.max(1, parseInt(searchParams.get('size') || '50')));
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [totalElements, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          addresses: true,
          order_items: {
            include: {
              products: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: page * size,
        take: size,
      }),
    ]);

    const content = orders.map(serializeOrder);
    const totalPages = Math.ceil(totalElements / size);

    return apiSuccess(
      {
        content,
        page,
        size,
        totalElements,
        totalPages,
        last: page >= totalPages - 1,
      },
      'Orders retrieved successfully'
    );
  } catch (error: any) {
    console.error('Admin orders error:', error);
    return apiError(error.message || 'Failed to fetch admin orders', 500);
  }
}
