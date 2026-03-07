import { DatabaseItemType, RagVariantType } from '@/enums';
import { IModelSource } from './graph-rag.model';

export interface IVectorRag {
    id?: string;
    name: string;
    description: string;
    isReadOnly?: boolean;
    configurations: IVectorRagConfiguration;
    search?: string;
}

export interface IVectorRagConfiguration {
    ragVariant: RagVariantType | string;
    retrievals: IVectorRagRetrieval[];
    generator?: boolean;
    generatorSource?: IModelSource;
    fusionRag?: IModelSource;
}

export interface IVectorRagRetrieval {
    databaseId: string;
    tableName: string;
    type?: DatabaseItemType | string;
    embeddingModel: string;
    distanceStrategy: string;
    searchType: string;
    topK?: number;
    metadata: string;
    scoreThreshold?: number;
    fetchK?: number;
    lambdaMult?: number;
    enableReRanking?: boolean;
    reRankingModel?: string;
    reRankingScoreThreshold?: number;

    queryExpansion?: boolean;
    hyde?: boolean;
    queryExpansionSource?: IModelSource;
    hydeSource?: IModelSource;
    enableHybridSearch?: boolean;
    hybridSearch?: string;
    hybridSearchTopK?: number;
}
