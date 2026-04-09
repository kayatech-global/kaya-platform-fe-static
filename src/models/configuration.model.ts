import {
    AlgorithmicRankingOptionsType,
    AuthenticationGrantType,
    AuthorizationType,
    ClassificationType,
    IConnectorAuthorizationType,
    SensitiveDataType,
} from '@/enums';
import { IOption } from './common.model';
import { TransportType } from '@/enums/transport-type';
import { ServerType } from '@/hooks/use-mcp-configuration';
import { ConnectorType } from './self-learning.model';

export interface IHeaderValues {
    name: string;
    dataType: string;
    value: string;
    isSecret?: boolean;
    defaultValue?: string;
}

export interface IAuthorization {
    authType: AuthorizationType;
    meta?: {
        username?: string;
        password?: string;
        token?: string;
        headerName?: string;
        headerValue?: string;
        // OAuth2 specific fields
        tokenUrl?: string;
        clientId?: string;
        clientSecret?: string; // vault reference
        audience?: string;
        scope?: string;
        grantType?: AuthenticationGrantType;
        headerPrefix?: string;
    };
}

export interface ICredentials {
    authType: string;
    meta?: {
        secretKey?: string;
        accessKey?: string;
        lambdaExecutionRoleArn?: string;
    };
}

export interface IApiConfigForm {
    id?: string;
    apiName: string;
    apiUrl: string;
    apiMethod: string;
    apiHeaders: IHeaderValues[];
    payloadFormat: string;
    description: string;
    authorization: IAuthorization;
    payloads: IHeaderValues[];
    promotedVariables: IHeaderValues[];
    defaultApiParameters: IHeaderValues[];
    isReadOnly?: boolean;
    concurrencyLimit?: number | null;
}

export interface IGuardrailConfigForm {
    id?: string;
    apiName: string;
    apiUrl: string;
    projectId: string;
    location: string;
    guardName: string;
    region: string;
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
    resourceName: string;
    organizationName: string;
    apiMethod: string;
    apiHeaders: IHeaderValues[];
    payloadFormat: string;
    description: string;
    authorization: IAuthorization;
    payloads: IHeaderValues[];
    promotedVariables: IHeaderValues[];
    isReadOnly?: boolean;
    guardrailType: string;
    guardrailApiProvider: string;
}

export interface ILLMConfigForm {
    id?: string;
    connectionName: string;
    provider: string;
    modelName: string;
    apiAuthorization: string;
    maxTokens: number | null;
    temperature: number | null;
    baseUrl: string;
    customerHeaders: IHeaderValues[];
    isReadOnly?: boolean;
    modelNameOption?: IOption;
    description: string;
    accessKey?: string;
    secretKey?: string;
    region?: string;
    useIamRole?: boolean;
    timeout?: number | null;
}

export interface ILLMForm {
    id?: string;
    name: string;
    provider: string;
    modelName: string;
    apiKeyReference: string;
    configurations: {
        description: string;
        apiAuthorization: string;
        maxTokens: number | null;
        temperature: number | null;
        baseUrl: string;
        customerHeaders: IHeaderValues[];
        providerConfig: IProviderConfig;
        accessKey?: string;
        secretKey?: string;
        region?: string;
        useIamRole?: boolean;
        timeout?: number | null;
    };
    isReadOnly?: boolean;
}

export interface IEmbeddingModelForm {
    id?: string;
    name: string;
    provider: string;
    modelName: string;
    apiKeyReference: string;
    configurations: {
        description: string;
        apiAuthorization: string;
        maxTokens: number | null;
        temperature: number | null;
        baseUrl: string;
        customerHeaders: IHeaderValues[];
        providerConfig: IProviderConfig;
        accessKey?: string;
        secretKey?: string;
        region?: string;
        dimension?: number;
    };
    isReadOnly?: boolean;
}

export interface IProviderModel {
    id: string;
    value: string;
    description: string;
}
export interface IVoiceModel {
    id: string;
    name: string;
    gender: string;
    description: string;
}

export interface IRegionModel {
    id: string;
    code: string;
    name: string;
}
export interface ILanguageModel {
    id: string;
    name: string;
    code: string;
}
export interface IProvider extends IProviderModel {
    logo: IProviderLogo;
    models: IProviderModel[];
    voices?: IVoiceModel[];
    languages?: ILanguageModel[];
    regions?: IRegionModel[];
}

interface IProviderLogo {
    [key: string]: string;
}

export interface IProviderConfig extends IProviderModel {
    logo: IProviderLogo;
}

export interface ISLMConfigForm {
    id?: string;
    connectionName: string;
    url: string;
    accessToken: string;
    maxTokens: number | null;
    temperature: number | null;
    customerHeaders: IHeaderValues[];
    isReadOnly?: boolean;
}

export interface ISLMForm {
    id?: string;
    name: string;
    provider: string;
    modelName: string;
    configurations: {
        description: string;
        temperature: number | null;
        apiAuthorization: string;
        providerConfig: IProviderConfig;
        customRuntime: boolean;
        baseUrl: string;
        accessKey?: string;
        secretKey?: string;
        region?: string;
        tokenLimit: number | null;
        timeout?: number | null;
        useIamRole?: boolean;
    };
    isReadOnly?: boolean;
    modelNameOption?: IOption;
}
export interface ISTSConfigForm {
    id?: string;
    name: string;
    provider: string;
    modelName: string;
    description: string;
    secretKey?: string;
    voice?: string;
    tone?: string;
    authType?: string;
    region?: string;
    awsAccessKey?: string;
    awsSecretKey?: string;
    temperature?: number | null;
    language: string;
    modelNameOption?: IOption;
    voiceOption?: IOption;
    languageOption?: IOption;
    isReadOnly?: boolean;
}

