import { IVectorRag, IVectorRagRetrieval, IModelSource } from '@/models';
import { RagVariantType, RAGRetrievalStrategyType } from '@/enums';
import { getEnumKeyByValueV2 } from '@/lib/utils';

/**
 * Helper to check if a source should be treated as an LLM source.
 */
export const isLlmSource = (source?: IModelSource): boolean => {
    return !!(source?.llmId && source.llmId.trim() !== '');
};

/**
 * Transforms a model source for the form.
 */
const transformModelSourceToForm = (source?: IModelSource): IModelSource | undefined => {
    if (!source) return undefined;
    const isLlm = isLlmSource(source);
    return {
        ...source,
        sourceValue: isLlm ? source.llmId : source.slmId,
    };
};

/**
 * Prepares a model source for the API request body.
 */
const prepareModelSource = (source?: IModelSource): IModelSource | undefined => {
    if (!source) return undefined;
    const isLlm = isLlmSource(source);
    return {
        llmId: isLlm ? source.llmId : undefined,
        slmId: isLlm ? undefined : source.slmId,
        promptId: source.promptId,
    };
};

/**
 * Prepares a retrieval configuration for the API request body.
 */
const prepareRetrieval = (retrieval: IVectorRagRetrieval): IVectorRagRetrieval => {
    const isMMRSearch =
        retrieval.searchType === getEnumKeyByValueV2(RAGRetrievalStrategyType, RAGRetrievalStrategyType.MMR);
    const isScoreThresholdSearch =
        retrieval.searchType ===
        getEnumKeyByValueV2(RAGRetrievalStrategyType, RAGRetrievalStrategyType.SIMILARITY_SCORE_THRESHOLD);

    return {
        ...retrieval,
        enableReRanking: retrieval.enableReRanking === true ? true : undefined,
        reRankingModel: retrieval.enableReRanking ? retrieval.reRankingModel : undefined,
        reRankingScoreThreshold: retrieval.enableReRanking ? retrieval.reRankingScoreThreshold : undefined,

        queryExpansion: retrieval.queryExpansion === true ? true : undefined,
        queryExpansionSource: retrieval.queryExpansion ? prepareModelSource(retrieval.queryExpansionSource) : undefined,

        hyde: retrieval.hyde === true ? true : undefined,
        hydeSource: retrieval.hyde ? prepareModelSource(retrieval.hydeSource) : undefined,

        enableHybridSearch: retrieval.enableHybridSearch === true ? true : undefined,
        hybridSearch: retrieval.enableHybridSearch ? retrieval.hybridSearch : undefined,
        hybridSearchTopK: retrieval.enableHybridSearch ? retrieval.hybridSearchTopK : undefined,
        fetchK: isMMRSearch ? retrieval.fetchK : undefined,
        lambdaMult: isMMRSearch ? retrieval.lambdaMult : undefined,
        scoreThreshold: isScoreThresholdSearch ? retrieval.scoreThreshold : undefined,
    };
};

/**
 * Transforms the API response data to the format expected by the form.
 */
export const transformVectorRagToForm = (data: IVectorRag): IVectorRag => {
    const processedRetrievals = data.configurations.retrievals.map(item => ({
        ...item,
        reRankingScoreThreshold: item.reRankingScoreThreshold ?? 0,
        queryExpansionSource: transformModelSourceToForm(item.queryExpansionSource),
        hydeSource: transformModelSourceToForm(item.hydeSource),
    })) as IVectorRagRetrieval[];

    return {
        ...data,
        configurations: {
            ...data.configurations,
            generatorSource: transformModelSourceToForm(data.configurations.generatorSource),
            fusionRag: transformModelSourceToForm(data.configurations.fusionRag),
            retrievals: processedRetrievals,
        },
    };
};

/**
 * Prepares the API request body from form data.
 */
export const prepareVectorRagApiBody = (data: IVectorRag): IVectorRag => {
    return {
        ...data,
        isReadOnly: undefined,
        configurations: {
            ...data.configurations,
            generator: data.configurations.generator === true ? true : undefined,
            generatorSource: data.configurations.generator
                ? prepareModelSource(data.configurations.generatorSource)
                : undefined,
            fusionRag:
                data.configurations.ragVariant === RagVariantType.FUSION
                    ? prepareModelSource(data.configurations.fusionRag)
                    : undefined,
            retrievals: data.configurations.retrievals.map(prepareRetrieval),
        },
    };
};
