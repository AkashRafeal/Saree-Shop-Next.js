import React, { Suspense } from 'react';
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerLayout>
      {children}
      <Suspense fallback={null}>
        <MobileBottomNav />
      </Suspense>
    </CustomerLayout>
  );
}
