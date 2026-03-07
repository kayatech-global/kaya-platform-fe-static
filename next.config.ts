import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    env: {
        KEYCLOAK_REALM: process.env.KEYCLOAK_REALM,
        KEYCLOAK_AUTH_SERVER_URL: process.env.KEYCLOAK_AUTH_SERVER_URL,
        KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
        BASE_API_URL: process.env.BASE_API_URL,
        CHAT_BOT_URL: process.env.CHAT_BOT_URL,
        NEXT_PUBLIC_MAX_WORKER_LIMIT: process.env.NEXT_PUBLIC_MAX_WORKER_LIMIT,
    },
    productionBrowserSourceMaps: false,
    // temp disable es-list
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
