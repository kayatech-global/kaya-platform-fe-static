/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handle, NodeProps, Position } from '@xyflow/react';
import React from 'react';
import { BrainCircuit, Link, ServerCog, Unplug, Usb, Braces, Workflow, Refrigerator } from 'lucide-react';
import { CustomNodeBase, IteratorNode } from '@/components';
import { CustomNodeTypes, LineageSubStepExplanationType } from '@/enums';

type CustomNodeConfig = {
    title: string;
    color: string;
    activeColor?: string;
    icon: string;
    iconType?: 'icon' | 'png';
    handleConfig?: { showSource: boolean; showTarget: boolean };
    showTitle?: boolean;
};

const CUSTOM_NODE_CONFIGS: Record<string, CustomNodeConfig> = {
    [CustomNodeTypes.startNode]: {
        title: 'Start',
        color: '#16A249',
        activeColor: '#157F3C',
        icon: 'ri-play-circle-fill text-[50px] antialiased text-white',
        handleConfig: { showSource: true, showTarget: false },
    },
    [CustomNodeTypes.endNode]: {
        title: 'Stop',
        color: '#DB7706',
        activeColor: '#B35309',
        icon: 'ri-stop-circle-fill text-[50px] antialiased text-white',
        handleConfig: { showSource: false, showTarget: true },
    },
    [CustomNodeTypes.agentNode]: {
        title: 'Agent',
        color: '#6c3def',
        activeColor: '#5925DC',
        icon: 'ri-robot-2-fill text-[50px] antialiased text-white',
        handleConfig: { showSource: true, showTarget: true },
        showTitle: true,
    },
    [CustomNodeTypes.plannerNode]: {
        title: 'Planner Agent',
        color: '#3538CD',
        activeColor: '#2D3282',
        icon: '/png/nodes/planner_agent.png',
        iconType: 'png',
        handleConfig: { showSource: true, showTarget: true },
        showTitle: true,
    },
    [CustomNodeTypes.rePlannerNode]: {
        title: 'Replanner Agent',
        color: '#3538CD',
        activeColor: '#2D3282',
        icon: '/png/nodes/repalnner_agent.png',
        iconType: 'png',
        handleConfig: { showSource: true, showTarget: true },
        showTitle: true,
    },
    [CustomNodeTypes.voiceNode]: {
        title: 'Voice Agent',
        color: '#3538CD',
        activeColor: '#2D3282',
        icon: '/png/nodes/voice_agent.png',
        iconType: 'png',
        handleConfig: { showSource: true, showTarget: true },
        showTitle: true,
    },
    [CustomNodeTypes.loaderNode]: {
        title: 'Loader Agent',
        color: '#16A249',
        activeColor: '#157F3C',
        icon: 'ri-database-2-fill text-[50px] antialiased text-white',
        iconType: 'icon',
        handleConfig: { showSource: true, showTarget: true },
        showTitle: true,
    },
    [CustomNodeTypes.cleanerNode]: {
        title: 'Cleaner Agent',
        color: '#16A249',
        activeColor: '#157F3C',
        icon: 'ri-eraser-fill text-[50px] antialiased text-white',
        iconType: 'icon',
        handleConfig: { showSource: true, showTarget: true },
        showTitle: true,
    },
    [CustomNodeTypes.wranglerNode]: {
        title: 'Wrangler Agent',
        color: '#16A249',
        activeColor: '#157F3C',
        icon: 'ri-exchange-2-line text-[50px] antialiased text-white',
        iconType: 'icon',
        handleConfig: { showSource: true, showTarget: true },
        showTitle: true,
    },
    [CustomNodeTypes.reportNode]: {
        title: 'Report Agent',
        color: '#16A249',
        activeColor: '#157F3C',
        icon: 'ri-file-chart-fill text-[50px] antialiased text-white',
        iconType: 'icon',
        handleConfig: { showSource: true, showTarget: true },
        showTitle: true,
    },
    [CustomNodeTypes.supervisorAgentTemplate]: {
        title: 'Supervisor Agent',
        color: '#1D5BD6',
        icon: '/png/nodes/supervisor_agent_node.png',
        iconType: 'png',
        handleConfig: { showSource: true, showTarget: true },
    },
};

type SubStepConfig = {
    iconColor: string;
    IconComponent: React.ElementType;
    justify: string;
};

