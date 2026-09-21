import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/api-response';
import { getAuthUser } from '@/lib/auth';
import { serializeOrder, toNumber } from '@/lib/serializers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return apiError('Unauthorized', 401);
    }

    const orders = await prisma.order.findMany({
      where: { user_id: BigInt(authUser.id) },
      include: {
        addresses: true,
        order_items: {
          include: {
            products: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return apiSuccess(orders.map(serializeOrder), 'User orders fetched successfully');
  } catch (error: any) {
    console.error('Fetch user orders error:', error);
    return apiError(error.message || 'Failed to fetch orders', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return apiError('Unauthorized', 401);
    }

    const body = await req.json();
    const { addressId, couponCode, paymentMethod = 'RAZORPAY' } = body;

    if (!addressId) {
      return apiError('Shipping address is required', 400);
    }

    const address = await prisma.address.findFirst({
      where: {
        id: BigInt(addressId),
        user_id: BigInt(authUser.id),
      },
    });

    if (!address) {
      return apiError('Selected shipping address not found', 404);
    }

    const cart = await prisma.cart.findUnique({
      where: { user_id: BigInt(authUser.id) },
      include: {
        cart_items: {
          include: {
            products: {
              include: {
                product_images: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.cart_items.length === 0) {
      return apiError('Your cart is empty', 400);
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItemsData = cart.cart_items.map((ci: any) => {
      const prod = ci.products;
      const price = toNumber(prod.selling_price);
      const qty = ci.quantity;
      const total = price * qty;
      subtotal += total;

      const primaryImg =
        prod.product_images?.find((img: any) => img.is_primary)?.image_url ||
        prod.product_images?.[0]?.image_url ||
        '';

      return {
        product_id: prod.id,
        product_name: prod.name,
        product_sku: prod.sku,
        image_url: primaryImg,
        price,
        quantity: qty,
        total,
      };
    });

    // Discount computation
    let discount = 0;
    let validCoupon: any = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.active) {
        const minOrder = toNumber(coupon.min_order_amount);
        if (subtotal >= minOrder) {
          const discountVal = toNumber(coupon.discount_value);
          if (coupon.discount_type === 'PERCENTAGE') {
            discount = (subtotal * discountVal) / 100;
            if (coupon.max_discount_amount) {
              discount = Math.min(discount, toNumber(coupon.max_discount_amount));
            }
          } else {
            discount = Math.min(discountVal, subtotal);
          }
          validCoupon = coupon;
        }
      }
    }

    const shippingCharge = subtotal >= 5000 ? 0 : 250;
    const totalAmount = Math.max(0, subtotal - discount + shippingCharge);

    const orderNumber = `SA-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await prisma.order.create({
      data: {
        order_number: orderNumber,
        user_id: BigInt(authUser.id),
        shipping_address_id: address.id,
        status: 'CONFIRMED',
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'COD' ? 'PENDING' : 'SUCCESS',
        subtotal,
        discount,
        shipping_charge: shippingCharge,
        total_amount: totalAmount,
        coupon_code: validCoupon ? validCoupon.code : null,
        order_items: {
          create: orderItemsData,
        },
      },
      include: {
        addresses: true,
        order_items: true,
      },
    });

    // Clear cart items
    await prisma.cartItem.deleteMany({
      where: { cart_id: cart.id },
    });

    // Update coupon usage
    if (validCoupon) {
      await prisma.coupon.update({
        where: { id: validCoupon.id },
        data: {
          usage_count: { increment: 1 },
        },
      });

      await prisma.couponUsage.create({
        data: {
          coupon_id: validCoupon.id,
          user_id: BigInt(authUser.id),
          order_id: newOrder.id,
        },
      });
    }

    return apiSuccess(serializeOrder(newOrder), 'Order placed successfully', 201);
  } catch (error: any) {
    console.error('Create order error:', error);
    return apiError(error.message || 'Failed to place order', 500);
  }
}
