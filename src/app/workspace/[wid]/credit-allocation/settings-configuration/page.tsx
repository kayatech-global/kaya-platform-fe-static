'use client';

import React, { useState } from 'react';
import { ShieldAlert, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Switch } from '@/components/atoms/switch';

// Custom purple slider component for this page
const PurpleSlider = ({
    value,
    onChange,
    min = 0,
    max = 100,
}: {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
}) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="relative w-48 h-2">
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {/* Track background */}
            <div className="absolute inset-0 bg-gray-200 rounded-full" />
            {/* Filled track */}
            <div
                className="absolute left-0 top-0 h-full bg-purple-600 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
            />
            {/* Thumb */}
            <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-purple-600 rounded-full shadow-md transition-all"
                style={{ left: `calc(${percentage}% - 8px)` }}
            />
        </div>
    );
};

export default function SettingsConfigurationPage() {
    const [warningThreshold, setWarningThreshold] = useState(80);
    const [criticalThreshold, setCriticalThreshold] = useState(95);
    const [emailNotifications, setEmailNotifications] = useState(true);

    const userEmail = 'john.doe@acme.com';

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Settings & Configuration
                </h1>
            </div>

            {/* Main Configuration Card */}
            <Card className="shadow-sm">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Alert Configuration
                    </CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                        Set thresholds for budget warnings and notifications.
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-6 space-y-8">
                    {/* Budget Thresholds Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-purple-600" />
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Budget Thresholds
                            </h3>
                        </div>

                        {/* Warning Threshold Row */}
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Warning Threshold
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Send alerts when budget utilization reaches this percentage.
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <PurpleSlider
                                    value={warningThreshold}
                                    onChange={setWarningThreshold}
                                    min={50}
                                    max={100}
                                />
                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100 w-12 text-right">
                                    {warningThreshold}%
                                </span>
                            </div>
                        </div>

                        {/* Critical Alert Threshold Row */}
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Critical Alert Threshold
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Escalate notifications when utilization reaches this percentage.
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <PurpleSlider
                                    value={criticalThreshold}
                                    onChange={setCriticalThreshold}
                                    min={50}
                                    max={100}
                                />
                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100 w-12 text-right">
                                    {criticalThreshold}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 dark:border-gray-800" />

                    {/* Notifications Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-purple-600" />
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Notifications
                            </h3>
                        </div>

                        {/* Email Notifications Row */}
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Email Notifications
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Receive alerts via email ({userEmail}).
                                </p>
                            </div>
                            <Switch
                                checked={emailNotifications}
                                onCheckedChange={setEmailNotifications}
                                className="data-[state=checked]:bg-purple-600"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
