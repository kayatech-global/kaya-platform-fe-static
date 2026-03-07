'use client';

import { useBreakpoint } from '@/hooks/use-breakpoints';
import { useTestExecutions } from '@/hooks/use-test-executions';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';
import { cn } from '@/lib/utils';
import { MiniExecutionTracker } from '@/components/molecules';
import { ExecutionProvider, useExecutionContext } from '@/context';
import { DataExecutionTable } from './data-execution-table';
import { useState, useEffect } from 'react';
import { NewExecutionForm } from './new-execution-form';
import { useExecutionConfiguration } from '@/hooks/use-test-execution';
import { ExecutionSessionStatus } from '@/enums/test-studio-type';

const DataExecutionContent = () => {
    const { isLg } = useBreakpoint();
    const { testExecutions, isFetching, isLoading, refetch } = useTestExecutions();
    const { backgroundExecution, stopBackgroundExecution, expandExecution } = useExecutionContext();
    const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);

    // Poll for silent execution completion
    const { progress } = useExecutionConfiguration(
        backgroundExecution.isSilent ? backgroundExecution.sessionId : null
    );

    // Handle silent execution completion
    useEffect(() => {
        if (
            backgroundExecution.isSilent &&
            progress &&
            (progress.status === ExecutionSessionStatus.Completed || progress.status === ExecutionSessionStatus.Failed)
        ) {
            stopBackgroundExecution();
            refetch(); // Refresh table after completion
        }
    }, [backgroundExecution.isSilent, progress, stopBackgroundExecution, refetch]);

    const handleCancelExecution = () => {
        stopBackgroundExecution();
    };

    const handleExpandExecution = () => {
        expandExecution();
        setIsExecutionModalOpen(true);
    };

    if (isFetching || isLoading) return <PlatformConfigurationSuiteSkeleton hasCards={false} />;

    return (
        <>
            <div className="metric-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div
                        className={cn('dashboard-left-section flex flex-col w-full', {
                            'gap-y-9': isLg,
                        })}
                    >
                        <DataExecutionTable 
                            executions={testExecutions} 
                            onExecutionComplete={refetch}
                            runningTestSuiteId={backgroundExecution.isSilent ? backgroundExecution.testSuiteId : undefined}
                        />
                    </div>
                </div>
            </div>

            {/* Mini Execution Tracker */}
            {backgroundExecution.sessionId && backgroundExecution.isMinimized && (
                <MiniExecutionTracker
                    sessionId={backgroundExecution.sessionId}
                    onCancel={handleCancelExecution}
                    onExpand={handleExpandExecution}
                    onComplete={() => {
                        stopBackgroundExecution();
                        refetch(); // Refresh table after completion
                    }}
                />
            )}

            {/* Execution Modal for expanding back */}
            {isExecutionModalOpen && (
                <NewExecutionForm
                    isOpen={isExecutionModalOpen}
                    setIsOpen={setIsExecutionModalOpen}
                    onExecutionComplete={refetch}
                />
            )}
        </>
    );
};

export const DataExecutionContainer = () => {
    return (
        <ExecutionProvider>
            <DataExecutionContent />
        </ExecutionProvider>
    );
};
