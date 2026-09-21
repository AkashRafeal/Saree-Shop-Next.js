'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  User, 
  Home,
  Menu, 
  X, 
  LogOut, 
  ShieldCheck, 
  ShoppingCart,
  PhoneCall,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import logoImg from '@/assets/logo.png';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout, hydrate } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Fetch cart & wishlist count
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/cart')
        .then((res) => setCartCount(res.data?.data?.totalItems || 0))
        .catch(() => {});
      api.get('/wishlist')
        .then((res) => setWishlistCount(res.data?.data?.totalItems || 0))
        .catch(() => {});
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [isAuthenticated]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';

  const navLinks = [
    { name: 'HOME', href: '/' },
    { name: 'ALL SAREES', href: '/shop' },
    { name: 'NEW ARRIVALS', href: '/shop?category=new-arrivals' },
    { name: 'SILK SAREES', href: '/shop?category=kanchipuram-silk' },
    { name: 'BANARASI', href: '/shop?category=banarasi-silk' },
    { name: 'WEDDING COLLECTION', href: '/shop?category=bridal-sarees' },
    { name: 'COTTON & LINEN', href: '/shop?category=cotton-linen' },
    { name: 'SALE / OFFERS', href: '/shop?sale=true' },
    { name: 'REVIEWS', href: '/reviews' },
  ];

  const isLinkActive = (href: string) => {
    const currentPath = pathname || '';
    const cat = searchParams?.get('category');
    const occ = searchParams?.get('occasion');
    const isSale = searchParams?.get('sale') === 'true';

    // 1. Home
    if (href === '/') {
      return currentPath === '/' && (!searchParams || searchParams.toString() === '');
    }

    // 2. Reviews Page
    if (href === '/reviews') {
      return currentPath === '/reviews';
    }

    // 3. New Arrivals
    if (href.includes('category=new-arrivals')) {
      return currentPath === '/shop' && cat === 'new-arrivals';
    }

    // 4. Specific Categories
    if (href.includes('category=kanchipuram-silk')) {
      return currentPath === '/shop' && (cat === 'kanchipuram-silk' || cat === 'silk-sarees');
    }
    if (href.includes('category=banarasi-silk')) {
      return currentPath === '/shop' && (cat === 'banarasi-silk' || cat === 'banarasi');
    }
    if (href.includes('category=bridal-sarees')) {
      return currentPath === '/shop' && (cat === 'bridal-sarees' || cat === 'wedding' || occ === 'Bridal' || occ === 'Wedding');
    }
    if (href.includes('category=cotton-linen')) {
      return currentPath === '/shop' && (cat === 'cotton-linen' || cat === 'cotton');
    }

    // 5. Sale / Offers
    if (href.includes('sale=true')) {
      return currentPath === '/shop' && isSale;
    }

    // 6. All Sarees / Shop catalog
    if (href === '/shop') {
      return currentPath === '/shop' && !cat && !isSale;
    }

    const currentSearch = searchParams?.toString();
    const currentFull = currentSearch ? `${currentPath}?${currentSearch}` : currentPath;
    return currentFull === href;
  };

  return (
    <>
      {/* Top Announcement Bar in Emerald & Gold */}
      <div className="bg-[#062E28] border-b border-[#0A4D40] text-[#D4AF37] text-[11px] sm:text-xs font-medium py-1.5 px-3 sm:px-4 text-center tracking-wide flex items-center justify-center space-x-2 overflow-hidden select-none">
        <PhoneCall className="w-3 h-3 text-[#D4AF37] shrink-0" />
        <span className="hidden sm:inline truncate">
          For bespoke styling & bridal trousseau consultations, WhatsApp us at <strong>+971 50 123 4567</strong> • Express Delivery Across UAE & Worldwide
        </span>
        <span className="sm:hidden truncate text-[10.5px]">
          WhatsApp: <strong>+971 50 123 4567</strong> • Express Worldwide Delivery
        </span>
      </div>

      {/* Main Luxury Header */}
      <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-1.5 sm:gap-4">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (mobileSearchOpen) setMobileSearchOpen(false);
              }}
              className="lg:hidden p-1.5 text-stone-700 hover:text-[#0A4D40] hover:bg-stone-100 rounded-lg transition-colors shrink-0 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            {/* Brand Logo - NiVi Couture */}
            <Link
              href="/"
              onClick={() => {
                setMobileMenuOpen(false);
                setMobileSearchOpen(false);
                if (typeof window !== 'undefined') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              aria-label="NiVi Couture Home"
              className="flex items-center gap-2 sm:gap-3 shrink-0 cursor-pointer select-none no-underline hover:no-underline border-none bg-transparent outline-none focus:outline-none focus-visible:outline-none transition-opacity duration-200 hover:opacity-95 group min-w-0"
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
                className="w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full object-cover shadow-sm md:shadow-md ring-1.5 sm:ring-2 ring-[#D4AF37]/50 shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-serif text-base sm:text-2xl md:text-3xl tracking-wide sm:tracking-widest font-extrabold text-[#062E28] uppercase leading-tight select-none whitespace-nowrap">
                  NiVi <span className="text-[#D4AF37]">Couture</span>
                </span>
                <span className="hidden min-[400px]:block text-[7px] sm:text-[9px] tracking-[0.14em] sm:tracking-[0.25em] uppercase text-[#0A4D40] font-sans -mt-0.5 font-semibold select-none whitespace-nowrap">
                  Elegance Refined, Soul Defined
                </span>
              </div>
            </Link>

            {/* Center Pill Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-lg mx-4">
              <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
                <Search className="w-4 h-4 text-stone-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for pure silk, Banarasi, Kanchipuram, bridal drapes..."
                  className="w-full pl-10 pr-20 py-2.5 bg-stone-100 hover:bg-stone-100/80 focus:bg-white border border-transparent focus:border-[#0A4D40] rounded-full text-xs text-stone-800 placeholder-stone-400 focus:outline-none transition shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 bg-[#0A4D40] hover:bg-[#062E28] text-[#D4AF37] text-[11px] font-bold px-4 py-1.5 rounded-full transition shadow-sm"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Right Action Icons: Mobile Search Toggle, Wishlist, Cart, User Account */}
            <div className="flex items-center space-x-1.5 sm:space-x-4 md:space-x-6 shrink-0">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => {
                  setMobileSearchOpen(!mobileSearchOpen);
                  if (mobileMenuOpen) setMobileMenuOpen(false);
                }}
                className="md:hidden p-1.5 text-stone-700 hover:text-[#0A4D40] hover:bg-stone-100 rounded-full transition-colors focus:outline-none"
                aria-label="Search sarees"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="p-1.5 text-stone-700 hover:text-[#0A4D40] hover:bg-stone-100 rounded-full transition-colors relative focus:outline-none"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#0A4D40] text-[#D4AF37] text-[9px] sm:text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ring-1 ring-[#D4AF37]/50">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Bag */}
              <Link
                href="/cart"
                aria-label="Cart"
                className="p-1.5 text-stone-700 hover:text-[#0A4D40] hover:bg-stone-100 rounded-full transition-colors relative focus:outline-none"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#0A4D40] text-[#D4AF37] text-[9px] sm:text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ring-1 ring-[#D4AF37]/50">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Account */}
              <div className="relative">
                {isAuthenticated ? (
                  <div>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center space-x-1 sm:space-x-2 py-0.5 px-1 sm:py-1 sm:px-2.5 rounded-full border border-stone-200 hover:border-[#0A4D40] bg-stone-50 hover:bg-white transition-all shadow-xs group focus:outline-none"
                      aria-label="User Account"
                    >
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0A4D40] text-[#D4AF37] font-serif text-[11px] sm:text-xs font-bold flex items-center justify-center shadow-xs ring-1 ring-[#D4AF37]/50 uppercase">
                        {user?.firstName?.charAt(0) || 'U'}
                      </div>
                      <div className="hidden md:flex flex-col text-left">
                        <span className="text-[9px] uppercase tracking-wider text-stone-400 font-semibold leading-none">Account</span>
                        <span className="text-xs font-bold text-[#062E28] group-hover:text-[#0A4D40] leading-tight truncate max-w-[90px]">
                          {user?.firstName || 'Customer'}
                        </span>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-stone-400 group-hover:text-[#0A4D40] transition-transform duration-200 hidden sm:block ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 sm:mt-3 w-52 sm:w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 divide-y divide-stone-100">
                        <div className="px-4 py-2.5 bg-stone-50/60">
                          <p className="text-xs font-bold text-[#062E28] truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                          <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#0A4D40]/10 text-[#0A4D40]">
                            {isAdmin ? 'Administrator' : 'Valued Patron'}
                          </span>
                        </div>

                        <div className="py-1 text-xs">
                          <Link
                            href="/my-orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-stone-700 hover:bg-stone-50 hover:text-[#0A4D40]"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2.5 text-stone-400" />
                            My Orders & Tracking
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-[#0A4D40] font-semibold hover:bg-stone-50"
                            >
                              <ShieldCheck className="w-4 h-4 mr-2.5 text-[#0A4D40]" />
                              Admin Portal
                            </Link>
                          )}
                        </div>

                        <div className="py-1">
                          <button
                            onClick={() => {
                              logout();
                              setUserDropdownOpen(false);
                              router.push('/login');
                            }}
                            className="w-full flex items-center px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
                          >
                            <LogOut className="w-4 h-4 mr-2.5" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="p-1.5 text-stone-700 hover:text-[#0A4D40] hover:bg-stone-100 rounded-full transition-colors flex items-center justify-center focus:outline-none"
                    aria-label="Login"
                  >
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Expandable Mobile Search Bar */}
          {mobileSearchOpen && (
            <div className="md:hidden py-2 px-1 border-t border-stone-100 animate-fadeIn">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search silk, Banarasi, Kanchipuram..."
                  className="w-full pl-9 pr-16 py-1.5 bg-stone-100 border border-stone-200 focus:bg-white focus:border-[#0A4D40] rounded-full text-xs text-stone-800 placeholder-stone-400 focus:outline-none transition shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute right-1 bg-[#0A4D40] hover:bg-[#062E28] text-[#D4AF37] text-[10px] font-bold px-3 py-1 rounded-full transition shadow-xs"
                >
                  Search
                </button>
              </form>
            </div>
          )}

          {/* Sub Navigation Bar with Exact Category Tabs (Desktop) */}
          <nav className="hidden lg:flex items-center justify-center space-x-6 xl:space-x-7 py-1.5 border-t border-stone-100 text-[11px] font-semibold tracking-wider">
            {navLinks.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative transition-all uppercase py-1.5 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 select-none ${
                    active
                      ? 'text-[#0A4D40] font-bold'
                      : 'text-stone-700 font-semibold hover:text-[#0A4D40]'
                  }`}
                >
                  <span>{item.name}</span>
                  {active && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#D4AF37] rounded-full shadow-sm shadow-[#D4AF37]/40" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-stone-200 px-4 pt-4 pb-6 space-y-3 shadow-lg max-h-[calc(100vh-4.5rem)] overflow-y-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-3">
              <Search className="w-4 h-4 text-stone-400 absolute left-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sarees..."
                className="w-full pl-9 pr-4 py-2 bg-stone-100 border border-transparent rounded-lg text-xs focus:border-[#0A4D40]"
              />
            </form>

            <div className="space-y-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (typeof window !== 'undefined') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wider transition outline-none focus:outline-none focus-visible:outline-none focus:ring-0 select-none ${
                      active
                        ? 'bg-emerald-50 text-[#0A4D40] font-bold border-l-4 border-[#0A4D40]'
                        : 'text-stone-800 hover:bg-stone-50 hover:text-[#0A4D40]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {link.name === 'HOME' && <Home className={`w-4 h-4 ${active ? 'text-[#0A4D40]' : 'text-stone-400'}`} />}
                      <span>{link.name}</span>
                    </div>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-[#0A4D40]" />}
                  </Link>
                );
              })}
            </div>

            {/* Quick Customer Links on Mobile */}
            <div className="pt-3 border-t border-stone-100 space-y-1">
              <Link
                href="/my-orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 px-3 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-stone-400" />
                  <span>My Orders & Tracking</span>
                </div>
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 px-3 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-stone-400" />
                  <span>Saved Wishlist ({wishlistCount})</span>
                </div>
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-[#0A4D40] bg-[#0A4D40]/5"
                >
                  <ShieldCheck className="w-4 h-4 text-[#0A4D40]" />
                  <span>Admin Portal</span>
                </Link>
              )}
            </div>

            {/* Login / Profile CTA in Mobile Menu */}
            {!isAuthenticated && (
              <div className="pt-2 border-t border-stone-100 flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-bold bg-[#0A4D40] text-[#D4AF37] rounded-lg shadow-xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-bold border border-stone-300 text-stone-800 rounded-lg hover:bg-stone-50"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
