'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight,
  Sparkles, 
  Star, 
  ShieldCheck, 
  Award, 
  Truck, 
  RotateCcw, 
  ArrowRight
} from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types';
import api from '@/services/api';
import DepthCarousel from '@/components/ui/DepthCarousel';

export const HomePage: React.FC = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSlide, setHeroSlide] = useState(0);

  // Hero carousel slides
  const heroSlides = useMemo(() => [
    {
      titlePart1: 'Elegance',
      titlePart2: 'Redefined.',
      description: 'Discover a curated collection of artisanal sarees and designer ensembles, where heritage craftsmanship meets modern silhouettes.',
      cta: 'SHOP COLLECTION',
      href: '/shop',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
      badge: 'HERITAGE WEAVES • 2026',
      alt: 'Kanchipuram Silk Saree',
    },
    {
      titlePart1: 'Royal',
      titlePart2: 'Banarasi Brocade.',
      description: 'Handwoven in Varanasi using pure zari gold threads, crafted for the regal and celebratory moments of life.',
      cta: 'EXPLORE BANARASI',
      href: '/shop?category=banarasi-silk',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85',
      badge: 'BRIDAL TROUSSEAU',
      alt: 'Banarasi Brocade Saree',
    },
    {
      titlePart1: 'Timeless',
      titlePart2: 'Kanchipuram Silks.',
      description: 'Heavy pure mulberry silk sarees with contrasting korvai borders and intricate temple motifs.',
      cta: 'DISCOVER SILKS',
      href: '/shop?category=kanchipuram-silk',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85',
      badge: 'SILK MARK CERTIFIED',
      alt: 'Kanchipuram Pure Silk',
    },
    {
      titlePart1: 'Ethereal',
      titlePart2: 'Chanderi & Organza.',
      description: 'Lightweight gossamer weaves adorned with delicate zari booties and hand-painted floral motifs.',
      cta: 'EXPLORE CHANDERI',
      href: '/shop?category=chanderi-organza',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=85',
      badge: 'FEATHERLIGHT DRAPES',
      alt: 'Chanderi Saree',
    },
    {
      titlePart1: 'Artisanal',
      titlePart2: 'Tussar Wild Silks.',
      description: 'Natural textured wild silks celebrating organic earthy tones, kantha embroidery, and indigenous heritage.',
      cta: 'SHOP TUSSAR',
      href: '/shop?category=tussar-silk',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=85',
      badge: 'RAW ORGANIC WEAVES',
      alt: 'Tussar Wild Silk',
    },
    {
      titlePart1: 'Festive',
      titlePart2: 'Cocktail Georgette.',
      description: 'Contemporary festive draping with sparkling sequin work, scalloped cutwork borders, and flowing grace.',
      cta: 'VIEW FESTIVE EDIT',
      href: '/shop',
      image: '/images/teal_ethnic_suit_embroidered.jpg',
      badge: 'CELEBRITY PICKS',
      alt: 'Cocktail Saree',
    },
  ], []);

  const carouselItems = useMemo(
    () => heroSlides.map((s) => ({ image: s.image, alt: s.alt || s.titlePart1 })),
    [heroSlides]
  );

  // Circular Categories
  const circularCategories = [
    {
      name: 'SAREES',
      href: '/shop',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'SILK SAREES',
      href: '/shop?category=kanchipuram-silk',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'SUITS & DRESSES',
      href: '/shop?category=suits-dresses',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'GOWNS',
      href: '/shop?category=gowns',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'KURTI',
      href: '/shop?category=kurti',
      image: '/images/teal_ethnic_suit_embroidered.jpg',
    },
    {
      name: 'WEDDING COLLECTIONS',
      href: '/shop?category=bridal-sarees',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=300&q=80',
    },
  ];

  // Customer Reviews
  const reviews = [
    {
      id: 1,
      rating: 5.0,
      quote: "Beautiful saree, perfect fabric! I ordered for my sister's wedding and it arrived right on time. The fabric quality and zari work is exceptional.",
      author: 'Hetal Shah',
      location: 'India',
    },
    {
      id: 2,
      rating: 5.0,
      quote: "This is my second order from NiVi Collections. I loved them both! They arrived well packed with authentic Silk Mark certificates, exactly as shown in pictures.",
      author: 'Indu Vatsala',
      location: 'India',
    },
    {
      id: 3,
      rating: 5.0,
      quote: "Exquisite pure silk luster and heirloom drape. Good overall experience, and the WhatsApp customer support was very helpful with blouse design.",
      author: 'Rajnii M.',
      location: 'Australia',
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [newRes, featRes, fallbackRes] = await Promise.allSettled([
          api.get('/products/new-arrivals'),
          api.get('/products/featured'),
          api.get('/products?page=0&size=8'),
        ]);

        let arrivals: Product[] = [];
        let featured: Product[] = [];
        let fallback: Product[] = [];

        if (fallbackRes.status === 'fulfilled') {
          fallback = fallbackRes.value.data?.data?.content || [];
        }

        if (newRes.status === 'fulfilled' && Array.isArray(newRes.value.data?.data)) {
          arrivals = newRes.value.data.data;
        }
        if (featRes.status === 'fulfilled' && Array.isArray(featRes.value.data?.data)) {
          featured = featRes.value.data.data;
        }

        setNewArrivals(arrivals.length > 0 ? arrivals.slice(0, 4) : fallback.slice(0, 4));
        setFeaturedProducts(
          featured.length > 0
            ? featured.slice(0, 4)
            : fallback.length > 4
            ? fallback.slice(4, 8)
            : fallback.slice(0, 4)
        );
      } catch (err) {
        console.error('Failed to load homepage products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO 3D DEPTH CAROUSEL BANNER */}
      <section className="relative bg-[#F7F3EE] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[400px] sm:min-h-[440px] items-center pt-2 pb-5 md:pt-3 md:pb-6">
            {/* Left Content */}
            <div key={`text-${heroSlide}`} className="md:col-span-6 py-1 md:py-2 pr-0 md:pr-8 z-10 flex flex-col justify-center items-center md:items-start text-center md:text-left animate-fadeIn">
              <span className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-semibold mb-2 flex items-center justify-center md:justify-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0A4D40]" />
                {heroSlides[heroSlide].badge}
              </span>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-stone-900 leading-tight text-center md:text-left">
                {heroSlides[heroSlide].titlePart1}{' '}
                <span className="block font-serif font-bold text-[#0A4D40]">
                  {heroSlides[heroSlide].titlePart2}
                </span>
              </h1>

              <p className="mt-4 text-xs sm:text-sm text-stone-600 max-w-md leading-relaxed text-center md:text-left mx-auto md:mx-0">
                {heroSlides[heroSlide].description}
              </p>

              <div className="mt-8 flex items-center justify-center md:justify-start space-x-4 w-full md:w-auto">
                <Link
                  href={heroSlides[heroSlide].href}
                  className="inline-flex items-center px-8 py-3.5 bg-[#0A4D40] hover:bg-[#062E28] text-white text-xs font-semibold uppercase tracking-widest rounded-full transition-all shadow-md group"
                >
                  <span>{heroSlides[heroSlide].cta}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>

            {/* Right 3D DepthCarousel */}
            <div className="md:col-span-6 h-[440px] sm:h-[480px] md:h-[520px] relative w-full flex items-center justify-center">
              <DepthCarousel
                items={carouselItems}
                cardWidth={280}
                cardHeight={380}
                radius={18}
                depth={220}
                spread={90}
                tilt={22}
                tiltDirection="right"
                perspective={1400}
                visibleCards={4}
                falloff={0.2}
                blur={6}
                autoplay={true}
                autoplayDelay={5000}
                loop={true}
                showControls={false}
                showIndicators={false}
                tint="#20030a"
                onChange={(idx) => setHeroSlide(idx)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CELEBRATE EVERY OCCASION IN STYLE - Shop By Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-500 block">
          CELEBRATE EVERY OCCASION IN STYLE
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 mt-1">
          Shop By <span className="text-[#0A4D40] font-bold">Category</span>
        </h2>

        {/* Circular Avatars Carousel / Grid */}
        <div className="mt-6 sm:mt-8 overflow-x-auto py-2 px-3 sm:px-4 no-scrollbar scroll-smooth">
          <div className="flex items-center justify-start md:justify-center space-x-4 sm:space-x-8 min-w-max mx-auto px-2">
            {circularCategories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="flex flex-col items-center group shrink-0 focus:outline-none"
              >
                <div className="w-[72px] h-[72px] sm:w-24 sm:h-24 rounded-full overflow-hidden p-0.5 border-2 border-stone-200/80 group-hover:border-[#0A4D40] transition-all duration-300 shadow-sm group-hover:shadow-md">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className="mt-2.5 text-[10px] sm:text-xs font-bold tracking-wider text-stone-800 uppercase group-hover:text-[#0A4D40] transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SHOP BY OCCASION (Mosaic Bento Grid Matching Reference Image) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl sm:text-2xl text-stone-900">
            Shop By <span className="text-[#0A4D40] font-bold">Occasion</span>
          </h2>
          <Link
            href="/shop"
            className="text-[11px] font-bold text-stone-600 hover:text-[#0A4D40] uppercase tracking-wider inline-flex items-center transition"
          >
            <span>VIEW ALL OCCASIONS</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5 text-[#0A4D40]" />
          </Link>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {/* Left Tall Card - The Wedding Edit */}
          <Link
            href="/shop?category=bridal-sarees"
            className="group relative md:col-span-1 md:row-span-2 h-96 md:h-auto rounded-xl overflow-hidden bg-stone-100 shadow-sm transition-all duration-500 hover:shadow-[0_16px_36px_-6px_rgba(212,175,55,0.45),0_0_20px_rgba(212,175,55,0.2)] hover:-translate-y-1"
          >
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
              alt="The Wedding Edit"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
              <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#F3E5AB] transition-colors">The Wedding Edit</h3>
              <span className="text-[11px] font-semibold text-rose-200 mt-1 flex items-center group-hover:text-white transition-colors uppercase tracking-wider">
                <span>SHOP BRIDAL</span>
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>

          {/* Middle Top Card - Haldi & Mehendi */}
          <Link
            href="/shop?occasion=Haldi"
            className="group relative md:col-span-2 h-44 sm:h-52 rounded-xl overflow-hidden bg-stone-100 shadow-sm transition-all duration-500 hover:shadow-[0_16px_36px_-6px_rgba(212,175,55,0.45),0_0_20px_rgba(212,175,55,0.2)] hover:-translate-y-1"
          >
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
              alt="Haldi & Mehendi"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
              <h3 className="font-serif text-base font-bold text-white group-hover:text-[#F3E5AB] transition-colors">Haldi & Mehendi</h3>
              <span className="text-[11px] font-semibold text-yellow-200 mt-0.5 flex items-center group-hover:text-white transition-colors uppercase tracking-wider">
                <span>SHOP YELLOWS & GREENS</span>
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>

          {/* Right Top Card - Cocktail Night */}
          <Link
            href="/shop?occasion=Party"
            className="group relative md:col-span-1 h-44 sm:h-52 rounded-xl overflow-hidden bg-stone-100 shadow-sm transition-all duration-500 hover:shadow-[0_16px_36px_-6px_rgba(212,175,55,0.45),0_0_20px_rgba(212,175,55,0.2)] hover:-translate-y-1"
          >
            <img
              src="https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80"
              alt="Cocktail Night"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
              <h3 className="font-serif text-base font-bold text-white group-hover:text-[#F3E5AB] transition-colors">Cocktail Night</h3>
              <span className="text-[11px] font-semibold text-rose-200 mt-0.5 flex items-center group-hover:text-white transition-colors uppercase tracking-wider">
                <span>SHOP DRAPES</span>
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>

          {/* Middle Bottom Card - Festive Ready */}
          <Link
            href="/shop?occasion=Festive"
            className="group relative md:col-span-1 h-44 sm:h-52 rounded-xl overflow-hidden bg-stone-100 shadow-sm transition-all duration-500 hover:shadow-[0_16px_36px_-6px_rgba(212,175,55,0.45),0_0_20px_rgba(212,175,55,0.2)] hover:-translate-y-1"
          >
            <img
              src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80"
              alt="Festive Ready"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
              <h3 className="font-serif text-base font-bold text-white group-hover:text-[#F3E5AB] transition-colors">Festive Ready</h3>
              <span className="text-[11px] font-semibold text-rose-200 mt-0.5 flex items-center group-hover:text-white transition-colors uppercase tracking-wider">
                <span>SHOP SILKS</span>
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>

          {/* Right Bottom Card - Casual Ethnic */}
          <Link
            href="/shop?category=cotton-linen"
            className="group relative md:col-span-2 h-44 sm:h-52 rounded-xl overflow-hidden bg-stone-100 shadow-sm transition-all duration-500 hover:shadow-[0_16px_36px_-6px_rgba(212,175,55,0.45),0_0_20px_rgba(212,175,55,0.2)] hover:-translate-y-1"
          >
            <img
              src="/images/teal_ethnic_suit_embroidered.jpg"
              alt="Casual Ethnic"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
              <h3 className="font-serif text-base font-bold text-white group-hover:text-[#F3E5AB] transition-colors">Casual Ethnic</h3>
              <span className="text-[11px] font-semibold text-emerald-200 mt-0.5 flex items-center group-hover:text-white transition-colors uppercase tracking-wider">
                <span>SHOP EVERYDAY WEAR</span>
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. NEW ARRIVALS (4-Card Product Row) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl sm:text-2xl text-stone-900">
            New <span className="text-[#0A4D40] font-bold">Arrivals</span>
          </h2>
          <Link
            href="/shop?sort=newest"
            className="text-[11px] font-bold text-stone-600 hover:text-[#0A4D40] uppercase tracking-wider inline-flex items-center transition"
          >
            <span>VIEW ALL PRODUCTS</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5 text-[#0A4D40]" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[3/4] bg-stone-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. OUR FEATURED COLLECTION (4-Card Product Row) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl sm:text-2xl text-stone-900">
            Our Featured <span className="text-[#0A4D40] font-bold">Collection</span>
          </h2>
          <Link
            href="/shop?featured=true"
            className="text-[11px] font-bold text-stone-600 hover:text-[#0A4D40] uppercase tracking-wider inline-flex items-center transition"
          >
            <span>VIEW ALL PRODUCTS</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5 text-[#0A4D40]" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[3/4] bg-stone-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 6. REVIEWS & RATINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl sm:text-2xl text-stone-900">
            Reviews & <span className="text-[#0A4D40] font-bold">Ratings</span>
          </h2>
          <Link
            href="/reviews"
            className="text-[11px] font-bold text-stone-600 hover:text-[#0A4D40] uppercase tracking-wider inline-flex items-center transition"
          >
            <span>VIEW ALL</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5 text-[#0A4D40]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <Link
              key={rev.id}
              href="/reviews"
              className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:border-[#0A4D40]/30 transition group"
            >
              <div>
                <div className="flex items-center space-x-1 text-amber-500 mb-2">
                  <span className="text-xs font-bold text-stone-900 mr-1.5">{rev.rating.toFixed(1)}</span>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-stone-600 italic leading-relaxed group-hover:text-stone-900 transition">
                  "{rev.quote}"
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-3 border-t border-stone-100">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-[#0A4D40] font-serif font-bold text-xs flex items-center justify-center group-hover:bg-[#0A4D40] group-hover:text-white transition">
                  {rev.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#0A4D40] transition">{rev.author}</h4>
                  <span className="text-[10px] text-stone-400">{rev.location}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. 5-PILLAR VALUE PROPOSITION / TRUST STRIP */}
      <section className="bg-stone-50 border-y border-stone-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {/* 1. Authentic Quality */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#0A4D40] mb-3 shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Authentic Quality
              </h4>
              <p className="mt-1 text-[11px] text-stone-500 max-w-[170px] leading-tight">
                Handpicked certified pure silks and master weaver authenticity.
              </p>
            </div>

            {/* 2. Modern Tradition */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#0A4D40] mb-3 shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Modern Tradition
              </h4>
              <p className="mt-1 text-[11px] text-stone-500 max-w-[170px] leading-tight">
                Designs that blend timeless Indian heritage with modern elegance.
              </p>
            </div>

            {/* 3. Express Delivery */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#0A4D40] mb-3 shadow-sm">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Express Delivery
              </h4>
              <p className="mt-1 text-[11px] text-stone-500 max-w-[170px] leading-tight">
                Fast insured door-to-door courier dispatch across India and worldwide.
              </p>
            </div>

            {/* 4. Easy Returns */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#0A4D40] mb-3 shadow-sm">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Easy Returns
              </h4>
              <p className="mt-1 text-[11px] text-stone-500 max-w-[170px] leading-tight">
                7-day hassle-free return and exchange policy for peace of mind.
              </p>
            </div>

            {/* 5. 100% Secure Payment */}
            <div className="flex flex-col items-center col-span-2 md:col-span-1">
              <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#0A4D40] mb-3 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                100% Secure Payment
              </h4>
              <p className="mt-1 text-[11px] text-stone-500 max-w-[170px] leading-tight">
                Bank-grade 256-bit encrypted checkout supporting UPI, Cards & NetBanking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
