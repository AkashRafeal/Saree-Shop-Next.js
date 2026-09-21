import { Decimal } from '@prisma/client/runtime/library';

export function toNumber(val: any, fallback = 0): number {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'bigint') return Number(val);
  if (typeof val === 'number') return val;
  if (val instanceof Decimal || typeof val?.toNumber === 'function') return val.toNumber();
  const parsed = parseFloat(String(val));
  return isNaN(parsed) ? fallback : parsed;
}

export function serializeUser(user: any) {
  if (!user) return null;
  const roles = user.user_roles ? user.user_roles.map((ur: any) => ur.roles.name) : [];
  return {
    id: toNumber(user.id),
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone || '',
    roles,
  };
}

export function serializeAddress(addr: any) {
  if (!addr) return null;
  return {
    id: toNumber(addr.id),
    fullName: addr.full_name,
    phone: addr.phone,
    addressLine1: addr.address_line1,
    addressLine2: addr.address_line2 || '',
    city: addr.city,
    state: addr.state,
    postalCode: addr.postal_code,
    country: addr.country,
    addressType: addr.address_type || 'HOME',
    isDefault: Boolean(addr.is_default),
  };
}

export function serializeCategory(cat: any) {
  if (!cat) return null;
  return {
    id: toNumber(cat.id),
    name: cat.name,
    slug: cat.slug,
    description: cat.description || '',
    imageUrl: cat.image_url || '',
    parentId: cat.parent_id ? toNumber(cat.parent_id) : null,
    active: Boolean(cat.active),
  };
}

export function serializeProduct(prod: any) {
  if (!prod) return null;
  const images = (prod.product_images || [])
    .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
    .map((img: any) => img.image_url);

  const primaryImg = prod.product_images?.find((img: any) => img.is_primary)?.image_url || images[0] || '';

  const mrp = toNumber(prod.mrp);
  const sellingPrice = toNumber(prod.selling_price);
  const discountPercentage = prod.discount_percentage ?? (mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0);
  const stock = typeof prod.stock === 'number' ? prod.stock : toNumber(prod.stock);

  return {
    id: toNumber(prod.id),
    name: prod.name,
    sku: prod.sku,
    description: prod.description || '',
    categoryId: toNumber(prod.category_id),
    categoryName: prod.categories?.name || '',
    categorySlug: prod.categories?.slug || '',
    fabric: prod.fabric || '',
    color: prod.color || '',
    pattern: prod.pattern || '',
    occasion: prod.occasion || '',
    sareeLength: prod.saree_length || '5.5 meters with blouse piece',
    blouseDetails: prod.blouse_details || 'Running unstitched blouse piece (0.8m)',
    mrp,
    sellingPrice,
    discountPercentage,
    stock,
    inStock: stock > 0,
    isFeatured: Boolean(prod.is_featured),
    isBestSeller: Boolean(prod.is_best_seller),
    isNewArrival: Boolean(prod.is_new_arrival),
    rating: toNumber(prod.rating, 5.0),
    reviewCount: typeof prod.review_count === 'number' ? prod.review_count : 0,
    primaryImageUrl: primaryImg,
    images: images.length > 0 ? images : [primaryImg],
  };
}

export function serializeCart(cart: any) {
  if (!cart) {
    return {
      id: 0,
      items: [],
      totalItems: 0,
      subtotal: 0,
      discount: 0,
      shippingCharge: 0,
      grandTotal: 0,
    };
  }

  const items = (cart.cart_items || []).map((ci: any) => {
    const prod = ci.products;
    const mrp = toNumber(prod?.mrp);
    const sellingPrice = toNumber(prod?.selling_price);
    const qty = ci.quantity || 1;
    const primaryImg = prod?.product_images?.find((img: any) => img.is_primary)?.image_url || prod?.product_images?.[0]?.image_url || '';

    return {
      id: toNumber(ci.id),
      productId: toNumber(ci.product_id),
      productName: prod?.name || '',
      productSku: prod?.sku || '',
      imageUrl: primaryImg,
      mrp,
      sellingPrice,
      quantity: qty,
      stock: prod?.stock ?? 0,
      subtotal: sellingPrice * qty,
    };
  });

  const totalItems = items.reduce((sum: number, it: any) => sum + it.quantity, 0);
  const subtotal = items.reduce((sum: number, it: any) => sum + it.subtotal, 0);
  const shippingCharge = subtotal >= 5000 || subtotal === 0 ? 0 : 250;
  const discount = 0;
  const grandTotal = Math.max(0, subtotal - discount + shippingCharge);

  return {
    id: toNumber(cart.id),
    items,
    totalItems,
    subtotal,
    discount,
    shippingCharge,
    grandTotal,
  };
}

