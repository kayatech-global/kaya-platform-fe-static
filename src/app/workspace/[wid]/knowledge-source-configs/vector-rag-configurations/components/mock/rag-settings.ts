// import { RagVariant } from '@/models/rag-model';
// import { RagConfigSteps } from '../retriever-form';

// export interface DisplayFieldBase {
//     name: string;
//     type: 'integer' | 'number' | 'string' | 'list';
//     default: number | string;
//     feature: RagConfigSteps | string;
//     helper: string;
//     note?: string;
//     values?: string[];
// }

// export interface ListDisplayField extends DisplayFieldBase {
//     type: 'list';
//     default: string;
//     values: string[];
// }

// export interface IntegerDisplayField extends DisplayFieldBase {
//     type: 'integer';
//     default: number;
// }

// export interface NumberDisplayField extends DisplayFieldBase {
//     type: 'number';
//     default: number;
// }

// export interface StringDisplayField extends DisplayFieldBase {
//     type: 'string';
//     default: string;
// }

// export type DisplayField = ListDisplayField | IntegerDisplayField | NumberDisplayField | StringDisplayField;

// export interface FeatureConfig {
//     fusion?: boolean;
//     maxRetrievers?: number;
//     generator?: boolean;
// }

// export const settings: Partial<
//     Record<RagVariant, { displayFields?: DisplayField[]; featureConfig: FeatureConfig; description: string }>
// > = {
//     [RagVariant.STANDARD]: {
//         displayFields: [
//             {
//                 name: 'fusionStrategy',
//                 type: 'list',
//                 default: '',
//                 values: ['RRF', 'Linear Weighted Fusion'],
//                 feature: 'Fusion',
//                 helper: 'Method for merging multiple retrieval results.',
//             },
//             {
//                 name: 'rrfKValue',
//                 type: 'integer',
//                 default: 0,
//                 feature: 'Fusion',
//                 note: 'visible if RRF is selected',
//                 helper: 'Number of top-ranked lists to consider in RRF.',
//             },
//             {
//                 name: 'weight1',
//                 type: 'number',
//                 default: 0,
//                 feature: 'Fusion',
//                 note: 'visible if Linear Weighted Fusion is selected',
//                 helper: 'Weight assigned to the first retriever in linear fusion.',
//             },
//             {
//                 name: 'weight2',
//                 type: 'number',
//                 default: 0,
//                 feature: 'Fusion',
//                 note: 'visible if Linear Weighted Fusion is selected',
//                 helper: 'Weight assigned to the second retriever in linear fusion.',
//             },
//         ],
//         description:
//             'A classic retrieve-then-generate pipeline that pulls the top-K most relevant passages from your index and conditions a generative model on them to produce an answer—straightforward, reliable grounding of LLM outputs.',
//         featureConfig: {
//             fusion: true,
//             maxRetrievers: 1,
//             generator: true,
//         },
//     },
//     [RagVariant.CUSTOM]: {
//         displayFields: [
//             {
//                 name: 'maxCorrectionRounds',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 note: 'Number of correction cycles to perform.',
//                 helper: 'Determines how many times the system will re-fetch documents after corrections.',
//             },
//             {
//                 name: 'correctionSimilarityThreshold',
//                 type: 'number',
//                 default: 0,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 note: 'visible in Post-retrieval',
//                 helper: 'Confidence score is calculated using normalized cosine similarity scores in dense methods. In sparse retrieval methods, we use tf-idf/bm25 score normalization.',
//             },
//             {
//                 name: 'feedbackIntegrationMethod',
//                 type: 'list',
//                 default: '',
//                 values: ['re-rank', 'prepend', 'postpend'],
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'How corrected documents are merged with originals (e.g., re-ranking or prepending).',
//             },
//             {
//                 name: 'lookaheadNumQueries',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Number of speculative follow-up queries to generate.',
//             },
//             {
//                 name: 'lookaheadTrigger',
//                 type: 'list',
//                 default: '',
//                 values: ['pre-generation', 'on-entropy-spike'],
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Condition under which speculation is triggered (always or on uncertainty).',
//             },
//             {
//                 name: 'retrievalTopK',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Number of passages to fetch for each speculative query.',
//             },
//             {
//                 name: 'speculationMergeStrategy',
//                 type: 'list',
//                 default: '',
//                 values: ['union', 'interleave', 'prepend'],
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'How speculative results are merged with main results.',
//             },
//             {
//                 name: 'speculationWeight',
//                 type: 'number',
//                 default: 0,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Weight given to speculative passages during fusion.',
//             },
//             {
//                 name: 'fusionStrategy',
//                 type: 'list',
//                 default: '',
//                 values: ['RRF', 'Linear Weighted Fusion'],
//                 feature: 'Fusion',
//                 helper: 'Method for merging multiple retrieval results.',
//             },
//             {
//                 name: 'rrfKValue',
//                 type: 'integer',
//                 default: 0,
//                 feature: 'Fusion',
//                 note: 'visible if RRF is selected',
//                 helper: 'Number of top-ranked lists to consider in RRF.',
//             },
//             {
//                 name: 'weight1',
//                 type: 'number',
//                 default: 0,
//                 feature: 'Fusion',
//                 note: 'visible if Linear Weighted Fusion is selected',
//                 helper: 'Weight assigned to the first retriever in linear fusion.',
//             },
//             {
//                 name: 'weight2',
//                 type: 'number',
//                 default: 0,
//                 feature: 'Fusion',
//                 note: 'visible if Linear Weighted Fusion is selected',
//                 helper: 'Weight assigned to the second retriever in linear fusion.',
//             },

