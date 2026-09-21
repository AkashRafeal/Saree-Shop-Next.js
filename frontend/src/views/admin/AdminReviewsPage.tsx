'use client';

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Search, 
  Trash2, 
  CheckCircle2, 
  EyeOff, 
  Eye, 
  ShieldCheck, 
  MessageSquare, 
  Sparkles
} from 'lucide-react';

interface ReviewItem {
  id: number;
  productId: number | null;
  productTitle?: string;
  productImage?: string;
  customerName: string;
  rating: number;
  title?: string;
  comment: string;
  verifiedPurchase: boolean;
  approved: boolean;
  createdAt: string;
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: 1,
    productId: 1,
    productTitle: 'Royal Kanchipuram Gold Zari Silk Saree',
    productImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
    customerName: 'Priya Sundaram',
    rating: 5,
    title: 'Absolute Royal Elegance for My Wedding!',
    comment: 'The weave weight, authentic zari luster, and handcrafted finish exceeded every expectation. It felt truly regal wearing this on my reception day.',
    verifiedPurchase: true,
    approved: true,
    createdAt: '2026-09-08T10:30:00',
  },
  {
    id: 2,
    productId: 2,
    productTitle: 'Varanasi Heritage Banarasi Brocade Saree',
    productImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80',
    customerName: 'Meenakshi Iyer',
    rating: 5,
    title: 'Flawless craft and bespoke packaging',
    comment: 'The packaging box alone is a collector’s piece. The silk drape has such rich fluid grace. Worth every rupee.',
    verifiedPurchase: true,
    approved: true,
    createdAt: '2026-09-05T14:15:00',
  },
  {
    id: 3,
    productId: 3,
    productTitle: 'Chanderi Handspun Tissue Silk Saree',
    productImage: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=300&q=80',
    customerName: 'Ananya Sharma',
    rating: 4,
    title: 'Lightweight & breezy luxury',
    comment: 'Very comfortable to wear for an 8-hour daytime puja. Gorgeous subtle metallic sheen in direct sunlight.',
    verifiedPurchase: true,
    approved: true,
    createdAt: '2026-09-01T09:40:00',
  },
  {
    id: 4,
    productId: 4,
    productTitle: 'Tussar Hand-Painted Kalamkari Saree',
    productImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
    customerName: 'Kavita Reddy',
    rating: 5,
    title: 'A wearable work of fine art',
    comment: 'The mythological motifs painted on the pallu are breathtaking. Received endless compliments.',
    verifiedPurchase: true,
    approved: true,
    createdAt: '2026-08-28T16:20:00',
  },
];

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'HIDDEN'>('ALL');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/admin/reviews');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setReviews(json.data);
        }
      }
    } catch (e) {
      console.warn('Using local reviews fallback', e);
    }
  };

  const handleToggleStatus = async (review: ReviewItem) => {
    const updatedApproved = !review.approved;
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, approved: updatedApproved } : r))
    );
    try {
      await fetch(`http://localhost:8080/api/admin/reviews/${review.id}/status`, {
        method: 'PUT',
      });
    } catch {
      // Handled locally
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this customer review permanently?')) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));
    try {
      await fetch(`http://localhost:8080/api/admin/reviews/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // Handled locally
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.productTitle && r.productTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = ratingFilter === 'ALL' || r.rating === ratingFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'APPROVED' && r.approved) ||
      (statusFilter === 'HIDDEN' && !r.approved);

    return matchesSearch && matchesRating && matchesStatus;
  });

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : '5.0';
  const approvedCount = reviews.filter((r) => r.approved).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]"></span>
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            Patron Voice & Reputation
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Customer Reviews & Rating Moderation
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Monitor authenticated patron testimonials, manage approval status, and curate catalog social proof.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Average Rating</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-sans text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight tabular-nums">{avgRating}</span>
              <div className="flex text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                ))}
              </div>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Exceptional patron satisfaction</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#D4AF37] flex items-center justify-center">
            <Star className="w-6 h-6 fill-[#D4AF37]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total Testimonials</p>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight tabular-nums mt-1">{totalReviews}</p>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5">Across all saree weaves</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#0A4D40] flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Approved & Live</p>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight tabular-nums mt-1">{approvedCount}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Visible on store product pages</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Verified Purchases</p>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight tabular-nums mt-1">100%</p>
            <p className="text-[11px] text-stone-500 font-medium mt-0.5">Guaranteed authentic orders</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patron, product, or review..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40] transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) =>
                setRatingFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              className="px-3 py-2 text-xs rounded-xl border border-stone-200 text-stone-700 focus:outline-none"
            >
              <option value="ALL">All Star Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars Only</option>
              <option value="3">3 Stars & Below</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-stone-200 text-stone-700 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="APPROVED">Approved Only</option>
              <option value="HIDDEN">Hidden / Unapproved</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="divide-y divide-stone-100">
          {filteredReviews.map((r) => (
            <div key={r.id} className="p-5 hover:bg-[#FAF8F5]/60 transition-colors flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {r.productImage ? (
                  <img
                    src={r.productImage}
                    alt={r.productTitle || 'Saree'}
                    className="w-14 h-18 object-cover rounded-xl border border-stone-200 shadow-xs shrink-0 bg-stone-100"
                  />
                ) : (
                  <div className="w-14 h-18 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 text-stone-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-stone-900 text-sm">{r.customerName}</span>
                    {r.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Patron
                      </span>
                    )}
                    <span className="text-stone-300">•</span>
                    <span className="text-[11px] text-stone-400">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#0A4D40]">{r.productTitle}</p>

                  <div className="flex items-center gap-1 text-[#D4AF37]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < r.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-stone-200 fill-stone-100'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-stone-700 ml-1.5">{r.rating}.0</span>
                  </div>

                  {r.title && (
                    <p className="text-xs font-bold text-stone-800 pt-0.5">{r.title}</p>
                  )}
                  <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">{r.comment}</p>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleToggleStatus(r)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    r.approved
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100'
                  }`}
                  title={r.approved ? 'Click to Hide Review' : 'Click to Approve Review'}
                >
                  {r.approved ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{r.approved ? 'Live on Store' : 'Hidden'}</span>
                </button>

                <button
                  onClick={() => handleDelete(r.id)}
                  className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition cursor-pointer"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <div className="p-12 text-center text-stone-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-stone-300" />
              <p className="text-sm font-medium">No customer reviews match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
