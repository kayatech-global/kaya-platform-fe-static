/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateNodeId } from '@/app/editor/[wid]/[workflow_id]/components/editor-playground';
import { CustomNodeProps } from '@/components';
import { CustomNodeTypes } from '@/enums';

export interface NodeListTypeDef {
    category: string;
    icon: string;
    nodes: CustomNodeProps[];
}

export const singleAgentTemplate = {
    nodes: [
        {
            id: 'start_node-node-2',
            type: 'start_node',
            position: {
                x: 195,
                y: 280,
            },
            data: {
                label: 'Start',
            },
            measured: {
                width: 88,
                height: 88,
            },
        },
        {
            id: 'agent_node-node-2',
            type: 'agent_node',
            position: {
                x: 475,
                y: 280,
            },
            data: {
                label: 'Agent',
            },
            measured: {
                width: 88,
                height: 88,
            },
            selected: false,
            dragging: false,
        },
        {
            id: 'end_node-node-2',
            type: 'end_node',
            position: {
                x: 765,
                y: 280,
            },
            data: {
                label: 'End',
            },
            measured: {
                width: 88,
                height: 88,
            },
            selected: true,
            dragging: false,
        },
    ],
    edges: [
        {
            id: 'e1-2',
            source: '1',
            target: '',
            animated: true,
            type: 'smoothstep',
        },
        {
            source: 'start_node-node-2',
            target: 'agent_node-node-2',
            animated: true,
            type: 'smoothstep',
            id: 'xy-edge__start_node-node-2-agent_node-node-2',
        },
        {
            source: 'agent_node-node-2',
            target: 'end_node-node-2',
            animated: true,
            type: 'smoothstep',
            id: 'xy-edge__agent_node-node-2-end_node-node-2',
        },
    ],
};

export const sequentialAgentTemplate = {
    nodes: [
        {
            id: 'start_node-node-1',
            type: 'start_node',
            position: {
                x: 85.1449699480249,
                y: 162.4166228356292,
            },
            data: {
                label: 'Start',
            },
            measured: {
                width: 88,
                height: 88,
            },
        },
        {
            id: 'end_node-node-2',
            type: 'end_node',
            position: {
                x: 591.1464017462476,
                y: 161.93486603843422,
            },
            data: {
                label: 'End',
            },
            measured: {
                width: 88,
                height: 88,
            },
            selected: false,
            dragging: false,
        },
        {
            id: 'agent_node-node-1',
            type: 'agent_node',
            position: {
                x: 259.6777596568025,
                y: 162.19123827554736,
            },
            data: {
                label: 'Agent',
            },
            measured: {
                width: 88,
                height: 88,
            },
            selected: false,
            dragging: false,
        },
        {
            id: 'agent_node-node-2',
            type: 'agent_node',
            position: {
                x: 424.3161455781471,
                y: 161.48409691827055,
            },
            data: {
                label: 'Agent',
            },
            measured: {
                width: 88,
                height: 88,
            },
            selected: true,
            dragging: false,
        },
    ],
    edges: [
        {
            id: 'e1-2',
            source: '1',
            target: '',
            animated: true,
            type: 'smoothstep',
        },
        {
            source: 'start_node-node-1',
            target: 'agent_node-node-1',
            animated: true,
            type: 'smoothstep',
            id: 'xy-edge__start_node-node-1-agent_node-node-1',
        },
        {
            source: 'agent_node-node-1',
            target: 'agent_node-node-2',
            animated: true,
            type: 'smoothstep',
            id: 'xy-edge__agent_node-node-1-agent_node-node-2',
        },
        {
            source: 'agent_node-node-2',
            target: 'end_node-node-2',
            animated: true,
            type: 'smoothstep',
            id: 'xy-edge__agent_node-node-2-end_node-node-2',
        },
    ],
};

