'use client';

import * as React from 'react';
import { Button, Select, OptionModel, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { CirclePlus, Vault } from 'lucide-react';
import { useVault } from '@/hooks/use-vault';
import { FormBody as VaultFormBody } from '@/app/workspace/[wid]/vault/components/vault-form';
import { renderIcon } from '@/lib/utils';

interface InputProps extends React.ComponentProps<'select'> {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    placeholder?: string;
    options: OptionModel[];
    currentValue?: string | number;
    disableCreate?: boolean;
    loadingSecrets?: boolean;
    hasClear?: boolean;
    onClear?: () => void;
    onRefetch: () => void;
    helperInfo?: string;
}

const VaultSelector = React.forwardRef<HTMLSelectElement, InputProps>(
    (
        {
            className,
            label,
            supportiveText,
            leadingIcon,
            isDestructive = false,
            placeholder,
            options,
            currentValue,
            disableCreate,
            loadingSecrets,
            hasClear = false,
            onClear,
            onRefetch,
            onChange,
            helperInfo,
            ...props
        },
        ref
    ) => {
        const {
            isOpen,
            isValid,
            secretKeyValidation,
            secretDescriptionValidation,
            secretValueValidation,
            errors,
            isSaving,
            setOpen,
            register,
            watch,
            handleSubmit,
            onHandleSubmit,
            validateVault,
        } = useVault({ triggerQuery: false, onRefetch, onChange, data: props?.name });

        return (
            <>
                <div className="flex w-full">
                    <Select
                        ref={ref}
                        {...props}
                        options={options}
                        className={className ? `${className} vault-select`.trimEnd() : `vault-select`}
                        label={label}
                        supportiveText={supportiveText}
                        leadingIcon={leadingIcon}
                        isDestructive={isDestructive}
                        placeholder={placeholder}
                        currentValue={currentValue}
                        value={currentValue}
                        hasClear={hasClear}
                        onClear={onClear}
                        onChange={onChange}
                        isVault
                        helperInfo={helperInfo}
                        trailingIcon={
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="p-2 new-vault-select h-full"
                                            disabled={disableCreate || loadingSecrets}
                                            loading={loadingSecrets}
                                            onClick={() => setOpen(true)}
                                        >
                                            {loadingSecrets ? <></> : <CirclePlus size={16} />}
                                        </Button>
                                    </TooltipTrigger>
                                    {!disableCreate && !loadingSecrets && (
                                        <TooltipContent side="bottom" align="center">
                                            Add New Vault
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        }
                    />
                </div>
                <Dialog open={isOpen} onOpenChange={setOpen}>
                    <DialogContent className="max-w-[unset] w-[580px]">
                        <DialogHeader className="px-0">
                            <DialogTitle asChild>
                                <div className="px-4 flex items-center gap-x-2">
                                    <div className="bg-blue-100 flex items-center justify-center w-8 h-8 rounded dark:bg-blue-900">
                                        {renderIcon(<Vault />, 16, 'text-blue-600 dark:text-blue-200')}
                                    </div>
                                    <div className="text-md font-regular text-gray-900 dark:text-gray-50">
                                        New Vault
                                    </div>
                                </div>
                            </DialogTitle>
                        </DialogHeader>
                        <DialogDescription asChild>
                            <div className="px-4 flex flex-col gap-y-4 h-[351px]">
                                <VaultFormBody
                                    isOpen={isOpen}
                                    isEdit={false}
                                    isValid={isValid}
                                    secretKeyValidation={secretKeyValidation}
                                    secretDescriptionValidation={secretDescriptionValidation}
                                    secretValueValidation={secretValueValidation}
                                    errors={errors}
                                    isSaving={isSaving}
                                    setOpen={setOpen}
                                    register={register}
                                    watch={watch}
                                    handleSubmit={handleSubmit}
                                    onHandleSubmit={onHandleSubmit}
                                    validateVault={validateVault}
                                />
                            </div>
                        </DialogDescription>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                disabled={!isValid || isSaving}
                                onClick={handleSubmit(onHandleSubmit)}
                            >
                                {isSaving ? 'Saving' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        );
    }
);
VaultSelector.displayName = 'Vault Input';

export { VaultSelector };
