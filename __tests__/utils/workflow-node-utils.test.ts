/* eslint-disable @typescript-eslint/no-explicit-any */
import { transformModels, validateLargeLanguageModel } from '@/utils/workflow-node-utils';
import { IModel } from '@/app/editor/[wid]/[workflow_id]/components/language-selector';

// Mock data
const mockModels: IModel[] = [
    {
        id: 'model-1',
        name: 'GPT-4',
        modelName: 'gpt-4',
        provider: 'OpenAI',
        description: 'Powerful model',
        voice: '',
        language: '',
        configurations: {
            providerConfig: {
                id: 'openai',
                logo: { '16': '', '32': '', '48': 'openai-logo.png' },
                value: 'OpenAI',
                description: 'OpenAI Provider',
            },
            temperature: 0.7,
            voice: '',
            tone: '',
            language: 'en',
            apiAuthorization: '',
            customerHeaders: [],
            baseUrl: '',
            description: 'Powerful model',
            tokenLimit: 8000,
            maxTokens: null,
        },
    },
    {
        id: 'model-2',
        name: 'GPT-3.5',
        modelName: 'gpt-3.5',
        provider: 'OpenAI',
        description: 'Fast model',
        voice: '',
        language: '',
        configurations: {
            providerConfig: {
                id: 'openai',
                logo: { '16': '', '32': '', '48': 'openai-logo.png' },
                value: 'OpenAI',
                description: 'OpenAI Provider',
            },
            temperature: 0.7,
            voice: '',
            tone: '',
            language: 'en',
            apiAuthorization: '',
            customerHeaders: [],
            baseUrl: '',
            description: 'Fast model',
            tokenLimit: 4000,
            maxTokens: null,
        },
    },
];

const mockSTSModels: IModel[] = [
    {
        id: 'voice-1',
        name: 'Voice Agent 1',
        modelName: 'voice-1',
        provider: 'ElevenLabs',
        description: 'Realistic voice',
        voice: 'Rachel',
        language: 'en-US',
        configurations: {
            providerConfig: {
                id: 'elevenlabs',
                logo: { '16': '', '32': '', '48': 'elevenlabs-logo.png' },
                value: 'ElevenLabs',
                description: 'ElevenLabs Provider',
            },
            temperature: 0.5,
            voice: 'Rachel',
            tone: 'Friendly',
            language: 'en-US',
            apiAuthorization: '',
            customerHeaders: [],
            baseUrl: '',
            description: 'Realistic voice',
            region: 'us-east-1',
            authType: 'api-key',
            tokenLimit: null,
            maxTokens: null,
        },
    },
];

describe('workflow-node-utils', () => {
    describe('transformModels', () => {
        it('should transform raw models into provider-grouped structure', () => {
            const result = transformModels(mockModels);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('openai');
            expect(result[0].models).toHaveLength(2);
            expect(result[0].models[0].modelName).toBe('gpt-4');
        });

        it('should return empty array if input is undefined', () => {
            const result = transformModels(undefined);
            expect(result).toEqual([]);
        });
    });

    describe('validateLargeLanguageModel', () => {
        describe('Text Models (LLM/SLM)', () => {
            it('should return undefined if currentData is null', () => {
                const result = validateLargeLanguageModel(null, false, mockModels, [], []);
                expect(result).toBeUndefined();
            });

            it('should return undefined if provider not found', () => {
                const currentData = { modelId: 'non-existent', provider: 'Unknown' };
                const result = validateLargeLanguageModel(currentData, false, mockModels, [], []);
                expect(result).toBeUndefined();
            });

            it('should return false if data matches (no discrepancy)', () => {
                const currentData = {
                    provider: 'OpenAI',
                    modelName: 'gpt-4',
                    modelDescription: 'Powerful model',
                    modelId: 'model-1',
                    providerLogo: 'openai-logo.png',
                    modelUniqueId: 'gpt-4-openai', // constructed stable ID
                    isSlm: false,
                };

                // Note: The stable ID logic in transformModels is `${model.modelName}-${providerId}`
                // model-1: gpt-4-openai

                const result = validateLargeLanguageModel(currentData, false, mockModels, [], []);
                expect(result).toBe(false);
            });

            it('should return corrected object if discrepancy found', () => {
                const currentData = {
                    provider: 'OpenAI',
                    modelName: 'gpt-4-OLD-NAME', // Discrepancy
                    modelDescription: 'Powerful model',
                    modelId: 'model-1',
                    providerLogo: 'openai-logo.png',
                    modelUniqueId: 'gpt-4-openai',
                    isSlm: false,
                };

                const result: any = validateLargeLanguageModel(currentData, false, mockModels, [], []);

                expect(result).not.toBe(false);
                expect(result.modelName).toBe('gpt-4');
            });
        });

        describe('Voice Models (STS)', () => {
            it('should return corrected object if voice discrepancy found', () => {
                const currentData = {
                    id: 'voice-1', // for STS, id is matched against modelId
                    name: 'Old Name', // Discrepancy
                    description: 'Realistic voice',
                    provider: 'ElevenLabs',
                    modelName: 'voice-1',
                    voice: 'Rachel',
                    language: 'en-US',
                    temperature: 0.5,
                    region: 'us-east-1',
                    authType: 'api-key',
                };

                const result: any = validateLargeLanguageModel(currentData, true, [], [], mockSTSModels);

                expect(result).not.toBe(false);
                expect(result.name).toBe('Voice Agent 1');
            });

            it('should return false if no discrepancy for STS', () => {
                const currentData = {
                    id: 'voice-1',
                    name: 'Voice Agent 1',
                    description: 'Realistic voice',
                    provider: 'ElevenLabs',
                    modelName: 'voice-1',
                    voice: 'Rachel',
                    language: 'en-US',
                    temperature: 0.5,
                    region: 'us-east-1',
                    authType: 'api-key',
                };

                const result = validateLargeLanguageModel(currentData, true, [], [], mockSTSModels);
                expect(result).toBe(false);
            });
        });
    });
});