//             {
//                 name: 'initialRetrievalTopK',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.PRE_RETRIEVAL,
//                 helper: 'Number of documents fetched in the initial retrieval for feedback.',
//             },
//             {
//                 name: 'feedbackDocsCount',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.PRE_RETRIEVAL,
//                 helper: 'Number of top documents used to generate feedback terms.',
//             },
//             {
//                 name: 'feedbackTermsCount',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.PRE_RETRIEVAL,
//                 helper: 'Number of expansion terms derived from feedback docs.',
//             },
//             {
//                 name: 'rocchioAlpha',
//                 type: 'number',
//                 default: 0,
//                 feature: RagConfigSteps.PRE_RETRIEVAL,
//                 helper: 'Weight for the original query vector in Rocchio formula.',
//             },
//             {
//                 name: 'rocchioBeta',
//                 type: 'number',
//                 default: 0,
//                 feature: RagConfigSteps.PRE_RETRIEVAL,
//                 helper: 'Weight for the feedback centroid in Rocchio formula.',
//             },
//             {
//                 name: 'memoSize',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 note: 'show only in Memo in the Memory Mode',
//                 helper: 'Maximum number of past interactions stored in memory.',
//             },
//             {
//                 name: 'memoRetrievalTopK',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 note: 'show only in Memo in the Memory Mode',
//                 helper: 'Number of memory entries fetched per query.',
//             },
//             {
//                 name: 'memoDecayRate',
//                 type: 'number',
//                 default: 0,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 note: 'show only in Memo in the Memory Mode',
//                 helper: 'Rate at which older memory entries are deprioritized.',
//             },
//             {
//                 name: 'conversationHistorySize',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Number of recent dialogue turns included in context.',
//             },
//             {
//                 name: 'turnContextRetrievalTopK',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Number of passages fetched for the current dialogue turn.',
//             },
//             {
//                 name: 'memoryRetrievalTopK',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Number of long-term memory items retrieved.',
//             },
//             {
//                 name: 'iterativeRetrievalMethod',
//                 type: 'string',
//                 default: '',
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Method for iterative retrieval processing.',
//             },
//             {
//                 name: 'iterativeRounds',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Number of iterative retrieval loops to perform.',
//             },
//             {
//                 name: 'iterativeSimilarityThreshold',
//                 type: 'number',
//                 default: 0,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Threshold to stop iterations when results stabilize.',
//             },
//             {
//                 name: 'neighborhoodWeight',
//                 type: 'number',
//                 default: 0,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Weight for neighborhood re-retrieval method.',
//             },
//             {
//                 name: 'documentWeight',
//                 type: 'number',
//                 default: 0,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Weight for document re-retrieval method.',
//             },
//             {
//                 name: 'generativeRetrieverWeight',
//                 type: 'number',
//                 default: 0,
//                 feature: 'Fusion',
//                 helper: 'Blend weight for retriever outputs in hybrid fusion.',
//             },
//             {
//                 name: 'generativeContextPromptTemplate',
//                 type: 'string',
//                 default: '',
//                 feature: 'Generation',
//                 helper: 'Template for framing retrieval context to the LLM.',
//             },
//             {
//                 name: 'generativeRetrievalTopK',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Number of passages fetched before generation.',
//             },
//             {
//                 name: 'xaiExplanationDepth',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Number of hops or layers for generating explanations.',
//             },
//             {
//                 name: 'xaiRetrievalTopK',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Number of passages fetched to support explanations.',
//             },
//             {
//                 name: 'xaiExplanationFormat',
//                 type: 'list',
//                 default: '',
//                 values: ['text', 'graph', 'visual'],
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Format style for presenting explanations.',
//             },
//             {
//                 name: 'cacheSize',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Max number of entries the cache can hold.',
//             },
//             {
//                 name: 'cacheEvictionStrategy',
//                 type: 'list',
//                 default: '',
//                 values: ['LRU', 'LFU', 'FIFO'],
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Policy for evicting old cache entries.',
//             },
//             {
//                 name: 'cacheTTL',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Time-to-live for cache entries in seconds.',
//             },
//             {
//                 name: 'grokEpochs',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Number of training epochs for the grok model.',
//             },
//             {
//                 name: 'grokRetrievalTopK',
//                 type: 'integer',
//                 default: 0,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Number of contexts fetched during grok inference.',
//             },
//         ],
//         description:
//             'A flexible “pick-and-mix” mode where you compose your own RAG workflow by combining any of the available patterns (e.g. Fusion, Speculative, Iterative, Corrective, etc.) into a single, bespoke retrieval + generation configuration.',
//         featureConfig: {
//             fusion: true,
//             maxRetrievers: 2,
//             generator: true,
//         },
//     },
//     [RagVariant.CORRECTIVE]: {
//         displayFields: [
//             {
//                 name: 'maxCorrectionRounds',
//                 type: 'integer',
//                 default: 3,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 note: 'Number of correction cycles to perform.',
//                 helper: 'Determines how many times the system will re-fetch documents after corrections.',
//             },
//             {
//                 name: 'correctionSimilarityThreshold',
//                 type: 'number',
//                 default: 0.8,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 note: 'visible in Post-retrieval',
//                 helper: 'Confidence score is calculated using normalized cosine similarity scores in dense methods. In sparse retrieval methods, we use tf-idf/bm25 score normalization.',
//             },
//             {
//                 name: 'feedbackIntegrationMethod',
//                 type: 'list',
//                 default: 're-rank',
//                 values: ['re-rank', 'prepend', 'postpend'],
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'How corrected documents are merged with originals (e.g., re-ranking or prepending).',
//             },
//         ],
//         description:
//             'Generates a response, then self-checks against trusted sources and runs a correction loop to fix inaccuracies before delivering the final answer. ',
//         featureConfig: {
//             fusion: false,
//             maxRetrievers: 1,
//             generator: true,
//         },
//     },
//     [RagVariant.SPECULATIVE]: {
//         displayFields: [
//             {
//                 name: 'lookaheadNumQueries',
//                 type: 'integer',
//                 default: 3,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Number of speculative follow-up queries to generate.',
//             },
//             {
//                 name: 'lookaheadTrigger',
//                 type: 'list',
//                 default: 'pre-generation',
//                 values: ['pre-generation', 'on-entropy-spike'],
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Condition under which speculation is triggered (always or on uncertainty).',
//             },
//             {
//                 name: 'retrievalTopK',
//                 type: 'integer',
//                 default: 5,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Number of passages to fetch for each speculative query.',
//             },
//             {
//                 name: 'speculationMergeStrategy',
//                 type: 'list',
//                 default: 'union',
//                 values: ['union', 'interleave', 'prepend'],
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'How speculative results are merged with main results.',
//             },
//             {
//                 name: 'speculationWeight',
//                 type: 'number',
//                 default: 0.5,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Weight given to speculative passages during fusion.',
//             },
//         ],
//         description:
//             'Anticipates user needs by pre-fetching data based on predicted follow-up queries, so it’s “halfway there” when the actual request arrives.',
//         featureConfig: {
//             fusion: false,
//             maxRetrievers: 1,
//             generator: true,
//         },
//     },
//     [RagVariant.FUSION]: {
//         displayFields: [
//             {
//                 name: 'fusionStrategy',
//                 type: 'list',
//                 default: '',
//                 values: ['RRF', 'Linear Weighted Fusion'],
//                 feature: 'Fusion',
//                 helper: 'Method for merging multiple retrieval results.',
//             },
//             {
//                 name: 'rrfKValue',
//                 type: 'integer',
//                 default: 60,
//                 feature: 'Fusion',
//                 note: 'visible if RRF is selected',
//                 helper: 'Number of top-ranked lists to consider in RRF.',
//             },
//             {
//                 name: 'weight1',
//                 type: 'number',
//                 default: 0.5,
//                 feature: 'Fusion',
//                 note: 'visible if Linear Weighted Fusion is selected',
//                 helper: 'Weight assigned to the first retriever in linear fusion.',
//             },
//             {
//                 name: 'weight2',
//                 type: 'number',
//                 default: 0.5,
//                 feature: 'Fusion',
//                 note: 'visible if Linear Weighted Fusion is selected',
//                 helper: 'Weight assigned to the second retriever in linear fusion.',
//             },
//         ],
//         description:
//             'Merges results from multiple retrievers (e.g. via Reciprocal Rank Fusion or linear weighting) to boost relevance and diversity',
//         featureConfig: {
//             fusion: true,
//             maxRetrievers: 2,
//             generator: true,
//         },
//     },
//     [RagVariant.REFEED_RETRIEVAL_FEEDBACK]: {
//         displayFields: [
//             {
//                 name: 'initialRetrievalTopK',
//                 type: 'integer',
//                 default: 10,
//                 feature: RagConfigSteps.PRE_RETRIEVAL,
//                 helper: 'Number of documents fetched in the initial retrieval for feedback.',
//             },
//             {
//                 name: 'feedbackDocsCount',
//                 type: 'integer',
//                 default: 10,
//                 feature: RagConfigSteps.PRE_RETRIEVAL,
//                 helper: 'Number of top documents used to generate feedback terms.',
//             },
//             {
//                 name: 'feedbackTermsCount',
//                 type: 'integer',
//                 default: 5,
//                 feature: RagConfigSteps.PRE_RETRIEVAL,
//                 helper: 'Number of expansion terms derived from feedback docs.',
//             },
//             {
//                 name: 'rocchioAlpha',
//                 type: 'number',
//                 default: 1.0,
//                 feature: RagConfigSteps.PRE_RETRIEVAL,
//                 helper: 'Weight for the original query vector in Rocchio formula.',
//             },
//             {
//                 name: 'rocchioBeta',
//                 type: 'number',
//                 default: 0.75,
//                 feature: RagConfigSteps.PRE_RETRIEVAL,
//                 helper: 'Weight for the feedback centroid in Rocchio formula.',
//             },
//         ],
//         description: '',
//         featureConfig: {
//             fusion: false,
//             maxRetrievers: 1,
//             generator: true,
//         },
//     },
//     [RagVariant.MEMO]: {
//         displayFields: [
//             {
//                 name: 'memoSize',
//                 type: 'integer',
//                 default: 100,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 note: 'show only in Memo in the Memory Mode',
//                 helper: 'Maximum number of past interactions stored in memory.',
//             },
//             {
//                 name: 'memoRetrievalTopK',
//                 type: 'integer',
//                 default: 5,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 note: 'show only in Memo in the Memory Mode',
//                 helper: 'Number of memory entries fetched per query.',
//             },
//             {
//                 name: 'memoDecayRate',
//                 type: 'number',
//                 default: 0.1,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 note: 'show only in Memo in the Memory Mode',
//                 helper: 'Rate at which older memory entries are deprioritized.',
//             },
//         ],
//         description:
//             'Acts as a “memory bank,” storing key interaction details and retrieving them to maintain continuity across sessions.',
//         featureConfig: {
//             fusion: false,
//             maxRetrievers: 1,
//             generator: true,
//         },
//     },
//     [RagVariant.CONVERSATIONAL]: {
//         displayFields: [
//             {
//                 name: 'conversationHistorySize',
//                 type: 'integer',
//                 default: 10,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Number of recent dialogue turns included in context.',
//             },
//             {
//                 name: 'turnContextRetrievalTopK',
//                 type: 'integer',
//                 default: 5,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Number of passages fetched for the current dialogue turn.',
//             },
//             {
//                 name: 'memoryRetrievalTopK',
//                 type: 'integer',
//                 default: 3,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Number of long-term memory items retrieved.',
//             },
//         ],
//         description:
//             'Designed for natural, interactive dialogue, it pulls in both relevant documents and recent conversational context to craft seamless, context-aware responses',
//         featureConfig: {
//             fusion: false,
//             maxRetrievers: 1,
//             generator: true,
//         },
//     },
//     [RagVariant.ITERATIVE]: {
//         displayFields: [
//             {
//                 name: 'iterativeRetrievalMethod',
//                 type: 'string',
//                 default: '',
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Method for iterative retrieval processing.',
//             },
//             {
//                 name: 'iterativeRounds',
//                 type: 'integer',
//                 default: 3,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Number of iterative retrieval loops to perform.',
//             },
//             {
//                 name: 'iterativeSimilarityThreshold',
//                 type: 'number',
//                 default: 0.8,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Threshold to stop iterations when results stabilize.',
//             },
//             {
//                 name: 'neighborhoodWeight',
//                 type: 'number',
//                 default: 0.5,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Weight for neighborhood re-retrieval method.',
//             },
//             {
//                 name: 'documentWeight',
//                 type: 'number',
//                 default: 0.5,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Weight for document re-retrieval method.',
//             },
//         ],
//         description:
//             'Refines answers through multiple retrieve–generate loops, learning from each pass to deliver increasingly accurate solutions',
//         featureConfig: {
//             fusion: false,
//             maxRetrievers: 1,
//             generator: true,
//         },
//     },
//     [RagVariant.GENERATIVE_AI]: {
//         displayFields: [
//             {
//                 name: 'generativeRetrieverWeight',
//                 type: 'number',
//                 default: 0.7,
//                 feature: 'Fusion',
//                 helper: 'Blend weight for retriever outputs in hybrid fusion.',
//             },
//             {
//                 name: 'generativeContextPromptTemplate',
//                 type: 'string',
//                 default: 'Provide context: {{query}}',
//                 feature: 'Generation',
//                 helper: 'Template for framing retrieval context to the LLM.',
//             },
//             {
//                 name: 'generativeRetrievalTopK',
//                 type: 'integer',
//                 default: 5,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Number of passages fetched before generation.',
//             },
//         ],
//         description:
//             'Combines retrieved context with creative generation to produce original content or ideas, ideal for marketing copy, brainstorming, etc.',
//         featureConfig: {
//             fusion: false,
//             maxRetrievers: 1,
//             generator: true,
//         },
//     },
//     [RagVariant.XAI]: {
//         displayFields: [
//             {
//                 name: 'xaiExplanationDepth',
//                 type: 'integer',
//                 default: 2,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Number of hops or layers for generating explanations.',
//             },
//             {
//                 name: 'xaiRetrievalTopK',
//                 type: 'integer',
//                 default: 5,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Number of passages fetched to support explanations.',
//             },
//             {
//                 name: 'xaiExplanationFormat',
//                 type: 'list',
//                 default: 'text',
//                 values: ['text', 'graph', 'visual'],
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Format style for presenting explanations.',
//             },
//         ],
//         description:
//             'Builds in an explainability layer, tracing how each piece of information was retrieved and used so users see the reasoning behind the answer. ',
//         featureConfig: {
//             fusion: false,
//             maxRetrievers: 1,
//             generator: true,
//         },
//     },
//     [RagVariant.CONTEXT_CACHE]: {
//         displayFields: [
//             {
//                 name: 'cacheSize',
//                 type: 'integer',
//                 default: 1000,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Max number of entries the cache can hold.',
//             },
//             {
//                 name: 'cacheEvictionStrategy',
//                 type: 'list',
//                 default: 'LRU',
//                 values: ['LRU', 'LFU', 'FIFO'],
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Policy for evicting old cache entries.',
//             },
//             {
//                 name: 'cacheTTL',
//                 type: 'integer',
//                 default: 3600,
//                 feature: RagConfigSteps.RETRIEVAL,
//                 helper: 'Time-to-live for cache entries in seconds.',
//             },
//         ],
//         description:
//             'Maintains an in-LLM cache of recent context, pulling from it first to ensure responses stay coherent with prior interactions.',
//         featureConfig: {
//             fusion: false,
//             maxRetrievers: 1,
//             generator: true,
//         },
//     },
//     [RagVariant.GROKKING]: {
//         displayFields: [
//             {
//                 name: 'grokEpochs',
//                 type: 'integer',
//                 default: 5,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Number of training epochs for the grok model.',
//             },
//             {
//                 name: 'grokRetrievalTopK',
//                 type: 'integer',
//                 default: 5,
//                 feature: RagConfigSteps.POST_RETRIEVAL,
//                 helper: 'Number of contexts fetched during grok inference.',
//             },
//         ],
//         description: `“Intuitively” grasps deep, complex concepts by retrieving detailed technical documents and synthesizing them into accessible insights.`,
//         featureConfig: {
//             fusion: false,
//             maxRetrievers: 1,
//             generator: true,
//         },
//     },
// };
