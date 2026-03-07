import { EmbeddingProviderType } from '@/enums';
import { IOption } from './common.model';

export interface IEmbedding {
    id?: string;
    name: string;
    description: string;
    provider: EmbeddingProviderType | string;
    modelName: string;
    configurations: IEmbeddingConfiguration;
    modelNameOption?: IOption;
    isReadOnly?: boolean;
}

export interface IEmbeddingConfiguration {
    apiKey: string;
    dimensions: number | undefined;
    baseURL: string;
    secretKey?: string;
    accessKeyId?: string;
    region?: string;
}
