'use client';

import { useState } from 'react';
import { Button, Input, Switch, Label, Badge, Select, TextArea } from '@/components';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/atoms/dialog';
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
    ExternalLink
} from 'lucide-react';
import { Control, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { cn } from '@/lib/utils';

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
    | 'cron';

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
    category: 'email' | 'messaging' | 'storage' | 'scheduling';
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
];

const categoryLabels = {
    email: 'Email Services',
    messaging: 'Messaging & Communication',
    storage: 'Cloud Storage',
    scheduling: 'Scheduling',
};

const categoryIcons = {
    email: <Mail size={14} className="text-gray-500" />,
    messaging: <MessageSquare size={14} className="text-gray-500" />,
    storage: <HardDrive size={14} className="text-gray-500" />,
    scheduling: <Clock size={14} className="text-gray-500" />,
};

export const ExecutionPrimitivesSection = ({ 
    control, 
    watch, 
    setValue,
    isReadOnly 
}: ExecutionPrimitivesSectionProps) => {
    const [configModalOpen, setConfigModalOpen] = useState(false);
    const [selectedPrimitive, setSelectedPrimitive] = useState<PrimitiveDefinition | null>(null);
    const [localConfig, setLocalConfig] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

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
        
        setValue(`horizonConfig.executionPrimitives.${selectedPrimitive.key}`, {
            enabled: true,
            config: localConfig,
        });
        
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
                <DialogContent className="max-w-xl max-h-[85vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-x-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                {selectedPrimitive?.icon}
                            </div>
                            <div>
                                <span className="block text-base">Configure {selectedPrimitive?.name}</span>
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                    {selectedPrimitive?.description}
                                </span>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogBody className="overflow-y-auto">
                        <div className="space-y-4 py-2">
                            {/* Documentation Link */}
                            {selectedPrimitive?.docsUrl && (
                                <a 
                                    href={selectedPrimitive.docsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-x-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    <ExternalLink size={12} />
                                    View {selectedPrimitive.name} Documentation
                                </a>
                            )}

                            {/* Configuration Fields */}
                            {selectedPrimitive?.fields.map((field) => (
                                <div key={field.key} className="space-y-1.5">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </Label>
                                    
                                    {field.type === 'select' ? (
                                        <Select
                                            options={field.options || []}
                                            currentValue={localConfig[field.key] || ''}
                                            onChange={(e) => handleConfigChange(field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="w-full"
                                        />
                                    ) : field.type === 'textarea' ? (
                                        <TextArea
                                            placeholder={field.placeholder}
                                            value={localConfig[field.key] || ''}
                                            onChange={(e) => handleConfigChange(field.key, e.target.value)}
                                            rows={4}
                                            className="font-mono text-xs"
                                        />
                                    ) : (
                                        <Input
                                            type={field.type === 'password' ? 'password' : 'text'}
                                            placeholder={field.placeholder}
                                            value={localConfig[field.key] || ''}
                                            onChange={(e) => handleConfigChange(field.key, e.target.value)}
                                        />
                                    )}
                                    
                                    {field.helpText && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-x-1">
                                            <Info size={12} className="shrink-0 mt-0.5" />
                                            {field.helpText}
                                        </p>
                                    )}
                                </div>
                            ))}
                            
                            {/* Security Notice */}
                            <div className="flex items-start gap-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <Shield size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                                        Secure Storage
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">
                                        All credentials are encrypted at rest and in transit. They are only accessible during agent execution.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </DialogBody>
                    <DialogFooter>
                        <Button variant="secondary" size="sm" onClick={handleConfigCancel}>
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={handleConfigSave}
                            disabled={isSaving || !isFormValid()}
                        >
                            {isSaving ? (
                                'Saving...'
                            ) : (
                                <>
                                    <Check size={14} className="mr-1.5" />
                                    Save Configuration
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ExecutionPrimitivesSection;
