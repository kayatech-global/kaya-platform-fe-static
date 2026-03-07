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
import { useReRankingModelConfiguration } from '@/hooks/use-re-ranking-model-configuration';
import { renderIcon } from '@/lib/utils';
import { FormBody as ReRankingFormBody } from '@/app/workspace/[wid]/intelligence-enhancers/re-ranking-models/components/form-body';
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
    loadingReRanking?: boolean;
    hasClear?: boolean;
    hookForm?: IHookForm;
    onClear?: () => void;
    onRefetch: (id?: unknown) => void;
}

const ReRankingSelector = React.forwardRef<HTMLSelectElement, InputProps>(
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
            loadingReRanking,
            hasClear = false,
            hookForm,
            onClear,
            onRefetch,
            ...props
        },
        ref
    ) => {
        const {
            providers,
            errors,
            isOpen,
            isValid,
            secrets,
            isSaving,
            loadingSecrets,
            control,
            register,
            watch,
            setValue,
            handleSubmit,
            onHandleSubmit,
            setOpen,
            handleCreate,
            refetch,
        } = useReRankingModelConfiguration({
            triggerQuery: false,
            onRefetch,
            hookForm,
        });

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
                                            disabled={disableCreate || loadingReRanking}
                                            loading={loadingReRanking}
                                            onClick={() => handleCreate()}
                                        >
                                            {loadingReRanking ? <></> : <CirclePlus size={16} />}
                                        </Button>
                                    </TooltipTrigger>
                                    {!disableCreate && !loadingReRanking && (
                                        <TooltipContent side="bottom" align="center">
                                            Add New Re-ranking Model
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
                                        {renderIcon(<Database />, 16, 'text-blue-600 dark:text-blue-200')}
                                    </div>
                                    <div className="text-md font-regular text-gray-900 dark:text-gray-50">
                                        New Re-ranking Model
                                    </div>
                                </div>
                            </DialogTitle>
                        </DialogHeader>
                        <DialogDescription asChild>
                            <div className="px-4 flex flex-col gap-y-4 h-[351px] overflow-y-auto">
                                <ReRankingFormBody
                                    isOpen={isOpen}
                                    isEdit={false}
                                    isValid={isValid}
                                    secrets={secrets}
                                    isSaving={isSaving}
                                    providers={providers}
                                    control={control}
                                    errors={errors}
                                    loadingSecrets={loadingSecrets}
                                    isModalRequest={true}
                                    setOpen={setOpen}
                                    register={register}
                                    watch={watch}
                                    setValue={setValue}
                                    handleSubmit={handleSubmit}
                                    onHandleSubmit={onHandleSubmit}
                                    refetch={refetch}
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
ReRankingSelector.displayName = 'Re-ranking Input';

export { ReRankingSelector };
