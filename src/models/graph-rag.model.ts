import { GraphRagType, KnowledgeGraphSearchType, QueryLanguageType } from '@/enums/knowledge-graph-type';

export interface IGraphRag {
    id?: string;
    name: string;
    description: string;
    configurations: IGraphRagConfiguration;
    isReadOnly?: boolean;
}

export interface IGraphRagConfiguration {
    graphRagType: GraphRagType | string;
    generator?: boolean;
    generatorSource?: IModelSource;
    retrievals: IGraphRagRetrieval[];
    correctiveRag?: IModelSource;
}

export interface IGraphRagRetrieval {
    database: string;
    queryLanguage: QueryLanguageType | string;
    topK: number | undefined;
    nodeLabel: string;
    embeddingNodeProperty: string;
    textNodeProperties: string[];
    embeddingModelId: string;
    enableReRanking?: boolean;
    reRankingModelId?: string;
    reRankingScoreThreshold?: number;

    queryExpansion?: boolean;
    hyde?: boolean;
    enableQueryUnderstanding?: boolean;
    queryUnderstanding?: IQueryUnderstandingSource;
    queryExpansionSource?: IModelSource;
    hydeSource?: IModelSource;
    enableHybridSearch?: boolean;
    hybridSearch?: string;
    hybridSearchTopK?: number;
}

export interface IModelSource {
    llmId?: string;
    slmId?: string;
    promptId?: string;
    // Uses for intelligent source validation
    sourceValue?: string;
}

export interface IQueryUnderstandingSource {
    queryType?: KnowledgeGraphSearchType | string;
    llmId?: string;
    slmId?: string;
    fullTextSearchIndex?: string;
    fullTextSearchProperty?: string;
    // Uses for intelligent source validation
    sourceValue?: string;
}
