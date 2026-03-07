/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppBarChart } from '@/components/charts/bar-chart';
import { ThemeProvider } from '@/theme';

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

jest.mock('recharts', () => ({
    Bar: (props: any) => <div data-testid="mock-bar" {...props} />,
    BarChart: ({ children, ...props }: { children: React.ReactNode } & Record<string, any>) => (
        <div data-testid="mock-bar-chart" {...props}>{children}</div>
    ),
    CartesianGrid: (props: any) => <div data-testid="mock-cartesian-grid" {...props} />,
    XAxis: (props: any) => <div data-testid="mock-x-axis" {...props} />,
    YAxis: (props: any) => <div data-testid="mock-y-axis" {...props} />,
}));

jest.mock('@/components/atoms/chart', () => ({
    ChartConfig: (props: any) => <div data-testid="mock-chart-config" {...props} />,
    ChartContainer: ({ children, ...props }: { children: React.ReactNode } & Record<string, any>) => (
        <div data-testid="mock-chart-container" {...props}>{children}</div>
    ),
    ChartTooltip: (props: any) => <div data-testid="mock-chart-tooltip" {...props} />,
    ChartTooltipContent: (props: any) => <div data-testid="mock-chart-tooltip-content" {...props} />,
}));

describe('AppBarChart', () => {
    const mockChartData = [
        { month: 'January', value: 100 },
        { month: 'February', value: 200 },
    ];

    const mockChartConfig = {
        value: {
            color: '#4B5563',
            label: 'Usage',
        },
    };

    const defaultProps = {
        chartData: mockChartData,
        chartConfig: mockChartConfig,
        dataKey: 'value',
    };

    const renderComponent = (props = {}) => {
        return render(
            <ThemeProvider>
                <AppBarChart {...defaultProps} {...props} />
            </ThemeProvider>
        );
    };

    test('renders without crashing', () => {
        renderComponent();
        expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
    });

    test('renders chart elements correctly', () => {
        renderComponent();
        expect(screen.getByTestId('mock-cartesian-grid')).toBeInTheDocument();
        expect(screen.getByTestId('mock-x-axis')).toBeInTheDocument();
        expect(screen.getByTestId('mock-y-axis')).toBeInTheDocument();
        expect(screen.getByTestId('mock-bar')).toBeInTheDocument();
    });

    test('hides axes when specified', () => {
        renderComponent({ showXAxis: false, showYAxis: false });
        expect(screen.queryByTestId('mock-x-axis')).not.toBeInTheDocument();
        expect(screen.queryByTestId('mock-y-axis')).not.toBeInTheDocument();
    });

    test('renders legend when showLegend is true', () => {
        renderComponent({ showLegend: true });
        expect(screen.getByText('Usage')).toBeInTheDocument();
        const legendColor = screen.getByText('Usage').previousElementSibling as HTMLElement;
        expect(legendColor).toHaveStyle({ backgroundColor: '#4B5563' });
    });

    test('hides legend when showLegend is false', () => {
        renderComponent({ showLegend: false });
        expect(screen.queryByText('Usage')).not.toBeInTheDocument();
    });

    test('applies custom maxYValue when provided', () => {
        const maxYValue = 1000;
        renderComponent({ maxYValue });
        expect(screen.getByTestId('mock-y-axis')).toBeInTheDocument();
    });
});
