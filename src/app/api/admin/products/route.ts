import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeProduct } from '@/lib/serializers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      sku,
      description,
      categoryId,
      fabric,
      color,
      pattern,
      occasion,
      sareeLength,
      blouseDetails,
      mrp,
      sellingPrice,
      stock = 0,
      isFeatured = false,
      isBestSeller = false,
      isNewArrival = false,
      images = [],
    } = body;

    if (!name || !sku || !sellingPrice || !categoryId) {
      return apiError('Name, SKU, selling price, and category are required', 400);
    }

    const mrpNum = parseFloat(String(mrp || sellingPrice));
    const sellingPriceNum = parseFloat(String(sellingPrice));
    const discountPercentage = mrpNum > 0 ? Math.round(((mrpNum - sellingPriceNum) / mrpNum) * 100) : 0;

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        description: description ? description.trim() : '',
        category_id: BigInt(categoryId),
        fabric: fabric ? fabric.trim() : null,
        color: color ? color.trim() : null,
        pattern: pattern ? pattern.trim() : null,
        occasion: occasion ? occasion.trim() : null,
        saree_length: sareeLength || '5.5 meters',
        blouse_details: blouseDetails || '0.8 meters',
        mrp: mrpNum,
        selling_price: sellingPriceNum,
        discount_percentage: discountPercentage,
        stock: parseInt(String(stock)) || 0,
        active: true,
        is_featured: Boolean(isFeatured),
        is_best_seller: Boolean(isBestSeller),
        is_new_arrival: Boolean(isNewArrival),
        rating: 5.0,
        review_count: 0,
        product_images: {
          create: images.map((img: string, idx: number) => ({
            image_url: img,
            is_primary: idx === 0,
            display_order: idx,
          })),
        },
        inventory: {
          create: {
            available_quantity: parseInt(String(stock)) || 0,
            reserved_quantity: 0,
            sold_quantity: 0,
          },
        },
      },
      include: {
        categories: true,
        product_images: true,
      },
    });

    return apiSuccess(serializeProduct(product), 'Product created successfully', 201);
  } catch (error: any) {
    console.error('Create product error:', error);
    return apiError(error.message || 'Failed to create product', 500);
  }
}
