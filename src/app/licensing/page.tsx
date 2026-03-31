'use client';

import React, { useState } from 'react';
import { Key, CheckCircle2, AlertCircle, Coins, History, Shield, Calendar, CreditCard, Clock, Layers, Building2, GitBranch } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/atoms/card';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import { cn } from '@/lib/utils';

// Mock data for license history
const mockLicenseHistory = [
    {
        id: '1',
        appliedDate: '2025-03-16',
        type: 'CAPACITY_LIMIT',
        licenseKey: 'ACME-XXXX-XXXX-2025',
        details: { workspaces: 50, workflowsPerWorkspace: 500 },
    },
    {
        id: '2',
        appliedDate: '2025-02-10',
        type: 'TOPUP',
        licenseKey: 'GLBX-XXXX-XXXX-2025',
        details: { workspaces: 20, workflowsPerWorkspace: 200 },
    },
    {
        id: '3',
        appliedDate: '2025-01-05',
        type: 'CAPACITY_LIMIT',
        licenseKey: 'S0YL-XXXX-XXXX-2025',
        details: { workspaces: 10, workflowsPerWorkspace: 100 },
    },
    {
        id: '4',
        appliedDate: '2025-03-01',
        type: 'CAPACITY_LIMIT',
        licenseKey: 'INIT-XXXX-XXXX-2025',
        details: { workspaces: 30, workflowsPerWorkspace: 300 },
    },
];

// Mock data for credit licenses
const mockCreditLicenses = [
    {
        id: '1',
        appliedDate: '2026-03-15',
        type: 'NEW',
        licenseKey: 'KAYA-ABCD-1234-5678',
        perCreditRate: 0.005,
        creditsAdded: 10000,
        subscriptionCredits: 100000,
        subscriptionExpiryDate: '2027-03-15',
    },
    {
        id: '2',
        appliedDate: '2026-03-10',
        type: 'CREDIT_TOPUP',
        licenseKey: 'KAYA-EFGH-9012-3456',
        perCreditRate: 0.0045,
        creditsAdded: 25000,
        subscriptionCredits: 100000,
        subscriptionExpiryDate: '2027-03-15',
    },
    {
        id: '3',
        appliedDate: '2026-02-28',
        type: 'NEW',
        licenseKey: 'KAYA-IJKL-7890-1234',
        perCreditRate: 0.005,
        creditsAdded: 50000,
        subscriptionCredits: 100000,
        subscriptionExpiryDate: '2027-02-28',
    },
];

type StatusMessage = {
    type: 'success' | 'error';
    message: string;
} | null;

