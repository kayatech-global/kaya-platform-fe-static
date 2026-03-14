'use client';

import React from 'react';
import { Anomaly } from '../types/types';
import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, RefreshCw, Workflow, Bot, Building2, Clock, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AnomalySummaryProps {
    anomalies: Anomaly[];
    isError?: boolean;
    onRetry?: () => void;
}

const getSeverityConfig = (severity: Anomaly['severity']) => {
    switch (severity) {
        case 'critical':
            return {
                bgColor: 'bg-red-100 dark:bg-red-900/30',
                textColor: 'text-red-700 dark:text-red-400',
                borderColor: 'border-red-200 dark:border-red-800',
                badgeBg: 'bg-red-600',
                label: 'Critical',
            };
        case 'high':
            return {
                bgColor: 'bg-orange-100 dark:bg-orange-900/30',
                textColor: 'text-orange-700 dark:text-orange-400',
                borderColor: 'border-orange-200 dark:border-orange-800',
                badgeBg: 'bg-orange-500',
                label: 'High',
            };
        case 'medium':
            return {
                bgColor: 'bg-amber-100 dark:bg-amber-900/30',
                textColor: 'text-amber-700 dark:text-amber-400',
                borderColor: 'border-amber-200 dark:border-amber-800',
                badgeBg: 'bg-amber-500',
                label: 'Medium',
            };
        case 'low':
            return {
                bgColor: 'bg-blue-100 dark:bg-blue-900/30',
                textColor: 'text-blue-700 dark:text-blue-400',
                borderColor: 'border-blue-200 dark:border-blue-800',
                badgeBg: 'bg-blue-500',
                label: 'Low',
            };
    }
};

const getResourceIcon = (type: Anomaly['resourceType']) => {
    switch (type) {
        case 'workflow':
            return Workflow;
        case 'agent':
            return Bot;
        case 'workspace':
            return Building2;
    }
};

export const AnomalySummary: React.FC<AnomalySummaryProps> = ({
    anomalies,
    isError,
    onRetry,
}) => {
    const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
    const highCount = anomalies.filter(a => a.severity === 'high').length;

    if (isError) {
        return (
            <div className="flex flex-col gap-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-x-2">
                    <AlertTriangle size={20} className="text-red-600" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        Anomaly Summary
                    </h3>
                </div>
                <div className="flex flex-col items-center justify-center py-12 gap-y-4">
                    <AlertCircle size={48} className="text-red-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Failed to load anomaly data</p>
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <RefreshCw size={14} />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (anomalies.length === 0) {
        return (
            <div className="flex flex-col gap-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-x-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <AlertTriangle size={16} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            Anomaly Summary
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Performance and health anomalies
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-8 gap-y-2">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <AlertTriangle size={24} className="text-green-600 dark:text-green-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">All Systems Healthy</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">No anomalies detected in the selected period</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        criticalCount > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                    )}>
                        <AlertTriangle size={16} className={criticalCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'} />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            Anomaly Summary
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Performance and health anomalies
                        </p>
                    </div>
                </div>
                {/* Quick stats */}
                <div className="flex items-center gap-x-2">
                    {criticalCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium text-white bg-red-600 rounded-full">
                            {criticalCount} Critical
                        </span>
                    )}
                    {highCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium text-white bg-orange-500 rounded-full">
                            {highCount} High
                        </span>
                    )}
                </div>
            </div>

            {/* Anomaly List */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {anomalies.map(anomaly => {
                    const severityConfig = getSeverityConfig(anomaly.severity);
                    const ResourceIcon = getResourceIcon(anomaly.resourceType);

                    return (
                        <div
                            key={anomaly.id}
                            className={cn(
                                'flex items-start gap-x-3 p-3 rounded-lg border cursor-pointer transition-colors',
                                severityConfig.bgColor,
                                severityConfig.borderColor,
                                'hover:opacity-90'
                            )}
                        >
                            <div className={cn(
                                'w-6 h-6 rounded flex items-center justify-center flex-shrink-0',
                                severityConfig.badgeBg
                            )}>
                                <AlertTriangle size={14} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-x-2 mb-1">
                                    <span className={cn(
                                        'text-xs font-semibold uppercase',
                                        severityConfig.textColor
                                    )}>
                                        {severityConfig.label}
                                    </span>
                                    <span className="text-gray-300 dark:text-gray-600">|</span>
                                    <div className="flex items-center gap-x-1">
                                        <ResourceIcon size={12} className="text-gray-500 dark:text-gray-400" />
                                        <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                            {anomaly.resourceType}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {anomaly.resource}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                    {anomaly.description}
                                </p>
                                <div className="flex items-center gap-x-4 mt-2">
                                    <div className="flex items-center gap-x-1 text-xs text-gray-500 dark:text-gray-400">
                                        <Clock size={12} />
                                        {formatDistanceToNow(anomaly.timestamp, { addSuffix: true })}
                                    </div>
                                    {anomaly.workspaceName && (
                                        <div className="flex items-center gap-x-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Building2 size={12} />
                                            {anomaly.workspaceName}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <ExternalLink size={14} className="text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
