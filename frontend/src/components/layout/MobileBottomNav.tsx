'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useBadgeStore } from '@/store/badgeStore';

export const MobileBottomNav: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { cartCount, wishlistCount, fetchCounts } = useBadgeStore();
  const pathname = usePathname();

  useEffect(() => {
    fetchCounts();
  }, [pathname, isAuthenticated, fetchCounts]);

  const navItems = [
    {
      label: 'Home',
      to: '/',
      icon: Home,
      exact: true,
    },
    {
      label: 'Explore',
      to: '/shop',
      icon: Compass,
      exact: false,
    },
    {
      label: 'Wishlist',
      to: '/wishlist',
      icon: Heart,
      badge: wishlistCount,
      exact: false,
    },
    {
      label: 'Bag',
      to: '/cart',
      icon: ShoppingBag,
      badge: cartCount,
      exact: false,
    },
    {
      label: isAuthenticated ? 'Profile' : 'Login',
      to: isAuthenticated ? '/my-orders' : '/login',
      icon: User,
      exact: false,
    },
  ];

  // Optional lightweight vibration trigger on tap
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-stone-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] transition-all duration-300"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))',
      }}
    >
      <div className="grid grid-cols-5 items-center h-14 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.to
            : Boolean(pathname && pathname.startsWith(item.to));

          const IconComponent = item.icon;

          return (
            <Link
              key={item.label}
              href={item.to}
              onClick={triggerHaptic}
              className={`relative flex flex-col items-center justify-center py-1 group select-none transition-colors duration-200 ${
                isActive ? 'text-[#0A4D40]' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative">
                <IconComponent
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.25]' : 'group-hover:scale-105'
                  }`}
                />

                {/* Badge for Wishlist or Cart */}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-[#0A4D40] text-[#D4AF37] text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs ring-1 ring-[#D4AF37]/50 animate-scaleUp">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-0.5 tracking-wider font-sans uppercase transition-all duration-200 ${
                  isActive ? 'font-bold text-[#0A4D40]' : 'font-medium text-stone-500'
                }`}
              >
                {item.label}
              </span>

              {/* Active Tab Accent Bar */}
              {isActive && (
                <span className="absolute -bottom-1 w-6 h-0.5 bg-[#D4AF37] rounded-full shadow-xs shadow-[#D4AF37]/50 animate-fadeIn" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
