import { useEffect } from 'react';
import type { ReactNode } from 'react';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import { forceLightTheme } from '@/hooks/use-appearance';

export default function PublicLayout({ children }: { children: ReactNode }) {
    useEffect(() => forceLightTheme(), []);

    return (
        <div className="flex min-h-screen flex-col bg-[#FFF8EE] text-[#2B1200]">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
        </div>
    );
}
