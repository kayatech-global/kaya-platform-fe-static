import type { Metadata } from 'next';
import DashboardHeader from '@/components/molecules/dashboard-header/dashboard-header';
import { LeftNavigation } from '@/components/molecules/left-navigation/left-navigation';
import { cn } from '@/lib/utils';
import '../globals.css';
import React from 'react';

export const metadata: Metadata = {
    title: 'KAYA AI Platform - Licensing',
};

const LicensingLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <div className="flex h-screen">
            <LeftNavigation />
            <div className="flex flex-col flex-1 overflow-hidden">
                <DashboardHeader isFullWidth />
                <div className={cn('flex-1 overflow-auto bg-[#F1F1F1] px-8 py-8', 'dark:bg-[#2B3340]')}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default LicensingLayout;
