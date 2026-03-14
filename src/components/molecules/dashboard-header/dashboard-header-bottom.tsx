import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/atoms/breadcrumb';
import {
    getPageTitleFromPath,
    getBreadcrumbLabelLevel3,
    getBreadcrumbLabelLevel4,
} from '@/constants/breadcrumb-labels';
import { usePathname } from 'next/navigation';
import React from 'react';
import { DashboardHeaderProps } from './dashboard-header';
import { cn } from '@/lib/utils';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useBreakpoint } from '@/hooks/use-breakpoints';

interface DashboardHeaderBottomProps extends DashboardHeaderProps {
    value: string;
}

function DashboardHeaderBottom({ isFullWidth }: Readonly<DashboardHeaderBottomProps>) {
    const pathName = usePathname().split('/');
    const [workspaceInfo] = useLocalStorage('workspaceInfo');
    const { isMobile } = useBreakpoint();

    return (
        <div
            className={cn('header-bottom px-6 py-4 flex justify-between items-center', {
                'px-16': isFullWidth,
                'px-6': !isFullWidth,
                'flex-col items-start': isMobile,
            })}
        >
            <p className="text-xl font-semibold text-blue-50">{getPageTitleFromPath(pathName)}</p>
            <div className="breadcrumbs-container">
                <Breadcrumb>
                    <BreadcrumbList className="flex items-center gap-x-1">
                        {pathName[1] !== 'workspaces' && pathName[1] !== 'enterprise-insights' && (
                            <>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className={cn('text-sm font-regular text-blue-100', { 'text-xs': isMobile })}>
                                        Workspace
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="text-sm font-regular text-blue-100" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className={cn('text-sm font-regular text-blue-100', { 'text-xs': isMobile })}>
                                        {workspaceInfo?.name}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="text-sm font-regular text-blue-100" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className={cn('text-sm font-regular text-blue-100', { 'text-xs': isMobile })}>
                                        {getBreadcrumbLabelLevel3(pathName[3])}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                                {pathName.length > 4 && (
                                    <>
                                        <BreadcrumbSeparator className="text-sm font-regular text-blue-100" />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage className={cn('text-sm font-regular text-blue-100', { 'text-xs': isMobile })}>
                                                {getBreadcrumbLabelLevel4(pathName[4])}
                                            </BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                )}
                            </>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </div>
    );
}

export default DashboardHeaderBottom;
