'use client';

import React, { useState } from 'react';
import { Button, Badge } from '@/components/atoms';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/atoms/tabs';
import { RuntimeContainer } from '../workspace/[wid]/agentcore-runtimes/components/runtime-container';
import { AgentCorePublishModal } from '@/components/organisms/agentcore-publish-modal';
import { PlaygroundContainer } from '../workspace/[wid]/agentcore-playground/components/playground-container';
import { Cloud, Settings, Upload, Play } from 'lucide-react';

const AgentCoreIntegrationDemo = () => {
    const [activeTab, setActiveTab] = useState('runtimes');
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-x-4">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <Cloud size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">
                                AWS AgentCore Integration
                            </h1>
                            <p className="text-sm text-blue-100">
                                REQ-0231 Prototype Demo
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-x-3">
                        <Badge variant="success" className="bg-white/20 text-white border-white/30">
                            Prototype
                        </Badge>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsPublishModalOpen(true)}
                            leadingIcon={<Upload size={14} />}
                        >
                            Publish Workflow
                        </Button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
                <div className="max-w-7xl mx-auto">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="h-12 bg-transparent gap-x-1 p-0">
                            <TabsTrigger
                                value="runtimes"
                                className="h-12 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                            >
                                <Settings size={16} className="mr-2" />
                                Setup Runtimes
                            </TabsTrigger>
                            <TabsTrigger
                                value="playground"
                                className="h-12 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
                            >
                                <Play size={16} className="mr-2" />
                                AgentCore Playground
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto">
                {activeTab === 'runtimes' && (
                    <div className="p-6">
                        <RuntimeContainer />
                    </div>
                )}
                {activeTab === 'playground' && <PlaygroundContainer />}
            </div>

            {/* Publish Modal */}
            <AgentCorePublishModal
                open={isPublishModalOpen}
                onOpenChange={setIsPublishModalOpen}
                workflowName="Customer Support Agent"
                workflowVersion="13.0"
            />
        </div>
    );
};

export default AgentCoreIntegrationDemo;
