/**
 * Horizon Agent Configuration Models
 * These interfaces define the configuration structure for Horizon Agents
 * which extend the base Reusable Agents with deployment, identity, and runtime capabilities.
 */

// Agent Category Enum - Distinguishes between Reusable and Horizon agents
export enum AgentCategory {
  REUSABLE = 'reusable',
  HORIZON = 'horizon',
}

// Hosting Model Type
export type HostingModel = 'managed' | 'agentcore';

// Environment Type
export type DeployEnvironment = 'dev' | 'stage' | 'prod';

// Runtime Type (for AgentCore hosting)
export type RuntimeType = 'python311' | 'python312' | 'nodejs20' | 'nodejs22' | 'java21' | 'dotnet8';

// Priority Handling Strategy
export type PriorityStrategy = 'fifo' | 'priority' | 'fair';

// Notification Mode
export type NotificationMode = 'streaming' | 'webhook' | 'both';

// IO Mode for Skills - MIME types for A2A protocol
export type IOMode = 'application/json' | 'text/plain' | 'application/xml';

// Authentication Type
export type AuthType = 'api_key' | 'oauth2' | 'bearer' | 'basic' | 'none';

// A2A Visibility Type
export type A2AVisibility = 'public' | 'private';

// A2A Tool Types for Skills
export type A2AToolType = 
  | 'KAYA_REST_API_CONNECTOR' 
  | 'KAYA_MCP_CONNECTOR' 
  | 'KAYA_VECTOR_RAG' 
  | 'KAYA_GRAPH_RAG' 
  | 'KAYA_DB_CONNECTOR' 
  | 'KAYA_EXECUTABLE_FUNCTION';

// Scaling Policy Configuration
export interface IScalingPolicy {
  minInstances: number;
  maxInstances: number;
  autoScale: boolean;
  scaleUpThreshold?: number;
  scaleDownThreshold?: number;
}

// Deploy Configuration
export interface IHorizonDeployConfig {
  hostingModel: HostingModel;
  environment: DeployEnvironment;
  runtime?: RuntimeType; // Used when hostingModel is 'agentcore'
  scalingPolicy: IScalingPolicy;
}

// Authentication Scheme
export interface IAuthScheme {
  type: AuthType;
  config?: Record<string, string>;
}

// Identity Configuration
export interface IHorizonIdentity {
  displayName: string;
  description: string;
  version: string;
  endpointUrl?: string;
  discoveryLocation?: string;
  authSchemes: IAuthScheme[];
  // A2A Identity fields
  a2aEnabled?: boolean;
  a2aVisibility?: A2AVisibility;
  a2aUri?: string; // Format: agent://kaya/{workspace-slug}/{agent-slug}-{version}
  defaultInputModes?: string[];
  defaultOutputModes?: string[];
}

// A2A Skill (auto-generated from tool attachments)
export interface IA2ASkill {
  id: string;
  name: string;
  description: string;
  toolType: A2AToolType;
  tags: string[];
  inputModes?: string[];
  outputModes?: string[];
}

// A2A Agent Card (generated automatically)
export interface IA2AAgentCard {
  schemaVersion: string;
  name: string;
  description: string;
  url: string;
  version: string;
  provider: {
    organization: string;
  };
  capabilities: {
    streaming: boolean;
    pushNotifications: boolean;
    stateTransitionHistory: boolean;
  };
  securitySchemes: Record<string, unknown>;
  defaultInputModes: string[];
  defaultOutputModes: string[];
  skills: IA2ASkill[];
}

// Skills Metadata
export interface IHorizonSkill {
  id: string;
  name: string;
  description: string;
  tags: string[];
  examples: string[];
  ioModes: IOMode[]; // Legacy - kept for backwards compatibility
  inputModes?: IOMode[]; // Separate input modes
  outputModes?: IOMode[]; // Separate output modes
  version: string;
  inputConnectorMapping?: Record<string, string>;
}

// Execution Policies
export interface IExecutionPolicy {
  asyncDefault: boolean;
  maxDurationSeconds: number;
  timeoutSeconds: number;
  maxRetries: number;
  concurrencyLimit: number;
  priorityHandling: PriorityStrategy;
}

// Persistence Configuration
export interface IPersistenceConfig {
  taskState: boolean;
  memory: boolean;
  artifacts: boolean;
  retentionDays: number;
}

