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

    const handleDeploy = (id: string) => {
        setRuntimes(prev => prev.map(r => 
            r.id === id 
                ? { ...r, status: 'Deployed' as const, updatedAt: new Date().toISOString().split('T')[0] }
                : r
        ));
        toast.success('Runtime deployed successfully');
    };

    const handleRedeploy = (id: string) => {
        setRuntimes(prev => prev.map(r => 
            r.id === id 
                ? { ...r, status: 'Deployed' as const, updatedAt: new Date().toISOString().split('T')[0] }
                : r
        ));
        toast.success('Runtime re-deployed successfully');
    };

    const handleHealthCheck = (id: string) => {
        // Health check is handled in the dialog component
        // This is just a callback for logging/analytics purposes
        console.log('Health check initiated for runtime:', id);
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
                    ? { 
                        ...r, 
                        name: data.name, 
                        description: data.description, 
                        provider: data.provider,
                        region: data.region,
                        credentialType: data.credentialType,
                        accessKey: data.accessKey,
                        secretKey: data.secretKey,
                        roleArn: data.roleArn,
                        idleTimeout: data.idleTimeout,
                        maxLifetime: data.maxLifetime,
                        sourceType: data.sourceType,
                        ecrRepositoryUri: data.ecrRepositoryUri,
                        imageTag: data.imageTag,
                        environmentVariables: data.environmentVariables,
                        updatedAt: new Date().toISOString().split('T')[0],
                    }
                    : r
            ));
            toast.success('Runtime updated successfully');
        } else {
            // Create new
            const newRuntime: Runtime = {
                id: String(Date.now()),
                name: data.name,
                description: data.description,
                provider: data.provider,
                region: data.region,
                status: 'Queued',
                createdAt: new Date().toISOString().split('T')[0],
                credentialType: data.credentialType,
                accessKey: data.accessKey,
                secretKey: data.secretKey,
                roleArn: data.roleArn,
                idleTimeout: data.idleTimeout,
                maxLifetime: data.maxLifetime,
                sourceType: data.sourceType,
                ecrRepositoryUri: data.ecrRepositoryUri,
                imageTag: data.imageTag,
                environmentVariables: data.environmentVariables,
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
                                    Runtimes
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
                    onDeploy={handleDeploy}
                    onRedeploy={handleRedeploy}
                    onHealthCheck={handleHealthCheck}
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
                    provider: editingRuntime.provider || 'aws-agentcore',
                    region: editingRuntime.region,
                    credentialType: editingRuntime.credentialType || 'key-access',
                    accessKey: editingRuntime.accessKey || 'AKIAIOSFODNN7EXAMPLE',
                    secretKey: editingRuntime.secretKey || 'aws-secret-key-prod',
                    roleArn: editingRuntime.roleArn || '',
                    idleTimeout: editingRuntime.idleTimeout || 300,
                    maxLifetime: editingRuntime.maxLifetime || 3600,
                    sourceType: editingRuntime.sourceType || 'ecr-container',
                    ecrRepositoryUri: editingRuntime.ecrRepositoryUri || '123456789012.dkr.ecr.us-east-1.amazonaws.com/my-workflow',
                    imageTag: editingRuntime.imageTag || 'latest',
                    environmentVariables: editingRuntime.environmentVariables && editingRuntime.environmentVariables.length > 0
                        ? editingRuntime.environmentVariables
                        : [{ key: '', value: '' }],
                } : undefined}
            />
        </div>
    );
};
