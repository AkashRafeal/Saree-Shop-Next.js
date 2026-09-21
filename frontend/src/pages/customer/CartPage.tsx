'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { Cart } from '@/types';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

export const CartPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [cart, setCart] = useState<Cart | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated, router]);

  const fetchCart = () => {
    setLoading(true);
    api.get('/cart')
      .then((res) => setCart(res.data?.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleUpdateQuantity = async (itemId: number, newQty: number) => {
    try {
      const res = await api.put(`/cart/items/${itemId}?quantity=${newQty}`);
      setCart(res.data?.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      setCart(res.data?.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !cart) return;

    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        orderAmount: cart.subtotal,
      });

      const coupon = res.data.data;
      let calculatedDiscount = 0;
      if (coupon.discountType === 'PERCENTAGE') {
        calculatedDiscount = (cart.subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount) {
          calculatedDiscount = Math.min(calculatedDiscount, coupon.maxDiscountAmount);
        }
      } else {
        calculatedDiscount = coupon.discountValue;
      }

      setDiscountAmount(calculatedDiscount);
      setAppliedCoupon(coupon.code);
      setCouponMsg({ text: `Coupon ${coupon.code} applied successfully!`, error: false });
    } catch (err: any) {
      setCouponMsg({ text: err.response?.data?.message || 'Invalid or expired coupon code.', error: true });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-8 bg-stone-200 rounded w-48" />
        <div className="h-64 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">Your Shopping Bag Is Empty</h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Explore our handloom creations and drape yourself in timeless royal silks.
        </p>
        <div>
          <Link
            href="/shop"
            className="inline-flex items-center space-x-2 bg-[#0A4D40] hover:bg-[#062E28] text-white font-bold text-xs py-3.5 px-8 rounded-full uppercase tracking-wider transition shadow-lg shadow-[#0A4D40]/20"
          >
            <span>Explore Sarees</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const finalGrandTotal = Math.max(0, cart.subtotal - discountAmount + cart.shippingCharge);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#0A4D40]">
          Review Selection
        </span>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
          Shopping Bag ({cart.totalItems} Items)
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="divide-y divide-stone-200 bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
            {cart.items.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="w-20 h-24 object-cover rounded-xl bg-stone-100 border border-stone-200 shrink-0"
                  />
                  <div>
                    <Link
                      href={`/product/${item.productId}`}
                      className="font-serif text-sm font-semibold text-stone-900 hover:text-[#0A4D40] transition line-clamp-1"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-[11px] text-stone-400 mt-0.5">SKU: {item.productSku}</p>
                    <p className="text-xs font-bold text-stone-800 mt-1">
                      ₹{item.sellingPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto space-x-6">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-stone-300 rounded-full overflow-hidden bg-white px-1">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-stone-600 hover:text-[#0A4D40] hover:bg-stone-100 text-xs font-bold transition cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-stone-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-stone-600 hover:text-[#0A4D40] hover:bg-stone-100 text-xs font-bold transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-bold text-stone-900 w-24 text-right">
                    ₹{(item.sellingPrice * item.quantity).toLocaleString('en-IN')}
                  </span>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-stone-400 hover:text-red-600 transition p-1 cursor-pointer"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order Summary & Coupon */}
        <div className="space-y-6">
          {/* Coupon Code Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-3">
            <h3 className="font-serif text-sm font-bold text-stone-800 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#0A4D40]" />
              <span>Apply Festive Promo Code</span>
            </h3>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="PROMO CODE"
                className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs uppercase tracking-wider font-semibold focus:outline-none focus:border-[#0A4D40] focus:bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Apply
              </button>
            </form>
            {couponMsg && (
              <p className={`text-[11px] ${couponMsg.error ? 'text-red-600' : 'text-emerald-700 font-semibold'}`}>
                {couponMsg.text}
              </p>
            )}
          </div>

          {/* Pricing Calculation Summary */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Total Items ({cart.totalItems})</span>
                <span className="font-semibold text-stone-800">₹{cart.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Festive Coupon Discount ({appliedCoupon})</span>
                  <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Insured Express Shipping</span>
                <span>{cart.shippingCharge === 0 ? <span className="text-emerald-700 font-semibold">FREE</span> : `₹${cart.shippingCharge}`}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-stone-900 border-t border-stone-200 pt-3">
                <span>Grand Total</span>
                <span>₹{finalGrandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => {
                const query = appliedCoupon ? `?coupon=${appliedCoupon}&discount=${discountAmount}` : '';
                router.push(`/checkout${query}`);
              }}
              className="w-full bg-[#0A4D40] hover:bg-[#062E28] text-white font-bold text-xs py-4 rounded-full shadow-lg shadow-[#0A4D40]/25 hover:shadow-xl hover:shadow-[#0A4D40]/35 transition uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Proceed To Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center text-[11px] text-stone-400 space-x-1.5 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted & Razorpay Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
