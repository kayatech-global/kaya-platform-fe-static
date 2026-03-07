/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/context/app-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/atoms/dialog';
import { Button, Label, Textarea, TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/atoms';
import FileUploader from '@/components/atoms/file-uploader';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn, isNullOrEmpty } from '@/lib/utils';
import { Controller, useForm } from 'react-hook-form';
import EditorInput from '@/components/molecules/editor-input/editor-input';
import { IConnectorGenerateQuery } from '@/models';
import { FetchError, logger } from '@/utils';
import { useParams } from 'next/navigation';
import { useMutation } from 'react-query';
import { toast } from 'sonner';
import { connectorService } from '@/services';

type GenerateQueryModalProps = {
    open: boolean;
    className?: string;
    title?: string;
    icon?: React.ReactNode;
    setShowGenerateModal: React.Dispatch<React.SetStateAction<boolean>>;
    onInsert: (query: string) => void;
    databaseId?: string;
};

export default function GenerateQueryModal({
    open,
    className,
    title = 'Generate Query',
    icon = <Sparkles className="text-blue-600" size={18} />,
    onInsert,
    setShowGenerateModal,
    databaseId,
}: Readonly<GenerateQueryModalProps>) {
    const { intelligentSource } = useApp();
    const params = useParams();

    const {
        register,
        watch,
        control,
        formState: { errors, isValid },
        setValue,
        reset,
        trigger,
        handleSubmit,
    } = useForm<IConnectorGenerateQuery>({
        mode: 'all',
        defaultValues: {
            schema: [],
            databaseSchema: '',
            userPrompt: '',
            generatedQuery: '',
            databaseId: '',
        },
    });

    useEffect(() => {
        if (!open) {
            reset({ generatedQuery: '', userPrompt: '', schema: [], databaseId: '' });
        } else if (databaseId) {
            setValue('databaseId', databaseId);
        }
    }, [open]);

    const parseSqlFile = async (files: File[]) => {
        if (files?.length > 0) {
            try {
                const file = files[0];
                const text = await file.text();

                setValue('databaseSchema', text);
            } catch (error: unknown) {
                console.error('SQL parsing error:', error);
            }
        } else {
            setValue('databaseSchema', '');
        }
    };

    const { isLoading: creating, mutate: mutateCreate } = useMutation(
        (data: IConnectorGenerateQuery) => connectorService.aiQuery(data, params.wid as string),
        {
            onSuccess: data => {
                setValue('generatedQuery', data?.generatedQuery);
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error while generating query:', error?.message);
            },
        }
    );

    // Generate button handler - Pass test SQL data
    const onHandleSubmit = (data: IConnectorGenerateQuery) => {
        const body: IConnectorGenerateQuery = {
            userPrompt: data.userPrompt,
            databaseSchema: data.databaseSchema,
            databaseId: data.databaseId,
        };
        mutateCreate(body);
    };

    // Insert button handler - Pass generated query to parent
    const handleInsert = () => {
        const generatedQuery = watch('generatedQuery');
        if (generatedQuery) {
            onInsert(generatedQuery);
            setShowGenerateModal(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setShowGenerateModal}>
            <DialogContent className={cn('max-w-4xl grid grid-cols-1 h-fit', className)}>
                <div className="grid grid-cols-1">
                    <DialogHeader>
                        <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                            <div className="grid place-items-center w-8 h-8 rounded bg-blue-100 dark:bg-blue-900">
                                {icon}
                            </div>
                            <DialogTitle>{title}</DialogTitle>
                        </div>
                    </DialogHeader>

                    <DialogBody className="space-y-4 pb-4 pt-4 max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700">
                        {/* Upload Schema */}
                        <div>
                            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                                Upload Schema
                            </Label>
                            <Controller
                                name="schema"
                                control={control}
                                rules={{
                                    required: { value: true, message: 'Please upload a schema file' },
                                }}
                                render={({ field }) => (
                                    <FileUploader
                                        placeholder="JSON or YAML files"
                                        hideInbuiltUploadHandler
                                        supportMultiUpload={false}
                                        accept={[
                                            'application/json',
                                            'application/yaml',
                                            'application/x-yaml',
                                            'text/yaml',
                                            '.json',
                                            '.yaml',
                                            '.yml',
                                        ]}
                                        value={field.value}
                                        onChange={async value => {
                                            field.onChange(value);
                                            await trigger('schema');
                                            await parseSqlFile(value);
                                        }}
                                        onFileClick={async () => await trigger('schema')}
                                        onClear={() => {
                                            setValue('schema', []);
                                            setValue('databaseSchema', '');
                                        }}
                                        hasError={!!errors?.schema?.message}
                                    />
                                )}
                            />
                            {!!errors?.schema?.message && (
                                <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                    {errors?.schema?.message}
                                </p>
                            )}
                        </div>

                        {/* Natural Language Query and Generated Query - Side by Side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Natural Language Query */}
                            <div className="grid grid-cols-1">
                                <Textarea
                                    {...register('userPrompt', {
                                        required: {
                                            value: true,
                                            message: 'Please describe your query in natural language',
                                        },
                                    })}
                                    label="Natural Language Query"
                                    placeholder="Describe your query in natural language..."
                                    rows={8}
                                    isDestructive={!!errors?.userPrompt?.message}
                                    supportiveText={errors?.userPrompt?.message}
                                />
                                {/* Generate Button - Left side below Natural Language Query */}
                                <div className="mt-3">
                                    {intelligentSource ? (
                                        <Button
                                            type="button"
                                            size="sm"
                                            leadingIcon={<Sparkles className="w-4 h-4" />}
                                            onClick={handleSubmit(onHandleSubmit)}
                                            disabled={!isValid || creating}
                                        >
                                            {creating ? 'Generating' : 'Generate'}
                                        </Button>
                                    ) : (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        leadingIcon={<Sparkles className="w-4 h-4" />}
                                                        disabled
                                                    >
                                                        Generate
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="right" align="center">
                                                    To use this feature, please configure a global Intelligent Model
                                                    under Settings → Workspace Intelligence Source.
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                            </div>

                            {/* Generated Query */}
                            <div className="grid grid-cols-1">
                                <Controller
                                    name="generatedQuery"
                                    control={control}
                                    render={({ field }) => (
                                        <EditorInput
                                            label="Generated Query"
                                            value={field.value}
                                            language="sql"
                                            readOnly
                                            autoFormat={false}
                                            onChange={field.onChange}
                                            height="180px"
                                        />
                                    )}
                                />
                                {/* Insert Button - Right side below Generated Query */}
                                <div className="mt-3 grid justify-items-end">
                                    <Button
                                        type="button"
                                        size="sm"
                                        trailingIcon={<ArrowRight className="w-4 h-4" />}
                                        onClick={handleInsert}
                                        disabled={isNullOrEmpty(watch('generatedQuery'))}
                                    >
                                        Insert
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DialogBody>

                    <DialogFooter className="flex justify-end">
                        <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
