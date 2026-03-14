import type { ContextLevel, InsightSeverity, ProactiveInsight } from '@/models/assistant.model';

// Set to false when backend API is ready
export const USE_MOCK = true;

// Keyboard shortcut to toggle the assistant panel (Ctrl/Cmd + J)
export const KEYBOARD_SHORTCUT = 'j';

// Suggested actions per context level
export const SUGGESTED_ACTIONS: Record<ContextLevel, string[]> = {
  enterprise: [
    'How many workspaces do I have?',
    'Which workspace has the highest error rate?',
    'Am I approaching my license limits?',
  ],
  workspace: [
    'Which workflows failed in the last 24 hours?',
    'What is the total token usage this month?',
    'Show me the top 5 workflows by execution count',
  ],
  workflow: [
    'Analyze the last execution',
    'Check configuration for issues',
    'Explain this workflow structure',
  ],
  agent: [
    'What tools are connected to this agent?',
    'Show execution history for this agent',
    'Validate this agent configuration',
  ],
};

// Severity colors for proactive insights
export const SEVERITY_COLORS: Record<InsightSeverity, { border: string; bg: string; icon: string }> = {
  info: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: 'text-blue-500',
  },
  warning: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    icon: 'text-amber-500',
  },
  error: {
    border: 'border-l-red-500',
    bg: 'bg-red-50 dark:bg-red-950/30',
    icon: 'text-red-500',
  },
};

// Mock proactive insights per context level
export const MOCK_INSIGHTS: Record<ContextLevel, ProactiveInsight[]> = {
  enterprise: [
    {
      id: 'insight-license-1',
      severity: 'info',
      title: 'License limit approaching',
      description: 'You are using 18 out of 20 available workspaces (90%).',
      actionLabel: 'View license details',
      actionHref: '/settings/license',
      dismissable: true,
    },
  ],
  workspace: [
    {
      id: 'insight-failure-1',
      severity: 'warning',
      title: 'High failure rate detected',
      description: 'Workflow "Claims Processing" had a 35% failure rate in the last 24 hours.',
      actionLabel: 'View workflow',
      actionHref: '/workspace/{wid}/workflows',
      dismissable: true,
    },
    {
      id: 'insight-inactive-1',
      severity: 'info',
      title: 'Inactive agent detected',
      description: 'Agent "Data Extractor" has not been executed in 30 days.',
      dismissable: true,
    },
  ],
  workflow: [
    {
      id: 'insight-unpublished-1',
      severity: 'warning',
      title: 'Workflow not published',
      description: 'This workflow has changes that have not been published yet.',
      actionLabel: 'Publish now',
      dismissable: true,
    },
    {
      id: 'insight-guardrail-1',
      severity: 'error',
      title: 'Guardrail reference error',
      description: 'A guardrail binding references a deleted guardrail configuration.',
      actionLabel: 'Fix configuration',
      dismissable: false,
    },
  ],
  agent: [
    {
      id: 'insight-model-1',
      severity: 'error',
      title: 'No model selected',
      description: 'This agent does not have an LLM/SLM model configured.',
      actionLabel: 'Configure model',
      dismissable: false,
    },
    {
      id: 'insight-prompt-1',
      severity: 'warning',
      title: 'Missing prompt template',
      description: 'This agent has no prompt template assigned.',
      actionLabel: 'Add prompt',
      dismissable: true,
    },
  ],
};

