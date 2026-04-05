'use client';

import React, { useState, useMemo } from 'react';
import { RuntimeTable } from './runtime-table';
import { RuntimeForm } from './runtime-form';
import { mockRuntimes } from '../mock-data';
import { Runtime, RuntimeFormData } from '../types';
import { toast } from 'sonner';
import { 
    Breadcrumb, 
    BreadcrumbItem, 
    BreadcrumbList, 
    BreadcrumbPage, 
    BreadcrumbSeparator 
} from '@/components/atoms/breadcrumb';


export const RuntimeContainer = () => {
    const [runtimes, setRuntimes] = useState<Runtime[]>(mockRuntimes);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRuntime, setEditingRuntime] = useState<Runtime | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRuntimes = useMemo(() => {
        if (!searchTerm) return runtimes;
        return runtimes.filter(r => 
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.region.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [runtimes, searchTerm]);

    const handleNewClick = () => {
        setEditingRuntime(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (id: string) => {
        const runtime = runtimes.find(r => r.id === id);
        if (runtime) {
            setEditingRuntime(runtime);
            setIsFormOpen(true);
        }
    };

    const handleDelete = (id: string) => {
        setRuntimes(prev => prev.filter(r => r.id !== id));
        toast.success('Runtime deleted successfully');
    };

    const handleFilter = (search: string) => {
        setSearchTerm(search);
    };

    const handleFormSubmit = (data: RuntimeFormData) => {
        if (editingRuntime) {
            // Update existing
            setRuntimes(prev => prev.map(r => 
                r.id === editingRuntime.id 
                    ? { ...r, name: data.name, region: data.region }
                    : r
            ));
            toast.success('Runtime updated successfully');
        } else {
            // Create new
            const newRuntime: Runtime = {
                id: String(Date.now()),
                name: data.name,
                region: data.region,
                status: 'Queued',
                createdAt: new Date().toISOString().split('T')[0],
            };
            setRuntimes(prev => [newRuntime, ...prev]);
            toast.success('Runtime created successfully');
        }
        setEditingRuntime(null);
    };

    return (
        <div className="runtime-page pb-4">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-sm text-gray-500 dark:text-gray-400">
                                    Workspace
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-sm text-gray-500 dark:text-gray-400">
                                    Test
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    AWS AgentCore Runtimes
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Hero Banner */}
                <div className="rounded-[20px] p-6 bg-gradient-to-r from-blue-600 to-sky-500 mb-6">
                    <h1 className="text-2xl font-bold text-white mb-2">AWS AgentCore Runtimes</h1>
                    <p className="text-blue-100 text-sm max-w-2xl">
                        Manage and deploy your AI workflows to AWS AgentCore runtime environments. 
                        Configure connections, monitor status, and scale your agents seamlessly.
                    </p>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-gray-800 rounded-[20px] shadow-sm">
                <RuntimeTable
                    data={filteredRuntimes}
                    onNewClick={handleNewClick}
                    onEditClick={handleEditClick}
                    onDelete={handleDelete}
                    onFilter={handleFilter}
                />
            </div>

            {/* Form Slide-over */}
            <RuntimeForm
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSubmit={handleFormSubmit}
                isEdit={!!editingRuntime}
                initialData={editingRuntime ? {
                    name: editingRuntime.name,
                    region: editingRuntime.region,
                } : undefined}
            />
        </div>
    );
};
