'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/atoms/tabs';
import { cn } from '@/lib/utils';
import { Copy, Check, Code2 } from 'lucide-react';
import { CodeSnippet, CodeLanguage } from '../types';

interface CodeSnippetPanelProps {
    snippets: Record<string, CodeSnippet>;
    selectedLanguage: CodeLanguage;
    onLanguageChange: (language: CodeLanguage) => void;
}

export const CodeSnippetPanel = ({
    snippets,
    selectedLanguage,
    onLanguageChange,
}: CodeSnippetPanelProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const code = snippets[selectedLanguage]?.code;
        if (code) {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-[20px] border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-x-2">
                    <Code2 size={18} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        SDK Integration
                    </span>
                </div>
                <Tabs
                    value={selectedLanguage}
                    onValueChange={(v) => onLanguageChange(v as CodeLanguage)}
                >
                    <TabsList className="h-8 bg-gray-200 dark:bg-gray-700">
                        <TabsTrigger value="python" className="text-xs h-6 px-3">
                            Python SDK
                        </TabsTrigger>
                        <TabsTrigger value="javascript" className="text-xs h-6 px-3">
                            JavaScript
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Code Block */}
            <div className="relative">
                <pre className="p-5 bg-gray-900 text-sm font-mono overflow-x-auto max-h-[200px]">
                    <code className="text-gray-300">
                        {highlightCode(snippets[selectedLanguage]?.code || '', selectedLanguage)}
                    </code>
                </pre>

                {/* Copy Button */}
                <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-3 right-3 h-8"
                    onClick={handleCopy}
                    leadingIcon={copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                >
                    {copied ? 'Copied' : 'Copy'}
                </Button>
            </div>
        </div>
    );
};

// Simple syntax highlighting
const highlightCode = (code: string, language: CodeLanguage): React.ReactNode => {
    if (!code) return null;

    const keywords = language === 'python'
        ? ['from', 'import', 'for', 'in', 'async', 'await', 'def', 'class', 'if', 'else', 'return', 'True', 'False', 'None']
        : ['import', 'from', 'const', 'let', 'var', 'async', 'await', 'for', 'of', 'function', 'if', 'else', 'return', 'true', 'false', 'null'];

    const lines = code.split('\n');

    return lines.map((line, i) => (
        <div key={i}>
            {line.split(/(\s+|[()[\]{},;:'"=])/g).map((token, j) => {
                // Comments
                if (token.startsWith('#') || token.startsWith('//')) {
                    return <span key={j} className="text-gray-500">{token}</span>;
                }
                // Strings
                if (token.startsWith('"') || token.startsWith("'")) {
                    return <span key={j} className="text-green-400">{token}</span>;
                }
                // Keywords
                if (keywords.includes(token)) {
                    return <span key={j} className="text-blue-400">{token}</span>;
                }
                // Functions/methods
                if (token.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) && lines[i].includes(token + '(')) {
                    return <span key={j} className="text-amber-400">{token}</span>;
                }
                return <span key={j}>{token}</span>;
            })}
        </div>
    ));
};
