import { APISelector } from '@/app/editor/[wid]/[workflow_id]/components/api-selector';
import {
    GraphRagConfigSelector,
    GraphRagSelectorRef,
} from '@/app/editor/[wid]/[workflow_id]/components/graph-rag-selector';
import { HumanInput } from '@/app/editor/[wid]/[workflow_id]/components/human-input';
import { LanguageSelector } from '@/app/editor/[wid]/[workflow_id]/components/language-selector';
import { MCPSelector } from '@/app/editor/[wid]/[workflow_id]/components/mcp-selector';
import { PromptSelector, PromptSelectorRef } from '@/app/editor/[wid]/[workflow_id]/components/prompt-selector';
import {
    VectorRagSelector,
    VectorRagSelectorRef,
} from '@/app/editor/[wid]/[workflow_id]/components/vector-rag-selector';
import SelfLearning from '@/app/editor/[wid]/[workflow_id]/components/self-learning';
import { Button, Input, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import {
    AgentType,
    API,
    ExecutableFunction,
    IntelligenceSourceModel,
    McpToolResponseType,
    Prompt,
} from '@/components/organisms';
import { IMCPBody } from '@/hooks/use-mcp-configuration';
import { cn, getSubmitButtonLabel, validateSpaces } from '@/lib/utils';
import {
    IAgentForm,
    IAuthorization,
    IHeaderValues,
    IGraphRag,
    INodeHumanInput,
    IVectorRag,
    ISelfLearning,
    RequestToolType,
    IConnectorForm,
    Tool,
    IMessageBroker,
    IMessagePublisher,
    IGuardrailSetup,
    IExecutableFunctionCredential,
} from '@/models';
import { Boxes, Bot } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Control,
    Controller,
    FieldErrors,
    UseFormGetValues,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormReset,
    UseFormSetValue,
    UseFormTrigger,
    UseFormWatch,
} from 'react-hook-form';
import MessagePublisher from '@/app/editor/[wid]/[workflow_id]/components/end-node/message-publisher';
import { GuardrailSelector } from '@/app/editor/[wid]/[workflow_id]/components/guardrail-selector';
import { GuardrailBindingLevelType } from '@/enums';
import { ConnectorSelector } from '@/app/editor/[wid]/[workflow_id]/components/connector-selector';
import { ExecutableFunctionSelector } from '@/app/editor/[wid]/[workflow_id]/components/executable-function-selector';
import { useSyncPrompt } from '@/hooks/use-common';

