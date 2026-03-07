import type { Metadata } from 'next';
import DashboardHeader from '@/components/molecules/dashboard-header/dashboard-header';
import { cn } from '@/lib/utils';
import '../globals.css';
import React from 'react';

export const metadata: Metadata = {
    title: 'KAYA AI Platform',
};

const WorkspacesLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <React.Fragment>
            <DashboardHeader isFullWidth />
            <div className={cn('w-full min-h-screen bg-[#F1F1F1] px-8', 'dark:bg-[#2B3340]')}>
                <div className="w-fit mx-auto pt-8">{children}</div>
            </div>
        </React.Fragment>
    );
};

export default WorkspacesLayout;
