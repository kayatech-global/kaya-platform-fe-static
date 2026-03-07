/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Page from '@/app/workspace/[wid]/usage/page';

jest.mock('lucide-react', () => ({
    HardDrive: () => <div data-testid="hard-drive-icon">HardDrive Icon</div>,
    Coins: () => <div data-testid="coins-icon">Coins Icon</div>,
    TrendingUpIcon: () => <div data-testid="trending-up-icon">Trending Up Icon</div>,
    TrendingDownIcon: () => <div data-testid="trending-down-icon">Trending Down Icon</div>,
}));

jest.mock('@/context', () => ({
    useAuth: () => ({
        token: 'mock-token',
    }),
}));

const mockOverallUsages = [
    {
        title: 'Total Storage',
        value: '500GB',
        icon: <div data-testid="hard-drive-icon">HardDrive Icon</div>,
        trendValue: 10,
        trendColor: 'text-green-500',
        trendIcon: <div data-testid="trending-up-icon">Trending Up Icon</div>,
        description: 'Current storage usage',
    },
    {
        title: 'Total Credits',
        value: '1000',
        icon: <div data-testid="coins-icon">Coins Icon</div>,
        trendValue: -5,
        trendColor: 'text-red-500',
        trendIcon: <div data-testid="trending-down-icon">Trending Down Icon</div>,
        description: 'Credit consumption',
    },
];

const mockChartData = {
    storageConsumption: [
        { month: 'Jan', consumption: 80 },
        { month: 'Feb', consumption: 85 },
        { month: 'Mar', consumption: 75 },
    ],
    creditUsage: [
        { month: 'Jan', consumption: 11000 },
        { month: 'Feb', consumption: 12000 },
        { month: 'Mar', consumption: 10500 },
    ],
    tokenUsage: [
        { month: 'Jan', tokens: 5000 },
        { month: 'Feb', tokens: 5500 },
        { month: 'Mar', tokens: 4800 },
    ],
};

const monthlyCreditUsageData = {
    data: [
        { month: 'May', usage: 90 },
        { month: 'June', usage: 95 },
        { month: 'July', usage: 110 },
        { month: 'August', usage: 105 },
        { month: 'September', usage: 120 },
        { month: 'October', usage: 125 },
        { month: 'November', usage: 115 },
        { month: 'December', usage: 110 },
        { month: 'January', usage: 100 },
        { month: 'February', usage: 80 },
        { month: 'March', usage: 150 },
        { month: 'April', usage: 130 },
    ],
    config: {
        usage: {
            dataKey: 'usage',
            label: 'Usage',
            color: '#3b7af7',
        },
    },
    xAxisKey: 'month',
    dataKeys: ['usage'],
};

const monthlyTokenUsageData = {
    data: [
        { month: 'May', gemini: 90, claude: 110, openAI: 95, mistral: 105 },
        { month: 'June', gemini: 95, claude: 115, openAI: 100, mistral: 110 },
        { month: 'July', gemini: 110, claude: 125, openAI: 115, mistral: 120 },
        { month: 'August', gemini: 105, claude: 130, openAI: 110, mistral: 125 },
        { month: 'September', gemini: 120, claude: 135, openAI: 125, mistral: 130 },
        { month: 'October', gemini: 125, claude: 140, openAI: 130, mistral: 135 },
        { month: 'November', gemini: 115, claude: 130, openAI: 120, mistral: 125 },
        { month: 'December', gemini: 110, claude: 125, openAI: 115, mistral: 120 },
        { month: 'January', gemini: 100, claude: 120, openAI: 105, mistral: 115 },
        { month: 'February', gemini: 80, claude: 100, openAI: 75, mistral: 85 },
        { month: 'March', gemini: 150, claude: 120, openAI: 130, mistral: 140 },
        { month: 'April', gemini: 130, claude: 120, openAI: 140, mistral: 160 },
    ],
    config: {
        gemini: {
            dataKey: 'gemini',
            label: 'Gemini',
            color: '#1d5bd6',
        },
        claude: {
            dataKey: 'claude',
            label: 'Claude',
            color: '#316fed',
        },
        openAI: {
            dataKey: 'openAI',
            label: 'OpenAI',
            color: '#3b7af7',
        },
        mistral: {
            dataKey: 'mistral',
            label: 'Mistral',
            color: '#6194fa',
        },
    },
    xAxisKey: 'month',
};

