import * as monaco from 'monaco-editor';

/**
 * Registers SQL keyword IntelliSense (no schema tables).
 */
export const registerSqlCompletions = (monacoInstance: typeof monaco) => {
    monacoInstance.languages.registerCompletionItemProvider('sql', {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
            };

            const keywords = [
                'SELECT',
                'FROM',
                'WHERE',
                'INSERT',
                'UPDATE',
                'DELETE',
                'JOIN',
                'LEFT JOIN',
                'RIGHT JOIN',
                'INNER JOIN',
                'OUTER JOIN',
                'GROUP BY',
                'ORDER BY',
                'HAVING',
                'LIMIT',
                'INTO',
                'VALUES',
                'SET',
                'CREATE',
                'ALTER',
                'DROP',
                'TABLE',
                'DATABASE',
                'AND',
                'OR',
                'NOT',
                'IN',
                'IS',
                'NULL',
                'AS',
                'ON',
                'DISTINCT',
                'UNION',
                'EXISTS',
                'BETWEEN',
                'LIKE',
            ];

            return {
                suggestions: keywords.map(keyword => ({
                    label: keyword,
                    kind: monacoInstance.languages.CompletionItemKind.Keyword,
                    insertText: keyword,
                    detail: 'SQL Keyword',
                    range,
                })),
            };
        },
    });
};
