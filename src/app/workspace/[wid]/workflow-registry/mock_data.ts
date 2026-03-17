export const validate_mock_data = [
    {
        "id": "agent-agent_node-node-e8ae8637-fcf6-4827-8fb1-ccb1674cfe16",
        "label": "Conjur math",
        "differences": 0,
        "missing": 0,
        "comparison": {
            "currentVersion": "1.0.0",
            "previousVersion": "1.0.0",
            "sectionData": [
                {
                    "title": "Agent Info",
                    "items": [
                        {
                            "label": "Name",
                            "current": "c55njur_math",
                            "previous": "c55onjur_math",
                            "status": "match",
                            "field": "name",
                            "globalId": "agent-agent_node-node-e8ae8637-fcf6-4827-8fb1-ccb1674cfe16"
                        },
                        {
                            "label": "Description",
                            "current": "conjur-test",
                            "previous": "conjur-test",
                            "status": "match",
                            "field": "description",
                            "globalId": "agent-agent_node-node-e8ae8637-fcf6-4827-8fb1-ccb1674cfe16"
                        }
                    ]
                },
                {
                    "title": "Prompt",
                    "items": [
                        {
                            "label": "Name",
                            "current": "conjur_math Template",
                            "previous": "conjur_math Template",
                            "status": "match",
                            "field": "name",
                            "globalId": "template-agent_node-node-e8ae8637-fcf6-4827-8fb1-ccb1674cfe16"
                        },
                        {
                            "label": "Template",
                            "current": "Action: You are a patient, thorough high school math tutor. When a student gives you a problem, break down the solution into clear, logical steps. Explain the 'why' behind each step using simple language.  \nPurpose: This approach ensures the student understands the process and the reasoning behind each mathematical operation.  \nExpectation: For example, if the problem is solving for x, explain which algebraic rule you're using (e.g., 'Now, we subtract 5 from both sides to isolate the x term'). End your response by boxing the final answer and asking if they'd like to try a similar problem for practice.",
                            "previous": "Action: You are a patient, thorough high school math tutor. When a student gives you a problem, break down the solution into clear, logical steps. Explain the 'why' behind each step using simple language.  \nPurpose: This approach ensures the student understands the process and the reasoning behind each mathematical operation.  \nExpectation: For example, if the problem is solving for x, explain which algebraic rule you're using (e.g., 'Now, we subtract 5 from both sides to isolate the x term'). End your response by boxing the final answer and asking if they'd like to try a similar problem for practice.",
                            "status": "match",
                            "field": "template",
                            "globalId": "template-agent_node-node-e8ae8637-fcf6-4827-8fb1-ccb1674cfe16"
                        }
                    ]
                },
                {
                    "title": "Intelligence Source",
                    "items": [
                        {
                            "label": "Name",
                            "current": "gpt-4o-mini",
                            "previous": "gpt-4o-mini",
                            "status": "match",
                            "field": "name",
                            "globalId": "intelligence-agent_node-node-e8ae8637-fcf6-4827-8fb1-ccb1674cfe16-gpt-4o-mini"
                        },
                        {
                            "label": "Model",
                            "current": "gpt-4o-mini",
                            "previous": "gpt-4o-mini",
                            "status": "match",
                            "field": "model",
                            "globalId": "intelligence-agent_node-node-e8ae8637-fcf6-4827-8fb1-ccb1674cfe16-gpt-4o-mini"
                        },
                        {
                            "label": "Temperature",
                            "current": "0.5",
                            "previous": "0.5",
                            "status": "match",
                            "field": "temperature",
                            "globalId": "intelligence-agent_node-node-e8ae8637-fcf6-4827-8fb1-ccb1674cfe16-gpt-4o-mini"
                        }
                    ]
                }
            ],
            "currentPublishGraph": {
                "nodes": [],
                "edges": []
            },
            "incomingPublishGraph": {
                "nodes": [],
                "edges": []
            },
            "comparisonOutput": "### Changes Identified\n- **Agent Info**: The agent name was slightly modified from `c55onjur_math` to `c55njur_math`.\n- **Intelligence Source**: No changes detected.\n- **Prompt**: No changes detected."
        }
    }
];

