/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IVariableResponse {
    id?: string;
    name: string;
    dataType: string;
    description: string;
}

export interface IVariable extends IVariableResponse {
    isReadOnly?: boolean;
}

export interface IVariableOption {
    id?: string;
    label: string;
    value: any;
    type?: string;
    isStrict?: boolean;
}
