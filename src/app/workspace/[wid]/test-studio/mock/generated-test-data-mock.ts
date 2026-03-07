// Mock data for generated test data modal (workflow-level and agent-level tables)
// Covers scenarios #G1–#G6 as specified by user

export interface WorkflowTestCase {
    id: string;
    input: {message:string};
    output: string;
    expectedBehaviour: string;
    agents: AgentTestCase[];
}

export interface AgentToolCall {
    toolName: string;
    called: boolean;
    reason: string;
    mockResponse?: object;
}

export interface AgentTestCase {
    agent: string;
    output: string;
    expectedBehaviour: string;
    toolCalls?: AgentToolCall[];
}
const customerResponse = {
    customer_id: 'CUST1001',
    name: 'John Smith',
    age: 35,
    policy: {
        type: 'Term Life',
        coverage_amount: 500000,
        premium: 150,
        premium_frequency: 'monthly',
        status: 'Active',
        issue_date: '2020-01-15',
        expiry_date: '2040-01-15',
    },
    preexisting_conditions: [],
    lifestyle_factors: ['Non-Smoker'],
    risk_level: 'Low',
};
const claimResponse = {
    customer_id: 'CUST1078',
    total_claims: 2,
    claims: [
        {
            claim_id: 'CLM8001',
            filed_date: '2023-02-15',
            type: 'Outpatient Surgery',
            claimed_amount: 8500,
            approved_amount: 8500,
            status: 'Approved',
            remarks: 'Routine procedure, full coverage',
        },
        {
            claim_id: 'CLM8002',
            filed_date: '2023-11-03',
            type: 'Diagnostic Tests',
            claimed_amount: 2200,
            approved_amount: 2200,
            status: 'Approved',
            remarks: 'Preventive screening covered',
        },
    ],
};
export const generatedTestCases: WorkflowTestCase[] = [
    {
        id: 'G1',
        input:{message: 'A customer wants to check if their policy is still active. The customer ID is CUST1001. They just need to confirm the current status.'},
        output: 'Policy status confirmed as active for customer CUST1001. Term Life policy with 500,000 USD coverage. Issued January 2020 with 20-year duration.',
        expectedBehaviour:
            'Only Claims Analyst should be called for status check. Risk Mitigator should not be called. Simple status response should be returned.',
        agents: [
            {
                agent: 'Claims Analyst',
                output: 'Policy status for CUST1001 is Active. Term Life policy with 500,000 USD coverage at 150 USD monthly. Issued January 2020 for 20 years.',
                expectedBehaviour:
                    'Agent should be called for status lookup. Insurance Customers API should be called. Insurance Claims API should not be called. Output should be limited to status data.',
                toolCalls: [
                    {
                        toolName: 'Insurance Customers API',
                        called: true,
                        reason: 'Status lookup only, no claims data requested',
                        mockResponse: customerResponse,
                    },
                    {
                        toolName: 'Insurance Claims API',
                        called: false,
                        reason: 'Status lookup only, no claims data requested',
                        mockResponse: claimResponse,
                    },
                ],
            },
            {
                agent: 'Risk Mitigator',
                output: 'Not called. Status check does not require Risk Mitigator.',
                expectedBehaviour: 'Risk Mitigator should not be called for simple status checks',
                toolCalls: [
                    {
                        toolName: 'Insurance Customers API',
                        called: false,
                        reason: 'Agent not invoked (data only request)',
                        mockResponse: customerResponse,
                    },
                    {
                        toolName: 'Insurance Claims API',
                        called: false,
                        reason: 'Agent not invoked (data only request)',
                        mockResponse: claimResponse,
                    },
                ],
            },
        ],
    },
    {
        id: 'G2',
        input:{message: 'A customer wants to know what riders are generally available for Term Life policies and what the eligibility criteria are. This is a general question not specific to their policy.'},
        output: 'Available riders for Term Life include Critical Illness, Accident Death Benefit, and Waiver of Premium. Each has specific eligibility criteria based on health status and age. General eligibility assessed at rider addition.',
        expectedBehaviour:
            'Risk Mitigator should be called for underwriting questions. Claims Analyst should not be called for general queries. Response should cover rider types and eligibility.',
        agents: [
            {
                agent: 'Claims Analyst',
                output: 'Not called. General questions do not require Claims Analyst.',
                expectedBehaviour:
                    'Claims Analyst should not be called for general underwriting questions without customer context.',
                toolCalls: [
                    {
                        toolName: 'Insurance Customers API',
                        called: false,
                        reason: 'Agent not invoked (general query)',
                        mockResponse: customerResponse,
                    },
                    {
                        toolName: 'Insurance Claims API',
                        called: false,
                        reason: 'Agent not invoked (general query)',
                        mockResponse: claimResponse,
                    },
                ],
            },
            {
                agent: 'Risk Mitigator',
                output: 'Term Life riders include Critical Illness, Accident Death, Waiver of Premium, and Premium Refund options. Each has eligibility criteria based on age, health, and policy status.',
                expectedBehaviour:
                    'Agent should be called for underwriting query. APIs may not be needed for general knowledge questions. Output should cover standard riders and eligibility.',
                toolCalls: [
                    {
                        toolName: 'Insurance Customers API',
                        called: false,
                        reason: 'General knowledge response, no customer context',
                        mockResponse: customerResponse,
                    },
                    {
                        toolName: 'Insurance Claims API',
                        called: false,
                        reason: 'General knowledge response, no customer context',
                        mockResponse: claimResponse,
                    },
                ],
            },
        ],
    },
    {
        id: 'G3',
        input:{message: 'A customer wants a complete review of their policy including current status, claims history, risk assessment, and recommendations for improvements. The customer ID is CUST1045.'},
        output: 'Full review for CUST1045: Whole Life policy active with 250,000 USD coverage. Four claims totaling 26,000 USD approved. High risk due to chronic conditions and smoking. Conditional renewal with premium increase and exclusions recommended.',
        expectedBehaviour:
            'Both agents should be called for comprehensive review. Claims Analyst called first for data. Risk Mitigator called second for assessment. Response should include data and recommendations.',
        agents: [
            {
                agent: 'Claims Analyst',
                output: 'Customer CUST1045 Maria Garcia has Whole Life policy with 250,000 USD coverage. Four claims on record with three approved. Preexisting conditions and smoker status noted. Summary indicates high-risk requiring underwriting review.',
                expectedBehaviour:
                    'Agent should be called for full data retrieval. Both APIs should be called. Complete policy and claims data should be returned with summary for next agent.',
                toolCalls: [
                    {
                        toolName: 'Insurance Customers API',
                        called: true,
                        reason: 'Full data retrieval needed',
                        mockResponse: customerResponse,
                    },
                    {
                        toolName: 'Insurance Claims API',
                        called: true,
                        reason: 'Full data retrieval needed',
                        mockResponse: claimResponse,
                    },
                ],
            },
            {
                agent: 'Risk Mitigator',
                output: 'High risk assessment for CUST1045. Conditional renewal with 15 percent premium increase. Exclusions for diabetes and cardiac. No riders or discounts eligible. Alternative coverage reduction offered.',
                expectedBehaviour:
                    'Expected Ground Truth Agent should be called after Claims Analyst. Both APIs should be called for underwriting. Full assessment with recommendations and justification should be provided. Tool Validation: The Insurance Customers API was called successfully. The Insurance Claims API was called successfully.',
                toolCalls: [
                    {
                        toolName: 'Insurance Customers API',
                        called: true,
                        reason: 'Full underwriting assessment needed',
                        mockResponse: customerResponse,
                    },
                    {
                        toolName: 'Insurance Claims API',
                        called: true,
                        reason: 'Full underwriting assessment needed',
                        mockResponse: claimResponse,
                    },
                ],
            },
        ],
    },
    {
        id: 'G4',
        input:{message: 'What are your business hours for customer support?'},
        output: 'Customer support hours are Monday to Friday 8 AM to 8 PM and Saturday 9 AM to 5 PM. Emergency line available 24/7 for urgent matters.',
        expectedBehaviour:
            'No agents should be called for FAQ questions. Orchestrator should respond directly with standard information.',
        agents: [
            {
                agent: 'Claims Analyst',
                output: 'Not called. FAQ questions do not require Claims Analyst.',
                expectedBehaviour: 'Claims Analyst should not be called for FAQ questions.',
                toolCalls: [
                    {
                        toolName: 'Insurance Customers API',
                        called: false,
                        reason: 'Agent not invoked (FAQ)',
                        mockResponse: customerResponse,
                    },
                    {
                        toolName: 'Insurance Claims API',
                        called: false,
                        reason: 'Agent not invoked (FAQ)',
                        mockResponse: claimResponse,
                    },
                ],
            },
            {
                agent: 'Risk Mitigator',
                output: 'Not called. FAQ questions do not require Risk Mitigator.',
                expectedBehaviour: 'Risk Mitigator should not be called for FAQ questions.',
                toolCalls: [
                    {
                        toolName: 'Insurance Customers API',
                        called: false,
                        reason: 'Agent not invoked (FAQ)',
                        mockResponse: customerResponse,
                    },
                    {
                        toolName: 'Insurance Claims API',
                        called: false,
                        reason: 'Agent not invoked (FAQ)',
                        mockResponse: claimResponse,
                    },
                ],
            },
        ],
    },
    {
        id: 'G5',
        input:{message: 'A customer wants to see all their past claims and the status of each. The customer ID is CUST1078. They do not need any recommendations, just the claims history.'},
        output: 'Claims history for CUST1078: Two claims on record. CLM8001 for surgery at 8,500 USD approved. CLM8002 for diagnostics at 2,200 USD approved. All claims fully approved.',
        expectedBehaviour:
            'Only Claims Analyst should be called for claims lookup. Risk Mitigator should not be called. Response should contain claims data only.',
        agents: [
            {
                agent: 'Claims Analyst',
                output: 'Two claims for CUST1078. CLM8001 surgery 8,500 USD approved February 2023. CLM8002 diagnostics 2,200 USD approved November 2023. All claims fully approved.',
                expectedBehaviour:
                    'Agent should be called for claims lookup. Insurance Claims API should be called. Output should focus on claims data without recommendations.',
                toolCalls: [
                    {
                        toolName: 'Insurance Customers API',
                        called: true,
                        reason: 'Customer verification + claims data',
                        mockResponse: customerResponse,
                    },
                    {
                        toolName: 'Insurance Claims API',
                        called: true,
                        reason: 'Customer verification + claims data',
                        mockResponse: claimResponse,
                    },
                ],
            },
            {
                agent: 'Risk Mitigator',
                output: 'Not called. Customer requested data only without recommendations.',
                expectedBehaviour: 'Risk Mitigator should not be called when customer requests data only.',
                toolCalls: [
                    {
                        toolName: 'Insurance Customers API',
                        called: false,
                        reason: 'Agent not invoked (data only, no recommendations)',
                        mockResponse: customerResponse,
                    },
                    {
                        toolName: 'Insurance Claims API',
                        called: false,
                        reason: 'Agent not invoked (data only, no recommendations)',
                        mockResponse: claimResponse,
                    },
                ],
            },
        ],
    },
    {
        id: 'G6',
        input:{message: 'A customer wants to know what riders they should add to their policy based on their profile. The customer ID is CUST1092. They only want rider recommendations, not a full policy review.'},
        output: 'Rider recommendations for CUST1092: Critical Illness Rider recommended at 25 USD monthly. Accident Cover at 15 USD monthly. Disability Income at 35 USD monthly. Waiver of Premium not needed. Total additional premium 75 USD monthly',
        expectedBehaviour:
            'Claims Analyst should be called for customer context. Risk Mitigator should be called for recommendations. Response should focus on riders only, not full review.',
        agents: [
            {
                agent: 'Claims Analyst',
                output: 'Profile for CUST1092: Age 28, Term Life 200,000 USD, 75 USD monthly, no conditions, non-smoker, active lifestyle, no claims. Summary: Eligible for all riders at preferred rates.',
                expectedBehaviour:
                    'Agent should be called for profile data. Both APIs should be called to confirm eligibility factors. Output should focus on rider eligibility information.',
                toolCalls: [
                    {
                        toolName: 'Insurance Customers API',
                        called: true,
                        reason: 'Profile + claims history for eligibility',
                        mockResponse: customerResponse,
                    },
                    {
                        toolName: 'Insurance Claims API',
                        called: true,
                        reason: 'Profile + claims history for eligibility',
                        mockResponse: claimResponse,
                    },
                ],
            },
            {
                agent: 'Risk Mitigator',
                output: 'Recommended riders for CUST1092: Critical Illness 100,000 USD at 25 USD monthly. Accident Cover 200,000 USD at 15 USD monthly. Disability Income at 35 USD monthly. Waiver not recommended. Total 75 USD monthly additional.',
                expectedBehaviour:
                    'Agent should be called after Claims Analyst. APIs should be called for eligibility verification. Recommendations should focus on riders only with justification.',
                toolCalls: [
                    {
                        toolName: 'Insurance Customers API',
                        called: true,
                        reason: 'Eligibility verification for recommendations',
                        mockResponse: customerResponse,
                    },
                    {
                        toolName: 'Insurance Claims API',
                        called: true,
                        reason: 'Eligibility verification for recommendations',
                        mockResponse: claimResponse,
                    },
                ],
            },
        ],
    },
];
