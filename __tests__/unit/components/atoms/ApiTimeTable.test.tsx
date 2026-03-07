/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockApiExecutions } from '../../../__mock__/overall-metrics-mock';
import { ApiTimeTable } from '@/app/workspace/[wid]/metrics-and-analytics/components/api-time-table';

jest.mock('react-hook-form', () => ({
    useForm: () => ({
        register: jest.fn(),
        handleSubmit: jest.fn(),
        reset: jest.fn(),
        getValues: jest.fn(),
        formState: {
            errors: {
                apiName: { message: undefined },
                executionCount: {
                    min: { message: undefined },
                    max: { message: undefined },
                },
                failureCount: {
                    min: { message: undefined },
                    max: { message: undefined },
                },
                averageTime: {
                    min: { message: undefined },
                    max: { message: undefined },
                },
                longestTime: {
                    min: { message: undefined },
                    max: { message: undefined },
                },
            },
        },
        trigger: jest.fn(),
    }),
}));

jest.mock('lucide-react', () => ({
    ListFilter: () => <div data-testid="list-filter-icon">ListFilter</div>,
    FilterX: () => <div data-testid="filter-x-icon">FilterX</div>,
}));

jest.mock('@/components', () => ({
    Button: ({ children, ...props }: { children: React.ReactNode }) => <button {...props}>{children}</button>,
    Input: ({ ...props }) => <input {...props} />,
}));

jest.mock('@/components/atoms/popover', () => ({
    Popover: ({ children }: { children: React.ReactNode }) => <div data-testid="popover">{children}</div>,
    PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="popover-trigger">{children}</div>
    ),
    PopoverContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="popover-content">{children}</div>
    ),
}));

jest.mock('@/components/molecules/table/data-table', () => ({
    __esModule: true,
    default: ({ _columns, data, tableHeader }: any) => (
        <div data-testid="data-table">
            <div data-testid="table-header">
                <div className="flex justify-between items-center w-full">
                    <p className="text-sm font-bold text-gray-700">API Time</p>
                    {tableHeader}
                </div>
            </div>
            {data.map((row: any) => (
                <div key={row.id} data-testid="table-row">
                    <div>{row.api}</div>
                    <div>{row.executionCount}</div>
                    <div>{row.failureCount}</div>
                    <div>{row.average}</div>
                    <div>{row.longest}</div>
                </div>
            ))}
        </div>
    ),
}));

describe('ApiTimeTable', () => {
    const mockOnApiExecutionFilter = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with mock data', () => {
        render(<ApiTimeTable apiExecutions={mockApiExecutions} onApiExecutionFilter={mockOnApiExecutionFilter} />);
        const rows = screen.getAllByTestId('table-row');
        expect(rows).toHaveLength(2);
    });

    it('displays the correct data', () => {
        render(<ApiTimeTable apiExecutions={mockApiExecutions} onApiExecutionFilter={mockOnApiExecutionFilter} />);

        expect(screen.getByText('api 1')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('1.5s')).toBeInTheDocument();
        expect(screen.getByText('3.0s')).toBeInTheDocument();

        expect(screen.getByText('api 2')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('2.0s')).toBeInTheDocument();
        expect(screen.getByText('4.5s')).toBeInTheDocument();
    });

    it('renders filter button and popover', () => {
        render(<ApiTimeTable apiExecutions={mockApiExecutions} onApiExecutionFilter={mockOnApiExecutionFilter} />);
        expect(screen.getByTestId('popover')).toBeInTheDocument();
        expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
    });
});
