import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';

export interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  initialMin?: number;
  initialMax?: number;
  onChange?: (min: number, max: number) => void;
  onApply?: (min: number, max: number) => void;
  onReset?: () => void;
  className?: string;
  showTitle?: boolean;
  showPresets?: boolean;
  showApplyButton?: boolean;
}

const PRESETS = [
  { label: 'All', min: 400, max: 50000 },
  { label: 'Under ₹2,999', min: 400, max: 2999 },
  { label: '₹3,000 - ₹9,999', min: 3000, max: 9999 },
  { label: '₹10,000 - ₹24,999', min: 10000, max: 24999 },
  { label: '₹25,000+', min: 25000, max: 50000 },
];

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min = 400,
  max = 50000,
  step = 100,
  initialMin,
  initialMax,
  onChange,
  onApply,
  onReset,
  className = '',
  showTitle = true,
  showPresets = true,
  showApplyButton = true,
}) => {
  const [minVal, setMinVal] = useState<number>(initialMin !== undefined ? initialMin : min);
  const [maxVal, setMaxVal] = useState<number>(initialMax !== undefined ? initialMax : max);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);

  // Sync with initial props if they change
  useEffect(() => {
    if (initialMin !== undefined) setMinVal(initialMin);
  }, [initialMin]);

  useEffect(() => {
    if (initialMax !== undefined) setMaxVal(initialMax);
  }, [initialMax]);

  const minPercent = Math.min(100, Math.max(0, ((minVal - min) / (max - min)) * 100));
  const maxPercent = Math.min(100, Math.max(0, ((maxVal - min) / (max - min)) * 100));

  const handleMinChange = (value: number) => {
    const val = Math.min(Math.max(min, value), maxVal - step);
    setMinVal(val);
    if (onChange) onChange(val, maxVal);
  };

  const handleMaxChange = (value: number) => {
    const val = Math.max(Math.min(max, value), minVal + step);
    setMaxVal(val);
    if (onChange) onChange(minVal, val);
  };

  const handlePresetClick = (presetMin: number, presetMax: number) => {
    const newMin = Math.max(min, presetMin);
    const newMax = Math.min(max, presetMax);
    setMinVal(newMin);
    setMaxVal(newMax);
    if (onChange) onChange(newMin, newMax);
    if (onApply) onApply(newMin, newMax);
  };

  const handleReset = () => {
    setMinVal(min);
    setMaxVal(max);
    if (onReset) {
      onReset();
    } else {
      if (onChange) onChange(min, max);
      if (onApply) onApply(min, max);
    }
  };

  const isFiltered = minVal > min || maxVal < max;

  // Touch / Pointer dragging support on the track
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickPercent = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
      const clickValue = min + (clickPercent / 100) * (max - min);

      // Determine nearest thumb
      const distToMin = Math.abs(clickValue - minVal);
      const distToMax = Math.abs(clickValue - maxVal);

      const targetThumb: 'min' | 'max' = distToMin <= distToMax ? 'min' : 'max';
      setActiveThumb(targetThumb);

      if (targetThumb === 'min') {
        const rounded = Math.round(Math.min(clickValue, maxVal - step) / step) * step;
        handleMinChange(rounded);
      } else {
        const rounded = Math.round(Math.max(clickValue, minVal + step) / step) * step;
        handleMaxChange(rounded);
      }

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!trackRef.current) return;
        const moveRect = trackRef.current.getBoundingClientRect();
        const moveX = moveEvent.clientX - moveRect.left;
        const movePercent = Math.min(100, Math.max(0, (moveX / moveRect.width) * 100));
        const rawValue = min + (movePercent / 100) * (max - min);
        const steppedValue = Math.round(rawValue / step) * step;

        if (targetThumb === 'min') {
          handleMinChange(steppedValue);
        } else {
          handleMaxChange(steppedValue);
        }
      };

      const handlePointerUp = () => {
        setActiveThumb(null);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [min, max, step, minVal, maxVal]
  );

  return (
    <div className={`select-none ${className}`}>
      {/* Header / Title matching card section headers */}
      {showTitle && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-sans">
            Select Price Range
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-[#0A4D40] hover:underline cursor-pointer font-sans"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      )}

      {/* Dual Slider Graphic & Animated Thumbs */}
      <div className="relative pt-1 pb-1 px-2">
        {/* Track wrapper */}
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          className="relative h-5 flex items-center cursor-pointer touch-none"
        >
          {/* Base Inactive Gray Track */}
          <div className="w-full h-[2.5px] bg-stone-200 rounded-full" />

          {/* Active Highlighted Brand Emerald Bar */}
          <div
            className="absolute h-[2.5px] bg-[#0A4D40] rounded-full transition-all duration-75"
            style={{
              left: `${minPercent}%`,
              width: `${Math.max(0, maxPercent - minPercent)}%`,
            }}
          />

          {/* Left Thumb (Starting Bubble) */}
          <div
            className={`glass-bubble-thumb ${
              activeThumb === 'min' ? 'ring-4 ring-[#0A4D40]/20' : ''
            }`}
            style={{ left: `${minPercent}%` }}
          />

          {/* Right Thumb (Ending Bubble) */}
          <div
            className={`glass-bubble-thumb ${
              activeThumb === 'max' ? 'ring-4 ring-[#0A4D40]/20' : ''
            }`}
            style={{ left: `${maxPercent}%` }}
          />

          {/* Hidden standard range inputs for native accessibility & screen readers */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={minVal}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            aria-label="Minimum price"
            className="absolute inset-0 opacity-0 pointer-events-none w-full"
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={maxVal}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            aria-label="Maximum price"
            className="absolute inset-0 opacity-0 pointer-events-none w-full"
          />
        </div>

        {/* Dynamic Labels Under Thumbs matching reference */}
        <div className="relative mt-1.5 h-4 text-stone-900 text-xs font-semibold select-none pointer-events-none">
          {/* Min Price */}
          <div
            className="absolute transition-all duration-75 whitespace-nowrap text-stone-900 font-sans text-xs font-semibold"
            style={{
              left: `${minPercent}%`,
              transform: minPercent < 15 ? 'translateX(0%)' : minPercent > 80 ? 'translateX(-100%)' : 'translateX(-50%)',
            }}
          >
            <span>₹{minVal.toLocaleString('en-IN')}</span>
          </div>

          {/* Max Price */}
          <div
            className="absolute transition-all duration-75 whitespace-nowrap text-stone-900 font-sans text-xs font-semibold"
            style={{
              left: `${maxPercent}%`,
              transform: maxPercent > 85 ? 'translateX(-100%)' : maxPercent < 20 ? 'translateX(0%)' : 'translateX(-50%)',
            }}
          >
            <span>₹{maxVal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Quick Budget Presets */}
      {showPresets && (
        <div className="mt-2 pt-2 border-t border-stone-100">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider font-sans block mb-1.5">
            Popular Price Brackets
          </span>
          <div className="flex flex-wrap gap-1">
            {PRESETS.map((p) => {
              const isActive = minVal === p.min && maxVal === p.max;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handlePresetClick(p.min, p.max)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer font-sans ${
                    isActive
                      ? 'bg-[#0A4D40] text-white border-[#0A4D40] font-semibold shadow-2xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Apply Button */}
      {showApplyButton && (
        <div className="mt-2.5 pt-2 flex items-center gap-2">
          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => onApply && onApply(minVal, maxVal)}
            className="flex-1 py-1.5 text-xs font-medium text-white bg-[#0A4D40] hover:bg-[#062E28] rounded-lg shadow-2xs transition active:scale-98 cursor-pointer"
          >
            Apply Range
          </button>
        </div>
      )}
    </div>
  );
};
