'use client';

import React, { useState } from 'react';
import { Key, CheckCircle2, AlertCircle, Coins, LayoutGrid } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/atoms/tabs';
import { cn } from '@/lib/utils';

// Mock data for credit licenses
const mockCreditLicenses = [
    {
        id: '1',
        appliedDate: '2026-03-15',
        type: 'NEW',
        licenseKey: 'KAYA-ABCD-1234-5678',
        perCreditRate: 0.005,
        creditsAdded: 10000,
    },
    {
        id: '2',
        appliedDate: '2026-03-10',
        type: 'CREDIT_TOPUP',
        licenseKey: 'KAYA-EFGH-9012-3456',
        perCreditRate: 0.0045,
        creditsAdded: 25000,
    },
    {
        id: '3',
        appliedDate: '2026-02-28',
        type: 'NEW',
        licenseKey: 'KAYA-IJKL-7890-1234',
        perCreditRate: 0.005,
        creditsAdded: 50000,
    },
];

// Mock data for capacity licenses
const mockCapacityLicenses = [
    {
        id: '1',
        appliedDate: '2026-03-12',
        type: 'CAPACITY_UPGRADE',
        licenseKey: 'KAYA-MNOP-5678-9012',
        details: '+10 wf/workspace',
        validUntil: '2027-03-12',
    },
    {
        id: '2',
        appliedDate: '2026-02-20',
        type: 'CAPACITY_LIMIT',
        licenseKey: 'KAYA-QRST-3456-7890',
        details: '5 ws / 20 wf/ws',
        validUntil: null,
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

    const getTypeVariant = (type: string): 'success' | 'info' | 'warning' | 'default' => {
        switch (type) {
            case 'NEW':
                return 'success';
            case 'CREDIT_TOPUP':
                return 'info';
            case 'CAPACITY_UPGRADE':
                return 'info';
            case 'CAPACITY_LIMIT':
                return 'warning';
            default:
                return 'default';
        }
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

            {/* License History Section */}
            <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                    <CardTitle className="text-lg">License History</CardTitle>
                    <CardDescription>
                        Applied licenses are categorised by type for easier tracking.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="credit" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="credit" className="gap-2">
                                <Coins className="size-4" />
                                Credit Licenses
                                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                                    {mockCreditLicenses.length}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="capacity" className="gap-2">
                                <LayoutGrid className="size-4" />
                                Capacity Licenses
                                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                                    {mockCapacityLicenses.length}
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Credit Licenses Tab */}
                        <TabsContent value="credit">
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
                        </TabsContent>

                        {/* Capacity Licenses Tab */}
                        <TabsContent value="capacity">
                            {mockCapacityLicenses.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No capacity licenses have been applied yet.
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
                                                    Details
                                                </th>
                                                <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-300">
                                                    Valid Until
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mockCapacityLicenses.map((license) => (
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
                                                        {license.licenseKey}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-gray-100">
                                                        {license.details}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                                                        {license.validUntil || '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default LicensingPage;
