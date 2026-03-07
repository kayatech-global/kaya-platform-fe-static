/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataType } from '@/enums';

export interface IConnectorGenerateQuery {
    databaseSchema: string;
    userPrompt: string;
    schema?: File[];
    generatedQuery?: string;
    databaseId?: string;
}

export interface IConnectorTestQuery {
    databaseId: string;
    query: string;
    parameters: IConnectorTestQueryParams[];
}

export interface IConnectorTestQueryParams {
    key: string;
    value: any;
    type?: DataType;
}

export interface IGenerateQueryResponse {
    generatedQuery: string;
}