export const supervisorAgentTemplate = {
    nodes: [
        {
            id: 'agent_node-node-1',
            type: CustomNodeTypes.decisionNode,
            position: {
                x: 293.18157483263434,
                y: -121.36968371498452,
            },
            data: {
                label: 'Agent',
                overrideType: CustomNodeTypes.supervisorAgentTemplate,
            },
            measured: {
                width: 88,
                height: 88,
            },
            selected: false,
            dragging: false,
        },
        {
            id: 'agent_node-node-2',
            type: 'agent_node',
            position: {
                x: 181.75783439792204,
                y: 200.26585568418503,
            },
            data: {
                label: 'Agent',
            },
            measured: {
                width: 88,
                height: 88,
            },
            selected: false,
            dragging: false,
        },
        {
            id: 'agent_node-node-3',
            type: 'agent_node',
            position: {
                x: 503.39337379709156,
                y: 195.6710622641969,
            },
            data: {
                label: 'Agent',
            },
            measured: {
                width: 88,
                height: 88,
            },
            selected: false,
            dragging: false,
        },
        {
            id: 'start_node-node-1',
            type: 'start_node',
            position: {
                x: 19.791366343340215,
                y: -120.22098535998745,
            },
            data: {
                label: 'Start',
            },
            measured: {
                width: 88,
                height: 88,
            },
            selected: false,
            dragging: false,
        },
        {
            id: 'end_node-node-1',
            type: 'end_node',
            position: {
                x: 606.7762257468247,
                y: -120.22098535998745,
            },
            data: {
                label: 'End',
            },
            measured: {
                width: 88,
                height: 88,
            },
            selected: false,
            dragging: false,
        },
    ],
    edges: [
        {
            id: 'e1-2',
            source: '1',
            target: '',
            animated: true,
            type: 'smoothstep',
        },
        {
            source: 'agent_node-node-1',
            target: 'agent_node-node-2',
            animated: true,
            type: 'straight',
            id: 'xy-edge__agent_node-node-1-agent_node-node-2',
        },
        {
            source: 'agent_node-node-2',
            target: 'agent_node-node-1',
            animated: true,
            type: 'straight',
            id: 'xy-edge__agent_node-node-2-agent_node-node-1',
        },
        {
            source: 'agent_node-node-1',
            target: 'agent_node-node-3',
            animated: true,
            type: 'straight',
            id: 'xy-edge__agent_node-node-1-agent_node-node-3',
        },
        {
            source: 'agent_node-node-3',
            target: 'agent_node-node-1',
            animated: true,
            type: 'straight',
            id: 'xy-edge__agent_node-node-3-agent_node-node-1',
        },
        {
            source: 'start_node-node-1',
            target: 'agent_node-node-1',
            animated: true,
            type: 'straight',
            id: 'xy-edge__start_node-node-1-agent_node-node-1',
        },
        {
            source: 'agent_node-node-1',
            target: 'end_node-node-1',
            animated: true,
            type: 'straight',
            id: 'xy-edge__agent_node-node-1-end_node-node-1',
        },
    ],
};

export const planExecuteTemplate = {
    nodes: [
        {
            id: 'start_node-node-2',
            type: 'start_node',
            position: {
                x: 82.7,
                y: 177.22,
            },
            data: {
                label: 'Start',
            },
            measured: {
                width: 88,
                height: 88,
            },
        },
        {
            id: 'end_node-node-2',
            type: 'end_node',
            position: {
                x: 737.9,
                y: 176.15,
            },
            data: {
                label: 'End',
            },
            measured: {
                width: 88,
                height: 88,
            },
        },
        {
            id: 'agent_node-node-1',
            type: 'agent_node',
            position: {
                x: 511.06,
                y: 176.42,
            },
            data: {
                label: 'Executer Agent',
                overrideType: CustomNodeTypes.executionNode,
            },
            measured: {
                width: 88,
                height: 114,
            },
        },
        {
            id: 'planner_node-node-1',
            type: 'planner_node',
            position: {
                x: 292.26,
                y: 177,
            },
            data: {
                label: 'Planner Agent',
            },
            measured: {
                width: 88,
                height: 114,
            },
        },
        {
            id: 'replanner_node-node-1',
            type: 'replanner_node',
            position: {
                x: 514.32,
                y: 373.49,
            },
            data: {
                label: 'Replanner Agent',
            },
            measured: {
                width: 97,
                height: 114,
            },
        },
    ],
    edges: [
        {
            id: 'e1-2',
            source: '1',
            target: '',
            animated: true,
            type: 'smoothstep',
        },
        {
            source: 'agent_node-node-1',
            target: 'replanner_node-node-1',
            animated: true,
            type: 'straight',
            id: 'xy-edge__agent_node-node-1-replanner_node-node-1',
        },
        {
            source: 'replanner_node-node-1',
            target: 'agent_node-node-1',
            animated: true,
            type: 'straight',
            id: 'xy-edge__replanner_node-node-1-agent_node-node-1',
        },
        {
            source: 'agent_node-node-1',
            target: 'end_node-node-2',
            animated: true,
            type: 'straight',
            id: 'xy-edge__agent_node-node-1-end_node-node-2',
        },
        {
            source: 'start_node-node-2',
            target: 'planner_node-node-1',
            animated: true,
            type: 'straight',
            id: 'xy-edge__start_node-node-2-planner_node-node-1',
        },
        {
            source: 'planner_node-node-1',
            target: 'agent_node-node-1',
            animated: true,
            type: 'straight',
            id: 'xy-edge__planner_node-node-1-agent_node-node-1',
        },
    ],
};

