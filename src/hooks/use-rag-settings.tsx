'use client';
import { OptionModel } from '@/components';
import { useState } from 'react';

export const useRagSettings = () => {
    const [feedbackIntegrationOptions, setFeedbackIntegrationOptions] = useState<OptionModel[]>([]);
    const [xaiExplanationOptions, setXaiExplanationOptions] = useState<OptionModel[]>([]);
    const [cacheEvictionStrategyOptions, setcacheEvictionStrategyOptions] = useState<OptionModel[]>([]);
    const [lookaheadTriggerOptions, setLookaheadTriggerOptions] = useState<OptionModel[]>([]);
    const [speculationMergeStrategyOptions, setSpeculationMergeStrategyOptions] = useState<OptionModel[]>([]);
    const [fusionStrategyOptions, setFusionStrategyOptions] = useState<OptionModel[]>([]);

    return {
        feedbackIntegrationOptions,
        setFeedbackIntegrationOptions,
        xaiExplanationOptions,
        setXaiExplanationOptions,
        cacheEvictionStrategyOptions,
        setcacheEvictionStrategyOptions,
        lookaheadTriggerOptions,
        setLookaheadTriggerOptions,
        speculationMergeStrategyOptions,
        setSpeculationMergeStrategyOptions,
        fusionStrategyOptions,
        setFusionStrategyOptions,
    };
};
