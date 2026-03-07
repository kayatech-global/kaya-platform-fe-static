/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ReactNode, useMemo } from 'react';
import { Control, UseFormSetValue, UseFormTrigger, UseFormWatch } from 'react-hook-form';
import { DynamicObjectItem, Spinner } from '@/components';
import { AgentType } from '@/components/organisms/workflow-editor-form/agent-form';
import { isNullOrEmpty } from '@/lib/utils';
import { MESSAGE_BROKER_TOPIC_CONTENT } from '@/constants';
import { RequestStructure } from '@/app/editor/[wid]/[workflow_id]/components/message-broker/request-structure';

interface MetaDataEditorProps {
    isOpen: boolean;
    isFeedbackPublisher: boolean;
    isReadOnly?: boolean;
    agent?: AgentType;
    loadingIntellisense: boolean;
    control: Control<any, any>;
    intellisenseOptions: any;
    allIntellisenseValues: string[];
    structurePlaceholder?: string;
    helperInfo?: string;
    tooltip?: ReactNode;
    propertyName: string;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
    trigger: UseFormTrigger<any>;
    refetchVariables: () => Promise<void>;
}

export const MetaDataEditor = ({
    isOpen,
    isFeedbackPublisher,
    isReadOnly,
    agent,
    control,
    loadingIntellisense,
    intellisenseOptions,
    allIntellisenseValues,
    structurePlaceholder,
    helperInfo,
    tooltip,
    propertyName,
    setValue,
    watch,
    trigger,
    refetchVariables,
}: MetaDataEditorProps) => {
    const isValidEntry = useMemo(() => {
        return !isNullOrEmpty(watch(`${propertyName}`));
    }, [
        isFeedbackPublisher,
        propertyName,
        watch(`${propertyName}`),
        watch(`${propertyName}.topicId`),
        watch(`${propertyName}`),
        watch(`${propertyName}.topicId`),
    ]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-1 sm:col-span-2">
                <DynamicObjectItem
                    label="Metadata Filter Structure"
                    helperInfo={tooltip ?? MESSAGE_BROKER_TOPIC_CONTENT.messageBrokerTopic.tooltip}
                    helperInfoWidthClass="max-w-[350px]"
                >
                    {loadingIntellisense ? (
                        <div className="w-full h-full flex items-center justify-center min-h-[250px]">
                            <div className="flex flex-col items-center gap-y-2">
                                <Spinner />
                                <p className="text-md text-gray-700 font-normal dark:text-gray-200">
                                    {'Hold on, Request structure editor is getting ready...'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <RequestStructure
                            isOpen={isOpen}
                            control={control}
                            intellisenseOptions={intellisenseOptions}
                            allIntellisenseValues={allIntellisenseValues}
                            structurePlaceholder={structurePlaceholder}
                            helperInfo={helperInfo}
                            disabled={isReadOnly || agent?.isReusableAgentSelected || !isValidEntry}
                            keyName={propertyName}
                            propertyName="requestStructure"
                            setValue={setValue}
                            watch={watch}
                            trigger={trigger}
                            refetchVariables={refetchVariables}
                        />
                    )}
                </DynamicObjectItem>
            </div>
        </div>
    );
};
