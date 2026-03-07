import { OptionModel } from '@/components';
import { AuthenticationGrantType } from '@/enums';

export const API_AUTHENTICATION_GRANT_TYPES: OptionModel[] = [
    {
        name: 'Client Credentials',
        value: AuthenticationGrantType.ClientCredentials,
    },
];
