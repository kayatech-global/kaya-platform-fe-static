'use client';

import { useState } from 'react';
import { 
    Button, 
    Input, 
    Switch, 
    Label, 
    Badge, 
    Select, 
    Textarea,
    VaultSelector,
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogBody, 
    DialogFooter 
} from '@/components';
import { IAgentForm } from '@/models';
import { 
    Plug2, 
    Mail, 
    MessageSquare, 
    Phone, 
    HardDrive, 
    Clock,
    Check,
    Settings,
    Cloud,
    Info,
    Shield,
    ExternalLink,
    Terminal,
    Globe,
    Search,
    Bug,
    Monitor,
    FileCode
} from 'lucide-react';
import { Control, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { useVaultSecretsFetcher } from '@/hooks/use-vault-common';

interface ExecutionPrimitivesSectionProps {
    control: Control<IAgentForm>;
    watch: UseFormWatch<IAgentForm>;
    setValue: UseFormSetValue<IAgentForm>;
    isReadOnly?: boolean;
}

type PrimitiveKey = 
    | 'amazonSES'
    | 'microsoftOutlook'
    | 'slack'
    | 'microsoftTeams'
    | 'twilio'
    | 'amazonS3'
    | 'azureBlobStorage'
    | 'googleCloudStorage'
    | 'sharePoint'
    | 'cron'
    | 'bash'
    | 'requests'
    | 'httpx'
    | 'serpapi'
    | 'scrapy'
    | 'playwright'
    | 'jupyterKernel';

interface ConfigField {
    key: string;
    label: string;
    type: 'text' | 'password' | 'select' | 'textarea';
    placeholder: string;
    required: boolean;
    helpText?: string;
    options?: { name: string; value: string }[];
}

interface PrimitiveDefinition {
    key: PrimitiveKey;
    name: string;
    description: string;
    icon: React.ReactNode;
    category: 'email' | 'messaging' | 'storage' | 'scheduling' | 'shell' | 'http' | 'scraping' | 'notebook';
    docsUrl?: string;
    fields: ConfigField[];
}

const primitiveDefinitions: PrimitiveDefinition[] = [
    {
        key: 'amazonSES',
        name: 'Amazon SES',
        description: 'Send transactional and marketing emails via Amazon Simple Email Service',
        icon: <Mail size={16} />,
        category: 'email',
        docsUrl: 'https://docs.aws.amazon.com/ses/',
        fields: [
            { key: 'accessKeyId', label: 'Access Key ID', type: 'text', placeholder: 'AKIAIOSFODNN7EXAMPLE', required: true, helpText: 'IAM user access key with SES permissions' },
            { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', placeholder: 'Enter your AWS secret access key', required: true, helpText: 'Keep this secure and never share it' },
            { key: 'region', label: 'AWS Region', type: 'select', placeholder: 'Select region', required: true, helpText: 'SES is regional - use verified region', options: [
                { name: 'US East (N. Virginia) - us-east-1', value: 'us-east-1' },
                { name: 'US East (Ohio) - us-east-2', value: 'us-east-2' },
                { name: 'US West (Oregon) - us-west-2', value: 'us-west-2' },
                { name: 'EU (Ireland) - eu-west-1', value: 'eu-west-1' },
                { name: 'EU (Frankfurt) - eu-central-1', value: 'eu-central-1' },
                { name: 'Asia Pacific (Mumbai) - ap-south-1', value: 'ap-south-1' },
                { name: 'Asia Pacific (Singapore) - ap-southeast-1', value: 'ap-southeast-1' },
                { name: 'Asia Pacific (Sydney) - ap-southeast-2', value: 'ap-southeast-2' },
                { name: 'Asia Pacific (Tokyo) - ap-northeast-1', value: 'ap-northeast-1' },
            ]},
            { key: 'fromEmail', label: 'Default From Email', type: 'text', placeholder: 'noreply@yourdomain.com', required: true, helpText: 'Must be a verified email address or domain in SES' },
            { key: 'fromName', label: 'Default From Name', type: 'text', placeholder: 'Your Company Name', required: false, helpText: 'Display name shown to recipients' },
            { key: 'replyToEmail', label: 'Reply-To Email', type: 'text', placeholder: 'support@yourdomain.com', required: false, helpText: 'Where replies will be sent' },
            { key: 'configurationSetName', label: 'Configuration Set', type: 'text', placeholder: 'my-configuration-set', required: false, helpText: 'Optional SES configuration set for tracking' },
        ],
    },
    {
        key: 'microsoftOutlook',
        name: 'Microsoft Outlook',
        description: 'Send emails and manage calendar events via Microsoft Graph API',
        icon: <Mail size={16} />,
        category: 'email',
        docsUrl: 'https://docs.microsoft.com/en-us/graph/outlook-mail-concept-overview',
        fields: [
            { key: 'clientId', label: 'Application (Client) ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', required: true, helpText: 'From Azure AD App Registration' },
            { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Enter your client secret value', required: true, helpText: 'Secret value (not secret ID)' },
            { key: 'tenantId', label: 'Directory (Tenant) ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', required: true, helpText: 'Your Azure AD tenant ID' },
            { key: 'userEmail', label: 'Sender Email Address', type: 'text', placeholder: 'sender@yourcompany.com', required: true, helpText: 'Email account to send from (needs Mail.Send permission)' },
            { key: 'redirectUri', label: 'Redirect URI', type: 'text', placeholder: 'https://yourapp.com/auth/callback', required: false, helpText: 'Required for delegated auth flow' },
            { key: 'scopes', label: 'API Scopes', type: 'text', placeholder: 'Mail.Send Mail.ReadWrite Calendars.ReadWrite', required: false, helpText: 'Space-separated list of Microsoft Graph permissions' },
        ],
    },
    {
        key: 'slack',
        name: 'Slack',
        description: 'Send messages, create channels, and interact with Slack workspaces',
        icon: <MessageSquare size={16} />,
        category: 'messaging',
        docsUrl: 'https://api.slack.com/docs',
        fields: [
            { key: 'botToken', label: 'Bot User OAuth Token', type: 'password', placeholder: 'xoxb-xxxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx', required: true, helpText: 'Starts with xoxb- (from OAuth & Permissions page)' },
            { key: 'signingSecret', label: 'Signing Secret', type: 'password', placeholder: 'Enter your app signing secret', required: true, helpText: 'From Basic Information page - verifies requests are from Slack' },
            { key: 'appId', label: 'App ID', type: 'text', placeholder: 'A0XXXXXXXXX', required: false, helpText: 'Your Slack App ID' },
            { key: 'defaultChannel', label: 'Default Channel', type: 'text', placeholder: 'C0XXXXXXXXX or #general', required: false, helpText: 'Channel ID or name for default messages' },
            { key: 'appToken', label: 'App-Level Token', type: 'password', placeholder: 'xapp-x-xxxxxxxxxxxx-xxxxxxxxxxxx-xxxx', required: false, helpText: 'Required for Socket Mode (starts with xapp-)' },
        ],
    },
    {
        key: 'microsoftTeams',
        name: 'Microsoft Teams',
        description: 'Send messages, notifications, and cards to Teams channels',
        icon: <MessageSquare size={16} />,
        category: 'messaging',
        docsUrl: 'https://docs.microsoft.com/en-us/microsoftteams/platform/',
        fields: [
            { key: 'webhookUrl', label: 'Incoming Webhook URL', type: 'password', placeholder: 'https://xxxxx.webhook.office.com/webhookb2/...', required: true, helpText: 'From Teams channel connectors - simplest integration method' },
            { key: 'clientId', label: 'Application (Client) ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', required: false, helpText: 'Required for Bot Framework integration' },
            { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Enter your client secret', required: false, helpText: 'Required for Bot Framework integration' },
            { key: 'tenantId', label: 'Directory (Tenant) ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', required: false, helpText: 'Your Azure AD tenant ID' },
            { key: 'botId', label: 'Bot ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', required: false, helpText: 'Bot registration ID from Azure Bot Service' },
        ],
    },
    {
        key: 'twilio',
        name: 'Twilio',
        description: 'Send SMS, MMS, WhatsApp messages, and make voice calls',
        icon: <Phone size={16} />,
        category: 'messaging',
        docsUrl: 'https://www.twilio.com/docs',
        fields: [
            { key: 'accountSid', label: 'Account SID', type: 'text', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true, helpText: 'Found on Twilio Console dashboard' },
            { key: 'authToken', label: 'Auth Token', type: 'password', placeholder: 'Enter your Twilio auth token', required: true, helpText: 'Keep this secure - used to authenticate API requests' },
            { key: 'fromNumber', label: 'From Phone Number', type: 'text', placeholder: '+15551234567', required: true, helpText: 'Your Twilio phone number in E.164 format' },
            { key: 'messagingServiceSid', label: 'Messaging Service SID', type: 'text', placeholder: 'MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: false, helpText: 'Optional - use for advanced messaging features' },
            { key: 'statusCallbackUrl', label: 'Status Callback URL', type: 'text', placeholder: 'https://yourapp.com/webhooks/twilio/status', required: false, helpText: 'Receive delivery status updates' },
        ],
    },
    {
        key: 'amazonS3',
        name: 'Amazon S3',
        description: 'Store, retrieve, and manage files in Amazon S3 buckets',
        icon: <HardDrive size={16} />,
        category: 'storage',
        docsUrl: 'https://docs.aws.amazon.com/s3/',
        fields: [
            { key: 'accessKeyId', label: 'Access Key ID', type: 'text', placeholder: 'AKIAIOSFODNN7EXAMPLE', required: true, helpText: 'IAM user access key with S3 permissions' },
            { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', placeholder: 'Enter your AWS secret access key', required: true, helpText: 'Keep this secure and never share it' },
            { key: 'region', label: 'AWS Region', type: 'select', placeholder: 'Select region', required: true, helpText: 'Region where your bucket is located', options: [
                { name: 'US East (N. Virginia) - us-east-1', value: 'us-east-1' },
                { name: 'US East (Ohio) - us-east-2', value: 'us-east-2' },
                { name: 'US West (N. California) - us-west-1', value: 'us-west-1' },
                { name: 'US West (Oregon) - us-west-2', value: 'us-west-2' },
                { name: 'EU (Ireland) - eu-west-1', value: 'eu-west-1' },
                { name: 'EU (Frankfurt) - eu-central-1', value: 'eu-central-1' },
                { name: 'EU (London) - eu-west-2', value: 'eu-west-2' },
                { name: 'Asia Pacific (Mumbai) - ap-south-1', value: 'ap-south-1' },
                { name: 'Asia Pacific (Singapore) - ap-southeast-1', value: 'ap-southeast-1' },
                { name: 'Asia Pacific (Sydney) - ap-southeast-2', value: 'ap-southeast-2' },
                { name: 'Asia Pacific (Tokyo) - ap-northeast-1', value: 'ap-northeast-1' },
            ]},
            { key: 'bucketName', label: 'Bucket Name', type: 'text', placeholder: 'my-bucket-name', required: true, helpText: 'S3 bucket name (must be globally unique)' },
            { key: 'basePath', label: 'Base Path', type: 'text', placeholder: 'uploads/agents/', required: false, helpText: 'Optional prefix for all object keys' },
            { key: 'endpoint', label: 'Custom Endpoint', type: 'text', placeholder: 'https://s3.custom-endpoint.com', required: false, helpText: 'For S3-compatible storage (MinIO, etc.)' },
        ],
    },
    {
        key: 'azureBlobStorage',
        name: 'Azure Blob Storage',
        description: 'Store and manage unstructured data in Azure Blob Storage',
        icon: <Cloud size={16} />,
        category: 'storage',
        docsUrl: 'https://docs.microsoft.com/en-us/azure/storage/blobs/',
        fields: [
            { key: 'connectionString', label: 'Connection String', type: 'password', placeholder: 'DefaultEndpointsProtocol=https;AccountName=...', required: true, helpText: 'Full connection string from Azure Portal (Access keys)' },
            { key: 'containerName', label: 'Container Name', type: 'text', placeholder: 'my-container', required: true, helpText: 'Blob container name' },
            { key: 'accountName', label: 'Storage Account Name', type: 'text', placeholder: 'mystorageaccount', required: false, helpText: 'Alternative to connection string' },
            { key: 'accountKey', label: 'Account Key', type: 'password', placeholder: 'Enter your storage account key', required: false, helpText: 'Alternative to connection string' },
            { key: 'sasToken', label: 'SAS Token', type: 'password', placeholder: 'sv=2021-06-08&ss=b&srt=sco...', required: false, helpText: 'Shared Access Signature for limited access' },
            { key: 'basePath', label: 'Base Path', type: 'text', placeholder: 'uploads/', required: false, helpText: 'Optional prefix for all blob names' },
        ],
    },
    {
        key: 'googleCloudStorage',
        name: 'Google Cloud Storage',
        description: 'Store and access data on Google Cloud Platform infrastructure',
        icon: <Cloud size={16} />,
        category: 'storage',
        docsUrl: 'https://cloud.google.com/storage/docs',
        fields: [
            { key: 'projectId', label: 'Project ID', type: 'text', placeholder: 'my-project-id', required: true, helpText: 'GCP project ID' },
            { key: 'bucketName', label: 'Bucket Name', type: 'text', placeholder: 'my-bucket-name', required: true, helpText: 'GCS bucket name' },
            { key: 'credentials', label: 'Service Account Key (JSON)', type: 'textarea', placeholder: '{\n  "type": "service_account",\n  "project_id": "...",\n  "private_key_id": "...",\n  ...\n}', required: true, helpText: 'Full JSON key file contents from GCP Console' },
            { key: 'basePath', label: 'Base Path', type: 'text', placeholder: 'uploads/', required: false, helpText: 'Optional prefix for all object names' },
        ],
    },
    {
        key: 'sharePoint',
        name: 'SharePoint',
        description: 'Access and manage documents, lists, and sites in SharePoint Online',
        icon: <HardDrive size={16} />,
        category: 'storage',
        docsUrl: 'https://docs.microsoft.com/en-us/sharepoint/dev/',
        fields: [
            { key: 'clientId', label: 'Application (Client) ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', required: true, helpText: 'From Azure AD App Registration' },
            { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Enter your client secret value', required: true, helpText: 'Secret value from Azure AD' },
            { key: 'tenantId', label: 'Directory (Tenant) ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', required: true, helpText: 'Your Azure AD tenant ID' },
            { key: 'siteUrl', label: 'SharePoint Site URL', type: 'text', placeholder: 'https://yourcompany.sharepoint.com/sites/mysite', required: true, helpText: 'Full URL to your SharePoint site' },
            { key: 'driveId', label: 'Drive ID', type: 'text', placeholder: 'b!xxxxxxxx', required: false, helpText: 'Specific document library drive ID' },
            { key: 'folderPath', label: 'Default Folder Path', type: 'text', placeholder: '/Shared Documents/Uploads', required: false, helpText: 'Default folder for file operations' },
        ],
    },
    {
        key: 'cron',
        name: 'Cron Scheduler',
        description: 'Schedule recurring tasks using standard cron expressions',
        icon: <Clock size={16} />,
        category: 'scheduling',
        docsUrl: 'https://crontab.guru/',
        fields: [
            { key: 'expression', label: 'Cron Expression', type: 'text', placeholder: '0 9 * * MON-FRI', required: true, helpText: 'Standard cron format: minute hour day month weekday' },
            { key: 'timezone', label: 'Timezone', type: 'select', placeholder: 'Select timezone', required: true, helpText: 'Timezone for schedule execution', options: [
                { name: 'UTC', value: 'UTC' },
                { name: 'America/New_York (EST/EDT)', value: 'America/New_York' },
                { name: 'America/Chicago (CST/CDT)', value: 'America/Chicago' },
                { name: 'America/Denver (MST/MDT)', value: 'America/Denver' },
                { name: 'America/Los_Angeles (PST/PDT)', value: 'America/Los_Angeles' },
                { name: 'Europe/London (GMT/BST)', value: 'Europe/London' },
                { name: 'Europe/Paris (CET/CEST)', value: 'Europe/Paris' },
                { name: 'Europe/Berlin (CET/CEST)', value: 'Europe/Berlin' },
                { name: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo' },
                { name: 'Asia/Shanghai (CST)', value: 'Asia/Shanghai' },
                { name: 'Asia/Singapore (SGT)', value: 'Asia/Singapore' },
                { name: 'Asia/Kolkata (IST)', value: 'Asia/Kolkata' },
                { name: 'Australia/Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
            ]},
            { key: 'description', label: 'Schedule Description', type: 'text', placeholder: 'Daily at 9 AM on weekdays', required: false, helpText: 'Human-readable description of the schedule' },
            { key: 'enabled', label: 'Schedule Enabled', type: 'select', placeholder: 'Select status', required: false, helpText: 'Enable or disable this schedule', options: [
                { name: 'Enabled', value: 'true' },
                { name: 'Disabled', value: 'false' },
            ]},
        ],
    },
    // Shell & Command Execution
    {
        key: 'bash',
        name: 'Bash',
        description: 'Execute shell commands and scripts in a secure sandboxed environment',
        icon: <Terminal size={16} />,
        category: 'shell',
        docsUrl: 'https://www.gnu.org/software/bash/manual/',
        fields: [
            { key: 'workingDirectory', label: 'Working Directory', type: 'text', placeholder: '/tmp/agent-workspace', required: false, helpText: 'Default directory for command execution' },
            { key: 'timeout', label: 'Execution Timeout (seconds)', type: 'text', placeholder: '30', required: false, helpText: 'Maximum execution time before command is killed' },
            { key: 'shellPath', label: 'Shell Path', type: 'text', placeholder: '/bin/bash', required: false, helpText: 'Path to shell executable' },
            { key: 'runAsUser', label: 'Run As User', type: 'text', placeholder: 'agent', required: false, helpText: 'User to execute commands as' },
            { key: 'sudoPassword', label: 'Sudo Password', type: 'password', placeholder: 'Enter sudo password', required: false, helpText: 'Password for sudo operations (if allowed)' },
            { key: 'environmentVariables', label: 'Environment Variables', type: 'textarea', placeholder: 'KEY1=value1\nKEY2=value2', required: false, helpText: 'Additional environment variables (one per line)' },
            { key: 'secretEnvVariables', label: 'Secret Environment Variables', type: 'textarea', placeholder: 'API_KEY=secret_value\nDB_PASSWORD=secret', required: false, helpText: 'Sensitive environment variables (stored encrypted)' },
            { key: 'allowedCommands', label: 'Allowed Commands', type: 'textarea', placeholder: 'ls\ncat\ngrep\ncurl', required: false, helpText: 'Whitelist of allowed commands (one per line, empty = all allowed)' },
            { key: 'sandboxMode', label: 'Sandbox Mode', type: 'select', placeholder: 'Select sandbox level', required: false, helpText: 'Security isolation level', options: [
                { name: 'Strict (recommended)', value: 'strict' },
                { name: 'Standard', value: 'standard' },
                { name: 'Permissive', value: 'permissive' },
            ]},
        ],
    },
    // HTTP Clients
    {
        key: 'requests',
        name: 'Requests',
        description: 'Python Requests library for making HTTP calls with session management',
        icon: <Globe size={16} />,
        category: 'http',
        docsUrl: 'https://docs.python-requests.org/',
        fields: [
            { key: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'https://api.example.com', required: false, helpText: 'Default base URL for all requests' },
            { key: 'authType', label: 'Authentication Type', type: 'select', placeholder: 'Select auth type', required: false, helpText: 'Default authentication method', options: [
                { name: 'None', value: 'none' },
                { name: 'Bearer Token', value: 'bearer' },
                { name: 'Basic Auth', value: 'basic' },
                { name: 'API Key', value: 'apikey' },
            ]},
            { key: 'authToken', label: 'Auth Token / API Key', type: 'password', placeholder: 'Enter token or API key', required: false, helpText: 'Bearer token, API key, or password for authentication' },
            { key: 'authUsername', label: 'Username (Basic Auth)', type: 'text', placeholder: 'Enter username', required: false, helpText: 'Username for Basic authentication' },
            { key: 'timeout', label: 'Request Timeout (seconds)', type: 'text', placeholder: '30', required: false, helpText: 'Default timeout for HTTP requests' },
            { key: 'defaultHeaders', label: 'Default Headers', type: 'textarea', placeholder: 'Content-Type: application/json\nX-Custom-Header: value', required: false, helpText: 'Additional headers (one per line, key: value format)' },
            { key: 'proxyUrl', label: 'Proxy URL', type: 'text', placeholder: 'http://proxy.example.com:8080', required: false, helpText: 'HTTP/HTTPS proxy for all requests' },
            { key: 'proxyUsername', label: 'Proxy Username', type: 'text', placeholder: 'proxy_user', required: false, helpText: 'Username for proxy authentication' },
            { key: 'proxyPassword', label: 'Proxy Password', type: 'password', placeholder: 'Enter proxy password', required: false, helpText: 'Password for proxy authentication' },
            { key: 'verifySsl', label: 'Verify SSL', type: 'select', placeholder: 'Select option', required: false, helpText: 'Verify SSL certificates', options: [
                { name: 'Yes (recommended)', value: 'true' },
                { name: 'No', value: 'false' },
            ]},
            { key: 'maxRetries', label: 'Max Retries', type: 'text', placeholder: '3', required: false, helpText: 'Number of retry attempts for failed requests' },
        ],
    },
    {
        key: 'httpx',
        name: 'HTTPX',
        description: 'Modern async HTTP client with HTTP/2 support and connection pooling',
        icon: <Globe size={16} />,
        category: 'http',
        docsUrl: 'https://www.python-httpx.org/',
        fields: [
            { key: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'https://api.example.com', required: false, helpText: 'Default base URL for all requests' },
            { key: 'authType', label: 'Authentication Type', type: 'select', placeholder: 'Select auth type', required: false, helpText: 'Default authentication method', options: [
                { name: 'None', value: 'none' },
                { name: 'Bearer Token', value: 'bearer' },
                { name: 'Basic Auth', value: 'basic' },
                { name: 'API Key', value: 'apikey' },
            ]},
            { key: 'authToken', label: 'Auth Token / API Key', type: 'password', placeholder: 'Enter token or API key', required: false, helpText: 'Bearer token, API key, or password for authentication' },
            { key: 'authUsername', label: 'Username (Basic Auth)', type: 'text', placeholder: 'Enter username', required: false, helpText: 'Username for Basic authentication' },
            { key: 'timeout', label: 'Request Timeout (seconds)', type: 'text', placeholder: '30', required: false, helpText: 'Default timeout for HTTP requests' },
            { key: 'defaultHeaders', label: 'Default Headers', type: 'textarea', placeholder: 'Content-Type: application/json\nX-Custom-Header: value', required: false, helpText: 'Additional headers (one per line, key: value format)' },
            { key: 'http2', label: 'Enable HTTP/2', type: 'select', placeholder: 'Select option', required: false, helpText: 'Use HTTP/2 protocol when available', options: [
                { name: 'Yes', value: 'true' },
                { name: 'No', value: 'false' },
            ]},
            { key: 'proxyUrl', label: 'Proxy URL', type: 'text', placeholder: 'http://proxy.example.com:8080', required: false, helpText: 'HTTP/HTTPS proxy for all requests' },
            { key: 'proxyUsername', label: 'Proxy Username', type: 'text', placeholder: 'proxy_user', required: false, helpText: 'Username for proxy authentication' },
            { key: 'proxyPassword', label: 'Proxy Password', type: 'password', placeholder: 'Enter proxy password', required: false, helpText: 'Password for proxy authentication' },
            { key: 'maxConnections', label: 'Max Connections', type: 'text', placeholder: '100', required: false, helpText: 'Maximum concurrent connections in the pool' },
            { key: 'verifySsl', label: 'Verify SSL', type: 'select', placeholder: 'Select option', required: false, helpText: 'Verify SSL certificates', options: [
                { name: 'Yes (recommended)', value: 'true' },
                { name: 'No', value: 'false' },
            ]},
        ],
    },
    // Web Scraping & Search
    {
        key: 'serpapi',
        name: 'SerpAPI',
        description: 'Search engine results API for Google, Bing, Yahoo, and more',
        icon: <Search size={16} />,
        category: 'scraping',
        docsUrl: 'https://serpapi.com/search-api',
        fields: [
            { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your SerpAPI key', required: true, helpText: 'Get your API key from serpapi.com' },
            { key: 'defaultEngine', label: 'Default Search Engine', type: 'select', placeholder: 'Select engine', required: false, helpText: 'Default search engine to use', options: [
                { name: 'Google', value: 'google' },
                { name: 'Google Scholar', value: 'google_scholar' },
                { name: 'Google News', value: 'google_news' },
                { name: 'Google Images', value: 'google_images' },
                { name: 'Bing', value: 'bing' },
                { name: 'Yahoo', value: 'yahoo' },
                { name: 'DuckDuckGo', value: 'duckduckgo' },
                { name: 'Baidu', value: 'baidu' },
                { name: 'Yandex', value: 'yandex' },
            ]},
            { key: 'defaultLocation', label: 'Default Location', type: 'text', placeholder: 'United States', required: false, helpText: 'Location for localized search results' },
            { key: 'defaultLanguage', label: 'Default Language', type: 'text', placeholder: 'en', required: false, helpText: 'Language code (e.g., en, es, fr)' },
            { key: 'resultsPerPage', label: 'Results Per Page', type: 'text', placeholder: '10', required: false, helpText: 'Number of results to return per query' },
        ],
    },
    {
        key: 'scrapy',
        name: 'Scrapy',
        description: 'Web scraping framework for extracting structured data from websites',
        icon: <Bug size={16} />,
        category: 'scraping',
        docsUrl: 'https://docs.scrapy.org/',
        fields: [
            { key: 'userAgent', label: 'User Agent', type: 'text', placeholder: 'Mozilla/5.0 (compatible; MyBot/1.0)', required: false, helpText: 'User agent string for web requests' },
            { key: 'downloadDelay', label: 'Download Delay (seconds)', type: 'text', placeholder: '1', required: false, helpText: 'Delay between consecutive requests to same domain' },
            { key: 'concurrentRequests', label: 'Concurrent Requests', type: 'text', placeholder: '16', required: false, helpText: 'Maximum concurrent requests' },
            { key: 'robotsTxtObey', label: 'Obey robots.txt', type: 'select', placeholder: 'Select option', required: false, helpText: 'Respect robots.txt rules', options: [
                { name: 'Yes (recommended)', value: 'true' },
                { name: 'No', value: 'false' },
            ]},
            { key: 'cookiesEnabled', label: 'Enable Cookies', type: 'select', placeholder: 'Select option', required: false, helpText: 'Enable cookie handling', options: [
                { name: 'Yes', value: 'true' },
                { name: 'No', value: 'false' },
            ]},
            { key: 'retryTimes', label: 'Retry Times', type: 'text', placeholder: '2', required: false, helpText: 'Number of retries for failed requests' },
            { key: 'proxyUrl', label: 'Proxy URL', type: 'text', placeholder: 'http://proxy.example.com:8080', required: false, helpText: 'HTTP proxy for web scraping' },
            { key: 'proxyUsername', label: 'Proxy Username', type: 'text', placeholder: 'proxy_user', required: false, helpText: 'Username for proxy authentication' },
            { key: 'proxyPassword', label: 'Proxy Password', type: 'password', placeholder: 'Enter proxy password', required: false, helpText: 'Password for proxy authentication' },
        ],
    },
    {
        key: 'playwright',
        name: 'Playwright',
        description: 'Browser automation for web scraping, testing, and interaction with dynamic pages',
        icon: <Monitor size={16} />,
        category: 'scraping',
        docsUrl: 'https://playwright.dev/python/docs/intro',
        fields: [
            { key: 'browser', label: 'Browser', type: 'select', placeholder: 'Select browser', required: false, helpText: 'Browser engine to use', options: [
                { name: 'Chromium (recommended)', value: 'chromium' },
                { name: 'Firefox', value: 'firefox' },
                { name: 'WebKit (Safari)', value: 'webkit' },
            ]},
            { key: 'headless', label: 'Headless Mode', type: 'select', placeholder: 'Select mode', required: false, helpText: 'Run browser without visible UI', options: [
                { name: 'Yes (recommended)', value: 'true' },
                { name: 'No', value: 'false' },
            ]},
            { key: 'timeout', label: 'Default Timeout (ms)', type: 'text', placeholder: '30000', required: false, helpText: 'Default timeout for navigation and actions' },
            { key: 'viewport', label: 'Viewport Size', type: 'text', placeholder: '1280x720', required: false, helpText: 'Browser viewport dimensions (WxH)' },
            { key: 'userAgent', label: 'User Agent', type: 'text', placeholder: 'Custom user agent string', required: false, helpText: 'Override default user agent' },
            { key: 'proxyServer', label: 'Proxy Server', type: 'text', placeholder: 'http://proxy.example.com:8080', required: false, helpText: 'Proxy server for browser traffic' },
            { key: 'proxyUsername', label: 'Proxy Username', type: 'text', placeholder: 'proxy_user', required: false, helpText: 'Username for proxy authentication' },
            { key: 'proxyPassword', label: 'Proxy Password', type: 'password', placeholder: 'Enter proxy password', required: false, helpText: 'Password for proxy authentication' },
            { key: 'slowMo', label: 'Slow Motion (ms)', type: 'text', placeholder: '0', required: false, helpText: 'Slow down operations by specified milliseconds' },
        ],
    },
    // Notebook & Code Execution
    {
        key: 'jupyterKernel',
        name: 'Jupyter Kernel',
        description: 'Execute Python code in an interactive Jupyter kernel environment',
        icon: <FileCode size={16} />,
        category: 'notebook',
        docsUrl: 'https://jupyter.org/documentation',
        fields: [
            { key: 'connectionType', label: 'Connection Type', type: 'select', placeholder: 'Select connection', required: false, helpText: 'How to connect to Jupyter', options: [
                { name: 'Local Kernel', value: 'local' },
                { name: 'Remote Server', value: 'remote' },
                { name: 'JupyterHub', value: 'hub' },
            ]},
            { key: 'serverUrl', label: 'Jupyter Server URL', type: 'text', placeholder: 'http://localhost:8888', required: false, helpText: 'URL of remote Jupyter server (for remote/hub connections)' },
            { key: 'serverToken', label: 'Server Token', type: 'password', placeholder: 'Enter Jupyter server token', required: false, helpText: 'Authentication token for remote Jupyter server' },
            { key: 'kernelName', label: 'Kernel Name', type: 'select', placeholder: 'Select kernel', required: false, helpText: 'Jupyter kernel to use', options: [
                { name: 'Python 3 (ipykernel)', value: 'python3' },
                { name: 'Python 3.10', value: 'python310' },
                { name: 'Python 3.11', value: 'python311' },
                { name: 'Python 3.12', value: 'python312' },
            ]},
            { key: 'timeout', label: 'Execution Timeout (seconds)', type: 'text', placeholder: '60', required: false, helpText: 'Maximum time for code cell execution' },
            { key: 'workingDirectory', label: 'Working Directory', type: 'text', placeholder: '/tmp/notebooks', required: false, helpText: 'Default working directory for kernel' },
            { key: 'startupCode', label: 'Startup Code', type: 'textarea', placeholder: 'import pandas as pd\nimport numpy as np', required: false, helpText: 'Code executed when kernel starts' },
            { key: 'memoryLimit', label: 'Memory Limit (MB)', type: 'text', placeholder: '1024', required: false, helpText: 'Maximum memory allocation for kernel' },
            { key: 'allowNetworkAccess', label: 'Allow Network Access', type: 'select', placeholder: 'Select option', required: false, helpText: 'Allow kernel to make network requests', options: [
                { name: 'Yes', value: 'true' },
                { name: 'No', value: 'false' },
            ]},
        ],
    },
];

const categoryLabels = {
    email: 'Email Services',
    messaging: 'Messaging & Communication',
    storage: 'Cloud Storage',
    scheduling: 'Scheduling',
    shell: 'Shell & Commands',
    http: 'HTTP & API Clients',
    scraping: 'Web Scraping & Search',
    notebook: 'Code Execution',
};

const categoryIcons = {
    email: <Mail size={14} className="text-gray-500" />,
    messaging: <MessageSquare size={14} className="text-gray-500" />,
    storage: <HardDrive size={14} className="text-gray-500" />,
    scheduling: <Clock size={14} className="text-gray-500" />,
    shell: <Terminal size={14} className="text-gray-500" />,
    http: <Globe size={14} className="text-gray-500" />,
    scraping: <Search size={14} className="text-gray-500" />,
    notebook: <FileCode size={14} className="text-gray-500" />,
};

export const ExecutionPrimitivesSection = ({ 
    control, 
    watch, 
    setValue,
    isReadOnly,
}: ExecutionPrimitivesSectionProps) => {
    const [configModalOpen, setConfigModalOpen] = useState(false);
    const [selectedPrimitive, setSelectedPrimitive] = useState<PrimitiveDefinition | null>(null);
    const [localConfig, setLocalConfig] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Fetch vault secrets for secret fields
    const params = useParams();
    const workspaceId = params?.wid as string;
    const { data: vaultSecrets = [], isLoading: loadingSecrets, refetch: refetchSecrets } = useVaultSecretsFetcher(workspaceId);
    
    // Transform vault secrets to option format for VaultSelector
    const secretOptions = vaultSecrets?.map((secret: { keyName?: string }) => ({
        name: secret.keyName || '',
        value: secret.keyName || '',
    })) || [];

    const executionPrimitives = watch('horizonConfig.executionPrimitives') || {};

    const handleToggle = (primitive: PrimitiveDefinition, enabled: boolean) => {
        if (enabled && !isReadOnly) {
            setSelectedPrimitive(primitive);
            const currentConfig = executionPrimitives[primitive.key]?.config || {};
            setLocalConfig(currentConfig as Record<string, string>);
            setConfigModalOpen(true);
        } else if (!enabled && !isReadOnly) {
            setValue(`horizonConfig.executionPrimitives.${primitive.key}`, { enabled: false });
        }
    };

    const handleConfigSave = () => {
        if (!selectedPrimitive) return;
        
        setIsSaving(true);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue(`horizonConfig.executionPrimitives.${selectedPrimitive.key}` as any, {
            enabled: true,
            config: localConfig,
        } as any);
        
        setTimeout(() => {
            setIsSaving(false);
            setConfigModalOpen(false);
            setSelectedPrimitive(null);
            setLocalConfig({});
        }, 300);
    };

    const handleConfigCancel = () => {
        setConfigModalOpen(false);
        setSelectedPrimitive(null);
        setLocalConfig({});
    };

    const handleConfigChange = (key: string, value: string) => {
        setLocalConfig(prev => ({ ...prev, [key]: value }));
    };

    const openConfigModal = (primitive: PrimitiveDefinition) => {
        setSelectedPrimitive(primitive);
        const currentConfig = executionPrimitives[primitive.key]?.config || {};
        setLocalConfig(currentConfig as Record<string, string>);
        setConfigModalOpen(true);
    };

    const getEnabledCount = () => {
        return Object.values(executionPrimitives).filter(p => p?.enabled).length;
    };

    const groupedPrimitives = primitiveDefinitions.reduce((acc, primitive) => {
        if (!acc[primitive.category]) {
            acc[primitive.category] = [];
        }
        acc[primitive.category].push(primitive);
        return acc;
    }, {} as Record<string, PrimitiveDefinition[]>);

    const isFormValid = () => {
        if (!selectedPrimitive) return false;
        return selectedPrimitive.fields
            .filter(f => f.required)
            .every(f => localConfig[f.key]?.trim());
    };

    return (
        <>
            <div className="col-span-1 sm:col-span-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800">
                            <Plug2 size={16} className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Execution Primitives
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                External tools and services for agent operations
                            </p>
                        </div>
                    </div>
                    {getEnabledCount() > 0 && (
                        <Badge 
                            variant="secondary" 
                            className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        >
                            {getEnabledCount()} Active
                        </Badge>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-6">
                    {Object.entries(groupedPrimitives).map(([category, primitives]) => (
                        <div key={category}>
                            {/* Category Header */}
                            <div className="flex items-center gap-x-2 mb-3">
                                {categoryIcons[category as keyof typeof categoryIcons]}
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    {categoryLabels[category as keyof typeof categoryLabels]}
                                </span>
                            </div>

                            {/* Primitives Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {primitives.map((primitive) => {
                                    const isEnabled = executionPrimitives[primitive.key]?.enabled || false;

                                    return (
                                        <div
                                            key={primitive.key}
                                            className={cn(
                                                "flex items-center justify-between p-3 rounded-lg border transition-all",
                                                isEnabled 
                                                    ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                                                    : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
                                                !isReadOnly && "hover:border-gray-300 dark:hover:border-gray-600"
                                            )}
                                        >
                                            <div className="flex items-center gap-x-3 flex-1 min-w-0">
                                                <div className={cn(
                                                    "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
                                                    isEnabled 
                                                        ? "bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400"
                                                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                                )}>
                                                    {primitive.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                        {primitive.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {primitive.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-x-2 ml-3 shrink-0">
                                                {isEnabled && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openConfigModal(primitive)}
                                                        disabled={isReadOnly}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Settings size={14} />
                                                    </Button>
                                                )}
                                                <Switch
                                                    checked={isEnabled}
                                                    disabled={isReadOnly}
                                                    onCheckedChange={(checked) => handleToggle(primitive, checked)}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Configuration Modal */}
            <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
                <DialogContent className="max-w-[unset] w-[520px] !grid-rows-[auto_1fr_auto] max-h-[85vh]">
                    <DialogHeader className="pb-2 !p-4">
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <span className="text-blue-600 dark:text-blue-400">
                                {selectedPrimitive?.icon}
                            </span>
                            Configure {selectedPrimitive?.name}
                        </DialogTitle>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedPrimitive?.description}
                        </p>
                    </DialogHeader>
                    <DialogBody className="space-y-4 py-3 overflow-y-auto">
                        {/* Documentation Link */}
                        {selectedPrimitive?.docsUrl && (
                            <a 
                                href={selectedPrimitive.docsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-x-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                <ExternalLink size={12} />
                                View Documentation
                            </a>
                        )}

                        {/* Configuration Fields */}
                        <div className="space-y-3">
                            {selectedPrimitive?.fields.map((field) => (
                                <div key={field.key} className="space-y-1">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-100 block">
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    
                                    {field.type === 'select' ? (
                                        <Select
                                            options={field.options || []}
                                            currentValue={localConfig[field.key] || ''}
                                            onChange={(e) => handleConfigChange(field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full text-sm h-8"
                                        />
                                    ) : field.type === 'textarea' ? (
                                        <Textarea
                                            placeholder={field.placeholder}
                                            value={localConfig[field.key] || ''}
                                            onChange={(e) => handleConfigChange(field.key, e.target.value)}
                                            rows={3}
                                            className="font-mono text-xs w-full"
                                        />
                                    ) : field.type === 'password' ? (
                                        <VaultSelector
                                            options={secretOptions}
                                            currentValue={localConfig[field.key] || ''}
                                            onChange={(e) => handleConfigChange(field.key, e.target.value)}
                                            placeholder={secretOptions.length > 0 ? field.placeholder || 'Select Vault Secret' : 'No Vault Secrets found'}
                                            disabled={isReadOnly}
                                            disableCreate={isReadOnly}
                                            loadingSecrets={loadingSecrets}
                                            onRefetch={() => refetchSecrets()}
                                            className="w-full text-sm"
                                            helperInfo="Select an existing vault secret or create a new one"
                                        />
                                    ) : (
                                        <Input
                                            type="text"
                                            placeholder={field.placeholder}
                                            value={localConfig[field.key] || ''}
                                            onChange={(e) => handleConfigChange(field.key, e.target.value)}
                                            className="w-full text-sm h-8"
                                        />
                                    )}
                                    
                                    {field.helpText && (
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                            {field.helpText}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 dark:border-gray-700" />
                        
                        {/* Security Notice */}
                        <div className="flex items-center gap-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <Shield size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                            <p className="text-[10px] text-blue-700 dark:text-blue-400">
                                All credentials are encrypted at rest and in transit.
                            </p>
                        </div>
                    </DialogBody>
                    <DialogFooter className="!p-4">
                        <Button variant="secondary" size="sm" onClick={handleConfigCancel}>
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={handleConfigSave}
                            disabled={isSaving || !isFormValid()}
                        >
                            {isSaving ? 'Saving...' : 'Save Configuration'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ExecutionPrimitivesSection;
