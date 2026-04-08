'use client';

import { useState } from 'react';
import { Button, Input, Switch, Label, Badge } from '@/components';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/atoms/dialog';
import { IAgentForm } from '@/models';
import { 
    Plug2, 
    Mail, 
    MessageSquare, 
    Phone, 
    Database, 
    Clock,
    X,
    Check,
    Settings,
    Cloud
} from 'lucide-react';
import { Control, Controller, UseFormWatch, UseFormSetValue } from 'react-hook-form';
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

interface PrimitiveDefinition {
    key: PrimitiveKey;
    name: string;
    description: string;
    icon: React.ReactNode;
    category: 'email' | 'messaging' | 'storage' | 'scheduling';
    fields: {
        key: string;
        label: string;
        type: 'text' | 'password' | 'select';
        placeholder: string;
        required: boolean;
        options?: { name: string; value: string }[];
    }[];
}

const primitiveDefinitions: PrimitiveDefinition[] = [
    {
        key: 'amazonSES',
        name: 'Amazon SES',
        description: 'Send emails using Amazon Simple Email Service',
        icon: <Mail size={18} />,
        category: 'email',
        fields: [
            { key: 'accessKeyId', label: 'Access Key ID', type: 'text', placeholder: 'AKIA...', required: true },
            { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', placeholder: 'Enter secret key', required: true },
            { key: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1', required: true },
            { key: 'fromEmail', label: 'From Email', type: 'text', placeholder: 'noreply@example.com', required: true },
        ],
    },
    {
        key: 'microsoftOutlook',
        name: 'Microsoft Outlook',
        description: 'Send emails and manage calendar via Microsoft Graph',
        icon: <Mail size={18} />,
        category: 'email',
        fields: [
            { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Enter client ID', required: true },
            { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Enter client secret', required: true },
            { key: 'tenantId', label: 'Tenant ID', type: 'text', placeholder: 'Enter tenant ID', required: true },
            { key: 'redirectUri', label: 'Redirect URI', type: 'text', placeholder: 'https://...', required: false },
        ],
    },
    {
        key: 'slack',
        name: 'Slack',
        description: 'Send messages and interact with Slack workspaces',
        icon: <MessageSquare size={18} />,
        category: 'messaging',
        fields: [
            { key: 'botToken', label: 'Bot Token', type: 'password', placeholder: 'xoxb-...', required: true },
            { key: 'signingSecret', label: 'Signing Secret', type: 'password', placeholder: 'Enter signing secret', required: true },
            { key: 'appId', label: 'App ID', type: 'text', placeholder: 'A0...', required: false },
            { key: 'defaultChannel', label: 'Default Channel', type: 'text', placeholder: '#general', required: false },
        ],
    },
    {
        key: 'microsoftTeams',
        name: 'Microsoft Teams',
        description: 'Send messages and notifications to Teams channels',
        icon: <MessageSquare size={18} />,
        category: 'messaging',
        fields: [
            { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Enter client ID', required: true },
            { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Enter client secret', required: true },
            { key: 'tenantId', label: 'Tenant ID', type: 'text', placeholder: 'Enter tenant ID', required: true },
            { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://...', required: false },
        ],
    },
    {
        key: 'twilio',
        name: 'Twilio',
        description: 'Send SMS and make voice calls via Twilio',
        icon: <Phone size={18} />,
        category: 'messaging',
        fields: [
            { key: 'accountSid', label: 'Account SID', type: 'text', placeholder: 'AC...', required: true },
            { key: 'authToken', label: 'Auth Token', type: 'password', placeholder: 'Enter auth token', required: true },
            { key: 'fromNumber', label: 'From Number', type: 'text', placeholder: '+1234567890', required: true },
        ],
    },
    {
        key: 'amazonS3',
        name: 'Amazon S3',
        description: 'Store and retrieve files from Amazon S3 buckets',
        icon: <Database size={18} />,
        category: 'storage',
        fields: [
            { key: 'accessKeyId', label: 'Access Key ID', type: 'text', placeholder: 'AKIA...', required: true },
            { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', placeholder: 'Enter secret key', required: true },
            { key: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1', required: true },
            { key: 'bucketName', label: 'Bucket Name', type: 'text', placeholder: 'my-bucket', required: true },
        ],
    },
    {
        key: 'azureBlobStorage',
        name: 'Azure Blob Storage',
        description: 'Store and retrieve files from Azure Blob Storage',
        icon: <Cloud size={18} />,
        category: 'storage',
        fields: [
            { key: 'connectionString', label: 'Connection String', type: 'password', placeholder: 'DefaultEndpointsProtocol=...', required: true },
            { key: 'containerName', label: 'Container Name', type: 'text', placeholder: 'my-container', required: true },
            { key: 'accountName', label: 'Account Name', type: 'text', placeholder: 'storageaccount', required: false },
            { key: 'accountKey', label: 'Account Key', type: 'password', placeholder: 'Enter account key', required: false },
        ],
    },
    {
        key: 'googleCloudStorage',
        name: 'Google Cloud Storage',
        description: 'Store and retrieve files from Google Cloud Storage',
        icon: <Cloud size={18} />,
        category: 'storage',
        fields: [
            { key: 'projectId', label: 'Project ID', type: 'text', placeholder: 'my-project-id', required: true },
            { key: 'bucketName', label: 'Bucket Name', type: 'text', placeholder: 'my-bucket', required: true },
            { key: 'credentials', label: 'Service Account JSON', type: 'password', placeholder: '{"type":"service_account",...}', required: true },
        ],
    },
    {
        key: 'sharePoint',
        name: 'SharePoint',
        description: 'Access and manage SharePoint documents and lists',
        icon: <Database size={18} />,
        category: 'storage',
        fields: [
            { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Enter client ID', required: true },
            { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Enter client secret', required: true },
            { key: 'tenantId', label: 'Tenant ID', type: 'text', placeholder: 'Enter tenant ID', required: true },
            { key: 'siteUrl', label: 'Site URL', type: 'text', placeholder: 'https://company.sharepoint.com/sites/...', required: true },
            { key: 'driveId', label: 'Drive ID', type: 'text', placeholder: 'Optional drive ID', required: false },
        ],
    },
    {
        key: 'cron',
        name: 'Cron',
        description: 'Schedule recurring tasks using cron expressions',
        icon: <Clock size={18} />,
        category: 'scheduling',
        fields: [
            { key: 'expression', label: 'Cron Expression', type: 'text', placeholder: '0 0 * * *', required: true },
            { key: 'timezone', label: 'Timezone', type: 'text', placeholder: 'America/New_York', required: true },
            { key: 'description', label: 'Description', type: 'text', placeholder: 'Daily at midnight', required: false },
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
    email: <Mail size={14} />,
    messaging: <MessageSquare size={14} />,
    storage: <Database size={14} />,
    scheduling: <Clock size={14} />,
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
            // Open config modal when enabling
            setSelectedPrimitive(primitive);
            const currentConfig = executionPrimitives[primitive.key]?.config || {};
            setLocalConfig(currentConfig as Record<string, string>);
            setConfigModalOpen(true);
        } else if (!enabled && !isReadOnly) {
            // Disable the primitive
            setValue(`horizonConfig.executionPrimitives.${primitive.key}`, { enabled: false });
        }
    };

    const handleConfigSave = () => {
        if (!selectedPrimitive) return;
        
        setIsSaving(true);
        
        // Save the configuration
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

    return (
        <>
            <div className="col-span-1 sm:col-span-2 border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-4">
                <div className="flex flex-col gap-y-4">
                    <div className="flex flex-col gap-y-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-x-[10px]">
                                <Plug2 size={20} absoluteStrokeWidth={false} className="stroke-[1px]" />
                                <p className="text-sm font-medium">Execution Primitives</p>
                            </div>
                            {getEnabledCount() > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    {getEnabledCount()} Enabled
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs font-normal text-gray-400">
                            Enable and configure external tools and services for agent operations.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(groupedPrimitives).map(([category, primitives]) => (
                            <div key={category} className="space-y-2">
                                <div className="flex items-center gap-x-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    {categoryIcons[category as keyof typeof categoryIcons]}
                                    <span>{categoryLabels[category as keyof typeof categoryLabels]}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {primitives.map((primitive) => {
                                        const isEnabled = executionPrimitives[primitive.key]?.enabled || false;
                                        const hasConfig = executionPrimitives[primitive.key]?.config && 
                                            Object.keys(executionPrimitives[primitive.key]?.config || {}).length > 0;

                                        return (
                                            <div
                                                key={primitive.key}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                                                    isEnabled 
                                                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                                                    !isReadOnly && "hover:border-gray-400 dark:hover:border-gray-500"
                                                )}
                                            >
                                                <div className="flex items-center gap-x-3">
                                                    <div className={cn(
                                                        "flex items-center justify-center w-8 h-8 rounded-lg",
                                                        isEnabled 
                                                            ? "bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400"
                                                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                                    )}>
                                                        {primitive.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {primitive.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {primitive.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-x-2 shrink-0 ml-2">
                                                    {isEnabled && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openConfigModal(primitive)}
                                                            disabled={isReadOnly}
                                                            className="h-7 w-7 p-0"
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
            </div>

            {/* Configuration Modal */}
            <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-x-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                {selectedPrimitive?.icon}
                            </div>
                            <div>
                                <span className="block">Configure {selectedPrimitive?.name}</span>
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                    {selectedPrimitive?.description}
                                </span>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        <div className="py-2 space-y-4">
                            {selectedPrimitive?.fields.map((field) => (
                                <div key={field.key}>
                                    <Input
                                        label={field.label}
                                        type={field.type === 'password' ? 'password' : 'text'}
                                        placeholder={field.placeholder}
                                        value={localConfig[field.key] || ''}
                                        onChange={(e) => handleConfigChange(field.key, e.target.value)}
                                        required={field.required}
                                    />
                                    {field.required && (
                                        <p className="text-xs text-gray-400 mt-1">Required</p>
                                    )}
                                </div>
                            ))}
                            
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                    Credentials are encrypted and stored securely. They will be used by the agent during execution.
                                </p>
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
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>Saving...</>
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
