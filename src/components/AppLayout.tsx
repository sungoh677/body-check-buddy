import { ReactNode } from 'react';
import BottomNav from '@/components/BottomNav';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-lg px-4 pb-24 pt-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
