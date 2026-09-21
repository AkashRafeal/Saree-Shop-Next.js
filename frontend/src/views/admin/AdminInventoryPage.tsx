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
  ChevronDown,
  Check,
  Star,
  ChevronLeft,
  ChevronRight,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';
import api from '@/services/api';

export const AdminInventoryPage: React.FC = () => {
  const isInventoryPage = true;
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close category dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Multi-Image Upload State (Up to 10 images)
  const MAX_IMAGES = 10;
  const [images, setImages] = useState<string[]>([]);
  const [imageInputMode, setImageInputMode] = useState<'local' | 'url'>('local');
  const [webUrlInput, setWebUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // New product form
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    price: '',
    discountPrice: '',
    fabric: 'Silk',
    zariType: 'Pure Gold Zari',
    occasion: 'Bridal',
    description: '',
    stockQuantity: '15',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products?page=0&size=50');
      setProducts(res.data?.data?.content || []);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data?.data || []);
      if (res.data?.data?.length > 0) {
        setFormData((prev) => ({ ...prev, categoryId: String(res.data.data[0].id) }));
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (fileList: FileList | File[]) => {
    setImageError(null);
    const filesArray = Array.from(fileList);
    if (!filesArray.length) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setImageError(`Maximum ${MAX_IMAGES} images reached. Please remove an image before adding new ones.`);
      return;
    }

    const filesToUpload = filesArray.slice(0, remainingSlots);
    if (filesArray.length > remainingSlots) {
      setImageError(`Only ${remainingSlots} image(s) added to stay within the ${MAX_IMAGES} image maximum.`);
    }

    setUploadingImage(true);
    const newUrls: string[] = [];

    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        continue;
      }

      try {
        const uploadData = new FormData();
        uploadData.append('file', file);
        const res = await api.post('/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data?.data) {
          newUrls.push(res.data.data);
          continue;
        }
      } catch (uploadErr) {
        console.warn('Backend upload failed, falling back to local preview data URL:', uploadErr);
      }

      const fallbackUrl = await readFileAsDataUrl(file);
      if (fallbackUrl) {
        newUrls.push(fallbackUrl);
      }
    }

    if (newUrls.length > 0) {
      setImages((prev) => [...prev, ...newUrls].slice(0, MAX_IMAGES));
    }
    setUploadingImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleAddWebUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setImageError(null);
    const trimmed = webUrlInput.trim();
    if (!trimmed) return;

    if (images.length >= MAX_IMAGES) {
      setImageError(`Maximum ${MAX_IMAGES} images reached. You cannot add more than 10 images.`);
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setImageError('Please enter a valid image URL starting with http:// or https://');
      return;
    }

    setImages((prev) => [...prev, trimmed].slice(0, MAX_IMAGES));
    setWebUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setImageError(null);
  };

  const handleMakePrimary = (indexToPrimary: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(indexToPrimary, 1);
      return [item, ...copy];
    });
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    setImages((prev) => {
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleOpenAddModal = () => {
    setEditingProductId(null);
    setError(null);
    setImageError(null);
    setImages([]);
    setWebUrlInput('');
    setImageInputMode('local');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFormData({
      name: '',
      sku: '',
      categoryId: categories[0]?.id ? String(categories[0].id) : '',
      price: '',
      discountPrice: '',
      fabric: 'Silk',
      zariType: 'Pure Gold Zari',
      occasion: 'Bridal',
      description: '',
      stockQuantity: '15',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: any) => {
    setEditingProductId(product.id);
    setError(null);
    setImageError(null);
    setWebUrlInput('');

    let productImages: string[] = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      productImages = product.images.slice(0, MAX_IMAGES);
    } else if (product.primaryImageUrl) {
      productImages = [product.primaryImageUrl];
    }
    setImages(productImages);
    setImageInputMode(productImages.length > 0 ? 'url' : 'local');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const catId = product.categoryId || categories.find((c: any) => c.name === product.categoryName)?.id || categories[0]?.id || '';
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      categoryId: String(catId),
      price: product.mrp ? String(product.mrp) : (product.price ? String(product.price) : ''),
      discountPrice: product.sellingPrice ? String(product.sellingPrice) : (product.price ? String(product.price) : ''),
      fabric: product.fabric || 'Silk',
      zariType: product.zariType || 'Pure Gold Zari',
      occasion: product.occasion || 'Bridal',
      description: product.description || '',
      stockQuantity: String(product.availableStock ?? product.stock ?? 15),
    });
    setIsModalOpen(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fallbackDefault = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80';
    const finalImageUrls = images.length > 0 ? images.slice(0, MAX_IMAGES) : [fallbackDefault];

    const payload = {
      name: formData.name,
      sku: formData.sku,
      categoryId: Number(formData.categoryId),
      mrp: Number(formData.price),
      sellingPrice: formData.discountPrice ? Number(formData.discountPrice) : Number(formData.price),
      fabric: formData.fabric,
      zariType: formData.zariType,
      occasion: formData.occasion,
      description: formData.description?.trim() || 'Authentic handcrafted luxury saree woven with pure silk and artisanal craftsmanship.',
      stock: Number(formData.stockQuantity),
      imageUrls: finalImageUrls,
    };

    try {
      if (editingProductId) {
        await api.put(`/admin/products/${editingProductId}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }

      setIsModalOpen(false);
      setEditingProductId(null);
      setImages([]);
      setImageInputMode('local');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || (editingProductId ? 'Failed to update product.' : 'Failed to create product.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Deactivate this product from catalog?')) return;

    try {
      await api.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Failed to deactivate product');
    }
  };

  // Inventory Calculations
  const totalStockUnits = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  const inStockCount = products.filter((p) => (Number(p.stock) || 0) > 10).length;
  const lowStockCount = products.filter((p) => (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) <= 10).length;
  const outOfStockCount = products.filter((p) => (Number(p.stock) || 0) === 0).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(search.toLowerCase());

    const stock = Number(p.stock) || 0;
    if (stockFilter === 'in_stock') return matchesSearch && stock > 10;
    if (stockFilter === 'low_stock') return matchesSearch && stock > 0 && stock <= 10;
    if (stockFilter === 'out_of_stock') return matchesSearch && stock === 0;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
              Saree Inventory & Stock Management
            </h2>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A4D40]"></span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Track real-time warehouse stock availability, reorder levels, and unit counts
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0A4D40] hover:bg-[#062E28] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md shadow-[#0A4D40]/25 hover:shadow-lg active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Saree</span>
        </button>
      </div>

      {/* Inventory KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-stone-100 text-[#0A4D40] flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10.5px] font-bold text-stone-400 uppercase tracking-wider">Total Catalog</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-sans text-2xl font-extrabold text-stone-900 tracking-tight tabular-nums">
                {products.length}
              </span>
              <span className="text-xs font-sans font-medium text-stone-400">Designs</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10.5px] font-bold text-stone-400 uppercase tracking-wider">Total Stock Units</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-sans text-2xl font-extrabold text-[#0A4D40] tracking-tight tabular-nums">
                {totalStockUnits.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-sans font-medium text-stone-400">Units</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#0A4D40]/10 text-[#0A4D40] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10.5px] font-bold text-stone-400 uppercase tracking-wider">In Healthy Stock</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-sans text-2xl font-extrabold text-stone-900 tracking-tight tabular-nums">
                {inStockCount}
              </span>
              <span className="text-xs font-sans font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/60">
                10+ pcs
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10.5px] font-bold text-stone-400 uppercase tracking-wider">Low / Out of Stock</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-sans text-2xl font-extrabold text-amber-600 tracking-tight tabular-nums">
                {lowStockCount + outOfStockCount}
              </span>
              <span className="text-xs font-sans font-medium text-stone-400">Needs Reorder</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, SKU, or category..."
            className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40] focus:bg-white transition-all"
          />
        </div>

        {/* Stock Filter Pills */}
        {isInventoryPage ? (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              stockFilter === 'all'
                ? 'bg-[#0A4D40] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('in_stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              stockFilter === 'in_stock'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            In Stock ({inStockCount})
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('low_stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              stockFilter === 'low_stock'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          {outOfStockCount > 0 && (
            <button
              type="button"
              onClick={() => setStockFilter('out_of_stock')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                stockFilter === 'out_of_stock'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              Sold Out ({outOfStockCount})
            </button>
          )}
        </div>
        ) : (
          <span className="text-xs text-stone-500 font-medium">
            Showing <strong className="text-[#0A4D40]">{filteredProducts.length}</strong> of {products.length} Sarees
          </span>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-[#0A4D40] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-stone-500">Loading catalog & inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-xs">
            No sarees found matching your query or filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-stone-600 uppercase font-bold text-[11px] tracking-wider border-b border-stone-200/80">
                <tr>
                  <th className="py-3.5 px-4">Saree</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Fabric</th>
                  <th className="py-3.5 px-4">Stock Availability</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredProducts.map((product) => {
                  const priceVal = product.sellingPrice ?? product.price ?? product.mrp ?? 0;
                  const defaultImg = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80';
                  const stockNum = Number(product.stock ?? 0);
                  const isHealthy = stockNum > 10;
                  const isLow = stockNum > 0 && stockNum <= 10;

                  return (
                    <tr key={product.id} className="hover:bg-[#FAF8F5]/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.primaryImageUrl || (product.images && product.images[0]) || defaultImg}
                            alt={product.name}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = defaultImg;
                            }}
                            className="w-11 h-14 object-cover rounded-lg border border-stone-200/80 shadow-xs shrink-0 bg-stone-100"
                          />
                          <div className="max-w-xs">
                            <span className="font-serif font-bold text-stone-900 line-clamp-1 hover:text-[#0A4D40] transition-colors">
                              {product.name}
                            </span>
                            <span className="text-[10px] text-stone-400 font-medium">
                              {product.occasion || 'Traditional / Bridal'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-stone-600">
                        <span className="bg-stone-100/90 border border-stone-200/60 px-2 py-0.5 rounded text-[11px]">
                          {product.sku}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-stone-700">
                        {product.categoryName}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-sans font-bold text-stone-900 text-sm tabular-nums">
                            ₹{Number(priceVal).toLocaleString('en-IN')}
                          </span>
                          {product.mrp && Number(product.mrp) > Number(priceVal) && (
                            <span className="text-[10px] text-stone-400 line-through">
                              ₹{Number(product.mrp).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 font-medium">
                        {product.fabric || 'Pure Silk'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 min-w-[135px]">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-sans font-bold text-stone-900 text-xs tracking-tight tabular-nums">
                              {stockNum} {stockNum === 1 ? 'Piece' : 'Pieces'}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isHealthy
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                                  : isLow
                                  ? 'bg-amber-50 text-amber-800 border border-amber-300/80'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isHealthy
                                    ? 'bg-emerald-500 animate-pulse'
                                    : isLow
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                              />
                              {isHealthy ? 'In Stock' : isLow ? 'Low Stock' : 'Out of Stock'}
                            </span>
                          </div>

                          {/* Inventory progress level bar */}
                          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isHealthy ? 'bg-[#0A4D40]' : isLow ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(8, (stockNum / 25) * 100))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2 text-stone-400 hover:text-[#0A4D40] hover:bg-[#FFF0F5] rounded-xl transition cursor-pointer"
                            title="Edit Saree Details & Stock"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                            title="Deactivate Saree"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add Saree Modal - Portaled to document.body for full viewport coverage & uniform blur */}
      {isModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50 sticky top-0 z-10">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {editingProductId ? 'Edit Saree Details' : 'Add New Luxury Saree to Catalog'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="m-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                  Saree Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Emerald Green Kanchipuram Brocade Saree"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. SA-KNC-999"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                  />
                </div>

                <div className="relative" ref={categoryDropdownRef}>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2 bg-white border rounded-xl text-xs transition-all cursor-pointer text-left ${
                      categoryDropdownOpen
                        ? 'border-[#0A4D40] ring-2 ring-[#0A4D40]/20'
                        : 'border-stone-300 hover:border-[#0A4D40]'
                    }`}
                  >
                    <span className="text-stone-800 font-medium truncate">
                      {categories.find((c) => String(c.id) === String(formData.categoryId))?.name || 'Select Category'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#0A4D40] shrink-0 ml-1 transition-transform duration-200 ${
                        categoryDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Brand-Themed Category Dropdown Menu */}
                  {categoryDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto py-1 animate-fadeIn">
                      {categories.map((cat) => {
                        const isSelected = String(cat.id) === String(formData.categoryId);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, categoryId: String(cat.id) });
                              setCategoryDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#0A4D40] text-white font-semibold'
                                : 'text-stone-700 hover:bg-[#FFF0F5] hover:text-[#0A4D40]'
                            }`}
                          >
                            <span className="truncate">{cat.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Regular Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="28500"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="25000"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Initial Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Fabric
                  </label>
                  <input
                    type="text"
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    placeholder="Pure Mulberry Silk"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Zari Type
                  </label>
                  <input
                    type="text"
                    value={formData.zariType}
                    onChange={(e) => setFormData({ ...formData, zariType: e.target.value })}
                    placeholder="Pure Silver/Gold Zari"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Occasion
                  </label>
                  <input
                    type="text"
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    placeholder="Bridal / Festive"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                  />
                </div>
              </div>

              {/* Saree Images Section (Max 10 images) */}
              <div className="space-y-3 bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      Saree Product Images *
                    </label>
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      images.length >= MAX_IMAGES 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                        : 'bg-[#0A4D40]/10 text-[#0A4D40] border border-[#0A4D40]/20'
                    }`}>
                      {images.length} / {MAX_IMAGES} {images.length >= MAX_IMAGES ? '(Max 10)' : ''}
                    </span>
                  </div>

                  {/* Mode Toggle Tabs */}
                  <div className="flex items-center bg-white p-0.5 rounded-lg border border-stone-200 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('local')}
                      className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                        imageInputMode === 'local'
                          ? 'bg-[#0A4D40] text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload from Computer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                        imageInputMode === 'url'
                          ? 'bg-[#0A4D40] text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Web URL</span>
                    </button>
                  </div>
                </div>

                {imageError && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>{imageError}</span>
                  </div>
                )}

                {/* Input Controls */}
                {imageInputMode === 'local' ? (
                  <div>
                    {images.length < MAX_IMAGES ? (
                      <label
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className="border-2 border-dashed border-stone-300 hover:border-[#0A4D40] bg-white hover:bg-[#FFF0F5]/30 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                          onChange={handleFileChange}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                        <div className="w-10 h-10 rounded-xl bg-[#0A4D40]/10 text-[#0A4D40] flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                          <ImagePlus className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-stone-800 group-hover:text-[#0A4D40] transition-colors">
                          {uploadingImage ? 'Uploading selected images...' : 'Click to select multiple images or drag here'}
                        </span>
                        <span className="text-[10px] text-stone-400 mt-0.5">
                          Add up to {MAX_IMAGES - images.length} more images (JPG, PNG, WEBP, max 10MB each)
                        </span>
                      </label>
                    ) : (
                      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-center text-xs text-amber-800 font-medium">
                        Maximum limit of 10 images reached. Delete any image below to add another.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={webUrlInput}
                        onChange={(e) => setWebUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddWebUrl();
                          }
                        }}
                        disabled={images.length >= MAX_IMAGES}
                        placeholder={
                          images.length >= MAX_IMAGES
                            ? "Limit reached (10/10 images)"
                            : "Paste image URL (e.g. https://images.unsplash.com/...)"
                        }
                        className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40] disabled:bg-stone-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddWebUrl()}
                        disabled={!webUrlInput.trim() || images.length >= MAX_IMAGES}
                        className="px-4 py-2 bg-[#0A4D40] hover:bg-[#062E28] disabled:bg-stone-300 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                      >
                        + Add Image
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-400">
                      Press Enter or click "+ Add Image" to add URL to the gallery (up to {MAX_IMAGES} images)
                    </p>
                  </div>
                )}

                {/* Uploading progress indicator */}
                {uploadingImage && (
                  <div className="flex items-center gap-2 text-xs text-[#0A4D40] font-semibold py-1">
                    <div className="w-3.5 h-3.5 border-2 border-[#0A4D40] border-t-transparent rounded-full animate-spin" />
                    <span>Processing & uploading images to server...</span>
                  </div>
                )}

                {/* Gallery List Preview with Reorder & Primary controls */}
                {images.length > 0 && (
                  <div className="pt-2 border-t border-stone-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                        Gallery Preview ({images.length} added)
                      </span>
                      <span className="text-[10px] text-stone-400">
                        First image (#1) is the Primary Cover Saree
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className={`group relative rounded-xl overflow-hidden border bg-white shadow-xs transition-all ${
                            idx === 0
                              ? 'border-[#0A4D40] ring-2 ring-[#0A4D40]/20'
                              : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <div className="aspect-[3/4] w-full relative bg-stone-100">
                            <img
                              src={imgUrl}
                              alt={`Product image ${idx + 1}`}
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                if (!target.src.includes('photo-1617627143750')) {
                                  target.src =
                                    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=300&q=80';
                                }
                              }}
                              className="w-full h-full object-cover"
                            />

                            {/* Badge */}
                            <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                              {idx === 0 ? (
                                <span className="bg-[#0A4D40] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-white" />
                                  Cover
                                </span>
                              ) : (
                                <span className="bg-stone-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  #{idx + 1}
                                </span>
                              )}
                            </div>

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 hover:bg-red-600 hover:text-white text-stone-700 flex items-center justify-center shadow-xs transition cursor-pointer"
                              title="Delete this image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            {/* Bottom quick actions overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-stone-950/80 via-stone-950/40 to-transparent flex items-center justify-between opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex gap-1">
                                {idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, 'left')}
                                    className="p-1 rounded bg-white/80 hover:bg-white text-stone-800 text-[9px] transition cursor-pointer"
                                    title="Move left"
                                  >
                                    <ChevronLeft className="w-3 h-3" />
                                  </button>
                                )}
                                {idx < images.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(idx, 'right')}
                                    className="p-1 rounded bg-white/80 hover:bg-white text-stone-800 text-[9px] transition cursor-pointer"
                                    title="Move right"
                                  >
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMakePrimary(idx)}
                                  className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/90 hover:bg-[#0A4D40] hover:text-white text-stone-800 transition cursor-pointer"
                                >
                                  Set Cover
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                  Craftsmanship Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the weave, pallu motifs, border craftsmanship, and drape..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 border border-stone-300 rounded-full text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-2.5 bg-[#0A4D40] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#062E28] shadow-md shadow-[#0A4D40]/25 transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting 
                    ? (editingProductId ? 'Updating Saree...' : 'Adding Saree...') 
                    : (editingProductId ? 'Save Changes' : 'Save Saree')}
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
