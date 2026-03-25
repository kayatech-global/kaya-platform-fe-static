'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ExecutionRuntimesTable } from './execution-runtimes-table';
import { ExecutionRuntimeForm } from './execution-runtime-form';
import { mockExecutionRuntimes, ExecutionRuntimeData } from '@/mocks/execution-runtimes-data';
import { toast } from 'sonner';

export const ExecutionRuntimesContainer = () => {
    const router = useRouter();
    const params = useParams();
    const [runtimes, setRuntimes] = useState<ExecutionRuntimeData[]>(mockExecutionRuntimes);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editingRuntime, setEditingRuntime] = useState<ExecutionRuntimeData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRuntimes = useMemo(() => {
        if (!searchQuery) return runtimes;
        const query = searchQuery.toLowerCase();
        return runtimes.filter(
            (rt) =>
                rt.name.toLowerCase().includes(query) ||
                rt.provider.toLowerCase().includes(query) ||
                rt.description.toLowerCase().includes(query)
        );
    }, [runtimes, searchQuery]);

    const handleCreate = () => {
        setIsEdit(false);
        setEditingRuntime(null);
        setIsFormOpen(true);
    };

    const handleEdit = (id: string) => {
        const runtime = runtimes.find((r) => r.id === id);
        if (runtime) {
            setEditingRuntime(runtime);
            setIsEdit(true);
            setIsFormOpen(true);
        }
    };

    const handleViewDetail = (id: string) => {
        router.push(`/workspace/${params.wid}/execution-runtimes/${id}`);
    };

    const handleDelete = (id: string) => {
        setRuntimes((prev) => prev.filter((r) => r.id !== id));
        toast.success('Runtime configuration deleted successfully');
    };

    const handleFormSubmit = (data: Partial<ExecutionRuntimeData>) => {
        if (isEdit && editingRuntime) {
            setRuntimes((prev) =>
                prev.map((r) =>
                    r.id === editingRuntime.id
                        ? { ...r, ...data, updatedAt: new Date().toISOString() }
                        : r
                )
            );
            toast.success('Runtime configuration updated successfully');
        } else {
            const newRuntime: ExecutionRuntimeData = {
                id: `rt-${String(runtimes.length + 1).padStart(3, '0')}`,
                name: data.name || '',
                description: data.description || '',
                provider: data.provider || 'kaya-runtime',
                status: data.provider === 'kaya-runtime' ? 'active' : 'provisioning',
                region: data.region,
                iamRole: data.iamRole,
                memory: data.memory,
                timeout: data.timeout,
                linkedWorkflows: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                environmentVariables: data.environmentVariables,
                tags: data.tags,
            };
            setRuntimes((prev) => [...prev, newRuntime]);
            toast.success(
                data.provider === 'kaya-runtime'
                    ? 'Runtime configuration created successfully'
                    : 'Runtime configuration created and provisioning started'
            );
        }
        setIsFormOpen(false);
    };

    return (
        <React.Fragment>
            <div className="metric-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div className="dashboard-left-section flex flex-col w-full gap-y-9">
                        <ExecutionRuntimesTable
                            runtimes={filteredRuntimes}
                            onNewButtonClick={handleCreate}
                            onEditButtonClick={handleEdit}
                            onViewDetail={handleViewDetail}
                            onDelete={handleDelete}
                            onSearch={setSearchQuery}
                        />
                    </div>
                </div>
            </div>
            <ExecutionRuntimeForm
                isOpen={isFormOpen}
                isEdit={isEdit}
                editingRuntime={editingRuntime}
                setOpen={setIsFormOpen}
                onSubmit={handleFormSubmit}
            />
        </React.Fragment>
    );
};
