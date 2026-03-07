/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCallback, useEffect, useState } from 'react';
import MonacoEditor from '@/app/workspace/[wid]/prompt-templates/components/monaco-editor';
import { validateField } from '@/utils/validation';
import { Control, useController, UseFormSetValue, UseFormTrigger, UseFormWatch } from 'react-hook-form';
import { MESSAGE_BROKER_TOPIC_CONTENT } from '@/constants';
import { validateJsonStructure } from '@/lib/utils';

interface RequestStructureProps {
    isOpen: boolean;
    control: Control<any>;
    intellisenseOptions: any;
    allIntellisenseValues: string[];
    keyName: string;
    propertyName: string;
    disabled?: boolean;
    structurePlaceholder?: string;
    helperInfo?: string;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
    trigger: UseFormTrigger<any>;
    refetchVariables: () => Promise<void>;
}

export const RequestStructure = (props: RequestStructureProps) => {
    const {
        isOpen,
        control,
        intellisenseOptions,
        allIntellisenseValues,
        keyName,
        propertyName,
        disabled,
        structurePlaceholder,
        helperInfo,
        setValue,
        watch,
        trigger,
        refetchVariables,
    } = props;
    const [mounted, setMounted] = useState<boolean>(false);
    const [editorContent, setEditorContent] = useState<string>('');

    const name = `${keyName}.${propertyName}`;

    const {
        field: { onChange, onBlur },
        fieldState: { error },
    } = useController({
        name,
        control,
        rules: {
            required: validateField('Request structure', {
                required: { value: true },
            }).required,
            validate: value => validateJsonStructure(value),
        },
        defaultValue: '',
    });

    const wrapMatchingWords = useCallback(
        (value: string): string => {
            if (!value) return value;

            const sortedWords = [...allIntellisenseValues].sort((a, b) => b.length - a.length);

            for (const word of sortedWords) {
                const escapedWord = word.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
                const regex = new RegExp(String.raw`\b${escapedWord}\b`, 'g');
                value = value.replace(regex, `{{${word}}}`);
            }

            return value;
        },
        [allIntellisenseValues]
    );

    const handleEditorContentChange = useCallback(
        async (value: string) => {
            const updatedValue = wrapMatchingWords(value);
            setValue(`${keyName}.${propertyName}`, updatedValue, { shouldTouch: true });
            await trigger(`${keyName}.${propertyName}`);
        },
        [keyName, propertyName, setValue, trigger, wrapMatchingWords]
    );

    useEffect(() => {
        if (!isOpen) {
            setMounted(false);
        }
    }, [isOpen]);

    const watchedFieldValue = watch(`${keyName}.${propertyName}`);

    useEffect(() => {
        if (mounted) {
            (async () => {
                await handleEditorContentChange(editorContent);
            })();
        }
    }, [editorContent, handleEditorContentChange, mounted]);

    useEffect(() => {
        const initialContent = watchedFieldValue || '';
        const formattedInitialContent = initialContent.replaceAll(/{{|}}/g, '');
        setEditorContent(formattedInitialContent);

        setValue(`${keyName}.${propertyName}`, initialContent);
        setMounted(true);
    }, [keyName, propertyName, setValue, watchedFieldValue]);

    const handleEditorChange = (value: string) => {
        setEditorContent(value);
    };

    return (
        <>
            <MonacoEditor
                value={editorContent}
                hasEnhance={false}
                disabled={disabled}
                onChange={val => {
                    handleEditorChange(val);
                    onChange(val);
                }}
                intellisenseData={intellisenseOptions ?? []}
                enableCategoryIcon={true}
                isDestructive={!!error?.message}
                onEnhanceClick={undefined}
                placeholder={
                    structurePlaceholder ?? MESSAGE_BROKER_TOPIC_CONTENT.messageBrokerTopic.structurePlaceholder
                }
                helperInfo={helperInfo ?? MESSAGE_BROKER_TOPIC_CONTENT.messageBrokerTopic.helperInfo}
                onRefetchVariables={refetchVariables}
                height="h-[250px]"
                onBlur={() => {
                    onBlur();
                    trigger(`${keyName}.${propertyName}`);
                }}
            />
            {error?.message && (
                <span className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">{error.message}</span>
            )}
        </>
    );
};
