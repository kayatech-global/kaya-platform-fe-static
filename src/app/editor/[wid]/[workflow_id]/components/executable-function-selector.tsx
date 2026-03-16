'use client';
import { FormBody as ExecutableFunctionFormBody } from '@/app/workspace/[wid]/executable-functions/components/executable-function-config-form';
import { Button } from '@/components';
import { DetailItemInput, valuesProps } from '@/components/molecules/detail-item-input/detail-item-input';
import { AgentType, ExecutableFunction } from '@/components/organisms';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import { IExecutableFunctionTool } from '@/models';
import React from 'react';
import { useExecutableFunction } from '@/hooks/use-executable-function';
import { ExecutableFunctionSelectorFooter } from '@/app/editor/[wid]/[workflow_id]/components/executable-function-selector-footer';
import { useExecutableFunctionSelection } from './executable-function-selector/use-executable-function-selection';
import { ExecutableFunctionList } from './executable-function-selector/executable-function-list';
import { ExecutableFunctionDialog } from './executable-function-selector/executable-function-dialog';
import { UseFormSetValue } from 'react-hook-form';
import { IExecutableFunctionForm } from '@/models/executable-function.model';

/**
 * Props for the ExecutableFunctionSelector component
 */
export interface ExecutableFunctionSelector {
    agent: AgentType | VoiceAgent | undefined;
    functions: ExecutableFunction[] | undefined;
    isReadonly?: boolean;
    functionLoading?: boolean;
    setFunctions: React.Dispatch<React.SetStateAction<ExecutableFunction[] | undefined>>;
    allExecutableFunctions: IExecutableFunctionTool[];
    onRefetch: () => void;
    onExecutableFunctionChange?: (executableFunctions: ExecutableFunction[] | undefined) => void;
    label?: string;
    labelClassName?: string;
    isMultiple?: boolean;
    description?: string;
    isSelfLearning?: boolean;
    showListOnly?: boolean;
    setInputDataConnectModalOpen?: (open: boolean) => void;
}

type ConfigItem = { name: string; value: string; dataType: string };

type PayloadValueObject = { description?: string; type?: string };
type PayloadValue = PayloadValueObject | string | undefined;

const parsePayload = (payload: unknown): ConfigItem[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload as ConfigItem[];

    try {
        const parsed: Record<string, unknown> =
            typeof payload === 'string' ? JSON.parse(payload) : (payload as Record<string, unknown>);
        return Object.entries(parsed).map(([key, value]) => {
            const valueObj = value as PayloadValue;

            const isValueObject = (val: PayloadValue): val is PayloadValueObject => {
                return typeof val === 'object' && val !== null && !Array.isArray(val);
            };

            const getValue = (val: PayloadValue): string => {
                if (isValueObject(val) && val?.description) {
                    return val.description;
                }
                if (typeof val === 'string') {
                    return val;
                }
                return '';
            };

            return {
                name: key,
                value: getValue(valueObj),
                dataType: isValueObject(valueObj) && valueObj?.type ? valueObj.type : 'string',
            };
        });
    } catch {
        return [];
    }
};

const parseDependencies = (dependencies: unknown): ConfigItem[] => {
    if (!dependencies) return [];
    if (Array.isArray(dependencies)) return dependencies as ConfigItem[];

    return Object.entries(dependencies as Record<string, unknown>).map(([name, value]) => ({
        name,
        value: typeof value === 'string' ? value : '',
        dataType: '',
    }));
};

const parseEnvironmentVariables = (env: unknown): ConfigItem[] => {
    if (!env) return [];
    if (Array.isArray(env)) return env as ConfigItem[];

    return Object.entries(env as Record<string, unknown>).map(([name, value]) => ({
        name,
        value: typeof value === 'string' ? value : '',
        dataType: '',
    }));
};