jest.mock('@/hooks/use-usage', () => ({
    useUsage: () => ({
        overallUsages: mockOverallUsages,
        chartConsumptionData: [
            {
                headings: {
                    title: 'Storage Consumption (GB)',
                    subTitle: 'Month to date consumption',
                    icon: <div data-testid="hard-drive-icon">HardDrive Icon</div>,
                },
                data: mockChartData.storageConsumption,
                stats: { value: '85GB', statsSubHeading: 'Current storage usage' },
                config: {
                    consumption: {
                        label: 'Consumption(GB)',
                        color: '#316fed',
                    },
                },
                styles: { width: 420, height: 311 },
                dataKey: 'consumption',
                needYAxisFormatter: false,
                maxYValue: 90,
            },
            {
                headings: {
                    title: 'Credit Usage',
                    subTitle: 'Month to date consumption',
                    icon: <div data-testid="coins-icon">Coins Icon</div>,
                },
                data: mockChartData.creditUsage,
                stats: { value: '12000', statsSubHeading: 'Current credit usage' },
                config: {
                    consumption: {
                        label: 'Consumption',
                        color: '#316fed',
                    },
                },
                styles: { width: 420, height: 311 },
                dataKey: 'consumption',
                needYAxisFormatter: true,
                maxYValue: 15000,
            },
        ],
        monthlyCreditUsageData,
        monthlyTokenUsageData,
    }),
}));

jest.mock('@/components/molecules/dashboard-card-list/dashboard-data-card-list', () => ({
    __esModule: true,
    default: ({ data }: { data: any[] }) => (
        <div data-testid="dashboard-card-list">
            {data.map((item, index) => (
                <div key={index} data-testid={`dashboard-card-${index}`}>
                    <div data-testid={`card-title-${index}`}>{item.title}</div>
                    <div data-testid={`card-value-${index}`}>{item.value}</div>
                    <div data-testid={`card-icon-${index}`}>{item.icon}</div>
                    <div data-testid={`card-trend-${index}`}>{item.trendIcon}</div>
                </div>
            ))}
        </div>
    ),
}));

jest.mock('@/app/workspace/[wid]/usage/components/chart-container', () => ({
  ChartContainer: ({ consumptionData, monthlyCreditUsageData, monthlyTokenUsageData }: any) => (
    <div data-testid="chart-container">
      <div data-testid="consumption-charts">
        {consumptionData.map((chart: any, index: number) => (
          <div key={index} data-testid={`chart-${index}`}>
            <div data-testid={`chart-title-${index}`}>{chart.headings.title}</div>
            <div data-testid={`chart-icon-${index}`}>{chart.headings.icon}</div>
          </div>
        ))}
      </div>
      <div data-testid="credit-usage-data">
        {monthlyCreditUsageData.data.map((item: any, index: number) => (
          <div key={index} data-testid={`credit-data-${index}`}>{item.usage}</div>
        ))}
      </div>
      <div data-testid="token-usage-data">
        {monthlyTokenUsageData.data.map((item: any, index: number) => (
          <div key={index} data-testid={`token-data-${index}`}>{item.gemini}</div>
        ))}
      </div>
    </div>
  )
}));

describe('Usage Page Integration', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
    });

    test('renders the page with all components and data', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Page />
            </QueryClientProvider>
        );

        const mainContainer = screen.getByTestId('usage-page');
        expect(mainContainer).toBeInTheDocument();
        expect(mainContainer).toHaveClass('usage-page', 'pb-4', 'max-w-[1280px]', 'mx-auto');

        const cardList = screen.getByTestId('dashboard-card-list');
        expect(cardList).toBeInTheDocument();

        mockOverallUsages.forEach((item, index) => {
            const card = screen.getByTestId(`dashboard-card-${index}`);
            expect(card).toBeInTheDocument();
            expect(screen.getByTestId(`card-title-${index}`)).toHaveTextContent(item.title);
            expect(screen.getByTestId(`card-value-${index}`)).toHaveTextContent(item.value);
            expect(screen.getByTestId(`card-icon-${index}`)).toBeInTheDocument();
            expect(screen.getByTestId(`card-trend-${index}`)).toBeInTheDocument();
        });

        const chartContainer = screen.getByTestId('chart-container');
        expect(chartContainer).toBeInTheDocument();

        const charts = screen.getAllByTestId(/^chart-\d+$/);
        expect(charts).toHaveLength(2);
        expect(screen.getByText('Storage Consumption (GB)')).toBeInTheDocument();
        expect(screen.getByText('Credit Usage')).toBeInTheDocument();

        expect(screen.getAllByTestId('hard-drive-icon')).toHaveLength(2);
        expect(screen.getAllByTestId('coins-icon')).toHaveLength(2);

        monthlyCreditUsageData.data.forEach((item, index) => {
            const creditData = screen.getByTestId(`credit-data-${index}`);
            expect(creditData).toBeInTheDocument();
            expect(creditData).toHaveTextContent(item.usage.toString());
        });

        monthlyTokenUsageData.data.forEach((item, index) => {
            const tokenData = screen.getByTestId(`token-data-${index}`);
            expect(tokenData).toBeInTheDocument();
            expect(tokenData).toHaveTextContent(item.gemini.toString());
        });
    });
});
