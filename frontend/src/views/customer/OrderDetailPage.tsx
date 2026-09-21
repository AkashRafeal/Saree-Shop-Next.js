'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  MapPin, 
  CreditCard, 
  ArrowLeft, 
  AlertCircle,
  XCircle,
  Sparkles
} from 'lucide-react';
import api from '@/services/api';

export const OrderDetailPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data?.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve order details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) {
      return;
    }

    setCancelling(true);
    try {
      const res = await api.post(`/orders/${id}/cancel`);
      setOrder(res.data?.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 text-center bg-stone-50/50">
        <div className="w-12 h-12 border-4 border-brand-maroon border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-500 font-serif text-sm">Loading order timeline...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-2xl mx-auto text-center">
        <div className="p-8 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold text-stone-900">Order Not Found</h2>
          <p className="text-stone-500 text-sm mt-2 mb-6">{error || 'The requested order could not be located.'}</p>
          <Link
            href="/my-orders"
            className="inline-flex items-center px-4 py-2 bg-[#0A4D40] text-white text-xs font-semibold rounded-lg hover:bg-[#062E28] transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // Tracking steps definition
  const steps = [
    { key: 'PENDING', label: 'Order Placed', icon: Clock },
    { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'PACKED', label: 'Quality Inspected & Packed', icon: Package },
    { key: 'SHIPPED', label: 'In Transit', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: Sparkles },
  ];

  const statusOrder = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = statusOrder.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-stone-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/my-orders"
            className="inline-flex items-center text-xs font-semibold text-stone-500 hover:text-[#0A4D40] transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to All Orders
          </Link>

          {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-1.5 rounded-full transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-brand-gold">
                Authentic Handloom Saree Order
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                Order #{order.orderNumber}
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-stone-400 block uppercase font-semibold">
                Total Paid
              </span>
              <span className="font-sans text-2xl font-extrabold text-brand-maroon tabular-nums tracking-tight">
                ₹{Number(order.totalAmount).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Interactive Delivery Timeline */}
          <div className="mt-8 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-6">
              Live Fulfillment Status
            </h3>

            {isCancelled ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700 text-sm">
                <XCircle className="w-5 h-5 mr-3 shrink-0" />
                <div>
                  <p className="font-bold">This order has been cancelled.</p>
                  <p className="text-xs text-red-600 mt-0.5">Any reservations have been released back into available inventory.</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="grid grid-cols-5 gap-2 relative z-10">
                  {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isCompleted = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-brand-maroon text-brand-gold shadow-md'
                              : 'bg-stone-100 text-stone-400 border border-stone-200'
                          } ${isCurrent ? 'ring-4 ring-brand-gold/30' : ''}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span
                          className={`mt-2.5 text-[11px] font-semibold leading-tight ${
                            isCompleted ? 'text-stone-900' : 'text-stone-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Progress Line */}
                <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-stone-200 -z-0">
                  <div
                    className="h-full bg-brand-maroon transition-all duration-500"
                    style={{
                      width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {order.courierName && (
              <div className="mt-8 p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-stone-700">
                  <Truck className="w-4 h-4 text-brand-maroon" />
                  <span>Dispatched via <strong className="font-semibold">{order.courierName}</strong></span>
                </div>
                {order.trackingNumber && (
                  <div className="font-mono text-stone-600">
                    AWB: <strong>{order.trackingNumber}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Details & Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Purchased Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-4 pb-3 border-b border-stone-100">
                Sarees in This Order ({order.totalItems || order.items?.length})
              </h3>
              <div className="divide-y divide-stone-100">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.productImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300'}
                        alt={item.productName}
                        className="w-16 h-20 object-cover rounded-lg border border-stone-200 shrink-0"
                      />
                      <div>
                        <h4 className="font-serif text-sm font-semibold text-stone-900">
                          {item.productName}
                        </h4>
                        <p className="text-xs text-stone-400 font-mono mt-0.5">
                          SKU: {item.productSku}
                        </p>
                        <p className="text-xs text-stone-600 mt-1">
                          ₹{Number(item.price).toLocaleString('en-IN')} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-stone-900">
                        ₹{Number(item.total).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery Address & Cost Breakdown */}
          <div className="space-y-6">
            {/* Delivery Address Card */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
              <div className="flex items-center space-x-2 text-brand-maroon mb-3">
                <MapPin className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Delivery Address
                </h4>
              </div>
              {order.shippingAddress ? (
                <div className="text-xs text-stone-600 space-y-1">
                  <p className="font-bold text-stone-900">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                  <p className="pt-1 text-stone-500">Phone: {order.shippingAddress.phoneNumber}</p>
                </div>
              ) : (
                <p className="text-xs text-stone-400">Address recorded on order</p>
              )}
            </div>

            {/* Payment & Invoice Breakdown */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
              <div className="flex items-center space-x-2 text-brand-gold mb-4">
                <CreditCard className="w-4 h-4 text-stone-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Payment & Invoice
                </h4>
              </div>
              <div className="space-y-2 text-xs text-stone-600 border-b border-stone-100 pb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon Savings ({order.couponCode})</span>
                    <span>-₹{Number(order.discount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Insured Handloom Shipping</span>
                  <span>{Number(order.shippingCharge) === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center text-stone-900 font-bold">
                <span className="text-sm font-semibold">Total Paid</span>
                <span className="font-sans text-lg font-bold text-brand-maroon tabular-nums tracking-tight">
                  ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span>Payment Mode:</span>
                <span className="font-semibold uppercase text-stone-800">{order.paymentMethod || 'Razorpay / Online'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
