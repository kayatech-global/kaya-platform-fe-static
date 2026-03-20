'use client';

import React from 'react';
import { 
    LayoutDashboard, 
    TrendingUp, 
    Activity, 
    Zap,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/atoms/card';

// Stat Card Component
const StatCard: React.FC<{
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: React.ReactNode;
}> = ({ title, value, change, trend, icon }) => (
    <Card>
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                    <div className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trend === 'up' ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                        <span>{change} from last week</span>
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    {icon}
                </div>
            </div>
        </CardContent>
    </Card>
);

const DashboardPage: React.FC = () => {
    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="size-6 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Overview of your platform metrics and activities
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Workspaces"
                    value="12"
                    change="+2"
                    trend="up"
                    icon={<LayoutDashboard className="size-5 text-blue-600" />}
                />
                <StatCard
                    title="Active Workflows"
                    value="48"
                    change="+8"
                    trend="up"
                    icon={<Activity className="size-5 text-blue-600" />}
                />
                <StatCard
                    title="Credits Used"
                    value="156,420"
                    change="+12,340"
                    trend="up"
                    icon={<Zap className="size-5 text-blue-600" />}
                />
                <StatCard
                    title="Efficiency Rate"
                    value="94.2%"
                    change="+2.1%"
                    trend="up"
                    icon={<TrendingUp className="size-5 text-blue-600" />}
                />
            </div>

            {/* Quick Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest actions across your workspaces</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { action: 'Workflow "Invoice Processing" executed', time: '2 minutes ago', workspace: 'Mock Project Alpha' },
                                { action: 'New agent "Data Validator" created', time: '15 minutes ago', workspace: 'Mock Project Beta' },
                                { action: 'Budget limit updated', time: '1 hour ago', workspace: 'Mock Project Alpha' },
                                { action: 'Workspace settings modified', time: '3 hours ago', workspace: 'Finance Automation' },
                            ].map((item, index) => (
                                <div key={index} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.action}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.workspace}</p>
                                    </div>
                                    <span className="text-xs text-gray-400">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'New Workspace', href: '/workspaces' },
                                { label: 'View Reports', href: '/workspaces' },
                                { label: 'Manage Credits', href: '/workspaces' },
                                { label: 'View Licensing', href: '/licensing' },
                            ].map((action, index) => (
                                <a
                                    key={index}
                                    href={action.href}
                                    className="p-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                                </a>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
