/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mockWorkflowExecutions } from '@/test/__mock__/overall-metrics-mock';
import { WorkflowUsageTable } from '@/app/workspace/[wid]/metrics-and-analytics/components/workflow-usage-table';

jest.mock('lucide-react', () => ({
    ListFilter: () => <div data-testid="list-filter-icon">Filter Icon</div>,
}));

jest.mock('@/components', () => ({
    Button: ({ children, leadingIcon, ...props }: any) => (
        <button type="button" data-testid="filter-button" {...props}>
            {leadingIcon}
            {children}
        </button>
    ),
    Input: (props: any) => <input data-testid="filter-input" {...props} />,
}));

jest.mock('@/components/atoms/popover', () => ({
    Popover: ({ children }: any) => <div data-testid="popover">{children}</div>,
    PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
    PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
}));

jest.mock('@/components/molecules/table/data-table', () => {
    return jest.fn(({ columns, data }) => (
        <div data-testid="data-table">
            <table>
                <thead>
                    <tr>
                        {columns.map((col: any, i: any) => (
                            <th key={i} data-testid={`header-${col.accessorKey || i}`}>
                                {typeof col.header === 'function' ? col.header() : col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row: any, i: any) => (
                        <tr key={i}>
                            {columns.map((col: any, j: any) => (
                                <td key={j} data-testid={`cell-${col.accessorKey || j}-${i}`}>
                                    {col.cell
                                        ? col.cell({ row: { getValue: () => row[col.accessorKey] } })
                                        : row[col.accessorKey]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ));
});

jest.mock('react-hook-form', () => ({
    useForm: () => ({
        register: jest.fn(),
        handleSubmit: jest.fn(),
        reset: jest.fn(),
        getValues: jest.fn(),
        formState: jest.fn(),
        trigger: jest.fn(),
    }),
}));

jest.mock('@/lib/utils', () => ({
    handleNoValue: jest.fn(value => value || '-'),
}));

describe('WorkflowUsageTable', () => {
    const mockOnWorkflowExecutionFilter = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the table component', () => {
        render(
            <WorkflowUsageTable
                workflowExecutions={mockWorkflowExecutions}
                onWorkflowExecutionFilter={mockOnWorkflowExecutionFilter}
            />
        );

        expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    it('renders workflow data correctly', () => {
        render(
            <WorkflowUsageTable
                workflowExecutions={mockWorkflowExecutions}
                onWorkflowExecutionFilter={mockOnWorkflowExecutionFilter}
            />
        );

        const workflowCell = screen.getByTestId('cell-workflow-0');
        expect(workflowCell).toHaveTextContent('Test Workflow 1');
    });

    it('handles empty data', () => {
        render(
            <WorkflowUsageTable workflowExecutions={[]} onWorkflowExecutionFilter={mockOnWorkflowExecutionFilter} />
        );

        expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });
});
