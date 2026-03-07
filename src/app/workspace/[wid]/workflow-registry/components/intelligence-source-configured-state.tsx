import { Button } from '@/components';
import React from 'react';

interface IntelligenceSourceConfiguredStateProps {
    refetchWorkflowComparisonType: () => void;
}
export const IntelligenceSourceConfiguredState = ({
    refetchWorkflowComparisonType,
}: IntelligenceSourceConfiguredStateProps) => {
    return (
        <div className="z-10 absolute border w-full h-full rounded-sm overflow-clip flex items-center justify-center flex-col">
            <div className="flex flex-col items-center gap-y-2">
                <i className="ri-error-warning-fill text-blue-600 text-[75px]" />
                <p className="max-w-[85%] text-center text-sm text-gray-700 dark:text-gray-400">
                    All set! The intelligence source for this workspace is configured. You can now generate and review
                    the differences between workflow versions. Click the button below to proceed.
                </p>
                <Button
                    size="sm"
                    variant="link"
                    onClick={() => {
                        refetchWorkflowComparisonType();
                    }}
                >
                    Generate workflow Differences
                </Button>
            </div>
        </div>
    );
};