export const voiceAgentTemplate = {
    nodes: [
        {
            id: 'start_node-node-2',
            type: 'start_node',
            position: {
                x: 195,
                y: 280,
            },
            data: {
                label: 'Start',
            },
            measured: {
                width: 88,
                height: 88,
            },
        },
        {
            id: 'agent_node-node-2',
            type: CustomNodeTypes.voiceNode,
            position: {
                x: 475,
                y: 280,
            },
            data: {
                label: 'Voice Agent',
                type: CustomNodeTypes.voiceNode,
            },
            measured: {
                width: 88,
                height: 88,
            },
            selected: false,
            dragging: false,
        },
        {
            id: 'end_node-node-2',
            type: 'end_node',
            position: {
                x: 765,
                y: 280,
            },
            data: {
                label: 'End',
            },
            measured: {
                width: 88,
                height: 88,
            },
            selected: true,
            dragging: false,
        },
    ],
    edges: [
        {
            id: 'e1-2',
            source: '1',
            target: '',
            animated: true,
            type: 'smoothstep',
        },
        {
            source: 'start_node-node-2',
            target: 'agent_node-node-2',
            animated: true,
            type: 'smoothstep',
            id: 'xy-edge__start_node-node-2-agent_node-node-2',
        },
        {
            source: 'agent_node-node-2',
            target: 'end_node-node-2',
            animated: true,
            type: 'smoothstep',
            id: 'xy-edge__agent_node-node-2-end_node-node-2',
        },
    ],
};

