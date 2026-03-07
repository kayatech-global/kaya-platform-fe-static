import * as LucideIcons from 'lucide-react';

export type SidebarMainMenuItemsType = {
    id: string;
    title: string;
    url: string;
    icon: keyof typeof LucideIcons;
    isActive?: boolean;
    isSingleLink?: boolean;
    isDisabled?: boolean;
    disabledMessage?: string;
    items?: (Omit<SidebarMainMenuItemsType, 'icon'> & { icon?: React.ComponentType })[];
};

export type SidebarMainMenuGroupsType = {
    id: string;
    title: string;
    description: string;
    icon: string;
    items: SidebarMainMenuItemsType[];
};

export const SIDEBAR_MAIN_MENU_GROUPS: SidebarMainMenuGroupsType[] = [
    {
        id: 'config_menu_item',
        title: 'Setup configurations',
        description: 'Setup all the required configurations for below items',
        icon: 'ri-tools-fill',
        items: [
            {
                id: 'api-configurations',
                title: 'Create and Manage APIs',
                url: '/workspace/[wid]/api-configurations',
                icon: 'CloudCog',
                isSingleLink: true,
            },
            {
                id: 'mcp-configurations',
                title: 'Create and Manage MCPs',
                url: '/workspace/[wid]/mcp-configurations',
                icon: 'ServerCog',
                isSingleLink: true,
            },
            {
                id: 'executable_functions',
                title: 'Executable Functions',
                url: '/workspace/[wid]/executable-functions',
                icon: 'Cloud',
                isSingleLink: true,
            },
            // {
            //     id: 'guardrails',
            //     title: 'Guardrails',
            //     url: '#',
            //     icon: 'ShieldCheck',
            //     items: [
            //         {
            //             id: 'setup-guardrails',
            //             title: 'Setup Guardrails',
            //             url: '/workspace/[wid]/guardrails/setup-guardrails',
            //         },
            //         {
            //             id: 'guardrails-api-configurations',
            //             title: 'Guardrails API Configurations',
            //             url: '/workspace/[wid]/guardrails/guardrails-api-configurations',
            //             isDisabled: true,
            //             disabledMessage: 'Guardrails API Configurations are not enabled for this workspace',
            //         },
            //         {
            //             id: 'guardrails-model-configurations',
            //             title: 'Guardrails Model Configurations',
            //             url: '/workspace/[wid]/guardrails/guardrails-model-configurations',
            //         },
            //     ],
            //     // isSingleLink: true,
            //     // isDisabled: false,
            //     // disabledMessage: 'Guardrails not enabled for the sandbox license',
            // },
            // {
            //     id: 'language_model_configs',
            //     title: 'Configure Intelligence Sources',
            //     url: '#',
            //     icon: 'CloudSnow',
            //     items: [
            //         {
            //             id: 'llm_configurations',
            //             title: 'Add LLM Configurations',
            //             url: '/workspace/[wid]/intelligence-source-configs/llm-configurations',
            //         },
            //         {
            //             id: 'slm_configurations',
            //             title: 'Add SLM Configurations',
            //             url: '/workspace/[wid]/intelligence-source-configs/slm-configurations',
            //         },
            //         {
            //             id: 'sts_configurations',
            //             title: 'Add STS Configurations',
            //             url: '/workspace/[wid]/intelligence-source-configs/sts-configurations',
            //             // isDisabled: true,
            //             // disabledMessage: 'STS Configurations not enabled for the sandbox license',
            //         },
            //     ],
            // },
            // {
            //     id: 'language_enhancers_configs',
            //     title: 'Configure Intelligence Enhancers',
            //     url: '#',
            //     icon: 'Zap',
            //     items: [
            //         {
            //             id: 'embedding_models',
            //             title: 'Add Embedding Models',
            //             url: '/workspace/[wid]/intelligence-enhancers/embedding-models',
            //         },
            //         {
            //             id: 're-ranking_models',
            //             title: 'Add Re-ranking Models',
            //             url: '/workspace/[wid]/intelligence-enhancers/re-ranking-models',
            //         },
            //     ],
            // },
            // {
            //     id: 'vault',
            //     title: 'Add Vaults or Secure Your Secrets',
            //     url: '/workspace/[wid]/vault',
            //     icon: 'Vault',
            //     isSingleLink: true,
            // },
            // {
            //     id: 'variables',
            //     title: 'Set Workspace Variables',
            //     url: '/workspace/[wid]/variables',
            //     icon: 'Braces',
            //     isSingleLink: true,
            // },
            // {
            //     id: 'knowledge-source-configs',
            //     title: 'Configure Knowledge Sources',
            //     url: '#',
            //     icon: 'HardDriveDownload',
            //     items: [
            //         {
            //             id: 'vector_rag',
            //             title: 'Add Vector RAG',
            //             url: '/workspace/[wid]/knowledge-source-configs/vector-rag-configurations',
            //             isDisabled: false,
            //             disabledMessage: 'Vector RAG not enabled for the sandbox license',
            //         },
            //         {
            //             id: 'graph_rag',
            //             title: 'Add Graph RAG',
            //             url: '/workspace/[wid]/knowledge-source-configs/graph-rag-configurations',
            //             isDisabled: false,
            //             disabledMessage: 'Graph RAG not enabled for the sandbox license',
            //         },

            //         // {
            //         //     id: 'memory_story',
            //         //     title: 'Add Memory Store',
            //         //     url: '/workspace/[wid]/knowledge-source-configs/memory-store-configurations',
            //         // },
            //     ],
            // },
            // {
            //     id: 'connection_configs',
            //     title: 'Configure Connections',
            //     url: '#',
            //     icon: 'Plug',
            //     items: [
            //         {
            //             id: 'databases',
            //             title: 'Create and Manage Databases',
            //             url: '/workspace/[wid]/configure-connections/databases',
            //             isDisabled: false,
            //             disabledMessage: 'Databases not enabled for the sandbox license',
            //         },
            //         {
            //             id: 'connectors',
            //             title: 'Setup Data Connectors',
            //             url: '/workspace/[wid]/configure-connections/connectors',
            //             isDisabled: false,
            //             disabledMessage: 'Data connector are not enabled for this workspace',
            //         },
            //         {
            //             id: 'message-broker',
            //             title: 'Setup Message Brokers',
            //             url: '/workspace/[wid]/configure-connections/setup-message-broker',
            //         },
            //     ],
            // },
        ],
    },
    {
        id: 'workflow_menu_item',
        title: 'Create AI workflows',
        description: 'Build AI workflows for your workspace using configurations',
        icon: 'ri-stack-fill',
        items: [
            // {
            //     id: 'agents',
            //     title: 'Create and Manage Agents',
            //     url: '/workspace/[wid]/agents',
            //     icon: 'Bot',
            //     isSingleLink: true,
            // },
            // {
            //     id: 'prompt-templates',
            //     title: 'Design Prompt Templates',
            //     url: '/workspace/[wid]/prompt-templates',
            //     icon: 'SquareChevronRight',
            //     isSingleLink: true,
            // },
            // {
            //     id: 'workflow-registry',
            //     title: 'Workflow Registry',
            //     url: '/workspace/[wid]/workflow-registry',
            //     icon: 'Rocket',
            //     isSingleLink: true,
            // },
            {
                id: 'workflows',
                title: 'Build & Organize Workflows',
                url: '#',
                icon: 'Network',
                items: [
                    {
                        id: 'workflows-authoring',
                        title: 'Workflow Authoring',
                        url: '/workspace/[wid]/workflows/workflow-authoring',
                    },
                    // {
                    //     id: 'workflow-tags',
                    //     title: 'Workflow Tags',
                    //     url: '/workspace/[wid]/workflows/workflow-tags',
                    // },
                ],
            },
        ],
    },
    // {
    //     id: 'test_management_menu_item',
    //     title: 'Test Studio',
    //     description: 'Manage test cases, run suites, and track result coverage',
    //     icon: 'ri-flask-fill',
    //     items: [
    //         {
    //             id: 'data-generation',
    //             title: 'Test Suites',
    //             url: '/workspace/[wid]/test-studio/test-suite-creation',
    //             icon: 'TestTube',
    //             isSingleLink: true,
    //         },
    //         {
    //             id: 'data-execution',
    //             title: 'Test Suite Executions',
    //             url: '/workspace/[wid]/test-studio/test-suite-report-generation',
    //             icon: 'Play',
    //             isSingleLink: true,
    //         },
    //     ],
    // },
    // {
    //     id: 'monitor_tracking_menu_item',
    //     title: 'Monitoring & tracking',
    //     description: 'Track performance, analyze usage, and audit data flow in one place',
    //     icon: 'ri-bar-chart-2-fill',
    //     items: [
    //         {
    //             id: 'usage',
    //             title: 'View Usage Stats',
    //             url: '/workspace/[wid]/usage',
    //             icon: 'ChartPie',
    //             isSingleLink: true,
    //         },
    //         {
    //             id: 'metrics_and_analytics',
    //             title: 'Metrics and Analytics',
    //             url: '/workspace/[wid]/metrics-and-analytics',
    //             icon: 'FileChartLine',
    //             isSingleLink: true,
    //         },
    //         // {
    //         //     id: 'logging',
    //         //     title: 'Review Logs',
    //         //     url: '/workspace/[wid]/logging',
    //         //     icon: 'ScrollText',
    //         //     isSingleLink: true,
    //         // },
    //         {
    //             id: 'data_lineage',
    //             title: 'View Data Lineage',
    //             url: '/workspace/[wid]/data-lineage',
    //             icon: 'HardDrive',
    //             isSingleLink: true,
    //             disabledMessage: 'Data Lineage not enabled for the sandbox license',
    //         },
    //         {
    //             id: 'learnings',
    //             title: 'Learning Records',
    //             url: '/workspace/[wid]/learnings',
    //             icon: 'BrainCircuit',
    //             isSingleLink: true,
    //         },
    //     ],
    // },
];