export function serializeOrder(order: any) {
  if (!order) return null;

  const items = (order.order_items || []).map((oi: any) => ({
    id: toNumber(oi.id),
    productId: oi.product_id ? toNumber(oi.product_id) : 0,
    productName: oi.product_name,
    productSku: oi.product_sku,
    imageUrl: oi.image_url || '',
    price: toNumber(oi.price),
    quantity: oi.quantity,
    discount: toNumber(oi.discount, 0),
    total: toNumber(oi.total),
  }));

  const totalItems = items.reduce((sum: number, it: any) => sum + it.quantity, 0);

  return {
    id: toNumber(order.id),
    orderNumber: order.order_number,
    status: order.status,
    subtotal: toNumber(order.subtotal),
    discount: toNumber(order.discount),
    shippingCharge: toNumber(order.shipping_charge),
    totalAmount: toNumber(order.total_amount),
    couponCode: order.coupon_code || '',
    paymentMethod: order.payment_method || 'COD',
    paymentStatus: order.payment_status || 'PENDING',
    trackingNumber: order.tracking_number || '',
    courierName: order.courier_name || '',
    shippingAddress: order.addresses ? serializeAddress(order.addresses) : null,
    items,
    totalItems,
    createdAt: order.created_at?.toISOString() || new Date().toISOString(),
  };
}

export function serializeReview(rev: any) {
  if (!rev) return null;
  return {
    id: toNumber(rev.id),
    productId: toNumber(rev.product_id),
    productName: rev.products?.name || '',
    userId: toNumber(rev.user_id),
    userName: rev.users ? `${rev.users.first_name} ${rev.users.last_name}` : 'Verified Customer',
    rating: rev.rating,
    title: rev.title || '',
    comment: rev.comment,
    status: rev.approved ? 'APPROVED' : 'PENDING',
    approved: Boolean(rev.approved),
    verifiedPurchase: Boolean(rev.verified_purchase),
    createdAt: rev.created_at?.toISOString() || new Date().toISOString(),
    images: (rev.review_images || []).map((img: any) => img.image_url),
  };
}

export function serializeBanner(ban: any) {
  if (!ban) return null;
  return {
    id: toNumber(ban.id),
    title: ban.title,
    subtitle: ban.subtitle || '',
    imageUrl: ban.image_url,
    targetUrl: ban.target_url || '',
    ctaText: ban.cta_text || 'Explore Collection',
    active: Boolean(ban.active),
    sortOrder: ban.display_order ?? 0,
    displayOrder: ban.display_order ?? 0,
    createdAt: ban.created_at?.toISOString() || new Date().toISOString(),
  };
}

export function serializeCoupon(coup: any) {
  if (!coup) return null;
  return {
    id: toNumber(coup.id),
    code: coup.code,
    description: coup.description || '',
    discountType: coup.discount_type,
    discountValue: toNumber(coup.discount_value),
    minOrderAmount: toNumber(coup.min_order_amount),
    maxDiscountAmount: coup.max_discount_amount ? toNumber(coup.max_discount_amount) : null,
    startDate: coup.start_date?.toISOString() || null,
    expiryDate: coup.expiry_date?.toISOString() || null,
    usageLimit: coup.usage_limit ?? 100,
    usageCount: coup.usage_count ?? 0,
    perUserLimit: coup.per_user_limit ?? 1,
    active: Boolean(coup.active),
  };
}
