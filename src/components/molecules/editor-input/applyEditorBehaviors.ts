import type * as monaco from 'monaco-editor';
import { formatCode } from './formatCode';

/**
 * Applies editor behaviors like auto-formatting, auto-save, linting, etc.
 * Designed to be extensible and language-aware.
 */
export const applyEditorBehaviors = (
    editor: monaco.editor.IStandaloneCodeEditor,
    options?: { autoFormat?: boolean; language?: string }
) => {
    const { autoFormat = true, language } = options || {};

    if (autoFormat) {
        setTimeout(() => {
            const model = editor.getModel();
            if (!model) return;

            // Handle SQL separately (Monaco doesn't have built-in formatter for SQL)
            if (language === 'sql') {
                const code = model.getValue();
                const formatted = formatCode(language, code);

                if (formatted && formatted !== code) {
                    const range = model.getFullModelRange();
                    const editOperations: monaco.editor.IIdentifiedSingleEditOperation[] = [
                        {
                            range,
                            text: formatted,
                            forceMoveMarkers: true,
                        },
                    ];

                    editor.executeEdits('auto-format', editOperations);
                    editor.pushUndoStop();
                }
            } else {
                // Use Monaco’s built-in formatter for supported languages (JS, TS, JSON, etc.)
                editor.getAction('editor.action.formatDocument')?.run();
            }
        }, 300);
    }

    // Future behavior extensions (examples):
    // if (options.autoSave) setupAutoSave(editor);
    // if (options.autoLint) setupAutoLint(editor);
};
