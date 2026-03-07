import { AgentType } from '@/components/organisms';
import { IAgentTool } from './agent-configuration-step';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { X, Sparkles, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/tabs';
import { Badge, Button, Label, Select } from '@/components';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/atoms/accordion';
import { useState, useEffect } from 'react';
import { UseFormWatch, UseFormSetValue, useForm } from 'react-hook-form';
import { ITestSuite, AgentToolType, TestCaseMethod } from '../../data-generation';

interface ApiToolOutputContentProps {
    readonly api: { id?: string; name?: string };
    readonly idx: number;
    readonly testCaseMethod?: string;
    readonly selectedAgentId: string | null;
    readonly validInputs: ReadonlyArray<{ input?: { message: string }; groundTruth?: string; expectedOutput?: string }>;
    readonly generatedOutputs: { readonly [key: string]: string };
    readonly setGeneratedOutputs: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
    readonly customInputIndex?: number;
    readonly register: ReturnType<typeof useForm<IUploadConfiguration>>['register'];
    readonly watchForm: ReturnType<typeof useForm<IUploadConfiguration>>['watch'];
    readonly watch: UseFormWatch<ITestSuite>;
}

function ApiToolOutputContent({
    api,
    idx,
    testCaseMethod,
    selectedAgentId,
    validInputs,
    generatedOutputs,
    setGeneratedOutputs,
    customInputIndex,
    register,
    watchForm,
    watch,
}: ApiToolOutputContentProps) {
    if (testCaseMethod === TestCaseMethod.Auto) {
        return (
            <div className="space-y-3">
                <div className="w-full border rounded-lg bg-white">
                    <div className="border-0">
                        <div className="px-4 pb-4">
                            <div className="space-y-2 pt-3">
                                <Label htmlFor={`expectedOutput-${api?.name}-auto`} className="text-xs">
                                    Tool Output
                                </Label>
                                <textarea
                                    id={`expectedOutput-${api?.name}-auto`}
                                    value={generatedOutputs[`${api?.name}-auto`] ?? ''}
                                    onChange={e => {
                                        setGeneratedOutputs(prev => ({
                                            ...prev,
                                            [`${api?.name}-auto`]: e.target.value,
                                        }));
                                    }}
                                    placeholder="Enter tool output..."
                                    rows={3}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (validInputs.length > 0) {
        return (
            <div className="space-y-3">
                {validInputs.map((dataset, index) => (
                    <div
                        key={`input-${api?.name}-${dataset.input?.message ?? dataset.groundTruth ?? index}`}
                        className="w-full border rounded-lg bg-white"
                    >
                        <div className="border-0">
                            <div className="px-4 pb-4">
                                <div className="space-y-2 pt-3">
                                    <Label
                                        htmlFor={`expectedOutput-${api?.name}-${customInputIndex ?? index}`}
                                        className="text-xs"
                                    >
                                        Tool Output
                                    </Label>
                                    <textarea
                                        id={`expectedOutput-${api?.name}-${customInputIndex ?? index}`}
                                        value={
                                            generatedOutputs[`${api?.name}-${customInputIndex ?? index}`] ?? ''
                                        }
                                        onChange={e => {
                                            const useIndex = customInputIndex ?? index;
                                            const key = `${api?.name}-${useIndex}`;
                                            setGeneratedOutputs(prev => ({ ...prev, [key]: e.target.value }));
                                        }}
                                        placeholder="Enter tool output..."
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    if (testCaseMethod === TestCaseMethod.Upload && selectedAgentId) {
        return (
            <div className="grid grid-cols-1 gap-4 p-4 border rounded-md bg-white mt-4">
                <Label htmlFor="groundTruth" className="text-xs">
                    Tool Output <span className="text-red-500">*</span>
                </Label>
                <Select
                    {...register(`configs.${idx}.toolOutput`)}
                    options={[
                        'Select data',
                        ...(watch('excelHeaders') ?? []),
                    ].map(h => ({ name: h, value: h }))}
                    currentValue={String(watchForm(`configs.${idx}.toolOutput`) ?? 'Select data')}
                    placeholder="Select data"
                    className="border rounded-md px-2 py-1"
                />
            </div>
        );
    }
    return (
        <div className="text-center text-sm text-gray-500 py-4">No inputs available</div>
    );
}

type IGenerateAgentConfigurationsProps = {
    agent: AgentType | null | undefined;
    selectedTools: IAgentTool[];
    isOpen: boolean;
    testCaseMethod?: string;
    selectedAgentId: string | null;
    setIsOpen: (isOpen: boolean) => void;
    inputs?: Array<{ input?: {message:string}; groundTruth?: string; expectedOutput?: string }>;
    watch: UseFormWatch<ITestSuite>;
    setValue: UseFormSetValue<ITestSuite>;
    customInputIndex?: number;
};

interface IUploadConfiguration {
    configs: { toolOutput: string }[];
}

//need to get all list of tools to know the configs

export const GenerateAgentConfigurations = (props: IGenerateAgentConfigurationsProps) => {
    const {
        agent,
        selectedTools,
        isOpen,
        testCaseMethod,
        selectedAgentId,
        setIsOpen,
        inputs = [],
        watch,
        setValue,
    } = props;
    const [isGenerating] = useState(false);

    const [generatedOutputs, setGeneratedOutputs] = useState<{ [key: string]: string }>({});

    const { register, watch: watchForm } = useForm<IUploadConfiguration>({
        mode: 'all',
        defaultValues: {
            configs: [],
        },
    });

    // Sync local state with form state when modal opens
    useEffect(() => {
        if (isOpen) {
            const currentFormValues = watch('toolOutputDefinitions') ?? {};
            setGeneratedOutputs(currentFormValues);
        }
    }, [isOpen, watch]);

    const validInputs = inputs.filter(
        (input: { input?: {message:string}; groundTruth?: string; expectedOutput?: string }) =>
            input && (input.input || input.groundTruth || input.expectedOutput)
    );

    // Prevent duplicate Tool Output sections in Auto mode by tracking rendered keys

    const selectedApi =
        agent?.apis?.filter(api => selectedTools?.some(tool => tool?.type === AgentToolType.Api && tool?.id === api?.id)) ?? [];

    const selectedConnectors =
        agent?.connectors?.filter(connector =>
            selectedTools?.some(tool => tool?.type === AgentToolType.Connectors && tool?.id === connector?.id)
        ) ?? [];
    const selectedGuardrails =
        agent?.guardrails?.filter(guardrail =>
            selectedTools?.some(tool => tool?.type === AgentToolType.Guardrails && tool?.id === guardrail)
        ) ?? [];
    const selectedMcp =
        agent?.mcpServers?.filter(mcp => selectedTools?.some(tool => tool?.type === AgentToolType.Mcp && tool?.id === mcp?.id)) ??
        [];

    const selectedRags = [
        ...(agent?.rags?.filter(rag => rag.id && selectedTools?.some(tool => tool?.type === AgentToolType.RAG && tool?.id === rag.id)) ?? []),
        ...(agent?.knowledgeGraphs?.filter(kg => kg.id && selectedTools?.some(tool => tool?.type === AgentToolType.RAG && tool?.id === kg.id)) ?? []),
    ];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent hideCloseButtonClass="hidden" className="min-w-[900px] gap-0 max-h-[90vh]">
                <DialogHeader className="h-fit">
                    <DialogTitle>
                        <div className="w-full flex flex-col">
                            <div className="flex items-center justify-between w-full">
                                <p className="pb-3">Tool Configuration</p>
                                <X
                                    size={18}
                                    className="text-gray-500 cursor-pointer"
                                    onClick={() => setIsOpen(false)}
                                />
                            </div>
                            <p className="font-normal text-sm text-gray-500 pr-8 mt-2">
                                Provide the input prompts or dialogue scenarios to generate synthetic data. This section
                                allows you to create realistic, simulated datasets for testing or validating workflows
                                without using real-world sensitive data.
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4 overflow-auto h-[500px] mt-1">
                    <Tabs defaultValue={AgentToolType.Api}>
                        <TabsList>
                            <TabsTrigger value={AgentToolType.Api} disabled={selectedApi?.length <= 0}>
                                API{' '}
                                <Badge variant={selectedApi?.length > 0 ? 'info' : 'secondary'} testStudio={true} className="h-5 ml-4">
                                    {selectedApi?.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value={AgentToolType.Connectors} disabled={selectedConnectors?.length <= 0}>
                                Connectors
                                <Badge
                                    variant={selectedConnectors?.length > 0 ? 'info' : 'secondary'}
                                    testStudio={true}
                                    className="h-5 ml-4"
                                >
                                    {selectedConnectors?.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value={AgentToolType.Guardrails} disabled={selectedGuardrails?.length <= 0}>
                                Guardrails
                                <Badge
                                    variant={selectedGuardrails?.length > 0 ? 'info' : 'secondary'}
                                    testStudio={true}
                                    className="h-5 ml-4"
                                >
                                    {selectedGuardrails?.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value={AgentToolType.Mcp} disabled={selectedMcp?.length <= 0}>
                                MCP Servers
                                <Badge variant={selectedMcp?.length > 0 ? 'info' : 'secondary'} testStudio={true} className="h-5 ml-4">
                                    {selectedMcp?.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value={AgentToolType.RAG} disabled={selectedRags?.length <= 0}>
                                RAG
                                <Badge variant={selectedRags?.length > 0 ? 'info' : 'secondary'} testStudio={true} className="h-5 ml-4">
                                    {selectedRags?.length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value={AgentToolType.Api} className="w-full ">
                            <Accordion type="multiple" className="w-full mt-5 space-y-3">
                                {selectedApi?.map((api, idx) => (
                                    <AccordionItem
                                        value={api?.id}
                                        className="border rounded-xl p-0 gap-0"
                                        key={api?.id}
                                    >
                                        <AccordionTrigger className="px-4">
                                            <div className="w-full flex items-center justify-between pr-4">
                                                <div className="flex items-center gap-2">
                                                    {api?.name} <Badge>GET</Badge>
                                                </div>
                                                {/* <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={async e => {
                                                        e.stopPropagation();
                                                        setIsGenerating(true);

                                                        // Show loading animation with timeout
                                                        await new Promise(resolve => setTimeout(resolve, 2000));

                                                        // Generate expected outputs for this specific API
                                                        const outputs: { [key: string]: string } = {};
                                                        validInputs.forEach((dataset, index) => {
                                                            const key = `${api?.name}-${index}`;
                                                            outputs[key] = `Generated expected output for ${
                                                                api?.name
                                                            } with input: ${
                                                                dataset.input || `Input ${index + 1}`
                                                            }\n\nThis is a sample response that demonstrates the expected behavior of the API when processing the given input.`;
                                                        });

                                                        setGeneratedOutputs({
                                                            ...generatedOutputs,
                                                            ...outputs,
                                                        });
                                                        setIsGenerating(false);
                                                    }}
                                                    disabled={isGenerating}
                                                    className="text-blue-500 border-blue-500 hover:bg-blue-50"
                                                >
                                                    {isGenerating ? (
                                                        <span className="flex gap-2 items-center">
                                                            <Spinner /> Generating
                                                        </span>
                                                    ) : (
                                                        <span className="flex gap-2 items-center">
                                                            <Sparkles size={14} /> Generate
                                                        </span>
                                                    )}
                                                </Button> */}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent forceMount className="w-full p-0">
                                            <div className="px-4 pb-4 border-t pt-4">
                                                <ApiToolOutputContent
                                                    api={api}
                                                    idx={idx}
                                                    testCaseMethod={testCaseMethod}
                                                    selectedAgentId={selectedAgentId}
                                                    validInputs={validInputs}
                                                    generatedOutputs={generatedOutputs}
                                                    setGeneratedOutputs={setGeneratedOutputs}
                                                    customInputIndex={props.customInputIndex}
                                                    register={register}
                                                    watchForm={watchForm}
                                                    watch={watch}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </TabsContent>
                        <TabsContent value={AgentToolType.Connectors}>connectors</TabsContent>
                        <TabsContent value={AgentToolType.Guardrails}>guardrails</TabsContent>
                        <TabsContent value={AgentToolType.Mcp}>mcp</TabsContent>
                        <TabsContent value={AgentToolType.RAG}>rag</TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="h-fit">
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            variant={'outline'}
                            onClick={() => {
                                setIsOpen(false);
                                // Reset to saved form values
                                const savedValues = watch('toolOutputDefinitions') ?? {};
                                setGeneratedOutputs(savedValues);
                            }}
                            disabled={isGenerating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                // Save the tool output definitions to React Hook Form
                                setValue('toolOutputDefinitions', generatedOutputs, { shouldDirty: true });

                                setIsOpen(false);
                            }}
                            disabled={isGenerating}
                        >
                            <span className="flex gap-2 items-center">
                                <Save size={16} /> Save
                            </span>
                        </Button>
                    </div>
                </DialogFooter>

                {/* Blur overlay and bouncing generating icon */}
                {isGenerating && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="flex flex-col items-center gap-4">
                            <Sparkles size={60} className="text-blue-500 animate-bounce" />
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
