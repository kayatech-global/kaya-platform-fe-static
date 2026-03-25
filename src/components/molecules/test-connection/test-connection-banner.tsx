'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/button';
import { Alert } from '@/components/atoms/alert';
import { AlertVariant } from '@/enums/component-type';
import { Loader2, PlugZap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    SelectV2 as Select,
    SelectContentV2 as SelectContent,
    SelectItemV2 as SelectItem,
    SelectTriggerV2 as SelectTrigger,
    SelectValueV2 as SelectValue,
} from '@/components/atoms/select-v2';

export type TestConnectionState = 'idle' | 'loading' | 'success' | 'error';

export interface TestConnectionError {
    step?: string;
    message: string;
    details?: string;
}

export interface TestConnectionSuccess {
    message: string;
    details?: string | React.ReactNode;
}

export interface TestConnectionBannerProps {
    onTestConnection: () => Promise<{ success: boolean; data?: TestConnectionSuccess; error?: TestConnectionError }>;
    className?: string;
    buttonLabel?: string;
    buttonVariant?: 'default' | 'secondary' | 'outline' | 'ghost';
    buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
    disabled?: boolean;
    /** Show scenario toggle for reviewers to preview all states */
    showScenarioToggle?: boolean;
    /** Override state for demo/review purposes */
    overrideState?: TestConnectionState;
    /** Override success data for demo/review purposes */
    overrideSuccess?: TestConnectionSuccess;
    /** Override error data for demo/review purposes */
    overrideError?: TestConnectionError;
}

export const TestConnectionBanner = ({
    onTestConnection,
    className,
    buttonLabel = 'Test Connection',
    buttonVariant = 'secondary',
    buttonSize = 'sm',
    disabled = false,
    showScenarioToggle = false,
    overrideState,
    overrideSuccess,
    overrideError,
}: TestConnectionBannerProps) => {
    const [state, setState] = useState<TestConnectionState>('idle');
    const [successData, setSuccessData] = useState<TestConnectionSuccess | null>(null);
    const [errorData, setErrorData] = useState<TestConnectionError | null>(null);
    const [scenarioState, setScenarioState] = useState<TestConnectionState | 'auto'>('auto');

    const handleTestConnection = async () => {
        setState('loading');
        setSuccessData(null);
        setErrorData(null);

        try {
            const result = await onTestConnection();

            if (result.success && result.data) {
                setState('success');
                setSuccessData(result.data);
            } else if (!result.success && result.error) {
                setState('error');
                setErrorData(result.error);
            }
        } catch (err) {
            setState('error');
            setErrorData({
                message: 'An unexpected error occurred while testing the connection.',
                details: err instanceof Error ? err.message : 'Unknown error',
            });
        }
    };

    // Determine which state to show (override or actual)
    const displayState = scenarioState !== 'auto' ? scenarioState : overrideState ?? state;
    const displaySuccess = overrideSuccess ?? successData;
    const displayError = overrideError ?? errorData;

    return (
        <div className={cn('flex flex-col gap-3', className)}>
            {/* Scenario Toggle for Reviewers */}
            {showScenarioToggle && (
                <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md border border-dashed border-gray-300 dark:border-gray-600">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Preview State:
                    </span>
                    <Select
                        value={scenarioState}
                        onValueChange={(value) => setScenarioState(value as TestConnectionState | 'auto')}
                    >
                        <SelectTrigger className="h-7 w-[120px] text-xs">
                            <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="auto">Auto</SelectItem>
                            <SelectItem value="idle">Idle</SelectItem>
                            <SelectItem value="loading">Loading</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Test Connection Button */}
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant={buttonVariant}
                    size={buttonSize}
                    disabled={disabled || displayState === 'loading'}
                    onClick={handleTestConnection}
                >
                    {displayState === 'loading' ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Testing...
                        </>
                    ) : (
                        <>
                            <PlugZap className="mr-2 h-4 w-4" />
                            {buttonLabel}
                        </>
                    )}
                </Button>
            </div>

            {/* Success Banner */}
            {displayState === 'success' && displaySuccess && (
                <Alert
                    variant={AlertVariant.Success}
                    title="Connection Successful"
                    message={
                        <div className="flex flex-col gap-1">
                            <span>{displaySuccess.message}</span>
                            {displaySuccess.details && (
                                <span className="text-xs opacity-80">{displaySuccess.details}</span>
                            )}
                        </div>
                    }
                    small
                />
            )}

            {/* Error Banner */}
            {displayState === 'error' && displayError && (
                <Alert
                    variant={AlertVariant.Error}
                    title={displayError.step ? `Failed at: ${displayError.step}` : 'Connection Failed'}
                    message={
                        <div className="flex flex-col gap-1">
                            <span>{displayError.message}</span>
                            {displayError.details && (
                                <span className="text-xs opacity-70">{displayError.details}</span>
                            )}
                        </div>
                    }
                    small
                />
            )}
        </div>
    );
};
