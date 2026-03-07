'use client';

import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { MemoryStoreTable } from './memory-store-table';
import { MemoryStoreForm } from './memory-store-form';
import { useDatabaseQuery } from '@/hooks/use-common';

export interface DatabaseType {
    id: string;
    name: string;
    connectorSource: string;
    lastSync: string;
    search?: string;
    isReadOnly?: boolean;
}

export const MemoryStoreContainer = () => {
    const [databaseData, setDatabaseData] = useState<DatabaseType[]>([]);

    const { isXxLg } = useBreakpoint();
    const [isOpen, setIsOpen] = useState(false);

    const { isFetching } = useDatabaseQuery({
        cacheTime: 10,
        onSuccess: data => {
            const mapData = data?.map(x => ({
                id: x.id as string,
                name: x.name,
                connectorSource: x.configurations.databaseName as string,
                lastSync: x.updatedAt as string,
                isReadOnly: x?.isReadOnly,
            }));
            setDatabaseData(mapData);
        },
        onError: () => {
            setDatabaseData([]);
        },
    });

    return (
        <React.Fragment>
            <div className="database-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div
                        className={cn('dashboard-left-section flex flex-col w-full my-6', {
                            'gap-y-9': isXxLg,
                        })}
                    >
                        <MemoryStoreTable data={[]} setIsOpen={setIsOpen} />
                    </div>
                </div>
            </div>
            <MemoryStoreForm
                databaseData={databaseData}
                isFetching={isFetching}
                isEdit={false}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
            />
        </React.Fragment>
    );
};
