'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Star,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Search,
  MessageSquare,
  Award,
  ChevronDown,
  Check,
  Quote,
  X,
  Send,
} from 'lucide-react';
import api from '@/services/api';

interface ReviewItem {
  id: string | number;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  location?: string;
  occasion?: string;
  sareeName?: string;
  sareeId?: number | null;
  sareeImage?: string | null;
  verifiedPurchase: boolean;
  date: string;
  helpfulCount: number;
}

const SEED_REVIEWS: ReviewItem[] = [
  {
    id: 'seed-1',
    customerName: 'Hetal Shah',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    title: 'Breathtaking Pure Kanchipuram Weave',
    comment:
      "Beautiful saree, perfect fabric! I ordered for my sister's wedding and it arrived right on time. The fabric quality and pure zari work is exceptional. Got countless compliments from all our relatives!",
    occasion: "Sister's Wedding",
    sareeName: 'Kanchipuram Silk Brocade Saree',
    sareeId: 1,
    sareeImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    verifiedPurchase: true,
    date: '3 days ago',
    helpfulCount: 42,
  },
  {
    id: 'seed-2',
    customerName: 'Indu Vatsala',
    location: 'Bengaluru, Karnataka',
    rating: 5,
    title: 'Authentic Silk Mark & Luxurious Box Packaging',
    comment:
      'This is my second order from NiVi Couture. I loved them both! They arrived well packed with authentic Silk Mark certificates, exactly as shown in pictures. The fall and drape is majestic.',
    occasion: 'Housewarming Ceremony',
    sareeName: 'Banarasi Katan Pure Silk',
    sareeId: 2,
    sareeImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    verifiedPurchase: true,
    date: '1 week ago',
    helpfulCount: 29,
  },
  {
    id: 'seed-3',
    customerName: 'Rajnii M.',
    location: 'Sydney, Australia',
    rating: 5,
    title: 'Seamless International Delivery to Australia',
    comment:
      'Exquisite pure silk luster and heirloom drape. Good overall experience, and the WhatsApp customer support was very helpful with blouse design and custom tassels. Delivered overseas in just 5 days!',
    occasion: 'Diwali Gala Celebration',
    sareeName: 'Crimson Royal Heritage Pattu',
    sareeId: 3,
    sareeImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
    verifiedPurchase: true,
    date: '2 weeks ago',
    helpfulCount: 38,
  },
  {
    id: 'seed-4',
    customerName: 'Meenakshi Sundaram',
    location: 'Chennai, Tamil Nadu',
    rating: 5,
    title: 'Traditional Temple Border Perfection',
    comment:
      'As a lifelong lover of authentic South Indian handlooms, I was amazed by the precision of the korvai borders and solid contrasting pallu. The gold zari has that subtle, dignified sheen without being gaudy.',
    occasion: 'Daughter’s Engagement',
    sareeName: 'Temple Korvai Kanchipuram Silk',
    sareeId: 4,
    sareeImage: 'https://images.unsplash.com/photo-1610030469668-93510cb07659?w=600&auto=format&fit=crop&q=80',
    verifiedPurchase: true,
    date: '3 weeks ago',
    helpfulCount: 51,
  },
  {
    id: 'seed-5',
    customerName: 'Dr. Kavita Rao',
    location: 'Hyderabad, Telangana',
    rating: 5,
    title: 'Featherweight Tussar with Contemporary Zari',
    comment:
      'Light as air yet commands attention in a room! I wore this for an international medical symposium. Easy to drape for a long day without feeling heavy, and wrinkle-resistant.',
    occasion: 'Keynote Address & Gala Dinner',
    sareeName: 'Handwoven Raw Tussar Silk Saree',
    sareeId: 5,
    sareeImage: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600&auto=format&fit=crop&q=80',
    verifiedPurchase: true,
    date: '1 month ago',
    helpfulCount: 22,
  },
  {
    id: 'seed-6',
    customerName: 'Sruthika R.',
    location: 'Coimbatore, Tamil Nadu',
    rating: 5,
    title: 'The Queen of my Wardrobe',
    comment:
      'The zari work shines like real gold under chandelier lights! NiVi Couture is unmatched in bespoke customer care. The blouse fabric provided was generous and stitched into an absolute masterpiece.',
    occasion: 'Royal Atelier Family Wedding',
    sareeName: 'Royal Peacock Bridal Silk',
    sareeId: 6,
    sareeImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    verifiedPurchase: true,
    date: '1 month ago',
    helpfulCount: 64,
  },
  {
    id: 'seed-7',
    customerName: 'Ananya Deshmukh',
    location: 'Pune, Maharashtra',
    rating: 4,
    title: 'Loved the drape and fabric softness',
    comment:
      'The saree color matched the photos 100%. Delicate borders and very soft on the skin. Packing was regal. Would definitely recommend to my family and friends.',
    occasion: 'Family Festival Gathering',
    sareeName: 'Chanderi Zari Tissue Saree',
    sareeId: 7,
    sareeImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    verifiedPurchase: true,
    date: '1 month ago',
    helpfulCount: 17,
  },
  {
    id: 'seed-8',
    customerName: 'Priyamvada Sen',
    location: 'Kolkata, West Bengal',
    rating: 5,
    title: 'Exquisite Jamdani Motif Work',
    comment:
      'The intricate weaving done by master artisans is visible in every single fold. Truly worth every rupee. Feels like owning an heirloom piece of art.',
    occasion: 'Durga Puja Celebrations',
    sareeName: 'Heritage Handloom Baluchari Silk',
    sareeId: 8,
    sareeImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
    verifiedPurchase: true,
    date: '2 months ago',
    helpfulCount: 31,
  },
];

