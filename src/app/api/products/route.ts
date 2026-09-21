import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeProduct } from '@/lib/serializers';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(0, parseInt(searchParams.get('page') || '0'));
    const size = Math.min(100, Math.max(1, parseInt(searchParams.get('size') || '12')));
    const categoryId = searchParams.get('categoryId');
    const categorySlug = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const fabric = searchParams.get('fabric');
    const occasion = searchParams.get('occasion');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';

    const where: any = {
      active: true,
    };

    if (categoryId) {
      where.category_id = BigInt(categoryId);
    } else if (categorySlug && categorySlug !== 'all') {
      const cat = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (cat) {
        where.category_id = cat.id;
      }
    }

    if (minPrice || maxPrice) {
      where.selling_price = {};
      if (minPrice) where.selling_price.gte = parseFloat(minPrice);
      if (maxPrice) where.selling_price.lte = parseFloat(maxPrice);
    }

    if (fabric && fabric !== 'all') {
      where.fabric = { contains: fabric };
    }

    if (occasion && occasion !== 'all') {
      where.occasion = { contains: occasion };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { fabric: { contains: search } },
      ];
    }

    // Sort mapping
    let orderBy: any = { created_at: 'desc' };
    if (sort === 'price_asc' || sort === 'price-low') {
      orderBy = { selling_price: 'asc' };
    } else if (sort === 'price_desc' || sort === 'price-high') {
      orderBy = { selling_price: 'desc' };
    } else if (sort === 'popular' || sort === 'best_seller') {
      orderBy = { is_best_seller: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    }

    const [totalElements, rawProducts] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          categories: true,
          product_images: true,
        },
        orderBy,
        skip: page * size,
        take: size,
      }),
    ]);

    const content = rawProducts.map(serializeProduct);
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
      'Products fetched successfully'
    );
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return apiError(error.message || 'Failed to fetch products', 500);
  }
}
