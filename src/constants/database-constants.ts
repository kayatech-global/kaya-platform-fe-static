import { DatabaseItemType, DatabaseProviderType } from '@/enums';
import { IDatabaseType } from '@/models';

export const DATABASE_LIST: IDatabaseType[] = [
    {
        name: 'Vector Database',
        type: DatabaseItemType.VECTOR,
        providers: [DatabaseProviderType.PGVECTOR, DatabaseProviderType.CHROMA],
    },
    {
        name: 'Graph Database',
        type: DatabaseItemType.GRAPH,
        providers: [DatabaseProviderType.NEO4J],
    },
    {
        name: 'Transaction Database',
        type: DatabaseItemType.RELATIONAL,
        providers: [DatabaseProviderType.POSTGRESQL, DatabaseProviderType.MYSQL, DatabaseProviderType.REDSHIFT],
    },
    {
        name: 'NoSQL Database',
        type: DatabaseItemType.NOSQL,
        providers: [DatabaseProviderType.MONGODB],
    },
];
