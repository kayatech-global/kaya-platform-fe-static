import type { Monaco } from '@monaco-editor/react';
import type * as monacoEditor from 'monaco-editor';

export function registerCustomSQLIntellisense(monaco: Monaco) {
    monaco.languages.registerCompletionItemProvider('custom-sql', {
        provideCompletionItems: (
            model: monacoEditor.editor.ITextModel,
            position: monacoEditor.Position
        ): monacoEditor.languages.ProviderResult<monacoEditor.languages.CompletionList> => {
            const wordInfo = model.getWordUntilPosition(position);
            const range: monacoEditor.IRange = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: wordInfo.startColumn,
                endColumn: wordInfo.endColumn,
            };

            const suggestions: monacoEditor.languages.CompletionItem[] = [
                {
                    label: 'SELECT',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'SELECT ',
                    detail: 'SQL keyword',
                    range,
                },
                {
                    label: 'FROM',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'FROM ',
                    detail: 'SQL keyword',
                    range,
                },
                {
                    label: 'WHERE',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'WHERE ',
                    detail: 'SQL keyword',
                    range,
                },
                {
                    label: 'INSERT',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'INSERT ',
                    detail: 'SQL keyword',
                    range,
                },
            ];

            return { suggestions };
        },
    });
}

export function registerPythonIntellisense(monaco: Monaco) {
    monaco.languages.registerCompletionItemProvider('custom-python', {
        provideCompletionItems: (
            model: monacoEditor.editor.ITextModel,
            position: monacoEditor.Position
        ): monacoEditor.languages.ProviderResult<monacoEditor.languages.CompletionList> => {
            const wordInfo = model.getWordUntilPosition(position);
            const range: monacoEditor.IRange = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: wordInfo.startColumn,
                endColumn: wordInfo.endColumn,
            };

            const suggestions: monacoEditor.languages.CompletionItem[] = [
                {
                    label: 'and',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'and ',
                    detail: 'Logical AND operator',
                    range,
                },
                {
                    label: 'or',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'or ',
                    detail: 'Logical OR operator',
                    range,
                },
                {
                    label: 'not',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'not ',
                    detail: 'Logical NOT operator',
                    range,
                },
            ];

            return { suggestions };
        },
    });
}