interface AgentProps {
    isOpen: boolean;
    isValid: boolean;
    isSaving: boolean;
    isEdit: boolean;
    errors: FieldErrors<IAgentForm>;
    isLoadingResources: boolean;
    allPrompts: PromptResponse[] | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allModels: any;
    allApiTools: ApiToolResponseType[] | undefined;
    allExecutableFunctions: ExecutableFunctionResponseType[] | undefined;
    allMcpTools: IMCPBody[] | undefined;
    allConnectors: IConnectorForm[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allSLMModels: any;
    allGraphRag: IGraphRag[] | undefined;
    allVectorRags: IVectorRag[] | undefined;
    promptsLoading?: boolean;
    llmModelsLoading?: boolean;
    slmModelsLoading?: boolean;
    connectorsLoading?: boolean;
    apiLoading?: boolean;
    executableFunctionLoading?: boolean;
    mcpLoading: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<IAgentForm, any>;
    messageBrokers: IMessageBroker[] | undefined;
    guardrailData: IGuardrailSetup[] | undefined;
    guardrailLoading: boolean;
    trigger: UseFormTrigger<IAgentForm>;
    setValue: UseFormSetValue<IAgentForm>;
    getValues: UseFormGetValues<IAgentForm>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    register: UseFormRegister<IAgentForm>;
    handleSubmit: UseFormHandleSubmit<IAgentForm>;
    onHandleSubmit: (data: IAgentForm) => void;
    watch: UseFormWatch<IAgentForm>;
    reset: UseFormReset<IAgentForm>;
    onRefetchPrompts: () => void;
    onRefetchLlms: () => void;
    onRefetchApiTools: () => void;
    onRefetchExecutableFunctions: () => void;
    onRefetchSLMModel: () => void;
    onRefetchConnector: () => void;
    onRefetchMcp: () => void;
    refetchGraphRag: () => Promise<void>;
    refetchVectorRag: () => Promise<void>;
    refetchMessageBroker: () => Promise<void>;
    refetchGuardrails: () => void;
}

export type PromptResponse = {
    id: string;
    name: string;
    description: string;
    configurations: { prompt_template: string };
};

export type ApiToolResponseType = {
    id: string;
    toolId: string;
    name: string;
    description: string;
    isReadOnly?: boolean;
    configurations: {
        url: string;
        method: string;
        headers: IHeaderValues[];
        payload: string;
        authorization: IAuthorization;
        promotedVariables: string;
        defaultApiParameters: string;
    };
};

export type ExecutableFunctionResponseType = {
    id: string;
    toolId: string;
    name: string;
    description: string;
    configurations: {
        provider: string;
        region: string;
        startupOption: string;
        credentials: IExecutableFunctionCredential;
        language: string;
        code: string;
        payload: IHeaderValues[];
    };
    isReadOnly?: boolean;
};

export const FormBody = (props: AgentProps) => {
    const {
        register,
        setValue,
        getValues,
        onRefetchPrompts,
        onRefetchLlms,
        onRefetchApiTools,
        onRefetchExecutableFunctions,
        onRefetchSLMModel,
        onRefetchMcp,
        onRefetchConnector,
        watch,
        trigger,
        refetchGraphRag,
        refetchVectorRag,
        refetchGuardrails,
        control,
        errors,
        isEdit,
        isLoadingResources,
        allPrompts,
        allModels,
        allApiTools,
        allExecutableFunctions,
        allSLMModels,
        allMcpTools,
        promptsLoading,
        llmModelsLoading,
        apiLoading,
        executableFunctionLoading,
        slmModelsLoading,
        mcpLoading,
        allConnectors,
        connectorsLoading,
        allGraphRag,
        allVectorRags,
        messageBrokers,
        guardrailLoading,
        guardrailData,
    } = props;
    const { syncTools } = useSyncPrompt();
    const promptRef = useRef<PromptSelectorRef>(null);
    const vectorRef = useRef<VectorRagSelectorRef>(null);
    const graphRef = useRef<GraphRagSelectorRef>(null);
    const [agent] = useState<AgentType>();
    const [prompt, setPrompt] = useState<Prompt>();
    const [loading, setLoading] = useState<boolean>(true);
    const [isSlm, setIsSlm] = useState<boolean>(false);
    const [languageModel, setLanguageModel] = useState<IntelligenceSourceModel>();
    const [apis, setApis] = useState<API[]>();
    const [executableFunctions, setExecutableFunctions] = useState<ExecutableFunction[]>();
    const [selfLearning, setSelfLearning] = useState<ISelfLearning | undefined>();
    const [humanInput, setHumanInput] = useState<INodeHumanInput | undefined>();
    const [mcpServers, setMcpServers] = useState<IMCPBody[]>([]);
    const [graphRags, setGraphRags] = useState<IGraphRag[]>([]);
    const [connectors, setConnectors] = useState<IConnectorForm[] | undefined>();
    const [vectorRags, setVectorRags] = useState<IVectorRag[]>([]);
    const [outputBroadcasting, setOutputBroadcasting] = useState<IMessagePublisher | undefined>();
    const [guardrails, setGuardrails] = useState<string[] | undefined>();
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        if (!isEdit) {
            setLoading(false);
            setValue('promptTemplateId', prompt?.id as string);
            if (isSlm) {
                setValue('llmId', undefined);
                setValue('slmId', languageModel?.modelId as string);
            } else {
                setValue('slmId', undefined);
                setValue('llmId', languageModel?.modelId as string);
            }
            setValue('sourceValue', languageModel?.modelId);
        }
    }, [prompt, languageModel, isSlm, isEdit, setValue]);

    // Fix: Set outputBroadcasting state from form value in edit mode
    useEffect(() => {
        if (isEdit && !loading) {
            const publisher = getValues('publisherIntegration');
            setOutputBroadcasting(publisher);
            const _guardrails = getValues('guardrails');
            setGuardrails(_guardrails);
        }
    }, [isEdit, loading, getValues]);

    useEffect(() => {
        const slmId = getValues('slmId');
        if (slmId && slmId !== '') {
            setIsSlm(true);
        } else {
            setIsSlm(false);
        }
    }, [getValues, setIsSlm]);

    const initPromptState = useCallback(() => {
        setPrompt(allPrompts?.find(p => p.id === getValues().promptTemplateId));
    }, [allPrompts, getValues]);

    const initLanguageModelState = useCallback(() => {
        const slmId = getValues().slmId;
        const llmId = getValues().llmId;
        const llm = isSlm
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              allSLMModels?.find((model: any) => model.id === slmId)
            : // eslint-disable-next-line @typescript-eslint/no-explicit-any
              allModels?.find((model: any) => model.id === llmId);

        if (llm) {
            setLanguageModel({
                id: llm.provider,
                provider: llm.provider,
                modelName: llm.modelName || llm.name || '',
                modelId: llm.id ?? '',
                modelDescription: llm.configurations.description || llm.configurations.providerConfig.description || '',
                providerLogo: llm.configurations.providerConfig.logo?.['32'] ?? '',
                modelUniqueId: llm.id ?? '',
            });
        }
    }, [isSlm, allSLMModels, allModels, getValues]);

    const initMcpServersState = useCallback(() => {
        const mcpServersValue = getValues('mcpServers') ?? [];
        setMcpServers(mcpServersValue.length > 0 ? mcpServersValue : []);
    }, [getValues]);

    const initResourcesState = useCallback(() => {
        const knowledgeGraphsValue = getValues('knowledgeGraphs') ?? [];
        if (knowledgeGraphsValue.length > 0) {
            const _knowledgeGraphs = allGraphRag?.filter(x =>
                knowledgeGraphsValue.map(kg => kg.id).includes(x.id as string)
            );
            setGraphRags(_knowledgeGraphs ?? []);
        } else {
            setGraphRags([]);
        }

        const ragsValue = getValues('rags') ?? [];
        if (ragsValue.length > 0) {
            const _rags = allVectorRags?.filter(x => ragsValue.map(r => r.id).includes(x.id as string));
            setVectorRags(_rags ?? []);
        } else {
            setVectorRags([]);
        }

        const connectorsValue = getValues('connectors') ?? [];
        if (connectorsValue.length > 0) {
            const _selectedConnectors = allConnectors.filter(connector =>
                connectorsValue.map(c => c.id).includes(connector.id)
            );
            setConnectors(_selectedConnectors);
        } else {
            setConnectors([]);
        }
    }, [allGraphRag, allVectorRags, allConnectors, getValues]);

    const initToolsState = useCallback(() => {
        const currentTools = getValues('tools') ?? [];
        if (allApiTools && allApiTools.length > 0 && currentTools.length > 0) {
            const tools = allApiTools.filter(api =>
                currentTools.some((tool: Tool) => tool.id === api.id && tool.type === 'API')
            );
            setApis(tools as API[]);
        } else {
            setApis([]);
        }

        if (allExecutableFunctions && allExecutableFunctions.length > 0 && currentTools.length > 0) {
            const func = allExecutableFunctions.filter(f =>
                currentTools.some((tool: Tool) => tool.id === f.id && tool.type === 'EXECUTABLE_FUNCTION')
            );
            setExecutableFunctions(func as ExecutableFunction[]);
        } else {
            setExecutableFunctions([]);
        }
    }, [allApiTools, allExecutableFunctions, getValues]);

    const initializeAgentData = useCallback(() => {
        if (!isEdit) return;

        initPromptState();
        initLanguageModelState();
        initMcpServersState();
        initResourcesState();
        initToolsState();

        setLoading(false);
    }, [isEdit, initPromptState, initLanguageModelState, initMcpServersState, initResourcesState, initToolsState]);

    useEffect(() => {
        initializeAgentData();
    }, [initializeAgentData]);

    useEffect(() => {
        if (!loading && isEdit) {
            const formHumanInput = getValues('humanInput');
            setHumanInput(formHumanInput);
        }
    }, [loading, isEdit, getValues]);

    const manageApi = (response: API[] | undefined) => {
        const currentTools = getValues('tools') ?? [];
        const otherTools = currentTools.filter(tool => tool.type !== 'API');

        if (response && response.length > 0) {
            const apiTools = response?.map(api => ({ id: api.id, type: 'API' })) ?? [];
            setValue('tools', [...otherTools, ...apiTools]);
        } else {
            setValue('tools', otherTools);
        }

        const currentSelfLearning = getValues('selfLearning');
        if (currentSelfLearning && response && response.length > 0) {
            const tools = response.map(api => api.id);
            const _selectedTools = tools?.find(id => currentSelfLearning?.feedbackRequestIntegration?.id == id);
            setValue('selfLearning', {
                ...currentSelfLearning,
                feedbackRequestIntegration: { id: _selectedTools as string, type: RequestToolType?.API },
            });
        } else if (currentSelfLearning) {
            setValue('selfLearning', {
                ...currentSelfLearning,
            });
        }
    };

    const manageExecutableFunction = (response: ExecutableFunction[] | undefined) => {
        const currentTools = getValues('tools') ?? [];
        const otherTools = currentTools.filter(tool => tool.type !== 'EXECUTABLE_FUNCTION');

        if (response && response.length > 0) {
            const functionTools = response?.map(func => ({ id: func.id, type: 'EXECUTABLE_FUNCTION' })) ?? [];
            setValue('tools', [...otherTools, ...functionTools]);
        } else {
            setValue('tools', otherTools);
        }

        const currentSelfLearning = getValues('selfLearning');
        if (currentSelfLearning && response && response.length > 0) {
            const tools = response.map(func => func.id);
            const _selectedTools = tools?.find(id => currentSelfLearning?.feedbackRequestIntegration?.id == id);
            setValue('selfLearning', {
                ...currentSelfLearning,
                feedbackRequestIntegration: { id: _selectedTools as string, type: RequestToolType?.API },
            });
        } else if (currentSelfLearning) {
            setValue('selfLearning', {
                ...currentSelfLearning,
            });
        }
    };

    const managePrompt = async (response: Prompt | undefined) => {
        if (response) {
            setValue('promptTemplateId', response.id);
        } else {
            setValue('promptTemplateId', '');
        }

        const result = await syncTools({
            prompt: response?.configurations?.prompt_template,
            allApiTools,
            apis,
            allMcpTools,
            mcpServers,
            allVectorRags,
            vectorRags,
            allGraphRag,
            graphRags,
            allConnectors,
            connectors,
            allExecutableFunctions,
            executableFunctions,
        });

        setApis(result?.apis);
        manageApi(result?.apis);

        setMcpServers(result?.mcps);
        manageMcp(result?.mcps);

        setVectorRags(result?.vectorRags);
        onRagChange(result?.vectorRags);

        setGraphRags(result?.graphRags);
        onGraphRagChange(result?.graphRags);

        setConnectors(result?.connectors);
        onConnectorChange(result?.connectors);

        if (result?.executableFunctions) {
            setExecutableFunctions(result.executableFunctions);
            manageExecutableFunction(result.executableFunctions);
        }
    };

    const manageLanguageModel = (response: IntelligenceSourceModel | undefined) => {
        if (response && !isSlm) {
            setValue('llmId', response.modelId);
            setValue('slmId', undefined);
            setValue('sourceValue', response.modelId);
        } else if (response && isSlm) {
            setValue('slmId', response.modelId);
            setValue('llmId', undefined);
            setValue('sourceValue', response.modelId);
        } else {
            setValue('llmId', undefined);
            setValue('slmId', undefined);
            setValue('sourceValue', undefined);
        }
    };

    const onHumanInputChange = (value: INodeHumanInput | undefined) => {
        setHumanInput(value);
        setValue('humanInput', value);
    };

    const onSelfLearningChange = (learning: ISelfLearning | undefined) => {
        setValue('selfLearning', learning);
    };

    const manageMcp = (response: IMCPBody[]) => {
        setValue('mcpServers', [...response]);
    };

    const onTriggerValidation = async (key: string) => {
        if (mounted) {
            await trigger(key as never);
        }
    };

    const onGraphRagChange = (response: IGraphRag[] | undefined) => {
        if (response && response.length > 0) {
            setValue('knowledgeGraphs', [...response]);
        } else {
            setValue('knowledgeGraphs', undefined);
        }
    };
    const onConnectorChange = (connectors: IConnectorForm[] | undefined) => {
        if (connectors && connectors.length > 0) {
            setValue('connectors', [...connectors]);
        } else {
            setValue('connectors', undefined);
        }
    };

    const onRagChange = (response: IVectorRag[] | undefined) => {
        if (response) {
            setValue('rags', [...response]);
        } else {
            setValue('rags', undefined);
        }
    };

    const onOutputBroadcasting = (data: IMessagePublisher | undefined) => {
        setValue('publisherIntegration', data);
    };

    const onVectorGraphRefetch = async (isVectorRag?: boolean) => {
        if (isVectorRag) {
            await refetchVectorRag();
            if (vectorRef?.current) {
                vectorRef.current.onMount();
            }
        } else {
            await refetchGraphRag();
            if (graphRef?.current) {
                graphRef.current.onMount();
            }
        }
        await promptRef.current?.refetchVariables();
    };

    const onGuardrailsChange = async (items: string[] | undefined) => {
        setValue('guardrails', items);
    };

    const refetchApiTools = async () => {
        onRefetchApiTools();
        await promptRef.current?.refetchVariables();
    };

    const refetchExecutableFunctions = async () => {
        onRefetchExecutableFunctions();
        await promptRef.current?.refetchVariables();
    };

    const refetchMcp = async () => {
        onRefetchMcp();
        await promptRef.current?.refetchVariables();
    };

    return (
        <>
            <div
                className={cn('h-full flex items-center justify-center mt-[30%]', {
                    hidden: !isLoadingResources && !loading,
                })}
            >
                <div className="flex flex-col items-center gap-y-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-700 font-normal dark:text-gray-200 max-w-[250px] text-center">
                        Hang tight! We&apos;re loading the agent data for you...
                    </p>
                </div>
            </div>
            <div
                className={cn('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-y-4', {
                    hidden: isLoadingResources || loading,
                })}
            >
                <div className="col-span-1 sm:col-span-2 md:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            {...register('agentName', {
                                required: { value: true, message: 'Please enter an agent name' },
                                validate: value => validateSpaces(value, 'agent name'),
                            })}
                            placeholder="Enter your Agent Key"
                            label="Agent Key"
                            isDestructive={!!errors?.agentName?.message}
                            supportiveText={errors?.agentName?.message}
                        />
                        <Input
                            {...register('agentDescription', {
                                required: { value: true, message: 'Please enter an agent description' },
                                validate: value => validateSpaces(value, 'agent description'),
                            })}
                            placeholder="Enter your Agent Description"
                            label="Agent Description"
                            isDestructive={!!errors?.agentDescription?.message}
                            supportiveText={errors?.agentDescription?.message}
                        />
                    </div>
                </div>
                <div className="col-span-1 sm:col-span-2">
                    <Controller
                        name="promptTemplateId"
                        control={control}
                        rules={{
                            required: { value: true, message: 'Please select a prompt instruction' },
                        }}
                        render={() => (
                            <div
                                className={`mt-2 border-2 border-solid rounded-lg p-2 sm:p-4 ${
                                    errors?.promptTemplateId?.message
                                        ? 'border-red-300'
                                        : 'border-gray-300 dark:border-gray-700'
                                }`}
                            >
                                <PromptSelector
                                    ref={promptRef}
                                    agent={agent}
                                    prompt={prompt}
                                    isReadonly={isEdit && !!watch('isReadOnly')}
                                    promptsLoading={promptsLoading}
                                    setPrompt={setPrompt}
                                    allPrompts={allPrompts as PromptResponse[]}
                                    onRefetch={onRefetchPrompts}
                                    onPromptChange={managePrompt}
                                    onModalChange={value =>
                                        value ? setMounted(true) : onTriggerValidation('promptTemplateId')
                                    }
                                />
                            </div>
                        )}
                    />
                    {errors?.promptTemplateId?.message && (
                        <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                            {errors?.promptTemplateId?.message}
                        </p>
                    )}
                </div>
                <div className="col-span-1 sm:col-span-2 md:col-span-2">
                    <Controller
                        name="sourceValue"
                        control={control}
                        rules={{
                            required: { value: true, message: 'Please select an intelligence source' },
                        }}
                        render={() => (
                            <div
                                className={`mt-2 border-2 border-solid rounded-lg p-2 sm:p-4 ${
                                    errors?.sourceValue?.message
                                        ? 'border-red-300'
                                        : 'border-gray-300 dark:border-gray-700'
                                }`}
                            >
                                <LanguageSelector
                                    isSlm={isSlm}
                                    agent={agent}
                                    languageModel={languageModel}
                                    llmModelsLoading={llmModelsLoading}
                                    slmModelsLoading={slmModelsLoading}
                                    setLanguageModel={setLanguageModel}
                                    allModels={allModels ?? []}
                                    allSLMModels={allSLMModels ?? []}
                                    allSTSModels={[]}
                                    isReadonly={isEdit && !!watch('isReadOnly')}
                                    onRefetch={() => {
                                        onRefetchLlms();
                                        onRefetchSLMModel();
                                    }}
                                    onLanguageModelChange={manageLanguageModel}
                                    onIntelligenceSourceChange={value => setIsSlm(value)}
                                    onModalChange={value =>
                                        value ? setMounted(true) : onTriggerValidation('sourceValue')
                                    }
                                />
                            </div>
                        )}
                    />
                    {errors?.sourceValue?.message && (
                        <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                            {errors?.sourceValue?.message}
                        </p>
                    )}
                </div>
                <div className="col-span-1 sm:col-span-2 md:col-span-2 border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-4">
                    <HumanInput
                        humanInput={humanInput}
                        messageBrokers={messageBrokers ?? []}
                        setHumanInput={setHumanInput}
                        isReadOnly={isEdit && !!watch('isReadOnly')}
                        onHumanInputChange={onHumanInputChange}
                    />
                </div>
                <div className="col-span-1 sm:col-span-2 md:col-span-2 border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-4">
                    <div className="text-input-checkbox flex flex-col gap-y-3">
                        <div className="flex flex-col gap-y-1">
                            <div className="flex items-center gap-x-[10px]">
                                <Boxes size={20} absoluteStrokeWidth={false} className="stroke-[1px]" />
                                <p>Add Helper Tools</p>
                            </div>
                            <p className="text-xs font-normal text-gray-400">
                                Select helper tools that required for this agent to run efficiently.
                            </p>
                        </div>
                        <div>
                            <APISelector
                                {...register('tools')}
                                agent={agent}
                                apis={apis}
                                setApis={setApis}
                                allApiTools={allApiTools as ApiToolResponseType[]}
                                isReadonly={isEdit && !!watch('isReadOnly')}
                                apiLoading={apiLoading}
                                onRefetch={() => refetchApiTools()}
                                onApiChange={manageApi}
                            />
                        </div>
                        <hr className="my-2 border-b dark:border-gray-700" />
                        <MCPSelector
                            mcpServers={mcpServers}
                            setMcpServers={setMcpServers}
                            agent={agent}
                            isReadonly={isEdit && !!watch('isReadOnly')}
                            loading={mcpLoading}
                            allMcpTools={allMcpTools as McpToolResponseType[]}
                            onRefetch={() => refetchMcp()}
                            onMcpChange={manageMcp}
                        />
                        <hr className="my-2 border-b dark:border-gray-700" />
                        <VectorRagSelector
                            ref={vectorRef}
                            vectorRags={vectorRags}
                            setVectorRags={setVectorRags}
                            agent={agent}
                            allVectorRags={allVectorRags ?? []}
                            onRefetch={() => onVectorGraphRefetch(true)}
                            onVectorRagChange={onRagChange}
                        />
                        <hr className="my-2 border-b dark:border-gray-700" />
                        <GraphRagConfigSelector
                            ref={graphRef}
                            allGraphRags={allGraphRag ?? []}
                            graphRags={graphRags}
                            setGraphRags={setGraphRags}
                            agent={agent}
                            onRefetch={() => onVectorGraphRefetch()}
                            onGraphRagChange={onGraphRagChange}
                        />
                        <hr className="my-2 border-b dark:border-gray-700" />
                        <ConnectorSelector
                            agent={agent}
                            connectors={connectors ?? []}
                            isMultiple={true}
                            setConnectors={setConnectors}
                            allConnectors={allConnectors}
                            isSelfLearning={true}
                            label="Data Connectors"
                            onRefetch={onRefetchConnector}
                            onConnectorsChange={onConnectorChange}
                            connectorLoading={connectorsLoading}
                        />
                        <hr className="my-2 border-b dark:border-gray-700" />
                        <GuardrailSelector
                            agent={agent}
                            allGuardrails={guardrailData ?? []}
                            guardrails={guardrails}
                            isReadonly={isEdit && !!watch('isReadOnly')}
                            guardrailsLoading={guardrailLoading}
                            title="Agent Level Guardrails"
                            level={GuardrailBindingLevelType.AGENT}
                            setGuardrails={setGuardrails}
                            onRefetch={refetchGuardrails}
                            onGuardrailsChange={onGuardrailsChange}
                        />
                        <hr className="my-2 border-b dark:border-gray-700" />
                        <ExecutableFunctionSelector
                            {...register('tools')}
                            agent={agent}
                            functions={executableFunctions}
                            setFunctions={setExecutableFunctions}
                            allExecutableFunctions={allExecutableFunctions as ExecutableFunctionResponseType[]}
                            isReadonly={isEdit && !!watch('isReadOnly')}
                            functionLoading={executableFunctionLoading}
                            onRefetch={() => refetchExecutableFunctions()}
                            onExecutableFunctionChange={manageExecutableFunction}
                        />
                    </div>
                </div>
                <div className="col-span-1 sm:col-span-2 md:col-span-2 border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-4">
                    <SelfLearning
                        selfLearning={watch('selfLearning') || selfLearning}
                        isReadOnly={isEdit && !!watch('isReadOnly')}
                        apis={apis}
                        allApiTools={allApiTools}
                        llms={allModels}
                        slms={allSLMModels as never}
                        agent={agent}
                        allPrompts={allPrompts as PromptResponse[]}
                        promptsLoading={!!promptsLoading}
                        llmModelsLoading={!!llmModelsLoading}
                        slmModelsLoading={!!slmModelsLoading}
                        messageBrokers={messageBrokers ?? []}
                        setSelfLearning={setSelfLearning}
                        onSelfLearningChange={onSelfLearningChange}
                        onRefetch={onRefetchApiTools}
                        onRefetchIntelligence={() => {
                            onRefetchLlms();
                            onRefetchSLMModel();
                        }}
                        onRefetchPrompt={async () => {
                            onRefetchPrompts();
                        }}
                        allConnectors={allConnectors}
                        connectorsLoading={connectorsLoading ?? false}
                        onRefetchConnector={onRefetchConnector}
                    />
                </div>
                <div className="col-span-1 sm:col-span-2 md:col-span-2 border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-4">
                    <MessagePublisher
                        title="Output Broadcasting"
                        detailButtonLabel="Add Output Broadcasting"
                        viewLabel="View Output Broadcasting"
                        messagePublisher={outputBroadcasting}
                        messageBrokers={messageBrokers ?? []}
                        isReadOnly={isEdit && !!watch('isReadOnly')}
                        setMessagePublisher={setOutputBroadcasting}
                        onMessagePublisherChange={onOutputBroadcasting}
                    />
                </div>
            </div>
        </>
    );
};

export const AgentForm = (props: AgentProps) => {
    const { isOpen, setOpen, handleSubmit, onHandleSubmit, watch, reset, isValid, isEdit, isSaving } = props;
    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet={false}
            setOpen={setOpen}
            className="custom-drawer-content"
            dismissible={false}
            headerIcon={<Bot />}
            header={isEdit ? 'Edit Agent' : 'New Agent'}
            footer={
                <div className="flex justify-end gap-2">
                    <Button
                        variant={'secondary'}
                        size={'sm'}
                        onClick={() => {
                            setOpen(false);
                            reset();
                        }}
                    >
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

export default AgentForm;
