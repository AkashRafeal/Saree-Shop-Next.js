'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Users, 
  ShoppingCart, 
  Boxes, 
  TicketPercent, 
  Star, 
  Image as ImageIcon, 
  BarChart3, 
  Settings,
  ExternalLink,
  ChevronDown,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hydrate } = useAuthStore();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    logout();
    router.push('/login');
  };

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Administrator';
  const displayEmail = user?.email || 'admin@nivicouture.com';
  const avatarLetter = (user?.firstName?.[0] || 'A').toUpperCase();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Layers },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Inventory', href: '/admin/inventory', icon: Boxes },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Coupons', href: '/admin/coupons', icon: TicketPercent },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Banners', href: '/admin/banners', icon: ImageIcon },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#FAF8F5] text-stone-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-950 text-stone-200 flex flex-col border-r border-stone-800/80 shadow-xl shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-sm">
          <Link
            href="/admin"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            aria-label="Return to Admin Dashboard"
            className="flex items-center gap-2.5 group cursor-pointer select-none no-underline hover:no-underline border-none bg-transparent outline-none focus:outline-none focus-visible:outline-none transition-opacity duration-200 hover:opacity-90"
          >
            <img
              src="/logo.png"
              alt="NiVi Couture"
              className="w-10 h-10 rounded-full object-cover shadow-sm border border-[#D4AF37]"
            />
            <div className="flex flex-col">
              <span className="font-serif text-base font-bold tracking-wider text-white uppercase select-none leading-tight">
                NiVi <span className="text-[#D4AF37]">Couture</span>
              </span>
              <span className="text-[8.5px] tracking-[0.2em] text-[#D4AF37]/80 font-sans uppercase font-medium select-none">
                Atelier Administration
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0A4D40] to-[#062E28] text-[#D4AF37] font-bold shadow-lg shadow-[#062E28]/40 scale-[1.02] border border-[#D4AF37]/30'
                    : 'text-stone-400 hover:text-white hover:bg-stone-900/90'
                }`}
              >
                <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-[#D4AF37]' : 'text-stone-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-stone-200/80 px-8 flex items-center justify-between shadow-xs sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="font-serif text-lg font-bold text-stone-900 tracking-tight no-underline hover:text-[#0A4D40] transition-colors cursor-pointer"
            >
              NiVi Couture Administration
            </Link>
            <span className="hidden md:inline-block text-[11px] font-sans font-medium text-stone-400 bg-stone-100 px-2.5 py-0.5 rounded-full">
              v1.0 • Luxury Atelier
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              System Live
            </span>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-stone-700 hover:text-[#0A4D40] bg-stone-100 hover:bg-[#FFF0F5] border border-stone-200/80 hover:border-[#0A4D40]/30 rounded-full transition-all duration-200 shadow-xs group"
              title="Open customer storefront in a new tab"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#0A4D40] transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Profile Dropdown Container */}
            <div className="relative pl-4 border-l border-stone-200" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 pr-2 rounded-full hover:bg-stone-50 transition cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20"
                aria-expanded={isProfileDropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A4D40] to-[#031D19] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {avatarLetter}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-stone-800 leading-tight">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {displayEmail}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200/90 py-2 z-50 animate-fadeIn">
                  {/* User Profile Header */}
                  <div className="px-4 py-2.5 border-b border-stone-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0A4D40] to-[#031D19] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {avatarLetter}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-[10px] text-stone-400 font-mono truncate">
                        {displayEmail}
                      </p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#0A4D40]/10 text-[#0A4D40]">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        {user?.role === 'ROLE_ADMIN' ? 'Super Admin' : 'Admin'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="py-1">
                    <Link
                      href="/admin/settings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-xs font-medium text-stone-700 hover:bg-[#FAF8F5] hover:text-[#0A4D40] transition gap-2.5"
                    >
                      <Settings className="w-4 h-4 text-stone-400" />
                      <span>Admin Settings</span>
                    </Link>
                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-xs font-medium text-stone-700 hover:bg-[#FAF8F5] hover:text-[#0A4D40] transition gap-2.5"
                    >
                      <ExternalLink className="w-4 h-4 text-stone-400" />
                      <span>View Storefront</span>
                    </Link>
                  </div>

                  <div className="border-t border-stone-100 my-1" />

                  {/* Logout Action */}
                  <div className="px-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
