'use client';

import { Button, Input, Spinner, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn, getSubmitButtonLabel, validateSpaces } from '@/lib/utils';
import { IPlatformSettingData, IPromptTemplateForm } from '@/models';
import { validateField } from '@/utils/validation';
import { Unplug, SquareChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import {
    Control,
    Controller,
    FieldErrors,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormTrigger,
    UseFormWatch,
} from 'react-hook-form';
import MonacoEditor from './monaco-editor';
import OptimizePrompt from './optimize-prompt';

interface PromptTemplateFormProps {
    isOpen: boolean;
    isEdit: boolean;
    isValid: boolean;
    errors: FieldErrors<IPromptTemplateForm>;
    isSaving: boolean;
    rows?: number;
    isOpenModal: boolean;
    editorContent: string;
    intellisenseOptions: never[];
    loadingIntellisense: boolean;
    isEnhance?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<IPromptTemplateForm, any>;
    intelligentSource: IPlatformSettingData | undefined;
    isMaximize?: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IPromptTemplateForm>;
    trigger: UseFormTrigger<IPromptTemplateForm>;
    watch: UseFormWatch<IPromptTemplateForm>;
    setValue: UseFormSetValue<IPromptTemplateForm>;
    handleSubmit: UseFormHandleSubmit<IPromptTemplateForm>;
    onHandleSubmit: (data: IPromptTemplateForm) => void;
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
    handleEditorChange: (value: string) => void;
    onRefetchVariables: () => Promise<void>;
    allIntellisenseValues: string[];
}

export const FormBody = (props: PromptTemplateFormProps) => {
    const {
        register,
        trigger,
        watch,
        setOpenModal,
        rows,
        isEdit,
        isEnhance,
        loadingIntellisense,
        errors,
        editorContent,
        isOpenModal,
        intellisenseOptions,
        intelligentSource,
        isMaximize,
        handleEditorChange,
        control,
        setValue,
        allIntellisenseValues,
        onRefetchVariables,
    } = props;

    const watchedIsReadOnly = watch('isReadOnly');
    const isReadOnly = useMemo(() => {
        return !!watchedIsReadOnly;
    }, [watchedIsReadOnly]);

    const promptKeyFieldValidate = validateField('Prompt Key', {
        required: { value: true },
    });
    const descriptionFieldValidate = validateField('Description', {
        required: { value: true },
        minLength: { value: 5 },
    });

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                <div className="col-span-1 sm:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            {...register('promptKey', {
                                required: promptKeyFieldValidate.required,
                                validate: value => validateSpaces(value, 'prompt key'),
                            })}
                            placeholder="Enter your Prompt Key"
                            readOnly={isEdit && isReadOnly}
                            label="Prompt Key"
                            isDestructive={!!errors?.promptKey?.message}
                            supportiveText={errors?.promptKey?.message}
                        />
                        <Input
                            {...register('promptDescription', {
                                required: descriptionFieldValidate.required,
                                minLength: descriptionFieldValidate.minLength,
                                validate: value => validateSpaces(value, 'prompt description'),
                            })}
                            placeholder="Enter your Prompt Description"
                            readOnly={isEdit && isReadOnly}
                            label="Prompt Description"
                            isDestructive={!!errors?.promptDescription?.message}
                            supportiveText={errors?.promptDescription?.message}
                        />
                    </div>
                </div>
                <div
                    className={cn('col-span-1 sm:col-span-2', {
                        'h-[calc(100vh-280px)] flex flex-col': isMaximize,
                        'max-h-[60vh]': !isMaximize,
                    })}
                >
                    <div className="mb-2 text-xs flex items-center gap-x-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-100">Prompt</p>
                        <p className="text-gray-600">
                            (Type <span className="font-mono bg-gray-100 px-1 rounded">@</span> to trigger intellisense
                            with available options.)
                        </p>
                    </div>
                    {loadingIntellisense ? (
                        <div
                            className={cn('w-full flex items-center justify-center', {
                                'h-full min-h-[500px]': !isMaximize,
                                'min-h-[56vh]': isMaximize,
                            })}
                        >
                            <div className="flex flex-col items-center gap-y-2">
                                <Spinner />
                                <p className="text-md text-gray-700 font-normal dark:text-gray-200">
                                    {'Hold on, Prompt editor is getting ready...'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Controller
                                name="prompt"
                                control={control}
                                defaultValue={editorContent}
                                rules={{
                                    required: validateField('prompt', { required: { value: true } }).required,
                                    validate: value => validateSpaces(value, 'prompt'),
                                }}
                                render={({ field }) => (
                                    <MonacoEditor
                                        {...field}
                                        value={editorContent}
                                        isEnhance={isEnhance}
                                        hasEnhance={true}
                                        disableEnhance={!intelligentSource?.id || intelligentSource?.id?.trim() === ''}
                                        onChange={handleEditorChange}
                                        intellisenseData={intellisenseOptions ?? []}
                                        isDestructive={!!errors?.prompt?.message}
                                        onEnhanceClick={() => setOpenModal(true)}
                                        onRefetchVariables={onRefetchVariables}
                                        height={(() => {
                                            if (isMaximize) return 'flex-1';
                                            if (rows) return 'h-[240px]';
                                            return 'h-[375px]';
                                        })()}
                                        onBlur={() => trigger('prompt')}
                                    />
                                )}
                            />
                            {errors?.prompt?.message && (
                                <span className="text-xs font-normal text-red-500 dark:text-red-500">
                                    {errors?.prompt?.message}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>
            <Dialog open={isOpenModal} onOpenChange={setOpenModal}>
                <DialogContent
                    className="w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-[1280px]"
                    onInteractOutside={e => e.preventDefault()}
                >
                    <DialogHeader className="px-0">
                        <DialogTitle asChild>
                            <div className="px-4 flex gap-2">
                                <Unplug />
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">Optimize</p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription asChild>
                        <div className="px-4 flex flex-col gap-y-4 h-[500px] overflow-y-auto">
                            <OptimizePrompt
                                editorContent={watch('prompt')}
                                intellisenseOptions={intellisenseOptions}
                                loadingIntellisense={loadingIntellisense}
                                intelligentSource={intelligentSource}
                                setOpenModal={setOpenModal}
                                onInsertClick={value => setValue('prompt', value)}
                                allIntellisenseValues={allIntellisenseValues}
                                onRefetchVariables={onRefetchVariables}
                            />
                        </div>
                    </DialogDescription>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const PromptTemplateForm = (props: PromptTemplateFormProps) => {
    const { isOpen, setOpen, handleSubmit, onHandleSubmit, watch, isEdit, isValid, isSaving } = props;
    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet
            setOpen={setOpen}
            className="custom-drawer-content"
            dismissible={false}
            headerIcon={<SquareChevronRight />}
            header={isEdit ? 'Edit Prompt Template' : 'New Prompt Template'}
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
                    <div className="h-full drawer-overflow">
                        <FormBody {...props} />
                    </div>
                </div>
            }
        />
    );
};

export default PromptTemplateForm;
