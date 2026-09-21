'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

export const WishlistPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, router]);

  const fetchWishlist = () => {
    setLoading(true);
    api.get('/wishlist')
      .then((res) => setProducts(res.data?.data?.products || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleRemove = async (productId: number) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToCart = async (productId: number) => {
    try {
      await api.post(`/wishlist/${productId}/move-to-cart`);
      setProducts(products.filter((p) => p.id !== productId));
      router.push('/cart');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-8 bg-stone-200 rounded w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-80 bg-stone-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">Your Wishlist Is Empty</h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Explore our handloom creations and save your favored silks to admire later.
        </p>
        <div>
          <Link
            href="/shop"
            className="inline-flex items-center space-x-2 bg-[#0A4D40] hover:bg-[#062E28] text-white font-bold text-xs py-3.5 px-8 rounded-full uppercase tracking-wider transition shadow-lg shadow-[#0A4D40]/20"
          >
            <span>Explore Sarees</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#0A4D40]">
          Saved Heirlooms
        </span>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
          My Wishlist ({products.length} Items)
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between">
            <Link href={`/product/${product.id}`} className="block relative aspect-[3/4] bg-stone-100">
              <img
                src={product.primaryImageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </Link>

            <div className="p-4 space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A4D40]">
                  {product.categoryName}
                </span>
                <h3 className="font-serif text-sm font-semibold text-stone-900 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm font-bold text-stone-900 mt-1">
                  ₹{product.sellingPrice.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <button
                  onClick={() => handleMoveToCart(product.id)}
                  className="flex-1 bg-[#0A4D40] hover:bg-[#062E28] text-white text-[11px] font-bold py-2.5 px-4 rounded-full flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move To Cart</span>
                </button>
                <button
                  onClick={() => handleRemove(product.id)}
                  className="w-9 h-9 rounded-full border border-stone-200 text-stone-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
