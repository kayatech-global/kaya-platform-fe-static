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
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { DashboardHeaderProps } from './dashboard-header';
import { cn } from '@/lib/utils';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { startCase } from 'lodash';

interface DashboardHeaderBottomProps extends DashboardHeaderProps {
    value: string;
}

const STATUS_ADMIN_LABELS: Record<string, string> = {
    incidents: 'Incidents',
    maintenance: 'Maintenance',
    components: 'Components',
    subscribers: 'Subscribers',
    escalation: 'Escalation',
    health: 'Health Monitor',
    'sla-reports': 'SLA Reports',
};

function DashboardHeaderBottom({ isFullWidth }: Readonly<DashboardHeaderBottomProps>) {
    const pathName = usePathname().split('/');
    const [workspaceInfo] = useLocalStorage('workspaceInfo');
    const { isMobile } = useBreakpoint();

    const isStatusAdmin = pathName[1] === 'status' && pathName[2] === 'admin';
    const bcClass = cn('text-sm font-regular text-blue-100', { 'text-xs': isMobile });

    const renderStatusAdminBreadcrumbs = () => {
        const subPage = pathName[3]; // e.g. "incidents", "components", etc.
        return (
            <>
                <BreadcrumbItem>
                    <Link href="/workspaces" className={cn(bcClass, 'hover:text-white transition-colors')}>
                        Workspaces
                    </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator className={bcClass} />
                <BreadcrumbItem>
                    {subPage ? (
                        <Link href="/status/admin" className={cn(bcClass, 'hover:text-white transition-colors')}>
                            Status Management
                        </Link>
                    ) : (
                        <BreadcrumbPage className={bcClass}>Status Management</BreadcrumbPage>
                    )}
                </BreadcrumbItem>
                {subPage && (
                    <>
                        <BreadcrumbSeparator className={bcClass} />
                        <BreadcrumbItem>
                            <BreadcrumbPage className={bcClass}>
                                {STATUS_ADMIN_LABELS[subPage] ?? startCase(subPage.replaceAll(/-/g, ' '))}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}
            </>
        );
    };

    const renderWorkspaceBreadcrumbs = () => (
        <>
            <BreadcrumbItem>
                <BreadcrumbPage className={bcClass}>Workspace</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator className={bcClass} />
            <BreadcrumbItem>
                <BreadcrumbPage className={bcClass}>{workspaceInfo?.name}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator className={bcClass} />
            <BreadcrumbItem>
                <BreadcrumbPage className={bcClass}>{getBreadcrumbLabelLevel3(pathName[3])}</BreadcrumbPage>
            </BreadcrumbItem>
            {pathName.length > 4 && (
                <>
                    <BreadcrumbSeparator className={bcClass} />
                    <BreadcrumbItem>
                        <BreadcrumbPage className={bcClass}>{getBreadcrumbLabelLevel4(pathName[4])}</BreadcrumbPage>
                    </BreadcrumbItem>
                </>
            )}
        </>
    );

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
                        {isStatusAdmin && renderStatusAdminBreadcrumbs()}
                        {!isStatusAdmin && pathName[1] !== 'workspaces' && renderWorkspaceBreadcrumbs()}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </div>
    );
}

export default DashboardHeaderBottom;
