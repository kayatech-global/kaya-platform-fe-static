import HOCProtectedRoute from '@/components/hoc/hoc-protected-route';
import { TooltipProvider } from '@/components/atoms/tooltip';
import DashboardHeader from '@/components/molecules/dashboard-header/dashboard-header';
import { cn } from '@/lib/utils';
import React from 'react';

export const metadata = {
    title: 'Enterprise Insights - KAYA AI Platform',
    description: 'Platform-wide performance analytics and health monitoring for administrators',
};

const EnterpriseInsightsLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <HOCProtectedRoute>
            <TooltipProvider delayDuration={200}>
                <React.Fragment>
                    <DashboardHeader isFullWidth />
                    <main className={cn('min-h-screen bg-[#F1F1F1]', 'dark:bg-[#2B3340]')}>
                        {children}
                    </main>
                </React.Fragment>
            </TooltipProvider>
        </HOCProtectedRoute>
    );
};

export default EnterpriseInsightsLayout;
