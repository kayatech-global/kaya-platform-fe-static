'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Select, Label, Card, CardContent, CardHeader, CardTitle } from '@/components';
import { Plug, Loader2, CheckCircle, XCircle, ArrowLeft, GitBranch, Square } from 'lucide-react';

type ScenarioState = 'idle' | 'loading' | 'success' | 'error';

type StepStatus = 'success' | 'error' | 'skipped' | 'pending';

interface ConnectionStep {
    name: string;
    status: StepStatus;
    message: string;
}

export default function GraphRagTestConnectionPage() {
    const [scenario, setScenario] = useState<ScenarioState>('idle');
    const [formData, setFormData] = useState({
        database: 'neo4j-prod',
        embeddingModel: 'text-embedding-3-large',
        queryLanguage: 'cypher',
        nodeLabel: 'Document',
        embeddingNodeProperty: 'embedding_vector',
        textNodeProperties: 'title, content, summary',
        topK: '10',
    });

    const scenarios: { value: ScenarioState; label: string }[] = [
        { value: 'idle', label: 'Idle' },
        { value: 'loading', label: 'Loading' },
        { value: 'success', label: 'Success' },
        { value: 'error', label: 'Error' },
    ];

    const getConnectionSteps = (): ConnectionStep[] => {
        if (scenario === 'success') {
            return [
                { name: 'Database connectivity', status: 'success', message: 'Connected' },
                { name: 'Node label', status: 'success', message: 'Found 1,247 nodes' },
                { name: 'Embedding property', status: 'success', message: 'Verified' },
                { name: 'Query execution', status: 'success', message: 'OK' },
            ];
        }
        if (scenario === 'error') {
            return [
                { name: 'Database connectivity', status: 'success', message: 'Connected' },
                { name: 'Node label', status: 'success', message: 'Found 1,247 nodes' },
                { name: 'Embedding property', status: 'error', message: "Property 'embedding_vector' not present on any 'Document' nodes" },
                { name: 'Query execution', status: 'skipped', message: 'Skipped' },
            ];
        }
        return [];
    };

    const getStepIcon = (status: StepStatus) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-400" />;
            case 'error':
                return <XCircle className="h-4 w-4 text-red-400" />;
            case 'skipped':
                return <Square className="h-4 w-4 text-gray-500" />;
            default:
                return <Square className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStepTextColor = (status: StepStatus) => {
        switch (status) {
            case 'success':
                return 'text-green-400';
            case 'error':
                return 'text-red-400';
            case 'skipped':
                return 'text-gray-500';
            default:
                return 'text-gray-400';
        }
    };

    const getButtonContent = () => {
        switch (scenario) {
            case 'loading':
                return (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Testing...
                    </>
                );
            default:
                return (
                    <>
                        <Plug className="h-4 w-4" />
                        Test Connection
                    </>
                );
        }
    };

    const connectionSteps = getConnectionSteps();

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-2xl mx-auto">
                {/* Back Link */}
                <Link
                    href="/prototypes/test-connection"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Prototypes
                </Link>

                {/* Scenario Toggle Pills */}
                <div className="mb-6">
                    <Label className="text-gray-300 mb-3 block">Scenario State</Label>
                    <div className="flex flex-wrap gap-2">
                        {scenarios.map((s) => (
                            <button
                                key={s.value}
                                onClick={() => setScenario(s.value)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    scenario === s.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="border-b border-gray-700">
                        <CardTitle className="text-white flex items-center gap-2">
                            <GitBranch className="h-5 w-5 text-blue-400" />
                            Graph RAG - Step 2: Retrieval Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {/* Alert Banners */}
                            {scenario === 'success' && (
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-green-400 font-medium">Graph RAG connection successful.</p>
                                        <p className="text-green-400/80 text-sm">Database reachable, node label and properties verified.</p>
                                    </div>
                                </div>
                            )}

                            {scenario === 'error' && (
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-red-400 font-medium">Graph RAG connection failed.</p>
                                        <p className="text-red-400/80 text-sm">One or more validation steps failed.</p>
                                    </div>
                                </div>
                            )}

                            {/* Segmented Breakdown (shown on success or error) */}
                            {(scenario === 'success' || scenario === 'error') && connectionSteps.length > 0 && (
                                <div className="rounded-lg border border-gray-700 overflow-hidden">
                                    {connectionSteps.map((step, index) => (
                                        <div
                                            key={step.name}
                                            className={`flex items-center justify-between p-3 ${
                                                index !== connectionSteps.length - 1 ? 'border-b border-gray-700' : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {getStepIcon(step.status)}
                                                <span className="text-gray-300 text-sm">{step.name}</span>
                                            </div>
                                            <span className={`text-sm ${getStepTextColor(step.status)} text-right max-w-[50%]`}>
                                                {step.message}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <Select
                                    label="Database"
                                    value={formData.database}
                                    onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                                    options={[
                                        { name: 'Neo4j Production', value: 'neo4j-prod' },
                                        { name: 'Neo4j Staging', value: 'neo4j-staging' },
                                        { name: 'Amazon Neptune', value: 'neptune' },
                                        { name: 'TigerGraph Cloud', value: 'tigergraph' },
                                    ]}
                                    currentValue={formData.database}
                                    className="bg-gray-700 border-gray-600 text-white"
                                />

                                <Select
                                    label="Embedding Model"
                                    value={formData.embeddingModel}
                                    onChange={(e) => setFormData({ ...formData, embeddingModel: e.target.value })}
                                    options={[
                                        { name: 'text-embedding-3-large', value: 'text-embedding-3-large' },
                                        { name: 'text-embedding-3-small', value: 'text-embedding-3-small' },
                                        { name: 'text-embedding-ada-002', value: 'text-embedding-ada-002' },
                                    ]}
                                    currentValue={formData.embeddingModel}
                                    className="bg-gray-700 border-gray-600 text-white"
                                />

                                <Select
                                    label="Query Language"
                                    value={formData.queryLanguage}
                                    onChange={(e) => setFormData({ ...formData, queryLanguage: e.target.value })}
                                    options={[
                                        { name: 'Cypher', value: 'cypher' },
                                    ]}
                                    currentValue={formData.queryLanguage}
                                    className="bg-gray-700 border-gray-600 text-white"
                                />

                                <Input
                                    label="Node Label"
                                    value={formData.nodeLabel}
                                    onChange={(e) => setFormData({ ...formData, nodeLabel: e.target.value })}
                                    placeholder="e.g., Document, Article"
                                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                                />

                                <Input
                                    label="Embedding Node Property"
                                    value={formData.embeddingNodeProperty}
                                    onChange={(e) => setFormData({ ...formData, embeddingNodeProperty: e.target.value })}
                                    placeholder="e.g., embedding_vector"
                                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                                />

                                <Input
                                    label="Text Node Properties"
                                    value={formData.textNodeProperties}
                                    onChange={(e) => setFormData({ ...formData, textNodeProperties: e.target.value })}
                                    placeholder="e.g., title, content, summary"
                                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                                />

                                <Input
                                    label="Top-K"
                                    type="number"
                                    value={formData.topK}
                                    onChange={(e) => setFormData({ ...formData, topK: e.target.value })}
                                    placeholder="Number of results to retrieve"
                                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                                />
                            </div>

                            {/* Form Footer */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                                <Button variant="secondary" size="sm">
                                    Cancel
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={scenario === 'loading'}
                                    onClick={() => setScenario('loading')}
                                    className="gap-2"
                                >
                                    {getButtonContent()}
                                </Button>
                                <Button size="sm">
                                    Save
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
