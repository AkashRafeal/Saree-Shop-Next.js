import React, { Suspense } from 'react';
import { CheckoutPage } from '@/views/customer/CheckoutPage';

export default function StorefrontCheckoutPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 text-center text-stone-500">Loading checkout...</div>}>
      <CheckoutPage />
    </Suspense>
  );
}
