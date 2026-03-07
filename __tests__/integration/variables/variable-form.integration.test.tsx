/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import '@testing-library/jest-dom';
import { FormBody as VariableForm } from '@/app/workspace/[wid]/variables/components/variable-form';
import { IVariable } from '@/models';

jest.mock('@/components/molecules/drawer/app-drawer', () => ({
    __esModule: true,
    default: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components', () => ({
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
    Select: ({ label, supportiveText, isDestructive, options, currentValue, ...props }: any) => (
        <div>
            <label htmlFor={label}>{label}</label>
            <select id={label} aria-label={label} data-destructive={isDestructive} value={currentValue} {...props}>
                <option value="">Select</option>
                {options?.map((o: any) => (
                    <option key={o.value} value={o.value}>
                        {o.name}
                    </option>
                ))}
            </select>
            {supportiveText && <span role="alert">{supportiveText}</span>}
        </div>
    ),
}));

const renderForm = (isEdit = false, defaultValues = {}) => {
    const Wrapper = () => {
        const {
            register,
            watch,
            setValue,
            handleSubmit,
            control,
            formState: { errors, isValid },
        } = useForm<IVariable>({
            mode: 'onSubmit',
            defaultValues,
        });

        return (
            <form onSubmit={handleSubmit(jest.fn())}>
                <VariableForm
                    isOpen
                    isEdit={isEdit}
                    isValid={isValid}
                    errors={errors}
                    isSaving={false}
                    setOpen={jest.fn()}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    handleSubmit={handleSubmit}
                    onHandleSubmit={jest.fn()}
                    control={control}
                />
                <button type="submit">Submit</button>
            </form>
        );
    };

    return render(<Wrapper />);
};

describe('Variable Form', () => {
    it('renders exactly the expected input fields', () => {
        renderForm();

        // Collect all form input labels (textboxes and comboboxes)
        const formInputs = [
            ...screen.getAllByRole('textbox'), // Input & Textarea
            ...screen.getAllByRole('combobox'), // Select
        ].map(input => input.getAttribute('aria-label')); // get label

        const expectedFields = ['Variable Name', 'Data Type', 'Description'];

        // This will fail if someone adds/removes a field
        expect(formInputs.sort()).toEqual(expectedFields.sort());
    });

    it('renders all input fields', () => {
        renderForm();

        expect(screen.getByRole('textbox', { name: /Variable Name/i })).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: /Data Type/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /Description/i })).toBeInTheDocument();
    });

    it('shows required validation errors on submit', async () => {
        renderForm();

        await userEvent.click(screen.getByText('Submit'));

        const alerts = await screen.findAllByRole('alert');
        expect(alerts.length).toBeGreaterThan(0);

        expect(screen.getByText(/Please enter a variable name/i)).toBeInTheDocument();
        expect(screen.getByText(/Please select a data type/i)).toBeInTheDocument();
        expect(screen.getByText(/Please enter a description/i)).toBeInTheDocument();
    });

    it('validates minimum length for description', async () => {
        renderForm();

        await userEvent.type(screen.getByLabelText(/Variable Name/i), 'valid_name');
        await userEvent.selectOptions(screen.getByLabelText(/Data Type/i), 'string');
        await userEvent.type(screen.getByLabelText(/Description/i), 'abc');

        await userEvent.click(screen.getByText('Submit'));

        expect(await screen.findByText(/Description must be at least 5 characters long/i)).toBeInTheDocument();
    });

    it('validates invalid identifier characters', async () => {
        renderForm();

        await userEvent.type(screen.getByLabelText(/Variable Name/i), '123invalid');
        await userEvent.click(screen.getByText('Submit'));

        expect(await screen.findByText(/Variable name must be a valid key/i)).toBeInTheDocument();
    });

    it('validates leading space in identifier', async () => {
        renderForm();

        await userEvent.type(screen.getByLabelText(/Variable Name/i), ' invalid');
        await userEvent.click(screen.getByText('Submit'));

        expect(await screen.findByText(/No leading spaces in variable name/i)).toBeInTheDocument();
    });

    it('validates trailing spaces in description', async () => {
        renderForm();

        await userEvent.type(screen.getByLabelText(/Variable Name/i), 'valid_name');
        await userEvent.selectOptions(screen.getByLabelText(/Data Type/i), 'string');
        await userEvent.type(screen.getByLabelText(/Description/i), 'valid description ');

        await userEvent.click(screen.getByText('Submit'));

        expect(await screen.findByText(/No trailing spaces in description/i)).toBeInTheDocument();
    });

    it('makes fields readonly when isEdit and isReadOnly true', () => {
        renderForm(true, { isReadOnly: true });

        expect(screen.getByLabelText(/Variable Name/i)).toHaveAttribute('readOnly');
        expect(screen.getByLabelText(/Description/i)).toHaveAttribute('readOnly');
    });
});
