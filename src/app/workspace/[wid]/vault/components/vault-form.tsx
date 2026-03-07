import { Button, Input, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn, getSubmitButtonLabel } from '@/lib/utils';
import { FormRule, IVaultForm } from '@/models';
import { Eye, EyeOff, Vault } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FieldErrors, UseFormHandleSubmit, UseFormRegister, UseFormWatch } from 'react-hook-form';

interface VaultProps {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    secretKeyValidation: FormRule;
    secretDescriptionValidation: FormRule;
    secretValueValidation: FormRule;
    errors: FieldErrors<IVaultForm>;
    isSaving: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IVaultForm>;
    watch: UseFormWatch<IVaultForm>;
    handleSubmit: UseFormHandleSubmit<IVaultForm>;
    onHandleSubmit: (data: IVaultForm) => void;
    validateVault: (value: string, text: string) => string | true;
}

export const FormBody = (props: VaultProps) => {
    const {
        register,
        watch,
        secretKeyValidation,
        secretDescriptionValidation,
        secretValueValidation,
        errors,
        isEdit,
        validateVault,
    } = props;
    const [show, setShow] = useState<boolean>(false);

    const isReadOnlyValue = watch('isReadOnly');
    const isReadOnly = useMemo(() => !!isReadOnlyValue, [isReadOnlyValue]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-4">
            <div className="col-span-1 sm:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        {...register('vaultKey', {
                            ...secretKeyValidation,
                            validate: value => validateVault(value, 'secret key'),
                        })}
                        placeholder="Enter your Secret Key"
                        readOnly={isEdit}
                        label="Secret Key"
                        autoComplete="off"
                        isDestructive={!!errors?.vaultKey?.message}
                        supportiveText={errors?.vaultKey?.message}
                    />
                    <Input
                        {...register('vaultDescription', {
                            ...secretDescriptionValidation,
                            validate: value => validateVault(value, 'secret description'),
                        })}
                        placeholder="Enter your Secret Description"
                        readOnly={isEdit && isReadOnly}
                        label="Secret Description"
                        autoComplete="off"
                        isDestructive={!!errors?.vaultDescription?.message}
                        supportiveText={errors?.vaultDescription?.message}
                    />
                </div>
            </div>
            <div className="col-span-1 sm:col-span-2">
                    <Input
                        {...register('vaultValue', {
                            ...secretValueValidation,
                            validate: value => validateVault(value, 'secret value'),
                        })}
                        placeholder="Enter your Secret Value"
                        readOnly={isEdit && isReadOnly}
                        label="Secret Value"
                        type={show ? 'text' : 'password'}
                        trailingIcon={
                            <button
                                type="button"
                                onClick={() => setShow(!show)}
                                className="bg-transparent border-none p-0 cursor-pointer"
                                aria-label={show ? 'Hide secret' : 'Show secret'}
                            >
                                {show ? <EyeOff /> : <Eye />}
                            </button>
                        }
                        isDestructive={!!errors?.vaultValue?.message}
                        supportiveText={errors?.vaultValue?.message}
                    />
            </div>
        </div>
    );
};

export const VaultForm = (props: VaultProps) => {
    const { isOpen, setOpen, handleSubmit, onHandleSubmit, watch, isEdit, isValid, isSaving } = props;

    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet
            setOpen={setOpen}
            className="custom-drawer-content !w-[633px]"
            dismissible={false}
            headerIcon={<Vault />}
            header={isEdit ? 'Edit Vault' : 'New Vault'}
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant={'secondary'} size={'sm'} onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size={'sm'}
                                        disabled={!isValid || isSaving || (isEdit && !!watch('isReadOnly'))}
                                        onClick={handleSubmit(onHandleSubmit)}
                                    >
                                        {getSubmitButtonLabel(isSaving, isEdit)}
                                    </Button>
                                </TooltipTrigger>
                                {!isValid && (
                                    <TooltipContent side="left" align="center">
                                        All details need to be filled before the form can be saved
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            }
            content={
                <div className={cn('activity-feed-container p-4')}>
                    <FormBody {...props} />
                </div>
            }
        />
    );
};

export default VaultForm;
