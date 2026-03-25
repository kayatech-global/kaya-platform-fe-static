'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components';
import { ChevronRight, ServerCog, Database, GitBranch } from 'lucide-react';

const prototypes = [
    {
        title: 'MCP Configuration',
        description: 'Test connection for MCP Server configurations with various authentication methods',
        href: '/prototypes/test-connection/mcp',
        icon: ServerCog,
    },
    {
        title: 'Vector RAG',
        description: 'Test connection for Vector RAG configurations with database and embedding model validation',
        href: '/prototypes/test-connection/vector-rag',
        icon: Database,
    },
    {
        title: 'Graph RAG',
        description: 'Test connection for Graph RAG retrieval settings with node and property verification',
        href: '/prototypes/test-connection/graph-rag',
        icon: GitBranch,
    },
];

export default function TestConnectionPrototypesPage() {
    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-white mb-2">Test Connection Prototypes</h1>
                    <p className="text-gray-400">
                        Interactive prototypes demonstrating test connection functionality for various configuration forms.
                    </p>
                </div>

                <div className="grid gap-4">
                    {prototypes.map((prototype) => (
                        <Link key={prototype.href} href={prototype.href}>
                            <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer group">
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <prototype.icon className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-white text-lg flex items-center justify-between">
                                            {prototype.title}
                                            <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-gray-300 transition-colors" />
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-gray-400">
                                        {prototype.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
