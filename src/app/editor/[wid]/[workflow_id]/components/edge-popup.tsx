'use client';

import { WorkflowConditionEditor } from '@/components/molecules/custom-edge-base/workflow-condition-editor';
import { Category } from '@/hooks/use-condition-completion';
import { cn } from '@/lib/utils';
import React from 'react';

interface EdgePopupProps {
    onSubmit: (logic: string) => void;
    onClose: () => void;
    initialValue?: string;
    completion: Category[];
    overrideClassNames?: string;
}

const EdgePopup: React.FC<EdgePopupProps> = ({
    onSubmit,
    onClose,
    initialValue = '',
    completion,
    overrideClassNames,
}) => {
    const onSave = (condition: string) => {
        onSubmit(condition);
        onClose();
    };

    return (
        <div
            className={cn(
                'fixed z-[1000] rounded-lg shadow-xl border-[1px] border-gray-200 dark:border-[#1f2937] p-3 max-h-[400px] overflow-y-auto w-[400px] bg-popover',
                overrideClassNames
            )}
            style={{
                left: `50%`,
                top: `50%`,
                transform: 'translate(-50%, -50%)',
            }}
        >
            <WorkflowConditionEditor data={completion} onClose={onClose} onSave={onSave} initialValue={initialValue} />
        </div>
    );
};

export default EdgePopup;
