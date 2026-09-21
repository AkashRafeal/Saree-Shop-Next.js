'use client';

import React, { useState } from 'react';
import { ShoppingBag, Heart, Zap, Check } from 'lucide-react';
import { Product } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useBadgeStore } from '@/store/badgeStore';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface MobileStickyBuyBarProps {
  product: Product;
  quantity?: number;
  isWishlisted?: boolean;
}

export const MobileStickyBuyBar: React.FC<MobileStickyBuyBarProps> = ({
  product,
  quantity = 1,
  isWishlisted = false,
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { fetchCounts } = useBadgeStore();

  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setWishlisted(!wishlisted);
    try {
      await api.post(`/wishlist/${product.id}`);
      fetchCounts();
    } catch {
      setWishlisted(wishlisted);
    }
  };

  const handleAddToCart = async (directCheckout: boolean = false) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setAdding(true);
    try {
      await api.post('/cart/items', { productId: product.id, quantity });
      fetchCounts();
      if (directCheckout) {
        router.push('/checkout');
      } else {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    } catch (err) {
      console.error('Failed to add item to bag:', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-lg border-t border-stone-200/90 px-3.5 pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] flex flex-col gap-2 animate-fadeIn"
      style={{
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))',
      }}
    >
      {/* Top Row: Price Summary & Discount Info */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-extrabold text-stone-900 font-sans tabular-nums">
            ₹{product.sellingPrice.toLocaleString('en-IN')}
          </span>
          {product.mrp > product.sellingPrice && (
            <span className="text-xs text-stone-400 line-through tabular-nums">
              ₹{product.mrp.toLocaleString('en-IN')}
            </span>
          )}
          {product.discountPercentage > 0 && (
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-md uppercase">
              {product.discountPercentage}% OFF
            </span>
          )}
        </div>
        <span className="text-[10.5px] font-semibold text-[#0A4D40] uppercase tracking-wide">
          Free Express Delivery
        </span>
      </div>

      {/* Bottom Row: Full Action Buttons (Wishlist + Add to Bag + Buy Now) */}
      <div className="flex items-center gap-2">
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          type="button"
          aria-label="Wishlist"
          className="w-11 h-11 shrink-0 rounded-full border border-stone-200 bg-stone-50 flex items-center justify-center text-stone-700 hover:text-[#0A4D40] active:scale-95 transition-all shadow-2xs cursor-pointer"
        >
          <Heart
            className={`w-4.5 h-4.5 ${
              wishlisted ? 'fill-[#0A4D40] text-[#0A4D40]' : 'text-stone-700'
            }`}
          />
        </button>

        {/* Add to Bag Button */}
        <button
          onClick={() => handleAddToCart(false)}
          type="button"
          disabled={adding || product.stock <= 0}
          className="flex-1 h-11 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-sm whitespace-nowrap disabled:opacity-50 cursor-pointer"
        >
          {added ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>{adding ? 'Adding...' : 'Add to Bag'}</span>
            </>
          )}
        </button>

        {/* Buy Now Instant Checkout Button */}
        <button
          onClick={() => handleAddToCart(true)}
          type="button"
          disabled={adding || product.stock <= 0}
          className="flex-1 h-11 px-3 bg-[#0A4D40] hover:bg-[#062E28] text-[#D4AF37] rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-md shadow-[#0A4D40]/25 whitespace-nowrap disabled:opacity-50 cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-[#D4AF37]" />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
};
