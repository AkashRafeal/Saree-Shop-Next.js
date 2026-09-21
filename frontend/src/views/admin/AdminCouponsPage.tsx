'use client';

import React, { useState, useEffect } from 'react';
import { 
  TicketPercent, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  Edit, 
  X, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck
} from 'lucide-react';
import { createPortal } from 'react-dom';

interface CouponItem {
  id: number;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  usageLimit: number;
  usageCount: number;
  active: boolean;
}

const DEFAULT_COUPONS: CouponItem[] = [
  {
    id: 1,
    code: 'WELCOME10',
    description: 'Welcome discount for first-time luxury patrons',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 1000,
    maxDiscountAmount: 2500,
    usageLimit: 1000,
    usageCount: 14,
    active: true,
  },
  {
    id: 2,
    code: 'BRIDAL20',
    description: 'Exclusive 20% privilege on Bridal & Wedding Heritage sarees',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderAmount: 15000,
    maxDiscountAmount: 8000,
    usageLimit: 500,
    usageCount: 6,
    active: true,
  },
  {
    id: 3,
    code: 'SILK500',
    description: 'Flat ₹500 off on pure handloom silk collections',
    discountType: 'FIXED',
    discountValue: 500,
    minOrderAmount: 4999,
    maxDiscountAmount: null,
    usageLimit: 2000,
    usageCount: 38,
    active: true,
  },
  {
    id: 4,
    code: 'FESTIVE15',
    description: 'Diwali & Festival season special boutique offer',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minOrderAmount: 3000,
    maxDiscountAmount: 4000,
    usageLimit: 800,
    usageCount: 92,
    active: true,
  }
];

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponItem[]>(DEFAULT_COUPONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(1000);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('2500');
  const [usageLimit, setUsageLimit] = useState(1000);
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/admin/coupons');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setCoupons(json.data);
        }
      }
    } catch (e) {
      console.warn('Using local coupons fallback', e);
    }
  };

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setCode('');
    setDescription('');
    setDiscountType('PERCENTAGE');
    setDiscountValue(10);
    setMinOrderAmount(1000);
    setMaxDiscountAmount('2500');
    setUsageLimit(1000);
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: CouponItem) => {
    setEditingId(c.id);
    setCode(c.code);
    setDescription(c.description);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setMinOrderAmount(c.minOrderAmount);
    setMaxDiscountAmount(c.maxDiscountAmount ? String(c.maxDiscountAmount) : '');
    setUsageLimit(c.usageLimit);
    setActive(c.active);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    const payload = {
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount),
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      usageLimit: Number(usageLimit),
      active,
    };

    try {
      if (editingId) {
        const res = await fetch(`http://localhost:8080/api/admin/coupons/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const json = await res.json();
          setCoupons((prev) => prev.map((item) => (item.id === editingId ? json.data : item)));
        } else {
          setCoupons((prev) =>
            prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item))
          );
        }
      } else {
        const res = await fetch('http://localhost:8080/api/admin/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const json = await res.json();
          setCoupons((prev) => [json.data, ...prev]);
        } else {
          const newItem: CouponItem = {
            id: Date.now(),
            ...payload,
            usageCount: 0,
          };
          setCoupons((prev) => [newItem, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch {
      if (editingId) {
        setCoupons((prev) =>
          prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item))
        );
      } else {
        const newItem: CouponItem = {
          id: Date.now(),
          ...payload,
          usageCount: 0,
        };
        setCoupons((prev) => [newItem, ...prev]);
      }
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (c: CouponItem) => {
    const updated = !c.active;
    setCoupons((prev) =>
      prev.map((item) => (item.id === c.id ? { ...item, active: updated } : item))
    );
    try {
      await fetch(`http://localhost:8080/api/admin/coupons/${c.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...c, active: updated }),
      });
    } catch {
      // Handled locally
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to retire this coupon?')) return;
    setCoupons((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`http://localhost:8080/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // Handled locally
    }
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);
  const activeCount = coupons.filter((c) => c.active).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0A4D40]"></span>
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              Privilege & Promotions
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Promotional Coupons & Vouchers
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Create and curate bespoke discount privileges, bridal perks, and festive vouchers.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#0A4D40] to-[#062E28] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#0A4D40]/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Active Coupons</p>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight tabular-nums mt-1">{activeCount}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Live on storefront</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#0A4D40] flex items-center justify-center">
            <TicketPercent className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total Redemptions</p>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight tabular-nums mt-1">{totalRedemptions}</p>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5">Orders with applied code</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#D4AF37] flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Max Privilege</p>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1">20% OFF</p>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5">Bridal Heritage Special</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Policy Engine</p>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1">Guarded</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Cart threshold checks</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Table Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40] transition"
            />
          </div>
          <span className="text-xs text-stone-500 font-medium">
            Showing {filteredCoupons.length} of {coupons.length} vouchers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200/70 bg-stone-50/70 text-stone-500 uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Privilege / Value</th>
                <th className="py-3.5 px-4">Min. Cart Value</th>
                <th className="py-3.5 px-4">Usage Tracker</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredCoupons.map((c) => {
                const percentUsed = Math.round(((c.usageCount || 0) / (c.usageLimit || 1)) * 100);
                return (
                  <tr key={c.id} className="hover:bg-[#FAF8F5]/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#0A4D40] bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-lg tracking-wider">
                          {c.code}
                        </span>
                        <button
                          onClick={() => handleCopy(c.code)}
                          title="Copy Code"
                          className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition cursor-pointer"
                        >
                          {copiedCode === c.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs font-medium text-stone-800">
                      {c.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">
                        {c.discountType === 'PERCENTAGE' ? (
                          <span>
                            {c.discountValue}% OFF
                            {c.maxDiscountAmount && (
                              <span className="block text-[10px] text-stone-400 font-normal">
                                Up to ₹{Number(c.maxDiscountAmount).toLocaleString('en-IN')}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span>₹{Number(c.discountValue).toLocaleString('en-IN')} FLAT OFF</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-stone-600">
                      ₹{Number(c.minOrderAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-32">
                        <div className="flex justify-between text-[10px] text-stone-500 mb-1 font-medium">
                          <span>{c.usageCount || 0} redeemed</span>
                          <span>{c.usageLimit} max</span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#0A4D40] h-1.5 rounded-full"
                            style={{ width: `${Math.min(percentUsed, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                          c.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${c.active ? 'bg-emerald-500' : 'bg-stone-400'}`}
                        ></span>
                        {c.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1.5 text-stone-400 hover:text-[#0A4D40] hover:bg-[#FFF0F5] rounded-lg transition cursor-pointer"
                          title="Edit Coupon"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Coupon Modal */}
      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200">
              <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#0A4D40] flex items-center justify-center">
                    <TicketPercent className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    {editingId ? 'Edit Privilege Coupon' : 'Create Bespoke Voucher'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCoupon} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FESTIVE25"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Discount Type
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Flat Amount (₹)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Exclusive Diwali perk on Handloom Pure Silks"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      {discountType === 'PERCENTAGE' ? 'Discount Value (%) *' : 'Discount Amount (₹) *'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={discountType === 'PERCENTAGE' ? 90 : 50000}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Min Order Value (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Max Cap Discount (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="Optional limit"
                      value={maxDiscountAmount}
                      onChange={(e) => setMaxDiscountAmount(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Total Usage Limit
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="couponActive"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 accent-[#0A4D40] rounded cursor-pointer"
                  />
                  <label htmlFor="couponActive" className="text-xs font-medium text-stone-700 cursor-pointer">
                    Enable this coupon immediately on customer storefront
                  </label>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#0A4D40] to-[#062E28] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#0A4D40]/20 hover:scale-[1.02] cursor-pointer disabled:opacity-50 transition"
                  >
                    {loading ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Voucher'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
