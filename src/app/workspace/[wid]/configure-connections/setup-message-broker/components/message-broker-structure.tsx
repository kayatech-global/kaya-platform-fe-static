import { useCallback, useEffect, useState } from 'react';
import { MessageBrokerFormProps } from './message-broker-form';
import { Controller } from 'react-hook-form';
import { validateField } from '@/utils/validation';
import MonacoEditor from '../../../prompt-templates/components/monaco-editor';
import { MESSAGE_BROKER_TOPIC_CONTENT } from '@/constants';
import { validateJsonStructure } from '@/lib/utils';

interface MessageBrokerStructureProps extends MessageBrokerFormProps {
    index: number;
}

export const MessageBrokerStructure = (props: MessageBrokerStructureProps) => {
    const {
        index,
        isOpen,
        control,
        errors,
        intellisenseOptions,
        allIntellisenseValues,
        setValue,
        watch,
        trigger,
        refetchVariables,
    } = props;
    const [mounted, setMounted] = useState<boolean>(false);
    const [editorContent, setEditorContent] = useState<string>('');

    const wrapMatchingWords = useCallback((value: string): string => {
        if (!value) return value;

        const sortedWords = [...allIntellisenseValues].sort((a, b) => b.length - a.length);

        for (const word of sortedWords) {
            const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedWord}\\b`, 'g');
            value = value.replace(regex, `{{${word}}}`);
        }

        return value;
    }, [allIntellisenseValues]);

    const handleEditorContentChange = useCallback(async (value: string) => {
        const updatedValue = wrapMatchingWords(value);
        setValue(`configurations.topics.${index}.requestStructure`, updatedValue, { shouldTouch: true });
        await trigger(`configurations.topics.${index}.requestStructure`);
    }, [index, setValue, trigger, wrapMatchingWords]);

    useEffect(() => {
        if (!isOpen) {
            setMounted(false);
        }
    }, [isOpen]);

    const watchedRequestStructure = watch(`configurations.topics.${index}.requestStructure`);

    useEffect(() => {
        if (mounted) {
            (async () => {
                await handleEditorContentChange(editorContent);
            })();
        }
    }, [editorContent, handleEditorContentChange, mounted]);

    useEffect(() => {
        const initialContent = watchedRequestStructure || '';
        const formattedInitialContent = initialContent.replace(/{{|}}/g, '');
        setEditorContent(formattedInitialContent);

        setValue(`configurations.topics.${index}.requestStructure`, initialContent);
        setMounted(true);
    }, [index, setValue, watchedRequestStructure]);

    const handleEditorChange = (value: string) => {
        setEditorContent(value);
    };

    return (
        <>
            <Controller
                name={`configurations.topics.${index}.requestStructure`}
                control={control}
                defaultValue={editorContent}
                rules={{
                    required: validateField('Request structure', {
                        required: { value: true },
                    }).required,
                    validate: value => validateJsonStructure(value),
                }}
                render={({ field }) => (
                    <MonacoEditor
                        {...field}
                        value={editorContent}
                        hasEnhance={false}
                        onChange={handleEditorChange}
                        intellisenseData={intellisenseOptions ?? []}
                        enableCategoryIcon={true}
                        isDestructive={!!errors.configurations?.topics?.[index]?.requestStructure?.message}
                        onEnhanceClick={undefined}
                        placeholder={MESSAGE_BROKER_TOPIC_CONTENT.messageBrokerTopic.structurePlaceholder}
                        helperInfo={MESSAGE_BROKER_TOPIC_CONTENT.messageBrokerTopic.helperInfo}
                        onRefetchVariables={refetchVariables}
                        height="h-[430px]"
                        onBlur={() => trigger(`configurations.topics.${index}.requestStructure`)}
                    />
                )}
            />
            {errors.configurations?.topics?.[index]?.requestStructure?.message && (
                <span className="text-xs font-normal text-red-500 dark:text-red-500">
                    {errors.configurations?.topics?.[index]?.requestStructure?.message}
                </span>
            )}
        </>
    );
};
