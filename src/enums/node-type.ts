export enum CustomNodeTypes {
    // Agents
    agentNode = 'agent_node',
    // Helpers
    startNode = 'start_node',
    endNode = 'end_node',
    //Decision nodes
    decisionNode = 'decision_node',
    // Planner nodes
    plannerNode = 'planner_node',
    // Re-planner nodes
    rePlannerNode = 'replanner_node',
    // execution nodes
    executionNode = 'execution_node',
    // voice nodes
    voiceNode = 'voice_agent_node',
    // Loader nodes
    loaderNode = 'loader_node',
    // cleaner nodes
    cleanerNode = 'cleaner_node',
    // wrangler nodes
    wranglerNode = 'wrangler_node',
    // report nodes
    reportNode = 'report_node',
    // File Processing Agent
    fileProcessingAgentNode = 'file_processing_agent_node',
    // deep agent nodes
    deepAgentNode = 'deep_agent_node',
    // subflow nodes
    subflowNode = 'subflow_node',
    // iterator nodes
    iteratorNode = 'iterator_node',
    // template nodes
    singleAgentTemplate = 'single_agent_template',
    sequentialAgentTemplate = 'sequential_agent_template',
    supervisorAgentTemplate = 'supervisor_agent_template',
    planExecuteTemplate = 'plan_execute_template',
    voiceAgentTemplate = 'voice_agent_template',
    fallbackNode = 'fallback_node',
    tradingNode = 'trading_node',
    workflow = 'workflow_node',
    humanInLoop = 'human_in_loop',
    // Tool Executor node
    toolExecutorNode = 'tool_executor_node',
}
