import type { PropsWithChildren } from 'react';
import StoreFooter from '@/components/store-footer';
import StoreHeader from '@/components/store-header';

export default function StoreLayout({ children }: PropsWithChildren) {
    return (
        <div className="dark flex min-h-screen flex-col">
            <StoreHeader />
            <main className="flex-1">{children}</main>
            <StoreFooter />
        </div>
    );
}