export const NODE_LIST: NodeListTypeDef[] = [
    {
        category: 'recent_used',
        icon: 'ri-history-line ',
        nodes: [
            {
                id: 'agent_init_menu',
                data: {},
                title: 'Agent',
                type: CustomNodeTypes.agentNode,
                showTitle: true,
                showInteractions: false,
                isActive: false,
                color: '#6c3def',
                icon: '/png/nodes/agent-node.png',
                iconType: 'png',
            },
            {
                id: 'stop_init_menu',
                data: {},
                title: 'Stop',
                type: CustomNodeTypes.endNode,
                showTitle: true,
                showInteractions: false,
                isActive: false,
                color: '#DB7706',
                icon: '/png/nodes/end-node-icon.png',
                iconType: 'png',
            },
        ],
    },
    {
        category: 'agents',
        icon: 'ri-robot-3-fill',
        nodes: [
            {
                id: 'agent_init_menu',
                data: {},
                title: 'Agent',
                type: CustomNodeTypes.agentNode,
                showTitle: true,
                showInteractions: false,
                isActive: false,
                color: '#6c3def',
                icon: '/png/nodes/agent-node.png',
                iconType: 'png',
            },
            {
                id: 'decision_agent_init_menu',
                data: {},
                title: 'Decision Agent',
                type: CustomNodeTypes.decisionNode,
                showTitle: true,
                showInteractions: false,
                isActive: false,
                color: '#6c3def',
                icon: '/png/nodes/decision_agent.png',
                iconType: 'png',
            },
            {
                id: 'external_agent_init_menu',
                data: {},
                title: 'External Agent',
                type: CustomNodeTypes.externalAgentNode,
                showTitle: true,
                showInteractions: false,
                isActive: false,
                color: '#0DA2E7',
                icon: '/png/nodes/external-agent-node.png',
                iconType: 'png',
            },
        ],
    },
    {
        category: 'helpers',
        icon: 'ri-box-3-fill',
        nodes: [
            {
                id: 'start_init_menu',
                data: {},
                title: 'Start',
                type: CustomNodeTypes.startNode,
                showTitle: true,
                showInteractions: false,
                isActive: false,
                color: '#16A249',
                icon: '/png/nodes/start-node.png',
                iconType: 'png',
            },
            {
                id: 'stop_init_menu',
                data: {},
                title: 'Stop',
                type: CustomNodeTypes.endNode,
                showTitle: true,
                showInteractions: false,
                isActive: false,
                color: '#DB7706',
                icon: '/png/nodes/end-node-icon.png',
                iconType: 'png',
            },
            {
                id: 'iterator_init_menu',
                data: {},
                title: 'Iterator',
                type: CustomNodeTypes.iteratorNode,
                showTitle: true,
                showInteractions: false,
                isActive: false,
                color: '#3B7AF7',
                icon: '/png/nodes/iterator-icon-node.png',
                iconType: 'png',
            },
            {
                id: 'sub_workflow_init_menu',
                data: {},
                title: 'Sub Workflow',
                type: CustomNodeTypes.subflowNode,
                showTitle: true,
                showInteractions: false,
                isActive: false,
                color: '#663399',
                icon: '/png/nodes/workflow-node.png',
                iconType: 'png',
            },
            {
                id: 'file_processing_agent_init_menu',
                data: {},
                title: 'File Processing Agent',
                type: CustomNodeTypes.fileProcessingAgentNode,
                showTitle: true,
                showInteractions: false,
                isActive: false,
                color: '#1888de',
                icon: 'ri-file-settings-fill text-[50px] antialiased text-white',
            },
            {
                id: 'tool_executor_init_menu',
                data: {},
                title: 'Tool Executor',
                type: CustomNodeTypes.toolExecutorNode,
                showTitle: true,
                showInteractions: false,
                isActive: false,
                color: '#0891B2',
                icon: 'ri-tools-fill text-[50px] antialiased text-white',
            },
        ],
    },
    {
        category: 'template',
        icon: 'ri-layout-grid-fill ',
        nodes: [
            {
                id: 'template_single_agent',
                data: {},
                title: 'Basic Agent',
                type: CustomNodeTypes.singleAgentTemplate,
                showTitle: true,
                showInteractions: false,
                isActive: false,
                color: '#444CE7',
                icon: 'ri-robot-3-fill text-[50px] text-white',
            },

            {
                id: 'template_supervisor_agent',
                data: {},
                title: 'Supervisor',
                type: CustomNodeTypes.supervisorAgentTemplate,
                showTitle: true,
                showInteractions: false,
                isActive: false,
                color: '#444CE7',
                icon: '/png/nodes/supervisor_agent.png',
                iconType: 'png',
            },
            {
                id: 'template_sequential_agent',
                data: {},
                title: 'Sequential Agent',
                type: CustomNodeTypes.sequentialAgentTemplate,
                showTitle: true,
                showInteractions: false,
                isActive: false,
                color: '#444CE7',
                icon: '/png/nodes/sequential_agent.png',
                iconType: 'png',
            },
            {
                id: 'template_plan_execute',
                data: {},
                title: 'Plan & Execute',
                type: CustomNodeTypes.planExecuteTemplate,
                showTitle: true,
                showInteractions: false,
                isActive: false,
                color: '#444CE7',
                icon: '/png/nodes/plan_execute.png',
                iconType: 'png',
            },
            {
                id: 'voice_agent_template',
                data: {},
                title: 'Voice Agent',
                type: CustomNodeTypes.voiceAgentTemplate,
                showTitle: true,
                showInteractions: false,
                isActive: false,
                color: '#444CE7',
                icon: '/png/nodes/voice_agent.png',
                iconType: 'png',
            },
        ],
    },
];

const generateDynamicTemplate = (type: CustomNodeTypes, selectedTemplate: any) => {
    // Deep clone so the original template stays untouched
    const template = structuredClone(selectedTemplate);

    // Record old → new node ID mapping
    const idMap: Record<string, string> = {};

    // 1. Rename relevant nodes
    template.nodes.forEach((node: any) => {
        const newNodeId = `${node.id}-${generateNodeId(type)}`;
        idMap[node.id] = newNodeId;
        node.id = newNodeId;
    });

    // 2. Update all edges using the mapping
    template.edges.forEach((edge: any) => {
        if (idMap[edge.source]) {
            edge.source = idMap[edge.source];
        }
        if (idMap[edge.target]) {
            edge.target = idMap[edge.target];
        }

        // Update the edge id itself
        Object.keys(idMap).forEach(oldId => {
            edge.id = edge.id.replaceAll(oldId, idMap[oldId]);
        });
    });

    return template;
};

export const generateDynamicPlanExecuteTemplate = () => {
    return generateDynamicTemplate(CustomNodeTypes.planExecuteTemplate, planExecuteTemplate);
};

export const generateDynamicSingleAgentTemplate = () => {
    return generateDynamicTemplate(CustomNodeTypes.singleAgentTemplate, singleAgentTemplate);
};

export const generateDynamicSequentialAgentTemplate = () => {
    return generateDynamicTemplate(CustomNodeTypes.sequentialAgentTemplate, sequentialAgentTemplate);
};

export const generateDynamicSupervisorAgentTemplate = () => {
    return generateDynamicTemplate(CustomNodeTypes.supervisorAgentTemplate, supervisorAgentTemplate);
};
