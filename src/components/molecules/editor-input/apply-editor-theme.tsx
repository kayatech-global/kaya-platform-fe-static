import type { Monaco } from '@monaco-editor/react';

export function applyEditorTheme(monaco: Monaco, theme: string) {
    monaco.editor.defineTheme('customTheme', {
        base: theme === 'light' ? 'vs' : 'vs-dark',
        inherit: true,
        rules: [
            // SQL manual color coding
            { token: 'sql-keyword', foreground: '569CD6', fontStyle: 'bold' },
            { token: 'sql-string', foreground: 'CE9178' },
            { token: 'sql-number', foreground: 'B5CEA8' },
            { token: 'sql-comment', foreground: '6A9955', fontStyle: 'italic' },

            //Your custom tokens
            { token: 'agents-token', foreground: '0066cc', fontStyle: 'bold' },
            { token: 'apis-token', foreground: '22863a', fontStyle: 'bold' },
            { token: 'mcp-token', foreground: '22863a', fontStyle: 'bold' },
            { token: 'vector-rag-token', foreground: '3abff8', fontStyle: 'bold' },
            { token: 'graph-rag-token', foreground: '0da2e7', fontStyle: 'bold' },
            { token: 'variable-token', foreground: 'f59f0a', fontStyle: 'bold' },
            { token: 'metadata-token', foreground: '3b7af7', fontStyle: 'bold' },
            { token: 'attribute-token', foreground: '22863a', fontStyle: 'bold' },
        ],
        colors: {
            'editor.background': theme === 'light' ? '#ffffff' : '#384151',
            'editor.foreground': theme === 'light' ? '#111827' : '#dcdcdc',
            'editorCursor.foreground': theme === 'light' ? '#111827' : '#dcdcdc',
            'editor.selectionBackground': theme === 'light' ? '#c9e4ff' : '#203041',
            'editor.inactiveSelectionBackground': theme === 'light' ? '#ffffff' : '#384151',
        },
    });

    monaco.editor.setTheme('customTheme');
}
