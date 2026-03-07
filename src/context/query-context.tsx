'use client';

import { ReactNode, FC } from 'react';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

interface QueryProviderProps {
    children: ReactNode;
    dehydratedState: unknown;
}

export const QueryProvider: FC<QueryProviderProps> = ({ children, dehydratedState }) => {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <Hydrate state={dehydratedState}>{children}</Hydrate>
            <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        </QueryClientProvider>
    );
};
