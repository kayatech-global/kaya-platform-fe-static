'use client';

import React from 'react';
import { TestCaseMethod } from '@/enums/test-studio-type';

type TestCaseNumberBadgeProps = {
    rowIndex: number;
    testMethod: TestCaseMethod;
};

export const TestCaseNumberBadge = ({ rowIndex, testMethod }: TestCaseNumberBadgeProps) => {
    const getPrefix = () => {
        if (testMethod === TestCaseMethod.Auto) return 'G';
        if (testMethod === TestCaseMethod.Upload) return 'U';
        return 'M';
    };

    return <div className="text-left">#{getPrefix()}{rowIndex + 1}</div>;
};
