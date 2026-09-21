import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { serializeProduct } from '@/lib/serializers';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return apiError('Invalid product ID', 400);
    }

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
      stock,
      isFeatured,
      isBestSeller,
      isNewArrival,
      images,
    } = body;

    const existing = await prisma.product.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      return apiError('Product not found', 404);
    }

    const mrpNum = mrp !== undefined ? parseFloat(String(mrp)) : Number(existing.mrp);
    const sellingPriceNum = sellingPrice !== undefined ? parseFloat(String(sellingPrice)) : Number(existing.selling_price);
    const discountPercentage = mrpNum > 0 ? Math.round(((mrpNum - sellingPriceNum) / mrpNum) * 100) : 0;

    // Update product fields
    const updated = await prisma.product.update({
      where: { id: BigInt(id) },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        sku: sku !== undefined ? sku.trim().toUpperCase() : existing.sku,
        description: description !== undefined ? description.trim() : existing.description,
        category_id: categoryId !== undefined ? BigInt(categoryId) : existing.category_id,
        fabric: fabric !== undefined ? fabric.trim() : existing.fabric,
        color: color !== undefined ? color.trim() : existing.color,
        pattern: pattern !== undefined ? pattern.trim() : existing.pattern,
        occasion: occasion !== undefined ? occasion.trim() : existing.occasion,
        saree_length: sareeLength !== undefined ? sareeLength : existing.saree_length,
        blouse_details: blouseDetails !== undefined ? blouseDetails : existing.blouse_details,
        mrp: mrpNum,
        selling_price: sellingPriceNum,
        discount_percentage: discountPercentage,
        stock: stock !== undefined ? parseInt(String(stock)) : existing.stock,
        is_featured: isFeatured !== undefined ? Boolean(isFeatured) : existing.is_featured,
        is_best_seller: isBestSeller !== undefined ? Boolean(isBestSeller) : existing.is_best_seller,
        is_new_arrival: isNewArrival !== undefined ? Boolean(isNewArrival) : existing.is_new_arrival,
      },
    });

    // Update images if provided
    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({
        where: { product_id: BigInt(id) },
      });

      await prisma.productImage.createMany({
        data: images.map((img: string, idx: number) => ({
          product_id: BigInt(id),
          image_url: img,
          is_primary: idx === 0,
          display_order: idx,
        })),
      });
    }

    // Update inventory stock
    if (stock !== undefined) {
      await prisma.inventory.upsert({
        where: { product_id: BigInt(id) },
        update: {
          available_quantity: parseInt(String(stock)),
        },
        create: {
          product_id: BigInt(id),
          available_quantity: parseInt(String(stock)),
          reserved_quantity: 0,
          sold_quantity: 0,
        },
      });
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id: BigInt(id) },
      include: {
        categories: true,
        product_images: true,
      },
    });

    return apiSuccess(serializeProduct(fullProduct), 'Product updated successfully');
  } catch (error: any) {
    console.error('Update product error:', error);
    return apiError(error.message || 'Failed to update product', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return apiError('Invalid product ID', 400);
    }

    const existing = await prisma.product.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      return apiError('Product not found', 404);
    }

    // Soft delete or hard delete
    await prisma.product.update({
      where: { id: BigInt(id) },
      data: { active: false },
    });

    return apiSuccess(null, 'Product deleted successfully');
  } catch (error: any) {
    console.error('Delete product error:', error);
    return apiError(error.message || 'Failed to delete product', 500);
  }
}
