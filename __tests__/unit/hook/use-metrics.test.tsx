import { renderHook } from '@testing-library/react';
import { useMetrics } from '@/hooks/use-metrics';
import { useQuery, QueryClient, QueryClientProvider } from 'react-query';
import { useAuth } from '@/context';
import { $fetch } from '@/utils';
import { ReactNode } from 'react';
import { mockOverallMetricUsageResponse } from '@/test/__mock__/overall-metrics-mock';

jest.mock('react-query', () => ({
    ...jest.requireActual('react-query'),
    useQuery: jest.fn(),
}));
jest.mock('@/context');
jest.mock('@/utils');
jest.mock('next/navigation', () => ({
    useParams: () => ({ wid: '123' }),
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

describe('useMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        queryClient.clear();

        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 1 },
            workspace: { id: 123 },
            token: 'mock-token',
        });

        (useQuery as jest.Mock).mockImplementation(queryKey => {
            if (queryKey === 'overall-metric-usage') {
                return {
                    data: mockOverallMetricUsageResponse,
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

        ($fetch as jest.Mock).mockResolvedValue({ data: mockOverallMetricUsageResponse });
    });

    it('should fetch and process usage data correctly', async () => {
        const { result } = renderHook(() => useMetrics(), { wrapper });

        expect(result.current.isFetching).toBeFalsy();
        expect(useQuery).toHaveBeenCalledWith(
            'overall-metric-usage',
            expect.any(Function),
            expect.objectContaining({
                enabled: true,
                refetchOnWindowFocus: false,
            })
        );
        expect(result.current.workspaceDataCardInfo).toBeDefined();
        expect(result.current.llmExecutions).toBeDefined();
        expect(result.current.workflowExecutions).toBeDefined();
        expect(result.current.apiExecutions).toBeDefined();
    });

    it('should handle loading state', () => {
        (useQuery as jest.Mock).mockImplementation(() => ({
            data: null,
            isLoading: true,
            isFetching: true,
            error: null,
        }));

        const { result } = renderHook(() => useMetrics(), { wrapper });
        expect(result.current.isFetching).toBeTruthy();
    });

    it('should format usage data correctly', () => {
        const { result } = renderHook(() => useMetrics(), { wrapper });

        const creditConsumption = result.current.workspaceDataCardInfo.find(
            x => x.title?.toString() === 'Most Credit Consumption'
        );
        const highestTokenUsage = result.current.workspaceDataCardInfo.find(
            x => x.title?.toString() === 'Highest Token Usage'
        );
        const mostExecuted = result.current.workspaceDataCardInfo.find(x => x.title?.toString() === 'Most Executed');

        expect(creditConsumption).toBeDefined();
        expect(highestTokenUsage).toBeDefined();
        expect(mostExecuted).toBeDefined();
    });

    it('should map workflow execution data correctly', () => {
        const { result } = renderHook(() => useMetrics(), { wrapper });

        const workflowExecutions = result.current.workflowExecutions.flatMap(x => x.children);

        expect(workflowExecutions).toBeDefined();
    });

    it('should handle workspace data correctly', () => {
        const { result } = renderHook(() => useMetrics(), { wrapper });

        expect(result.current.workspaceDataCardInfo).toHaveLength(3);
        const [credit, token, executed] = result.current.workspaceDataCardInfo;

        expect(credit).toHaveProperty('title');
        expect(credit).toHaveProperty('value');
        expect(token).toHaveProperty('title');
        expect(token).toHaveProperty('value');
        expect(executed).toHaveProperty('title');
        expect(executed).toHaveProperty('value');
    });
});