export const mock_artifacts = [
    {
        workflowId: "wf-001",
        workflowName: "Customer Support Bot",
        artifactName: "customer-support-v2",
        artifactUrl: "https://mock.registry/customer-support-v2",
        artifactPath: "org/workflows/customer-support",
        workflowMetadata: []
    },
    {
        workflowId: "wf-002",
        workflowName: "Sales Lead Qualifier",
        artifactName: "sales-qualifier-v1",
        artifactUrl: "https://mock.registry/sales-qualifier-v1",
        artifactPath: "org/workflows/sales-qualifier",
        workflowMetadata: []
    },
    {
        workflowId: "wf-003",
        workflowName: "HR Assistant",
        artifactName: "hr-assistant-v1",
        artifactUrl: "https://mock.registry/hr-assistant-v1",
        artifactPath: "org/workflows/hr-assistant",
        workflowMetadata: []
    }
];

export const mock_artifact_versions = {
    "org/workflows/customer-support": {
        versions: [
            { version: "1.2.0", createdAt: "2024-03-15T10:00:00Z", uri: "v1.2.0-uri" },
            { version: "1.1.0", createdAt: "2024-03-10T10:00:00Z", uri: "v1.1.0-uri" },
            { version: "1.0.0", createdAt: "2024-03-01T10:00:00Z", uri: "v1.0.0-uri" }
        ]
    },
    "org/workflows/sales-qualifier": {
        versions: [
            { version: "1.0.0", createdAt: "2024-03-05T10:00:00Z", uri: "v1.0.0-uri" }
        ]
    }
};

export const mock_configurations = [
    {
        id: "config-1",
        name: "Customer Support Agent",
        type: "agent",
        fields: [
            {
                name: "prompt",
                meta: {
                    currentValue: "You are a helpful assistant.",
                    incomingValue: "You are a helpful assistant and customer support expert.",
                    finalValue: "You are a helpful assistant and customer support expert."
                }
            },
            {
                name: "temperature",
                meta: {
                    currentValue: "0.7",
                    incomingValue: "0.5",
                    finalValue: "0.5"
                }
            }
        ],
        reference: "agent-ref-1"
    },
    {
        id: "config-2",
        name: "Sales Qualifier Agent",
        type: "agent",
        fields: [
            {
                name: "prompt",
                meta: {
                    currentValue: "Qualify the leads based on criteria.",
                    incomingValue: "Qualify the leads based on new B2B criteria.",
                    finalValue: "Qualify the leads based on new B2B criteria."
                }
            },
            {
                name: "model",
                meta: {
                    currentValue: "gpt-4",
                    incomingValue: "gpt-4o",
                    finalValue: "gpt-4o"
                }
            }
        ],
        reference: "agent-ref-2"
    },
    {
        id: "config-3",
        name: "HR Assistant Agent",
        type: "agent",
        fields: [
            {
                name: "prompt",
                meta: {
                    currentValue: "Answer employee queries.",
                    incomingValue: "Answer employee queries politely and accurately.",
                    finalValue: "Answer employee queries politely and accurately."
                }
            }
        ],
        reference: "agent-ref-3"
    }
];

export const mock_release_notes: Record<string, Record<string, string>> = {
    "org/workflows/customer-support": {
        "1.2.0": "### Release Notes 1.2.0\n- Enhanced customer support logic.\n- Improved response times for common queries.\n- Fixed minor UI bugs in the chat interface.",
        "1.1.0": "### Release Notes 1.1.0\n- Initial release of the customer support bot.\n- Support for basic Q&A.",
        "1.0.0": "### Release Notes 1.0.0\n- Initial beta release."
    },
    "org/workflows/sales-qualifier": {
        "1.0.0": "### Release Notes 1.0.0\n- Initial release of the sales lead qualifier agent.\n- Integration with B2B lead generation criteria."
    },
    "org/workflows/hr-assistant": {
        "1.0.0": "### Release Notes 1.0.0\n- Initial release of the HR assistant bot.\n- Capabilities include answering employee benefit questions."
    }
};