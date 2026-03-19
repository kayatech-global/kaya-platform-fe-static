'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
    DialogDescription,
} from '@/components/atoms/dialog';
import { Button } from '@/components';
import { Input } from '@/components/atoms/input';
import { Slider } from '@/components/atoms/slider';
import { Badge } from '@/components/atoms/badge';
import { Users, Shield, FileText, Settings, Trash2, Plus, DollarSign, Cpu, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
export type GovernanceDialogType = 'access' | 'quotas' | 'audit' | 'environment' | null;

interface GovernanceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string | number;
    workspaceName?: string;
}

// Mock data for workflows
const mockWorkflows = [
    { id: 'wf-1', name: 'Customer Support Agent', budgetLimit: 500, currentUsage: 320 },
    { id: 'wf-2', name: 'Sales Outreach Bot', budgetLimit: 1000, currentUsage: 750 },
    { id: 'wf-3', name: 'Data Processing Pipeline', budgetLimit: 250, currentUsage: 180 },
];

// Mock audit logs
const mockAuditLogs = [
    { id: 1, action: 'Budget Updated', user: 'john@example.com', timestamp: '2026-03-19 10:30', details: 'Changed budget limit from $500 to $750' },
    { id: 2, action: 'User Added', user: 'admin@example.com', timestamp: '2026-03-18 14:22', details: 'Added jane@example.com as Editor' },
    { id: 3, action: 'Workflow Created', user: 'john@example.com', timestamp: '2026-03-17 09:15', details: 'Created "Customer Support Agent"' },
    { id: 4, action: 'Environment Changed', user: 'admin@example.com', timestamp: '2026-03-16 16:45', details: 'Switched from Dev to Staging' },
];

// Mock users for access management
const mockUsers = [
    { id: 1, email: 'john@example.com', role: 'Admin', avatar: 'J' },
    { id: 2, email: 'jane@example.com', role: 'Editor', avatar: 'J' },
    { id: 3, email: 'bob@example.com', role: 'Viewer', avatar: 'B' },
];

