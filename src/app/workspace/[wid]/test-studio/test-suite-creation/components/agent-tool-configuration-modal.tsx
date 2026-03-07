import { IAgentTool } from './agent-configuration-step';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { ArrowRight, FileText, Info, Plus, Save, Trash2, X } from 'lucide-react';
import {
    Button,
    Input,
    RadioChips,
    Textarea,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components';
import React, { useEffect, useState } from 'react';
import { UseFormWatch } from 'react-hook-form';
import { ITestSuite, MockMode } from '../../data-generation';
import { DetailAlert } from '@/components/atoms/detail-alert';
import { AlertVariant } from '@/enums/component-type';

type ScenarioType = {
    id: string;
    name: string;
    config: string;
    mockMode: MockMode;
    llmInstruction?: string;
};

type IGenerateAgentConfigurationsProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    watch: UseFormWatch<ITestSuite>;
    tools: IAgentTool[];
    toolType: string | undefined;
    toolId: string;
    configScenarios: ScenarioType[];
    updateToolMockConfigs: (
        toolId: string,
        toolName: string,
        updatedScenarios: ScenarioType[]
    ) => void;
};

export const AgentToolConfigModal = (props: IGenerateAgentConfigurationsProps) => {
    const { isOpen, setIsOpen, watch, tools, toolType, toolId, updateToolMockConfigs } = props;
    const [configScenarios, setConfigScenarios] = useState<ScenarioType[]>(props.configScenarios);
    const [activeConfig, setActiveConfig] = useState<string | null>(null);
    const [mockMode, setMockMode] = useState<MockMode>(MockMode.Static);
    const [scenarioName, setScenarioName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [scenarioConfig, setScenarioConfig] = useState('{\n  "status": "success",\n  "data": {}\n}');
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [scenarioNameError, setScenarioNameError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null);

    // Filter tools by the selected toolType
    // const configScenarios = useMemo(() => {
    //     return tools.filter(tool => tool.type.toLowerCase() === toolType?.toString().toLowerCase());
    // }, [tools, toolType]);

    // Sync local state with form state when modal opens
    useEffect(() => {
        if (isOpen) {
            // Reset selections when modal opens
            setActiveConfig(null);
            setMockMode(MockMode.Static);
        }
    }, [isOpen, watch]);
    useEffect(() => {
        setConfigScenarios(props.configScenarios);
    }, [props.configScenarios, isOpen]);

    const validateJson = (value: string): string | null => {
        if (!value.trim()) return 'Mock response data is required';
        try {
            const val = JSON.parse(value);
            if (Object.keys(val).length === 0) return 'Does not support empty json objects';
            return null;
        } catch (e) {
            return (e as SyntaxError).message;
        }
    };

    // Parse and populate right panel when a scenario is selected
    useEffect(() => {
        if (activeConfig && configScenarios.length > 0) {
            const selectedScenario = configScenarios.find(s => s.id === activeConfig);
            if (selectedScenario) {
                setScenarioName(selectedScenario.name);
                setScenarioNameError(null);
                setJsonError(null);
                try {
                    setMockMode(selectedScenario.mockMode);
                    setScenarioConfig(selectedScenario.config);
                    setInstructions(selectedScenario.llmInstruction ?? '');
                } catch {
                    setScenarioConfig(selectedScenario.config);
                    setInstructions(selectedScenario.llmInstruction ?? '');
                }
            }
        }
    }, [activeConfig, configScenarios]);

    // Save current scenario edits back to configScenarios array
    const saveCurrentScenarioEdits = () => {
        if (!activeConfig) return configScenarios;

        return configScenarios.map(scenario => {
            if (scenario.id === activeConfig) {
                // Build the config object with mockMode and response
                return {
                    ...scenario,
                    name: scenarioName,
                    mockMode: mockMode,
                    config: scenarioConfig,
                    llmInstruction: instructions,
                };
            }
            return scenario;
        });
    };
    // Gets the highest number with Scenarion name as New Response # to avoid overlapping new scenario names
    const getHighestNewScenarioIndex = (scenarios: ScenarioType[]): number => {
        const pattern = /^New Response (\d+)$/;
        return scenarios.reduce((max, s) => {
            const match = new RegExp(pattern).exec(s.name);
            return match ? Math.max(max, Number.parseInt(match[1], 10)) : max;
        }, 0);
    };

    const addNewScenario = () => {
        // Validate current scenario name before adding a new one
        if (activeConfig && !scenarioName.trim()) {
            setScenarioNameError('Scenario name is required');
            return;
        }
        // Save current edits before adding new scenario
        const currentScenarios = saveCurrentScenarioEdits();
        const highScIndex = getHighestNewScenarioIndex(currentScenarios);
        const newScenario = {
            id: `scenario-${Date.now()}`,
            name: `New Response ${ highScIndex+ 1}`,
            config: JSON.stringify({ status: 'success', data: {} }, null, 2),
            mockMode: MockMode.Static,
        };
        const updatedScenarios = [...currentScenarios, newScenario];
        setConfigScenarios(updatedScenarios);
        setActiveConfig(newScenario.id);
    }

    const handleDeleteScenario = () => {
        if (scenarioToDelete) {
            const updatedScenarios = configScenarios.filter(s => s.id !== scenarioToDelete);
            setConfigScenarios(updatedScenarios);

            // If deleting active scenario, clear active config
            if (activeConfig === scenarioToDelete) {
                setActiveConfig(null);
            }

            setShowDeleteConfirm(false);
            setScenarioToDelete(null);
        }
    };

    const closeModal = () => {
        setConfigScenarios([]);
        setIsOpen(false);
    };
    const guideMessage = () => {
        return (
            <>
                {
                    <span>
                        Define mock responses to simulate tool behavior during testing, using either{' '}
                        <span className="font-semibold text-blue-600 dark:text-blue-400">static data</span> or{' '}
                        <span className="font-semibold text-blue-600 dark:text-blue-400">AI-generated</span> outputs.
                    </span>
                }
            </>
        );
    };
    const guideDetails = () => {
        return (
            <div className="space-y-3">
                <p>
                    Configure mock responses for your tools to simulate realistic behavior during testing without
                    calling actual tools.
                </p>
                <ol className="list-decimal pl-5 space-y-2 ">
                    <li>
                        Click{' '}
                        <span className="font-semibold text-blue-600 dark:text-blue-400">&quot;Add Response&quot;</span>{' '}
                        to create a new mock configuration for your tool.
                    </li>
                    <li>
                        Choose the <span className="font-semibold text-indigo-600 dark:text-indigo-400">Mode</span>:{' '}
                        <span className="font-semibold text-green-600 dark:text-green-400">Static</span> returns the
                        same predefined response, while{' '}
                        <span className="font-semibold text-green-600 dark:text-green-400">Dynamic</span> uses AI to
                        generate contextual responses.
                    </li>
                    <li>
                        Give your scenario a descriptive{' '}
                        <span className="font-semibold text-orange-600 dark:text-orange-400">Name</span> to easily
                        identify it later (e.g., &quot;Flight booking success&quot;).
                    </li>
                    <li>
                        For <span className="font-semibold text-green-600 dark:text-green-400">Dynamic</span> mode,
                        provide <span className="font-semibold text-gray-600 dark:text-gray-400">Instructions</span> to
                        guide the LLM on how to generate responses.
                    </li>
                    <li>
                        Define the <span className="font-semibold text-blue-600 dark:text-blue-400">JSON response</span>{' '}
                        structure that the tool should return during test execution.
                    </li>
                </ol>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                hideCloseButtonClass="hidden"
                className="max-w-[95vw] w-full h-[95vh] gap-0 grid-rows-[auto_1fr_auto]"
            >
                <DialogHeader className="h-fit">
                    <DialogTitle>
                        <div className="w-full flex flex-col">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2 pb-3">
                                    <span>Input Data Connect Mocking</span>
                                    {tools.find(t => t.id === toolId)?.label && (
                                        <span className="text-sm font-medium text-blue-600 dark:text-gray-200 bg-blue-50 dark:bg-blue-900 px-2.5 py-1 rounded">
                                            {tools.find(t => t.id === toolId)?.label}
                                        </span>
                                    )}
                                </div>
                                <X size={18} className="text-gray-500 cursor-pointer" onClick={closeModal} />
                            </div>
                            <p className="font-normal text-sm text-gray-500 dark:text-gray-400 pr-5 mt-2 pb-6">
                                {/*Provide static responses or a sample to generate synthetic responses*/}
                                Provide static responses or a sample to generate synthetic responses. This section
                                allows you to create realistic, simulated Data Connector responses to test and validate
                                workflows without using the actual Data Connector responses.
                            </p>
                        </div>
                        <div className="font-normal pt-6 border-t-[1.5px] dark:border-gray-700">
                            <DetailAlert
                                variant={AlertVariant.Info}
                                message={guideMessage()}
                                details={guideDetails()}
                                className="mb-2"
                            />
                        </div>
                    </DialogTitle>
                </DialogHeader>

                {/* Two-panel body */}
                <DialogDescription asChild>
                    <div className="flex gap-4 m-0 py-3 px-5 h-full min-h-0 overflow-auto">
                        {/* Left Panel - Tool Selection */}
                        <div className="w-[240px] flex-shrink-0 flex flex-col pb-5">
                            {/* Selected Tools Section */}
                            <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100 mb-4">
                                <FileText size={16} className="text-gray-900 dark:text-gray-100" />
                                <span>Data connect Response</span>
                            </div>

                            {/* Scrollable scenarios list */}
                            <div className="flex-1 overflow-y-auto mb-4">
                                {configScenarios.length > 0 && (
                                    <div>
                                        {configScenarios.map(scenario => (
                                            <div
                                                key={scenario.id}
                                                className={`flex items-center justify-between p-2 mb-4 cursor-pointer ${
                                                    activeConfig === scenario.id
                                                        ? 'bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300 border-l border-t border-b border-r-[12px]'
                                                        : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 border-l border-t border-b border-r-[12px]'
                                                }`}
                                            >
                                                <button
                                                    type="button"
                                                    className="flex-1 py-3 text-left"
                                                    onClick={() => {
                                                        // Save current edits before switching scenarios
                                                        if (activeConfig && activeConfig !== scenario.id) {
                                                            if (!scenarioName.trim()) {
                                                                setScenarioNameError('Scenario name is required');
                                                                return;
                                                            }
                                                            const updatedScenarios = saveCurrentScenarioEdits();
                                                            setConfigScenarios(updatedScenarios);
                                                        }
                                                        setActiveConfig(scenario.id);
                                                    }}
                                                >
                                                    <span className="text-sm font-medium pl-2">{scenario.name}</span>
                                                </button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:text-red-300 dark:hover:bg-red-900/30 mr-1"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setScenarioToDelete(scenario.id);
                                                        setShowDeleteConfirm(true);
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Add Response Button - Static at bottom */}
                            <div className="mt-auto">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-300 py-5"
                                    onClick={addNewScenario}
                                >
                                    <Plus size={14} className="mr-1" />
                                    Add Response
                                </Button>
                            </div>
                        </div>

                        {/* Right Panel - Mock Configuration */}
                        <div className="flex-1 flex flex-col border-l dark:border-gray-700 pl-4 ">
                            {activeConfig ? (
                                <>
                                    {/* Header with selected tool info */}
                                    <div className="flex items-center justify-between mb-4 bg-blue-600 p-3 rounded">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">
                                                {configScenarios.find(s => s.id === activeConfig)?.name ||
                                                    'Configuration'}
                                            </span>
                                            <ArrowRight size={14} className="text-white" />
                                            <span
                                                className={`px-3 py-1.5 text-xs font-medium rounded ${
                                                    mockMode === MockMode.Static
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-amber-100 text-amber-600'
                                                }`}
                                            >
                                                {mockMode.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-4 py-2 text-sm font-bold bg-blue-100 text-blue-600 rounded">
                                                {toolType?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Create Mock Configurations Fieldset */}
                                    <fieldset className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex-1 overflow-y-auto">
                                        <legend className="text-sm font-medium text-gray-600 dark:text-gray-400 px-2 pb-3">
                                            Create Mock Configurations
                                        </legend>

                                        {/* Mode Toggle */}
                                        <div className="flex items-center gap-4 mb-4 justify-between">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    Response Mode
                                                </span>
                                                <TooltipProvider delayDuration={1}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="text-gray-900 flex items-center gap-[5px] dark:text-gray-100 cursor-help">
                                                                <Info size={12} className="text-gray-400" />
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs">
                                                            <p className="mb-1">
                                                                <span className="font-semibold">Static:</span> Always
                                                                returns the same predefined response.
                                                            </p>
                                                            <p>
                                                                <span className="font-semibold">Dynamic:</span>{' '}
                                                                Dynamically generate responses using AI at the execution
                                                                time, incorporating the provided test case and the
                                                                sample response as context{' '}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <RadioChips
                                                value={mockMode}
                                                onValueChange={val => setMockMode(val as MockMode)}
                                                options={[
                                                    { value: MockMode.Static, label: 'Static' },
                                                    { value: MockMode.Llm, label: 'Dynamic' },
                                                ]}
                                            />
                                        </div>

                                        {/* Scenario Section */}

                                        {/* Name Input */}
                                        <div className="mb-4">
                                            <label
                                                htmlFor="scenario-name-input"
                                                className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5 block"
                                            >
                                                Scenario Name
                                            </label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                A descriptive name to identify this mock scenario
                                            </p>
                                            <Input
                                                id="scenario-name-input"
                                                value={scenarioName}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setScenarioName(val);
                                                    setScenarioNameError(
                                                        val.trim() ? null : 'Scenario name is required'
                                                    );
                                                }}
                                                placeholder="e.g., Flight booking success response"
                                                className="w-full"
                                                isDestructive={!!scenarioNameError}
                                                supportiveText={scenarioNameError ?? undefined}
                                            />
                                        </div>

                                        {/* Instructions Field - Only show when LLM mode is selected */}
                                        {mockMode === MockMode.Llm && (
                                            <div className="mb-4">
                                                <label
                                                    htmlFor="llm-instructions-input"
                                                    className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5 block"
                                                >
                                                    LLM Instructions
                                                </label>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                    Guide the LLM on how to generate dynamic responses based on context
                                                </p>
                                                <Textarea
                                                    id="llm-instructions-input"
                                                    value={instructions}
                                                    onChange={e => setInstructions(e.target.value)}
                                                    placeholder="e.g., Generate a realistic flight booking confirmation with random flight numbers and dates..."
                                                    className="w-full min-h-[130px]"
                                                />
                                            </div>
                                        )}

                                        {/* JSON Config Editor */}
                                        <div className="flex-1">
                                            <label
                                                htmlFor="mock-response-data-input"
                                                className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-0.5 block"
                                            >
                                                Mock Response Data
                                            </label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                JSON structure that the tool should return during test execution
                                            </p>
                                            <Textarea
                                                id="mock-response-data-input"
                                                value={scenarioConfig}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setScenarioConfig(val);
                                                    setJsonError(validateJson(val));
                                                }}
                                                className={`w-full h-[150px] p-3 text-sm font-mono bg-gray-50 dark:bg-gray-800 border rounded-lg resize-none focus:outline-none focus:ring-2 ${
                                                    jsonError
                                                        ? 'border-red-400 dark:border-red-500 focus:ring-red-300'
                                                        : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'
                                                }`}
                                                placeholder='{"status": "success", "data": {...}}'
                                            />
                                            {jsonError && (
                                                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                                    Invalid JSON: {jsonError}
                                                </p>
                                            )}
                                        </div>
                                    </fieldset>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                                    Select a tool from the left panel to configure mock responses
                                </div>
                            )}
                        </div>
                    </div>
                </DialogDescription>

                <DialogFooter className="h-fit">
                    <div className="grid grid-cols-6 w-full h-auto items-center gap-3">
                        <div className="col-span-1 flex justify-start">
                            <Button
                                variant={'secondary'}
                                onClick={() => {
                                    setIsOpen(false);
                                    // Reset to saved form values
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                        <div className="col-span-5 flex justify-end gap-2">
                            <Button
                                disabled={!!jsonError || !!scenarioNameError}
                                onClick={() => {
                                    // Save current edits before updating
                                    const updatedScenarios = saveCurrentScenarioEdits();
                                    const toolLabel = tools.find(t => t.id === toolId)?.label ?? toolId;
                                    updateToolMockConfigs(toolId, toolLabel, updatedScenarios);
                                    setIsOpen(false);
                                }}
                            >
                                <span className="flex gap-2 items-center">
                                    <Save size={16} /> Save
                                </span>
                            </Button>
                        </div>
                    </div>
                </DialogFooter>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <Trash2 size={24} className="text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Delete Scenario
                                </h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Are you sure you want to delete this scenario? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setScenarioToDelete(null);
                                    }}
                                >
                                    Keep
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteScenario}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Yes, Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
