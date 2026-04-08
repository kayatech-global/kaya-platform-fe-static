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

// Priority Handling Strategy
export type PriorityStrategy = 'fifo' | 'priority' | 'fair';

// Notification Mode
export type NotificationMode = 'streaming' | 'webhook' | 'both';

// IO Mode for Skills
export type IOMode = 'text' | 'structured' | 'streaming';

// Authentication Type
export type AuthType = 'api_key' | 'oauth2' | 'bearer' | 'basic' | 'none';

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
}

// Skills Metadata
export interface IHorizonSkill {
  id: string;
  name: string;
  description: string;
  tags: string[];
  examples: string[];
  ioModes: IOMode[];
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

// Complete Horizon Configuration
export interface IHorizonConfig {
  deploy: IHorizonDeployConfig;
  identity: IHorizonIdentity;
  skills: IHorizonSkill[];
  executionPolicy: IExecutionPolicy;
  persistence: IPersistenceConfig;
  notifications: INotificationConfig;
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
};

// Validation helper type for Horizon Agent
export interface IHorizonValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}
