export enum DatabaseItemType {
    VECTOR = 'Vector Database',
    GRAPH = 'Graph Database',
    RELATIONAL = 'Relational Database',
    NOSQL = 'NoSQL Database',
}

export enum DatabaseProviderType {
    PGVECTOR = 'PostgreSQL (PGVector)',
    CHROMA = 'Chroma',
    NEO4J = 'Neo4J',
    POSTGRESQL = 'PostgreSQL',
    MYSQL = 'MySQL',
    MONGODB = 'MongoDB',
    PINECONE = 'Pinecone',
    AMAZONNEPTUNE = 'Amazon Neptune',
    REDSHIFT = 'Amazon Redshift',
}
