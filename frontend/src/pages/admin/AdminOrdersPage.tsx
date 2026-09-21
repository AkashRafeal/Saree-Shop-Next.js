'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import api from '@/services/api';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders?page=0&size=50');
      setOrders(res.data?.data?.content || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
        remarks: `Updated by administrator to ${newStatus}`,
      });
      // Refresh list
      await fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  const filteredOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Order Fulfillment & Shipping
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Track customer orders and advance fulfillment milestones
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-stone-200">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              filterStatus === st
                ? 'bg-[#0A4D40] text-white shadow-md shadow-[#0A4D40]/25'
                : 'bg-white text-stone-600 hover:bg-[#FAF8F5] border border-stone-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-[#0A4D40] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-500">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-xs">
            No orders found for this status.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-stone-600 uppercase font-bold text-[11px] tracking-wider border-b border-stone-200/80">
                <tr>
                  <th className="py-3.5 px-4">Order Details</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4 text-right">Update Lifecycle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-stone-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">
                        {order.shippingAddress?.fullName || 'Customer'}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Ph: {order.shippingAddress?.phoneNumber}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-stone-800">
                        {order.totalItems || order.items?.length || 1} saree(s)
                      </div>
                      <div className="text-[11px] text-stone-400 truncate max-w-[150px]">
                        {order.items?.map((it: any) => it.productName).join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#0A4D40] text-sm">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 uppercase">
                        {order.paymentStatus || 'PAID'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : order.status === 'SHIPPED'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id || order.status === 'CANCELLED'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-xs bg-[#FAF8F5] border border-stone-200 rounded-full px-3.5 py-1.5 font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40] disabled:opacity-50 cursor-pointer"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PACKED">PACKED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
