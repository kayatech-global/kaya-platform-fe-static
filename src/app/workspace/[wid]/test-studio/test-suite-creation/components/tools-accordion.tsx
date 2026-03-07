'use client';
import { ReactNode, useMemo } from 'react';
import { IAgentTool } from './agent-configuration-step';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/atoms/accordion';
import { Badge, Checkbox } from '@/components';
import { AgentToolType } from '@/enums/test-studio-type';

type IToolsAccordionProps = {
    tools: IAgentTool[];
    selectedTools: IAgentTool[];
    setSelectedTools: React.Dispatch<React.SetStateAction<IAgentTool[]>>;
};

export const ToolsAccordion = (props: IToolsAccordionProps) => {
    const { tools, selectedTools, setSelectedTools } = props;

    const groupedTools = useMemo(() => {
        return tools.reduce((acc: Record<string, IAgentTool[]>, tool) => {
            acc[tool.type] = acc[tool.type] ? [...acc[tool.type], tool] : [tool];
            return acc;
        }, {});
    }, [tools]);

    const isSelected = (id: string) => selectedTools.some(t => t.id === id);

    const toggleChild = (tool: IAgentTool) => {
        setSelectedTools(prev => {
            if (isSelected(tool.id)) {
                return prev.filter(t => t.id !== tool.id);
            } else {
                return [...prev, tool];
            }
        });
    };

    const toggleParent = (type: string, checked: boolean) => {
        const items = groupedTools[type];

        setSelectedTools(prev => {
            if (!checked) {
                return prev.filter(t => t.type !== type);
            }
            const existingIds = new Set(prev.map(t => t.id));
            const newOnes = items.filter(item => !existingIds.has(item.id));
            return [...prev, ...newOnes];
        });
    };

    const getTitle = (type: AgentToolType): ReactNode => {
        switch (type) {
            case AgentToolType.Api:
                return 'API';
            case AgentToolType.Connectors:
                return 'Connectors';
            case AgentToolType.Guardrails:
                return 'Guardrails';
            case AgentToolType.KnowledgeBase:
                return 'Knowledge Base';
            case AgentToolType.Mcp:
                return 'MCP Servers';
            case AgentToolType.RAG:
                return 'RAGs';
            default:
                return '';
        }
    };

    return (
        <div className="space-y-4">
            <Accordion type="multiple">
                {Object.entries(groupedTools).map(([type, items]) => {
                    const allSelected = items.every(item => isSelected(item.id));

                    return (
                        <AccordionItem key={type} value={type} className="border rounded-xl px-4">
                            <AccordionTrigger>
                                <div className="w-full pr-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={allSelected}
                                            onCheckedChange={(checked: boolean) => toggleParent(type, checked)}
                                        />
                                        <span className="capitalize font-medium">
                                            {getTitle(type as AgentToolType)}
                                        </span>
                                    </div>

                                    <Badge variant={'info'} testStudio={true} className="h-5">
                                        {items?.length}
                                    </Badge>
                                </div>
                            </AccordionTrigger>

                            <AccordionContent forceMount>
                                <div className="flex flex-col gap-3 py-2">
                                    {items.map(tool => (
                                        <div key={tool.id} className="relative group">
                                            <label className="flex items-start gap-3 cursor-pointer bg-white border p-3 rounded-md">
                                                <Checkbox
                                                    className="mt-[5px]"
                                                    checked={isSelected(tool.id)}
                                                    onCheckedChange={() => toggleChild(tool)}
                                                />
                                                <div className="w-full overflow-hidden">
                                                    <p className="w-full truncate">{tool.label}</p>
                                                    <p className="w-full truncate text-gray-500 text-xs">
                                                        {tool?.description}
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
};
