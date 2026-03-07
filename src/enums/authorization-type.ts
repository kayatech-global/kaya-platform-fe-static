export enum AuthorizationType {
    Empty = '',
    NoAuthorization = 'no-auth',
    BasicAuth = 'basic-auth',
    BearerToken = 'bearer-token',
    APIKey = 'api-key',
    SSO = 'sso',
    OAUTH2 = 'oauth2',
    SASLORSCRAM = 'sasl-scram',
    Kerberose = 'Kerberose',
    // New auth types for Swagger/OpenAPI
    DigestAuth = 'digest-auth',
    OpenIDConnect = 'openid-connect',
    MutualTLS = 'mutual-tls',
    CustomHTTP = 'custom-http',
}

export enum AuthenticationType {
    Empty = '',
    NoAuthentication = 'no-auth',
    BasicAuth = 'basic-auth',
    BearerToken = 'bearer-token',
    SASLORSCRAM = 'sasl-scram',
    Kerberose = 'Kerberose',
    TLS = 'msk-tls',
}

export enum IConnectorAuthorizationType {
    Empty = '',
    NoAuthorization = 'no-auth',
    BasicAuth = 'basic_auth',
    OAUTH2 = 'oauth2',
    clientCredentials = 'client_credentials',
}

export enum AuthenticationGrantType {
    Empty = '',
    ClientCredentials = 'client_credentials',
}
