'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Clock, ChevronRight, ShoppingBag, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

export const MyOrdersPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?from=/my-orders');
      return;
    }

    fetchOrders();
  }, [isAuthenticated, router]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/orders');
      setOrders(res.data?.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load your order history.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Delivered
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Truck className="w-3.5 h-3.5 mr-1" /> On The Way
          </span>
        );
      case 'PACKED':
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Package className="w-3.5 h-3.5 mr-1" /> {status}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            <Clock className="w-3.5 h-3.5 mr-1" /> Processing
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            My Orders & Tracking
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Review your heirloom sarees, tracking milestones, and digital tax invoices
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-[#0A4D40] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone-500 font-serif text-sm">Retrieving your bespoke orders...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-center">
            <p className="text-red-700 font-medium text-sm mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-5 py-2 bg-[#0A4D40] hover:bg-[#062E28] text-white text-xs font-semibold rounded-full shadow-sm transition cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
            <div className="w-16 h-16 bg-[#FAF8F5] rounded-full flex items-center justify-center mx-auto mb-4 text-[#0A4D40]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-800">No Orders Yet</h3>
            <p className="mt-2 text-sm text-stone-500 max-w-sm mx-auto">
              You haven't placed any luxury saree orders yet. Discover our latest Kanchipuram and Banarasi collection!
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center px-7 py-3 rounded-full bg-[#0A4D40] hover:bg-[#062E28] text-white text-xs font-semibold uppercase tracking-wider transition shadow-md shadow-[#0A4D40]/20 cursor-pointer"
            >
              <span>Explore Collection</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Top Bar */}
                <div className="bg-stone-50/80 px-6 py-4 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-6">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                        Order Number
                      </span>
                      <span className="text-sm font-bold text-stone-900 font-mono">
                        {order.orderNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                        Order Date
                      </span>
                      <span className="text-sm text-stone-700">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                        Total Amount
                      </span>
                      <span className="text-sm font-bold text-[#0A4D40]">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusBadge(order.status)}
                    <Link
                      href={`/my-orders/${order.id}`}
                      className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold text-[#0A4D40] bg-emerald-50 hover:bg-emerald-100/80 transition cursor-pointer"
                    >
                      <span>Track Details</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="p-6 divide-y divide-stone-100">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.productImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300'}
                          alt={item.productName}
                          className="w-16 h-20 object-cover rounded-lg border border-stone-200 shrink-0"
                        />
                        <div>
                          <h4 className="font-serif text-sm font-semibold text-stone-900 line-clamp-1">
                            {item.productName}
                          </h4>
                          <p className="text-xs text-stone-500 font-mono mt-0.5">
                            SKU: {item.productSku || 'SA-HEIRLOOM'}
                          </p>
                          <p className="text-xs text-stone-600 mt-1">
                            Qty: <span className="font-semibold">{item.quantity}</span> × ₹{Number(item.price).toLocaleString('en-IN')}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
