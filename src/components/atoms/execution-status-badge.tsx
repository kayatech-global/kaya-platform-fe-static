'use client';

import { Badge } from '@/components';
import { TestStatus } from '@/app/workspace/[wid]/test-studio/data-generation';

type ExecutionStatusBadgeProps = {
    status: TestStatus;
    className?: string;
};

export const ExecutionStatusBadge = ({ status, className }: ExecutionStatusBadgeProps) => {
    switch (status) {
        case TestStatus.Passed:
            return (
                <Badge variant="success" className={className}>
                    PASSED
                </Badge>
            );
        case TestStatus.Failed:
            return (
                <Badge variant="error" className={className}>
                    FAILED
                </Badge>
            );
        default:
            return (
                <Badge variant="secondary" className={className}>
                    {status}
                </Badge>
            );
    }
};
