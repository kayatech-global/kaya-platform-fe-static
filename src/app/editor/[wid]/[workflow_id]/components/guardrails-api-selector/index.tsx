'use client';
import { Button } from '@/components';
import { DetailItemInput, valuesProps } from '@/components/molecules/detail-item-input/detail-item-input';
import React, { useState } from 'react';
import { GuardrailsSelectionDialog } from './guardrails-selection-dialog';
import { GuardrailsAPISelectorProps } from './types';

export const GuardrailsAPISelector = ({
    guardrailsApis,
    apiLoading,
    setGuardrailsApis,
    agent,
    allGuardrailsApiTools,
    onRefetch,
    onGuardrailsApiChange,
    label,
    labelClassName,
    isMultiple = false,
    description,
    isSelfLearning,
}: GuardrailsAPISelectorProps) => {
    const [openModal, setOpenModal] = useState(false);

    const handleRemove = () => {
        setGuardrailsApis(undefined);
        if (onGuardrailsApiChange) {
            onGuardrailsApiChange(undefined);
        }
    };

    const getModelFromReusableAgent = () => {
        if (!agent && !guardrailsApis) {
            return undefined;
        }

        let value: valuesProps[] = [];

        if (agent && 'isReusableAgentSelected' in agent && agent?.isReusableAgentSelected) {
            let guardrailsApiListFromReusableAgent = agent.guardrailsApis?.map(guardrailsApi => {
                return {
                    title: guardrailsApi.name,
                    description: `${guardrailsApi.description?.slice(0, 65)}...`,
                    imagePath: '/png/api.png',
                };
            });
            if (isSelfLearning) {
                guardrailsApiListFromReusableAgent = allGuardrailsApiTools
                    ?.filter(x => agent?.selfLearning?.feedbackRequestIntegration?.id == x.id)
                    .map(guardrailsApi => {
                        return {
                            title: guardrailsApi.name,
                            description: `${guardrailsApi.description?.slice(0, 65)}...`,
                            imagePath: '/png/api.png',
                        };
                    });
            }
            value = [...(guardrailsApiListFromReusableAgent ?? [])];
        } else if (guardrailsApis) {
            const selectedGuardrailsAPIs = guardrailsApis?.map(guardrailsApi => {
                return {
                    title: guardrailsApi.name,
                    description: `${guardrailsApi.description?.slice(0, 65)}...`,
                    imagePath: '/png/api.png',
                };
            });

            value = [...selectedGuardrailsAPIs];
        }

        return value.length > 0 ? value : undefined;
    };

    const handleChange = () => {
        setOpenModal(true);
    };

    return (
        <>
            <DetailItemInput
                label={label ?? 'API'}
                labelClassName={labelClassName}
                values={getModelFromReusableAgent()}
                imagePath="/png/api.png"
                imageType="png"
                description={
                    description ?? 'Select the Guardrails APIs for efficient agent performance and task handling'
                }
                footer={
                    guardrailsApis?.length && !agent?.isReusableAgentSelected ? (
                        <div className=" w-full flex justify-start items-center gap-x-3">
                            <Button variant="link" className="text-blue-400" onClick={handleChange}>
                                Change
                            </Button>
                            <Button variant="link" className="text-red-500 hover:text-red-400" onClick={handleRemove}>
                                {isMultiple ? 'Remove all' : 'Remove'}
                            </Button>
                        </div>
                    ) : (
                        <>
                            {!guardrailsApis?.length && !agent && (
                                <Button variant="link" onClick={() => setOpenModal(true)}>
                                    {isMultiple ? 'Add APIs' : 'Add an API'}
                                </Button>
                            )}
                        </>
                    )
                }
            />
            <GuardrailsSelectionDialog
                openModal={openModal}
                setOpenModal={setOpenModal}
                guardrailsApis={guardrailsApis}
                allGuardrailsApiTools={allGuardrailsApiTools}
                setGuardrailsApis={setGuardrailsApis}
                onGuardrailsApiChange={onGuardrailsApiChange}
                onRefetch={onRefetch}
                apiLoading={apiLoading}
                isMultiple={isMultiple}
            />
        </>
    );
};
