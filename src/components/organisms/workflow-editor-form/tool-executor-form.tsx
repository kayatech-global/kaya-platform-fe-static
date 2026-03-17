/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
    Button,
    Input,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/atoms';
import { useDnD } from '@/context';
import { cn } from '@/lib/utils';
import { Node, useReactFlow } from '@xyflow/react';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { EditorPanelAgentProps } from '@/app/editor/[wid]/[workflow_id]/components/editor-panel';
import { PackagePlus, Boxes, FileJson, ChevronDown, Maximize2, Copy } from 'lucide-react';

// ============================================
// MOCK DATA - Replace with real API data later
// ============================================

interface MockInputConnect {
    id: string;
    name: string;
    type: 'API' | 'MCP' | 'Connector';
    description?: string;
}

const MOCK_INPUT_CONNECTS: MockInputConnect[] = [
    { id: 'api-1', name: 'order processor API', type: 'API', description: 'Processes customer orders' },
    { id: 'api-2', name: 'payment gateway API', type: 'API', description: 'Handles payment transactions' },
    { id: 'api-3', name: 'inventory service API', type: 'API', description: 'Checks stock availability' },
];

interface MockWorkflowVariable {
    id: string;
    name: string;
    source: string;
}

const MOCK_WORKFLOW_VARIABLES: MockWorkflowVariable[] = [
    { id: 'var1', name: 'order_summary', source: 'Agent: Order Analyzer' },
    { id: 'var2', name: 'order_status', source: 'Agent: Status Checker' },
    { id: 'var3', name: 'customer_id', source: 'Start Node' },
    { id: 'var4', name: 'product_list', source: 'Agent: Product Finder' },
];

// ============================================
// TYPE DEFINITIONS
// ============================================

interface APIConfig {
    id: string;
    name: string;
    requestBody: string;
    isExpanded: boolean;
}

export interface ToolExecutorConfig {
    name?: string;
    inputConnects?: MockInputConnect[];
    apis?: APIConfig[];
    lineageEnabled?: boolean;
    executionStatus?: 'idle' | 'running' | 'success' | 'error';
}

interface ToolExecutorFormProps extends EditorPanelAgentProps {
    selectedNode: Node;
    isReadOnly?: boolean;
}

// ============================================
// SUB-COMPONENTS
// ============================================

