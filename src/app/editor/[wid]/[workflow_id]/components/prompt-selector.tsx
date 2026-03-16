'use client';
import { FormBody as PromptTemplateFormBody } from '@/app/workspace/[wid]/prompt-templates/components/prompt-templates-form';
import { Button, Input, SelectableRadioItem } from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { DetailItemInput, valuesProps } from '@/components/molecules/detail-item-input/detail-item-input';
import { AgentType, Prompt } from '@/components/organisms';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import { SelectableType } from '@/enums';
import { usePromptTemplate } from '@/hooks/use-prompt-template';
import { cn } from '@/lib/utils';
import { FileX, LoaderCircle, Maximize, Minimize, Unplug } from 'lucide-react';
import React, { useEffect, useImperativeHandle, useState } from 'react';

export interface PromptSelectorRef {
    refetchVariables: () => Promise<void>;
}

interface PromptSelectorProps {
    agent: AgentType | VoiceAgent | undefined;
    prompt: Prompt | undefined;
    isReadonly?: boolean;
    promptsLoading?: boolean;
    setPrompt: React.Dispatch<React.SetStateAction<Prompt | undefined>>;
    allPrompts: {
        id: string;
        name: string;
        description: string;
        isReadOnly?: boolean;
        configurations: { prompt_template: string };
    }[];
    onRefetch: () => void;
    onPromptChange?: (prompt: Prompt | undefined) => void;
    intellisenseOptions?: { label: string; value: string }[];
    loadingIntellisense?: boolean;
    label?: string;
    labelClassName?: string;
    description?: string;
    onModalChange?: (open: boolean) => void;
    hideDescription?: boolean;
}

