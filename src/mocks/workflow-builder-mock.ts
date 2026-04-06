export const MOCK_WORKFLOW_VISUAL_GRAPH_API_RESPONSE = {
    message: 'success',
    data: {
        id: '95b6e3dd-eb71-491d-b5dc-3e27dd3f1b76',
        name: 'Shamila WF V2',
        version: 5.1,
        visualGraphData: {
            edges: [
                {
                    id: 'e1-2',
                    type: 'smoothstep',
                    source: '1',
                    target: '',
                    animated: true,
                },
            ],
            nodes: [
                {
                    id: 'agent_node-node-58986020-1ed3-4c33-b051-7d785dd26332',
                    data: {
                        name: 'name agent',
                        label: 'Agent',
                        prompt: {
                            id: 'b86f2469-c0ec-49be-b5ff-442bcb597080',
                            name: 'Notification Prompt',
                            description: 'Notify the user with complete trip confirmation details.',
                            configurations: {
                                prompt_template:
                                    'You are a Notification Agent.\r\n\r\nOnce flight, hotel, and payment are confirmed:\r\n- Send a complete trip confirmation to the user.\r\n- Include flight details, hotel details, travel dates, and payment confirmation.\r\n\r\nRespond only with confirmation that notifications were sent.',
                            },
                        },
                        connectors: [],
                        guardrails: [],
                        mcpServers: [],
                        description: 'djlasdjlsadsad',
                        languageModal: {
                            id: 'openai',
                            isSlm: false,
                            modelId: '216134ca-9030-4760-b1ad-a09949f09325',
                            provider: 'OpenAI',
                            modelName: 'new llm test',
                            providerLogo:
                                '<svg data-testid="geist-icon" height="48" stroke-linejoin="round" viewBox="0 0 16 16" width="48" style="color: currentcolor">\n                <path d="M14.9449 6.54871C15.3128 5.45919 15.1861 4.26567 14.5978 3.27464C13.7131 1.75461 11.9345 0.972595 10.1974 1.3406C9.42464 0.481584 8.3144 -0.00692594 7.15045 7.42132e-05C5.37487 -0.00392587 3.79946 1.1241 3.2532 2.79113C2.11256 3.02164 1.12799 3.72615 0.551837 4.72468C-0.339497 6.24071 -0.1363 8.15175 1.05451 9.45178C0.686626 10.5413 0.813308 11.7348 1.40162 12.7258C2.28637 14.2459 4.06498 15.0279 5.80204 14.6599C6.5743 15.5189 7.68504 16.0074 8.849 15.9999C10.6256 16.0044 12.2015 14.8754 12.7478 13.2069C13.8884 12.9764 14.873 12.2718 15.4491 11.2733C16.3394 9.75728 16.1357 7.84774 14.9454 6.54771L14.9449 6.54871ZM8.85001 14.9544C8.13907 14.9554 7.45043 14.7099 6.90468 14.2604C6.92951 14.2474 6.97259 14.2239 7.00046 14.2069L10.2293 12.3668C10.3945 12.2743 10.4959 12.1008 10.4949 11.9133V7.42173L11.8595 8.19925C11.8742 8.20625 11.8838 8.22025 11.8858 8.23625V11.9558C11.8838 13.6099 10.5263 14.9509 8.85001 14.9544ZM2.32133 12.2028C1.9651 11.5958 1.8369 10.8843 1.95902 10.1938C1.98284 10.2078 2.02489 10.2333 2.05479 10.2503L5.28366 12.0903C5.44733 12.1848 5.65003 12.1848 5.81421 12.0903L9.75604 9.84429V11.3993C9.75705 11.4153 9.74945 11.4308 9.73678 11.4408L6.47295 13.3004C5.01915 14.1264 3.1625 13.6354 2.32184 12.2028H2.32133ZM1.47155 5.24819C1.82626 4.64017 2.38619 4.17516 3.05305 3.93366C3.05305 3.96116 3.05152 4.00966 3.05152 4.04366V7.72424C3.05051 7.91124 3.15186 8.08475 3.31654 8.17725L7.25838 10.4228L5.89376 11.2003C5.88008 11.2093 5.86285 11.2108 5.84765 11.2043L2.58331 9.34327C1.13255 8.51426 0.63494 6.68272 1.47104 5.24869L1.47155 5.24819ZM12.6834 7.82274L8.74157 5.57669L10.1062 4.79968C10.1199 4.79068 10.1371 4.78918 10.1523 4.79568L13.4166 6.65522C14.8699 7.48373 15.3681 9.31827 14.5284 10.7523C14.1732 11.3593 13.6138 11.8243 12.9474 12.0663V8.27575C12.9489 8.08875 12.8481 7.91574 12.6839 7.82274H12.6834ZM14.0414 5.8057C14.0176 5.7912 13.9756 5.7662 13.9457 5.7492L10.7168 3.90916C10.5531 3.81466 10.3504 3.81466 10.1863 3.90916L6.24442 6.15521V4.60017C6.2434 4.58417 6.251 4.56867 6.26367 4.55867L9.52751 2.70063C10.9813 1.87311 12.84 2.36563 13.6781 3.80066C14.0323 4.40667 14.1605 5.11618 14.0404 5.8057H14.0414ZM5.50257 8.57726L4.13744 7.79974C4.12275 7.79274 4.11312 7.77874 4.11109 7.76274V4.04316C4.11211 2.38713 5.47368 1.0451 7.15197 1.0461C7.86189 1.0461 8.54902 1.2921 9.09476 1.74011C9.06993 1.75311 9.02737 1.77661 8.99899 1.79361L5.77012 3.63365C5.60493 3.72615 5.50358 3.89916 5.50459 4.08666L5.50257 8.57626V8.57726ZM6.24391 7.00022L7.99972 5.9997L9.75553 6.99972V9.00027L7.99972 10.0003L6.24391 9.00027V7.00022Z" fill="currentColor"></path>\n              </svg>',
                            modelDescription: 'adsadasdasd',
                        },
                        knowledgeGraphs: [
                            {
                                id: '762ad7d4-dc99-4dec-8061-72196d42f408',
                                icon: '',
                                name: 'NEw test graph rag after fix',
                                type: 'GRAPH_RAG',
                                toolId: '9dc1cd53-d1c9-45fb-ba8e-f0aab6f77e25',
                                version: 2,
                                createdBy: 19,
                                isReadOnly: false,
                                description: 'kjaskdjlaksjdasd',
                                workspaceId: 22,
                                configurations: {
                                    retrievals: [
                                        {
                                            hyde: true,
                                            topK: 1,
                                            database: '49e0a0e1-4fea-490a-ae07-149a0007120b',
                                            nodeLabel: 'ghsd',
                                            hydeSource: {
                                                llmId: '216134ca-9030-4760-b1ad-a09949f09325',
                                                promptId: 'b57073e3-70ef-4d22-beb0-ef167da4a70d',
                                            },
                                            hybridSearch: 'BM25',
                                            queryLanguage: 'cypher',
                                            queryExpansion: true,
                                            enableReRanking: true,
                                            embeddingModelId: 'e9c4d68c-d08e-4e68-a5d5-48297f405a1d',
                                            hybridSearchTopK: 1,
                                            reRankingModelId: '2db722a1-346e-4d12-86ee-b9554c815260',
                                            enableHybridSearch: true,
                                            queryUnderstanding: {
                                                llmId: '216134ca-9030-4760-b1ad-a09949f09325',
                                                queryType: 'NER',
                                            },
                                            textNodeProperties: ['char'],
                                            queryExpansionSource: {
                                                llmId: '216134ca-9030-4760-b1ad-a09949f09325',
                                                promptId: 'b57073e3-70ef-4d22-beb0-ef167da4a70d',
                                            },
                                            embeddingNodeProperty: 'sad',
                                            reRankingScoreThreshold: 1,
                                            enableQueryUnderstanding: true,
                                        },
                                    ],
                                    graphRagType: 'STANDARDRAG',
                                },
                            },
                        ],
                        customAttributes: '',
                        structuredOutput: {
                            data: [
                                {
                                    name: 'shamila',
                                    value: 'shamila desc',
                                    dataType: 'string',
                                },
                                {
                                    name: 'hasaranga',
                                    value: 'desc',
                                    dataType: 'int',
                                },
                                {
                                    name: 'three',
                                    value: 'boolean',
                                    dataType: 'bool',
                                },
                                {
                                    name: 'four',
                                    value: 'floar',
                                    dataType: 'float',
                                },
                                {
                                    name: 'five',
                                    value: '[]',
                                    dataType: 'list',
                                },
                                {
                                    name: 'six',
                                    value: '[D]',
                                    dataType: 'dict',
                                },
                            ],
                            enabled: true,
                        },
                        executableFunctions: [],
                        saveAsReusableAgent: false,
                        enableCustomAttributes: false,
                        isReusableAgentSelected: false,
                    },
                    type: 'agent_node',
                    measured: {
                        width: 88,
                        height: 114,
                    },
                    position: {
                        x: 353.012676056338,
                        y: 212.8140845070423,
                    },
                    selected: true,
                },
                {
                    id: 'file_processing_agent_node-node-65e4b047-7ff2-446f-bd91-8ffd2d604278',
                    data: {
                        label: 'File Processing Agent',
                    },
                    type: 'file_processing_agent_node',
                    dragging: false,
                    measured: {
                        width: 100,
                        height: 132,
                    },
                    position: {
                        x: 192.7850306866167,
                        y: 124.007420869698,
                    },
                    selected: false,
                },
            ],
            variables: {
                apis: [],
                workflows: [],
            },
        },
        isDraft: false,
        executionRuntime: 'agentcore',
        runtimeId: '1',
        runtimeName: 'Production Runtime',
        runtimeRegion: 'us-east-1',
        availableVersions: [
            {
                name: 'publish',
                version: 5,
            },
            {
                name: 'draft',
                version: 5.1,
            },
        ],
    },
};
