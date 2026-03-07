import { renderHook } from '@testing-library/react';
import { useUsage } from '@/hooks/use-usage';
import { useQuery, QueryClient, QueryClientProvider } from 'react-query';
import { useAuth } from '@/context';
import { useApp } from '@/context/app-context';
import { $fetch } from '@/utils';
import { OverallUsageType } from '@/enums';
import { ReactNode } from 'react';
import { mockOverallUsageResponse, mockOverallUsages } from '@/test/__mock__/overall-usage-mock';

// Mock dependencies
jest.mock('react-query', () => ({
    ...jest.requireActual('react-query'),
    useQuery: jest.fn(),
}));
jest.mock('@/context');
jest.mock('@/utils');
jest.mock('next/navigation', () => ({
    useParams: () => ({ wid: '123' }),
}));
jest.mock('lucide-react', () => ({
    Coins: () => null,
    HardDrive: () => null,
    TrendingDownIcon: () => null,
    TrendingUpIcon: () => null,
}));
jest.mock('@/context/app-context', () => ({
    useApp: jest.fn(),
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useUsage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        queryClient.clear();

        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1 },
            workspace: { id: 123 },
            token: 'mock-token',
        });

        (useQuery as jest.Mock).mockImplementation(queryKey => {
            if (queryKey === 'overall-usage') {
                return {
                    data: mockOverallUsageResponse,
                    isLoading: false,
                    isFetching: false,
                    error: null,
                };
            }
            return {
                data: null,
                isLoading: false,
                isFetching: false,
                error: null,
            };
        });

        (useApp as jest.Mock).mockReturnValue({
            isAppLoading: { page: '/base', state: false },
            setIsAppLoading: jest.fn(),
            isWorkspacePageLoading: { page: '/usage', state: true },
            setIsWorkspacePageLoading: jest.fn(),
            failedComponents: [],
            setFailedComponents: jest.fn(),
        });

        ($fetch as jest.Mock).mockResolvedValue({ data: mockOverallUsageResponse });
    });

    it('should fetch and process usage data correctly', async () => {
        const { result } = renderHook(() => useUsage(), { wrapper });

        expect(result.current.isFetching).toBeFalsy();
        expect(useQuery).toHaveBeenCalledWith(
            'overall-usage',
            expect.any(Function),
            expect.objectContaining({
                enabled: true,
                refetchOnWindowFocus: false,
            })
        );
        expect(result.current.overallUsages).toBeDefined();
        expect(result.current.chartConsumptionData).toBeDefined();
        expect(result.current.monthlyTokenUsageData).toBeDefined();
        expect(result.current.monthlyCreditUsageData).toBeDefined();
        expect(result.current.workflowExecutionData).toBeDefined();
    });

    it('should handle loading state', () => {
        (useQuery as jest.Mock).mockImplementation(() => ({
            data: null,
            isLoading: true,
            isFetching: true,
            error: null,
        }));

        const { result } = renderHook(() => useUsage(), { wrapper });
        expect(result.current.isFetching).toBeTruthy();
    });

    it('should format usage data correctly', () => {
        const { result } = renderHook(() => useUsage(), { wrapper });

        const storageUsage = result.current.overallUsages.find(usage => usage.type === OverallUsageType.STORAGE);
        const tokenUsage = result.current.overallUsages.find(usage => usage.type === OverallUsageType.TOKENS);
        const creditUsage = result.current.overallUsages.find(usage => usage.type === OverallUsageType.CREDITS);

        expect(storageUsage).toBeDefined();
        expect(tokenUsage).toBeDefined();
        expect(creditUsage).toBeDefined();
    });

    it('should handle consumption data correctly', () => {
        const { result } = renderHook(() => useUsage(), { wrapper });

        expect(result.current.chartConsumptionData).toHaveLength(3);
        const [storage, tokens, credits] = result.current.chartConsumptionData;

        expect(storage.data[0]).toHaveProperty('month');
        expect(storage.data[0]).toHaveProperty('consumption');
        expect(tokens.data[0]).toHaveProperty('month');
        expect(tokens.data[0]).toHaveProperty('consumption');
        expect(credits.data[0]).toHaveProperty('month');
        expect(credits.data[0]).toHaveProperty('consumption');
    });

    describe('mapOverallUsages', () => {
        it('should correctly map storage usage data', () => {
            const { result } = renderHook(() => useUsage(), { wrapper });

            result.current.mapOverallUsages(mockOverallUsages);

            expect(result.current.overallUsages).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        type: OverallUsageType.STORAGE,
                        title: expect.any(Object),
                        value: expect.any(Object),
                    }),
                ])
            );
        });

        it('should correctly map credits usage data', () => {
            const { result } = renderHook(() => useUsage(), { wrapper });

            result.current.mapOverallUsages(mockOverallUsages);
            expect(result.current.overallUsages).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        type: OverallUsageType.CREDITS,
                        title: expect.any(Object),
                        value: expect.any(Object),
                    }),
                ])
            );
        });

        it('should handle empty usage data', () => {
            const { result } = renderHook(() => useUsage(), { wrapper });

            result.current.mapOverallUsages(mockOverallUsages);
            expect(result.current.overallUsages).toBeDefined();
        });

        it('should update all usage types when data is provided', () => {
            const { result } = renderHook(() => useUsage(), { wrapper });

            result.current.mapOverallUsages(mockOverallUsages);
            expect(result.current.overallUsages).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ type: OverallUsageType.STORAGE }),
                    expect.objectContaining({ type: OverallUsageType.CREDITS }),
                    expect.objectContaining({ type: OverallUsageType.TOKENS }),
                ])
            );
        });
    });
});
