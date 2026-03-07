'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { DataLineageTableContainer } from './data-lineage-table-container';
import { useDataLineage } from '@/hooks/use-data-lineage';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';

export const DataLineageContainer = () => {
    const {
        isLg,
        isLoading,
        loadingData,
        loadingView,
        dataLineages,
        workflowOptions,
        sessionQueryParams,
        modular,
        linear,
        onDataLineageFilter,
        onViewDataLineage,
    } = useDataLineage();

    if (isLoading) return <PlatformConfigurationSuiteSkeleton hasCards={false} />;

    return (
        <div className="metric-page pb-4">
            <div className="flex justify-between gap-x-9">
                <div
                    className={cn('dashboard-left-section flex flex-col w-full', {
                        'gap-y-9': isLg,
                    })}
                >
                    <DataLineageTableContainer
                        dataLineages={dataLineages}
                        workflowOptions={workflowOptions}
                        sessionQueryParams={sessionQueryParams}
                        loadingData={loadingData}
                        loadingView={loadingView}
                        modular={modular}
                        linear={linear}
                        onDataLineageFilter={onDataLineageFilter}
                        onViewDataLineage={onViewDataLineage}
                    />
                </div>
            </div>
        </div>
    );
};