// Helper to populate form data for editing
const populateFormData = (
    id: string,
    allExecutableFunctions: IExecutableFunctionTool[],
    setValue: UseFormSetValue<IExecutableFunctionForm>,
    setEdit: (edit: boolean) => void,
    setOpen: (open: boolean) => void
) => {
    const obj = allExecutableFunctions.find(x => x.id === id);
    if (obj) {
        const configWithExtras = obj.configurations as typeof obj.configurations & {
            dependencies?: ConfigItem[] | Record<string, string>;
            environment?: ConfigItem[] | Record<string, string>;
            environmentVariables?: ConfigItem[] | Record<string, string>;
            url?: string;
        };

        const payload = parsePayload(obj.configurations?.payload);
        const dependencies = parseDependencies(configWithExtras?.dependencies);
        const environmentVariables = parseEnvironmentVariables(
            configWithExtras?.environment || configWithExtras?.environmentVariables
        );

        setValue('id', obj.id);
        setValue('name', obj.name);
        setValue('description', obj.description ?? '');
        setValue('provider', obj.configurations?.provider ?? '');
        setValue('language', obj.configurations?.language ?? 'python');
        setValue('code', obj.configurations?.code ?? '');
        setValue('startupOption', obj.configurations?.startupOption ?? 'on-demand');
        setValue(
            'credentials',
            obj.configurations?.credentials ?? {
                authType: 'managed-access',
                meta: {
                    secretKey: '',
                    accessKey: '',
                    lambdaExecutionRoleArn: '',
                },
            }
        );
        setValue('isReadOnly', obj.isReadOnly ?? obj.configurations?.isReadOnly);
        setValue('region', obj.configurations?.region);
        setValue('deployedUrl', configWithExtras?.url ?? '');
        setValue('payload', payload);
        setValue('dependencies', dependencies);
        setValue('environmentVariables', environmentVariables);
    }
    setEdit(true);
    setOpen(true);
};

