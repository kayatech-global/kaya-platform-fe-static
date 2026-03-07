import React, { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { useQuery, QueryClient, QueryClientProvider } from 'react-query';
import { useWorkspace } from '@/hooks/use-workspace';
import { useAuth } from '@/context';
import { $fetch } from '@/utils';
import { EmailType } from '@/enums';

jest.mock('react-query', () => ({
    ...jest.requireActual('react-query'),
    useQuery: jest.fn(),
}));
jest.mock('@/context');
jest.mock('@/utils');

jest.mock('sonner', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
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

describe('useWorkspace', () => {
    const mockOnClose = jest.fn();
    const mockOnRefetchEnvironment = jest.fn();
    const domains = ['xyz.com', 'abc.com'];
    beforeEach(() => {
        jest.clearAllMocks();
        queryClient.clear();

        (useAuth as jest.Mock).mockReturnValue({ token: 'mock-token' });

        (useQuery as jest.Mock).mockImplementation(() => {
            return {
                data: domains,
                isLoading: false,
                isFetching: false,
                error: null,
                domains,
            };
        });
    });

    it('should initialize form with correct validation rules', () => {
        const { result } = renderHook(
            () =>
                useWorkspace({
                    onClose: mockOnClose,
                    refetchEnvironment: mockOnRefetchEnvironment,
                    workspaceId: undefined,
                    metadataCollection: [],
                }),
            {
                wrapper,
            }
        );

        expect(result.current.register).toBeDefined();
        expect(result.current.errors).toBeDefined();
        expect(result.current.getValues).toBeDefined();
        expect(result.current.watch).toBeDefined();

        expect(result.current.workspaceNameValidation?.required?.value).toBeTruthy();
        expect(result.current.workspaceNameValidation?.minLength?.value).toBe(2);
        expect(result.current.workspaceNameValidation?.maxLength?.value).toBe(50);

        expect(result.current.workspaceDescriptionValidation?.required?.value).toBeTruthy();
        expect(result.current.workspaceDescriptionValidation?.minLength?.value).toBe(20);
    });

    it('should validate workspace name', async () => {
        (jest.mocked($fetch) as jest.Mock).mockResolvedValue({
            data: true,
        });

        const { result } = renderHook(
            () =>
                useWorkspace({
                    onClose: mockOnClose,
                    refetchEnvironment: mockOnRefetchEnvironment,
                    workspaceId: undefined,
                    metadataCollection: [],
                }),
            {
                wrapper,
            }
        );

        const hasLeadingSpace = await result.current.validateWorkspaceName(' New Workspace');
        expect(hasLeadingSpace).toEqual('No leading spaces in workspace name');

        const hasTrailingSpace = await result.current.validateWorkspaceName('New Workspace ');
        expect(hasTrailingSpace).toEqual('No trailing spaces in workspace name');

        const hasSpecialCharacters = await result.current.validateWorkspaceName('New-Workspace');
        expect(hasSpecialCharacters).toEqual('Workspace name cannot contain special characters');

        const validValue = await result.current.validateWorkspaceName('New Workspace');
        expect(validValue).toBeTruthy();
    });

    it('should validate workspace description', () => {
        (jest.mocked($fetch) as jest.Mock).mockResolvedValue({
            data: true,
        });

        const { result } = renderHook(
            () =>
                useWorkspace({
                    onClose: mockOnClose,
                    refetchEnvironment: mockOnRefetchEnvironment,
                    workspaceId: undefined,
                    metadataCollection: [],
                }),
            {
                wrapper,
            }
        );

        const hasLeadingSpace = result.current.validateWorkspaceDescription(' New Workspace description');
        expect(hasLeadingSpace).toEqual('No leading spaces in workspace description');

        const hasTrailingSpace = result.current.validateWorkspaceDescription('New Workspace description ');
        expect(hasTrailingSpace).toEqual('No trailing spaces in workspace description');

        const validValue = result.current.validateWorkspaceDescription('New Workspace description');
        expect(validValue).toBeTruthy();
    });

    it('should fetch workspace domains', async () => {
        (jest.mocked($fetch) as jest.Mock).mockResolvedValue({
            data: domains,
        });

        const { result } = renderHook(
            () =>
                useWorkspace({
                    onClose: mockOnClose,
                    refetchEnvironment: mockOnRefetchEnvironment,
                    workspaceId: undefined,
                    metadataCollection: [],
                }),
            {
                wrapper,
            }
        );

        const invalidEmail = await result.current.validateEmail('abc', EmailType.User);
        expect(invalidEmail).toEqual('Please enter a valid email address');

        const invalidDomain = await result.current.validateEmail('test@gmail.com', EmailType.User);
        expect(invalidDomain).toEqual('Invalid domain gmail.com, only xyz.com, abc.com allowed');

        const userCannotBeEmpty = await result.current.validateEmail('', EmailType.User);
        expect(userCannotBeEmpty).toEqual(result.current.requiredUserEmail);

        result.current.setValue('email', 'test@xyz.com');
        result.current.manageUserEmail();

        const existUser = await result.current.validateEmail('test@xyz.com', EmailType.User);
        expect(existUser).toEqual('This email is already in use');
    });
});
