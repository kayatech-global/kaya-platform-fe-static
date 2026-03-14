import { IKeycloakUser } from './keycloak.model';
import { IUserWorkspace, IRole } from './user.context.model';

export interface IProfileRoleMembership {
    role: IRole;
    workspace: IUserWorkspace | null;
    scope: 'global' | 'workspace';
}

export interface IUserProfile extends IKeycloakUser {
    avatarUrl?: string;
    timezone?: string;
    createdAt: string;
    updatedAt: string;
    roles: IProfileRoleMembership[];
}
