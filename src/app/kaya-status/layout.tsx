import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import '../globals.css';
import React from 'react';

export const metadata: Metadata = {
    title: 'KAYA Platform Status',
};

const KayaStatusLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className={cn('w-full min-h-screen bg-[#F1F1F1]', 'dark:bg-[#2B3340]')}>
            {children}
        </div>
    );
};

export default KayaStatusLayout;
