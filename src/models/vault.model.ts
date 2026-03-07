export interface IVaultForm {
    id?: string;
    vaultKey: string;
    vaultDescription: string;
    vaultValue: string;
    isReadOnly?: boolean;
}

export interface IVault {
    id?: string;
    keyName?: string;
    description: string;
    keyValue: string;
    isActive?: boolean;
    isReadOnly?: boolean;
}