// Mock responses based on context level and common questions
export const MOCK_RESPONSES: Record<string, string> = {
  // Workspace level
  'workspace:failed': `In the last 24 hours, **3 workflows** had failed executions:

1. **Claims Processing Workflow** — 2 failed runs
   - Error: External API timeout on step 3 (Claims Validation Service)
   - Last failure: 2 hours ago

2. **Email Classification** — 1 failed run
   - Error: LLM rate limit exceeded (GPT-4o)
   - Last failure: 6 hours ago

3. **Document Extraction** — 1 failed run
   - Error: Vector database connection refused
   - Last failure: 14 hours ago`,

  'workspace:token': `**Token Usage Summary (This Month)**

| Model | Tokens Used | Cost Estimate |
|-------|-------------|---------------|
| GPT-4o | 2.4M | $48.00 |
| Claude 3.5 | 890K | $13.35 |
| Gemini Pro | 450K | $2.25 |

**Total**: 3.74M tokens (~$63.60)

You are at **74%** of your monthly quota.`,

  'workspace:top': `**Top 5 Workflows by Execution Count (Last 7 Days)**

1. **Email Triage** — 1,245 executions (avg 1.2s)
2. **Claims Processing** — 892 executions (avg 3.8s)
3. **Document Classification** — 654 executions (avg 2.1s)
4. **Support Ticket Router** — 423 executions (avg 0.8s)
5. **Invoice Extraction** — 312 executions (avg 4.2s)`,

  // Workflow level
  'workflow:analyze': `**Last Execution Analysis**

- **Status**: Completed with warnings
- **Total Duration**: 4.2 seconds
- **Started**: 15 minutes ago

**Step Breakdown**:
| Step | Agent | Duration | Status |
|------|-------|----------|--------|
| 1 | Input Parser | 0.3s | Success |
| 2 | Planner | 1.8s | Success |
| 3 | Executor | 1.9s | Warning |
| 4 | Output Formatter | 0.2s | Success |

**Warning on Step 3**: Response took longer than expected due to rate limiting.`,

  'workflow:check': `**Configuration Analysis**

I found **2 potential issues** in this workflow:

1. **Warning**: The embedding model (1536 dimensions) may not be compatible with the connected vector database (768 dimensions configured).
   
2. **Info**: Agent "Planner" has retry disabled. Consider enabling retries for better reliability.

**Recommendations**:
- Align embedding dimensions with your vector database
- Enable retry with exponential backoff on the Planner agent`,

  'workflow:explain': `**Workflow Structure**

This workflow has **4 nodes** connected in sequence:

1. **Input Parser** (Transformer)
   - Extracts structured data from raw input
   - Tools: JSON Parser, Text Cleaner

2. **Planner** (LLM Agent)
   - Determines execution strategy
   - Model: GPT-4o
   - Has 3 connected tools

3. **Executor** (Multi-Agent)
   - Runs the planned actions
   - Contains 2 sub-agents

4. **Output Formatter** (Transformer)
   - Formats final response`,

  // Enterprise level
  'enterprise:workspaces': `You have **5 workspaces** configured:

1. **Claims Operations** — 12 workflows, 3 active users
2. **Customer Support** — 8 workflows, 5 active users
3. **Finance Automation** — 6 workflows, 2 active users
4. **HR Onboarding** — 4 workflows, 2 active users
5. **Development (Sandbox)** — 15 workflows, 1 active user`,

  'enterprise:error': `**Workspace Error Rate Analysis (Last 7 Days)**

| Workspace | Error Rate | Change |
|-----------|------------|--------|
| Claims Operations | 12.4% | +8.2% |
| Finance Automation | 5.1% | +1.2% |
| Customer Support | 2.3% | -0.5% |
| HR Onboarding | 1.8% | 0% |
| Development | 0.4% | -0.1% |

**Claims Operations** has the highest error rate with a significant increase. The main cause is API timeouts to external services.`,

  'enterprise:license': `**License Status**

- **Plan**: Enterprise
- **Workspaces**: 18/20 (90%)
- **Users**: 42/50 (84%)
- **Workflows**: 156/200 (78%)
- **Monthly Executions**: 45,230/100,000 (45%)

You are approaching your workspace limit. Consider upgrading or archiving unused workspaces.`,

  // Default fallback
  'default': `I understand you're asking about your KAYA platform. Based on your current context, I can help you with:

- Workflow execution analysis and debugging
- Configuration validation and recommendations
- Performance metrics and usage statistics
- Platform navigation and setup guidance

Could you provide more details about what you'd like to know?`,
};
