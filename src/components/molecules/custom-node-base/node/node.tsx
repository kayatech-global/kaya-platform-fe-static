import { NodeProps } from '@xyflow/react';
import React from 'react';
import { CustomNodeBase } from '../custom-node-base';
import { AgentHoverCard } from '../../agent-hover-card/agent-hover-card';
import { AgentType } from '@/components/organisms';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import { IteratorNode } from '../../iterator-node/iterator-node';
import { ToolExecutorNode } from '../../tool-executor-node/tool-executor-node';
import { CustomNodeTypes } from '@/enums';

export const Node: React.FC<NodeProps> = ({ id, data, type }) => {
    if (type === CustomNodeTypes.startNode) {
        return (
            <CustomNodeBase
                id={id}
                data={data}
                title="Start"
                type={type}
                color="#16A249"
                activeColor="#157F3C"
                icon="/png/nodes/start-node.png"
                iconType="png"
                handleConfig={{ showSource: true, showTarget: false }}
                showInteractions
            />
        );
    }

    if (type === CustomNodeTypes.endNode) {
        return (
            <CustomNodeBase
                id={id}
                data={data}
                title="Stop"
                type={type}
                color="#DB7706"
                activeColor="#B35309"
                icon="/png/nodes/end-node-icon.png"
                iconType="png"
                handleConfig={{ showSource: false, showTarget: true }}
                showInteractions
            />
        );
    }

    if (type === CustomNodeTypes.agentNode) {
        return (
            <CustomNodeBase
                id={id}
                data={data}
                title="Agent"
                type={type}
                color="#6c3def"
                activeColor="#5925DC"
                icon="/png/nodes/agent-node.png"
                iconType="png"
                handleConfig={{ showSource: true, showTarget: true }}
                showInteractions
                showTitle={true}
                customTitle={data?.name as string}
                hoverCard={<AgentHoverCard data={data as AgentType} color="#6c3def" />}
            />
        );
    }

    if (type === CustomNodeTypes.decisionNode) {
        const isSupervisor = data?.overrideType === CustomNodeTypes.supervisorAgentTemplate;

        return (
            <CustomNodeBase
                id={id}
                data={data}
                title={isSupervisor ? 'Supervisor Agent' : 'Decision Agent'}
                type={type}
                color="#6c3def"
                activeColor="#5925DC"
                icon={isSupervisor ? '/png/nodes/supervisor_agent_node.png' : '/png/nodes/decision_agent.png'}
                handleConfig={{ showSource: true, showTarget: true }}
                showInteractions
                iconType="png"
                showTitle
                customTitle={data?.name as string}
                hoverCard={<AgentHoverCard data={data as AgentType} color="#6c3def" />}
            />
        );
    }

    if (type === CustomNodeTypes.plannerNode) {
        return (
            <CustomNodeBase
                id={id}
                data={data}
                title="Planner Agent"
                type={type}
                color="#3538CD"
                activeColor="#2D3282"
                icon="/png/nodes/planner_agent.png"
                handleConfig={{ showSource: true, showTarget: true }}
                showInteractions
                iconType="png"
                showTitle
                customTitle={data?.name as string}
                hoverCard={<AgentHoverCard type={type} data={data as AgentType} color="#3538CD" />}
            />
        );
    }

    if (type === CustomNodeTypes.rePlannerNode) {
        return (
            <CustomNodeBase
                id={id}
                data={data}
                title="Replanner Agent"
                type={type}
                color="#3538CD"
                activeColor="#2D3282"
                icon="/png/nodes/repalnner_agent.png"
                handleConfig={{ showSource: true, showTarget: true }}
                showInteractions
                iconType="png"
                showTitle
                customTitle={data?.name as string}
                hoverCard={<AgentHoverCard type={type} data={data as AgentType} color="#3538CD" />}
            />
        );
    }

    if (type === CustomNodeTypes.voiceNode) {
        return (
            <CustomNodeBase
                id={id}
                data={data}
                title="Voice Agent"
                type={type}
                color="#3538CD"
                activeColor="#2D3282"
                icon="/png/nodes/voice_agent.png"
                handleConfig={{ showSource: true, showTarget: true }}
                showInteractions
                iconType="png"
                showTitle
                customTitle={data?.name as string}
                hoverCard={<AgentHoverCard data={data as VoiceAgent} color="#3538CD" />}
            />
        );
    }

    if (type === CustomNodeTypes.loaderNode) {
        return (
            <CustomNodeBase
                id={id}
                data={data}
                title="Loader Agent"
                type={type}
                color="#16A249"
                activeColor="#157F3C"
                icon="ri-database-2-fill text-[50px] antialiased text-white"
                handleConfig={{ showSource: true, showTarget: true }}
                showInteractions
                iconType="icon"
                showTitle
                customTitle={data?.name as string}
                hoverCard={<AgentHoverCard data={data as AgentType} color="#16A249" />}
            />
        );
    }

    if (type === CustomNodeTypes.cleanerNode) {
        return (
            <CustomNodeBase
                id={id}
                data={data}
                title="Cleaner Agent"
                type={type}
                color="#16A249"
                activeColor="#157F3C"
                icon="ri-eraser-fill text-[50px] antialiased text-white"
                handleConfig={{ showSource: true, showTarget: true }}
                showInteractions
                iconType="icon"
                showTitle
                customTitle={data?.name as string}
                hoverCard={<AgentHoverCard data={data as AgentType} color="#16A249" />}
            />
        );
    }

    if (type === CustomNodeTypes.wranglerNode) {
        return (
            <CustomNodeBase
                id={id}
                data={data}
                title="Wrangler Agent"
                type={type}
                color="#16A249"
                activeColor="#157F3C"
                icon="ri-exchange-2-line text-[50px] antialiased text-white"
                handleConfig={{ showSource: true, showTarget: true }}
                showInteractions
                iconType="icon"
                showTitle
                customTitle={data?.name as string}
                hoverCard={<AgentHoverCard data={data as AgentType} color="#16A249" />}
            />
        );
    }

    if (type === CustomNodeTypes.reportNode) {
        return (
            <CustomNodeBase
                id={id}
                data={data}
                title="Report Agent"
                type={type}
                color="#16A249"
                activeColor="#157F3C"
                icon="ri-file-chart-fill text-[50px] antialiased text-white"
                handleConfig={{ showSource: true, showTarget: true }}
                showInteractions
                iconType="icon"
                showTitle
                customTitle={data?.name as string}
                hoverCard={<AgentHoverCard data={data as AgentType} color="#16A249" />}
            />
        );
    }

    if (type === CustomNodeTypes.fileProcessingAgentNode) {
        return (
            <CustomNodeBase
                id={id}
                data={data}
                title="File Processing Agent"
                type={type}
                color="#1888de"
                activeColor="#0b71bf"
                icon="ri-file-settings-fill text-[50px] antialiased text-white"
                handleConfig={{ showSource: true, showTarget: true }}
                showInteractions
                iconType="icon"
                showTitle
                customTitle={data?.name as string}
                hoverCard={<AgentHoverCard data={data as AgentType} color="#0b71bf" />}
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

    if (type === CustomNodeTypes.deepAgentNode) {
        return (
            <CustomNodeBase
                id={id}
                data={data}
                title="Deep Agent"
                type={type}
                color="#6c3def"
                activeColor="#5925DC"
                icon="/png/nodes/deep_agent_node.png"
                handleConfig={{ showSource: true, showTarget: true }}
                showInteractions
                iconType="png"
                showTitle
                customTitle={data?.name as string}
                hoverCard={<AgentHoverCard data={data as AgentType} color="#6c3def" />}
            />
        );
    }

    if (type === CustomNodeTypes.supervisorAgentTemplate) {
        return (
            <CustomNodeBase
                id={id}
                data={data}
                title="Supervisor Agent"
                type={type}
                color="#1D5BD6"
                icon="/png/nodes/supervisor_agent_node.png"
                handleConfig={{ showSource: true, showTarget: true }}
                showInteractions
                iconType="png"
            />
        );
    }

    if (type === CustomNodeTypes.iteratorNode) {
        return <IteratorNode data={data} id={id} allowedNodes={[CustomNodeTypes.subflowNode]} />;
    }

    if (type === CustomNodeTypes.toolExecutorNode) {
        return (
            <ToolExecutorNode
                id={id}
                data={data}
                type={type}
            />
        );
    }

    return null;
};
