'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, MapPin, CreditCard, Sparkles, Plus, Check } from 'lucide-react';
import { Address, Cart, Order } from '@/types';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // New Address fields
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddressLine1, setNewAddressLine1] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');

  const couponCode = searchParams.get('coupon') || '';
  const couponDiscount = Number(searchParams.get('discount') || 0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Load addresses and cart
    api.get('/addresses')
      .then((res) => {
        const addrList = res.data?.data || [];
        setAddresses(addrList);
        if (addrList.length > 0) {
          const def = addrList.find((a: Address) => a.isDefault) || addrList[0];
          setSelectedAddressId(def.id);
        }
      })
      .catch((err) => console.error(err));

    api.get('/cart')
      .then((res) => {
        const c = res.data?.data;
        if (!c || c.items.length === 0) {
          router.push('/cart');
        } else {
          setCart(c);
        }
      })
      .catch((err) => console.error(err));
  }, [isAuthenticated, router]);

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', {
        fullName: newFullName,
        phone: newPhone,
        addressLine1: newAddressLine1,
        city: newCity,
        state: newState,
        postalCode: newPostalCode,
        country: 'India',
        addressType: 'HOME',
        isDefault: true,
      });
      const created = res.data?.data;
      setAddresses([created, ...addresses]);
      setSelectedAddressId(created.id);
      setShowNewAddressModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId || !cart) return;
    setPlacingOrder(true);

    try {
      const payload: Record<string, any> = {
        shippingAddressId: selectedAddressId,
        paymentMethod,
        customerNotes: 'Online Storefront Order',
      };
      if (couponCode) {
        payload.couponCode = couponCode;
      }

      const res = await api.post('/orders', payload);
      const createdOrder = res.data?.data;
      setConfirmedOrder(createdOrder);
    } catch (err: any) {
      console.error('Order creation error:', err);
      alert(err.response?.data?.message || 'Failed to finalize order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-[#0A4D40] flex items-center justify-center border border-emerald-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#0A4D40]">
          Order Confirmed • NiVi Couture
        </span>
        <h2 className="font-serif text-3xl font-bold text-stone-900">
          Thank You For Patronizing NiVi Couture
        </h2>
        <p className="text-xs text-stone-600 leading-relaxed max-w-md mx-auto">
          Your order has been recorded. Our master artisans are now preparing and quality-inspecting your selected drapes.
        </p>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm text-left max-w-md mx-auto space-y-3 text-xs">
          <div className="flex justify-between border-b border-stone-100 pb-2">
            <span className="text-stone-500">Order Number</span>
            <span className="font-bold font-mono text-stone-900">{confirmedOrder.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Insured Amount Paid</span>
            <span className="font-bold text-stone-800">₹{confirmedOrder.totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Courier Partner</span>
            <span className="font-bold text-stone-800">{confirmedOrder.courierName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Tracking Code</span>
            <span className="font-bold text-[#0A4D40]">{confirmedOrder.trackingNumber}</span>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Link
            href={`/my-orders/${confirmedOrder.id}`}
            className="bg-[#0A4D40] hover:bg-[#062E28] text-white font-bold text-xs py-3.5 px-6 rounded-xl uppercase tracking-wider transition"
          >
            Track Order Live
          </Link>
          <Link
            href="/shop"
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs py-3.5 px-6 rounded-xl uppercase tracking-wider transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!cart) return null;

  const grandTotal = Math.max(0, cart.subtotal - couponDiscount + cart.shippingCharge);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#0A4D40]">
          Secure Checkout
        </span>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
          Finalize Your Handloom Order
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Steps Accordion */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Delivery Address */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0A4D40]" />
                <span>1. Select Delivery Address</span>
              </h3>
              <button
                onClick={() => setShowNewAddressModal(true)}
                className="text-xs font-semibold text-[#0A4D40] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition text-xs space-y-1 relative ${
                    selectedAddressId === addr.id
                      ? 'border-[#0A4D40] bg-[#0A4D40]/5 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {selectedAddressId === addr.id && (
                    <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#0A4D40] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                  <p className="font-bold text-stone-900">{addr.fullName}</p>
                  <p className="text-stone-600">{addr.addressLine1}</p>
                  <p className="text-stone-600">{addr.city}, {addr.state} - {addr.postalCode}</p>
                  <p className="text-stone-500 pt-1">Phone: {addr.phone}</p>
                </div>
              ))}
            </div>

            {/* Modal for adding address */}
            {showNewAddressModal && (
              <form onSubmit={handleAddNewAddress} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3 mt-4">
                <h4 className="font-serif text-sm font-bold">Add Shipping Address</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="p-2 rounded border border-stone-300 col-span-2 sm:col-span-1 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="p-2 rounded border border-stone-300 col-span-2 sm:col-span-1 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    required
                    value={newAddressLine1}
                    onChange={(e) => setNewAddressLine1(e.target.value)}
                    className="p-2 rounded border border-stone-300 col-span-2 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="p-2 rounded border border-stone-300 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    required
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="p-2 rounded border border-stone-300 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="PIN Code"
                    required
                    value={newPostalCode}
                    onChange={(e) => setNewPostalCode(e.target.value)}
                    className="p-2 rounded border border-stone-300 col-span-2 bg-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewAddressModal(false)}
                    className="px-4 py-2 border border-stone-300 rounded text-xs hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0A4D40] text-white rounded text-xs font-bold hover:bg-[#062E28]"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#0A4D40]" />
              <span>2. Payment Mode</span>
            </h3>

            <div className="space-y-3">
              <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === 'RAZORPAY' ? 'border-[#0A4D40] bg-[#0A4D40]/5' : 'border-stone-200'}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RAZORPAY"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="accent-[#0A4D40]"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Razorpay Sandbox / UPI / Card / NetBanking</span>
                    <span className="text-[11px] text-stone-500">Instant test verification with secure gateway integration</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">RECOMMENDED</span>
              </label>

              <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === 'COD' ? 'border-[#0A4D40] bg-[#0A4D40]/5' : 'border-stone-200'}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="accent-[#0A4D40]"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Cash on Delivery (COD)</span>
                    <span className="text-[11px] text-stone-500">Pay cash directly to the courier agent upon doorstep delivery</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Preview */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4 sticky top-24">
            <h3 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
              Order Summary ({cart.totalItems} Items)
            </h3>

            {/* Items list preview */}
            <div className="divide-y divide-stone-100 max-h-56 overflow-y-auto pr-1 space-y-2">
              {cart.items.map((item) => (
                <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <img src={item.imageUrl} alt="" className="w-10 h-12 object-cover rounded bg-stone-100" />
                    <div className="max-w-[130px]">
                      <p className="font-semibold text-stone-900 truncate">{item.productName}</p>
                      <p className="text-[10px] text-stone-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900">₹{item.subtotal.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs border-t border-stone-100 pt-4">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>₹{cart.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({couponCode})</span>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Insured Express Shipping</span>
                <span>{cart.shippingCharge === 0 ? <span className="text-emerald-700 font-semibold">FREE</span> : `₹${cart.shippingCharge}`}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-stone-900 border-t border-stone-200 pt-3">
                <span>Total Payable</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder || !selectedAddressId}
              className="w-full bg-[#0A4D40] hover:bg-[#062E28] disabled:bg-stone-300 text-white font-bold text-xs py-4 rounded-full shadow-lg shadow-[#0A4D40]/25 hover:shadow-xl hover:shadow-[#0A4D40]/35 transition uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{placingOrder ? 'Confirming Order...' : `Pay ₹${grandTotal.toLocaleString('en-IN')} & Confirm`}</span>
            </button>

            <div className="flex items-center justify-center text-[11px] text-stone-400 space-x-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Razorpay Verified Sandbox Environment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const CheckoutPage: React.FC = () => {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-400">Loading checkout...</div>}>
      <CheckoutForm />
    </Suspense>
  );
};
