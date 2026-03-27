'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';

export default function SettingsPage() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [alert50, setAlert50] = useState(true);
    const [alert25, setAlert25] = useState(true);
    const [alert10, setAlert10] = useState(true);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
            </h1>

            {/* Configuration Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notifications Channels Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    {/* Card Header */}
                    <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Notifications Channels
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Where should we send credit alerts?
                        </p>
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                                    <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        Email Notifications
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Send to admin@acme.com
                                    </p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={emailNotifications}
                                onChange={(e) => setEmailNotifications(e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Alert Thresholds Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    {/* Card Header */}
                    <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Alert Thresholds
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Notify me when balance drops below...
                        </p>
                    </div>

                    {/* Card Content */}
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {/* 50% Remaining */}
                        <div className="flex items-center justify-between p-5">
                            <span className="text-sm text-gray-900 dark:text-white">
                                50% Remaining
                            </span>
                            <input
                                type="checkbox"
                                checked={alert50}
                                onChange={(e) => setAlert50(e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                            />
                        </div>

                        {/* 25% Remaining */}
                        <div className="flex items-center justify-between p-5">
                            <span className="text-sm text-gray-900 dark:text-white">
                                25% Remaining
                            </span>
                            <input
                                type="checkbox"
                                checked={alert25}
                                onChange={(e) => setAlert25(e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                            />
                        </div>

                        {/* 10% Remaining (Critical) */}
                        <div className="flex items-center justify-between p-5">
                            <span className="text-sm font-semibold text-red-600">
                                10% Remaining (Critical)
                            </span>
                            <input
                                type="checkbox"
                                checked={alert10}
                                onChange={(e) => setAlert10(e.target.checked)}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
