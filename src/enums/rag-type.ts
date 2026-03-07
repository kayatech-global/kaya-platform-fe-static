export enum RetrieverType {
    NONE = 'None',
    TF_IDF = 'TF-IDF',
    BM25 = 'BM25',
    TEXT_EMBEDDING_3 = 'text-embedding-3',
    DENSE_PASSAGE_RETRIEVER = 'Dense Passage Retriever (DPR)',
    COL_BERT = 'ColBERT',
    ROCKET_QA = 'RocketQA',
}

export enum MemoryModeType {
    NONE = 'None',
    CONTEXT_CACHE = 'Context Cache',
    MEMO_INDEXING = 'Memo Indexing',
    CONVERSATIONAL_RETRIEVAL = 'Conversational Retrieval',
}

export enum RerankingType {
    CROSS_ENCODER = 'Cross-encoder',
    POLY_ENCODER = 'Poly-encoder',
    BM25 = 'BM25',
}

export enum CrossEncoderModelType {
    NONE = 'None',
    BERT = 'BERT',
    ROBERTA = 'RoBERTa',
    MONO_T5 = 'MonoT5',
}

export enum GrokkingDepthType {
    NONE = 'None',
    SHALLOW = 'shallow',
    MEDIUM = 'medium',
    DEEP = 'deep',
}

export enum FeedbackIntegrationType {
    NONE = 'None',
    RERANK = 'rerank',
    REWRITER = 'rewriter',
    FALLBACK = 'fallback',
}

export enum PromptingStrategyType {
    CHAIN_OF_THOUGHT = 'Chain of Thought',
    EVIDENTIAL = 'Evidential',
}

export enum FusionStrategyType {
    RRF = 'RRF',
    LINEAR_WEIGHTED_FUSION = 'Linear Weighted Fusion',
}

export enum SourceType {
    PROVIDER_SERVICE_EMBEDDINGS = 'Provider Service Embeddings',
    CLAIMS_RELATIONSHIP_GRAPH = 'Claims Relationship Graph',
    LEGACY_POLICY_TRANSACTIONS = 'Legacy Policy Transactions',
    CARRIER_RULES_DOCUMENTS = 'Carrier Rules Documents',
    LEGACY_SESSION_POLICY_CACHE = 'Legacy Session Policy Cache',
}

export enum FilterType {
    FILTER_THEN_VECTOR = 'filter_then_vector',
    VECTOR_THEN_FILTER = 'vector-then-filter',
}

export enum RagModeType {
    BASIC = 'BASIC',
    ADVANCED = 'ADVANCED',
}

export enum RagVariantType {
    STANDARD = 'STANDARD',
    CUSTOM = 'CUSTOM',
    CORRECTIVE = 'CORRECTIVE',
    SPECULATIVE = 'SPECULATIVE',
    FUSION = 'FUSION',
    REFEED_RETRIEVAL_FEEDBACK = 'REFEED_RETRIEVAL_FEEDBACK',
    REALM = 'REALM',
    RAPTOR = 'RAPTOR',
    REPLUG = 'REPLUG',
    MEMO = 'MEMO',
    RETRO = 'RETRO',
    AUTO = 'AUTO',
    CONVERSATIONAL = 'CONVERSATIONAL',
    ITERATIVE = 'ITERATIVE',
    GENERATIVE_AI = 'GENERATIVE_AI',
    XAI = 'XAI',
    CONTEXT_CACHE = 'CONTEXT_CACHE',
    GROKKING = 'GROKKING',
    EXPLAINABLE_RAG = 'EXPLAINABLE_RAG',
    SELF = 'SELF_RAG',
}

export enum ReRankingType {
    ALGORITHMIC = 'Algorithmic Re-rankers',
    MODELS = 'Re-ranker Models',
}

export enum AlgorithmicRankingOptionsType {
    TF_IDF = 'TF-IDF',
    BM25 = 'BM25',
}

export enum IterativeRetrievalMethodType {
    NRR = 'nrr',
    DRR = 'drr',
}

export enum RAGRetrievalStrategyType {
    SIMILARITY = 'similarity',
    MMR = 'mmr',
    SIMILARITY_SCORE_THRESHOLD = 'similarity_score_threshold',
}

export enum DistanceMetricType {
    COSINE = 'cosine',
    EUCLIDEAN = 'euclidean',
    DOT_PRODUCT = 'dot-product',
}