const LicensingPage = () => {
    const [licenseKey, setLicenseKey] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [statusMessage, setStatusMessage] = useState<StatusMessage>(null);

    const handleApplyLicense = async () => {
        if (!licenseKey.trim()) {
            setStatusMessage({ type: 'error', message: 'Please enter a valid license key.' });
            return;
        }

        setIsApplying(true);
        setStatusMessage(null);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Simulate success/error (toggle based on key format)
        if (licenseKey.startsWith('KAYA-')) {
            setStatusMessage({
                type: 'success',
                message: 'License applied successfully! Your account has been updated.',
            });
            setLicenseKey('');
        } else {
            setStatusMessage({
                type: 'error',
                message: 'Invalid license key format. Please check and try again.',
            });
        }

        setIsApplying(false);
    };

    const maskLicenseKey = (key: string) => {
        const parts = key.split('-');
        if (parts.length === 4) {
            return `****-****-****-${parts[3]}`;
        }
        return key;
    };

    const getTypeVariant = (type: string): 'success' | 'info' | 'default' => {
        switch (type) {
            case 'NEW':
                return 'success';
            case 'CREDIT_TOPUP':
                return 'info';
            default:
                return 'default';
        }
    };

    const getHistoryTypeStyle = (type: string) => {
        switch (type) {
            case 'CAPACITY_LIMIT':
                return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'TOPUP':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const maskHistoryLicenseKey = (key: string) => {
        const parts = key.split('-');
        if (parts.length === 4) {
            return `${parts[0]}${'–••••–••••–'}${parts[3]}`;
        }
        return key;
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 pb-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Licensing & Keys</h1>

            {/* Apply License Key Section */}
            <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                    <CardTitle className="text-lg">Apply License Key</CardTitle>
                    <CardDescription>
                        Paste a license key provided by your Kaya Administrator to top-up credits, renew
                        subscription, or update capacity limits.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-0">
                        <div className="relative flex-1">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <input
                                type="text"
                                value={licenseKey}
                                onChange={(e) => setLicenseKey(e.target.value)}
                                placeholder="KAYA-XXXX-XXXX-XXXX"
                                className={cn(
                                    'w-full h-10 pl-10 pr-4 font-mono text-sm',
                                    'border border-gray-300 rounded-l-lg',
                                    'bg-white dark:bg-gray-700',
                                    'text-gray-900 dark:text-gray-100',
                                    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                                    'dark:border-gray-600 dark:focus:border-blue-400'
                                )}
                            />
                        </div>
                        <Button
                            onClick={handleApplyLicense}
                            loading={isApplying}
                            className="rounded-l-none"
                        >
                            Apply License
                        </Button>
                    </div>

                    {/* Status Message */}
                    {statusMessage && (
                        <div
                            className={cn(
                                'flex items-center gap-3 p-3 rounded-lg border',
                                statusMessage.type === 'success'
                                    ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                                    : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                            )}
                        >
                            {statusMessage.type === 'success' ? (
                                <CheckCircle2 className="size-5 shrink-0" />
                            ) : (
                                <AlertCircle className="size-5 shrink-0" />
                            )}
                            <span className="text-sm">{statusMessage.message}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Active License Card */}
            {mockCreditLicenses.length > 0 && (
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Shield className="size-5 text-blue-600 dark:text-blue-400" />
                            <CardTitle className="text-lg text-blue-900 dark:text-blue-100">Active Credit License</CardTitle>
                            <Badge variant="success" className="ml-2">Active</Badge>
                        </div>
                        <CardDescription className="text-blue-700 dark:text-blue-300">
                            Your currently active license key details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Row 1: License Key, Applied Date, Per-Credit Rate, Credits Added */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                <Key className="size-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">License Key</p>
                                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {maskLicenseKey(mockCreditLicenses[0].licenseKey)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                <Calendar className="size-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Applied Date</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {mockCreditLicenses[0].appliedDate}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                <CreditCard className="size-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Per-Credit Rate</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        ${mockCreditLicenses[0].perCreditRate.toFixed(4)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                <Coins className="size-5 text-green-600 dark:text-green-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Credits Added</p>
                                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                        +{mockCreditLicenses[0].creditsAdded.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Row 2: Subscription Credits, Subscription Expiry */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                <Layers className="size-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subscription Credits</p>
                                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                        {mockCreditLicenses[0].subscriptionCredits.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                <Clock className="size-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subscription Expiry</p>
                                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                        {mockCreditLicenses[0].subscriptionExpiryDate}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Credit Licenses Section */}
            <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Coins className="size-5 text-blue-600" />
                        <CardTitle className="text-lg">Credit Licenses</CardTitle>
                        <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                            {mockCreditLicenses.length}
                        </span>
                    </div>
                    <CardDescription>
                        Applied credit licenses for tracking credits added to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {mockCreditLicenses.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No credit licenses have been applied yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                            Applied Date
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                            Type
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                            License Key
                                        </th>
                                        <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                            Per-Credit Rate
                                        </th>
                                        <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                            Credits Added
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockCreditLicenses.map((license) => (
                                        <tr
                                            key={license.id}
                                            className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                        >
                                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                                                {license.appliedDate}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant={getTypeVariant(license.type)}>
                                                    {license.type}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400">
                                                {maskLicenseKey(license.licenseKey)}
                                            </td>
                                            <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                                                ${license.perCreditRate.toFixed(4)}
                                            </td>
                                            <td className="py-3 px-4 text-right font-semibold text-green-600 dark:text-green-400">
                                                +{license.creditsAdded.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Active Capacity License Card */}
            {mockLicenseHistory.length > 0 && (
                <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Shield className="size-5 text-emerald-600 dark:text-emerald-400" />
                            <CardTitle className="text-lg text-emerald-900 dark:text-emerald-100">Active Capacity License</CardTitle>
                            <Badge variant="success" className="ml-2">Active</Badge>
                        </div>
                        <CardDescription className="text-emerald-700 dark:text-emerald-300">
                            Your currently active capacity limits
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                <Key className="size-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">License Key</p>
                                    <p className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {maskHistoryLicenseKey(mockLicenseHistory[0].licenseKey)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                <Calendar className="size-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Applied Date</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {mockLicenseHistory[0].appliedDate}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                <Building2 className="size-5 text-teal-600 dark:text-teal-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Workspaces Limit</p>
                                    <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                                        {mockLicenseHistory[0].details.workspaces} workspaces
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                <GitBranch className="size-5 text-cyan-600 dark:text-cyan-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Workflows per Workspace</p>
                                    <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                                        {mockLicenseHistory[0].details.workflowsPerWorkspace} wf/ws
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Capacity Licenses Section */}
            <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <History className="size-5 text-blue-600" />
                        <CardTitle className="text-lg">Capacity Licenses</CardTitle>
                    </div>
                    <CardDescription>
                        Applied licenses are categorised by type for easier tracking.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {mockLicenseHistory.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No license history available.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                            Applied Date
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                            Type
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                            License Key
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                            Details
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockLicenseHistory.map((license) => (
                                        <tr
                                            key={license.id}
                                            className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                        >
                                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                                                {license.appliedDate}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={cn(
                                                    'inline-block px-2.5 py-1 text-xs font-medium rounded-full',
                                                    getHistoryTypeStyle(license.type)
                                                )}>
                                                    {license.type.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400">
                                                {maskHistoryLicenseKey(license.licenseKey)}
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-blue-600 dark:text-blue-400">
                                                {license.details.workspaces} ws / {license.details.workflowsPerWorkspace} wf/ws
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default LicensingPage;
