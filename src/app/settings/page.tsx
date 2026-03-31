'use client';

import React, { useState } from 'react';
import { Mail, Plus, Trash2, Pencil, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogBody,
} from '@/components/atoms/dialog';

interface Alert {
    id: string;
    threshold: number;
    emails: string[];
}

export default function SettingsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([
        { id: '1', threshold: 50, emails: ['admin@acme.com'] },
        { id: '2', threshold: 25, emails: ['admin@acme.com', 'finance@acme.com'] },
    ]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
    const [thresholdInput, setThresholdInput] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [emailList, setEmailList] = useState<string[]>([]);
    const [error, setError] = useState('');

    const openAddDialog = () => {
        setEditingAlert(null);
        setThresholdInput('');
        setEmailInput('');
        setEmailList([]);
        setError('');
        setIsDialogOpen(true);
    };

    const openEditDialog = (alert: Alert) => {
        setEditingAlert(alert);
        setThresholdInput(alert.threshold.toString());
        setEmailList([...alert.emails]);
        setEmailInput('');
        setError('');
        setIsDialogOpen(true);
    };

    const handleAddEmail = () => {
        const email = emailInput.trim().toLowerCase();
        if (!email) return;

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (emailList.includes(email)) {
            setError('This email is already added');
            return;
        }

        setEmailList([...emailList, email]);
        setEmailInput('');
        setError('');
    };

    const handleRemoveEmail = (emailToRemove: string) => {
        setEmailList(emailList.filter(email => email !== emailToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddEmail();
        }
    };

    const handleSave = () => {
        const threshold = parseInt(thresholdInput);

        if (isNaN(threshold) || threshold < 1 || threshold > 100) {
            setError('Please enter a valid threshold between 1 and 100');
            return;
        }

        if (emailList.length === 0) {
            setError('Please add at least one email address');
            return;
        }

        // Check for duplicate threshold (except when editing the same alert)
        const isDuplicate = alerts.some(
            a => a.threshold === threshold && a.id !== editingAlert?.id
        );
        if (isDuplicate) {
            setError('An alert with this threshold already exists');
            return;
        }

        if (editingAlert) {
            // Update existing alert
            setAlerts(alerts.map(a =>
                a.id === editingAlert.id
                    ? { ...a, threshold, emails: emailList }
                    : a
            ));
        } else {
            // Add new alert
            const newAlert: Alert = {
                id: Date.now().toString(),
                threshold,
                emails: emailList,
            };
            setAlerts([...alerts, newAlert].sort((a, b) => b.threshold - a.threshold));
        }

        setIsDialogOpen(false);
    };

    const handleDelete = (alertId: string) => {
        setAlerts(alerts.filter(a => a.id !== alertId));
    };

    const isCritical = (threshold: number) => threshold <= 10;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
            </h1>

            {/* Credit Usage Alerts Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                {/* Card Header */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Credit Usage Alerts
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Get notified when your credit balance drops below certain thresholds.
                        </p>
                    </div>
                    <Button onClick={openAddDialog} leadingIcon={<Plus className="h-4 w-4" />}>
                        Add Alert
                    </Button>
                </div>

                {/* Alerts List */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {alerts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No alerts configured yet.</p>
                            <p className="text-sm">Click &quot;Add Alert&quot; to create your first alert.</p>
                        </div>
                    ) : (
                        alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                                        <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${
                                            isCritical(alert.threshold)
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-gray-900 dark:text-white'
                                        }`}>
                                            {alert.threshold}% usage alert
                                            {isCritical(alert.threshold) && ' (Critical)'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {alert.emails.join(', ')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditDialog(alert)}
                                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Edit alert"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(alert.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Delete alert"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add/Edit Alert Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingAlert ? 'Edit Alert' : 'Add New Alert'}
                        </DialogTitle>
                    </DialogHeader>

                    <DialogBody className="space-y-4 py-4">
                        {/* Threshold Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Alert when credit usage exceeds
                            </label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={thresholdInput}
                                    onChange={(e) => setThresholdInput(e.target.value)}
                                    placeholder="Enter percentage"
                                    className="pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    %
                                </span>
                            </div>
                        </div>

                        {/* Email Recipients */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Send alerts to
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Add email addresses to receive alerts when this threshold is reached.
                            </p>

                            {/* Email Input */}
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter email address"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleAddEmail}
                                >
                                    Add
                                </Button>
                            </div>

                            {/* Email Chips */}
                            {emailList.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[60px]">
                                    {emailList.map((email) => (
                                        <span
                                            key={email}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300"
                                        >
                                            {email}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveEmail(email)}
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {error}
                            </p>
                        )}
                    </DialogBody>

                    <DialogFooter>
                        <Button
                            variant="secondary"
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
