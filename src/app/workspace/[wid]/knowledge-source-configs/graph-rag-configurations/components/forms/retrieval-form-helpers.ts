/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UseFormSetValue, UseFormTrigger } from 'react-hook-form';
import type { IntelligenceSourceModel, Prompt } from '@/components/organisms';

export function toLanguageModelState(llm: any): IntelligenceSourceModel {
    return {
        id: llm?.provider ?? '',
        provider: llm?.provider ?? '',
        modelName: llm?.name ?? '',
        modelId: llm.id as string,
        modelDescription: llm?.configurations?.description ?? (llm?.configurations?.providerConfig as any)?.description,
        providerLogo: (llm?.configurations?.providerConfig as any)?.logo?.['32'] ?? '',
        modelUniqueId: llm?.id as string,
    };
}

export function applyLanguageModelToForm(
    response: IntelligenceSourceModel | undefined,
    key: string,
    isSlm: boolean,
    setValue: UseFormSetValue<any>
) {
    const modelId = response?.modelId;
    if (response && !isSlm) {
        setValue(`${key}.llmId` as never, modelId as never);
        setValue(`${key}.slmId` as never, undefined as never);
        setValue(`${key}.sourceValue` as never, modelId as never);
    } else if (response && isSlm) {
        setValue(`${key}.slmId` as never, modelId as never);
        setValue(`${key}.llmId` as never, undefined as never);
        setValue(`${key}.sourceValue` as never, modelId as never);
    } else {
        setValue(`${key}.llmId` as never, undefined as never);
        setValue(`${key}.slmId` as never, undefined as never);
        setValue(`${key}.sourceValue` as never, undefined as never);
    }
}

export function applyPromptToForm(response: Prompt | undefined, key: string, setValue: UseFormSetValue<any>) {
    if (response) {
        setValue(`${key}.promptId` as never, response.id as never);
    } else {
        setValue(`${key}.promptId` as never, '' as never);
    }
}

export async function handleTrigger(key: string, trigger: UseFormTrigger<any>): Promise<void> {
    await trigger(key);
}
