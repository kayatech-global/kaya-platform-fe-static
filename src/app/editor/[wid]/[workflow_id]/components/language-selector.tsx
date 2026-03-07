'use client';

import { Button } from '@/components';
import { DetailItemInput, valuesProps } from '@/components/molecules/detail-item-input/detail-item-input';
import { AgentType, IntelligenceSourceModel } from '@/components/organisms';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import { IntelligenceSourceType } from '@/enums';
import React, { useState } from 'react';
import { LanguageSelectorDialog } from './language-selector-dialog';

export type LanguageModel = {
    id: string;
    modelId: string;
    modelName: string;
    modelDescription: string;
};

export type LanguageProvider = {
    id: string;
    providerName: string;
    providerLogoPath: string;
    models: LanguageModel[];
};

export interface IModel {
    id: string;
    name: string;
    modelName: string;
    provider: string;
    description: string;
    voice: string;
    language: string;
    configurations: {
        providerConfig: {
            id: string;
            logo: {
                '16': string;
                '32': string;
                '48': string;
            };
            value: string;
            description: string;
        };
        temperature: number;
        voice: string;
        tone: string;
        language: string;
        apiAuthorization: string;
        customerHeaders: [];
        baseUrl: string;
        customRuntime?: boolean;
        description: string;
        accessKey?: string;
        secretKey?: string;
        region?: string;
        timeout?: number;
        useIamRole?: boolean;
        authType?: string;
        tokenLimit: number | null;
        maxTokens: number | null;
    };
    isReadOnly?: boolean;
}

interface LanguageSelectorProps {
    agent: AgentType | VoiceAgent | undefined;
    isSlm: boolean | undefined;
    languageModel: IntelligenceSourceModel | undefined;
    setLanguageModel: React.Dispatch<React.SetStateAction<IntelligenceSourceModel | undefined>>;
    allModels: IModel[];
    allSLMModels: IModel[];
    allSTSModels: IModel[];
    llmModelsLoading?: boolean;
    slmModelsLoading?: boolean;
    stsModelsLoading?: boolean;
    onRefetch: () => void;
    onLanguageModelChange?: (model: IntelligenceSourceModel | undefined) => void;
    onIntelligenceSourceChange: (value: boolean) => void;
    label?: string;
    disabledSourceTypes?: IntelligenceSourceType[];
    labelClassName?: string;
    description?: string;
    onModalChange?: (open: boolean) => void;
    hideDescription?: boolean;
    visibleSourceTypes?: IntelligenceSourceType[];
    isReadonly?: boolean;
}

export const LanguageSelector = ({
    agent,
    isSlm = false,
    languageModel,
    setLanguageModel,
    allModels,
    allSLMModels,
    allSTSModels,
    llmModelsLoading,
    slmModelsLoading,
    stsModelsLoading,
    onRefetch,
    onLanguageModelChange,
    onIntelligenceSourceChange,
    label,
    labelClassName,
    description,
    disabledSourceTypes = [],
    onModalChange,
    hideDescription = false,
    visibleSourceTypes = [IntelligenceSourceType.LLM, IntelligenceSourceType.SLM, IntelligenceSourceType.STS],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isReadonly = false,
}: LanguageSelectorProps) => {
    const [openModal, setOpenModal] = useState(false);

    const handleRemove = () => {
        setLanguageModel(undefined);
        if (onLanguageModelChange) {
            onLanguageModelChange(undefined);
        }
        if (onModalChange) {
            onModalChange(openModal);
        }
    };

    const getModelFromReusableAgent = () => {
        if (!agent && !languageModel) {
            return undefined;
        }

        const value: valuesProps[] = [];

        if (agent && 'isReusableAgentSelected' in agent && agent?.isReusableAgentSelected) {
            if (!agent.languageModal) return;
            value.push({
                title: agent.languageModal.modelName,
                description: `${agent.languageModal.modelDescription?.slice(0, 72)}${
                    agent?.languageModal?.modelDescription?.length > 72 ? '...' : ''
                }`,
                imagePath: agent.languageModal.providerLogo,
            });
        } else if (languageModel) {
            value.push({
                title: languageModel.modelName,
                description: (() => {
                    const desc = languageModel?.modelDescription;
                    if (!desc) return '-';
                    return `${desc.slice(0, 72)}${desc.length > 72 ? '...' : ''}`;
                })(),
                imagePath: languageModel.providerLogo,
            });
        }

        return value.length > 0 ? value : undefined;
    };

    const handleChange = () => {
        setOpenModal(true);
    };

    return (
        <>
            <DetailItemInput
                label={label ?? 'Intelligence Source'}
                labelClassName={labelClassName}
                values={getModelFromReusableAgent()}
                imagePath="/png/empty_selection.png"
                imageType="svg"
                imageWidth="100"
                description={
                    description ??
                    "No intelligence source has been selected. Please use 'Add an Intelligence Source' to enable the agent's responses."
                }
                hideDescription={hideDescription}
                footer={
                    languageModel && !agent?.isReusableAgentSelected ? (
                        <div className=" w-full flex justify-start items-center gap-x-3">
                            <Button variant="link" className="text-blue-400" onClick={handleChange}>
                                Change
                            </Button>
                            <Button variant="link" className="text-red-500 hover:text-red-400" onClick={handleRemove}>
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <>
                            {!languageModel && !agent && (
                                <Button variant="link" onClick={() => setOpenModal(true)}>
                                    {visibleSourceTypes.length === 1 &&
                                    visibleSourceTypes[0] === IntelligenceSourceType.LLM
                                        ? 'Add a LLM'
                                        : 'Add an Intelligence Source'}
                                </Button>
                            )}
                        </>
                    )
                }
            />
            <LanguageSelectorDialog
                open={openModal}
                onOpenChange={open => {
                    setOpenModal(open);
                    if (onModalChange) onModalChange(open);
                }}
                languageModel={languageModel}
                setLanguageModel={setLanguageModel}
                allModels={allModels}
                allSLMModels={allSLMModels}
                allSTSModels={allSTSModels}
                llmModelsLoading={llmModelsLoading}
                slmModelsLoading={slmModelsLoading}
                stsModelsLoading={stsModelsLoading}
                onRefetch={onRefetch}
                onLanguageModelChange={onLanguageModelChange}
                onIntelligenceSourceChange={onIntelligenceSourceChange}
                disabledSourceTypes={disabledSourceTypes}
                visibleSourceTypes={visibleSourceTypes}
                isSlm={isSlm}
            />
        </>
    );
};
