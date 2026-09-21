import { create } from 'zustand';
import api from '@/services/api';

interface BadgeState {
  cartCount: number;
  wishlistCount: number;
  setCartCount: (count: number) => void;
  setWishlistCount: (count: number) => void;
  fetchCounts: () => Promise<void>;
  resetCounts: () => void;
}

export const useBadgeStore = create<BadgeState>((set) => ({
  cartCount: 0,
  wishlistCount: 0,
  setCartCount: (cartCount) => set({ cartCount }),
  setWishlistCount: (wishlistCount) => set({ wishlistCount }),
  fetchCounts: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('sareeaura_token');
    if (!token) {
      set({ cartCount: 0, wishlistCount: 0 });
      return;
    }
    try {
      const [cartRes, wishRes] = await Promise.allSettled([
        api.get('/cart'),
        api.get('/wishlist'),
      ]);
      const cartCount =
        cartRes.status === 'fulfilled' ? cartRes.value.data?.data?.totalItems || 0 : 0;
      const wishlistCount =
        wishRes.status === 'fulfilled' ? wishRes.value.data?.data?.totalItems || 0 : 0;
      set({ cartCount, wishlistCount });
    } catch {
      // ignore
    }
  },
  resetCounts: () => set({ cartCount: 0, wishlistCount: 0 }),
}));
