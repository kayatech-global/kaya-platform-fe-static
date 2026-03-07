export const EXECUTION_STEP_GRAPH = {
    edges: [
        // Start -> Claims Manager
        {
            id: 'e-start-agent1',
            type: 'smoothstep',
            source: 'start_node-node-1',
            target: 'agent_node-node-1',
            animated: true,
        },
        // Claims Manager -> LLM 1
        {
            id: 'e-agent1-llm1',
            type: 'straight',
            source: 'agent_node-node-1',
            target: 'llm-node-1',
            animated: true,
        },
        // LLM 1 -> Claims Analyst
        {
            id: 'e-llm1-agent2',
            type: 'straight',
            source: 'llm-node-1',
            target: 'agent_node-node-2',
            animated: true,
        },
        // Claims Analyst -> LLM 2
        {
            id: 'e-agent2-llm2',
            type: 'straight',
            source: 'agent_node-node-2',
            target: 'llm-node-2',
            animated: true,
        },
        // LLM 2 -> API 2-1 (Insurance Customers)
        {
            id: 'e-llm2-api2-1',
            type: 'straight',
            source: 'llm-node-2',
            target: 'api-node-2-1',
            animated: true,
        },
        // API 2-1 -> API 2-2 (Insurance Claims)
        {
            id: 'e-api2-1-api2-2',
            type: 'straight',
            source: 'api-node-2-1',
            target: 'api-node-2-2',
            animated: true,
        },
        // API 2-2 -> Risk Mitigator
        {
            id: 'e-api2-2-agent3',
            type: 'straight',
            source: 'api-node-2-2',
            target: 'agent_node-node-3',
            animated: true,
        },
        // Risk Mitigator -> LLM 3
        {
            id: 'e-agent3-llm3',
            type: 'straight',
            source: 'agent_node-node-3',
            target: 'llm-node-3',
            animated: true,
        },
        // LLM 3 -> API 3-1 (Insurance Customers)
        {
            id: 'e-llm3-api3-1',
            type: 'straight',
            source: 'llm-node-3',
            target: 'api-node-3-1',
            animated: true,
        },
        // API 3-1 -> API 3-2 (Insurance Claims)
        {
            id: 'e-api3-1-api3-2',
            type: 'straight',
            source: 'api-node-3-1',
            target: 'api-node-3-2',
            animated: true,
        },
        // API 3-2 -> End
        {
            id: 'e-api3-2-end',
            type: 'straight',
            source: 'api-node-3-2',
            target: 'end_node-node-1',
            animated: true,
        },
    ],
    nodes: [
        {
            id: 'start_node-node-1',
            data: {
                label: 'Start',
            },
            type: 'start_node',
            dragging: false,
            measured: {
                width: 88,
                height: 92,
            },
            position: { x: 0, y: 0 },
            selected: false,
        },
        {
            id: 'agent_node-node-1',
            data: {
                name: 'Claims Manager',
                label: 'Agent',
                description: 'Reviews insurance policy and claims',
                languageModal: {
                    id: 'OpenAI',
                    isSlm: false,
                    modelId: '0648e76c-097d-4d96-9db0-a0d05843c87e',
                    provider: 'OpenAI',
                    modelName: 'Open AI chatgpt',
                    providerLogo:
                        '<svg data-testid="geist-icon" height="48" stroke-linejoin="round" viewBox="0 0 16 16" width="48" style="color: currentcolor">\n                <path d="M14.9449 6.54871C15.3128 5.45919 15.1861 4.26567 14.5978 3.27464C13.7131 1.75461 11.9345 0.972595 10.1974 1.3406C9.42464 0.481584 8.3144 -0.00692594 7.15045 7.42132e-05C5.37487 -0.00392587 3.79946 1.1241 3.2532 2.79113C2.11256 3.02164 1.12799 3.72615 0.551837 4.72468C-0.339497 6.24071 -0.1363 8.15175 1.05451 9.45178C0.686626 10.5413 0.813308 11.7348 1.40162 12.7258C2.28637 14.2459 4.06498 15.0279 5.80204 14.6599C6.5743 15.5189 7.68504 16.0074 8.849 15.9999C10.6256 16.0044 12.2015 14.8754 12.7478 13.2069C13.8884 12.9764 14.873 12.2718 15.4491 11.2733C16.3394 9.75728 16.1357 7.84774 14.9454 6.54771L14.9449 6.54871ZM8.85001 14.9544C8.13907 14.9554 7.45043 14.7099 6.90468 14.2604C6.92951 14.2474 6.97259 14.2239 7.00046 14.2069L10.2293 12.3668C10.3945 12.2743 10.4959 12.1008 10.4949 11.9133V7.42173L11.8595 8.19925C11.8742 8.20625 11.8838 8.22025 11.8858 8.23625V11.9558C11.8838 13.6099 10.5263 14.9509 8.85001 14.9544ZM2.32133 12.2028C1.9651 11.5958 1.8369 10.8843 1.95902 10.1938C1.98284 10.2078 2.02489 10.2333 2.05479 10.2503L5.28366 12.0903C5.44733 12.1848 5.65003 12.1848 5.81421 12.0903L9.75604 9.84429V11.3993C9.75705 11.4153 9.74945 11.4308 9.73678 11.4408L6.47295 13.3004C5.01915 14.1264 3.1625 13.6354 2.32184 12.2028H2.32133ZM1.47155 5.24819C1.82626 4.64017 2.38619 4.17516 3.05305 3.93366C3.05305 3.96116 3.05152 4.00966 3.05152 4.04366V7.72424C3.05051 7.91124 3.15186 8.08475 3.31654 8.17725L7.25838 10.4228L5.89376 11.2003C5.88008 11.2093 5.86285 11.2108 5.84765 11.2043L2.58331 9.34327C1.13255 8.51426 0.63494 6.68272 1.47104 5.24869L1.47155 5.24819ZM12.6834 7.82274L8.74157 5.57669L10.1062 4.79968C10.1199 4.79068 10.1371 4.78918 10.1523 4.79568L13.4166 6.65522C14.8699 7.48373 15.3681 9.31827 14.5284 10.7523C14.1732 11.3593 13.6138 11.8243 12.9474 12.0663V8.27575C12.9489 8.08875 12.8481 7.91574 12.6839 7.82274H12.6834ZM14.0414 5.8057C14.0176 5.7912 13.9756 5.7662 13.9457 5.7492L10.7168 3.90916C10.5531 3.81466 10.3504 3.81466 10.1863 3.90916L6.24442 6.15521V4.60017C6.2434 4.58417 6.251 4.56867 6.26367 4.55867L9.52751 2.70063C10.9813 1.87311 12.84 2.36563 13.6781 3.80066C14.0323 4.40667 14.1605 5.11618 14.0404 5.8057H14.0414ZM5.50257 8.57726L4.13744 7.79974C4.12275 7.79274 4.11312 7.77874 4.11109 7.76274V4.04316C4.11211 2.38713 5.47368 1.0451 7.15197 1.0461C7.86189 1.0461 8.54902 1.2921 9.09476 1.74011C9.06993 1.75311 9.02737 1.77661 8.99899 1.79361L5.77012 3.63365C5.60493 3.72615 5.50358 3.89916 5.50459 4.08666L5.50257 8.57626V8.57726ZM6.24391 7.00022L7.99972 5.9997L9.75553 6.99972V9.00027L7.99972 10.0003L6.24391 9.00027V7.00022Z" fill="currentColor"></path>\n              </svg>',
                    modelDescription:
                        'GPT-4o from OpenAI has broad general knowledge and domain expertise allowing it to follow complex instructions in natural language and solve difficult problems accurately. It matches GPT-4 Turbo performance with a faster and cheaper API.',
                },
                saveAsReusableAgent: false,
                isReusableAgentSelected: false,
            },
            type: 'decision_node',
            dragging: false,
            measured: { width: 88, height: 132 },
            position: { x: 0, y: 0 },
        },
        {
            id: 'llm-node-1',
            type: 'LLM',
            data: {
                name: 'Open AI chatgpt',
                modelId: '0648e76c-097d-4d96-9db0-a0d05843c87e',
                provider: 'OpenAI',
                label: 'LLM',
                description: 'GPT-4o from OpenAI',
            },
            position: { x: 0, y: 0 },
        },
        {
            id: 'agent_node-node-2',
            data: {
                apis: [
                    {
                        id: '6847c3c7-e305-4a7e-b754-499c5333f7d2',
                        name: 'Insurance Customers',
                        description:
                            'This API returns the primary insurance policyholder details. Each row represents one customer and their current policy information, medical profile, and risk indicators \n.Column Name\tType\tDescription\ncustomer_id\tTEXT\tUnique identifier for the customer (e.g., "CUST1001")\nname\tTEXT\tFull name of the policyholder\nage\tINTEGER\tAge of the customer at the last policy update\ngender\tTEXT\tGender identity ("Male", "Female", "Other")\npolicy_type\tTEXT\tType of policy ("Term Life", "Whole Life", "Critical Illness", etc.)\ncoverage_amount\tINTEGER\tInsured amount in USD\npremium\tREAL\tMonthly premium in USD\nissue_date\tDATE\tDate the current policy was issued\nstatus\tTEXT\tPolicy status ("Active", "Lapsed", "Expired", "Pending")\npreexisting_conditions\tTEXT\tComma-separated list of known health conditions (e.g., "Diabetes, Hypertension")\nlifestyle_factors TEXT  Comma-separated list of known risk factors, (eg. "Smoker, Drinker, Stressed")\ncoverage_duration INT years over which the insurance will be active\nid iINT unique id added by the db',
                    },
                    {
                        id: '4be95305-6f70-4d99-92d5-d3dad6ba8f45',
                        name: 'Insurance Claims',
                        description:
                            'This API returns historical claims data made by customers. Each row is a separate claim associated with a policyholder, including the date, nature of the claim, and outcome.\nColumn Name\tType\tDescription\nclaim_id\tTEXT\tUnique identifier for the claim (e.g., "CLM9051")\ncustomer_id\tTEXT\tForeign key linking to the customers.customer_id\nclaim_date\tDATE\tDate the claim was filed\ndiagnosis\tTEXT\tMedical condition or event prompting the claim\nclaim_amount\tREAL\tAmount claimed in USD\napproved_amount\tREAL\tAmount approved or paid out\nstatus\tTEXT\tClaim status ("Approved", "Rejected", "Under Review")\nremarks\tTEXT\tAdditional context about the claim, including reason for denial or underwriting notes',
                    },
                ],
                name: 'Claims Analyst',
                label: 'Agent',
                prompt: {
                    id: '2104f313-cacf-45be-b565-9f4c508340c0',
                    name: 'Policy and Claims',
                    description: 'Evaluates customers policy details and their claims history',
                    configurations: {
                        prompt_template:
                            'You are an Insurance Policy & Claims Analyst AI with expertise in interpreting customer insurance data. Your task is to review the customer’s policy details and claims history from the tools you have at your dispisal and respind to user queries. Extract key risk indicators, coverage status, claim outcomes, exclusions, and health trends.\n\nRespond with:\n1. A summary of the customer’s current policy\n2. Any notable claims (dates, outcomes, diagnoses)\n3. Identified risk factors (e.g., chronic illnesses, age)\n4. Coverage gaps, restrictions, or upcoming renewals\n5. A structured handoff note to the Recommendations Agent\n\nBe objective, concise, and use tabular format where applicable.',
                    },
                },
                description: 'Accesses both customer data and claims data to analyze',
                languageModal: {
                    id: 'OpenAI',
                    isSlm: false,
                    modelId: '0648e76c-097d-4d96-9db0-a0d05843c87e',
                    provider: 'OpenAI',
                    modelName: 'Open AI chatgpt',
                    providerLogo:
                        '<svg data-testid="geist-icon" height="48" stroke-linejoin="round" viewBox="0 0 16 16" width="48" style="color: currentcolor">\n                <path d="M14.9449 6.54871C15.3128 5.45919 15.1861 4.26567 14.5978 3.27464C13.7131 1.75461 11.9345 0.972595 10.1974 1.3406C9.42464 0.481584 8.3144 -0.00692594 7.15045 7.42132e-05C5.37487 -0.00392587 3.79946 1.1241 3.2532 2.79113C2.11256 3.02164 1.12799 3.72615 0.551837 4.72468C-0.339497 6.24071 -0.1363 8.15175 1.05451 9.45178C0.686626 10.5413 0.813308 11.7348 1.40162 12.7258C2.28637 14.2459 4.06498 15.0279 5.80204 14.6599C6.5743 15.5189 7.68504 16.0074 8.849 15.9999C10.6256 16.0044 12.2015 14.8754 12.7478 13.2069C13.8884 12.9764 14.873 12.2718 15.4491 11.2733C16.3394 9.75728 16.1357 7.84774 14.9454 6.54771L14.9449 6.54871ZM8.85001 14.9544C8.13907 14.9554 7.45043 14.7099 6.90468 14.2604C6.92951 14.2474 6.97259 14.2239 7.00046 14.2069L10.2293 12.3668C10.3945 12.2743 10.4959 12.1008 10.4949 11.9133V7.42173L11.8595 8.19925C11.8742 8.20625 11.8838 8.22025 11.8858 8.23625V11.9558C11.8838 13.6099 10.5263 14.9509 8.85001 14.9544ZM2.32133 12.2028C1.9651 11.5958 1.8369 10.8843 1.95902 10.1938C1.98284 10.2078 2.02489 10.2333 2.05479 10.2503L5.28366 12.0903C5.44733 12.1848 5.65003 12.1848 5.81421 12.0903L9.75604 9.84429V11.3993C9.75705 11.4153 9.74945 11.4308 9.73678 11.4408L6.47295 13.3004C5.01915 14.1264 3.1625 13.6354 2.32184 12.2028H2.32133ZM1.47155 5.24819C1.82626 4.64017 2.38619 4.17516 3.05305 3.93366C3.05305 3.96116 3.05152 4.00966 3.05152 4.04366V7.72424C3.05051 7.91124 3.15186 8.08475 3.31654 8.17725L7.25838 10.4228L5.89376 11.2003C5.88008 11.2093 5.86285 11.2108 5.84765 11.2043L2.58331 9.34327C1.13255 8.51426 0.63494 6.68272 1.47104 5.24869L1.47155 5.24819ZM12.6834 7.82274L8.74157 5.57669L10.1062 4.79968C10.1199 4.79068 10.1371 4.78918 10.1523 4.79568L13.4166 6.65522C14.8699 7.48373 15.3681 9.31827 14.5284 10.7523C14.1732 11.3593 13.6138 11.8243 12.9474 12.0663V8.27575C12.9489 8.08875 12.8481 7.91574 12.6839 7.82274H12.6834ZM14.0414 5.8057C14.0176 5.7912 13.9756 5.7662 13.9457 5.7492L10.7168 3.90916C10.5531 3.81466 10.3504 3.81466 10.1863 3.90916L6.24442 6.15521V4.60017C6.2434 4.58417 6.251 4.56867 6.26367 4.55867L9.52751 2.70063C10.9813 1.87311 12.84 2.36563 13.6781 3.80066C14.0323 4.40667 14.1605 5.11618 14.0404 5.8057H14.0414ZM5.50257 8.57726L4.13744 7.79974C4.12275 7.79274 4.11312 7.77874 4.11109 7.76274V4.04316C4.11211 2.38713 5.47368 1.0451 7.15197 1.0461C7.86189 1.0461 8.54902 1.2921 9.09476 1.74011C9.06993 1.75311 9.02737 1.77661 8.99899 1.79361L5.77012 3.63365C5.60493 3.72615 5.50358 3.89916 5.50459 4.08666L5.50257 8.57626V8.57726ZM6.24391 7.00022L7.99972 5.9997L9.75553 6.99972V9.00027L7.99972 10.0003L6.24391 9.00027V7.00022Z" fill="currentColor"></path>\n              </svg>',
                    modelDescription:
                        'GPT-4o from OpenAI has broad general knowledge and domain expertise allowing it to follow complex instructions in natural language and solve difficult problems accurately. It matches GPT-4 Turbo performance with a faster and cheaper API.',
                },
                saveAsReusableAgent: false,
                isReusableAgentSelected: false,
            },
            type: 'agent_node',
            dragging: false,
            measured: { width: 88, height: 114 },
            position: { x: 0, y: 0 },
            selected: false,
        },
        {
            id: 'llm-node-2',
            type: 'LLM',
            data: {
                name: 'Open AI chatgpt',
                modelId: '0648e76c-097d-4d96-9db0-a0d05843c87e',
                provider: 'OpenAI',
                label: 'LLM',
                description: 'GPT-4o from OpenAI',
            },
            position: { x: 0, y: 0 },
        },
        {
            id: 'api-node-2-1',
            type: 'API',
            data: {
                name: 'Insurance Customers',
                label: 'API',
                description: 'Returns primary insurance policyholder details',
            },
            position: { x: 0, y: 0 },
        },
        {
            id: 'api-node-2-2',
            type: 'API',
            data: {
                name: 'Insurance Claims',
                label: 'API',
                description: 'Returns historical claims data',
            },
            position: { x: 0, y: 0 },
        },
        {
            id: 'agent_node-node-3',
            data: {
                apis: [
                    {
                        id: '6847c3c7-e305-4a7e-b754-499c5333f7d2',
                        name: 'Insurance Customers',
                        description:
                            'This API returns the primary insurance policyholder details. Each row represents one customer and their current policy information, medical profile, and risk indicators \n.Column Name\tType\tDescription\ncustomer_id\tTEXT\tUnique identifier for the customer (e.g., "CUST1001")\nname\tTEXT\tFull name of the policyholder\nage\tINTEGER\tAge of the customer at the last policy update\ngender\tTEXT\tGender identity ("Male", "Female", "Other")\npolicy_type\tTEXT\tType of policy ("Term Life", "Whole Life", "Critical Illness", etc.)\ncoverage_amount\tINTEGER\tInsured amount in USD\npremium\tREAL\tMonthly premium in USD\nissue_date\tDATE\tDate the current policy was issued\nstatus\tTEXT\tPolicy status ("Active", "Lapsed", "Expired", "Pending")\npreexisting_conditions\tTEXT\tComma-separated list of known health conditions (e.g., "Diabetes, Hypertension")\nlifestyle_factors TEXT  Comma-separated list of known risk factors, (eg. "Smoker, Drinker, Stressed")\ncoverage_duration INT years over which the insurance will be active\nid iINT unique id added by the db',
                    },
                    {
                        id: '4be95305-6f70-4d99-92d5-d3dad6ba8f45',
                        name: 'Insurance Claims',
                        description:
                            'This API returns historical claims data made by customers. Each row is a separate claim associated with a policyholder, including the date, nature of the claim, and outcome.\nColumn Name\tType\tDescription\nclaim_id\tTEXT\tUnique identifier for the claim (e.g., "CLM9051")\ncustomer_id\tTEXT\tForeign key linking to the customers.customer_id\nclaim_date\tDATE\tDate the claim was filed\ndiagnosis\tTEXT\tMedical condition or event prompting the claim\nclaim_amount\tREAL\tAmount claimed in USD\napproved_amount\tREAL\tAmount approved or paid out\nstatus\tTEXT\tClaim status ("Approved", "Rejected", "Under Review")\nremarks\tTEXT\tAdditional context about the claim, including reason for denial or underwriting notes',
                    },
                ],
                name: 'Risk Mitigator',
                label: 'Agent',
                prompt: {
                    id: '5431d245-3394-4775-84cf-5eda2bd3f487',
                    name: 'Underwriting and Recommendations',
                    description: 'Advises on policy underwriting',
                    configurations: {
                        prompt_template:
                            'You are an Insurance Recommendations & Underwriting Advisor AI. Based on user query and data from tools at your disposal, evaluate the customer’s eligibility for policy changes, riders, exclusions, or discounts. Use real-world underwriting logic and reward patterns (e.g., stable HbA1c, no recent claims, wellness activities).\n\nOutput:\n1. Eligibility status for policy renewal or upgrades\n2. Rider suggestions (e.g., accident, wellness, critical illness)\n3. Discount opportunities or bonus programs\n4. Underwriting flags (e.g., exclusions, high-risk)\n5. A recommended action plan for the customer\n\nRespond clearly and justify each recommendation.',
                    },
                },
                description: 'Underwriting and RIsk mitigation specialist',
                languageModal: {
                    id: 'OpenAI',
                    isSlm: false,
                    modelId: '0648e76c-097d-4d96-9db0-a0d05843c87e',
                    provider: 'OpenAI',
                    modelName: 'Open AI chatgpt',
                    providerLogo:
                        '<svg data-testid="geist-icon" height="48" stroke-linejoin="round" viewBox="0 0 16 16" width="48" style="color: currentcolor">\n                <path d="M14.9449 6.54871C15.3128 5.45919 15.1861 4.26567 14.5978 3.27464C13.7131 1.75461 11.9345 0.972595 10.1974 1.3406C9.42464 0.481584 8.3144 -0.00692594 7.15045 7.42132e-05C5.37487 -0.00392587 3.79946 1.1241 3.2532 2.79113C2.11256 3.02164 1.12799 3.72615 0.551837 4.72468C-0.339497 6.24071 -0.1363 8.15175 1.05451 9.45178C0.686626 10.5413 0.813308 11.7348 1.40162 12.7258C2.28637 14.2459 4.06498 15.0279 5.80204 14.6599C6.5743 15.5189 7.68504 16.0074 8.849 15.9999C10.6256 16.0044 12.2015 14.8754 12.7478 13.2069C13.8884 12.9764 14.873 12.2718 15.4491 11.2733C16.3394 9.75728 16.1357 7.84774 14.9454 6.54771L14.9449 6.54871ZM8.85001 14.9544C8.13907 14.9554 7.45043 14.7099 6.90468 14.2604C6.92951 14.2474 6.97259 14.2239 7.00046 14.2069L10.2293 12.3668C10.3945 12.2743 10.4959 12.1008 10.4949 11.9133V7.42173L11.8595 8.19925C11.8742 8.20625 11.8838 8.22025 11.8858 8.23625V11.9558C11.8838 13.6099 10.5263 14.9509 8.85001 14.9544ZM2.32133 12.2028C1.9651 11.5958 1.8369 10.8843 1.95902 10.1938C1.98284 10.2078 2.02489 10.2333 2.05479 10.2503L5.28366 12.0903C5.44733 12.1848 5.65003 12.1848 5.81421 12.0903L9.75604 9.84429V11.3993C9.75705 11.4153 9.74945 11.4308 9.73678 11.4408L6.47295 13.3004C5.01915 14.1264 3.1625 13.6354 2.32184 12.2028H2.32133ZM1.47155 5.24819C1.82626 4.64017 2.38619 4.17516 3.05305 3.93366C3.05305 3.96116 3.05152 4.00966 3.05152 4.04366V7.72424C3.05051 7.91124 3.15186 8.08475 3.31654 8.17725L7.25838 10.4228L5.89376 11.2003C5.88008 11.2093 5.86285 11.2108 5.84765 11.2043L2.58331 9.34327C1.13255 8.51426 0.63494 6.68272 1.47104 5.24869L1.47155 5.24819ZM12.6834 7.82274L8.74157 5.57669L10.1062 4.79968C10.1199 4.79068 10.1371 4.78918 10.1523 4.79568L13.4166 6.65522C14.8699 7.48373 15.3681 9.31827 14.5284 10.7523C14.1732 11.3593 13.6138 11.8243 12.9474 12.0663V8.27575C12.9489 8.08875 12.8481 7.91574 12.6839 7.82274H12.6834ZM14.0414 5.8057C14.0176 5.7912 13.9756 5.7662 13.9457 5.7492L10.7168 3.90916C10.5531 3.81466 10.3504 3.81466 10.1863 3.90916L6.24442 6.15521V4.60017C6.2434 4.58417 6.251 4.56867 6.26367 4.55867L9.52751 2.70063C10.9813 1.87311 12.84 2.36563 13.6781 3.80066C14.0323 4.40667 14.1605 5.11618 14.0404 5.8057H14.0414ZM5.50257 8.57726L4.13744 7.79974C4.12275 7.79274 4.11312 7.77874 4.11109 7.76274V4.04316C4.11211 2.38713 5.47368 1.0451 7.15197 1.0461C7.86189 1.0461 8.54902 1.2921 9.09476 1.74011C9.06993 1.75311 9.02737 1.77661 8.99899 1.79361L5.77012 3.63365C5.60493 3.72615 5.50358 3.89916 5.50459 4.08666L5.50257 8.57626V8.57726ZM6.24391 7.00022L7.99972 5.9997L9.75553 6.99972V9.00027L7.99972 10.0003L6.24391 9.00027V7.00022Z" fill="currentColor"></path>\n              </svg>',
                    modelDescription:
                        'GPT-4o from OpenAI has broad general knowledge and domain expertise allowing it to follow complex instructions in natural language and solve difficult problems accurately. It matches GPT-4 Turbo performance with a faster and cheaper API.',
                },
                saveAsReusableAgent: false,
                isReusableAgentSelected: false,
            },
            type: 'agent_node',
            dragging: false,
            measured: { width: 88, height: 114 },
            position: { x: 0, y: 0 },
            selected: false,
        },
        {
            id: 'llm-node-3',
            type: 'LLM',
            data: {
                name: 'Open AI chatgpt',
                modelId: '0648e76c-097d-4d96-9db0-a0d05843c87e',
                provider: 'OpenAI',
                label: 'LLM',
                description: 'GPT-4o from OpenAI',
            },
            position: { x: 0, y: 0 },
        },
        {
            id: 'api-node-3-1',
            type: 'API',
            data: {
                name: 'Insurance Customers',
                label: 'API',
                description: 'Returns primary insurance policyholder details',
            },
            position: { x: 0, y: 0 },
        },
        {
            id: 'api-node-3-2',
            type: 'API',
            data: {
                name: 'Insurance Claims',
                label: 'API',
                description: 'Returns historical claims data',
            },
            position: { x: 0, y: 0 },
        },
        {
            id: 'end_node-node-1',
            data: {
                label: 'End',
            },
            type: 'end_node',
            dragging: false,
            measured: { width: 88, height: 92 },
            position: { x: 0, y: 0 },
            selected: false,
        },
    ],
    variables: {
        apis: [],
        workflows: [],
    },
};

