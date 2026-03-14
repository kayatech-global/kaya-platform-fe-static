export type ContextLevel = 'enterprise' | 'workspace' | 'workflow' | 'agent';

export type MessageRole = 'user' | 'assistant';

export type MessageType = 'text' | 'warning' | 'error' | 'insight';

export type InsightSeverity = 'info' | 'warning' | 'error';

export interface AssistantMessageSource {
  label: string;
  href: string;
}

export interface AssistantMessageCollapsible {
  title: string;
  content: string;
}

export interface AssistantMessageMetadata {
  sources?: AssistantMessageSource[];
  type?: MessageType;
  collapsible?: AssistantMessageCollapsible;
}

export interface AssistantMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: AssistantMessageMetadata;
}

export interface PlatformContext {
  level: ContextLevel;
  workspaceId?: string;
  workspaceName?: string;
  workflowId?: string;
  workflowName?: string;
  selectedNodeId?: string;
  selectedNodeType?: string;
  currentPage: string;
}

export interface ProactiveInsight {
  id: string;
  severity: InsightSeverity;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  dismissable: boolean;
}

export interface AssistantChatRequest {
  message: string;
  conversationHistory: {
    role: MessageRole;
    content: string;
  }[];
  context: {
    level: ContextLevel;
    workspaceId?: string;
    workflowId?: string;
    selectedNodeId?: string;
    selectedNodeType?: string;
    currentPage: string;
  };
}

export interface AssistantChatResponse {
  content: string;
  sources?: AssistantMessageSource[];
  type?: MessageType;
  suggestedActions?: string[];
}

export interface AssistantContextType {
  // Panel state
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;

  // Messages
  messages: AssistantMessage[];
  sendMessage: (text: string) => void;
  clearMessages: () => void;
  isLoading: boolean;

  // Context detection
  currentContext: PlatformContext;

  // Proactive insights
  proactiveInsights: ProactiveInsight[];
  dismissInsight: (id: string) => void;
  hasUnreadInsights: boolean;
}
