'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Select, Label, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components';
import { Plug, Loader2, CheckCircle, XCircle, ArrowLeft, Wrench } from 'lucide-react';

type ScenarioState = 'idle' | 'loading' | 'success' | 'error-404' | 'error-401';

const mockTools = [
    { name: 'search_documents', description: 'Search through indexed documents' },
    { name: 'get_user_info', description: 'Retrieve user information' },
    { name: 'send_notification', description: 'Send push notifications' },
];

export default function McpTestConnectionPage() {
    const [scenario, setScenario] = useState<ScenarioState>('idle');
    const [formData, setFormData] = useState({
        name: 'production-mcp-server',
        serverUrl: 'https://api.example.com/mcp',
        transport: 'sse',
        authorization: 'bearer',
    });

    const scenarios: { value: ScenarioState; label: string }[] = [
        { value: 'idle', label: 'Idle' },
        { value: 'loading', label: 'Loading' },
        { value: 'success', label: 'Success' },
        { value: 'error-404', label: 'Error (404)' },
        { value: 'error-401', label: 'Error (401)' },
    ];

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
                            <Plug className="h-5 w-5 text-blue-400" />
                            MCP Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {/* Alert Banners */}
                            {scenario === 'success' && (
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-green-400 font-medium">MCP connection successful.</p>
                                        <p className="text-green-400/80 text-sm">3 tools discovered.</p>
                                    </div>
                                </div>
                            )}

                            {scenario === 'error-404' && (
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-red-400 font-medium">Unable to connect to MCP server (404 Not Found).</p>
                                        <p className="text-red-400/80 text-sm">Please verify the Server URL.</p>
                                    </div>
                                </div>
                            )}

                            {scenario === 'error-401' && (
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-red-400 font-medium">Authentication failed (401 Unauthorized).</p>
                                        <p className="text-red-400/80 text-sm">Please check Authorization configuration.</p>
                                    </div>
                                </div>
                            )}

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <Input
                                    label="Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter configuration name"
                                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                                />

                                <Input
                                    label="API URL / Server URL"
                                    value={formData.serverUrl}
                                    onChange={(e) => setFormData({ ...formData, serverUrl: e.target.value })}
                                    placeholder="https://api.example.com/mcp"
                                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                                />

                                <Select
                                    label="Transport"
                                    value={formData.transport}
                                    onChange={(e) => setFormData({ ...formData, transport: e.target.value })}
                                    options={[
                                        { name: 'SSE', value: 'sse' },
                                        { name: 'Streamable HTTP', value: 'streamable-http' },
                                    ]}
                                    currentValue={formData.transport}
                                    className="bg-gray-700 border-gray-600 text-white"
                                />

                                <Select
                                    label="Authorization"
                                    value={formData.authorization}
                                    onChange={(e) => setFormData({ ...formData, authorization: e.target.value })}
                                    options={[
                                        { name: 'No Auth', value: 'no-auth' },
                                        { name: 'Basic Auth', value: 'basic' },
                                        { name: 'Bearer Token', value: 'bearer' },
                                        { name: 'API Key', value: 'api-key' },
                                        { name: 'SSO', value: 'sso' },
                                    ]}
                                    currentValue={formData.authorization}
                                    className="bg-gray-700 border-gray-600 text-white"
                                />
                            </div>

                            {/* Discovered Tools (shown on success) */}
                            {scenario === 'success' && (
                                <div className="mt-6 pt-6 border-t border-gray-700">
                                    <Label className="text-gray-300 mb-3 block flex items-center gap-2">
                                        <Wrench className="h-4 w-4" />
                                        Discovered Tools
                                    </Label>
                                    <div className="space-y-2">
                                        {mockTools.map((tool) => (
                                            <div
                                                key={tool.name}
                                                className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 border border-gray-600"
                                            >
                                                <div>
                                                    <p className="text-white font-medium text-sm">{tool.name}</p>
                                                    <p className="text-gray-400 text-xs">{tool.description}</p>
                                                </div>
                                                <Badge variant="success" className="bg-green-500/10 text-green-400 border-green-500/20">
                                                    Available
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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