const ResizeIcon = ({
    isMaximize,
    setIsMaximize,
}: {
    isMaximize: boolean;
    setIsMaximize: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const className = 'h-4 w-4';
    if (isMaximize) {
        return <Minimize className={className} onClick={() => setIsMaximize(false)} />;
    }

    return <Maximize className={className} onClick={() => setIsMaximize(true)} />;
};

export const PromptSelector = React.forwardRef<PromptSelectorRef, PromptSelectorProps>(
    (
        {
            agent,
            prompt,
            isReadonly,
            setPrompt,
            allPrompts,
            promptsLoading,
            label,
            labelClassName,
            description,
            onRefetch,
            onPromptChange,
            onModalChange,
            hideDescription = false,
            intellisenseOptions: intellisenseOptionsProps,
            loadingIntellisense: loadingIntellisenseProps,
        }: PromptSelectorProps,
        ref
    ) => {
        const [allSearchablePrompts, setAllSearchablePrompts] =
            useState<{ id: string; name: string; description: string; configurations: { prompt_template: string } }[]>(
                allPrompts
            );
        const [isEdit, setEdit] = useState<boolean>(false);
        const [checkedItemId, setCheckedItemId] = useState<string | undefined>(undefined);
        const [openNewModal, setOpenNewModal] = useState(false);
        const [searchTerm, setSearchTerm] = useState('');
        const [isMaximize, setIsMaximize] = useState<boolean>(false);
        const {
            isOpen,
            isOpenModal,
            isValid,
            errors,
            isSaving,
            editorContent,
            control,
            intelligentSource,
            intellisenseOptions,
            loadingIntellisense,
            setOpen,
            register,
            trigger,
            setValue,
            watch,
            handleSubmit,
            onHandleSubmit,
            setOpenModal,
            handleEditorChange,
            refetchVariables,
            allIntellisenseValues,
        } = usePromptTemplate({ triggerQuery: false, onRefetch });

        console.log(intellisenseOptionsProps, loadingIntellisenseProps);

        useEffect(() => {
            if (searchTerm === '') {
                setAllSearchablePrompts(allPrompts);
            } else {
                const filteredPrompts = allPrompts.filter(prompt => prompt.name.toLowerCase().includes(searchTerm));
                setAllSearchablePrompts(filteredPrompts);
            }
        }, [searchTerm]);

        useEffect(() => {
            if (onModalChange) {
                onModalChange(openNewModal);
            }
        }, [openNewModal]);

        useEffect(() => {
            if (!isOpen || !openNewModal) {
                setEdit(false);
                setSearchTerm('');
                setIsMaximize(false);
            }
        }, [isOpen, openNewModal]);

        useEffect(() => {
            if (openNewModal && prompt) {
                setCheckedItemId(prompt?.id);
            } else {
                setCheckedItemId(undefined);
            }
        }, [openNewModal, prompt]);

        useEffect(() => {
            setAllSearchablePrompts(allPrompts);
        }, [allPrompts, allPrompts?.length]);

        useImperativeHandle(ref, () => ({
            refetchVariables: async () => {
                await refetchVariables();
            },
        }));

        const handleClick = () => {
            const selectedPrompt = allPrompts?.find(p => p.id === checkedItemId);
            setPrompt(selectedPrompt);
            setOpenNewModal(false);
            setAllSearchablePrompts(allPrompts);
            if (onPromptChange) {
                onPromptChange(selectedPrompt);
            }
        };

        const handleRemove = () => {
            setPrompt(undefined);
            setCheckedItemId(undefined);
            if (onPromptChange) {
                onPromptChange(undefined);
            }
            if (onModalChange) {
                onModalChange(openNewModal);
            }
        };

        const getPromptFromReusableAgent = () => {
            if (!agent && !prompt) {
                return undefined; // Return undefined if both agent and prompt are missing
            }

            const value: valuesProps[] = []; // Initialize as an empty array

            if (agent && 'isReusableAgentSelected' in agent && agent?.isReusableAgentSelected) {
                value.push({
                    title: agent.prompt.name,
                    description: `${agent.prompt.description?.slice(0, 65)}...`,
                    imagePath: '/png/prompt_image.png',
                });
            } else if (prompt) {
                value.push({
                    title: prompt.name,
                    description: `${prompt.description?.slice(0, 65)}...`,
                    imagePath: '/png/prompt_image.png',
                });
            }

            return value.length > 0 ? value : undefined;
        };

        const handleChange = () => {
            setOpenNewModal(true);

            if (!agent?.isReusableAgentSelected && prompt) {
                const promptId = prompt.id;
                setCheckedItemId(promptId);

                setAllSearchablePrompts(prevTools => {
                    const selected = prevTools.filter(tool => tool.id === promptId);
                    const unselected = prevTools.filter(tool => tool.id !== promptId);

                    return [...selected, ...unselected];
                });
            }
        };

        const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
            const searchTerm = e.target.value.toLowerCase();
            setSearchTerm(searchTerm);
        };

        const onModalClose = (open: boolean, cancel?: boolean) => {
            if (isOpen) {
                setOpen(false);
            } else if (cancel) {
                setOpenNewModal(false);
                setAllSearchablePrompts(allPrompts);
            } else {
                setOpenNewModal(open);
            }
            setIsMaximize(false);
        };

        const onEdit = (id: string) => {
            const obj = allPrompts.find(x => x.id === id);
            if (obj) {
                setValue('id', obj.id);
                setValue('prompt', obj.configurations?.prompt_template);
                setValue('promptDescription', obj.description);
                setValue('promptKey', obj.name);
                setValue('isReadOnly', obj?.isReadOnly);
            }
            setEdit(true);
            setOpen(true);
        };

        return (
            <>
                <DetailItemInput
                    label={label ?? 'Prompt Instruction'}
                    labelClassName={labelClassName}
                    values={getPromptFromReusableAgent()}
                    imagePath="/png/empty_selection.png"
                    imageType="png"
                    description={
                        description ??
                        "No prompt has been added. Please use 'Add Prompt' to provide instructions for the agent."
                    }
                    hideDescription={hideDescription}
                    footer={
                        prompt && !agent?.isReusableAgentSelected ? (
                            <div className=" w-full flex justify-start items-center gap-x-3">
                                <Button variant="link" className="text-blue-400" onClick={handleChange}>
                                    Change
                                </Button>
                                <Button
                                    variant="link"
                                    className="text-red-500 hover:text-red-400"
                                    onClick={handleRemove}
                                >
                                    Remove
                                </Button>
                            </div>
                        ) : (
                            <>
                                {!prompt && !agent && (
                                    <Button variant="link" onClick={() => setOpenNewModal(true)}>
                                        Add Prompt
                                    </Button>
                                )}
                            </>
                        )
                    }
                />
                <Dialog open={openNewModal} onOpenChange={onModalClose}>
                    <DialogContent
                        className={cn('max-w-[unset]', {
                            'w-[580px]': !isMaximize,
                            'w-screen h-screen': isMaximize,
                        })}
                        rightIcon={isOpen && <ResizeIcon isMaximize={isMaximize} setIsMaximize={setIsMaximize} />}
                    >
                        <DialogHeader
                            className={cn('px-0', {
                                'h-[76px]': isMaximize,
                            })}
                        >
                            <DialogTitle asChild>
                                <div className="px-4 flex gap-2">
                                    {isOpen && <Unplug />}
                                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                        {(() => {
                                            if (!isOpen) return 'Prompts';
                                            return isEdit ? 'Edit Prompt Template' : 'New Prompt Template';
                                        })()}
                                    </p>
                                </div>
                            </DialogTitle>
                        </DialogHeader>
                        <DialogDescription asChild>
                            <div
                                className={cn('px-4 flex flex-col gap-y-4', {
                                    'h-[351px]': !isMaximize,
                                    'h-[calc(100vh-200px)]': isMaximize,
                                })}
                            >
                                {!isOpen && (
                                    <div className="flex justify-end">
                                        <Button variant="link" disabled={isReadonly} onClick={() => setOpen(true)}>
                                            New Prompt Template
                                        </Button>
                                    </div>
                                )}
                                {isOpen ? (
                                    <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                                        <PromptTemplateFormBody
                                            isOpen={isOpen}
                                            isEdit={isEdit}
                                            isValid={isValid}
                                            errors={errors}
                                            isSaving={isSaving}
                                            isOpenModal={isOpenModal}
                                            editorContent={editorContent}
                                            isEnhance={true}
                                            intellisenseOptions={intellisenseOptions}
                                            loadingIntellisense={loadingIntellisense}
                                            control={control}
                                            intelligentSource={intelligentSource}
                                            rows={10}
                                            isMaximize={isMaximize}
                                            setOpen={setOpen}
                                            register={register}
                                            trigger={trigger}
                                            watch={watch}
                                            handleSubmit={handleSubmit}
                                            onHandleSubmit={onHandleSubmit}
                                            setOpenModal={setOpenModal}
                                            setValue={setValue}
                                            handleEditorChange={handleEditorChange}
                                            allIntellisenseValues={allIntellisenseValues}
                                            onRefetchVariables={async () => {
                                                await refetchVariables();
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        {promptsLoading ? (
                                            <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-full">
                                                <LoaderCircle
                                                    className="animate-spin"
                                                    size={25}
                                                    width={25}
                                                    height={25}
                                                    absoluteStrokeWidth={undefined}
                                                />
                                                <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                                    Please wait! loading the prompts data for you...
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <Input
                                                    className="w-full"
                                                    placeholder="Search prompts"
                                                    onChange={handleSearch}
                                                />
                                                {allSearchablePrompts?.length > 0 ? (
                                                    <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                                                        {allSearchablePrompts
                                                            .toSorted((a, b) => {
                                                                if (a.id === checkedItemId) return -1;
                                                                if (b.id === checkedItemId) return 1;
                                                                return 0;
                                                            })
                                                            .map(prompt => {
                                                                return (
                                                                    <SelectableRadioItem
                                                                        key={prompt.id}
                                                                        id={prompt.id}
                                                                        title="Prompt"
                                                                        type={SelectableType.PROMPT}
                                                                        label={prompt.name}
                                                                        description={prompt.description}
                                                                        isChecked={checkedItemId === prompt.id}
                                                                        imagePath="/png/prompt_image.png"
                                                                        expandDetails={
                                                                            prompt.configurations.prompt_template
                                                                                ? prompt.configurations.prompt_template
                                                                                : ''
                                                                        }
                                                                        expandTriggerName="Show Prompt"
                                                                        handleClick={() => setCheckedItemId(prompt.id)}
                                                                        onEdit={onEdit}
                                                                    />
                                                                );
                                                            })}
                                                    </div>
                                                ) : (
                                                    <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-full">
                                                        <FileX className="text-gray-500 dark:text-gray-300" />
                                                        <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                                            {searchTerm === '' ? (
                                                                <>
                                                                    No Prompts have been
                                                                    <br /> configured
                                                                </>
                                                            ) : (
                                                                <>No results found</>
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </DialogDescription>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => onModalClose(false, true)}>
                                Cancel
                            </Button>
                            {isOpen ? (
                                <Button
                                    variant="primary"
                                    disabled={!isValid || isSaving}
                                    onClick={handleSubmit(onHandleSubmit)}
                                >
                                    {isEdit ? 'Update' : 'Create'}
                                </Button>
                            ) : (
                                <Button disabled={checkedItemId === undefined} variant="primary" onClick={handleClick}>
                                    Add prompt
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        );
    }
);

PromptSelector.displayName = 'PromptSelector';
