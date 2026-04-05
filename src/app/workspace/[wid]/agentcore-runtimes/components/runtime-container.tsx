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
    const [isSaving, setIsSaving] = useState(false);

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

    const handleFormSubmit = async (data: RuntimeFormData) => {
        setIsSaving(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (editingRuntime) {
            // Update existing
            setRuntimes(prev => prev.map(r => 
                r.id === editingRuntime.id 
                    ? { ...r, name: data.name, description: data.description, region: data.region }
                    : r
            ));
            toast.success('Runtime updated successfully');
        } else {
            // Create new
            const newRuntime: Runtime = {
                id: String(Date.now()),
                name: data.name,
                description: data.description,
                region: data.region,
                status: 'Queued',
                createdAt: new Date().toISOString().split('T')[0],
            };
            setRuntimes(prev => [newRuntime, ...prev]);
            toast.success('Runtime created successfully');
        }
        
        setIsSaving(false);
        setIsFormOpen(false);
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

            {/* Form Drawer */}
            <RuntimeForm
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                onSubmit={handleFormSubmit}
                isEdit={!!editingRuntime}
                isReadOnly={editingRuntime?.isReadOnly}
                isSaving={isSaving}
                initialData={editingRuntime ? {
                    name: editingRuntime.name,
                    description: editingRuntime.description || '',
                    region: editingRuntime.region,
                    configurations: {
                        awsAccessKeyId: '',
                        awsSecretAccessKeyId: '',
                        executionTimeout: 300,
                        maxConcurrency: 10,
                        memorySize: 512,
                        enableLogging: true,
                        enableTracing: false,
                    },
                } : undefined}
            />
        </div>
    );
};
