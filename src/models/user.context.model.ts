export interface IUser {
    id?: number;
    userPrinciple?: string;
    workspaces?: IUserWorkspace[];
    groups: IGroup[];
}

export interface IGroup {
    id: number;
    userId: number;
    groupId: number;
    isActive: boolean;
    isDeleted: boolean;
    isVerified: boolean;
    createdAt: string;
    createdBy: number;
    updatedAt: string;
    updatedBy: number;
    group: IUserGroup;
}

export interface IUserGroup {
    id: number;
    name: string;
    roleId: number;
    workspaceId: unknown;
    isDeleted: boolean;
    createdAt: string;
    createdBy: number;
    updatedAt: string;
    updatedBy: number;
    workspace: IUserWorkspace;
    role: IRole;
}

export interface IRole {
    id: number;
    name: string;
    description: string;
    isDeleted: boolean;
    createdAt: string;
    createdBy: number;
    updatedAt: string;
    updatedBy: number;
}

export interface UserContextResponse {
    user: IUser;
}

export interface IUserWorkspace {
    id: number;
    uuid: string;
    name: string;
    roles: string[];
    description: string;
    isDeleted: boolean;
    createdAt: string;
    createdBy: number;
    updatedAt: string;
    updatedBy: number;
}
