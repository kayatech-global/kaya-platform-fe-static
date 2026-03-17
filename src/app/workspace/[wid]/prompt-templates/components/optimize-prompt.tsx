import {
    Button,
    Label,
    MultiSelect,
    Spinner,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components';
import { useOptimizePrompt } from '@/hooks/use-optimize-prompt';
import { validateSpaces } from '@/lib/utils';
import { validateField } from '@/utils/validation';
import { MoveRight } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import MonacoEditor, { IntellisenseCategory } from './monaco-editor';
import { IPlatformSettingData } from '@/models';

export interface OptimizePromptProps {
    editorContent: string;
    intellisenseOptions: IntellisenseCategory[];
    loadingIntellisense: boolean;
    intelligentSource: IPlatformSettingData | undefined;
    setOpenModal: Dispatch<SetStateAction<boolean>>;
    onInsertClick: (value: string) => void;
    allIntellisenseValues: string[];
    onRefetchVariables: () => Promise<void>;
}

export const OptimizePrompt = (props: OptimizePromptProps) => {
    const [editorContent, setEditorContent] = useState('');
    const { intellisenseOptions, loadingIntellisense, intelligentSource, onRefetchVariables } = props;
    const {
        isLoading,
        promptFrameworks,
        errors,
        allIntellisenseValues,
        responseContent,
        control,
        isValidEnhance,
        isValid,
        register,
        setValue,
        setResponseContent,
        trigger,
        watch,
        handleSubmit,
        onHandleSubmit,
        onEnhanceClick,
    } = useOptimizePrompt(props);

    useEffect(() => {
        setValue('currentPrompt', props.editorContent);
    }, [props.editorContent, setValue]);

    useEffect(() => {
        const watchedPrompt = watch('currentPrompt');
        const initial = (watchedPrompt ?? '').replaceAll(/{{|}}/g, '');
        setEditorContent(initial);
    }, [watch]);

    const promptFrameworkOption = watch('promptFrameworkOption.value');
    const instructions = useMemo(() => {
        if (promptFrameworkOption && promptFrameworkOption !== '' && promptFrameworks) {
            return promptFrameworks?.find(x => x.type === promptFrameworkOption)?.instructions;
        }
        return null;
    }, [promptFrameworkOption, promptFrameworks]);

    const wrapMatchingWords = (value: string) => {
        let result = value;
        for (const word of [...allIntellisenseValues].sort((a, b) => b.length - a.length)) {
            const esc = word.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
            const re = new RegExp(String.raw`\b${esc}\b`, 'g');
            result = result.replaceAll(re, `{{${word}}}`);
        }
        return result;
    };

    const { onChange, name } = register('currentPrompt', {
        required: validateField('current prompt', { required: { value: true } }).required,
        validate: value => validateSpaces(value, 'current prompt'),
    });

    const handleEditorChange = (value: string) => {
        setEditorContent(value);
        const wrapped = wrapMatchingWords(value);
        onChange({ target: { value: wrapped, name } });
    };

    const handleEnhanceEditorChange = async (value: string) => {
        setResponseContent(value);
        const wrapped = wrapMatchingWords(value);
        setValue('enhancedPrompt', wrapped, { shouldTouch: true });
        await trigger('enhancedPrompt');
    };

    const isIntelligentSourceConfigured = intelligentSource && Object.keys(intelligentSource).length > 0;

    return (
        <>
            {loadingIntellisense ? (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-y-2">
                        <Spinner />
                        <p className="text-md text-gray-700 dark:text-gray-200">
                            Hold on, Enhance Prompt is getting ready...
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-4">
                    <div className="col-span-1 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col items-start gap-y-[6px] w-full">
                                <div className="flex flex-col items-start gap-y-[6px] w-full">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                        Choose a prompt framework
                                    </Label>
                                    <div className="relative flex items-center w-full">
                                        <Controller
                                            name="promptFrameworkOption"
                                            control={control}
                                            rules={{
                                                required: { value: true, message: 'Please select prompt framework' },
                                            }}
                                            render={({ field }) => (
                                                <MultiSelect
                                                    {...field}
                                                    options={promptFrameworks.map(x => ({
                                                        label: `${x.title} - ${x?.fields?.join(', ')}`.trimEnd(),
                                                        value: x.type,
                                                    }))}
                                                    isSearchable
                                                    isDestructive={!!errors?.promptFrameworkOption?.message}
                                                    defaultValue={field.value || null}
                                                    menuPortalTarget={document.body}
                                                    placeholder="Select your prompt framework"
                                                    onChange={selectedOptions => field.onChange(selectedOptions)}
                                                    menuClass="!z-50"
                                                    menuPortalClass="!z-50 pointer-events-auto"
                                                />
                                            )}
                                        />
                                    </div>
                                    {!!errors?.promptFrameworkOption?.message && (
                                        <p className="text-xs font-normal text-red-500 dark:text-red-500">
                                            {errors?.promptFrameworkOption?.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {instructions && (
                                <div className="flex flex-col items-start gap-y-[6px] w-full">
                                    <div className="flex flex-col items-start gap-y-[6px] w-full">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                            Description
                                        </Label>
                                        <div className="relative flex items-center w-full flex-col gap-y-1">
                                            <p className="w-full line-clamp-2">{instructions}</p>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button className="text-xs ml-auto underline text-blue-500 dark:text-blue-400">
                                                            Read More
                                                        </button>
                                                    </TooltipTrigger>
                                                    {!isValid && (
                                                        <TooltipContent
                                                            side="bottom"
                                                            align="center"
                                                            className="max-w-[300px]"
                                                        >
                                                            {instructions}
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-1 sm:col-span-2 pb-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <div className="mb-2 text-xs flex items-center gap-x-2">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                        Current Prompt
                                    </p>
                                </div>
                                <MonacoEditor
                                    value={editorContent}
                                    height="h-[300px]"
                                    isEnhance={true}
                                    onChange={handleEditorChange}
                                    intellisenseData={intellisenseOptions ?? []}
                                    isDestructive={!!errors?.currentPrompt?.message}
                                    onRefetchVariables={onRefetchVariables}
                                />
                                {errors?.currentPrompt?.message && (
                                    <span className="text-xs font-normal text-red-500 dark:text-red-500">
                                        {errors?.currentPrompt?.message}
                                    </span>
                                )}
                                <div className="mt-4">
                                    <Button
                                        size="sm"
                                        disabled={!isValidEnhance || isLoading || !isIntelligentSourceConfigured}
                                        onClick={onEnhanceClick}
                                    >
                                        <span>{isLoading ? 'Generating' : 'Enhance Prompt'}</span>
                                        <MoveRight />
                                    </Button>
                                </div>
                                {!isIntelligentSourceConfigured && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                                        Intelligent source not configured. Please configure in Settings.
                                    </p>
                                )}
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-2 ">
                                    Enhanced Prompt
                                </p>
                                <Controller
                                    name="enhancedPrompt"
                                    control={control}
                                    defaultValue={responseContent}
                                    rules={{
                                        required: validateField('enhanced prompt', { required: { value: true } })
                                            .required,
                                        validate: value => validateSpaces(value, 'enhanced prompt'),
                                    }}
                                    render={({ field }) => (
                                        <MonacoEditor
                                            {...field}
                                            value={responseContent}
                                            height="h-[300px]"
                                            isEnhance
                                            onChange={handleEnhanceEditorChange}
                                            intellisenseData={intellisenseOptions}
                                            isDestructive={!!errors.enhancedPrompt}
                                            onRefetchVariables={onRefetchVariables}
                                        />
                                    )}
                                />
                                {errors.enhancedPrompt && (
                                    <span className="text-xs text-red-500">{errors.enhancedPrompt.message}</span>
                                )}
                                <div className="mt-4">
                                    <Button
                                        size="sm"
                                        disabled={!isValid || isLoading}
                                        onClick={handleSubmit(onHandleSubmit)}
                                    >
                                        <span>Insert</span>
                                        <MoveRight />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OptimizePrompt;