export const SIDEBAR_MAIN_MENU_ITEMS: SidebarMainMenuItemsType[] = [
    {
        id: 'workflows',
        title: 'Workflows',
        url: '#',
        icon: 'Network',
        items: [
            {
                id: 'workflows-authoring',
                title: 'Workflow Authoring',
                url: '/workspace/[wid]/workflows/workflow-authoring',
            },
            {
                id: 'workflow-tags',
                title: 'Workflow Tags',
                url: '/workspace/[wid]/workflows/workflow-tags',
            },
        ],
    },
    {
        id: 'agents',
        title: 'Agents',
        url: '/workspace/[wid]/agents',
        icon: 'Bot',
        isSingleLink: true,
    },
    {
        id: 'language_model_configs',
        title: 'Intelligence Source Configs',
        url: '#',
        icon: 'CloudSnow',
        items: [
            {
                id: 'llm_configurations',
                title: 'LLM Configurations',
                url: '/workspace/[wid]/intelligence-source-configs/llm-configurations',
            },
            {
                id: 'slm_configurations',
                title: 'SLM Configurations',
                url: '/workspace/[wid]/intelligence-source-configs/slm-configurations',
            },
        ],
    },
    {
        id: 'prompt-templates',
        title: 'Prompt Templates',
        url: '/workspace/[wid]/prompt-templates',
        icon: 'SquareChevronRight',
        isSingleLink: true,
    },
    {
        id: 'api-configurations',
        title: 'API Configurations',
        url: '/workspace/[wid]/api-configurations',
        icon: 'CloudCog',
        isSingleLink: true,
    },
    {
        id: 'guardrails',
        title: 'Guardrails',
        url: '#',
        icon: 'ShieldCheck',
        items: [
            {
                id: 'setup-guardrails',
                title: 'Setup Guardrails',
                url: '/workspace/[wid]/setup-guardrails',
            },
            {
                id: 'guardrails-api-configurations',
                title: 'Guardrails API Configurations',
                url: '/workspace/[wid]/guardrails-api-configurations',
            },
            {
                id: 'guardrails-model-configurations',
                title: 'Guardrails Model Configurations',
                url: '/workspace/[wid]/guardrails-model-configurations',
            },
        ],
    },

    {
        id: 'vault',
        title: 'Vault',
        url: '/workspace/[wid]/vault',
        icon: 'Vault',
        isSingleLink: true,
    },
    {
        id: 'variables',
        title: 'Variables',
        url: '/workspace/[wid]/variables',
        icon: 'Variable',
        isSingleLink: true,
    },
    {
        id: 'learnings',
        title: 'Learning Records',
        url: '/workspace/[wid]/learnings',
        icon: 'GraduationCap',
        isSingleLink: true,
    },
    {
        id: 'usage',
        title: 'Usage',
        url: '/workspace/[wid]/usage',
        icon: 'ChartPie',
        isSingleLink: true,
    },
    {
        id: 'metrics_and_analytics',
        title: 'Metrics and Analytics',
        url: '/workspace/[wid]/metrics-and-analytics',
        icon: 'FileChartLine',
        isSingleLink: true,
    },
    {
        id: 'logging',
        title: 'Logging',
        url: '/workspace/[wid]/logging',
        icon: 'ScrollText',
        isSingleLink: true,
    },
    {
        id: 'data_lineage',
        title: 'Data lineage',
        url: '/workspace/[wid]/data-lineage',
        icon: 'HardDrive',
        isSingleLink: true,
    },
    {
        id: 'workspace',
        title: 'Workspaces',
        url: '/workspaces',
        icon: 'Layers',
        isSingleLink: true,
    },
];
