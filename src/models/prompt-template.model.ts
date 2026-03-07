export interface IPromptTemplateForm {
    id?: string;
    promptKey: string;
    promptDescription: string;
    prompt: string;
    isReadOnly?: boolean;
}

export interface IPromptTemplate {
    name: string;
    description: string;
    configurations: {
        prompt_template: string;
    };
}
