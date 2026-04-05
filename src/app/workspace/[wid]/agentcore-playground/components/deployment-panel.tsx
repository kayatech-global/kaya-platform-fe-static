'use client';

import React from 'react';
import { Badge, Button } from '@/components/atoms';
import { Switch } from '@/components/atoms/switch';
import { Label } from '@/components/atoms/label';
import { cn } from '@/lib/utils';
import {
    CheckCircle,
    Cloud,
    MapPin,
    Package,
    Clock,
    ExternalLink,
    FileText,
    Zap,
} from 'lucide-react';
import { DeploymentInfo } from '../types';

interface DeploymentPanelProps {
    deployment: DeploymentInfo;
    streamingEnabled: boolean;
    onStreamingToggle: (enabled: boolean) => void;
}

export const DeploymentPanel = ({
    deployment,
    streamingEnabled,
    onStreamingToggle,
}: DeploymentPanelProps) => {
    const statusConfig = {
        ready: {
            label: 'AgentCore Ready',
            variant: 'success' as const,
            icon: <CheckCircle size={14} />,
        },
        running: {
            label: 'Running',
            variant: 'default' as const,
            icon: <Zap size={14} />,
        },
        error: {
            label: 'Error',
            variant: 'destructive' as const,
            icon: <Clock size={14} />,
        },
    };

    const status = statusConfig[deployment.status];

    return (
        <div className="h-full bg-gray-900 rounded-[20px] p-5 flex flex-col">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-x-2 mb-2">
                    <Cloud size={20} className="text-sky-400" />
                    <h2 className="text-lg font-semibold text-white">
                        {deployment.workflowName}
                    </h2>
                </div>
                <div className="flex items-center gap-x-2">
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">
                        v{deployment.workflowVersion}
                    </Badge>
                    <Badge
                        variant={status.variant}
                        className="flex items-center gap-x-1"
                    >
                        {status.icon}
                        {status.label}
                    </Badge>
                </div>
            </div>

            {/* Deployment Details */}
            <div className="space-y-4 flex-1">
                <div className="space-y-3">
                    <DetailRow
                        icon={<Cloud size={14} className="text-gray-400" />}
                        label="Runtime Connection"
                        value={deployment.runtimeName}
                    />
                    <DetailRow
                        icon={<MapPin size={14} className="text-gray-400" />}
                        label="Region"
                        value={deployment.region}
                    />
                    <DetailRow
                        icon={<Package size={14} className="text-gray-400" />}
                        label="Source Artifact"
                        value={
                            <span className="text-xs font-mono text-gray-400 truncate max-w-[180px] block">
                                {deployment.sourceArtifact}
                            </span>
                        }
                    />
                    <DetailRow
                        icon={<FileText size={14} className="text-gray-400" />}
                        label="Deployment ID"
                        value={
                            <span className="font-mono text-xs text-gray-400">
                                {deployment.deploymentId}
                            </span>
                        }
                    />
                    <DetailRow
                        icon={<Clock size={14} className="text-gray-400" />}
                        label="Last Validation"
                        value={new Date(deployment.deployedAt).toLocaleString()}
                    />
                </div>

                {/* View Deployment Log Link */}
                <Button
                    variant="link"
                    className="text-blue-400 p-0 h-auto text-sm"
                    trailingIcon={<ExternalLink size={12} />}
                >
                    View deployment log
                </Button>

                {/* Streaming Toggle */}
                <div className="pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-x-2">
                            <Zap size={14} className="text-amber-400" />
                            <Label className="text-sm text-gray-300">Enable streaming events</Label>
                        </div>
                        <Switch
                            checked={streamingEnabled}
                            onCheckedChange={onStreamingToggle}
                        />
                    </div>
                </div>
            </div>

            {/* Live Cluster Badge */}
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-600/20 to-sky-500/20 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-blue-300">
                        Live AgentCore cluster
                    </span>
                </div>
            </div>
        </div>
    );
};

const DetailRow = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) => (
    <div className="flex items-start justify-between gap-x-2">
        <div className="flex items-center gap-x-2 text-gray-400">
            {icon}
            <span className="text-xs">{label}</span>
        </div>
        <div className="text-sm text-gray-200 text-right">{value}</div>
    </div>
);
