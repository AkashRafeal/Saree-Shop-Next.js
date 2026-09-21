'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  ArrowUpRight,
  RefreshCw,
  IndianRupee,
  CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import api from '@/services/api';

const COLORS = ['#0A4D40', '#D4AF37', '#1E4D2B', '#E5DCC3', '#9C27B0', '#2C3E50'];

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchDashboardData(false);
  }, []);

  const fetchDashboardData = async (isManual = true) => {
    if (isManual) setIsRefreshing(true);
    else setLoading(true);
    const startTime = Date.now();

    try {
      const [statsRes, ordersRes] = await Promise.allSettled([
        api.get('/admin/dashboard'),
        api.get('/admin/orders?page=0&size=5'),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data?.data);
      }
      if (ordersRes.status === 'fulfilled') {
        setRecentOrders(ordersRes.value.data?.data?.content || []);
      }

      // If clicked manually, enforce a visible 700ms smooth animation so user clearly sees the refresh happen
      if (isManual) {
        const elapsed = Date.now() - startTime;
        if (elapsed < 700) {
          await new Promise((r) => setTimeout(r, 700 - elapsed));
        }
        const now = new Date();
        setLastRefreshedAt(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setRefreshKey((prev) => prev + 1);
        setJustRefreshed(true);
        setTimeout(() => setJustRefreshed(false), 2400);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  const sampleMonthlySales = [
    { name: 'May', sales: 185000 },
    { name: 'Jun', sales: 240000 },
    { name: 'Jul', sales: 310000 },
    { name: 'Aug', sales: 420000 },
    { name: 'Sep', sales: stats?.totalRevenue ? Number(stats.totalRevenue) : 510000 },
  ];

  const sampleCategoryDistribution = [
    { name: 'Kanchipuram Silk', value: 45 },
    { name: 'Banarasi Brocade', value: 30 },
    { name: 'Bridal Wedding', value: 15 },
    { name: 'Chanderi & Linen', value: 10 },
  ];

  if (loading && !stats) {
    return (
      <div className="py-32 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#0A4D40] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest font-sans">
          Loading executive dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
              Executive Commerce Dashboard
            </h2>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A4D40]"></span>
          </div>
          <p className="text-xs text-stone-500 mt-1 font-sans">
            Real-time performance analytics, revenue tracking, and inventory status
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastRefreshedAt && (
            <span className="text-[11px] text-stone-400 font-sans hidden sm:inline-flex items-center gap-1.5 bg-white border border-stone-200/80 px-2.5 py-1.5 rounded-lg shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live: {lastRefreshedAt}
            </span>
          )}

          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing || loading}
            className={`inline-flex items-center px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 shadow-xs cursor-pointer active:scale-95 ${
              justRefreshed
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-emerald-100 scale-102'
                : isRefreshing
                ? 'bg-[#FFF0F5] text-[#0A4D40] border border-[#0A4D40]/30 shadow-[#0A4D40]/10'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-[#FAF8F5] hover:border-stone-300'
            }`}
          >
            {justRefreshed ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600 animate-bounce" />
                <span>Refreshed!</span>
              </>
            ) : (
              <>
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-[#0A4D40] ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top Animated Shimmer Progress Bar when refreshing */}
      {isRefreshing && (
        <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden relative -mt-4 animate-fadeIn">
          <div className="absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-transparent via-[#0A4D40] to-transparent animate-pulse" />
        </div>
      )}

      {/* Floating Centered Refresh Overlay Pill */}
      {isRefreshing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-2xl shadow-2xl border border-[#0A4D40]/20 flex items-center space-x-3 text-stone-900 text-sm font-semibold animate-scaleUp">
            <RefreshCw className="w-4 h-4 text-[#0A4D40] animate-spin" />
            <span>Refreshing Executive Dashboard...</span>
          </div>
        </div>
      )}

      {/* Entire Dashboard Screen Animated Container */}
      <div
        key={refreshKey}
        className={`space-y-8 transition-all duration-500 ${
          isRefreshing
            ? 'opacity-40 scale-[0.99] filter blur-[0.8px] pointer-events-none'
            : justRefreshed
            ? 'opacity-100 scale-100 animate-fadeIn'
            : 'opacity-100 scale-100'
        }`}
      >
        {/* 4 Core KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 font-sans">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
              Total Revenue
            </span>
            <div className="flex items-baseline mt-1.5">
              <span className="text-xl font-bold text-stone-700 mr-0.5">₹</span>
              <span className="font-sans text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight tabular-nums">
                {stats?.totalRevenue ? Number(stats.totalRevenue).toLocaleString('en-IN') : '2,48,500'}
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center mt-1.5">
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-600" /> +18.4% vs last month
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#0A4D40]/10 text-[#0A4D40] flex items-center justify-center font-bold text-lg shadow-xs">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
              Total Orders
            </span>
            <div className="font-sans text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight tabular-nums mt-1.5">
              {stats?.totalOrders ?? 58}
            </div>
            <p className="text-[11px] text-stone-500 font-medium mt-1.5">
              {stats?.pendingOrders ?? 0} Pending Fulfillment
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        {/* Saree Catalog */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
              Active Sarees
            </span>
            <div className="font-sans text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight tabular-nums mt-1.5">
              {stats?.totalProducts ?? 20}
            </div>
            <p className="text-[11px] text-stone-500 font-medium mt-1.5">Across 6 Luxury Categories</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
              Low Stock Alerts
            </span>
            <div className="font-sans text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight tabular-nums mt-1.5">
              {stats?.lowStockProducts ?? 2}
            </div>
            <p className="text-[11px] text-stone-500 font-medium mt-1.5">Items below threshold</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                Monthly Revenue Trend
              </h3>
              <p className="text-xs text-stone-500">Gross saree merchandise value</p>
            </div>
            <span className="text-xs font-bold text-[#0A4D40] bg-[#FFF0F5] border border-[#0A4D40]/20 px-3 py-1 rounded-full">
              FY 2026
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleMonthlySales}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="sales" fill="#0A4D40" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-stone-900 mb-1">
              Sales by Fabric Category
            </h3>
            <p className="text-xs text-stone-500 mb-4">Share of total catalog revenue</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sampleCategoryDistribution}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sampleCategoryDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            {sampleCategoryDistribution.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-stone-600 truncate">{item.name}</span>
                </div>
                <span className="font-semibold text-stone-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-serif text-base font-bold text-stone-900">
              Recent Customer Orders
            </h3>
            <p className="text-xs text-stone-500">Live order management stream</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#0A4D40] hover:text-[#062E28] inline-flex items-center gap-1 transition"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-10 text-center text-xs text-stone-400">
            No recent orders recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-stone-600 uppercase font-bold text-[11px] tracking-wider border-b border-stone-200/80">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-900">{ord.orderNumber}</td>
                    <td className="py-3 px-4 text-stone-500">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-medium">{ord.shippingAddress?.fullName || 'Customer'}</td>
                    <td className="py-3 px-4">{ord.totalItems || ord.items?.length || 1} saree(s)</td>
                    <td className="py-3 px-4 font-bold text-[#0A4D40]">
                      ₹{Number(ord.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-800">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href="/admin/orders"
                        className="text-xs font-bold text-[#0A4D40] hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
