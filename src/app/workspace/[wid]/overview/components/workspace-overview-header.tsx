'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/atoms/breadcrumb';

interface WorkspaceOverviewHeaderProps {
    workspaceName: string;
    workspaceDescription?: string;
}

export const WorkspaceOverviewHeader: React.FC<WorkspaceOverviewHeaderProps> = ({
    workspaceName,
    workspaceDescription,
}) => {
    const params = useParams();
    const workspaceId = params.wid as string;

    return (
        <div className="workspace-overview-header flex flex-col gap-y-4">
            {/* Breadcrumb Navigation */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/workspaces">All Workspaces</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={`/workspace/${workspaceId}`}>{workspaceName || 'Workspace'}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Overview</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header Row with Title */}
            <div className="flex flex-col gap-y-1 min-w-0">
                <h1 className="text-xl font-semibold text-foreground">
                    {workspaceName || 'Workspace'} Overview
                </h1>
                {workspaceDescription && (
                    <p className="text-sm text-muted-foreground max-w-2xl line-clamp-2">
                        {workspaceDescription}
                    </p>
                )}
            </div>
        </div>
    );
};