// Manage Access Dialog
export const ManageAccessDialog: React.FC<GovernanceDialogProps> = ({
    open,
    onOpenChange,
    workspaceName,
}) => {
    const [users, setUsers] = useState(mockUsers);
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('Viewer');

    const handleAddUser = () => {
        if (newEmail) {
            setUsers([...users, { id: users.length + 1, email: newEmail, role: newRole, avatar: newEmail[0].toUpperCase() }]);
            setNewEmail('');
        }
    };

    const handleRemoveUser = (id: number) => {
        setUsers(users.filter(u => u.id !== id));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        Manage Access
                    </DialogTitle>
                    <DialogDescription>
                        Manage user access and roles for {workspaceName || 'this workspace'}
                    </DialogDescription>
                </DialogHeader>
                <DialogBody className="space-y-4 py-4">
                    {/* Add User Section */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Email address"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="flex-1"
                        />
                        <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="h-9 rounded-lg border border-gray-300 px-3 text-sm dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="Viewer">Viewer</option>
                            <option value="Editor">Editor</option>
                            <option value="Admin">Admin</option>
                        </select>
                        <Button variant="primary" size="sm" onClick={handleAddUser}>
                            <Plus size={16} />
                        </Button>
                    </div>

                    {/* User List */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-300">
                                        {user.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
                                        <Badge variant="secondary" className="text-xs">{user.role}</Badge>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveUser(user.id)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => onOpenChange(false)}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Resource Quotas Dialog with Budget Limits
export const ResourceQuotasDialog: React.FC<GovernanceDialogProps> = ({
    open,
    onOpenChange,
    workspaceName,
}) => {
    const [workflows, setWorkflows] = useState(mockWorkflows);
    const [globalBudget, setGlobalBudget] = useState(2000);

    const handleBudgetChange = (workflowId: string, newBudget: number) => {
        setWorkflows(workflows.map(wf => 
            wf.id === workflowId ? { ...wf, budgetLimit: newBudget } : wf
        ));
    };

    const totalAllocated = workflows.reduce((sum, wf) => sum + wf.budgetLimit, 0);
    const totalUsed = workflows.reduce((sum, wf) => sum + wf.currentUsage, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Resource Quotas & Budget Limits
                    </DialogTitle>
                    <DialogDescription>
                        Configure budget limits for each workflow in {workspaceName || 'this workspace'}
                    </DialogDescription>
                </DialogHeader>
                <DialogBody className="space-y-6 py-4">
                    {/* Global Budget Overview */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Global Workspace Budget</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Maximum budget for all workflows combined</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-green-600">${globalBudget}</span>
                                <span className="text-sm text-gray-500">/month</span>
                            </div>
                        </div>
                        <Slider
                            value={[globalBudget]}
                            onValueChange={(value) => setGlobalBudget(value[0])}
                            max={10000}
                            step={100}
                            className="mt-2"
                        />
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>$0</span>
                            <span>$10,000</span>
                        </div>
                    </div>

                    {/* Budget Summary */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Allocated</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">${totalAllocated}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Currently Used</p>
                            <p className="text-lg font-semibold text-blue-600">${totalUsed}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
                            <p className="text-lg font-semibold text-green-600">${globalBudget - totalUsed}</p>
                        </div>
                    </div>

                    {/* Per-Workflow Budgets */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <Cpu size={16} />
                            Workflow Budget Limits
                        </h4>
                        <div className="space-y-4">
                            {workflows.map((workflow) => {
                                const usagePercent = (workflow.currentUsage / workflow.budgetLimit) * 100;
                                const isOverBudget = usagePercent > 90;
                                
                                return (
                                    <div
                                        key={workflow.id}
                                        className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{workflow.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Usage: ${workflow.currentUsage} / ${workflow.budgetLimit}
                                                </p>
                                            </div>
                                            <Badge variant={isOverBudget ? 'destructive' : 'secondary'}>
                                                {usagePercent.toFixed(0)}% used
                                            </Badge>
                                        </div>
                                        
                                        {/* Usage Progress Bar */}
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-3 overflow-hidden">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full transition-all',
                                                    isOverBudget ? 'bg-red-500' : 'bg-blue-500'
                                                )}
                                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                            />
                                        </div>

                                        {/* Budget Limit Slider */}
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-500 w-16">Limit:</span>
                                            <Slider
                                                value={[workflow.budgetLimit]}
                                                onValueChange={(value) => handleBudgetChange(workflow.id, value[0])}
                                                max={2000}
                                                step={50}
                                                className="flex-1"
                                            />
                                            <Input
                                                type="number"
                                                value={workflow.budgetLimit}
                                                onChange={(e) => handleBudgetChange(workflow.id, parseInt(e.target.value) || 0)}
                                                className="w-24 text-center"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => onOpenChange(false)}>
                        Save Budget Limits
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Audit Logs Dialog
export const AuditLogsDialog: React.FC<GovernanceDialogProps> = ({
    open,
    onOpenChange,
    workspaceName,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-600" />
                        Audit Logs
                    </DialogTitle>
                    <DialogDescription>
                        Activity history for {workspaceName || 'this workspace'}
                    </DialogDescription>
                </DialogHeader>
                <DialogBody className="py-4">
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {mockAuditLogs.map((log) => (
                            <div
                                key={log.id}
                                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.action}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{log.details}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Clock size={12} />
                                            {log.timestamp}
                                        </p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{log.user}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button variant="primary" size="sm">
                        Export Logs
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Environment Settings Dialog
export const EnvironmentSettingsDialog: React.FC<GovernanceDialogProps> = ({
    open,
    onOpenChange,
    workspaceName,
}) => {
    const [environment, setEnvironment] = useState('development');
    const [autoScale, setAutoScale] = useState(true);
    const [maxInstances, setMaxInstances] = useState(5);

    const environments = [
        { id: 'development', label: 'Development', description: 'For testing and development', color: 'blue' },
        { id: 'staging', label: 'Staging', description: 'Pre-production testing', color: 'yellow' },
        { id: 'production', label: 'Production', description: 'Live environment', color: 'red' },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-gray-600" />
                        Environment Settings
                    </DialogTitle>
                    <DialogDescription>
                        Configure environment for {workspaceName || 'this workspace'}
                    </DialogDescription>
                </DialogHeader>
                <DialogBody className="space-y-6 py-4">
                    {/* Environment Selection */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-2 block">
                            Environment Type
                        </label>
                        <div className="space-y-2">
                            {environments.map((env) => (
                                <button
                                    key={env.id}
                                    onClick={() => setEnvironment(env.id)}
                                    className={cn(
                                        'w-full p-3 rounded-lg border text-left transition-all',
                                        environment === env.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            'w-3 h-3 rounded-full',
                                            env.color === 'blue' && 'bg-blue-500',
                                            env.color === 'yellow' && 'bg-yellow-500',
                                            env.color === 'red' && 'bg-red-500'
                                        )} />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{env.label}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{env.description}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Auto-scaling */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Auto-scaling</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Automatically scale resources based on demand</p>
                        </div>
                        <button
                            onClick={() => setAutoScale(!autoScale)}
                            className={cn(
                                'relative w-11 h-6 rounded-full transition-colors',
                                autoScale ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                            )}
                        >
                            <span
                                className={cn(
                                    'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                                    autoScale ? 'left-5' : 'left-0.5'
                                )}
                            />
                        </button>
                    </div>

                    {/* Max Instances */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-2 block">
                            Maximum Instances
                        </label>
                        <div className="flex items-center gap-4">
                            <Slider
                                value={[maxInstances]}
                                onValueChange={(value) => setMaxInstances(value[0])}
                                max={20}
                                min={1}
                                step={1}
                                className="flex-1"
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-8 text-center">
                                {maxInstances}
                            </span>
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => onOpenChange(false)}>
                        Save Settings
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
