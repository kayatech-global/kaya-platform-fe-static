import type * as monaco from 'monaco-editor';
import { registerSqlCompletions } from './registerSqlCompletions';

/**
 * Injects custom IntelliSense or language-specific configurations
 * into Monaco based on the selected language.
 *
 * This function can scale easily by adding new language handlers.
 */
export const injectLanguageIntellisense = (language: string, monacoInstance: typeof monaco) => {
    if (language === 'sql') {
        registerSqlCompletions(monacoInstance);
    }
    // Example: extend in future for json, html, etc.
};
