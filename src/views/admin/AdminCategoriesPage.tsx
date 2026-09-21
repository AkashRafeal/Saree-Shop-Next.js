'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  AlertCircle, 
  X, 
  UploadCloud, 
  ImagePlus, 
  Link as LinkIcon, 
  Layers, 
  Sparkles, 
  ExternalLink, 
  Package
} from 'lucide-react';
import api from '@/services/api';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: number | null;
  active: boolean;
}

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Category Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    active: true,
  });

  // Image upload state
  const [imageInputMode, setImageInputMode] = useState<'local' | 'url'>('url');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products?page=0&size=200'),
      ]);
      setCategories(catRes.data?.data || []);
      setProducts(prodRes.data?.data?.content || []);
    } catch (err) {
      console.error('Failed to load categories or products', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate count of sarees in each category
  const getProductCountForCategory = (cat: CategoryItem) => {
    return products.filter(
      (p: any) => p.categoryId === cat.id || p.categoryName === cat.name
    ).length;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.data) {
        setFormData((prev) => ({ ...prev, imageUrl: res.data.data }));
        setImagePreview(res.data.data);
      }
    } catch (uploadErr) {
      console.warn('Backend upload failed, using local FileReader data URL:', uploadErr);
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFormData((prev) => ({ ...prev, imageUrl: dataUrl }));
        setImagePreview(dataUrl);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingCategoryId(null);
    setError(null);
    setImagePreview(null);
    setImageInputMode('url');
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategoryId(cat.id);
    setError(null);
    setImagePreview(cat.imageUrl || null);
    setImageInputMode(cat.imageUrl ? 'url' : 'local');
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      imageUrl: cat.imageUrl || '',
      active: cat.active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      name,
      // Auto-generate slug if not manually edited or empty
      slug: !editingCategoryId || prev.slug === '' ? generatedSlug : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Category name is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = {
      name: formData.name.trim(),
      slug: slug,
      description: formData.description.trim(),
      imageUrl: formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      active: formData.active,
    };

    try {
      if (editingCategoryId) {
        await api.put(`/admin/categories/${editingCategoryId}`, payload);
      } else {
        await api.post('/admin/categories', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category. Please check details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${name}"? Sarees in this category will become unassigned.`)) {
      try {
        await api.delete(`/admin/categories/${id}`);
        fetchData();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const q = search.toLowerCase();
    return (
      cat.name?.toLowerCase().includes(q) ||
      cat.slug?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q)
    );
  });

  const defaultCategoryImage = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
              Saree Categories & Weaves
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#0A4D40] bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              Taxonomy
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Create and maintain saree categories, handloom weave types, and collection taxonomies.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-2 bg-[#0A4D40] hover:bg-[#062E28] text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md shadow-[#0A4D40]/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search Bar & Statistics */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category by name, weave, or slug..."
            className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40] transition"
          />
        </div>

        <div className="text-xs text-stone-500 font-medium">
          Showing <span className="font-bold text-stone-800 tabular-nums">{filteredCategories.length}</span> of <span className="font-bold text-stone-800 tabular-nums">{categories.length}</span> Categories
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400">
            <div className="w-6 h-6 border-2 border-[#0A4D40] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading saree categories...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-rose-50 text-[#0A4D40] rounded-2xl flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-stone-800">No categories found</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {search ? 'No categories match your search criteria.' : 'Start by adding your first saree category to organize your catalog.'}
            </p>
            {!search && (
              <button
                onClick={handleOpenAddModal}
                className="mt-2 text-xs font-bold text-[#0A4D40] hover:underline"
              >
                + Add your first category
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200/80 bg-stone-50/80 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  <th className="py-3.5 px-4">Category / Weave</th>
                  <th className="py-3.5 px-4">Storefront Slug</th>
                  <th className="py-3.5 px-4">Catalog Sarees</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCategories.map((cat) => {
                  const sareeCount = getProductCountForCategory(cat);
                  return (
                    <tr key={cat.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3.5">
                          <img
                            src={cat.imageUrl || defaultCategoryImage}
                            alt={cat.name}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = defaultCategoryImage;
                            }}
                            className="w-12 h-14 object-cover rounded-xl border border-stone-200 shadow-xs shrink-0 bg-stone-100"
                          />
                          <div className="max-w-xs">
                            <span className="font-serif font-bold text-sm text-stone-900 line-clamp-1">
                              {cat.name}
                            </span>
                            <span className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                              {cat.description || 'Heritage Indian handloom weave'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-stone-600">
                        <span className="bg-stone-100 border border-stone-200/70 px-2 py-0.5 rounded text-[11px] text-stone-700">
                          {cat.slug}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200/60 tabular-nums">
                          <Package className="w-3 h-3 text-[#0A4D40]" />
                          {sareeCount} {sareeCount === 1 ? 'saree' : 'sarees'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            cat.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-500 border border-stone-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              cat.active ? 'bg-emerald-500' : 'bg-stone-400'
                            }`}
                          />
                          {cat.active ? 'Active' : 'Hidden'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <a
                            href={`/shop?category=${cat.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-stone-400 hover:text-[#0A4D40] hover:bg-rose-50 rounded-lg transition"
                            title="Preview on shop"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Add/Edit Modal */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-scaleUp">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#FAF8F5]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0A4D40]/10 text-[#0A4D40] flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    {editingCategoryId ? 'Edit Category Details' : 'Add New Saree Category'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-stone-400 hover:text-stone-600 p-1.5 rounded-full hover:bg-stone-200/50 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Category Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Category / Weave Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Kanchipuram Silk, Banarasi, Organza..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                  />
                </div>

                {/* URL Slug */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    URL Slug
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-stone-100 border border-r-0 border-stone-300 rounded-l-xl text-xs text-stone-500 font-mono">
                      /shop?category=
                    </span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="kanchipuram-silk"
                      className="w-full px-3 py-2 border border-stone-300 rounded-r-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Weave Description & Craftsmanship
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the weaving heritage, origin, and characteristics of this saree category..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                  />
                </div>

                {/* Category Image Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase text-stone-700">
                      Category Banner / Cover Image
                    </label>
                    <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-[10px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setImageInputMode('url')}
                        className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                          imageInputMode === 'url'
                            ? 'bg-white text-[#0A4D40] shadow-xs'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Web URL</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode('local')}
                        className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                          imageInputMode === 'local'
                            ? 'bg-white text-[#0A4D40] shadow-xs'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        <UploadCloud className="w-3 h-3" />
                        <span>Upload File</span>
                      </button>
                    </div>
                  </div>

                  {imageInputMode === 'url' ? (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => {
                          setFormData({ ...formData, imageUrl: e.target.value });
                          setImagePreview(e.target.value);
                        }}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="border-2 border-dashed border-stone-300 hover:border-[#0A4D40] bg-stone-50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <ImagePlus className="w-5 h-5 text-[#0A4D40] mb-1" />
                        <span className="text-xs font-bold text-stone-700">
                          {uploadingImage ? 'Uploading image...' : 'Click to select category image from computer'}
                        </span>
                        <span className="text-[10px] text-stone-400 mt-0.5">JPG, PNG, WEBP</span>
                      </label>
                    </div>
                  )}

                  {/* Image Preview Box */}
                  {imagePreview && (
                    <div className="flex items-center gap-3 p-2 bg-stone-50 rounded-xl border border-stone-200 max-w-sm">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = defaultCategoryImage;
                        }}
                        className="w-12 h-14 object-cover rounded-lg border border-stone-200 bg-white shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-stone-800 truncate">Category Cover Preview</p>
                        <p className="text-[10px] text-stone-400 truncate">{imagePreview}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData({ ...formData, imageUrl: '' });
                        }}
                        className="p-1 text-stone-400 hover:text-red-600 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Active Status */}
                <div className="pt-2">
                  <label className="inline-flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 text-[#0A4D40] border-stone-300 rounded focus:ring-[#0A4D40]"
                    />
                    <span className="text-xs font-semibold text-stone-800">
                      Active (Visible on Storefront Navigation & Filters)
                    </span>
                  </label>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 border border-stone-200 text-stone-600 rounded-full text-xs font-bold hover:bg-stone-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-[#0A4D40] hover:bg-[#062E28] text-white rounded-full text-xs font-bold transition shadow-md shadow-[#0A4D40]/20 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingCategoryId ? 'Update Category' : 'Save Category'}</span>
                    )}
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
