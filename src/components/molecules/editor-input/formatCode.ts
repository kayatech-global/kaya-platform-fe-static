import { format as formatSql } from 'sql-formatter';

/**
 * Formats code content based on the language.
 * Extendable for multi-language support.
 */
export const formatCode = (language: string, code: string): string => {
    if (language === 'sql') {
        try {
            return formatSql(code, {
                language: 'sql', // You can also use 'mysql', 'postgresql', etc.
                keywordCase: 'upper', // 'upper' | 'lower' | 'preserve'
                tabWidth: 2, // replaces 'indent'
                indentStyle: 'standard', // 'standard' | 'tabularLeft' | 'tabularRight'
            });
        } catch (err) {
            console.warn('SQL format error:', err);
            return code; // fallback to original if something breaks
        }
    }
    return code;
};
