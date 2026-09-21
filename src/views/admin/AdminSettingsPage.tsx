'use client';

import React, { useState } from 'react';
import { 
  Save, 
  Store, 
  Mail, 
  Truck, 
  ShieldAlert, 
  CheckCircle
} from 'lucide-react';

interface AtelierSettings {
  storeName: string;
  tagline: string;
  supportEmail: string;
  conciergePhone: string;
  boutiqueAddress: string;
  currency: string;
  gstRate: number;
  freeShippingThreshold: number;
  standardShippingFee: number;
  allowCod: boolean;
  lowStockThreshold: number;
  maintenanceMode: boolean;
  emailOrderAlerts: boolean;
  emailLowStockAlerts: boolean;
}

const DEFAULT_SETTINGS: AtelierSettings = {
  storeName: 'NiVi Couture Luxury Atelier',
  tagline: 'Elegance Refined, Soul Defined',
  supportEmail: 'concierge@nivicouture.com',
  conciergePhone: '+971 4 345 6789',
  boutiqueAddress: 'Fashion Avenue, The Dubai Mall, Downtown Dubai, United Arab Emirates',
  currency: 'AED (د.إ) / INR (₹)',
  gstRate: 5,
  freeShippingThreshold: 2999,
  standardShippingFee: 150,
  allowCod: true,
  lowStockThreshold: 3,
  maintenanceMode: false,
  emailOrderAlerts: true,
  emailLowStockAlerts: true,
};

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AtelierSettings>(() => {
    try {
      const saved = localStorage.getItem('sareeaura_atelier_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = <K extends keyof AtelierSettings>(key: K, value: AtelierSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      try {
        localStorage.setItem('sareeaura_atelier_settings', JSON.stringify(settings));
      } catch (err) {
        console.error('Failed to save settings to localStorage', err);
      }
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 400);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0A4D40]"></span>
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              Atelier Configuration
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Atelier & Store Settings
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Configure store branding, concierge contact details, fiscal taxes, shipping rules, and system modes.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#0A4D40] to-[#062E28] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#0A4D40]/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Atelier settings saved and updated across the platform successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Boutique Branding */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Store className="w-5 h-5 text-[#0A4D40]" />
            <h2 className="font-serif text-base font-bold text-stone-900">
              Boutique Identity & Branding
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Store Brand Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Brand Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
              />
            </div>
          </div>
        </div>

        {/* Concierge & Contact */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Mail className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-serif text-base font-bold text-stone-900">
              Patron Concierge & Communications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Concierge Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                WhatsApp & VIP Phone Concierge
              </label>
              <input
                type="text"
                value={settings.conciergePhone}
                onChange={(e) => handleChange('conciergePhone', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Atelier Physical Address
              </label>
              <input
                type="text"
                value={settings.boutiqueAddress}
                onChange={(e) => handleChange('boutiqueAddress', e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Commerce Policies */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Truck className="w-5 h-5 text-purple-600" />
            <h2 className="font-serif text-base font-bold text-stone-900">
              Fiscal, Taxes & Delivery Thresholds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                GST / Apparel Tax Rate (%)
              </label>
              <input
                type="number"
                min={0}
                max={28}
                value={settings.gstRate}
                onChange={(e) => handleChange('gstRate', Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                min={0}
                value={settings.freeShippingThreshold}
                onChange={(e) => handleChange('freeShippingThreshold', Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Standard Shipping Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                value={settings.standardShippingFee}
                onChange={(e) => handleChange('standardShippingFee', Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="allowCod"
              checked={settings.allowCod}
              onChange={(e) => handleChange('allowCod', e.target.checked)}
              className="w-4 h-4 accent-[#0A4D40] rounded cursor-pointer"
            />
            <label htmlFor="allowCod" className="text-xs font-medium text-stone-700 cursor-pointer">
              Enable Cash On Delivery (COD) for eligible domestic pin codes
            </label>
          </div>
        </div>

        {/* Operational Modes & Notifications */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h2 className="font-serif text-base font-bold text-stone-900">
              Operations & Alert Notifications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Low Stock Threshold (Units)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={settings.lowStockThreshold}
                onChange={(e) => handleChange('lowStockThreshold', Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A4D40]/20 focus:border-[#0A4D40]"
              />
              <p className="text-[10px] text-stone-400 mt-1">Triggers amber warning badge in inventory</p>
            </div>

            <div className="flex flex-col justify-center space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emailOrderAlerts"
                  checked={settings.emailOrderAlerts}
                  onChange={(e) => handleChange('emailOrderAlerts', e.target.checked)}
                  className="w-4 h-4 accent-[#0A4D40] rounded cursor-pointer"
                />
                <label htmlFor="emailOrderAlerts" className="text-xs font-medium text-stone-700 cursor-pointer">
                  Send immediate email alerts on new patron orders
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emailLowStockAlerts"
                  checked={settings.emailLowStockAlerts}
                  onChange={(e) => handleChange('emailLowStockAlerts', e.target.checked)}
                  className="w-4 h-4 accent-[#0A4D40] rounded cursor-pointer"
                />
                <label htmlFor="emailLowStockAlerts" className="text-xs font-medium text-stone-700 cursor-pointer">
                  Send weekly low-stock digest to inventory team
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-[#0A4D40] to-[#062E28] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#0A4D40]/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Atelier Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