export interface ISTSForm {
    id?: string;
    name: string;
    provider: string;
    modelName: string;
    description: string;
    configurations: STSModelConfigurations;
    isReadOnly?: boolean;
}

// type RAGGenerator = {
//     // languageModal: IntelligenceSourceModel;
//     languageModal: string;
//     promptingStrategy?: string;
//     temperature?: number;
//     maxTokens?: number;
//     topP?: number;
// };

export type RAGRetrieverType = {
    id?: string;
    name: string;
    retrieverType: string;
    source: string;
    isMetaDataFiltering: boolean;
    metaDataFiltering: string;
    isQueryEnhancement: boolean;
    memoryMode?: string;
    memoryRetentionDepth?: string;
    sessionSummaryLength?: number;
    memoRetrievalTopK: string;
    memoryRetrievalTopK: string;
    isEnableReranking?: boolean;
    rerankingType?: string;
    crossEncoderModel?: string;
    rerankTopN?: number;
    isGrokking?: boolean;
    grokkingDepth?: string;
    isSummarizeLongContexts?: boolean;
    minimumLengthToSummarize?: number;
    maxCorrectionRounds?: string;
    feedbackIntegrationMethod?: string;
    speculativePreFetch?: boolean;
    lookaheadDepth?: string;
    isEnableCaching?: boolean;
    isEnableExplainability?: boolean;
    ttl?: string;
    maxRetries?: string;
    isEnableCorrectiveRAG?: boolean;
    rerankingModel?: string;
    filterThenVector?: string;
    hyde?: boolean;
    isQueryExpansion?: boolean;
    correctionSimilarityThreshold?: string;
    initialRetrievalTopK?: string;
    feedbackDocsCount?: string;
    feedbackTermsCount?: string;
    rocchioAlpha?: string;
    rocchioBeta?: string;
    memoSize?: string;
    memoDecayRate?: string;
    conversationHistorySize?: string;
    turnContextRetrievalTopK?: string;
    iterativeRounds?: string;
    iterativeSimilarityThreshold?: string;
    iterativeContextSize?: string;
    iterativeRetrievalMethod?: string;
    neighborhoodWeight?: string;
    documentWeight?: string;
    xaiRetrievalTopK?: string;
    xaiExplanationDepth?: string;
    xaiExplanationFormat?: string;
    cacheSize?: string;
    cacheEvictionStrategy?: string;
    cacheTTL?: string;
    grokEpochs?: string;
    grokRetrievalTopK?: string;
    lookaheadNumQueries?: string;
    lookaheadTrigger?: string;
    retrievalTopK?: string;
    speculationMergeStrategy?: string;
    speculationWeight?: string;
    topK?: string;
    retrieverName?: string;
    isAdvancedQueryTuning?: boolean;
    isConversationContextSettings?: boolean;
    isAdvancedIterativeSettings?: boolean;
    isXaiRetrievalSettings?: boolean;
    isXaiExplanationSettings?: boolean;
    isRetrievalCachePostSettings?: boolean;
    queryExpansionType?: string;
    hydeGenerationTemperature?: number;
    hydeGenerationMaxTokens?: number;
    hydeNumPseudoDocs?: number;
    reRankingType?: string;
    algorithmicReranker?: AlgorithmicRankingOptionsType;
    BM25K1?: string;
    BM25B?: string;
    scoreThreshold?: string;
    subLinearTF?: boolean;
    includeReferences?: boolean;
    metaDataFilters?: IMetadataFilterValues[];
    similarityThreshold?: number;
    termFrequency?: string;
    lengthNormalization?: string;
    distanceMetrics?: string;
    subLinearTf?: boolean;
};

export interface IMetadataFilterValues {
    key: string;
    value: string;
}

export interface IMcpConfigForm {
    id?: string;
    name: string;
    url: string;
    description: string;
    authorization: IAuthorization;
    timeout?: number;
    retryCount?: number;
    isReadOnly?: boolean;
    transport?: TransportType;
    type?: ServerType;
    availableTools?: IOption[];
}

export interface IConnectorAuthorization {
    authType: IConnectorAuthorizationType;
    meta?: {
        username?: string;
        passwordReference?: string;
        clientID?: string;
        clientSecretReference?: string;
        tokenEndpointURL?: string;
    };
}

type ConnectorConfig = {
    authorization?: IConnectorAuthorization;
    databaseId?: string;
    query?: string;
    databaseSchema?: File[];
};

export type IConnectorForm = {
    id?: string;
    name: string;
    description: string;
    type: ConnectorType | undefined;
    configurations: ConnectorConfig;
    isReadOnly?: boolean;
    search?: string;
};

export interface IMicrosoftPresidioField {
    fieldName: string;
    classification: ClassificationType;
    entityType: SensitiveDataType;
}

export interface STSModelConfigurations {
    tone: string;
    voice: string;
    language: string;
    providerConfig: IProviderConfig;
    secretKey?: string;
    temperature?: number;
    region?: string;
    authType?: string;
    accessKey?: string;
}
