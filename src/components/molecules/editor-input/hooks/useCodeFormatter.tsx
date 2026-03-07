// hooks/useCodeFormatter.ts
import { useCallback } from 'react';
import type * as monaco from 'monaco-editor';
import { formatCode } from '../formatCode';

export const useCodeFormatter = (
    editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>,
    language: string
) => {
    const handleFormat = useCallback(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const model = editor.getModel();
        if (!model) return;

        const code = model.getValue();
        const formatted = formatCode(language, code);

        if (!formatted) {
            console.warn(`No formatter available for language: ${language}`);
            return;
        }

        if (formatted !== code) {
            const range = model.getFullModelRange();
            const editOperations: monaco.editor.IIdentifiedSingleEditOperation[] = [
                {
                    range,
                    text: formatted,
                    forceMoveMarkers: true,
                },
            ];

            editor.executeEdits('manual-format', editOperations);
            editor.pushUndoStop();
        }
    }, [editorRef, language]);

    return { handleFormat };
};