const SUB_STEP_CONFIGS: Record<string, SubStepConfig> = {
    [LineageSubStepExplanationType.API]: { iconColor: 'bg-green-600', IconComponent: Link, justify: 'justify-center' },
    [LineageSubStepExplanationType.LLM]: { iconColor: 'bg-amber-600', IconComponent: Unplug, justify: 'justify-start' },
    [LineageSubStepExplanationType.SLM]: { iconColor: 'bg-amber-800', IconComponent: Unplug, justify: 'justify-start' },
    [LineageSubStepExplanationType.STS]: { iconColor: 'bg-amber-400', IconComponent: Unplug, justify: 'justify-start' },
    [LineageSubStepExplanationType.MCP]: {
        iconColor: 'bg-gray-600',
        IconComponent: ServerCog,
        justify: 'justify-start',
    },
    [LineageSubStepExplanationType.VECTORRAG]: {
        iconColor: 'bg-blue-600',
        IconComponent: BrainCircuit,
        justify: 'justify-start',
    },
    [LineageSubStepExplanationType.GRAPHRAG]: {
        iconColor: 'bg-sky-600',
        IconComponent: BrainCircuit,
        justify: 'justify-start',
    },
    [LineageSubStepExplanationType.DATABASE_CONNECTOR]: {
        iconColor: 'bg-red-400',
        IconComponent: Usb,
        justify: 'justify-start',
    },
    [LineageSubStepExplanationType.EXECUTABLE_FUNCTION]: {
        iconColor: 'bg-green-800',
        IconComponent: Braces,
        justify: 'justify-start',
    },
    [LineageSubStepExplanationType.SUB_WORKFLOW]: {
        iconColor: 'bg-red-300',
        IconComponent: Workflow,
        justify: 'justify-start',
    },
    [LineageSubStepExplanationType.ITERATOR]: {
        iconColor: 'bg-red-500',
        IconComponent: Refrigerator,
        justify: 'justify-start',
    },
};

const getSubStepLabel = (type: string) => {
    if (type === LineageSubStepExplanationType.VECTORRAG) return 'VECTOR RAG';
    if (type === LineageSubStepExplanationType.GRAPHRAG) return 'GRAPH RAG';
    return type;
};

export const DataLineageNode: React.FC<NodeProps> = ({ id, data, type }) => {
    // 1. Handle Decision Node (dynamic configuration based on overrideType)
    if (type === CustomNodeTypes.decisionNode) {
        const isSupervisor = data?.overrideType === CustomNodeTypes.supervisorAgentTemplate;

        return (
            <CustomNodeBase
                id={id}
                data={data}
                title={isSupervisor ? 'Supervisor Agent' : 'Decision Agent'}
                type={type as CustomNodeTypes}
                color="#6c3def"
                activeColor="#5925DC"
                icon={isSupervisor ? '/png/nodes/supervisor_agent_node.png' : '/png/nodes/decision_agent.png'}
                handleConfig={{ showSource: true, showTarget: true }}
                showInteractions
                iconType="png"
                showTitle
                customTitle={data?.name as string}
            />
        );
    }

    if (type === CustomNodeTypes.subflowNode) {
        return (
            <CustomNodeBase
                id={id}
                data={data}
                title="Sub-Workflow"
                type={type}
                color="#663399"
                activeColor="#402061"
                icon="/png/nodes/workflow-node.png"
                handleConfig={{ showSource: true, showTarget: true }}
                showInteractions
                iconType="png"
                showTitle
                customTitle={data?.name as string}
            />
        );
    }

    if (type === CustomNodeTypes.iteratorNode) {
        return <IteratorNode data={data} id={id} />;
    }

    // 2. Handle standard Custom Nodes mapped via configuration object
    const customConfig = CUSTOM_NODE_CONFIGS[type];
    if (customConfig) {
        return (
            <CustomNodeBase
                id={id}
                data={data}
                type={type as CustomNodeTypes}
                showInteractions
                title={customConfig.title}
                color={customConfig.color}
                activeColor={customConfig.activeColor}
                icon={customConfig.icon}
                iconType={customConfig.iconType}
                handleConfig={customConfig.handleConfig}
                showTitle={customConfig.showTitle}
                customTitle={customConfig.showTitle ? (data?.name as string) : undefined}
            />
        );
    }

    // 3. Handle Sub-steps mapped via configuration object
    const subStepConfig = SUB_STEP_CONFIGS[type];
    if (subStepConfig) {
        const { iconColor, IconComponent, justify } = subStepConfig;
        const name = (data as { name?: string })?.name ?? '-';

        return (
            <div
                className={`min-w-[200px] max-w-[320px] w-fit h-[80px] bg-gray-800 flex gap-x-3 ${justify} items-center rounded-md px-3 py-2`}
            >
                <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 rounded-full" />
                <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-500 rounded-full" />
                <div
                    className={`${iconColor} min-w-[55px] !w-[55px] !h-[55px] rounded-md flex items-center justify-center flex-shrink-0`}
                >
                    <IconComponent size={32} className="text-white" />
                </div>
                <div className="flex flex-col gap-y-2 min-w-0 flex-1">
                    <p className="text-sm text-white leading-tight" title={name}>
                        {name}
                    </p>
                    <div className="border border-gray-600 px-2 py-1 rounded-md w-fit">
                        <p className="text-xs text-gray-300">{getSubStepLabel(type)}</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
