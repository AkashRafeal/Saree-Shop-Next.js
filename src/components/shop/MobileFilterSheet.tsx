import React from 'react';
import { X, Check, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { PriceRangeSlider } from './PriceRangeSlider';

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedSort: string;
  onSelectSort: (sort: string) => void;
  sortOptions: { value: string; label: string }[];
  categories: { slug: string; name: string }[];
  minPrice?: number;
  maxPrice?: number;
  onPriceChange?: (min: number, max: number) => void;
  onReset: () => void;
}

export const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  selectedSort,
  onSelectSort,
  sortOptions,
  categories,
  minPrice,
  maxPrice,
  onPriceChange,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div
        className="relative bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto z-10 flex flex-col shadow-2xl animate-scaleUp"
        style={{
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
        }}
      >
        {/* Drag handle */}
        <div className="w-12 h-1 bg-stone-300 rounded-full mx-auto mt-3 mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#0A4D40]" />
            <h3 className="font-serif text-base font-bold text-stone-900">
              Filter & Sort Collection
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 active:bg-stone-100"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6 flex-1 overflow-y-auto">
          {/* 1. Sort Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 uppercase tracking-wider">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#0A4D40]" />
              <span>Sort By</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map((opt) => {
                const active = selectedSort === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onSelectSort(opt.value)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium text-left flex items-center justify-between border transition-all ${
                      active
                        ? 'border-[#0A4D40] bg-emerald-50 text-[#0A4D40] font-bold shadow-2xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {active && <Check className="w-3.5 h-3.5 text-[#0A4D40]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Animated Price Range Slider Section */}
          <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200/70">
            <PriceRangeSlider
              initialMin={minPrice}
              initialMax={maxPrice}
              showTitle={true}
              showPresets={true}
              showApplyButton={false}
              onChange={(min, max) => {
                if (onPriceChange) onPriceChange(min, max);
              }}
              onReset={() => {
                if (onPriceChange) onPriceChange(400, 50000);
              }}
            />
          </div>

          {/* 3. Categories Section */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
              Categories & Weaves
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onSelectCategory('')}
                className={`py-1.5 px-3 rounded-full text-xs font-medium border transition-all ${
                  !selectedCategory
                    ? 'bg-[#0A4D40] text-white border-[#0A4D40] shadow-xs'
                    : 'bg-stone-100 text-stone-700 border-transparent hover:bg-stone-200'
                }`}
              >
                All Sarees
              </button>
              {categories.map((cat) => {
                const active = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => onSelectCategory(cat.slug)}
                    className={`py-1.5 px-3 rounded-full text-xs font-medium border transition-all ${
                      active
                        ? 'bg-[#0A4D40] text-white border-[#0A4D40] shadow-xs'
                        : 'bg-stone-100 text-stone-700 border-transparent hover:bg-stone-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center gap-3">
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="flex-1 py-3 text-xs font-bold uppercase tracking-wider text-stone-600 bg-white border border-stone-300 rounded-full hover:bg-stone-100 transition"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 text-xs font-bold uppercase tracking-wider text-white bg-[#0A4D40] hover:bg-[#062E28] rounded-full shadow-md shadow-[#062E28]/20 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
