import {
    AlgorithmicRankingOptionsType,
    CrossEncoderModelType,
    FeedbackIntegrationType,
    FilterType,
    FusionStrategyType,
    GraphRagType,
    GrokkingDepthType,
    MemoryModeType,
    PromptingStrategyType,
    RagModeType,
    RagVariantType,
    RerankingType,
    RetrieverType,
    SourceType,
} from '@/enums';
import { IOption } from '@/models';

export const vectorDatabaseOptions = [
    { value: 'pinecone', name: 'Pinecone' },
    { value: 'weaviate', name: 'Weaviate' },
    { value: 'milvus', name: 'Milvus' },
    { value: 'qdrant', name: 'Qdrant' },
    { value: 'chroma', name: 'Chroma' },
    { value: 'redis', name: 'Redis' },
    { value: 'elasticsearch', name: 'Elasticsearch' },
    { value: 'faiss', name: 'FAISS' },
    { value: 'annoy', name: 'Annoy' },
];

export const embeddingConfigOptions = [
    { value: 'openai-text-embedding-ada-002', name: 'OpenAI text-embedding-ada-002' },
    { value: 'openai-text-embedding-3-small', name: 'OpenAI text-embedding-3-small' },
    { value: 'openai-text-embedding-3-large', name: 'OpenAI text-embedding-3-large' },
    { value: 'cohere-embed-english-v3.0', name: 'Cohere Embed English v3.0' },
    { value: 'cohere-embed-multilingual-v3.0', name: 'Cohere Embed Multilingual v3.0' },
    { value: 'sentence-transformers/all-mpnet-base-v2', name: 'Sentence Transformers MPNet' },
    { value: 'sentence-transformers/all-MiniLM-L6-v2', name: 'Sentence Transformers MiniLM' },
    { value: 'voyage-01', name: 'Voyage AI voyage-01' },
    { value: 'voyage-law-01', name: 'Voyage AI Law' },
    { value: 'jina-embeddings-v2-base-en', name: 'Jina Embeddings v2 (English)' },
];

export const rerankingModelOptions = [
    { value: 'cohere-rerank-english-v3.0', name: 'Cohere Rerank English v3.0' },
    { value: 'cohere-rerank-multilingual-v3.0', name: 'Cohere Rerank Multilingual v3.0' },
    { value: 'openai-reranker', name: 'OpenAI Reranker' },
    { value: 'bge-reranker-base', name: 'BAAI Reranker Base' },
    { value: 'bge-reranker-large', name: 'BAAI Reranker Large' },
    { value: 'voyage-rerank-lite-1', name: 'Voyage AI Rerank Lite' },
    { value: 'none', name: 'No Reranking' },
];

export const retrieverTypeOptions = [
    { value: RetrieverType.TF_IDF, name: 'TF-IDF Retriever' },
    { value: RetrieverType.BM25, name: 'BM25 Retriever' },
];

export const memoryModeOptions = [
    { value: MemoryModeType.NONE, name: 'None' },
    { value: MemoryModeType.CONTEXT_CACHE, name: 'Context Cache' },
    { value: MemoryModeType.MEMO_INDEXING, name: 'Memo Indexing' },
    { value: MemoryModeType.CONVERSATIONAL_RETRIEVAL, name: 'Conversational Retrieval' },
];

export const rerankingTypeOptions = [
    { value: RerankingType.CROSS_ENCODER, name: 'Cross-encoder' },
    { value: RerankingType.POLY_ENCODER, name: 'Poly-encoder' },
    { value: RerankingType.BM25, name: 'BM25' },
];

export const crossEncoderModelOptions = [
    { value: CrossEncoderModelType.BERT, name: 'BERT' },
    { value: CrossEncoderModelType.ROBERTA, name: 'RoBERTa' },
    { value: CrossEncoderModelType.MONO_T5, name: 'MonoT5' },
];

export const grokkingDepthOptions = [
    { value: GrokkingDepthType.NONE, name: 'None' },
    { value: GrokkingDepthType.SHALLOW, name: 'Shallow' },
    { value: GrokkingDepthType.MEDIUM, name: 'Medium' },
    { value: GrokkingDepthType.DEEP, name: 'Deep' },
];

