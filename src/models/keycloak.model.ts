import { IUser } from "./user.context.model";

export enum keycloakIDPStatus {
    NEW = 'NEW',
    OLD = 'OLD',
}

export interface IKeycloakAttributes {
    idp?: unknown[];
    status?: keycloakIDPStatus[];
}

export interface IKeycloakUser {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
    attributes: IKeycloakAttributes;
    name: string;
    user?: IUser;
}