'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, ShoppingBag, ShieldCheck, Award, Truck, Check, Sparkles, Share2, ArrowRight } from 'lucide-react';
import { Product, Review } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { MobileStickyBuyBar } from '@/components/product/MobileStickyBuyBar';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80';

export const ProductDetailPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/products/${id}`)
      .then((res) => {
        const prod = res.data?.data;
        setProduct(prod);
        setSelectedImage(prod?.primaryImageUrl || FALLBACK_IMAGE);
      })
      .catch((err) => {
        console.error('Error fetching product:', err);
      })
      .finally(() => setLoading(false));

    api.get(`/reviews/product/${id}`)
      .then((res) => setReviews(res.data?.data || []))
      .catch((err) => console.error('Error fetching reviews:', err));

    api.get('/products/featured')
      .then((res) => setRelated(res.data?.data || []))
      .catch((err) => console.error('Error fetching related:', err));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!product) return;
    setAdding(true);
    try {
      await api.post('/cart/items', { productId: product.id, quantity });
      router.push('/cart');
    } catch (err) {
      console.error('Add to cart error:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.post(`/reviews/product/${id}`, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviews([res.data?.data, ...reviews]);
      setReviewComment('');
      setReviewTitle('');
    } catch (err) {
      console.error('Submit review error:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="h-4 bg-stone-200 rounded w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-stone-200 rounded-3xl" />
          <div className="space-y-6 pt-4">
            <div className="h-8 bg-stone-200 rounded w-3/4" />
            <div className="h-5 bg-stone-200 rounded w-1/4" />
            <div className="h-24 bg-stone-200 rounded-2xl" />
            <div className="h-36 bg-stone-200 rounded-2xl" />
            <div className="h-14 bg-stone-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-stone-900">Creation Not Found</h2>
        <p className="text-stone-500 text-xs sm:text-sm">The selected saree drape may have been archived or unlisted.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-[#0A4D40] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full hover:bg-[#062E28] transition shadow-md"
        >
          <span>Return to All Sarees</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const discountAmount = product.mrp > product.sellingPrice ? product.mrp - product.sellingPrice : 0;
  const currentImage = selectedImage || product.primaryImageUrl || FALLBACK_IMAGE;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Main Product Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Gallery & Zoomable View */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/90 shadow-lg group">
            <img
              src={currentImage}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== FALLBACK_IMAGE) {
                  target.src = FALLBACK_IMAGE;
                }
              }}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Discount Badge */}
            {product.discountPercentage > 0 && (
              <span className="absolute top-5 left-5 bg-gradient-to-r from-[#0A4D40] to-[#E11D48] text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-full shadow-lg shadow-[#0A4D40]/30 tracking-widest uppercase">
                {product.discountPercentage}% OFF
              </span>
            )}

            {/* Floating Share Button */}
            <button
              onClick={handleShare}
              title="Copy share link"
              className="absolute top-5 right-5 w-9 h-9 bg-white/90 hover:bg-white text-stone-700 hover:text-[#0A4D40] rounded-full flex items-center justify-center shadow-md backdrop-blur-xs transition"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {copied && (
              <div className="absolute top-16 right-5 bg-stone-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-md animate-fade-in">
                Link Copied!
              </div>
            )}
          </div>

          {/* Thumbnails Carousel */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
              {product.images.map((img, idx) => {
                const isSelected = (selectedImage === img) || (!selectedImage && idx === 0);
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      isSelected
                        ? 'border-[#0A4D40] ring-2 ring-[#0A4D40]/30 shadow-md scale-102'
                        : 'border-stone-200 hover:border-emerald-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== FALLBACK_IMAGE) {
                          target.src = FALLBACK_IMAGE;
                        }
                      }}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Controls */}
        <div className="space-y-6">
          <div className="space-y-3">
            {/* Category Pill & Rating */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-[#0A4D40] border border-emerald-200/80 font-bold px-3 py-1 rounded-full text-[10px] tracking-widest uppercase">
                  {product.categoryName}
                </span>
                <span className="text-[11px] text-stone-400 font-medium">SKU: {product.sku}</span>
              </div>

              <div className="flex items-center text-amber-500 font-bold bg-amber-50/80 border border-amber-200/60 px-3 py-1 rounded-full text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1.5" />
                <span>{product.rating}</span>
                <span className="text-stone-400 font-normal ml-1">({product.reviewCount} Reviews)</span>
              </div>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Luxury Pricing Box (Theme Matched) */}
          <div className="p-5 rounded-2xl bg-[#FFF9FA] border border-rose-100/90 shadow-xs space-y-2">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-sans tracking-tight tabular-nums">
                ₹{product.sellingPrice.toLocaleString('en-IN')}
              </span>
              {product.mrp > product.sellingPrice && (
                <>
                  <span className="text-base font-medium text-stone-400 line-through font-sans tabular-nums">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-[#0A4D40] bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full font-sans tabular-nums">
                    Save ₹{discountAmount.toLocaleString('en-IN')} ({product.discountPercentage}% OFF)
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
              <span>Inclusive of all taxes</span>
              <span>•</span>
              <span className="text-[#0A4D40] font-semibold">Silk Mark Certified Authentic Pure Silk</span>
            </p>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
            {product.description}
          </p>

          {/* Specifications Table (Theme Matched) */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50/70 p-4 sm:p-5 rounded-2xl border border-stone-200/80">
            <div className="p-3 bg-white rounded-xl border border-stone-100">
              <span className="text-stone-400 text-[11px] block font-medium">Fabric</span>
              <span className="font-semibold text-stone-900">{product.fabric}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-stone-100">
              <span className="text-stone-400 text-[11px] block font-medium">Color Palette</span>
              <span className="font-semibold text-stone-900">{product.color}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-stone-100">
              <span className="text-stone-400 text-[11px] block font-medium">Occasion</span>
              <span className="font-semibold text-stone-900">{product.occasion}</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-stone-100">
              <span className="text-stone-400 text-[11px] block font-medium">Saree Length</span>
              <span className="font-semibold text-stone-900">{product.sareeLength}</span>
            </div>
            <div className="col-span-2 p-3 bg-white rounded-xl border border-stone-100">
              <span className="text-stone-400 text-[11px] block font-medium">Blouse Piece</span>
              <span className="font-semibold text-stone-900">{product.blouseDetails}</span>
            </div>
          </div>

          {/* Quantity & Add to Cart Controls */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-stone-200 rounded-full bg-white overflow-hidden shadow-xs px-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full text-stone-600 hover:text-[#0A4D40] hover:bg-emerald-50/60 font-bold transition text-sm flex items-center justify-center cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-bold text-stone-900 select-none">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 rounded-full text-stone-600 hover:text-[#0A4D40] hover:bg-emerald-50/60 font-bold transition text-sm flex items-center justify-center cursor-pointer"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div>
                {product.stock > 0 ? (
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    In Stock ({product.stock} pieces left)
                  </span>
                ) : (
                  <span className="text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full text-xs font-semibold">
                    Sold Out
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons (Strictly Themed Pill Buttons) */}
            <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || adding}
                className="flex-1 bg-[#0A4D40] hover:bg-[#062E28] disabled:bg-stone-300 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-[#0A4D40]/25 hover:shadow-xl hover:shadow-[#0A4D40]/35 transition-all duration-200 flex items-center justify-center gap-2.5 text-xs uppercase tracking-wider active:scale-[0.99] cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{adding ? 'Adding to Bag...' : 'Add To Cart'}</span>
              </button>

              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || adding}
                className="flex-1 bg-stone-900 hover:bg-stone-950 disabled:bg-stone-300 text-white font-bold py-4 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 text-xs uppercase tracking-wider border border-stone-800 active:scale-[0.99] cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Value Propositions Trust Cards */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-200 text-center">
            <div className="p-3.5 bg-[#FFF9FA] border border-rose-100 rounded-2xl hover:border-emerald-300 transition-colors">
              <Award className="w-5 h-5 mx-auto text-[#0A4D40] mb-1.5" />
              <span className="text-[11px] font-bold text-stone-800 block">Silk Mark</span>
              <span className="text-[9.5px] text-stone-500">100% Pure Silk</span>
            </div>
            <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl hover:border-emerald-200 transition-colors">
              <Truck className="w-5 h-5 mx-auto text-[#D4AF37] mb-1.5" />
              <span className="text-[11px] font-bold text-stone-800 block">Free Shipping</span>
              <span className="text-[9.5px] text-stone-500">Insured Delivery</span>
            </div>
            <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-2xl hover:border-emerald-200 transition-colors">
              <ShieldCheck className="w-5 h-5 mx-auto text-emerald-600 mb-1.5" />
              <span className="text-[11px] font-bold text-stone-800 block">Authentic</span>
              <span className="text-[9.5px] text-stone-500">Master Weavers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="space-y-8 pt-12 border-t border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Customer Reviews ({reviews.length})
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">Verified patron reflections and ratings</p>
          </div>
        </div>

        {/* Submit Review Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
          <h3 className="font-serif text-lg font-bold text-stone-900">Write a Review</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">Your Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewRating(s)}
                    className="p-1 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 transition ${
                        s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">Review Headline</label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="e.g. Majestic drape and vibrant gold zari borders!"
                className="w-full text-xs p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-[#0A4D40] focus:ring-2 focus:ring-[#0A4D40]/20 transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">Review Comments</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
                rows={3}
                placeholder="Share your thoughts on the silk texture, authenticity, and overall drape experience..."
                className="w-full text-xs p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:border-[#0A4D40] focus:ring-2 focus:ring-[#0A4D40]/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="bg-[#0A4D40] hover:bg-[#062E28] text-white font-bold text-xs py-3.5 px-8 rounded-full shadow-md shadow-[#0A4D40]/20 transition uppercase tracking-wider cursor-pointer"
            >
              {submittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="p-8 rounded-2xl bg-stone-50 border border-dashed border-stone-200 text-center">
              <p className="text-xs text-stone-500 italic">No reviews yet for this creation. Be the first to share your impressions!</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-amber-400' : 'text-stone-300'}`}
                        />
                      ))}
                    </div>
                    {r.title && <h4 className="font-semibold text-xs text-stone-900">{r.title}</h4>}
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Verified Patron
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-light">{r.comment}</p>
                <p className="text-[11px] text-stone-400">— {r.customerName}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Creations */}
      {related.length > 0 && (
        <section className="space-y-6 pt-12 border-t border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#0A4D40] block mb-1">
                HANDCRAFTED EDITS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                You May Also Admire
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-semibold text-[#0A4D40] hover:text-[#062E28] flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Buy Now / Add to Bag Action Bar */}
      {product && (
        <MobileStickyBuyBar
          product={product}
          quantity={quantity}
        />
      )}
    </div>
  );
};

