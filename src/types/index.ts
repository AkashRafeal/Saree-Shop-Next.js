export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  fabric: string;
  color: string;
  pattern: string;
  occasion: string;
  sareeLength: string;
  blouseDetails: string;
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  stock: number;
  inStock: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  rating: number;
  reviewCount: number;
  primaryImageUrl: string;
  images: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  parentId: number | null;
  active: boolean;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  imageUrl: string;
  mrp: number;
  sellingPrice: number;
  quantity: number;
  stock: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  shippingCharge: number;
  grandTotal: number;
}

export interface Address {
  id: number;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: 'HOME' | 'OFFICE' | 'OTHER';
  isDefault: boolean;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  imageUrl: string;
  price: number;
  quantity: number;
  discount: number;
  total: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  discount: number;
  shippingCharge: number;
  totalAmount: number;
  couponCode?: string;
  paymentMethod: string;
  paymentStatus: string;
  trackingNumber?: string;
  courierName?: string;
  shippingAddress: Address;
  items: OrderItem[];
  totalItems: number;
  createdAt: string;
}

export interface Review {
  id: number;
  productId: number;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface CouponResult {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  calculatedDiscount: number;
  valid: boolean;
  message: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  deliveredOrders: number;
  lowStockProducts: number;
  monthlySales: { month: string; revenue: number; orders: number }[];
  categoryDistribution: { name: string; value: number }[];
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'ROLE_ADMIN' | 'ROLE_CUSTOMER' | string;
  roles?: string[];
}