// Webhook Retry Policy
export interface IWebhookRetryPolicy {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

// Notification Configuration
export interface INotificationConfig {
  mode: NotificationMode;
  webhookUrl?: string;
  webhookRetryPolicy?: IWebhookRetryPolicy;
  streamingEnabled: boolean;
}

// Execution Primitive Types
export type ExecutionPrimitiveType = 
  | 'amazon_ses'
  | 'microsoft_outlook'
  | 'slack'
  | 'microsoft_teams'
  | 'twilio'
  | 'amazon_s3'
  | 'azure_blob_storage'
  | 'google_cloud_storage'
  | 'sharepoint'
  | 'cron';

// Execution Primitive Configuration
export interface IExecutionPrimitive {
  type: ExecutionPrimitiveType;
  enabled: boolean;
  config: Record<string, string>;
}

// Amazon SES Configuration
export interface IAmazonSESConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  fromEmail: string;
}

// Microsoft Outlook Configuration
export interface IMicrosoftOutlookConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri?: string;
}

// Slack Configuration
export interface ISlackConfig {
  botToken: string;
  signingSecret: string;
  appId?: string;
  defaultChannel?: string;
}

// Microsoft Teams Configuration
export interface IMicrosoftTeamsConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  webhookUrl?: string;
}

// Twilio Configuration
export interface ITwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

// Amazon S3 Configuration
export interface IAmazonS3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
}

// Azure Blob Storage Configuration
export interface IAzureBlobStorageConfig {
  connectionString: string;
  containerName: string;
  accountName?: string;
  accountKey?: string;
}

// Google Cloud Storage Configuration
export interface IGoogleCloudStorageConfig {
  projectId: string;
  bucketName: string;
  credentials: string; // JSON string of service account credentials
}

// SharePoint Configuration
export interface ISharePointConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  siteUrl: string;
  driveId?: string;
}

// Cron Configuration
export interface ICronConfig {
  expression: string;
  timezone: string;
  description?: string;
}

// Execution Primitives Configuration
export interface IExecutionPrimitivesConfig {
  amazonSES?: { enabled: boolean; config?: IAmazonSESConfig };
  microsoftOutlook?: { enabled: boolean; config?: IMicrosoftOutlookConfig };
  slack?: { enabled: boolean; config?: ISlackConfig };
  microsoftTeams?: { enabled: boolean; config?: IMicrosoftTeamsConfig };
  twilio?: { enabled: boolean; config?: ITwilioConfig };
  amazonS3?: { enabled: boolean; config?: IAmazonS3Config };
  azureBlobStorage?: { enabled: boolean; config?: IAzureBlobStorageConfig };
  googleCloudStorage?: { enabled: boolean; config?: IGoogleCloudStorageConfig };
  sharePoint?: { enabled: boolean; config?: ISharePointConfig };
  cron?: { enabled: boolean; config?: ICronConfig };
}

// Complete Horizon Configuration
export interface IHorizonConfig {
  deploy: IHorizonDeployConfig;
  identity: IHorizonIdentity;
  skills: IHorizonSkill[];
  executionPolicy: IExecutionPolicy;
  persistence: IPersistenceConfig;
  notifications: INotificationConfig;
  executionPrimitives?: IExecutionPrimitivesConfig;
}

// Publish Status
export interface IPublishStatus {
  isPublished: boolean;
  publishedVersion?: string;
  publishedAt?: string;
  publishedBy?: string;
}

// Default values for Horizon Configuration
export const DEFAULT_HORIZON_CONFIG: IHorizonConfig = {
  deploy: {
    hostingModel: 'managed',
    environment: 'dev',
    scalingPolicy: {
      minInstances: 1,
      maxInstances: 3,
      autoScale: true,
      scaleUpThreshold: 80,
      scaleDownThreshold: 20,
    },
  },
  identity: {
    displayName: '',
    description: '',
    version: '1.0.0',
    endpointUrl: '',
    discoveryLocation: '',
    authSchemes: [],
    a2aEnabled: true,
    a2aVisibility: 'private',
    defaultInputModes: ['text/plain', 'application/json'],
    defaultOutputModes: ['application/json', 'text/plain'],
  },
  skills: [],
  executionPolicy: {
    asyncDefault: true,
    maxDurationSeconds: 3600,
    timeoutSeconds: 300,
    maxRetries: 3,
    concurrencyLimit: 10,
    priorityHandling: 'fifo',
  },
  persistence: {
    taskState: true,
    memory: false,
    artifacts: true,
    retentionDays: 30,
  },
  notifications: {
    mode: 'streaming',
    streamingEnabled: true,
  },
  executionPrimitives: {
    amazonSES: { enabled: false },
    microsoftOutlook: { enabled: false },
    slack: { enabled: false },
    microsoftTeams: { enabled: false },
    twilio: { enabled: false },
    amazonS3: { enabled: false },
    azureBlobStorage: { enabled: false },
    googleCloudStorage: { enabled: false },
    sharePoint: { enabled: false },
    cron: { enabled: false },
  },
};

// Validation helper type for Horizon Agent
export interface IHorizonValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}
