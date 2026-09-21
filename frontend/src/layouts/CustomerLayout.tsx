'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import logoImg from '@/assets/logo.png';
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  MapPin, 
  Phone, 
  Mail, 
  Check
} from 'lucide-react';

interface CustomerLayoutProps {
  children?: React.ReactNode;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const hideFooter = pathname === '/login' || pathname === '/register';

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-stone-800 antialiased overflow-x-clip w-full">
      {/* Main Website Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Luxury Footer (Hidden on Login & Register Pages) */}
      {!hideFooter && (
        <footer className="bg-stone-50 border-t border-stone-200 text-stone-600 text-xs pt-7 pb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-5">
              {/* Column 1: About NiVi Couture */}
              <div className="space-y-2.5">
                <Link
                  href="/"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  aria-label="NiVi Couture Home"
                  className="inline-flex items-center gap-2.5 cursor-pointer select-none no-underline hover:no-underline border-none bg-transparent outline-none focus:outline-none focus-visible:outline-none transition-opacity duration-200 hover:opacity-90 group"
                >
                  <img
                    src={typeof logoImg === 'string' ? logoImg : (logoImg as any)?.src || '/logo.png'}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== '/logo.png') {
                        target.src = '/logo.png';
                      }
                    }}
                    alt="NiVi Couture Logo"
                    className="w-10 h-10 rounded-full object-cover shadow-sm border border-[#D4AF37]/50"
                  />
                  <div className="flex flex-col">
                    <span className="font-serif text-lg font-bold text-[#062E28] uppercase tracking-wider block leading-tight select-none">
                      NiVi <span className="text-[#D4AF37]">Couture</span>
                    </span>
                    <span className="text-[8.5px] uppercase tracking-[0.2em] text-[#0A4D40]/80 block font-sans select-none">
                      Elegance Refined, Soul Defined
                    </span>
                  </div>
                </Link>
                <p className="text-stone-500 leading-snug text-[10.5px]">
                  Exquisite artisanal couture blending pure heritage silk craftsmanship with modern designer silhouettes.
                </p>

                {/* Social Icons */}
                <div className="flex items-center space-x-2 text-stone-400">
                  <a href="#instagram" aria-label="Instagram" className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:text-[#0A4D40] hover:border-[#0A4D40] transition shadow-2xs">
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                  <a href="#facebook" aria-label="Facebook" className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:text-[#0A4D40] hover:border-[#0A4D40] transition shadow-2xs">
                    <Facebook className="w-3.5 h-3.5" />
                  </a>
                  <a href="#youtube" aria-label="YouTube" className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:text-[#0A4D40] hover:border-[#0A4D40] transition shadow-2xs">
                    <Youtube className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Payment Methods */}
                <div className="pt-0.5">
                  <div className="flex items-center space-x-1.5 text-stone-500">
                    <span className="px-1.5 py-0.5 bg-white border border-stone-200 rounded text-[9px] font-bold font-mono">VISA</span>
                    <span className="px-1.5 py-0.5 bg-white border border-stone-200 rounded text-[9px] font-bold font-mono">MasterCard</span>
                    <span className="px-1.5 py-0.5 bg-white border border-stone-200 rounded text-[9px] font-bold font-mono">RuPay</span>
                    <span className="px-1.5 py-0.5 bg-white border border-stone-200 rounded text-[9px] font-bold font-mono">UPI</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Shop Online */}
              <div>
                <h4 className="font-serif text-xs font-bold text-[#062E28] uppercase tracking-wider mb-2">
                  Shop Online
                </h4>
                <ul className="space-y-1.5 text-[11px] text-stone-500">
                  <li><Link href="/shop?sort=newest" className="hover:text-[#0A4D40] transition">New Arrivals</Link></li>
                  <li><Link href="/shop?category=kanchipuram-silk" className="hover:text-[#0A4D40] transition">Pure Silk Sarees</Link></li>
                  <li><Link href="/shop?category=banarasi-silk" className="hover:text-[#0A4D40] transition">Designer Banarasi</Link></li>
                  <li><Link href="/shop?category=bridal-sarees" className="hover:text-[#0A4D40] transition">Bridal Trousseau</Link></li>
                  <li><Link href="/shop?occasion=Festive" className="hover:text-[#0A4D40] transition">Festive Collection</Link></li>
                  <li><Link href="/shop" className="hover:text-[#0A4D40] transition">Exclusive Sale</Link></li>
                </ul>
              </div>

              {/* Column 3: Customer Care */}
              <div>
                <h4 className="font-serif text-xs font-bold text-[#062E28] uppercase tracking-wider mb-2">
                  Customer Care
                </h4>
                <ul className="space-y-1.5 text-[11px] text-stone-500">
                  <li><Link href="/my-orders" className="hover:text-[#0A4D40] transition">Track Order</Link></li>
                  <li><Link href="/my-orders" className="hover:text-[#0A4D40] transition">Return & Exchange</Link></li>
                  <li><Link href="/shop" className="hover:text-[#0A4D40] transition">Shipping Policy</Link></li>
                  <li><Link href="/shop" className="hover:text-[#0A4D40] transition">Terms & Conditions</Link></li>
                  <li><Link href="/shop" className="hover:text-[#0A4D40] transition">Privacy Policy</Link></li>
                  <li><a href="mailto:care@nivicouture.com" className="hover:text-[#0A4D40] transition">Contact Us</a></li>
                </ul>
              </div>

              {/* Column 4: Stay Connected */}
              <div className="space-y-2">
                <h4 className="font-serif text-xs font-bold text-[#062E28] uppercase tracking-wider">
                  Stay Connected
                </h4>
                <p className="text-[10.5px] text-stone-500 leading-snug">
                  Receive exclusive festive previews & VIP discounts.
                </p>

                {/* Subscribe Box */}
                {subscribed ? (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 text-[#062E28] rounded-lg text-[10px] flex items-center space-x-1.5 font-medium">
                    <Check className="w-3 h-3 text-[#0A4D40]" />
                    <span>Subscribed to VIP previews!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="relative flex items-center">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-3.5 pr-16 py-2 bg-white border border-stone-300 focus:border-[#0A4D40] rounded-full text-[11px] focus:outline-none transition shadow-inner"
                    />
                    <button
                      type="submit"
                      className="absolute right-1 bg-[#0A4D40] hover:bg-[#062E28] text-[#D4AF37] font-semibold text-[10px] px-3.5 py-1.5 rounded-full transition shadow-sm tracking-wider cursor-pointer"
                    >
                      JOIN
                    </button>
                  </form>
                )}

                <div className="space-y-1 pt-1 text-[10.5px] text-stone-500">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0" />
                    <span className="truncate">Fashion Avenue, The Dubai Mall, Downtown Dubai, UAE</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3 h-3 text-[#D4AF37] shrink-0" />
                    <span>+971 4 345 6789</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-3 h-3 text-[#D4AF37] shrink-0" />
                    <span>care@nivicouture.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Searches Bar */}
            <div className="border-t border-stone-200 pt-3 pb-2 text-center">
              <p className="text-[9px] text-stone-400 leading-snug uppercase tracking-wider">
                <strong>POPULAR SEARCHES:</strong> Banarasi Silk • Kanchipuram Silk • Party Wear • Organza • Floral Sarees • Daily Cotton • Wedding Lehengas • Chanderi • Tussar • Georgette • Embroidered • Silk Mark
              </p>
            </div>

            {/* Copyright */}
            <div className="border-t border-stone-200 pt-2 text-center text-[10px] text-stone-400">
              © {new Date().getFullYear()} NiVi Couture Atelier. All Rights Reserved. Elegance Refined, Soul Defined.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
