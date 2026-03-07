import {ITestExecutionHistory} from "@/models";
import {TestExecutionSafetyStatus, TestStatus} from "@/enums/test-studio-type";

const baseExecutionHistories: ITestExecutionHistory[] = [
    {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Actuarial Experts - Selective Agent Routing',
        description:
            'Validates the Claims Manager orchestrators ability to route requests to the correct agents based on query type. Tests cover scenarios where only Claims Analyst is called, only Risk Mitigator is called, both agents are called, and no agent is called for simple FAQ queries.',
        testId: 'a3e2d018-83bd-4d73-9b72-1b0acb5e6b8f',
        workflowId: '69f57dcd-c406-4bbf-a51d-004b6deb6644',
        passedCount: 3,
        failedCount: 0,
        createdAt: '2026-01-01T08:00:00.000Z',
        executionDuration: '00:15',
        datasets: [
            {
                id: '11111111-2222-4222-8222-222222222222',
                input:{message: 'A customer wants to check if their policy is still active. The customer ID is CUST1001. They just need to confirm the current status.'},
                expectedOutput: 'User created event + welcome email queued',
                expectedBehaviour: 'User created event + welcome email queued',
            },
            {
                id: '11111111-3333-4333-8333-333333333333',
                input:{message: 'Complete profile step with avatar upload'},
                expectedOutput: 'Profile saved with avatar URL and 200 OK',
                expectedBehaviour: 'Profile saved with avatar URL and 200 OK',
            },
        ],
        report: {
            id: '11111111-4444-4444-8444-444444444444',
            summary: `The test execution completed successfully with all 5 test cases passing, achieving a 100% pass rate and an average semantic match score of 96.8%. The Claims Manager orchestrator correctly demonstrated selective routing logic across all scenarios: routing to Claims Analyst only for data retrieval requests (Test Cases 1 and 5), routing to Risk Mitigator only for underwriting questions (Test Case 2), routing to both agents in sequence for comprehensive reviews (Test Case 3), and responding directly without invoking any agent for FAQ questions (Test Case 4). All expected API calls were validated, with the Insurance Customers API and Insurance Claims API called appropriately based on request scope. No orchestration mismatches, missing agents, or unexpected agent invocations were detected.`,
            resultCount: {
                total: 6,
                passed: 6,
                failed: 0,
            },
            score: 100,
            inputReport: [
                {
                    id: '11111111-5555-4555-8555-555555555555',
                    input: 'A customer wants to check if their policy is still active. The customer ID is CUST1001. They just need to confirm the current status.',
                    status: TestStatus.Passed,
                    steps: ['Claims Manager', 'Claims Analyst', 'Risk Mitigator'],
                    groundTruth:
                        'The orchestrator identified this as a status check requiring only data retrieval. Claims Analyst was called and retrieved policy status. Risk Mitigator was not called as no underwriting or recommendations were needed. Response returned directly from Claims Analyst data.',
                    actualGroundTruth:
                        'Context retrieved:\n- Policy Status: Active\n- Last Updated: 2026-01-01\n- Source: PolicyAPI',
                    groundTruthScore: 98,
                    tokens: 51232,
                    totalLatency: 15.2,
                    ragLatency: 2,
                    llmLatency: 13.2,
                    safetyStatus: TestExecutionSafetyStatus.PASSED,
                    aiInsights:
                        'The model correctly identified the intent as "Status Check". However, latency (15.2s) is higher than the expected baseline (8s) for simple retrieval tasks. Consider caching the policy status response.',
                    agentOutput:
                        'Only Claims Analyst should be called for status check. Risk Mitigator should not be called. Simple status response should be returned.',
                    score: 100,
                    expectedOutput:
                        'Policy status confirmed as active for customer CUST1001. Term Life policy with 500,000 USD coverage. Issued January 2020 with 20-year duration.',
                    actualOutput:
                        'The policy for customer CUST1001 is currently active. The policy type is Term Life with coverage of 500,000 USD and monthly premium of 150 USD. The policy was issued on January 15, 2020 and remains valid until 2040.',
                    outputDifferenceRationale:
                        'The actual output includes additional details (monthly premium of 150 USD, expiration year 2040) beyond what was specified in the expected output but is semantically consistent. Both correctly identify the policy as active with Term Life coverage of 500,000 USD issued in January 2020. The extra information does not contradict the expected output and enhances the response with supplementary policy details.',
                    behaviourDifferenceRationale:
                        'The orchestrator correctly identified the request as a simple status check and routed exclusively to Claims Analyst. Risk Mitigator was appropriately excluded as no underwriting assessment or recommendations were needed. The routing decision, agent invocation sequence, and API call pattern are fully aligned with the expected behaviour.',
                    agentStepDetails: [
                        {
                            agent: 'Claims Manager',
                            agentActualInput:
                                'A customer wants to check if their policy is still active. The customer ID is CUST1001.',
                            agentExpectedOutput:
                                'Policy status request for CUST1001. Data retrieval only. Routing to Claims Analyst. Risk Mitigator not needed.',
                            agentActualOutput:
                                'Request received for customer CUST1001 to verify policy status. This is a simple data lookup. Routing to Claims Analyst only. Risk Mitigator is not required for status verification.',
                            agentExpectedGroundTruth:
                                'Orchestrator should identify as data lookup. Only Claims Analyst should be routed to. Risk Mitigator should be excluded.',
                            agentActualGroundTruth:
                                'The orchestrator correctly identified this as a data-only request. Routing decision was to call Claims Analyst only. Risk Mitigator was correctly excluded from the routing. ',
                        },
                        {
                            agent: 'Claims Analyst',
                            agentActualInput:
                                'A customer wants to check if their policy is still active. The customer ID is CUST1001.',
                            agentExpectedOutput:
                                'Policy status for CUST1001 is Active. Term Life policy with 500,000 USD coverage at 150 USD monthly. Issued January 2020 for 20 years.',
                            agentActualOutput:
                                'Policy lookup for customer CUST1001 completed. Status is Active. Policy type is Term Life. Coverage amount is 500,000 USD. Premium is 150 USD monthly. Issue date is January 15, 2020. Coverage duration is 20 years expiring in 2040.',
                            agentExpectedGroundTruth:
                                'Agent should be called for status lookup. Insurance Customers API should be called. Insurance Claims API should not be called. Output should be limited to status data.',
                            agentActualGroundTruth:
                                'The agent was called by the orchestrator for status lookup. The Insurance Customers API was called with customer ID CUST1001 and returned policy status and details. The Insurance Claims API was not called as claims data was not requested. Output limited to status information as appropriate for the request. ',
                        },
                        {
                            agent: 'Risk Mitigator',
                            agentActualInput:
                                'A customer wants to check if their policy is still active. The customer ID is CUST1001.',
                            agentExpectedOutput: 'Not called. Status check does not require Risk Mitigator.',
                            agentActualOutput:
                                'Not called. This request was a policy status check that did not require underwriting assessment. ',
                            agentExpectedGroundTruth: 'Risk Mitigator should not be called for simple status checks.',
                            agentActualGroundTruth:
                                'The Risk Mitigator was not called by the orchestrator. This is correct as policy status verification does not require underwriting evaluation or recommendations.',
                        },
                    ],
                },
                {
                    id: '11111111-6666-4666-8666-666666666666',
                    input: 'A customer wants to know what riders are generally available for Term Life policies and what the eligibility criteria are. This is a general question not specific to their policy.',
                    status: TestStatus.Passed,
                    steps: ['Claims Manager', 'Claims Analyst', 'Risk Mitigator'],
                    groundTruth:
                        'The orchestrator identified this as a general underwriting question not requiring customer-specific data. Risk Mitigator was called to provide rider information and eligibility criteria. Claims Analyst was not called as no customer data lookup was needed. Response provided general policy information. ',
                    agentOutput:
                        'Risk Mitigator should be called for underwriting questions. Claims Analyst should not be called for general queries. Response should cover rider types and eligibility.',
                    score: 100,
                    tokens: 42150,
                    totalLatency: 12.8,
                    ragLatency: 1.8,
                    llmLatency: 11.0,
                    expectedOutput:
                        'Available riders for Term Life include Critical Illness, Accident Death Benefit, and Waiver of Premium. Each has specific eligibility criteria based on health status and age. General eligibility assessed at rider addition. ',
                    actualOutput:
                        'For Term Life policies, the following riders are generally available: Critical Illness Rider which provides lump sum payment upon diagnosis of covered conditions with el2igibility requiring no pre-existing critical conditions. Accident Death Benefit Rider which provides additional payout for accidental death with eligibility open to all policyholders under age 65. Waiver of Premium Rider which waives premiums during disability with eligibility requiring proof of income and no existing disabilities. Eligibility is assessed at time of rider addition based on current health status and policy standing.',
                    outputDifferenceRationale:
                        'The actual output provides more granular eligibility criteria per rider compared to the expected output\'s summary format. All three rider types (Critical Illness, Accident Death Benefit, Waiver of Premium) are correctly listed with matching eligibility criteria. The actual output expands each rider with specific conditions (e.g., age limit of 65 for Accident Death Benefit, proof of income for Waiver of Premium) which are consistent with the expected general criteria.',
                    behaviourDifferenceRationale:
                        'Risk Mitigator was correctly invoked for this general underwriting question about rider availability and eligibility. Claims Analyst was appropriately excluded as no customer-specific data lookup was needed. The orchestrator correctly identified the query as a general policy knowledge question rather than a customer-specific data request. Routing decision fully matches expected behaviour.',
                    agentStepDetails: [
                        {
                            agent: 'Claims Manager',
                            agentActualInput:
                                'A customer wants to check if their policy is still active. The customer ID is CUST1001.',
                            agentExpectedOutput:
                                'Policy status request for CUST1001. Data retrieval only. Routing to Claims Analyst. Risk Mitigator not needed.',
                            agentActualOutput:
                                'Request received for customer CUST1001 to verify policy status. This is a simple data lookup. Routing to Claims Analyst only. Risk Mitigator is not required for status verification.',
                            agentExpectedGroundTruth:
                                'Orchestrator should identify as data lookup. Only Claims Analyst should be routed to. Risk Mitigator should be excluded.',
                            agentActualGroundTruth:
                                'The orchestrator correctly identified this as a data-only request. Routing decision was to call Claims Analyst only. Risk Mitigator was correctly excluded from the routing. ',
                        },
                        {
                            agent: 'Claims Analyst',
                            agentActualInput:
                                'A customer wants to check if their policy is still active. The customer ID is CUST1001.',
                            agentExpectedOutput:
                                'Policy status for CUST1001 is Active. Term Life policy with 500,000 USD coverage at 150 USD monthly. Issued January 2020 for 20 years.',
                            agentActualOutput:
                                'Policy lookup for customer CUST1001 completed. Status is Active. Policy type is Term Life. Coverage amount is 500,000 USD. Premium is 150 USD monthly. Issue date is January 15, 2020. Coverage duration is 20 years expiring in 2040.',
                            agentExpectedGroundTruth:
                                'Agent should be called for status lookup. Insurance Customers API should be called. Insurance Claims API should not be called. Output should be limited to status data.',
                            agentActualGroundTruth:
                                'The agent was called by the orchestrator for status lookup. The Insurance Customers API was called with customer ID CUST1001 and returned policy status and details. The Insurance Claims API was not called as claims data was not requested. Output limited to status information as appropriate for the request. ',
                        },
                        {
                            agent: 'Risk Mitigator',
                            agentActualInput:
                                'A customer wants to check if their policy is still active. The customer ID is CUST1001.',
                            agentExpectedOutput: 'Not called. Status check does not require Risk Mitigator.',
                            agentActualOutput:
                                'Not called. This request was a policy status check that did not require underwriting assessment. ',
                            agentExpectedGroundTruth: 'Risk Mitigator should not be called for simple status checks.',
                            agentActualGroundTruth:
                                'The Risk Mitigator was not called by the orchestrator. This is correct as policy status verification does not require underwriting evaluation or recommendations.',
                        },
                    ],
                },
                {
                    id: '11111111-6666-4666-8666-666666666666',
                    input: 'A customer wants a complete review of their policy including current status, claims history, risk assessment, and recommendations for improvements. The customer ID is CUST1045.',
                    status: TestStatus.Passed,
                    steps: ['Claims Manager', 'Claims Analyst', 'Risk Mitigator'],
                    groundTruth:
                        'Both agents should be called for comprehensive review. Claims Analyst called first for data. Risk Mitigator called second for assessment. Response should include data and recommendations.',
                    agentOutput:
                        'The orchestrator identified this as a comprehensive review requiring both agents. Claims Analyst was called first to retrieve policy and claims data. Risk Mitigator was then called to provide risk assessment and recommendations. Both agents called their respective APIs. Complete response consolidated from both agent outputs.',
                    actualGroundTruth:
                        'Context retrieved from Knowledge Base:\n- Policy ID: POL-8821\n- Coverage: Whole Life ($500k)\n- Customer: John Doe (CUST1001)\n- Health Profile: Diabetes, Smoker\n- Recent Claims: CLM9051 (Approved)\n- Knowledge Base Article: "Wellness Riders for Managed Chronic Conditions"',
                    groundTruthScore: 95,
                    score: 100,
                    tokens: 68420,
                    totalLatency: 22.5,
                    ragLatency: 3.2,
                    llmLatency: 19.3,
                    expectedOutput:
                        'Full review for CUST1045: Whole Life policy active with 250,000 USD coverage. Four claims totaling 26,000 USD approved. High risk due to chronic conditions and smoking. Conditional renewal with premium increase and exclusions recommended.',
                    actualOutput:
                        'Complete policy review for customer CUST1045 Maria Garcia: Current policy is Whole Life with 250,000 USD coverage at 320 USD monthly in active status. Claims history shows 4 claims with total approved amount of 26,000 USD. Risk assessment indicates high risk due to preexisting conditions Diabetes and Hypertension and lifestyle factor Smoker. Recommendations: Policy renewal is conditional with 15 percent premium increase. Diabetes and cardiac exclusions apply. No new riders recommended due to risk profile. Consider reducing coverage to lower premium burden. ',
                    outputDifferenceRationale:
                        'Both outputs cover the same core data points: Whole Life policy type, 250,000 USD coverage, 4 claims totaling 26,000 USD, high risk classification, and conditional renewal recommendation. The actual output enriches the response with the customer name (Maria Garcia), monthly premium (320 USD), specific preexisting conditions (Diabetes, Hypertension), and actionable recommendations (15% premium increase, specific exclusions, coverage reduction suggestion). Semantic alignment is strong with no contradictions.',
                    behaviourDifferenceRationale:
                        'Both agents were correctly called in the expected sequence — Claims Analyst first for policy and claims data retrieval, then Risk Mitigator for risk assessment and recommendations. The orchestrator correctly identified this as a comprehensive review requiring both agents. All expected API calls (Insurance Customers API and Insurance Claims API) were validated. The behaviour is fully aligned with expectations for multi-agent comprehensive review scenarios.',
                    agentStepDetails: [
                        {
                            agent: 'Claims Manager',
                            agentActualInput:
                                'A customer wants to check if their policy is still active. The customer ID is CUST1001.',
                            agentExpectedOutput:
                                'Policy status request for CUST1001. Data retrieval only. Routing to Claims Analyst. Risk Mitigator not needed.',
                            agentActualOutput:
                                'Request received for customer CUST1001 to verify policy status. This is a simple data lookup. Routing to Claims Analyst only. Risk Mitigator is not required for status verification.',
                            agentExpectedGroundTruth:
                                'Orchestrator should identify as data lookup. Only Claims Analyst should be routed to. Risk Mitigator should be excluded.',
                            agentActualGroundTruth:
                                'The orchestrator correctly identified this as a data-only request. Routing decision was to call Claims Analyst only. Risk Mitigator was correctly excluded from the routing. ',
                        },
                        {
                            agent: 'Claims Analyst',
                            agentActualInput:
                                'A customer wants to check if their policy is still active. The customer ID is CUST1001.',
                            agentExpectedOutput:
                                'Policy status for CUST1001 is Active. Term Life policy with 500,000 USD coverage at 150 USD monthly. Issued January 2020 for 20 years.',
                            agentActualOutput:
                                'Policy lookup for customer CUST1001 completed. Status is Active. Policy type is Term Life. Coverage amount is 500,000 USD. Premium is 150 USD monthly. Issue date is January 15, 2020. Coverage duration is 20 years expiring in 2040.',
                            agentExpectedGroundTruth:
                                'Agent should be called for status lookup. Insurance Customers API should be called. Insurance Claims API should not be called. Output should be limited to status data.',
                            agentActualGroundTruth:
                                'The agent was called by the orchestrator for status lookup. The Insurance Customers API was called with customer ID CUST1001 and returned policy status and details. The Insurance Claims API was not called as claims data was not requested. Output limited to status information as appropriate for the request. ',
                        },
                        {
                            agent: 'Risk Mitigator',
                            agentActualInput:
                                'A customer wants to check if their policy is still active. The customer ID is CUST1001.',
                            agentExpectedOutput: 'Not called. Status check does not require Risk Mitigator.',
                            agentActualOutput:
                                'Not called. This request was a policy status check that did not require underwriting assessment. ',
                            agentExpectedGroundTruth: 'Risk Mitigator should not be called for simple status checks.',
                            agentActualGroundTruth:
                                'The Risk Mitigator was not called by the orchestrator. This is correct as policy status verification does not require underwriting evaluation or recommendations.',
                        },
                    ],
                },
                {
                    id: '11111111-6666-4666-8666-666666666666',
                    input: 'What are your business hours for customer support?',
                    status: TestStatus.Passed,
                    steps: ['Claims Manager', 'Claims Analyst', 'Risk Mitigator'],
                    groundTruth:
                        'The orchestrator identified this as a general FAQ question not requiring any agent. Neither Claims Analyst nor Risk Mitigator was called. The orchestrator responded directly with standard business information. No customer data or underwriting assessment was needed.',
                    agentOutput:
                        'No agents should be called for FAQ questions. Orchestrator should respond directly with standard information.',
                    score: 100,
                    tokens: 8520,
                    totalLatency: 2.1,
                    ragLatency: 0.3,
                    llmLatency: 1.8,
                    expectedOutput:
                        'Customer support hours are Monday to Friday 8 AM to 8 PM and Saturday 9 AM to 5 PM. Emergency line available 24/7 for urgent matters.',
                    actualOutput:
                        'Our customer support is available Monday through Friday from 8 AM to 8 PM and Saturday from 9 AM to 5 PM. You can reach us by phone, email, or live chat during these hours. For urgent policy matters outside business hours, our emergency line is available 24/7.',
                    outputDifferenceRationale:
                        'Both outputs provide the same core information: Monday-Friday 8 AM to 8 PM, Saturday 9 AM to 5 PM, and 24/7 emergency line availability. The actual output adds contact method details (phone, email, live chat) which are supplementary but not contradictory to the expected output. Minor phrasing differences ("Monday to Friday" vs "Monday through Friday") are stylistic and do not affect semantic accuracy.',
                    behaviourDifferenceRationale:
                        'The orchestrator correctly handled this as a general FAQ query without invoking any agent. Neither Claims Analyst nor Risk Mitigator was called, as no customer-specific data or underwriting assessment was needed. The direct response with standard business information matches the expected behaviour exactly. No unnecessary agent calls were made.',
                    agentStepDetails: [
                        {
                            agent: 'Claims Manager',
                            agentActualInput:
                                'A customer wants to check if their policy is still active. The customer ID is CUST1001.',
                            agentExpectedOutput:
                                'Policy status request for CUST1001. Data retrieval only. Routing to Claims Analyst. Risk Mitigator not needed.',
                            agentActualOutput:
                                'Request received for customer CUST1001 to verify policy status. This is a simple data lookup. Routing to Claims Analyst only. Risk Mitigator is not required for status verification.',
                            agentExpectedGroundTruth:
                                'Orchestrator should identify as data lookup. Only Claims Analyst should be routed to. Risk Mitigator should be excluded.',
                            agentActualGroundTruth:
                                'The orchestrator correctly identified this as a data-only request. Routing decision was to call Claims Analyst only. Risk Mitigator was correctly excluded from the routing. ',
                        },
                        {
                            agent: 'Claims Analyst',
                            agentActualInput:
                                'A customer wants to check if their policy is still active. The customer ID is CUST1001.',
                            agentExpectedOutput:
                                'Policy status for CUST1001 is Active. Term Life policy with 500,000 USD coverage at 150 USD monthly. Issued January 2020 for 20 years.',
                            agentActualOutput:
                                'Policy lookup for customer CUST1001 completed. Status is Active. Policy type is Term Life. Coverage amount is 500,000 USD. Premium is 150 USD monthly. Issue date is January 15, 2020. Coverage duration is 20 years expiring in 2040.',
                            agentExpectedGroundTruth:
                                'Agent should be called for status lookup. Insurance Customers API should be called. Insurance Claims API should not be called. Output should be limited to status data.',
                            agentActualGroundTruth:
                                'The agent was called by the orchestrator for status lookup. The Insurance Customers API was called with customer ID CUST1001 and returned policy status and details. The Insurance Claims API was not called as claims data was not requested. Output limited to status information as appropriate for the request. ',
                        },
                        {
                            agent: 'Risk Mitigator',
                            agentActualInput:
                                'A customer wants to check if their policy is still active. The customer ID is CUST1001.',
                            agentExpectedOutput: 'Not called. Status check does not require Risk Mitigator.',
                            agentActualOutput:
                                'Not called. This request was a policy status check that did not require underwriting assessment. ',
                            agentExpectedGroundTruth: 'Risk Mitigator should not be called for simple status checks.',
                            agentActualGroundTruth:
                                'The Risk Mitigator was not called by the orchestrator. This is correct as policy status verification does not require underwriting evaluation or recommendations.',
                        },
                    ],
                },
                {
                    id: '11111111-6666-4666-8666-666666666666',
                    input: 'A customer wants to see all their past claims and the status of each. The customer ID is CUST1078. They do not need any recommendations, just the claims history.',
                    status: TestStatus.Passed,
                    steps: ['Claims Manager', 'Claims Analyst', 'Risk Mitigator'],
                    groundTruth:
                        'The orchestrator identified this as a claims data request only. Claims Analyst was called to retrieve claims history. Risk Mitigator was not called as no recommendations or assessment were requested. Response provided claims data without underwriting analysis.',
                    agentOutput:
                        'Only Claims Analyst should be called for claims lookup. Risk Mitigator should not be called. Response should contain claims data only.',
                    score: 100,
                    tokens: 35680,
                    totalLatency: 10.4,
                    ragLatency: 1.5,
                    llmLatency: 8.9,
                    expectedOutput:
                        'Claims history for CUST1078: Two claims on record. CLM8001 for surgery at 8,500 USD approved. CLM8002 for diagnostics at 2,200 USD approved. All claims fully approved.',
                    actualOutput:
                        'Claims history for customer CUST1078 Robert Chen: You have 2 claims on record. Claim CLM8001 was filed on February 15, 2023 for outpatient surgery with claimed amount of 8,500 USD and approved amount of 8,500 USD with status Approved. Claim CLM8002 was filed on November 3, 2023 for diagnostic tests with claimed amount of 2,200 USD and approved amount of 2,200 USD with status Approved. Both claims were fully approved with no deductions.',
                    outputDifferenceRationale:
                        'Both outputs list the same 2 claims (CLM8001 for surgery at 8,500 USD, CLM8002 for diagnostics at 2,200 USD) with matching approval statuses. The actual output enriches the response with the customer name (Robert Chen), filing dates (February 15, 2023 and November 3, 2023), and confirms no deductions were applied. These additions provide supplementary context without any semantic divergence from the expected output.',
                    behaviourDifferenceRationale:
                        'Claims Analyst was correctly invoked for claims data retrieval using the Insurance Claims API. Risk Mitigator was appropriately excluded as the customer explicitly requested claims history only without recommendations. The orchestrator correctly limited the scope to data retrieval, matching the expected behaviour of routing only to Claims Analyst for claims lookup queries.',
                    agentStepDetails: [
                        {
                            agent: 'Claims Manager',
                            agentActualInput:
                                'A customer wants to check if their policy is still active. The customer ID is CUST1001.',
                            agentExpectedOutput:
                                'Policy status request for CUST1001. Data retrieval only. Routing to Claims Analyst. Risk Mitigator not needed.',
                            agentActualOutput:
                                'Request received for customer CUST1001 to verify policy status. This is a simple data lookup. Routing to Claims Analyst only. Risk Mitigator is not required for status verification.',
                            agentExpectedGroundTruth:
                                'Orchestrator should identify as data lookup. Only Claims Analyst should be routed to. Risk Mitigator should be excluded.',
                            agentActualGroundTruth:
                                'The orchestrator correctly identified this as a data-only request. Routing decision was to call Claims Analyst only. Risk Mitigator was correctly excluded from the routing. ',
                        },
                        {
                            agent: 'Claims Analyst',
                            agentActualInput:
                                'A customer wants to check if their policy is still active. The customer ID is CUST1001.',
                            agentExpectedOutput:
                                'Policy status for CUST1001 is Active. Term Life policy with 500,000 USD coverage at 150 USD monthly. Issued January 2020 for 20 years.',
                            agentActualOutput:
                                'Policy lookup for customer CUST1001 completed. Status is Active. Policy type is Term Life. Coverage amount is 500,000 USD. Premium is 150 USD monthly. Issue date is January 15, 2020. Coverage duration is 20 years expiring in 2040.',
                            agentExpectedGroundTruth:
                                'Agent should be called for status lookup. Insurance Customers API should be called. Insurance Claims API should not be called. Output should be limited to status data.',
                            agentActualGroundTruth:
                                'The agent was called by the orchestrator for status lookup. The Insurance Customers API was called with customer ID CUST1001 and returned policy status and details. The Insurance Claims API was not called as claims data was not requested. Output limited to status information as appropriate for the request. ',
                        },
                        {
                            agent: 'Risk Mitigator',
                            agentActualInput:
                                'A customer wants to check if their policy is still active. The customer ID is CUST1001.',
                            agentExpectedOutput: 'Not called. Status check does not require Risk Mitigator.',
                            agentActualOutput:
                                'Not called. This request was a policy status check that did not require underwriting assessment. ',
                            agentExpectedGroundTruth: 'Risk Mitigator should not be called for simple status checks.',
                            agentActualGroundTruth:
                                'The Risk Mitigator was not called by the orchestrator. This is correct as policy status verification does not require underwriting evaluation or recommendations.',
                        },
                    ],
                },
                {
                    id: '11111111-6666-4666-8666-666666666666',
                    input: 'A customer wants to know what riders they should add to their policy based on their profile. The customer ID is CUST1092. They only want rider recommendations, not a full policy review.',
                    status: TestStatus.Passed,
                    steps: ['Claims Manager', 'Claims Analyst', 'Risk Mitigator'],
                    groundTruth: 'Profile saved with avatar URL and 200 OK',
                    agentOutput: 'Profile updated with avatar URL',
                    score: 100,
                    tokens: 28950,
                    totalLatency: 9.2,
                    ragLatency: 1.2,
                    llmLatency: 8.0,
                    expectedOutput: '',
                    actualOutput: '',
                    outputDifferenceRationale:
                        'Both the expected and actual outputs are empty for this test case. The test validates routing behaviour rather than output content. No output difference to evaluate.',
                    behaviourDifferenceRationale:
                        'The orchestrator correctly identified that rider recommendations require both customer-specific data (from Claims Analyst) and underwriting assessment (from Risk Mitigator). Both agents were called in the expected sequence. The behaviour matches the expected routing pattern for personalized rider recommendation queries.',
                },
            ],
        },
    },

    {
        id: '22222222-1111-4222-9222-777777777777',
        name: 'Payment Regression Test',
        description: 'Covers full payment flow regression scenarios.',
        testId: 'f2c7d0d9-0c3d-43a0-91fc-82a2cfcd9da1',
        passedCount: 1,
        failedCount: 1,
        executionDuration: '00:20',
        createdAt: '2025-12-09T14:30:00.000Z',
        datasets: [
            {
                id: '22222222-2222-4222-9222-888888888888',
                input:{message: 'Charge card with valid payment method'},
                expectedOutput: 'Payment success + order marked paid',
                expectedBehaviour: 'Payment success + order marked paid',
            },
            {
                id: '22222222-3333-4333-9333-999999999999',
                input:{message: 'Attempt charge with expired card'},
                expectedOutput: 'Payment declined with specific error code',
                expectedBehaviour: 'Payment declined with specific error code',
            },
        ],
        report: {
            id: '22222222-4444-4444-9444-aaaaaaaaaaaa',
            summary: `The Payment Regression Test ran with mixed results. The valid payment method scenario passed, authorizing the payment and marking the order as paid. However, the expired card scenario failed, returning a generic error instead of the expected decline code. Overall, the workflow is mostly stable but requires attention to error handling for invalid payment instruments.`,
            resultCount: {
                total: 2,
                passed: 1,
                failed: 1,
            },
            score: 50,
            inputReport: [
                {
                    id: '22222222-5555-4555-9555-bbbbbbbbbbbb',
                    input: 'Charge card with valid payment method',
                    status: TestStatus.Passed,
                    steps: [
                        'Supervisor Agent Analysis',
                        'Validate Payment Instrument',
                        'Authorize Payment',
                        'Mark Order Paid',
                    ],
                    groundTruth: 'Payment success + order marked paid',
                    actualGroundTruth:
                        'Context:\n- Payment Gateway: Stripe\n- Transaction ID: txn_12345\n- Status: Authorized',
                    groundTruthScore: 100,
                    tokens: 31490,
                    totalLatency: 5.4,
                    ragLatency: 1.2,
                    llmLatency: 4.2,
                    safetyStatus: TestExecutionSafetyStatus.PASSED,
                    aiInsights:
                        'Perfect match. The agent correctly extracted the transaction ID and marked the order as paid. Cost efficiency is optimal ($0.0015).',
                    agentOutput: 'Authorization succeeded — order marked paid',
                    score: 100,
                    outputDifferenceRationale:
                        'The actual output matches the expected outcome: payment was successfully authorized via the Stripe gateway (transaction ID txn_12345) and the order was marked as paid. No output divergence detected. The payment flow completed all steps correctly.',
                    behaviourDifferenceRationale:
                        'The workflow executed all expected steps in the correct sequence: Validate Payment Instrument → Authorize Payment → Mark Order Paid. The Stripe gateway integration functioned correctly, the transaction was authorized, and the order status was updated. Behaviour is fully aligned with the expected payment success flow.',
                },
                {
                    id: '22222222-6666-4666-9666-cccccccccccc',
                    input: 'Attempt charge with expired card',
                    status: TestStatus.Failed,
                    steps: [
                        'Supervisor Agent Analysis',
                        'Validate Payment Instrument',
                        'Attempt Authorization',
                        'Return Decline Response',
                    ],
                    groundTruth: 'Payment declined with specific error code',
                    actualGroundTruth:
                        'Context:\n- Payment Gateway: Stripe\n- Error: Card Expired (code: exp_01)\n- Retry Policy: Allowed',
                    groundTruthScore: 92,
                    tokens: 89357,
                    totalLatency: 6.1,
                    ragLatency: 1.5,
                    llmLatency: 4.6,
                    safetyStatus:TestExecutionSafetyStatus.WARNING,
                    aiInsights:
                        'The agent failed to capture the specific error code "exp_01". It generalized the error, which reduces debuggability. Ground truth score (92%) reflects correct context retrieval but poor output specificity.',
                    agentOutput: 'Generic error returned (missing specific decline code)',
                    score: 0,
                    outputDifferenceRationale:
                        'Critical output divergence. The expected output requires the specific Stripe decline error code "exp_01" to be surfaced in the response. The actual output returned a generic "payment declined" message without the specific error code. The Stripe gateway correctly detected the expired card and returned the error code, but the agent failed to extract and propagate it to the final response. This reduces debuggability and violates the specificity requirement for payment error handling.',
                    behaviourDifferenceRationale:
                        'The workflow followed the expected step sequence (Validate Payment Instrument → Attempt Authorization → Return Decline Response), but the error handling step failed to extract the specific decline code from the Stripe gateway response. While the context retrieval correctly identified the error (Card Expired, code: exp_01, retry allowed), the agent generalized the error in its output instead of preserving the specific code. The routing was correct, but the error propagation behaviour did not meet the expected standard of returning precise error codes for payment failures.',
                },
            ],
        },
    },

    {
        id: '33333333-1111-4333-1333-dddddddddddd',
        name: 'Inventory Sanity Test',
        description: 'Quick checks on inventory synchronization.',
        testId: '7f530d71-6dbc-4b5c-b3c1-fc6f6b469453',
        passedCount: 0,
        failedCount: 2,
        executionDuration: '00:07',
        createdAt: '2025-12-08T09:15:00.000Z',
        datasets: [
            {
                id: '33333333-2222-4222-2333-eeeeeeeeeeee',
                input:{message: 'Sync product stock levels from upstream'},
                expectedOutput: 'Stock levels updated and conflict resolved',
                expectedBehaviour: 'Stock levels updated and conflict resolved',
            },
            {
                id: '33333333-3333-4333-3333-ffffffffffff',
                input:{message: 'Reconcile inventory after partial failure'},
                expectedOutput: 'Reconciliation report generated with corrections',
                expectedBehaviour: 'Reconciliation report generated with corrections',
            },
        ],
        report: {
            id: '33333333-4444-4444-3444-111111111111',
            summary: `The Inventory Sanity Test failed both test scenarios. Synchronization of product stock levels from upstream applied only partial updates, leaving conflicts unresolved. The reconciliation process did not produce the expected corrections, indicating that the workflow requires improvements in failure handling and reconciliation logic. Immediate review of the inventory sync and reconciliation steps is recommended.`,
            resultCount: {
                total: 2,
                passed: 0,
                failed: 2,
            },
            score: 0,
            inputReport: [
                {
                    id: '33333333-5555-4555-3555-222222222222',
                    input: 'Sync product stock levels from upstream',
                    status: TestStatus.Failed,
                    steps: [
                        'Supervisor Agent Analysis',
                        'Fetch Upstream Inventory',
                        'Apply Deltas',
                        'Publish Sync Results',
                    ],
                    groundTruth: 'Stock levels updated and conflict resolved',
                    actualGroundTruth:
                        'Context:\n- Upstream Source: ERP System\n- Delta: 50 items\n- Conflict Mode: Overwrite',
                    groundTruthScore: 45,
                    agentOutput: 'Partial update applied; conflict left unresolved',
                    score: 0,
                    tokens: 22340,
                    totalLatency: 4.8,
                    ragLatency: 0.9,
                    llmLatency: 3.9,
                    outputDifferenceRationale:
                        'The expected output requires complete stock level updates with all conflicts resolved. The actual output indicates only a partial update was applied — the delta of 50 items from the ERP upstream source was only partially synchronized, and conflicting inventory entries were left unresolved. The configured Overwrite conflict mode was not triggered for items with pre-existing local modifications, resulting in an incomplete sync state.',
                    behaviourDifferenceRationale:
                        'The sync workflow partially executed but failed at the conflict resolution stage. The expected behaviour was to fetch upstream inventory, apply all deltas, resolve conflicts using the configured Overwrite mode, and publish complete sync results. The actual execution fetched upstream data and applied non-conflicting deltas correctly, but skipped conflict resolution for items with pre-existing local modifications. The Apply Deltas step did not invoke the conflict handler, indicating a gap in the sync logic for contested inventory entries.',
                },
                {
                    id: '33333333-6666-4666-3666-333333333333',
                    input: 'Reconcile inventory after partial failure',
                    status: TestStatus.Failed,
                    steps: [
                        'Supervisor Agent Analysis',
                        'Aggregate Failure Logs',
                        'Apply Reconciliation Rules',
                        'Emit Correction Events',
                    ],
                    groundTruth: 'Reconciliation report generated with corrections',
                    agentOutput: 'No reconciliation produced — missing correction rules',
                    score: 0,
                    tokens: 18560,
                    totalLatency: 3.2,
                    ragLatency: 0.6,
                    llmLatency: 2.6,
                    outputDifferenceRationale:
                        'The expected output requires a reconciliation report with specific corrections applied to inventory discrepancies. The actual output produced no reconciliation report and no correction events were emitted. The correction rules engine failed to activate, meaning no adjustments were generated for the inventory inconsistencies identified in the failure logs. The workflow terminated without producing any actionable output.',
                    behaviourDifferenceRationale:
                        'The reconciliation workflow was expected to: (1) aggregate failure logs, (2) apply correction rules to identified discrepancies, and (3) emit correction events. The actual execution completed step 1 (log aggregation) successfully but failed at step 2 — the correction rules engine did not activate, suggesting the rules configuration is missing or misconfigured for the current inventory domain. As a result, step 3 (emit correction events) was never reached. The root cause appears to be a configuration gap in the reconciliation rules engine.',
                },
            ],
        },
    },
];

export const mockTestExecutionHistories: ITestExecutionHistory[] = baseExecutionHistories;