export const MOCK_DATA = [
    {
        id: 'e5223cc4-ff91-4585-bdcb-415c65088a0e',
        name: 'sdfsdf',
        description: 'sdfsdfds',
        type: 'float',
    },
    {
        id: 'a9c18044-3fe8-43a9-bae6-dbd3f4e83533',
        name: 'test_new_variable',
        description: 'test_new_variable',
        type: 'int',
    },
    {
        id: 'd39fc55f-68cb-42ba-ac50-92e8a1e7733a',
        name: 'yasitha_test',
        description: 'Test Purpose',
        type: 'float',
    },
    {
        id: '90f7e5a3-cb61-44a6-8bc9-a9b1c6bcf27b',
        name: 'test_var_test',
        description: 'tesrt',
        type: 'string',
    },
    {
        id: 'addc143a-15f1-4bbb-ab90-99dc4f51e5ce',
        name: 'test2',
        description: 'wertyu',
        type: 'int',
    },
    {
        id: '511ba03c-1321-488c-a8fb-bb76fbd212ea',
        name: 'yasita_test_1',
        description: 'test123',
        type: 'int',
    },
    {
        id: '5fb51603-e38e-4e88-88f5-7b4fff9993bc',
        name: 'var_two',
        description: 'number var',
        type: 'int',
    },
    {
        id: 'd19d83e2-a419-42b6-ba67-ef2b5b778238',
        name: 'var_three',
        description: 'variable three',
        type: 'int',
    },
    {
        id: '0eedf4b4-79f7-4884-960d-9e2dccdf10c4',
        name: 'var1',
        description: 'variable one for this',
        type: 'string',
    },
    {
        id: '983f8831-1bb4-464c-9429-9408a9197e88',
        name: 'country_name',
        description: 'variable for country_name',
        type: 'string',
    },
    {
        id: 'df042b94-60b6-45d6-80c8-7493de29a210',
        name: 'sdsa',
        description: 'sadasdsadsadsadsadsadsa',
        type: 'string',
    },
    {
        id: 'ab820906-e022-4e8a-9c41-f2da76581e63',
        name: 'robert_test',
        description: 'Test purpose',
        type: 'string',
    },
    {
        id: 'f60acfc3-efd0-4edb-a45e-52c86853a3f2',
        name: 'age',
        description: 'age of user',
        type: 'int',
    },
    {
        id: '169ec26c-1ae7-4286-9385-7555ee56871d',
        name: 'age',
        description: 'Age of the user',
        type: 'int',
    },
    {
        id: '13bc17da-b59a-4bc1-8599-debbda25af37',
        name: 'mail_id',
        description: 'mail id of the user',
        type: 'string',
    },
    {
        id: 'aca910a5-39eb-4c88-9015-93bacb9c6ba7',
        name: 'male',
        description: 'gender of the user: True - male; False - female',
        type: 'bool',
    },
    {
        id: 'aca910a5-39eb-4c88-9015-93bacb9c6ba7',
        name: 'Customer ID',
        description: 'Customer ID',
        type: 'string',
    },
    {
        id: 'aca910a5-39eb-4c88-9015-93bacb9c6ba7',
        name: 'Customer_List',
        description: 'Customer List',
        type: 'string',
    },
];
