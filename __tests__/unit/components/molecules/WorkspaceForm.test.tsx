/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkspaceForm from '@/app/workspaces/components/workspace-form';
import { useWorkspace } from '@/hooks/use-workspace';
import '@testing-library/jest-dom';

jest.mock('@/components', () => ({
    Button: ({ children, loading, ...props }: any) => (
        <button data-testid="save" disabled={loading === true} {...props}>
            {children}
        </button>
    ),
    Input: ({ label, supportiveText, isDestructive, ...props }: any) => (
        <div>
            <label htmlFor={label}>{label}</label>
            <input id={label} aria-label={label} data-destructive={isDestructive} {...props} />
            {supportiveText && <span role="alert">{supportiveText}</span>}
        </div>
    ),
    Textarea: ({ label, supportiveText, isDestructive, ...props }: any) => (
        <div>
            <label htmlFor={label}>{label}</label>
            <textarea id={label} aria-label={label} data-destructive={isDestructive} {...props} />
            {supportiveText && <span role="alert">{supportiveText}</span>}
        </div>
    ),
}));

jest.mock('@/app/workspaces/components/user-input', () => ({
    __esModule: true,
    default: ({ label, errors, hasCommonErrors }: any) => (
        <div>
            <label htmlFor={label}>{label}</label>
            <input id={label} aria-label={label} data-error={hasCommonErrors} />
            {errors && <span role="alert">{errors}</span>}
        </div>
    ),
}));

jest.mock('@/components/atoms/dialog', () => ({
    DialogBody: ({ children }: any) => <div data-testid="dialog-body">{children}</div>,
    DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
}));

jest.mock('@/hooks/use-workspace');

describe('WorkspaceForm', () => {
    const mockOnClose = jest.fn();
    const mockHandleSubmit = jest.fn(fn => fn);
    const mockRegister = jest.fn(() => ({}));
    const mockGetValues = jest.fn();
    const mockWatch = jest.fn();
    const mockValidateEmail = jest.fn();
    const mockValidateWorkspaceName = jest.fn();
    const mockValidateWorkspaceDescription = jest.fn();
    const mockManageUserEmail = jest.fn();
    const mockRemoveEmailByType = jest.fn();
    const mockMangeUserRole = jest.fn();
    const mockOnHandleSubmit = jest.fn();
    const mockButtonText = jest.fn();
    const mockOnRefetchEnvironment = jest.fn();

    beforeEach(() => {
        (useWorkspace as jest.Mock).mockReturnValue({
            isLoading: false,
            loading: false,
            isFetching: false,
            isValid: false,
            hasErrors: false,
            errors: {},
            requiredUserEmail: 'User email is required',
            workspaceNameValidation: { required: 'Workspace name is required' },
            workspaceDescriptionValidation: { required: false },
            register: mockRegister,
            getValues: mockGetValues,
            manageUserEmail: mockManageUserEmail,
            removeEmailByType: mockRemoveEmailByType,
            mangeUserRole: mockMangeUserRole,
            watch: mockWatch,
            validateEmail: mockValidateEmail,
            validateWorkspaceName: mockValidateWorkspaceName,
            validateWorkspaceDescription: mockValidateWorkspaceDescription,
            handleSubmit: mockHandleSubmit,
            onHandleSubmit: mockOnHandleSubmit,
            buttonText: mockButtonText,
        });

        mockGetValues.mockReturnValue([]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form with all required fields', () => {
        render(
            <WorkspaceForm
                onClose={mockOnClose}
                workspaceId={undefined}
                metadataCollection={[]}
                refetchEnvironment={mockOnRefetchEnvironment}
            />
        );

        expect(screen.getByRole('textbox', { name: /Workspace Name/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /Description/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /Workspace Users/i })).toBeInTheDocument();
        expect(screen.getByTestId('save')).toBeInTheDocument();
    });

    it('handles form submission', async () => {
        render(
            <WorkspaceForm
                onClose={mockOnClose}
                workspaceId={undefined}
                metadataCollection={[]}
                refetchEnvironment={mockOnRefetchEnvironment}
            />
        );

        const saveButton = screen.getByTestId('save');
        await userEvent.click(saveButton);

        expect(mockHandleSubmit).toHaveBeenCalledWith(mockOnHandleSubmit);
    });

    it('displays validation errors', () => {
        const mockErrors = {
            name: { message: 'Workspace name is required' },
            email: { message: 'Invalid email format' },
        };

        (useWorkspace as jest.Mock).mockReturnValue({
            ...useWorkspace({
                onClose: jest.fn(),
                workspaceId: undefined,
                metadataCollection: [],
                refetchEnvironment: jest.fn(),
            }),
            errors: mockErrors,
        });

        render(
            <WorkspaceForm
                onClose={mockOnClose}
                workspaceId={undefined}
                metadataCollection={[]}
                refetchEnvironment={mockOnRefetchEnvironment}
            />
        );

        const errorMessages = screen.getAllByRole('alert');
        expect(errorMessages).toHaveLength(2);
        expect(errorMessages[0]).toHaveTextContent('Workspace name is required');
        expect(errorMessages[1]).toHaveTextContent('Invalid email format');
    });

    it('disables save button when loading', () => {
        (useWorkspace as jest.Mock).mockReturnValue({
            ...useWorkspace({
                onClose: jest.fn(),
                workspaceId: undefined,
                metadataCollection: [],
                refetchEnvironment: jest.fn(),
            }),
            isLoading: true,
            loading: true,
            isFetching: true,
        });

        render(
            <WorkspaceForm
                onClose={mockOnClose}
                workspaceId={undefined}
                metadataCollection={[]}
                refetchEnvironment={mockOnRefetchEnvironment}
            />
        );

        expect(screen.getByTestId('save')).toBeDisabled();
    });

    it('disables save button when fetching', () => {
        (useWorkspace as jest.Mock).mockReturnValue({
            ...useWorkspace({
                onClose: jest.fn(),
                workspaceId: undefined,
                metadataCollection: [],
                refetchEnvironment: jest.fn(),
            }),
            isFetching: true,
        });

        render(
            <WorkspaceForm
                onClose={mockOnClose}
                workspaceId={undefined}
                metadataCollection={[]}
                refetchEnvironment={mockOnRefetchEnvironment}
            />
        );

        expect(screen.getByTestId('save')).toBeDisabled();
    });
});
