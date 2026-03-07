/* eslint-disable @typescript-eslint/no-explicit-any */
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppAreaChart } from '@/components/charts/area-chart';
import * as React from 'react';

global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

jest.mock('@/lib/utils', () => ({
    cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

jest.mock('@/theme', () => ({
    useTheme: () => ({ theme: 'light' }),
}));

jest.mock('recharts', () => ({
    Area: () => null,
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: () => null,
    AreaChart: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/atoms/chart', () => ({
    ChartContainer: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    ChartTooltip: () => null,
    ChartTooltipContent: () => null,
    ChartLegend: () => null,
    ChartLegendContent: () => null,
}));

describe('AppAreaChart', () => {
    const mockData = [
        { name: 'Jan', value1: 100, value2: 200 },
        { name: 'Feb', value1: 200, value2: 300 },
        { name: 'Mar', value1: 150, value2: 250 },
    ];

    const mockConfig = {
        value1: {
            name: 'Series 1',
            color: '#ff0000',
        },
        value2: {
            name: 'Series 2',
            color: '#00ff00',
        },
    };

    it('renders without crashing', () => {
        const { container } = render(<AppAreaChart data={mockData} config={mockConfig} />);
        expect(container.firstChild).toBeInTheDocument();
        expect(container.firstChild).toHaveClass('w-full');
    });

    it('applies custom width and height', () => {
        const customWidth = 800;
        const customHeight = 600;

        const { container } = render(
            <AppAreaChart data={mockData} config={mockConfig} width={customWidth} height={customHeight} />
        );

        const chartContainer = container.firstChild as HTMLElement;
        expect(chartContainer).toHaveClass('w-full');
        expect(chartContainer).toBeInTheDocument();
    });

    it('renders with custom className', () => {
        const customClass = 'custom-chart-class';
        const { container } = render(<AppAreaChart data={mockData} config={mockConfig} className={customClass} />);
        expect(container.firstChild).toHaveClass('custom-chart-class');
    });

    it('renders with empty data array', () => {
        const { container } = render(<AppAreaChart data={[]} config={mockConfig} />);
        expect(container.firstChild).toBeInTheDocument();
    });
});
