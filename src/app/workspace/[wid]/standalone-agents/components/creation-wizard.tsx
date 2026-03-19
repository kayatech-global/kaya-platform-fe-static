'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
} from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import { Badge } from '@/components/atoms/badge';
import { Switch } from '@/components/atoms/switch';
import { cn } from '@/lib/utils';
import {
    Bot,
    Cog,
    Wrench,
    Server,
    CheckCircle,
    ChevronRight,
    ChevronLeft,
    Terminal,
    Code,
    FileText,
    Brain,
    Mail,
    Globe,
    Monitor,
    Variable,
    ListTodo,
    Clock,
    RefreshCw,
    Settings,
} from 'lucide-react';
import { defaultTools } from '../mock-data';

interface CreationWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const steps = [
    { id: 1, label: 'Framework', icon: Bot },
    { id: 2, label: 'Configuration', icon: Cog },
    { id: 3, label: 'Tools', icon: Wrench },
    { id: 4, label: 'Deployment', icon: Server },
    { id: 5, label: 'Review', icon: CheckCircle },
];

const toolIcons: Record<string, React.ElementType> = {
    Terminal, Code, FileText, Brain, Mail, Globe, Monitor, Variable, ListTodo, Clock, RefreshCw, Settings,
};

export const CreationWizard = ({ open, onOpenChange }: CreationWizardProps) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [framework, setFramework] = useState<'pi-agents' | 'openclaw' | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [llmProvider, setLlmProvider] = useState('OpenAI');
    const [llmModel, setLlmModel] = useState('gpt-4o');
    const [sessionMode, setSessionMode] = useState<'single' | 'per-workflow' | 'per-execution'>('per-workflow');
    const [selectedTools, setSelectedTools] = useState<string[]>(['memory', 'web']);
    const [strategy, setStrategy] = useState<'template-repo' | 'base-image'>('template-repo');
    const [cluster, setCluster] = useState('prod-us-east-1');
    const [cpuLimit, setCpuLimit] = useState('500m');
    const [memoryLimit, setMemoryLimit] = useState('512Mi');

    const canNext = () => {
        if (currentStep === 1) return !!framework;
        if (currentStep === 2) return name.trim().length > 0;
        return true;
    };

    const toggleTool = (toolId: string) => {
        setSelectedTools(prev =>
            prev.includes(toolId) ? prev.filter(t => t !== toolId) : [...prev, toolId]
        );
    };

    const handleDeploy = () => {
        onOpenChange(false);
        setCurrentStep(1);
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Choose the agent framework for your standalone agent.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                onClick={() => setFramework('pi-agents')}
                                className={cn(
                                    'cursor-pointer rounded-lg border-2 p-5 transition-all',
                                    framework === 'pi-agents'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                )}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                                        <Bot className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">PI Agents</h4>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    KAYA&apos;s native agent framework with built-in A2A protocol support,
                                    session management, and deep platform integration.
                                </p>
                            </div>
                            <div
                                onClick={() => setFramework('openclaw')}
                                className={cn(
                                    'cursor-pointer rounded-lg border-2 p-5 transition-all',
                                    framework === 'openclaw'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                )}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                                        <Cog className="h-5 w-5 text-amber-500" />
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">OpenClaw</h4>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Open-source agent framework with flexible tool integration,
                                    multi-model support, and community-driven extensions.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <Input
                            label="Agent Name"
                            placeholder="e.g. Customer Support Agent"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                        <Textarea
                            label="Description"
                            placeholder="Describe what this agent does..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={2}
                        />
                        <Textarea
                            label="Instructions / System Prompt"
                            placeholder="You are a helpful agent that..."
                            value={instructions}
                            onChange={e => setInstructions(e.target.value)}
                            rows={3}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                    LLM Provider
                                </label>
                                <select
                                    value={llmProvider}
                                    onChange={e => setLlmProvider(e.target.value)}
                                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                                >
                                    <option value="OpenAI">OpenAI</option>
                                    <option value="Anthropic">Anthropic</option>
                                    <option value="Google">Google</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                    Model
                                </label>
                                <select
                                    value={llmModel}
                                    onChange={e => setLlmModel(e.target.value)}
                                    className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                                >
                                    <option value="gpt-4o">gpt-4o</option>
                                    <option value="gpt-4o-mini">gpt-4o-mini</option>
                                    <option value="claude-sonnet-4-20250514">claude-sonnet-4-20250514</option>
                                    <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Session Mode
                            </label>
                            <div className="flex gap-2">
                                {(['single', 'per-workflow', 'per-execution'] as const).map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setSessionMode(mode)}
                                        className={cn(
                                            'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                                            sessionMode === mode
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        )}
                                    >
                                        {mode.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Select the tools and capabilities for your agent.
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            {defaultTools.map(tool => {
                                const IconComponent = toolIcons[tool.icon] || Settings;
                                const isSelected = selectedTools.includes(tool.id);
                                return (
                                    <div
                                        key={tool.id}
                                        onClick={() => toggleTool(tool.id)}
                                        className={cn(
                                            'cursor-pointer rounded-lg border p-3 transition-all',
                                            isSelected
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <IconComponent className={cn('h-4 w-4', isSelected ? 'text-blue-500' : 'text-gray-400')} />
                                            <Switch
                                                checked={isSelected}
                                                onCheckedChange={() => toggleTool(tool.id)}
                                                className="scale-75"
                                            />
                                        </div>
                                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{tool.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tool.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Deployment Strategy
                            </label>
                            <div className="flex gap-3">
                                {([
                                    { value: 'template-repo' as const, label: 'Template Repository', desc: 'Clone from agent template repo' },
                                    { value: 'base-image' as const, label: 'Base Image', desc: 'Build from container base image' },
                                ]).map(opt => (
                                    <div
                                        key={opt.value}
                                        onClick={() => setStrategy(opt.value)}
                                        className={cn(
                                            'flex-1 cursor-pointer rounded-lg border-2 p-4 transition-all',
                                            strategy === opt.value
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                                                : 'border-gray-200 dark:border-gray-700'
                                        )}
                                    >
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{opt.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{opt.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                Kubernetes Cluster
                            </label>
                            <select
                                value={cluster}
                                onChange={e => setCluster(e.target.value)}
                                className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                            >
                                <option value="prod-us-east-1">prod-us-east-1</option>
                                <option value="prod-eu-west-1">prod-eu-west-1</option>
                                <option value="staging-us-east-1">staging-us-east-1</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="CPU Limit"
                                placeholder="e.g. 500m"
                                value={cpuLimit}
                                onChange={e => setCpuLimit(e.target.value)}
                            />
                            <Input
                                label="Memory Limit"
                                placeholder="e.g. 512Mi"
                                value={memoryLimit}
                                onChange={e => setMemoryLimit(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                Environment Variables
                            </label>
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2">
                                {[
                                    { key: 'AGENT_LOG_LEVEL', value: 'info' },
                                    { key: 'A2A_PORT', value: '8080' },
                                ].map((env, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            className="flex-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-2 py-1 text-xs text-gray-900 dark:text-gray-100 font-mono"
                                            defaultValue={env.key}
                                            placeholder="KEY"
                                        />
                                        <input
                                            className="flex-1 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-2 py-1 text-xs text-gray-900 dark:text-gray-100 font-mono"
                                            defaultValue={env.value}
                                            placeholder="VALUE"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Review your agent configuration before deploying.
                        </p>
                        <div className="space-y-3">
                            {[
                                { label: 'Framework', value: framework === 'pi-agents' ? 'PI Agents' : 'OpenClaw' },
                                { label: 'Name', value: name || '—' },
                                { label: 'Model', value: `${llmProvider} / ${llmModel}` },
                                { label: 'Session Mode', value: sessionMode.replace(/-/g, ' ') },
                                { label: 'Tools', value: `${selectedTools.length} selected` },
                                { label: 'Strategy', value: strategy === 'template-repo' ? 'Template Repository' : 'Base Image' },
                                { label: 'Cluster', value: cluster },
                                { label: 'Resources', value: `CPU: ${cpuLimit}, Memory: ${memoryLimit}` },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
                                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{item.value}</span>
                                </div>
                            ))}
                        </div>
                        {description && (
                            <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                                <p className="text-xs text-gray-700 dark:text-gray-300">{description}</p>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        <span className="text-sm">Create Standalone Agent</span>
                    </DialogTitle>
                    <div className="flex items-center gap-1 pt-3">
                        {steps.map((step, i) => (
                            <React.Fragment key={step.id}>
                                <div
                                    className={cn(
                                        'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all',
                                        currentStep === step.id
                                            ? 'bg-blue-500 text-white'
                                            : currentStep > step.id
                                            ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                    )}
                                >
                                    <step.icon className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">{step.label}</span>
                                </div>
                                {i < steps.length - 1 && (
                                    <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </DialogHeader>

                <DialogBody className="flex-1 overflow-y-auto py-4">
                    {renderStepContent()}
                </DialogBody>

                <DialogFooter>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => currentStep > 1 ? setCurrentStep(prev => prev - 1) : onOpenChange(false)}
                        leadingIcon={currentStep > 1 ? <ChevronLeft className="h-4 w-4" /> : undefined}
                    >
                        {currentStep > 1 ? 'Back' : 'Cancel'}
                    </Button>
                    {currentStep < 5 ? (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            disabled={!canNext()}
                            trailingIcon={<ChevronRight className="h-4 w-4" />}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button variant="primary" size="sm" onClick={handleDeploy}>
                            Deploy Agent
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
