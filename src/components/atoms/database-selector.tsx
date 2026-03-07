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
import { CirclePlus, Database } from 'lucide-react';
import { useDatabase } from '@/hooks/use-database';
import { renderIcon } from '@/lib/utils';
import { FormBody as DatabaseFormBody } from '@/app/workspace/[wid]/configure-connections/databases/components/form-body';
import { DatabaseItemType } from '@/enums';
import { IHookForm } from '@/models';

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
    loadingDatabases?: boolean;
    hasClear?: boolean;
    databaseType?: DatabaseItemType;
    hookForm?: IHookForm;
    onClear?: () => void;
    onRefetch: (id?: unknown) => void;
}

const DatabaseSelector = React.forwardRef<HTMLSelectElement, InputProps>(
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
            loadingDatabases,
            hasClear = false,
            databaseType,
            hookForm,
            onClear,
            onRefetch,
            ...props
        },
        ref
    ) => {
        const {
            isOpen,
            isReadOnly,
            selectedDatabase,
            errors,
            isSaving,
            isValid,
            secrets,
            loadingSecrets,
            control,
            setIsOpen,
            register,
            watch,
            setValue,
            handleCreate,
            handleSubmit,
            onHandleSubmit,
            refetch,
        } = useDatabase({ triggerQuery: false, onRefetch, hookForm });

        const onVaultRefetch = () => {
            refetch();
        };

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
                        hasClear={hasClear}
                        onClear={onClear}
                        isVault
                        trailingIcon={
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="p-2 new-vault-select h-full"
                                            disabled={disableCreate || loadingDatabases}
                                            loading={loadingDatabases}
                                            onClick={() => handleCreate()}
                                        >
                                            {loadingDatabases ? <></> : <CirclePlus size={16} />}
                                        </Button>
                                    </TooltipTrigger>
                                    {!disableCreate && !loadingDatabases && (
                                        <TooltipContent side="bottom" align="center">
                                            Add New Database
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        }
                        onChange={e => console.log(e.target.value)}
                    />
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="max-w-[unset] w-[580px]">
                        <DialogHeader className="px-0">
                            <DialogTitle asChild>
                                <div className="px-4 flex items-center gap-x-2">
                                    <div className="bg-blue-100 flex items-center justify-center w-8 h-8 rounded dark:bg-blue-900">
                                        {renderIcon(<Database />, 16, 'text-blue-600 dark:text-blue-200')}
                                    </div>
                                    <div className="text-md font-regular text-gray-900 dark:text-gray-50">
                                        New Database
                                    </div>
                                </div>
                            </DialogTitle>
                        </DialogHeader>
                        <DialogDescription asChild>
                            <div className="px-4 flex flex-col gap-y-4 h-[351px] overflow-y-auto">
                                <DatabaseFormBody
                                    isOpen={isOpen}
                                    isReadOnly={isReadOnly}
                                    selectedDatabase={selectedDatabase}
                                    isEdit={false}
                                    errors={errors}
                                    secrets={secrets}
                                    loadingSecrets={loadingSecrets}
                                    isSaving={isSaving}
                                    isValid={isValid}
                                    databaseType={databaseType}
                                    control={control}
                                    isModalRequest={true}
                                    setIsOpen={setIsOpen}
                                    register={register}
                                    setValue={setValue}
                                    watch={watch}
                                    refetch={onVaultRefetch}
                                    handleSubmit={handleSubmit}
                                    onHandleSubmit={onHandleSubmit}
                                />
                            </div>
                        </DialogDescription>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setIsOpen(false)}>
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
DatabaseSelector.displayName = 'Database Input';

export { DatabaseSelector };
