import { IAgentTool } from '@/app/workspace/[wid]/test-studio/test-suite-creation/components/agent-configuration-step';
import React, { useEffect, useMemo, useState } from 'react';
import { AgentToolConfigModal } from '@/app/workspace/[wid]/test-studio/test-suite-creation/components/agent-tool-configuration-modal';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { AgentToolType, ITestSuite, MockMode } from '../../data-generation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/atoms/accordion';
import { Badge, Button, Select, Switch, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import { Settings } from 'lucide-react';

type AgentToolConfigurationContainerProps = {
    tools: IAgentTool[];
    watch: UseFormWatch<ITestSuite>;
    setValue: UseFormSetValue<ITestSuite>;
    testCaseIndex: number;
    agentId: string;
    evaluationIndex: number;
    /** Ref populated with a commit function that flushes local toggle state to the form. Call it on Done. */
    onCommitRef?: React.MutableRefObject<(() => void) | null>;
};

export const AgentToolConfigurationContainer = (props: AgentToolConfigurationContainerProps) => {
    const { watch, setValue, testCaseIndex, agentId, evaluationIndex, onCommitRef } = props;
    const [tools, setTools] = useState<(IAgentTool & { mocked: boolean })[]>(
        props.tools.map(tool => ({ ...tool, mocked: false }))
    );
    const [toolConfigOpen, setToolConfigOpen] = useState(false);
    // Sync local tools state when props.tools changes
    // Also restore mocked state from toolOutputDefinitions (per test case per agent)
    const isToolMocked = (toolId: string): boolean => {
        const configs =
            watch(`testDataSets.${testCaseIndex}.agentEvaluations.${evaluationIndex}.toolMockSelections`) || [];
        const index = configs.findIndex(tool => tool.toolId === toolId);
        return index !== -1; // or index >= 0
    };

    useEffect(() => {
        setTools(
            props.tools.map(tool => ({
                ...tool,
                mocked: isToolMocked(tool.id), // Mark as mocked if there's a selected config for this test case and agent
            }))
        );
    }, [props.tools, watch, testCaseIndex, agentId]);

    const [configToolType, setConfigToolType] = useState<string | undefined>(undefined);
    const [configToolId, setConfigToolId] = useState<string>('');
    const [configScenarios, setConfigScenarios] = useState<{ id: string; name: string; config: string; mockMode:MockMode}[]>([]);
    const toolCountMap = useMemo(() => {
        return tools.reduce((map, tool) => {
            map.set(tool.type, (map.get(tool.type) || 0) + 1);
            return map;
        }, new Map<AgentToolType, number>());
    }, [tools]);
    const getMockConfigForAgent = (toolId: string) => {
        const conf = watch('toolMockConfigs');
        if (!conf) return [];
        const toolConf = conf?.find(tc => tc.id === toolId);
        if (!toolConf) return [];
        return toolConf.scenarios;
    };
    const getMockConfigOptions = (toolId: string) => {
        const scenarios = getMockConfigForAgent(toolId);
        return scenarios.map(s => ({ value: s.id, name: s.name }));
    };

    // Get selected mock config for a tool from toolOutputDefinitions (per test case per agent)
    const getSelectedMockConfig = (toolId: string) => {
        const configs =
            watch(`testDataSets.${testCaseIndex}.agentEvaluations.${evaluationIndex}.toolMockSelections`) || [];
        const toolConfig = configs.find(tool => tool.toolId === toolId);
        return toolConfig?.selectedScenarioId;
    };

    // Save selected mock config to toolOutputDefinitions (per test case per agent)
    const handleMockConfigChange = (toolId: string, toolName: string, mockConfigId: string) => {
        const configs = watch(`testDataSets.${testCaseIndex}.agentEvaluations.${evaluationIndex}.toolMockSelections`);
        const newConfigs = [...configs];
        const existingIndex = newConfigs.findIndex(tool => tool.toolId === toolId);
        if (existingIndex >= 0) {
            newConfigs[existingIndex] = { toolId: toolId, toolName, selectedScenarioId: mockConfigId };
        } else {
            newConfigs.push({ toolId: toolId, toolName, selectedScenarioId: mockConfigId });
        }
        setValue(`testDataSets.${testCaseIndex}.agentEvaluations.${evaluationIndex}.toolMockSelections`, newConfigs);
    };

    // Toggle only updates local UI state.
    // Entries are removed from toolMockSelections when the Done button commits via onCommitRef.
    const handleMockItem = (toolId: string, mocked: boolean) => {
        setTools(prevTools => prevTools.map(tool => (tool.id === toolId ? { ...tool, mocked: mocked } : tool)));
    };

    // Register a commit function on the ref so the parent can flush toggle state on Done.
    // Re-registers whenever tools change so the closure always captures the latest mocked flags.
    useEffect(() => {
        if (!onCommitRef) return;
        onCommitRef.current = () => {
            const configs =
                watch(`testDataSets.${testCaseIndex}.agentEvaluations.${evaluationIndex}.toolMockSelections`) ?? [];
            const unMockedIds = new Set(tools.filter(t => !t.mocked).map(t => t.id));
            if (unMockedIds.size === 0) return;
            setValue(
                `testDataSets.${testCaseIndex}.agentEvaluations.${evaluationIndex}.toolMockSelections`,
                configs.filter(c => !unMockedIds.has(c.toolId))
            );
        };
        return () => {
            onCommitRef.current = null;
        };
    }, [tools, onCommitRef, watch, setValue, testCaseIndex, evaluationIndex]);
    const getTagStyles = (type: AgentToolType) => {
        switch (type.toUpperCase()) {
            case 'MCP':
                return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700';
            case 'API':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700';
            default:
                return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600';
        }
    };

    const onConfigureTool = (type: AgentToolType, toolId: string) => {
        setConfigToolType(type);
        setConfigToolId(toolId);
        setConfigScenarios(getMockConfigForAgent(toolId));
        setToolConfigOpen(true);
    };
    const updateToolMockConfigs = (
        toolId: string,
        toolName: string,
        updatedScenarios: { id: string; name: string; config: string; mockMode:MockMode}[]
    ) => {
        const configs = watch('toolMockConfigs');

        if (configs) {
            for (const tool of configs) {
                if (tool.id === toolId) {
                    tool.scenarios = updatedScenarios;
                    tool.toolName = toolName;
                    setValue('toolMockConfigs', configs);
                    return;
                }
            }
            const newConfig = { id: toolId, toolName, mode: 'static', scenarios: updatedScenarios };
            setValue('toolMockConfigs', [...configs, newConfig]);
        }
    };

    return (
        <div className="w-full">
            <Accordion type="multiple">
                {Array.from(toolCountMap).map(([type, value]) => (
                    <AccordionItem
                        key={type}
                        value={type}
                        className="border border-blue-200 dark:border-blue-800 rounded-xl px-4 bg-gray-50 dark:bg-gray-800"
                    >
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 ">
                                <div className="flex items-center">
                                    <span
                                        className={`px-4 py-2 text-sm font-semibold rounded border ${getTagStyles(type)}`}
                                    >
                                        {type.toUpperCase()}
                                    </span>
                                </div>
                                <div className="h-9 w-px bg-gray-200 dark:bg-gray-600" />
                                <div className="flex items-center gap-3 bg-white dark:bg-gray-700 shadow-sm px-3 py-2 rounded">
                                    <span className="text-xs text-gray-400 font-medium">Available</span>
                                    <span className="text-xs font-medium text-blue-500 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded">
                                        {value || 0}
                                    </span>
                                </div>
                            </div>
                        </AccordionTrigger>

                        <AccordionContent forceMount>
                            <div className="flex flex-col gap-3 py-2">
                                {tools
                                    .filter(t => t.type.toUpperCase() == type.toUpperCase())
                                    .map(tool => (
                                        <div key={tool.id} className="relative group">
                                            <div className="flex justify-between cursor-pointer bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-600 p-3  rounded-md ">
                                                <div className="flex gap-1 col-span-3 items-center">
                                                    <Switch
                                                        id="chat-mode"
                                                        defaultChecked={true}
                                                        checked={tool.mocked}
                                                        onCheckedChange={checked => handleMockItem(tool.id, checked)}
                                                    />
                                                    <p className="w-full truncate">{tool.label}</p>
                                                    {tool.mocked && getSelectedMockConfig(tool.id) && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-[10px] font-medium h-6 ml-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-300 dark:border-green-700"
                                                        >
                                                            Mocked
                                                        </Badge>
                                                    )}
                                                </div>
                                                {tool.mocked && (
                                                    <div className="col-span-3 items-center">
                                                        <div className="flex gap-2 w-full gap-4">
                                                            <div className="flex col-span-5 items-center">
                                                                <Select
                                                                    placeholder="Select a mock response"
                                                                    disabled={!tool.mocked || getMockConfigOptions(tool.id).length===0}
                                                                    options={getMockConfigOptions(tool.id)??""}
                                                                    defaultValue={getSelectedMockConfig(tool.id)??""}
                                                                    currentValue={getSelectedMockConfig(tool.id)}
                                                                    onChange={e =>
                                                                        handleMockConfigChange(
                                                                            tool.id,
                                                                            tool.label,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="flex col-span-1 items-center justify-end">
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                className="w-full sm:w-max disabled:cursor-not-allowed"
                                                                                variant="link"
                                                                                size="icon"
                                                                                onClick={() =>
                                                                                    onConfigureTool(tool.type, tool.id)
                                                                                }
                                                                            >
                                                                                <span className="flex items-center gap-x-2">
                                                                                    <Settings size={18} />
                                                                                </span>
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top" align="center">
                                                                            Configure a new Scenario or manage existing
                                                                            ones
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <AgentToolConfigModal
                isOpen={toolConfigOpen}
                setIsOpen={setToolConfigOpen}
                watch={watch}
                tools={tools}
                toolType={configToolType}
                toolId={configToolId}
                configScenarios={configScenarios}
                updateToolMockConfigs={updateToolMockConfigs}
            />
        </div>
    );
};
