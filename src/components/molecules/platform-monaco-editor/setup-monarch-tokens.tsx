import type { Monaco } from '@monaco-editor/react';

interface PatternBundle {
    agentPatterns: string;
    apiPatterns: string;
    mcpPatterns: string;
    ragPatterns: string;
    graphRagPatterns: string;
    variablePatterns: string;
    metaDataPatterns: string;
    metaDataChildrenPatterns: string;
    attributePatterns: string;
}

/**
 * Full manual SQL syntax highlighting + custom tokens
 * Works for SELECT/select (case-insensitive)
 */
export function setupMonarchTokens(monaco: Monaco, patterns: PatternBundle) {
    const rootValue: [RegExp, string][] = [];
    const push = (r: string, t: string) => {
        if (r) rootValue.push([new RegExp(`\\b(${r})\\b`, 'gi'), t]);
    };

    // Custom tokens (yours)
    push(patterns.agentPatterns, 'agents-token');
    push(patterns.apiPatterns, 'apis-token');
    push(patterns.mcpPatterns, 'mcp-token');
    push(patterns.ragPatterns, 'vector-rag-token');
    push(patterns.graphRagPatterns, 'graph-rag-token');
    push(patterns.variablePatterns, 'variable-token');
    push(patterns.metaDataPatterns, 'metadata-token');
    push(patterns.metaDataChildrenPatterns, 'metadata-token');
    push(patterns.attributePatterns, 'attribute-token');

    // Register our own language
    monaco.languages.register({ id: 'custom-sql' });
    monaco.languages.register({ id: 'custom-python' });

    // Define a full token provider (Monarch syntax)
    monaco.languages.setMonarchTokensProvider('custom-sql', {
        defaultToken: '',
        ignoreCase: true,
        tokenizer: {
            root: [
                // SQL keywords (split to reduce regex alternation complexity)
                [/\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER)\b/, 'sql-keyword'],
                [/\b(GROUP|BY|ORDER|LIMIT|OFFSET|AS|INTO|VALUES|CREATE|TABLE)\b/, 'sql-keyword'],
                [/\b(ALTER|DROP|AND|OR|NOT|NULL|PRIMARY|KEY|FOREIGN|DISTINCT)\b/, 'sql-keyword'],
                [/\b(IN|IS|SET|HAVING)\b/, 'sql-keyword'],

                // --- Strings, numbers, comments ---
                [/'([^'\\]|\\.)*'/, 'sql-string'],
                [/\b\d+(\.\d+)?\b/, 'sql-number'],
                [/--+.*/, 'sql-comment'],
                [/\/\*/, { token: 'sql-comment', next: '@comment' }],

                // Platform intellisense tokens (must come before individual value patterns)
                [/\bAgent:[\w-]+\b/, 'agents-token'],
                [/\bAPI:[\w-]+\b/, 'apis-token'],
                [/\bMCP:[\w-]+\b/, 'mcp-token'],
                [/\bVectorRAG:[\w-]+\b/, 'vector-rag-token'],
                [/\bGraphRAG:[\w-]+\b/, 'graph-rag-token'],
                [/\bVariable:[\w-]+\b/, 'variable-token'],
                [/\bMetadata:[\w-]+\b/, 'metadata-token'],
                [/\bAttribute:[\w-]+\b/, 'attribute-token'],

                // Your custom tokens
                // [/@[a-zA-Z_]\w*/, 'variable-token'],
                // [/\{\{[^}]+\}\}/, 'variable-token'],

                ...rootValue,
            ],

            comment: [
                [/[^*/]+/, 'sql-comment'],
                [/\*\//, { token: 'sql-comment', next: '@pop' }],
                [/./, 'sql-comment'],
            ],
        },
    });
    monaco.languages.setMonarchTokensProvider('custom-python', {
        defaultToken: '',
        ignoreCase: true,
        tokenizer: {
            root: [
                // SQL keywords (no need for regex trickery now)
                [
                    /\b(or|and|not)\b/,
                    'python-keyword',
                ],

                // --- Strings, numbers, comments ---
                [/'([^'\\]|\\.)*'/, 'python-string'],
                [/\b\d+(\.\d+)?\b/, 'python-number'],
                [/#+.*/, 'python-comment'],

                // Platform intellisense tokens (must come before individual value patterns)
                [/\bAgent:[\w-]+\b/, 'agents-token'],
                [/\bAPI:[\w-]+\b/, 'apis-token'],
                [/\bMCP:[\w-]+\b/, 'mcp-token'],
                [/\bVectorRAG:[\w-]+\b/, 'vector-rag-token'],
                [/\bGraphRAG:[\w-]+\b/, 'graph-rag-token'],
                [/\bVariable:[\w-]+\b/, 'variable-token'],
                [/\bMetadata:[\w-]+\b/, 'metadata-token'],
                [/\bAttribute:[\w-]+\b/, 'attribute-token'],

                // Your custom tokens
                // [/@[a-zA-Z_]\w*/, 'variable-token'],
                // [/\{\{[^}]+\}\}/, 'variable-token'],

                ...rootValue,
            ],
        },
    })
}
