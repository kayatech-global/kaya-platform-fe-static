'use client';

import React from 'react';
import DashboardHeaderTop from './dashboard-header-top';
import DashboardHeaderBottom from './dashboard-header-bottom';
import { cn } from '@/lib/utils';

export interface DashboardHeaderProps {
    isFullWidth?: boolean;
}

const DashboardHeader = ({ isFullWidth = false }: DashboardHeaderProps) => {
    return (
        <>
            <header className="dashboard-header sticky top-0 z-10 dashboard-header-bg-gradient shrink-0 transition-[width,height] ease-linear">
                <DashboardHeaderTop isFullWidth={isFullWidth} value={'top'} />
            </header>
            <div
                className={cn(
                    'dashboard-header dashboard-header-bg-gradient h-[127px] shrink-0 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-[127px]',
                    { 'h-[127px]': !isFullWidth },
                    { 'h-fit': isFullWidth }
                )}
            >
                <DashboardHeaderBottom isFullWidth={isFullWidth} value="bottom" />
            </div>
        </>
    );
};

export default DashboardHeader;
