'use client';

import { IPromotedVariable, ISharedItem } from '@/models';
import { Category, Tool, Variable } from './use-condition-completion';
import { toFunctionName } from '@/lib/utils';
import { DataType } from '@/enums';

export type ToolType = 'API' | 'Variable' | 'Function' | 'Status';

const typeMapping = {
    string: '',
    int: 0,
    float: 0,
    bool: false,
    list: [],
    dict: {},
} as const;

const useToolParser = () => {
    // purpose: convert promotedVariables into variable list
    const parseVariables = (variable: IPromotedVariable[] | undefined, parent: string): Variable[] => {
        try {
            if (!variable || variable?.length === 0) return [];

            const typeMapper = (type: DataType) => {
                if (type === DataType.list || type === DataType.dict) {
                    return JSON.stringify(type ?? {});
                }
                return String(typeMapping[type]);
            };

            return variable.map(x => ({
                name: x?.name,
                parent,
                description: x?.description ?? '',
                type: x?.type ?? 'string',
                defaultValue: typeMapper(x?.type) ?? '',
            }));
        } catch (error) {
            console.error('Invalid payload JSON:', variable, error);
            return [];
        }
    };

    // purpose : converts tool to normalized Tool object with parsed variables
    const parseTool = (tool: ISharedItem, type: string): Tool | null => {
        const variables = parseVariables(tool.promotedVariables, tool.name);

        if (!tool.promotedVariables?.length) return null;

        return {
            name: toFunctionName(tool.name) ?? '',
            displayName: tool.name ?? '',
            type: type === 'APIs' ? 'API' : 'Variable',
            description: tool.description ?? '',
            variables,
        };
    };

    // purpose : flattens all variables from tools array into a single array (used when sending selected variables to backend)
    const transformToFlatVariables = (tools: ISharedItem[], variables: ISharedItem[]): Variable[] => {
        if (!Array.isArray(tools) && !Array.isArray(variables)) return [];
        const variableTools = parseVariables(variables as never, 'Variables');
        const safeTools = Array.isArray(tools) ? tools : [];
        const promotedVariables = safeTools.flatMap(tool => parseVariables(tool.promotedVariables, tool.name));

        return [...promotedVariables, ...variableTools];
    };

    const mergeItemsWithType = (tools: ISharedItem[], variables: ISharedItem[]) => {
        const toolsWithType = tools.map(item => ({
            ...item,
            type: 'APIs' as const,
        }));

        const variablesWithType = [
            {
                type: 'Variables' as const,
                id: '0001',
                name: 'Variable',
                description: 'Workflow variables',
                promotedVariables: variables,
            },
        ];

        return [...toolsWithType, ...variablesWithType];
    };

    // purpose : groups tools by type into a category structure (used to make autocomplete more data-driven)
    const transformToCategoryStructure = (tools: ISharedItem[], variables: ISharedItem[]): Category[] => {
        if (!Array.isArray(tools) || !Array.isArray(variables)) return [];

        const arr = mergeItemsWithType(tools, variables);
        const groupedTools = arr.reduce((acc, tool) => {
            if (!acc[tool.type]) {
                acc[tool.type] = [];
            }
            const formattedTool = parseTool(tool as never, tool.type);
            if (formattedTool) acc[tool.type].push(formattedTool);
            return acc;
        }, {} as Record<string, Tool[]>);

        return Object.entries(groupedTools)
            .filter(([tools]) => tools.length > 0)
            .map(([name, tools]) => ({
                name,
                tools,
            }));
    };

    return {
        parseVariables,
        parseTool,
        transformToFlatVariables,
        transformToCategoryStructure,
    };
};

export default useToolParser;
