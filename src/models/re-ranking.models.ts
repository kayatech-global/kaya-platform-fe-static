import { IOption } from './common.model';

export interface IReRanking {
    id?: string;
    name: string;
    description: string;
    provider: string;
    modelName: string;
    configurations: IReRankingConfiguration;
    modelNameOption?: IOption;
    isReadOnly?: boolean;
}

export interface IReRankingConfiguration {
    apiKey: string;
    baseURL: string;
}
