'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  ImageIcon, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  X, 
  Upload 
} from 'lucide-react';
import { createPortal } from 'react-dom';

interface BannerItem {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  targetUrl?: string;
  displayOrder: number;
  active: boolean;
}

const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: 1,
    title: 'Royal Kanchipuram Silks',
    subtitle: 'Handwoven pure mulberry silk with gold zari motifs crafted by master weavers.',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Explore Collection',
    targetUrl: '/shop',
    displayOrder: 1,
    active: true,
  },
  {
    id: 2,
    title: 'Bridal & Festive Heirlooms',
    subtitle: 'Masterpiece sarees designed for timeless Indian celebrations and wedding opulence.',
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Discover Heritage',
    targetUrl: '/shop',
    displayOrder: 2,
    active: true,
  },
  {
    id: 3,
    title: 'Handloom Chanderi & Organza',
    subtitle: 'Sheer lightweight gossamer weaves with intricate zari bootis for intimate soirees.',
    imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Shop New Arrivals',
    targetUrl: '/shop',
    displayOrder: 3,
    active: true,
  }
];

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<BannerItem[]>(DEFAULT_BANNERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaText, setCtaText] = useState('Explore Collection');
  const [targetUrl, setTargetUrl] = useState('/shop');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/admin/banners');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setBanners(json.data);
        }
      }
    } catch (e) {
      console.warn('Using local banners fallback', e);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setCtaText('Explore Collection');
    setTargetUrl('/shop');
    setDisplayOrder(banners.length + 1);
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: BannerItem) => {
    setEditingId(b.id);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setImageUrl(b.imageUrl);
    setCtaText(b.ctaText || 'Explore Collection');
    setTargetUrl(b.targetUrl || '/shop');
    setDisplayOrder(b.displayOrder);
    setActive(b.active);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.data) {
        const uploadedUrl = res.data.data;
        setImageUrl(uploadedUrl);
      }
    } catch {
      // Fallback preview
      const localUrl = URL.createObjectURL(file);
      setImageUrl(localUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    setLoading(true);
    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      imageUrl: imageUrl.trim(),
      ctaText: ctaText.trim(),
      targetUrl: targetUrl.trim(),
      displayOrder: Number(displayOrder),
      active,
    };

    try {
      if (editingId) {
        const res = await fetch(`http://localhost:8080/api/admin/banners/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const json = await res.json();
          setBanners((prev) => prev.map((item) => (item.id === editingId ? json.data : item)));
        } else {
          setBanners((prev) =>
            prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item))
          );
        }
      } else {
        const res = await fetch('http://localhost:8080/api/admin/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const json = await res.json();
          setBanners((prev) => [...prev, json.data]);
        } else {
          const newItem: BannerItem = {
            id: Date.now(),
            ...payload,
          };
          setBanners((prev) => [...prev, newItem]);
        }
      }
      setIsModalOpen(false);
    } catch {
      if (editingId) {
        setBanners((prev) =>
          prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item))
        );
      } else {
        const newItem: BannerItem = {
          id: Date.now(),
          ...payload,
        };
        setBanners((prev) => [...prev, newItem]);
      }
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (banner: BannerItem) => {
    const updatedActive = !banner.active;
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, active: updatedActive } : b))
    );
    try {
      await fetch(`http://localhost:8080/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...banner, active: updatedActive }),
      });
    } catch {
      // Handled locally
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this promotional hero banner?')) return;
    setBanners((prev) => prev.filter((b) => b.id !== id));
    try {
      await fetch(`http://localhost:8080/api/admin/banners/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // Handled locally
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0A4D40]"></span>
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              Visual Merchandising
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Homepage Hero Banners & Campaigns
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Curate hero slides, seasonal wedding campaigns, and luxury promotions displayed on the storefront.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#0A4D40] to-[#062E28] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#0A4D40]/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hero Banner</span>
        </button>
      </div>

      {/* Banner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300"
          >
            {/* Visual Preview */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900">
              <img
                src={b.imageUrl}
                alt={b.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase">
                  Order #{b.displayOrder}
                </span>
                <h3 className="font-serif text-lg font-bold line-clamp-1">{b.title}</h3>
                {b.subtitle && (
                  <p className="text-xs text-stone-200 line-clamp-1 mt-0.5">{b.subtitle}</p>
                )}
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md ${
                    b.active
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-stone-800/90 text-stone-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${b.active ? 'bg-white' : 'bg-stone-400'}`}
                  ></span>
                  {b.active ? 'Active' : 'Hidden'}
                </span>
              </div>
            </div>

            {/* Banner Meta & Controls */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                  <span>Button Label:</span>
                  <span className="font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-md">
                    {b.ctaText || 'Explore'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                  <span>Link Destination:</span>
                  <span className="font-mono text-stone-600 truncate max-w-[160px]">
                    {b.targetUrl || '/shop'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    b.active
                      ? 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {b.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{b.active ? 'Hide Banner' : 'Publish'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(b)}
                    className="p-1.5 text-stone-400 hover:text-[#0A4D40] hover:bg-[#FFF0F5] rounded-lg transition cursor-pointer"
                    title="Edit Banner"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Banner Modal */}
      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200">
              <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#0A4D40] flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    {editingId ? 'Edit Hero Banner' : 'Create Homepage Showcase Banner'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBanner} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Banner Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Kanchipuram Silks"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Subtitle / Tagline
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Handwoven pure mulberry silk with gold zari motifs"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Hero Banner Image URL *
                  </label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                    />

                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 cursor-pointer transition">
                        <Upload className="w-3.5 h-3.5 text-stone-500" />
                        <span>{uploading ? 'Uploading...' : 'Or Upload Local Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      {imageUrl && (
                        <span className="text-[11px] text-emerald-600 font-medium">
                          ✓ Image set
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {imageUrl && (
                  <div className="relative aspect-[16/7] rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Explore Collection"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Target Destination
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /shop"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Display Order Sequence
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="bannerActive"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="w-4 h-4 accent-[#0A4D40] rounded cursor-pointer"
                    />
                    <label htmlFor="bannerActive" className="text-xs font-medium text-stone-700 cursor-pointer">
                      Publish immediately
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || uploading}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#0A4D40] to-[#062E28] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#0A4D40]/20 hover:scale-[1.02] cursor-pointer disabled:opacity-50 transition"
                  >
                    {loading ? 'Saving...' : editingId ? 'Update Banner' : 'Create Banner'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