// JSON Editor with Variable Highlighting
const JsonEditorWithVariables: React.FC<{
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    onExpand?: () => void;
}> = ({ value, onChange, disabled, onExpand }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Sync scroll between textarea and overlay
    const handleScroll = () => {
        if (textareaRef.current && overlayRef.current) {
            overlayRef.current.scrollTop = textareaRef.current.scrollTop;
            overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    // Render highlighted content
    const renderHighlightedContent = () => {
        // Split by Variable: pattern and highlight
        const parts = value.split(/(Variable:\w+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('Variable:')) {
                return (
                    <span key={index} className="text-amber-500 font-medium">
                        {part}
                    </span>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className="relative border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
            {/* Overlay for syntax highlighting */}
            <div
                ref={overlayRef}
                className="absolute inset-0 p-3 font-mono text-sm whitespace-pre-wrap break-all overflow-hidden pointer-events-none text-gray-800 dark:text-gray-200"
                aria-hidden="true"
            >
                {renderHighlightedContent()}
            </div>

            {/* Actual textarea (transparent text) */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={handleScroll}
                disabled={disabled}
                className="w-full h-[200px] p-3 font-mono text-sm bg-transparent text-transparent caret-gray-800 dark:caret-gray-200 resize-none focus:outline-none focus:ring-0"
                placeholder={'{\n  "key": "value"\n}'}
                spellCheck={false}
            />

            {/* Expand button */}
            {onExpand && (
                <button
                    type="button"
                    onClick={onExpand}
                    className="absolute top-2 right-2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Expand editor"
                >
                    <Maximize2 size={14} className="text-gray-500" />
                </button>
            )}
        </div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const ToolExecutorForm = ({
    selectedNode,
    isReadOnly,
}: ToolExecutorFormProps) => {
    // Form state
    const [name, setName] = useState<string>('');
    const [inputConnects, setInputConnects] = useState<MockInputConnect[]>([]);
    const [apis, setApis] = useState<APIConfig[]>([
        {
            id: 'api-1',
            name: 'order processor API',
            requestBody: '{\n  "log_id": Variable:order_summary,\n  "status": Variable:order_status\n}',
            isExpanded: true,
        },
    ]);

    const [showInputConnectModal, setShowInputConnectModal] = useState(false);

    const { trigger, setSelectedNodeId, setTrigger } = useDnD();
    const { updateNodeData } = useReactFlow();

    // Load data from selected node
    useEffect(() => {
        const data = selectedNode.data as ToolExecutorConfig;

        setName((data?.name as string) ?? '');
        setInputConnects((data?.inputConnects as MockInputConnect[]) ?? []);

        if (data?.apis && Array.isArray(data.apis)) {
            setApis(data.apis as APIConfig[]);
        }
    }, [selectedNode]);

    // Handle save
    const handleSaveNodeData = async () => {
        updateNodeData(selectedNode.id, {
            name,
            inputConnects,
            apis,
            lineageEnabled: true,
        });

        toast.success('Tool Executor updated successfully');

        Promise.resolve().then(() => {
            setTrigger((trigger ?? 0) + 1);
        });
    };

    // Update API config
    const updateApiConfig = useCallback((apiId: string, updates: Partial<APIConfig>) => {
        setApis((prev) =>
            prev.map((api) => (api.id === apiId ? { ...api, ...updates } : api))
        );
    }, []);

    // Toggle API expansion
    const toggleApiExpansion = useCallback((apiId: string) => {
        setApis((prev) =>
            prev.map((api) =>
                api.id === apiId ? { ...api, isExpanded: !api.isExpanded } : api
            )
        );
    }, []);

    // Insert variable at cursor
    const insertVariable = useCallback((apiId: string, variableName: string) => {
        setApis((prev) =>
            prev.map((api) => {
                if (api.id === apiId) {
                    return {
                        ...api,
                        requestBody: api.requestBody + `Variable:${variableName}`,
                    };
                }
                return api;
            })
        );
    }, []);

    // Copy variable reference
    const copyVariableRef = (variableName: string) => {
        navigator.clipboard.writeText(`Variable:${variableName}`);
        toast.success('Variable reference copied');
    };

    const totalInputConnects = inputConnects.length;

    return (
        <>
            <div className="flex flex-col h-[calc(100vh-300px)]">
                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    {/* Name Input */}
                    <div className="flex flex-col gap-y-2">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            label="Name"
                            placeholder="Enter tool executor name"
                            disabled={isReadOnly}
                        />
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-gray-300 dark:border-gray-600" />

                    {/* Input Data Connect Section */}
                    <div className="flex flex-col gap-y-3">
                        <div className="flex items-center gap-x-[10px]">
                            <PackagePlus size={20} absoluteStrokeWidth={false} className="stroke-[2px] text-gray-700 dark:text-gray-300" />
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Input Data Connect</p>
                        </div>
                        <p className="text-xs font-normal text-gray-400">
                            Select Input Data Connects that required for this agent to run efficiently.
                        </p>

                        {/* Change Input Data Connects button */}
                        <div className="w-full flex justify-center mt-2 gap-x-3">
                            <Boxes size={20} absoluteStrokeWidth={false} className="stroke-[1px] text-gray-500" />
                            <Button
                                variant="link"
                                onClick={() => setShowInputConnectModal(true)}
                                className="text-blue-600 dark:text-blue-400 p-0 h-auto"
                            >
                                Change Input Data Connects
                            </Button>
                        </div>

                        {/* Input Data Connects Accordion */}
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem
                                value="input-data-connect"
                                className="border border-gray-300 dark:border-gray-600 rounded-md bg-muted/40 overflow-hidden"
                            >
                                <AccordionTrigger className="px-3 py-2 no-underline hover:no-underline">
                                    <div className="flex items-center w-full">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                            Input data connects attached
                                        </p>
                                        {totalInputConnects > 0 && (
                                            <span className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-semibold">
                                                {totalInputConnects}
                                            </span>
                                        )}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="bg-gray-50 dark:bg-gray-900 py-3 px-3">
                                    {inputConnects.length > 0 ? (
                                        <div className="space-y-2">
                                            {inputConnects.map((connect) => (
                                                <div
                                                    key={connect.id}
                                                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-medium">
                                                            {connect.type}
                                                        </span>
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                                            {connect.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                                            No input connects attached
                                        </p>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-gray-300 dark:border-gray-600" />

                    {/* Input Request Structure Section */}
                    <div className="flex flex-col gap-y-3">
                        <div className="flex items-center gap-x-[10px]">
                            <FileJson size={20} absoluteStrokeWidth={false} className="stroke-[2px] text-gray-700 dark:text-gray-300" />
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Input Request Structure</p>
                        </div>
                        <p className="text-xs font-normal text-gray-400">
                            {'JSON mirroring previous node output. Type @ to insert variables. Saved as {{Variable:name}}.'}
                        </p>

                        {/* Available Variables */}
                        <div className="flex flex-wrap gap-2 mt-1">
                            {MOCK_WORKFLOW_VARIABLES.map((variable) => (
                                <TooltipProvider key={variable.id}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                onClick={() => copyVariableRef(variable.name)}
                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded border border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                                            >
                                                <span>{variable.name}</span>
                                                <Copy size={10} />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <p className="text-xs">Source: {variable.source}</p>
                                            <p className="text-xs text-gray-400">Click to copy</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>

                        {/* API Configurations */}
                        <div className="space-y-3 mt-2">
                            {apis.map((api, index) => (
                                <div
                                    key={api.id}
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
                                >
                                    {/* API Header */}
                                    <button
                                        type="button"
                                        onClick={() => toggleApiExpansion(api.id)}
                                        className="w-full flex items-center justify-between px-3 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChevronDown
                                                size={16}
                                                className={cn(
                                                    'text-gray-500 transition-transform',
                                                    api.isExpanded && 'rotate-180'
                                                )}
                                            />
                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-medium text-gray-600 dark:text-gray-300">
                                                API {index + 1}
                                            </span>
                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                {api.name}
                                            </span>
                                        </div>
                                        <Maximize2 size={14} className="text-gray-400" />
                                    </button>

                                    {/* API Content */}
                                    {api.isExpanded && (
                                        <div className="px-3 pb-3">
                                            <JsonEditorWithVariables
                                                value={api.requestBody}
                                                onChange={(value) => updateApiConfig(api.id, { requestBody: value })}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Divider above footer */}
                <div className="border-t border-dashed border-gray-300 dark:border-gray-600 mt-4" />

                {/* Footer */}
                <div className={cn('flex gap-x-3 justify-end pt-4 pb-4')}>
                    <Button
                        variant="secondary"
                        onClick={() => setSelectedNodeId(undefined)}
                        disabled={isReadOnly}
                    >
                        Cancel
                    </Button>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="primary"
                                    onClick={handleSaveNodeData}
                                    disabled={isReadOnly}
                                >
                                    Save
                                </Button>
                            </TooltipTrigger>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Input Connect Modal (simplified placeholder) */}
            {showInputConnectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[500px] max-h-[80vh] overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold">Select Input Data Connects</h3>
                        </div>
                        <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                            {MOCK_INPUT_CONNECTS.map((connect) => {
                                const isSelected = inputConnects.some((c) => c.id === connect.id);
                                return (
                                    <button
                                        key={connect.id}
                                        type="button"
                                        onClick={() => {
                                            if (isSelected) {
                                                setInputConnects((prev) => prev.filter((c) => c.id !== connect.id));
                                            } else {
                                                setInputConnects((prev) => [...prev, connect]);
                                            }
                                        }}
                                        className={cn(
                                            'w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left',
                                            isSelected
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                                        )}
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                {connect.name}
                                            </p>
                                            {connect.description && (
                                                <p className="text-xs text-gray-500 mt-0.5">{connect.description}</p>
                                            )}
                                        </div>
                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                            {connect.type}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setShowInputConnectModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={() => setShowInputConnectModal(false)}>
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