export const ExecutableFunctionSelector = ({
    functions,
    isReadonly,
    functionLoading,
    setFunctions,
    agent,
    allExecutableFunctions,

    onExecutableFunctionChange,
    label,
    labelClassName,
    isMultiple = true,
    description,
    isSelfLearning,
    showListOnly = false,
    setInputDataConnectModalOpen,
}: ExecutableFunctionSelector) => {
    // Hooks
    const {
        isOpen, // configuration form open state
        isValid,
        isDeploying,
        isEdit,
        setOpen,
        setEdit,
        handleSubmit,
        onHandleSubmit,
        register,
        watch,
        setValue,
        control,
        errors,
        secrets,
        loadingSecrets,
        refetch,
        payload,
        appendPayload,
        removePayload,
        dependencies,
        appendDependency,
        removeDependency,
        environmentVariables,
        appendEnvironmentVariable,
        removeEnvironmentVariable,
    } = useExecutableFunction();

    const {
        allSearchableExecutableFunction,
        checkedItemId,
        handleItemCheck,
        handleApplyChanges,
        handleRemoveAll,
        hasAnyChanges,
        selectedFunctions,
        onModalClose,
        setSearchTerm,
        searchTerm,
        openModal,
        setOpenModal,
        setIsReordered,
    } = useExecutableFunctionSelection({
        functions,
        allExecutableFunctions,
        isMultiple,
        setFunctions,
        onExecutableFunctionChange,
        showListOnly,
        setInputDataConnectModalOpen,
        isOpen,
        setIsOpen: setOpen,
    });

    const getModelFromReusableAgent = () => {
        if (!agent && !functions) {
            return undefined;
        }

        let value: valuesProps[] = [];

        if (agent && 'isReusableAgentSelected' in agent && agent?.isReusableAgentSelected) {
            let functionListFromReusableAgent = agent.executableFunctions?.map(func => {
                return {
                    title: func.name,
                    description: `${func.description?.slice(0, 65)}...`,
                    imagePath: '/png/api.png',
                };
            });
            if (isSelfLearning) {
                functionListFromReusableAgent = allExecutableFunctions
                    ?.filter(x => agent?.selfLearning?.feedbackRequestIntegration?.id == x.id)
                    .map(func => {
                        return {
                            title: func.name,
                            description: `${func.description?.slice(0, 65)}...`,
                            imagePath: '/png/api.png',
                        };
                    });
            }
            value = [...(functionListFromReusableAgent ?? [])];
        } else if (functions) {
            const selectedAPIs = functions?.map(func => {
                return {
                    title: func.name,
                    description: `${func.description?.slice(0, 65)}...`,
                    imagePath: '/png/api.png',
                };
            });

            value = [...selectedAPIs];
        }

        return value.length > 0 ? value : undefined;
    };

    const handleChange = () => {
        setOpenModal(true);
        if (!agent?.isReusableAgentSelected && functions) {
            // Force re-sync if needed, logic handled in hook generally
            setIsReordered(false);
        }
    };

    const handleEdit = (id: string) => {
        populateFormData(id, allExecutableFunctions, setValue, setEdit, setOpen);
    };

    const formProps = {
        isValid,
        errors,
        secrets,
        isDeploying,
        loadingSecrets,
        // setOpen is passed via setOpenForm in Dialog or direct prop in FormBody
        register,
        watch,
        setValue,
        handleSubmit,
        onHandleSubmit, // FormBody expects this
        control,
        refetch,
        payload,
        appendPayload,
        removePayload,
        dependencies,
        appendDependency,
        removeDependency,
        environmentVariables,
        appendEnvironmentVariable,
        removeEnvironmentVariable,
    };

    const handleFormSubmitWrapped = () => {
        handleSubmit(onHandleSubmit)().catch(() => {
            // Handle error or ignore
        });
    };

    if (showListOnly) {
        return (
            <div className="px-1 flex flex-col gap-y-4 w-full h-full">
                {isOpen ? (
                    <div className="item-list-container overflow-y-auto flex flex-col gap-y-2 h-[600px] border dark:border-gray-600 px-3 py-3 rounded-lg [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 pr-1">
                        <ExecutableFunctionFormBody isOpen={isOpen} isEdit={isEdit} setOpen={setOpen} {...formProps} />
                    </div>
                ) : (
                    <ExecutableFunctionList
                        isLoading={functionLoading}
                        searchTerm={searchTerm}
                        onSearchChange={e => setSearchTerm(e.target.value)}
                        currentFunctions={allSearchableExecutableFunction}
                        checkedItemIds={checkedItemId}
                        onItemCheck={handleItemCheck}
                        onEdit={handleEdit}
                        selectedFunctions={selectedFunctions}
                        showSelectedSection={true}
                        showAddNewButton={!isOpen}
                        onAddNewClicked={() => setOpen(true)}
                        isReadonly={isReadonly}
                        functions={functions}
                    />
                )}

                <div className="h-fit flex justify-end gap-x-2 mr-4">
                    <ExecutableFunctionSelectorFooter
                        isOpen={isOpen}
                        isValid={isValid}
                        isDeploying={isDeploying}
                        isEdit={isEdit}
                        onHandleSubmit={handleFormSubmitWrapped}
                        onAddClick={handleApplyChanges}
                        onModalClose={(o, c) => onModalClose(o, c)}
                        hasAnyChanges={hasAnyChanges}
                    />
                </div>
            </div>
        );
    }

    return (
        <>
            <DetailItemInput
                label={label ?? 'Functions'}
                labelClassName={labelClassName}
                values={getModelFromReusableAgent()}
                imagePath="/png/api_empty.png"
                imageType="png"
                description={description ?? 'Select the Functions for efficient agent performance and task handling'}
                footer={
                    functions?.length && !agent?.isReusableAgentSelected ? (
                        <div className=" w-full flex justify-start items-center gap-x-3">
                            <Button variant="link" className="text-blue-400" onClick={handleChange}>
                                Change
                            </Button>
                            <Button
                                variant="link"
                                className="text-red-500 hover:text-red-400"
                                onClick={handleRemoveAll}
                            >
                                {isMultiple ? 'Remove all' : 'Remove'}
                            </Button>
                        </div>
                    ) : (
                        <>
                            {(!functions || functions.length === 0) &&
                                !agent?.isReusableAgentSelected &&
                                !isReadonly && (
                                    <Button variant="link" onClick={() => setOpenModal(true)}>
                                        {isMultiple ? 'Add Functions' : 'Add Function'}
                                    </Button>
                                )}
                        </>
                    )
                }
            />
            <ExecutableFunctionDialog
                open={openModal}
                onOpenChange={open => onModalClose(open, false)}
                isEdit={isEdit}
                setOpenForm={setOpen}
                isFormOpen={isOpen}
                isReadonly={isReadonly}
                formProps={formProps}
                listProps={{
                    isLoading: functionLoading,
                    searchTerm: searchTerm,
                    onSearchChange: e => setSearchTerm(e.target.value),
                    currentFunctions: allSearchableExecutableFunction,
                    checkedItemIds: checkedItemId,
                    onItemCheck: handleItemCheck,
                    onEdit: handleEdit,
                    selectedFunctions: [], // Not used in modal as we don't separate sections
                    showSelectedSection: false,
                    functions: functions,
                }}
                footerProps={{
                    isOpen: isOpen,
                    isValid: isValid,
                    isDeploying: isDeploying,
                    isEdit: isEdit,
                    onHandleSubmit: handleFormSubmitWrapped,
                    onAddClick: handleApplyChanges,
                    onModalClose: (o, c) => onModalClose(o, c),
                    hasAnyChanges: hasAnyChanges,
                }}
            />
        </>
    );
};
