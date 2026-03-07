'use client';

import React from 'react';

type EditableTableCellProps = {
    isEditing: boolean;
    value: string;
    displayValue?: string;
    onChange: (value: string) => void;
    rows?: number;
    maxWidth?: string;
};

export const EditableTableCell = ({
    isEditing,
    value,
    displayValue,
    onChange,
    rows = 1,
    maxWidth = '220px',
}: EditableTableCellProps) => {
    if (isEditing) {
        return (
            <textarea
                className="text-xs border rounded p-1 w-full"
                value={value}
                onChange={e => onChange(e.target.value)}
                rows={rows}
            />
        );
    }

    return (
        <div className={`break-words whitespace-pre-line max-w-[${maxWidth}] text-left`}>
            {displayValue ?? value ?? '-'}
        </div>
    );
};
