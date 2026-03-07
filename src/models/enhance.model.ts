import { PlatformConfigurationType } from '@/enums';
import { IOption } from './common.model';

export interface IEnhanceForm {
    promptFramework?: {
        type: string;
        title: string;
        description: string;
    };
    intelligentSource?: {
        id: string;
        isSLM: boolean;
    };
    promptFrameworkType: string;
    currentPrompt: string;
    enhancedPrompt?: string;
    promptFrameworkOption?: IOption;
}

export interface IIntelligenceSourceForm {
    id: string;
    isSLM: boolean;
    type?: string;
}

export interface IPlatformSettingResponse {
    key: PlatformConfigurationType;
    value: string;
}

export interface IPlatformSettingData {
    id: string;
    isSLM: boolean;
    isDeleted?: boolean;
}
