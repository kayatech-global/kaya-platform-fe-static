import { IntellisenseCategory } from '@/app/workspace/[wid]/prompt-templates/components/monaco-editor';
import { useMemo } from 'react';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const collectLeafValues = (nodes: any[] = []): string[] =>
    nodes.flatMap(node => (node.children?.length ? collectLeafValues(node.children) : [escapeRegex(node.value)]));

export function usePlatformIntellisense(intellisenseData: IntellisenseCategory[]) {
    return useMemo(() => {
        const get = (name: string) =>
            intellisenseData
                .find(cat => cat.name === name)
                ?.options.map(opt => escapeRegex(opt.value))
                .join('|') ?? '';

        const variablePatterns =
            intellisenseData
                .find(cat => cat.name === 'Variables')
                ?.options.map(o => escapeRegex(o.value))
                .join('|') ?? '';

        const metaDataPatterns =
            intellisenseData
                .find(cat => cat.name === 'Metadata' && cat.options?.some(x => x?.children))
                ?.options?.filter(x => !x.children)
                .map(opt => escapeRegex(opt.value))
                .join('|') ?? '';

        const metaDataChildrenPatterns =
            intellisenseData
                .find(cat => cat.name === 'Metadata')
                ?.options.filter(x => x.children)
                .flatMap(opt => collectLeafValues([opt]))
                .join('|') ?? '';

        return {
            agentPatterns: get('Agents'),
            apiPatterns: get('APIs'),
            mcpPatterns: get('MCPs'),
            ragPatterns: get('Vector RAGs'),
            graphRagPatterns: get('Graph RAGs'),
            attributePatterns:get('Attributes'),
            variablePatterns,
            metaDataPatterns,
            metaDataChildrenPatterns,
        };
    }, [intellisenseData]);
}
