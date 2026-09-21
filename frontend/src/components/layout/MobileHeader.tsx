'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, Search, X, Heart, ShoppingBag } from 'lucide-react';
import { useBadgeStore } from '@/store/badgeStore';
import logoImg from '@/assets/logo.png';

export const MobileHeader: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, wishlistCount } = useBadgeStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentPath = pathname || '';
  const isHome = currentPath === '/';

  // Determine subpage title
  const getPageTitle = () => {
    if (currentPath.startsWith('/product/')) return 'Product Details';
    if (currentPath === '/cart') return 'Shopping Bag';
    if (currentPath === '/wishlist') return 'My Wishlist';
    if (currentPath === '/checkout') return 'Checkout';
    if (currentPath.startsWith('/my-orders/')) return 'Order Details';
    if (currentPath === '/my-orders') return 'My Orders';
    if (currentPath === '/shop') return 'Saree Collection';
    if (currentPath === '/reviews') return 'Client Reviews';
    if (currentPath === '/login') return 'Welcome Back';
    if (currentPath === '/register') return 'Create Account';
    return '';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const pageTitle = getPageTitle();

  return (
    <>
      <header
        className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left section: Back button or Brand */}
          <div className="flex items-center space-x-2">
            {!isHome && (
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="p-2 -ml-2 text-stone-700 hover:text-[#0A4D40] transition-colors rounded-full active:bg-stone-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {isHome ? (
              <Link
                href="/"
                className="flex items-center gap-2 select-none no-underline border-none bg-transparent"
              >
                <img
                  src={typeof logoImg === 'string' ? logoImg : (logoImg as any)?.src || '/logo.png'}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== '/logo.png') {
                      target.src = '/logo.png';
                    }
                  }}
                  alt="NiVi Couture"
                  className="w-9 h-9 rounded-full object-cover shadow-sm ring-1 ring-[#D4AF37]/50"
                />
                <div className="flex flex-col">
                  <span className="font-serif text-lg font-extrabold text-[#062E28] uppercase tracking-wider leading-none">
                    NiVi <span className="text-[#D4AF37]">Couture</span>
                  </span>
                  <span className="text-[7.5px] uppercase tracking-[0.2em] text-[#0A4D40] font-sans font-semibold">
                    Elegance Refined
                  </span>
                </div>
              </Link>
            ) : (
              <h1 className="font-serif text-base font-bold text-stone-900 truncate max-w-[200px]">
                {pageTitle}
              </h1>
            )}
          </div>

          {/* Right section: Search trigger + Quick Cart/Wishlist */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="p-2 text-stone-700 hover:text-[#0A4D40] transition-colors rounded-full active:bg-stone-100"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="p-2 text-stone-700 hover:text-[#0A4D40] transition-colors relative rounded-full active:bg-stone-100"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#0A4D40] text-[#D4AF37] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs ring-1 ring-[#D4AF37]/50">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              aria-label="Cart"
              className="p-2 text-stone-700 hover:text-[#0A4D40] transition-colors relative rounded-full active:bg-stone-100"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#0A4D40] text-[#D4AF37] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs ring-1 ring-[#D4AF37]/50">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Search Overlay */}
      {searchOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col p-4 animate-fadeIn">
          <div className="flex items-center gap-2 pb-4 border-b border-stone-200">
            <button
              onClick={() => setSearchOpen(false)}
              className="p-2 text-stone-600 hover:text-stone-900"
              aria-label="Close search"
            >
              <X className="w-6 h-6" />
            </button>
            <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Banarasi, Silk, Bridal..."
                className="w-full pl-4 pr-10 py-2.5 bg-stone-100 rounded-full text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/30"
              />
              <button
                type="submit"
                className="absolute right-2 text-[#D4AF37] bg-[#0A4D40] p-1.5 rounded-full"
                aria-label="Execute search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Trending Searches */}
          <div className="py-6 space-y-3">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
              Popular Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                'Kanchipuram Silk',
                'Banarasi Brocade',
                'Bridal Red',
                'Tussar Silk',
                'Organza Pastel',
                'Chanderi',
                'Cocktail Georgette',
              ].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    router.push(`/shop?search=${encodeURIComponent(tag)}`);
                    setSearchOpen(false);
                  }}
                  className="px-3.5 py-1.5 bg-stone-100 hover:bg-emerald-50 hover:text-[#0A4D40] rounded-full text-xs font-medium text-stone-700 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
