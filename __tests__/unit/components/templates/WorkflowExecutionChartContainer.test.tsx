/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowExecutionChartContainer } from '@/app/workspace/[wid]/usage/components/workflow-execution-chart-container';
import '@testing-library/jest-dom';

process.env = {
    ...process.env,
    KEYCLOAK_CLIENT_ID: 'test-client',
    KEYCLOAK_AUTH_SERVER_URL: 'http://test-auth-server',
    KEYCLOAK_REALM: 'test-realm',
    ENV_LOG_LEVEL: 'error',
    BASE_API_URL: 'http://test-api',
    NODE_ENV: 'test',
};

jest.mock('lucide-react', () => ({
    ChevronDown: () => <div data-testid="chevron-down">ChevronDown</div>,
    GitPullRequestArrow: () => <div data-testid="git-pull">GitPullRequestArrow</div>,
}));

jest.mock('@/components', () => ({
    AppDonutChart: () => <div data-testid="mock-donut-chart" />,
    Button: ({ children, ...props }: any) => (
        <button {...props} data-testid="month-button">
            {children}
        </button>
    ),
    DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
    DropdownMenuLabel: ({ children }: any) => <div data-testid="dropdown-label">{children}</div>,
    DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
    DropdownMenuCheckboxItem: ({ children, onCheckedChange, checked }: any) => (
        <div data-testid="month-option" onClick={() => onCheckedChange(!checked)} data-checked={checked}>
            {children}
        </div>
    ),
}));

jest.mock('@/components/molecules/data-viz-card/data-viz-card', () => ({
    __esModule: true,
    default: ({ children, title, chart }: any) => (
        <div data-testid="data-viz-card">
            <div data-testid="card-title">{title}</div>
            {children}
            {chart}
        </div>
    ),
}));

jest.mock('@/components/molecules/table/data-table', () => {
    const DataTable = ({ data, ...props }: any) => {
        if (!data) return null;
        return (
            <div data-testid="data-table" className={props.tableClassNames}>
                {data.map((item: any, index: number) => (
                    <div key={index} data-testid={`table-row-${index}`} className={props.dataRowClassNames}>
                        <div className="flex gap-x-3 items-center">
                            <div className="w-4 h-4 bg-blue-500 rounded-sm" />
                            <div
                                data-testid={`workflow-${index}`}
                                className="text-sm font-medium text-gray-600 dark:text-gray-300"
                            >
                                {item.workflow}
                            </div>
                        </div>
                        <div className="flex gap-x-3 items-center">
                            <div data-testid={`count-${index}`} className="text-sm text-gray-700 dark:text-gray-200">
                                {item.execution_count}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };
    return {
        __esModule: true,
        default: DataTable,
    };
});

const mockChartConfig = {
    visitors: {
        label: 'Visitors',
    },
    HR: {
        label: 'HR',
        color: 'var(--blue-300)',
    },
};

const mockChartData = [
    { workflow: 'HR', count: 500, fill: 'var(--blue-600)' },
    { workflow: 'Leave Application', count: 200, fill: 'var(--blue-700)' },
];

const mockTableData = [
    {
        workflow: 'Workflow 1',
        execution_count: 30,
    },
    {
        workflow: 'Workflow 2',
        execution_count: 70,
    },
];

describe('WorkflowExecutionChartContainer', () => {
    const mockDate = new Date(2024, 1, 1);

    beforeAll(() => {
        global.Date = class extends Date {
            constructor() {
                super();
                return mockDate;
            }

            static now() {
                return mockDate.getTime();
            }
        } as DateConstructor;
    });

    afterAll(() => {
        global.Date = Date;
    });

    it('renders the component with title', () => {
        render(
            <WorkflowExecutionChartContainer
                chartConfig={mockChartConfig}
                chartData={mockChartData}
                tableData={mockTableData}
            />
        );

        const title = screen.getByTestId('card-title');
        expect(title).toHaveTextContent('Workflow Execution');
    });

    it('displays the current month in dropdown button', () => {
        render(
            <WorkflowExecutionChartContainer
                chartConfig={mockChartConfig}
                chartData={mockChartData}
                tableData={mockTableData}
            />
        );

        const button = screen.getByTestId('month-button');
        expect(button).toHaveTextContent('Feb');
    });

    it('shows dropdown menu when clicked', () => {
        render(
            <WorkflowExecutionChartContainer
                chartConfig={mockChartConfig}
                chartData={mockChartData}
                tableData={mockTableData}
            />
        );

        const button = screen.getByTestId('month-button');
        fireEvent.click(button);

        expect(screen.getByTestId('dropdown-label')).toHaveTextContent('Months');
    });

    it('displays table data correctly', () => {
        render(
            <WorkflowExecutionChartContainer
                chartConfig={mockChartConfig}
                chartData={mockChartData}
                tableData={mockTableData}
            />
        );

        const dataVizCard = screen.getByTestId('data-viz-card');
        expect(dataVizCard).toBeInTheDocument();

        const workflow1 = screen.getByText('Workflow 1');
        const workflow2 = screen.getByText('Workflow 2');
        const count1 = screen.getByText('30');
        const count2 = screen.getByText('70');

        expect(workflow1).toBeInTheDocument();
        expect(workflow2).toBeInTheDocument();
        expect(count1).toBeInTheDocument();
        expect(count2).toBeInTheDocument();
    });

    it('allows month selection from dropdown', async () => {
        render(
            <WorkflowExecutionChartContainer
                chartConfig={mockChartConfig}
                chartData={mockChartData}
                tableData={mockTableData}
            />
        );

        const button = screen.getByTestId('month-button');
        fireEvent.click(button);

        expect(button).toHaveTextContent('Feb');

        const monthOptions = screen.getAllByTestId('month-option');

        expect(monthOptions).toHaveLength(12);

        const mayOption = monthOptions.find(option => option.textContent === 'May');
        expect(mayOption).toBeTruthy();
        fireEvent.click(mayOption!);
        expect(button).toHaveTextContent('May');
    });
});
