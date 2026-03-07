export interface IPlatformConfiguration {
    storageQuota: number;
    creditsQuota: number;
    tokensQuota: number;
    creditFormula: string;
    approvedAzureAdDomains: string;
    llmProviders: string;
    slmProviders: string;
    speechToSpeechModelProviders: string;
    promptFrameworks: string;
    promptEnhancementIntelligentSource: string;
    memoryStores: string;
    ragModules: string;
    embeddingModelProviders: string;
    rerankingModelProviders: string;
    platformEnvironment: string;
    messageQueueProviders: string;
    microsoftPresidioFields: string;
}

export interface IAzureDomain {
    domains: string[];
}