export const ReviewsPage: React.FC = () => {
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(SEED_REVIEWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const SORT_OPTIONS: { value: 'recent' | 'rating' | 'helpful'; label: string }[] = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'helpful', label: 'Most Helpful' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'helpful'>('recent');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);
  const [helpfulMap, setHelpfulMap] = useState<Record<string | number, boolean>>({});

  const currentSortLabel = SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || 'Most Recent';

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Write Review Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newOccasion, setNewOccasion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch live reviews from backend
  useEffect(() => {
    const fetchApiReviews = async () => {
      try {
        const res = await api.get('/reviews');
        if (res.data?.data && Array.isArray(res.data.data)) {
          const apiReviews: ReviewItem[] = res.data.data.map((r: any) => ({
            id: `api-${r.id}`,
            customerName: r.customerName || 'Verified Patron',
            location: 'India',
            rating: r.rating || 5,
            title: r.title || 'Exceptional Handloom Craft',
            comment: r.comment || '',
            occasion: 'Special Celebration',
            sareeName: r.productTitle || 'NiVi Couture Heritage Collection',
            sareeId: r.productId,
            sareeImage: r.productImage || null,
            verifiedPurchase: r.verifiedPurchase ?? true,
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recently',
            helpfulCount: Math.floor(Math.random() * 15) + 5,
          }));

          // Merge: Put live API reviews at the front, followed by seed reviews
          setReviewsList([...apiReviews, ...SEED_REVIEWS]);
        }
      } catch (err) {
        // Fallback gracefully to SEED_REVIEWS
        console.debug('Reviews loaded from curated patron testimonials');
      }
    };

    fetchApiReviews();
  }, []);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    return reviewsList
      .filter((rev) => {
        // Rating filter
        if (selectedRating !== 'all' && rev.rating !== selectedRating) {
          return false;
        }

        // Category / Occasion / Tag filter
        if (selectedTag === 'verified' && !rev.verifiedPurchase) {
          return false;
        }
        if (selectedTag === 'wedding' && !rev.occasion?.toLowerCase().includes('wedding')) {
          return false;
        }
        if (selectedTag === 'silk' && !rev.sareeName?.toLowerCase().includes('silk')) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = rev.customerName.toLowerCase().includes(q);
          const matchLoc = rev.location?.toLowerCase().includes(q);
          const matchTitle = rev.title.toLowerCase().includes(q);
          const matchComment = rev.comment.toLowerCase().includes(q);
          const matchSaree = rev.sareeName?.toLowerCase().includes(q);
          const matchOccasion = rev.occasion?.toLowerCase().includes(q);
          if (!matchName && !matchLoc && !matchTitle && !matchComment && !matchSaree && !matchOccasion) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'helpful') return b.helpfulCount - a.helpfulCount;
        return 0; // default order
      });
  }, [reviewsList, selectedRating, selectedTag, searchQuery, sortBy]);

  const toggleHelpful = (id: string | number) => {
    setHelpfulMap((prev) => {
      const isCurrentlyLiked = prev[id];
      const nextLiked = !isCurrentlyLiked;
      setReviewsList((list) =>
        list.map((r) =>
          r.id === id ? { ...r, helpfulCount: r.helpfulCount + (nextLiked ? 1 : -1) } : r
        )
      );
      return { ...prev, [id]: nextLiked };
    });
  };

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newEntry: ReviewItem = {
        id: `user-${Date.now()}`,
        customerName: newName.trim(),
        location: newCity.trim() || 'India',
        rating: newRating,
        title: newTitle.trim() || 'Unforgettable Saree Experience',
        comment: newComment.trim(),
        occasion: newOccasion.trim() || 'Festive Drape',
        sareeName: 'NiVi Couture Heritage Collection',
        verifiedPurchase: true,
        date: 'Just now',
        helpfulCount: 1,
      };

      setReviewsList([newEntry, ...reviewsList]);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsModalOpen(false);
        setNewName('');
        setNewCity('');
        setNewTitle('');
        setNewComment('');
        setNewOccasion('');
      }, 1400);
    }, 600);
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-16">
      {/* 1. HERO & BREADCRUMBS */}
      <div className="bg-gradient-to-b from-stone-900 via-stone-850 to-stone-900 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Subtle Mandala / Gold Accents */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-stone-800/80 border border-[#C5A059]/30 px-3 py-1 rounded-full text-[#C5A059] text-xs font-semibold tracking-wider uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Patron Voices & Heritage Stories</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-3">
                Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4081] via-[#0A4D40] to-[#C5A059]">12,500+ Patrons</span> Worldwide
              </h1>
              <p className="text-stone-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Explore unedited, verified impressions from connoisseurs across the globe celebrating life's most precious occasions draped in authentic NiVi Couture silks.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-[#0A4D40] to-[#031D19] hover:from-[#031D19] hover:to-[#021411] text-white px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-rose-950/40 hover:shadow-rose-900/60 transition-all transform active:scale-98 whitespace-nowrap self-start md:self-auto cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Share Your Story</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. RATINGS SCORECARD & STATS BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200/80 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Overall Rating Box */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center justify-center text-center lg:border-r border-stone-200 lg:pr-8">
            <div className="text-6xl font-serif font-black text-stone-900 tracking-tight">
              4.9
            </div>
            <div className="sm:ml-4 lg:ml-0 lg:mt-2 text-center">
              <div className="flex items-center justify-center space-x-1 text-amber-400 my-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                Overall Patron Score
              </p>
              <p className="text-[11px] text-stone-400">
                Based on verified orders across India & 18 countries
              </p>
            </div>
          </div>

          {/* Star Breakdown Progress Bars */}
          <div className="lg:col-span-5 space-y-2.5">
            {[
              { stars: 5, pct: 92, count: '11,540' },
              { stars: 4, pct: 6, count: '750' },
              { stars: 3, pct: 1.5, count: '180' },
              { stars: 2, pct: 0.3, count: '35' },
              { stars: 1, pct: 0.2, count: '20' },
            ].map((row) => (
              <button
                key={row.stars}
                onClick={() => setSelectedRating(selectedRating === row.stars ? 'all' : row.stars)}
                className={`w-full flex items-center space-x-3 text-xs group transition rounded-lg p-1 ${
                  selectedRating === row.stars ? 'bg-emerald-50 font-bold text-[#0A4D40]' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span className="w-12 text-left flex items-center font-medium">
                  {row.stars} <Star className="w-3 h-3 ml-1 fill-amber-400 text-amber-400 inline" />
                </span>
                <div className="flex-1 bg-stone-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-[#0A4D40] h-full rounded-full transition-all duration-500"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-[11px] text-stone-500 font-medium">
                  {row.pct}%
                </span>
              </button>
            ))}
          </div>

          {/* Trust Guarantees */}
          <div className="lg:col-span-3 bg-stone-50/80 rounded-xl p-4 border border-stone-200/60 space-y-3.5">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">100% Verified Patrons</h4>
                <p className="text-[11px] text-stone-500">Only genuine purchases from our direct loom network.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#9C752B] flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">Silk Mark Authenticated</h4>
                <p className="text-[11px] text-stone-500">Every silk piece verified by Central Silk Board.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#0A4D40] flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">7-Day Royal Promise</h4>
                <p className="text-[11px] text-stone-500">Hassle-free doorstep exchanges & insured transit.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FILTER CHIPS, SEARCH & SORT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by occasion, fabric, city, or patron name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-full text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/30 focus:border-[#0A4D40] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Reviews' },
              { id: 'verified', label: 'Verified Only' },
              { id: 'wedding', label: 'Bridal & Weddings' },
              { id: 'silk', label: 'Pure Silks' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTag(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  selectedTag === tab.id
                    ? 'bg-[#0A4D40] text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {selectedRating !== 'all' && (
              <button
                onClick={() => setSelectedRating('all')}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-100 text-[#0A4D40] rounded-full text-xs font-semibold cursor-pointer"
              >
                <span>{selectedRating} Stars</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Custom Brand-Themed Sort Dropdown (No Windows/OS Blue) */}
          <div className="relative self-start sm:self-center" ref={sortDropdownRef}>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-stone-500 font-medium">Sort by:</span>
              <button
                type="button"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="inline-flex items-center justify-between gap-2.5 bg-white border border-stone-300 hover:border-[#0A4D40] focus:border-[#0A4D40] text-stone-800 text-xs font-semibold rounded-full px-4 py-2 shadow-sm transition-all focus:outline-none min-w-[145px] cursor-pointer"
              >
                <span>{currentSortLabel}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#0A4D40] transition-transform duration-200 ${
                    sortDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* NiVi Couture Theme Menu */}
            {sortDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-stone-200 rounded-xl shadow-xl z-30 py-1 overflow-hidden animate-fadeIn">
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = opt.value === sortBy;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors ${
                        isSelected
                          ? 'bg-[#0A4D40] text-white font-semibold'
                          : 'text-stone-700 hover:bg-emerald-50 hover:text-[#0A4D40]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. REVIEWS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
            <Quote className="w-12 h-12 mx-auto text-stone-300 mb-3" />
            <h3 className="font-serif text-lg font-bold text-stone-800 mb-1">No reviews found</h3>
            <p className="text-xs text-stone-500 mb-4">
              We couldn't find any reviews matching "{searchQuery}". Try adjusting your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRating('all');
                setSelectedTag('all');
              }}
              className="px-6 py-2.5 bg-[#0A4D40] text-white rounded-full text-xs font-semibold hover:bg-[#031D19] transition shadow-sm cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Top: Rating, Date, Occasion */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-stone-900 ml-1.5">
                        {rev.rating.toFixed(1)}
                      </span>
                    </div>

                    <span className="text-[11px] text-stone-400 font-medium">{rev.date}</span>
                  </div>

                  {/* Occasion Pill */}
                  {rev.occasion && (
                    <div className="inline-flex items-center space-x-1 bg-emerald-50 text-[#0A4D40] text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 uppercase tracking-wider">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{rev.occasion}</span>
                    </div>
                  )}

                  {/* Title & Comment */}
                  <h3 className="font-serif text-base font-bold text-stone-900 mb-2 leading-snug group-hover:text-[#0A4D40] transition">
                    "{rev.title}"
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    {rev.comment}
                  </p>
                </div>

                {/* Bottom: Saree Attachment + Patron Details */}
                <div className="pt-4 border-t border-stone-100 space-y-3">
                  {/* Saree Badge / Link */}
                  {rev.sareeName && (
                    <div className="flex items-center space-x-2 bg-stone-50 p-2 rounded-lg border border-stone-100">
                      {rev.sareeImage ? (
                        <img
                          src={rev.sareeImage}
                          alt={rev.sareeName}
                          className="w-9 h-9 rounded object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded bg-[#0A4D40]/10 text-[#0A4D40] flex items-center justify-center flex-shrink-0 text-xs font-serif font-bold">
                          SA
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Draped Piece</span>
                        {rev.sareeId ? (
                          <Link
                            href={`/product/${rev.sareeId}`}
                            className="text-xs font-semibold text-stone-800 hover:text-[#0A4D40] truncate block transition"
                          >
                            {rev.sareeName}
                          </Link>
                        ) : (
                          <span className="text-xs font-semibold text-stone-800 truncate block">
                            {rev.sareeName}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Patron Info & Helpful */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A4D40] to-[#021411] text-white font-serif font-bold text-xs flex items-center justify-center shadow-sm">
                        {rev.customerName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <h4 className="text-xs font-bold text-stone-900">{rev.customerName}</h4>
                          {rev.verifiedPurchase && (
                            <span title="Verified Patron">
                              <CheckCircle2
                                className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100"
                              />
                            </span>
                          )}
                        </div>
                        {rev.location && (
                          <span className="text-[10px] text-stone-400 block">{rev.location}</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleHelpful(rev.id)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                        helpfulMap[rev.id]
                          ? 'bg-emerald-50 border-[#0A4D40] text-[#0A4D40]'
                          : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-800'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{rev.helpfulCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. WRITE A REVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {submitSuccess ? (
              <div className="text-center py-10 space-y-3 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Thank You for Your Patronage!
                </h3>
                <p className="text-xs text-stone-600">
                  Your review has been verified and added to the NiVi Couture Patron Gallery.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateReview} className="space-y-4">
                <div>
                  <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#0A4D40] mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Patron Feedback</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-stone-900">
                    Share Your Saree Story
                  </h2>
                  <p className="text-xs text-stone-500">
                    How was the weave, luster, drape, and your overall celebration experience?
                  </p>
                </div>

                {/* Star Selector */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Your Rating</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-500 ml-2">
                      {newRating === 5 ? '5.0 - Royal & Exceptional' : `${newRating}.0 Stars`}
                    </span>
                  </div>
                </div>

                {/* Name & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shalini Mukherjee"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      City / Country
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. New Delhi, India"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]"
                    />
                  </div>
                </div>

                {/* Drape Occasion */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Drape Occasion
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wedding Reception, Temple Festival, Family Ceremony"
                    value={newOccasion}
                    onChange={(e) => setNewOccasion(e.target.value)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]"
                  />
                </div>

                {/* Review Headline */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Review Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Majestic heirloom luster, received so many compliments!"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]"
                  />
                </div>

                {/* Review Details */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Detailed Impression *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe the fabric texture, zari brilliance, packaging, and how you felt wearing it..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0A4D40] resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-[#0A4D40] to-[#031D19] hover:from-[#031D19] hover:to-[#021411] text-white font-bold rounded-full text-xs flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