export const feedbackIntegrationOptions = [
    { value: FeedbackIntegrationType.NONE, name: 'None' },
    { value: FeedbackIntegrationType.RERANK, name: 'Rerank' },
    { value: FeedbackIntegrationType.REWRITER, name: 'Rewriter' },
    { value: FeedbackIntegrationType.FALLBACK, name: 'Fallback' },
];

export const promptingStrategyOptions = [
    { value: PromptingStrategyType.CHAIN_OF_THOUGHT, name: 'Chain of Thought' },
    { value: PromptingStrategyType.EVIDENTIAL, name: 'Evidential Prompting' },
];

export const fusionStrategyOptions = [
    { value: FusionStrategyType.RRF, name: 'RRF' },
    { value: FusionStrategyType.LINEAR_WEIGHTED_FUSION, name: 'Linear Weighted Fusion' },
];

export const memoryRetentionOptions = [
    { value: 'ALL', name: 'All' },
    { value: '1', name: '1' },
    { value: '3', name: '3' },
];

export const sourceTypeOptions = [
    { value: SourceType.PROVIDER_SERVICE_EMBEDDINGS, name: 'Provider Service Embeddings' },
    { value: SourceType.CLAIMS_RELATIONSHIP_GRAPH, name: 'Claims Relationship Graph' },
    { value: SourceType.LEGACY_POLICY_TRANSACTIONS, name: 'Legacy Policy Transactions' },
    { value: SourceType.CARRIER_RULES_DOCUMENTS, name: 'Carrier Rules Documents' },
    { value: SourceType.LEGACY_SESSION_POLICY_CACHE, name: 'Legacy Session Policy Cache' },
];

export const filterTypeOptions = [
    { value: FilterType.FILTER_THEN_VECTOR, name: 'Pre-filter' },
    { value: FilterType.VECTOR_THEN_FILTER, name: 'Post-filter' },
];

export const ragModeOptions = [
    { value: RagModeType.BASIC, label: 'Basic' },
    { value: RagModeType.ADVANCED, label: 'Advanced' },
];

export const ragVariantOptions = [
    { value: RagVariantType.STANDARD, name: 'Standard RAG' },
    // { value: RagVariantType.CUSTOM, name: 'Custom' },
    // { value: RagVariantType.CORRECTIVE, name: 'Corrective RAG' },
    // { value: RagVariantType.SELF, name: 'Self RAG' },
    // { value: RagVariantType.SPECULATIVE, name: 'Speculative RAG' },
    { value: RagVariantType.FUSION, name: 'Fusion RAG' },
    // { value: RagVariantType.MEMO, name: 'Memo RAG' },
    // { value: RagVariantType.CONVERSATIONAL, name: 'Conversational RAG' },
    // { value: RagVariantType.ITERATIVE, name: 'Iterative RAG' },
    // { value: RagVariantType.GENERATIVE_AI, name: 'Generative RAG' },
    // { value: RagVariantType.XAI, name: 'Explainable RAG' },
    // { value: RagVariantType.CONTEXT_CACHE, name: 'Context Cache in LLM RAG' },
    // { value: RagVariantType.GROKKING, name: 'Grokking RAG' },
];

export const queryExpansionOptions = [
    { value: 'pseudo-relevance-feedback', name: 'Pseudo Relevance Feedback' },
    { value: 'hyde', name: 'HyDE (Hypothetical Document Embeddings)' },
];

export const reRankingOptions = [
    { value: AlgorithmicRankingOptionsType.BM25, name: 'BM25' },
    { value: AlgorithmicRankingOptionsType.TF_IDF, name: 'TF-IDF' },
];

