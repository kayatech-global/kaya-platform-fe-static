'use client';
import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/atoms/checkbox';
import { Input } from '@/components/atoms';

interface Header {
    key: string;
    value: string;
}

export interface TranscriptExportProps {
    defaultEnabled?: boolean;
    initialHeaders?: Header[];
    initialWebhookUrl?: string;
    isReadonly?: boolean;
    onChange?: (enabled: boolean, headers: Header[], webhookUrl: string) => void;
}

export const TranscriptExport = ({
    defaultEnabled = false,
    initialHeaders = [{ key: '', value: '' }],
    initialWebhookUrl = '',
    isReadonly = false,
    onChange,
}: TranscriptExportProps) => {
    const [enabled, setEnabled] = useState(defaultEnabled);
    const [headers, setHeaders] = useState<Header[]>(initialHeaders);
    const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl);

    useEffect(() => {
        setEnabled(defaultEnabled);
        setHeaders(initialHeaders);
        setWebhookUrl(initialWebhookUrl);
    }, [defaultEnabled, initialHeaders, initialWebhookUrl]);

    const handleHeaderChange = (index: number, field: keyof Header, value: string) => {
        const newHeaders = [...headers];
        newHeaders[index][field] = value;
        setHeaders(newHeaders);
        onChange?.(enabled, newHeaders, webhookUrl);
    };

    const handleWebhookUrlChange = (value: string) => {
        setWebhookUrl(value);
        onChange?.(enabled, headers, value);
    };

    const addHeader = () => {
        const updated = [...headers, { key: '', value: '' }];
        setHeaders(updated);
        onChange?.(enabled, updated, webhookUrl);
    };

    const removeHeader = (index: number) => {
        const updated = [...headers];
        updated.splice(index, 1);
        setHeaders(updated);
        onChange?.(enabled, updated, webhookUrl);
    };

    const handleToggle = (checked: boolean) => {
        setEnabled(checked);
        onChange?.(checked, headers, webhookUrl);
    };

    return (
        <div className="rounded-md w-full max-w-md space-y-4">
            <label className="flex items-center space-x-2 font-medium">
                <Checkbox checked={enabled} onCheckedChange={handleToggle} disabled={isReadonly} />
                <span className="text-sm text-gray-700 dark:text-gray-300">Transcript Export</span>
            </label>

            {enabled && (
                <div className="space-y-4">
                    <Input
                        type="text"
                        placeholder="Webhook URL"
                        value={webhookUrl}
                        onChange={e => handleWebhookUrlChange(e.target.value)}
                        disabled={isReadonly}
                    />

                    {headers.map((header, index) => (
                        <div key={`header-${index}`} className="flex items-center space-x-2">
                            <Input
                                type="text"
                                placeholder="Key"
                                value={header.key}
                                onChange={e => handleHeaderChange(index, 'key', e.target.value)}
                                disabled={isReadonly}
                            />
                            <Input
                                type="text"
                                placeholder="Value"
                                value={header.value}
                                onChange={e => handleHeaderChange(index, 'value', e.target.value)}
                                disabled={isReadonly}
                            />
                            {!isReadonly && (
                                <button
                                    onClick={() => removeHeader(index)}
                                    className="text-gray-300 hover:text-red-500"
                                    type="button"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}

                    {!isReadonly && (
                        <button
                            onClick={addHeader}
                            className="text-blue-400 text-sm font-medium hover:underline"
                            type="button"
                        >
                            + Add Header
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
