'use client';

import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  TrendingUp, 
  ArrowUpRight, 
  IndianRupee, 
  ShoppingBag, 
  Layers,
  FileSpreadsheet
} from 'lucide-react';

interface MonthlyReportRow {
  month: string;
  orders: number;
  revenue: number;
  aov: number;
  status: string;
  growth: string;
}

const MONTHLY_DATA: MonthlyReportRow[] = [
  { month: 'September 2026 (Current)', orders: 28, revenue: 384000, aov: 13714, status: 'In Progress', growth: '+24.6%' },
  { month: 'August 2026', orders: 42, revenue: 512000, aov: 12190, status: 'Closed', growth: '+18.2%' },
  { month: 'July 2026', orders: 36, revenue: 435000, aov: 12083, status: 'Closed', growth: '+11.5%' },
  { month: 'June 2026', orders: 31, revenue: 390000, aov: 12580, status: 'Closed', growth: '+9.8%' },
  { month: 'May 2026', orders: 25, revenue: 310000, aov: 12400, status: 'Closed', growth: '+14.1%' },
  { month: 'April 2026', orders: 22, revenue: 275000, aov: 12500, status: 'Closed', growth: '+8.4%' },
];

const CATEGORY_SHARE = [
  { name: 'Kanchipuram Silk', share: 45, revenue: '₹1,038,000', color: 'bg-[#0A4D40]' },
  { name: 'Banarasi Brocade', share: 25, revenue: '₹576,000', color: 'bg-[#D4AF37]' },
  { name: 'Chanderi Handloom', share: 15, revenue: '₹345,000', color: 'bg-emerald-600' },
  { name: 'Tussar & Kalamkari', share: 10, revenue: '₹230,000', color: 'bg-purple-600' },
  { name: 'Organza Tissue', share: 5, revenue: '₹117,000', color: 'bg-amber-500' },
];

export const AdminReportsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('FY 2026-27');

  const handleExportCSV = () => {
    const headers = ['Month', 'Orders Count', 'Gross Revenue (INR)', 'Average Order Value (INR)', 'Growth %', 'Fiscal Status'];
    const rows = MONTHLY_DATA.map((row) => [
      `"${row.month}"`,
      row.orders,
      row.revenue,
      row.aov,
      `"${row.growth}"`,
      `"${row.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NiViCollections_Commerce_Report_${selectedPeriod.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = MONTHLY_DATA.reduce((acc, row) => acc + row.revenue, 0);
  const totalOrders = MONTHLY_DATA.reduce((acc, row) => acc + row.orders, 0);
  const avgAov = Math.round(totalRevenue / (totalOrders || 1));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0A4D40]"></span>
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              Executive Intelligence
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Commerce Analytics & Fiscal Reports
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Track gross merchandise value, category sales velocity, average basket sizes, and export auditable reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="pl-3 pr-8 py-2.5 text-xs font-semibold rounded-xl border border-stone-200 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 cursor-pointer"
            >
              <option value="FY 2026-27">Fiscal Year 2026-27</option>
              <option value="Q2 2026">Q2 2026 (Jul - Sep)</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="All Time">All Time Inception</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            title="Download CSV Spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-xs transition cursor-pointer"
            title="Print Executive Summary"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Gross Merchandise Value</p>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight tabular-nums mt-1">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> +19.4% vs previous cycle
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#0A4D40] flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Delivered Saree Orders</p>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight tabular-nums mt-1">{totalOrders}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">99.2% fulfillment rate</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#D4AF37] flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Average Order Value (AOV)</p>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight tabular-nums mt-1">
              ₹{avgAov.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5">High luxury ticket size</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Catalog Inventory Turn</p>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight tabular-nums mt-1">4.2x</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Healthy sell-through velocity</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Category Breakdown & Trend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weave Category Share */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-base font-bold text-stone-900">
              Revenue by Weave Heritage
            </h3>
            <span className="text-[11px] font-semibold text-[#0A4D40] bg-rose-50 px-2 py-0.5 rounded-full">
              Volume Distribution
            </span>
          </div>

          <div className="space-y-4">
            {CATEGORY_SHARE.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-stone-800">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500 font-mono">{cat.revenue}</span>
                    <span className="font-bold text-stone-900">{cat.share}%</span>
                  </div>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div className={`${cat.color} h-2 rounded-full`} style={{ width: `${cat.share}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Performance Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#0A4D40]" />
              <h3 className="font-serif text-base font-bold text-stone-900">
                Monthly Commercial Performance
              </h3>
            </div>
            <span className="text-xs text-stone-400 font-medium">Period: {selectedPeriod}</span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200/70 bg-stone-50/70 text-stone-500 uppercase tracking-wider text-[11px] font-semibold">
                  <th className="py-3 px-4">Billing Month</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4">Gross Revenue</th>
                  <th className="py-3 px-4">Avg Basket (AOV)</th>
                  <th className="py-3 px-4">MoM Growth</th>
                  <th className="py-3 px-4 text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {MONTHLY_DATA.map((row) => (
                  <tr key={row.month} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-stone-900">{row.month}</td>
                    <td className="py-3 px-4 font-mono font-medium">{row.orders} orders</td>
                    <td className="py-3 px-4 font-bold text-stone-900">
                      ₹{row.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-stone-600 font-mono">
                      ₹{row.aov.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{row.growth}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          row.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Aggregated Gross Total ({MONTHLY_DATA.length} billing cycles)</span>
            <span className="font-bold text-stone-900 text-sm">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
