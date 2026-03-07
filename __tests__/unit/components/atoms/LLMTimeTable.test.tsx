/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockLLMExecutions } from '@/test/__mock__/overall-metrics-mock';
import { LLMTimeTable } from '@/app/workspace/[wid]/metrics-and-analytics/components/llm-time-table';

jest.mock('react-hook-form', () => ({
    useForm: () => ({
        register: jest.fn(),
        handleSubmit: jest.fn(),
        reset: jest.fn(),
        getValues: jest.fn(),
        formState: {
            errors: {
                llmName: { message: undefined },
                averageTime: {
                    min: { message: undefined },
                    max: { message: undefined },
                },
                longestTime: {
                    min: { message: undefined },
                    max: { message: undefined },
                },
                averageLlmTokens: {
                    min: { message: undefined },
                    max: { message: undefined },
                },
                mostLlmTokens: {
                    min: { message: undefined },
                    max: { message: undefined },
                },
                executionCount: {
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
    default: ({ columns, data, tableHeader }: any) => (
        <div data-testid="data-table">
            <div data-testid="table-header">
                <div className="flex justify-between items-center w-full">
                    <p className="text-sm font-bold text-gray-700">LLM Time</p>
                    {tableHeader}
                </div>
            </div>
            {data.map((row: any) => (
                <div key={row.id} data-testid="table-row">
                    <div>{row.llm}</div>
                    <div>{row.timeAverage}</div>
                    <div>{row.timeLongest}</div>
                    <div>{row.llmAverage}</div>
                    <div>{row.llmMost}</div>
                    <div>{row.executionCount}</div>
                </div>
            ))}
        </div>
    ),
}));

describe('LLMTimeTable', () => {
    const mockOnLLMExecutionFilter = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with mock data', () => {
        render(<LLMTimeTable llmExecutions={mockLLMExecutions} onLLMExecutionFilter={mockOnLLMExecutionFilter} />);
        const rows = screen.getAllByTestId('table-row');
        expect(rows).toHaveLength(2);
    });

    it('displays the correct data', () => {
        render(<LLMTimeTable llmExecutions={mockLLMExecutions} onLLMExecutionFilter={mockOnLLMExecutionFilter} />);

        // First row data
        expect(screen.getByText('GPT-4')).toBeInTheDocument();
        expect(screen.getByText('2.5s')).toBeInTheDocument();
        expect(screen.getByText('5s')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();

        // Second row data
        expect(screen.getByText('GPT-3.5')).toBeInTheDocument();
        expect(screen.getByText('1.5s')).toBeInTheDocument();
        expect(screen.getByText('3s')).toBeInTheDocument();
        expect(screen.getByText('30')).toBeInTheDocument();
    });

    it('renders filter button and popover', () => {
        render(<LLMTimeTable llmExecutions={mockLLMExecutions} onLLMExecutionFilter={mockOnLLMExecutionFilter} />);
        expect(screen.getByTestId('popover')).toBeInTheDocument();
        expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
    });
});