export const ragTypeDescriptions = [
    {
        ragType: RagVariantType.STANDARD,
        description:
            'A classic retrieve-then-generate pipeline that pulls the top-K most relevant passages from your index and conditions a generative model on them to produce an answer—straightforward, reliable grounding of LLM outputs',
    },
    {
        ragType: RagVariantType.CUSTOM,
        description:
            'A flexible “pick-and-mix” mode where you compose your own RAG workflow by combining any of the available patterns (e.g. Fusion, Speculative, Iterative, Corrective, etc.) into a single, bespoke retrieval + generation configuration.',
    },
    {
        ragType: RagVariantType.CORRECTIVE,
        description:
            'Generates a response, then self-checks against trusted sources and runs a correction loop to fix inaccuracies before delivering the final answer.',
    },
    {
        ragType: RagVariantType.SPECULATIVE,
        description:
            'Anticipates user needs by pre-fetching data based on predicted follow-up queries, so it’s “halfway there” when the actual request arrives',
    },
    {
        ragType: RagVariantType.FUSION,
        description:
            'Fusion RAG improves upon standard RAG by using multiple queries (e.g., reformulated or diverse sub-queries) to retrieve documents and then fusing the results before generation. This helps cover different facets of the question and reduces the chance of missing relevant context.',
    },
    {
        ragType: RagVariantType.MEMO,
        description:
            'Acts as a “memory bank,” storing key interaction details and retrieving them to maintain continuity across sessions.',
    },
    {
        ragType: RagVariantType.CONVERSATIONAL,
        description:
            'Designed for natural, interactive dialogue, it pulls in both relevant documents and recent conversational context to craft seamless, context-aware responses.',
    },
    {
        ragType: RagVariantType.ITERATIVE,
        description:
            'Refines answers through multiple retrieve–generate loops, learning from each pass to deliver increasingly accurate solutions.',
    },
    {
        ragType: RagVariantType.GENERATIVE_AI,
        description:
            'Combines retrieved context with creative generation to produce original content or ideas, ideal for marketing copy, brainstorming, etc.',
    },
    {
        ragType: RagVariantType.EXPLAINABLE_RAG,
        description:
            'Builds in an explainability layer, tracing how each piece of information was retrieved and used so users see the reasoning behind the answer.',
    },
    {
        ragType: RagVariantType.CONTEXT_CACHE,
        description:
            'Maintains an in-LLM cache of recent context, pulling from it first to ensure responses stay coherent with prior interactions.',
    },
    {
        ragType: RagVariantType.GROKKING,
        description:
            '“Intuitively” grasps deep, complex concepts by retrieving detailed technical documents and synthesizing them into accessible insights.',
    },
    {
        ragType: RagVariantType.SELF,
        description:
            'Self RAG (Self-Reflective Retrieval-Augmented Generation) enhances standard RAG by allowing the model to evaluate and refine its own retrieval and generation steps. It reflects on whether the retrieved documents sufficiently answer the question and can re-query or adjust its answer accordingly, improving accuracy and reliability.',
    },
];

export const graphRagTypeDescriptions = [
    {
        ragType: GraphRagType.STANDARDRAG,
        description:
            'A classic retrieve-then-generate pipeline that pulls the top-K most relevant passages from your index and conditions a generative model on them to produce an answer—straightforward, reliable grounding of LLM outputs.',
    },
    {
        ragType: GraphRagType.CORRECTIVERAG,
        description:
            'Generates a response, then self-checks against trusted sources and runs a correction loop to fix inaccuracies before delivering the final answer.',
    },
    {
        ragType: GraphRagType.KG2RAG,
        description:
            'An augmented generation system that leverages structured knowledge from knowledge graphs alongside unstructured text—combining symbolic reasoning with neural generation for fact-rich, traceable answers.',
    },
];

export const iterativeRetrievalMethodOptions = [
    { value: 'nrr', name: 'Neighborhood Re-retrieval (NRR)' },
    { value: 'drr', name: 'Document Re-retrieval (DRR)' },
];

export const distanceMetricsOptions = [
    {
        value: 'cosine',
        name: 'Cosine',
        description: 'Popular in text retrieval and embeddings—focuses on direction (“topic”) rather than length.',
    },
    {
        value: 'euclidean',
        name: 'Euclidean',
        description: 'Quickly scores “raw” similarity—higher when large components line up.',
    },
    { value: 'dot_product', name: 'Dot Product', description: 'Absolute difference in n-dimensional space.' },
];

