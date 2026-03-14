'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/atoms/card';
import { Calendar, Clock } from 'lucide-react';
import { IUserProfile } from '@/models/profile.model';

interface AccountMetadataSectionProps {
    profile: IUserProfile;
}

const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const AccountMetadataSection = ({ profile }: AccountMetadataSectionProps) => {
    return (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-100">Account Information</p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-x-3">
                        <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                            <Calendar size={16} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex flex-col gap-y-0.5">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Created</p>
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                {formatDate(profile.createdAt)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-x-3">
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex flex-col gap-y-0.5">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                            <p className="text-sm text-gray-900 dark:text-gray-100">
                                {formatDate(profile.updatedAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
