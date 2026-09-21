import React, { Suspense } from 'react';
import { ShopPage } from '@/pages/public/ShopPage';

export default function StorefrontShopPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 text-center text-stone-500">Loading collection...</div>}>
      <ShopPage />
    </Suspense>
  );
}
