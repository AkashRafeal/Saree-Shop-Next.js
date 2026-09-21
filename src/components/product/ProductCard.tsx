'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '@/types';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onWishlistToggle?: (product: Product) => void;
  isWishlisted?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onWishlistToggle,
  isWishlisted = false,
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [wishlistActive, setWishlistActive] = useState(isWishlisted);
  const [adding, setAdding] = useState(false);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setWishlistActive(!wishlistActive);
    try {
      await api.post(`/wishlist/${product.id}`);
      if (onWishlistToggle) onWishlistToggle(product);
    } catch {
      setWishlistActive(wishlistActive);
    }
  };

  const handleAddToCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setAdding(true);
    try {
      await api.post('/cart/items', { productId: product.id, quantity: 1 });
      if (onAddToCart) onAddToCart(product);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setAdding(false), 600);
    }
  };

  return (
    <div className="group relative bg-white flex flex-col transition-all duration-300">
      {/* Product Image Container */}
      <Link
        href={`/product/${product.id}`}
        className="block relative aspect-[3/4] overflow-hidden bg-stone-100 rounded-lg shadow-sm"
      >
        <img
          src={product.primaryImageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.includes('photo-1610030469983-98e550d6193c')) {
              target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
            }
          }}
        />

        {/* Top Badges */}
        {product.discountPercentage > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-[#0A4D40] text-[#D4AF37] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm tracking-wider uppercase border border-[#D4AF37]/40">
              {product.discountPercentage}% OFF
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label="Save to Wishlist"
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-stone-600 hover:text-[#0A4D40] shadow transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${
              wishlistActive ? 'fill-[#0A4D40] text-[#0A4D40]' : 'text-stone-600'
            }`}
          />
        </button>

        {/* Hover Quick Add to Cart Button */}
        <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCartClick}
            disabled={!product.inStock || adding}
            className="w-full bg-white/95 hover:bg-[#0A4D40] text-stone-900 hover:text-[#D4AF37] font-semibold text-xs py-2 px-3 rounded-full shadow-md flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{adding ? 'Added to Bag!' : product.inStock ? 'Quick Add' : 'Sold Out'}</span>
          </button>
        </div>
      </Link>

      {/* Details Container */}
      <div className="pt-3 pb-1 flex flex-col space-y-1">
        <span className="text-[10px] uppercase tracking-widest text-[#0A4D40] font-semibold">
          NIVI COUTURE
        </span>

        <Link href={`/product/${product.id}`}>
          <h3 className="text-xs sm:text-sm font-medium text-stone-800 line-clamp-1 group-hover:text-[#0A4D40] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Pricing */}
        <div className="flex items-baseline space-x-2 pt-0.5 font-sans">
          <span className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight tabular-nums">
            ₹{product.sellingPrice?.toLocaleString('en-IN')}
          </span>
          {product.mrp > product.sellingPrice && (
            <>
              <span className="text-xs font-medium text-stone-400 line-through tabular-nums">
                ₹{product.mrp?.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-bold text-[#0A4D40] tabular-nums">
                ({product.discountPercentage}% OFF)
              </span>
            </>
          )}
        </div>

        {product.rating > 0 && (
          <div className="flex items-center text-amber-500 text-[10px] pt-0.5">
            <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
            <span className="font-semibold text-stone-700">{product.rating}</span>
            <span className="text-stone-400 ml-1">({product.reviewCount})</span>
          </div>
        )}
      </div>
    </div>
  );
};