export type SourceAttributes = {
    provider?: string;
    collectionName?: string;
    endpoint?: string;
    dimension?: number;
    distanceMetric?: string;
    chunks?: string[];
    embeddingType?: string;
    databaseName?: string;
    credentials?: string;
    queryLanguage?: string;
    url?: string;
    schema?: string;
    indexName?: string;
    connectionString?: string;
    host?: string;
    port?: number;
    cacheSize?: number;
    evictionPolicy?: string;
};

export type SourceIndexConfig = {
    databaseType: string;
    indexName: string;
    indexType: string;
    indexSubtype?: string;
    granularityLevel: string;
    attributes: SourceAttributes;
    metadataTypes: string[];
    displayName: string;
};

export type SourcesIndexes = {
    [key in SourceType]: SourceIndexConfig;
};

export const sourcesIndexes: SourcesIndexes = {
    [SourceType.PROVIDER_SERVICE_EMBEDDINGS]: {
        databaseType: 'vector_database',
        indexName: 'provider_service_embeddings',
        displayName: 'Provider Service Embeddings',
        indexType: 'dense',
        indexSubtype: 'HNSW',
        granularityLevel: 'chunk',
        attributes: {
            provider: 'Pinecone',
            collectionName: 'provider-service-embeddings',
            endpoint: 'https://api.pinecone.io/vectors',
            dimension: 768,
            distanceMetric: 'Cosine',
            chunks: ['chunk_001', 'chunk_002'],
            embeddingType: 'DPR',
        },
        metadataTypes: ['provider', 'carrier', 'patient', 'department'],
    },

    [SourceType.CLAIMS_RELATIONSHIP_GRAPH]: {
        databaseType: 'graph_database',
        indexName: 'claims_relationship_graph',
        displayName: 'Claims Relationship Graph',
        indexType: 'sparse',
        granularityLevel: 'document',
        attributes: {
            provider: 'Neo4j',
            endpoint: 'bolt://localhost:7687',
            databaseName: 'claimsDB',
            credentials: 'vault://neo4j/credentials',
            queryLanguage: 'Cypher',
            indexName: 'claims_relationship_graph_index',
        },
        metadataTypes: ['claimId', 'customerId', 'policyType', 'relationshipType'],
    },

    [SourceType.LEGACY_POLICY_TRANSACTIONS]: {
        databaseType: 'transactional_database',
        indexName: 'legacy_policy_transactions',
        displayName: 'Legacy Policy Transactions',
        indexType: 'sparse',
        granularityLevel: 'document',
        attributes: {
            provider: 'PostgreSQL',
            url: 'postgresql://db.insurance.local:5432',
            databaseName: 'insuranceDB',
            schema: 'public',
        },
        metadataTypes: ['transactionId', 'amount', 'transactionDate', 'status'],
    },

    [SourceType.CARRIER_RULES_DOCUMENTS]: {
        databaseType: 'nosql_database',
        indexName: 'carrier_rules_documents',
        displayName: 'Carrier Rules Documents',
        indexType: 'sparse',
        granularityLevel: 'document',
        attributes: {
            provider: 'MongoDB',
            connectionString: 'mongodb://localhost:27017',
            databaseName: 'carrierDB',
            collectionName: 'rules',
        },
        metadataTypes: ['policyType', 'ruleCategory', 'effectiveDate', 'documentId'],
    },

    [SourceType.LEGACY_SESSION_POLICY_CACHE]: {
        databaseType: 'in_memory_database',
        indexName: 'legacy_session_policy_cache',
        displayName: 'Legacy Session Policy Cache',
        indexType: 'sparse',
        granularityLevel: 'document',
        attributes: {
            provider: 'Redis',
            host: 'localhost',
            port: 6379,
            cacheSize: 1000,
            evictionPolicy: 'LRU',
        },
        metadataTypes: ['sessionId', 'userId', 'cacheKey', 'lastAccessTime'],
    },
};

export const hybridSearchOptions: IOption[] = [
    { label: 'BM25', value: 'BM25' },
    { label: 'TF-IDF', value: 'TF-IDF' },
];
