'use client';

import React, { useState } from 'react';
import {
    Bot,
    CheckCircle2,
    ChevronRight,
    Code2,
    Cpu,
    Database,
    FileText,
    Globe,
    HardDrive,
    Mail,
    MemoryStick,
    Package,
    Server,
    Terminal,
    X,
    Zap,
    Calendar,
    PlaneTakeoff,
    Eye,
} from 'lucide-react';
import { Button, Input, Switch } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/atoms/dialog';

interface CreateAgentWizardProps {
    open: boolean;
    onClose: () => void;
}

const STEPS = [
    { id: 1, label: 'Framework', icon: Bot },
    { id: 2, label: 'Configuration', icon: FileText },
    { id: 3, label: 'Tools', icon: Zap },
    { id: 4, label: 'Deployment', icon: Server },
    { id: 5, label: 'Review', icon: CheckCircle2 },
];

const FRAMEWORKS = [
    {
        id: 'pi-agents',
        name: 'PI Agents',
        description: 'Kaya-native framework with built-in session management, observability, and enterprise tooling.',
        features: ['Native session memory', 'Built-in tracing', 'Enterprise auth', 'Hot reload'],
        color: 'blue',
    },
    {
        id: 'openclaw',
        name: 'OpenClaw',
        description: 'Open-source multi-agent orchestration framework. Flexible and community-driven.',
        features: ['Multi-agent coordination', 'Plugin ecosystem', 'LangChain compatible', 'Async-first'],
        color: 'purple',
    },
];

const TOOLS = [
    { id: 'shell', label: 'Shell Execution', icon: Terminal, description: 'Run shell commands in sandboxed env' },
    { id: 'code-exec', label: 'Code Executor', icon: Code2, description: 'Execute Python/JS/Go code snippets' },
    { id: 'file-ops', label: 'File Operations', icon: HardDrive, description: 'Read, write, and manage files' },
    { id: 'memory', label: 'Long-term Memory', icon: MemoryStick, description: 'Persist and retrieve knowledge' },
    { id: 'email', label: 'Email Integration', icon: Mail, description: 'Send and receive emails' },
    { id: 'web', label: 'Web Search', icon: Globe, description: 'Search the web for real-time info' },
    { id: 'browser', label: 'Browser Automation', icon: Eye, description: 'Scrape and automate web browsers' },
    { id: 'planning', label: 'Planning Engine', icon: PlaneTakeoff, description: 'Multi-step task planning' },
    { id: 'scheduling', label: 'Scheduler', icon: Calendar, description: 'Cron-based task scheduling' },
    { id: 'database', label: 'Database Query', icon: Database, description: 'Execute SQL and NoSQL queries' },
];

const K8S_CLUSTERS = ['prod-k8s-01', 'prod-k8s-02', 'staging-k8s-01', 'dev-k8s-01'];
const INTELLIGENCE_SOURCES = ['GPT-4o', 'Claude 3.5 Sonnet', 'Gemini 1.5 Pro', 'Llama 3.3 70B'];
const SESSION_MODES = [
    { id: 'single', label: 'Single', description: 'One session shared across all calls' },
    { id: 'per-workflow', label: 'Per-Workflow', description: 'New session per workflow execution' },
    { id: 'per-execution', label: 'Per-Execution', description: 'New session for every individual call' },
];

interface WizardState {
    framework: string;
    name: string;
    description: string;
    intelligenceSource: string;
    sessionMode: string;
    selectedTools: string[];
    deploymentType: 'template' | 'base-image';
    templateRepo: string;
    baseImage: string;
    cluster: string;
    namespace: string;
    cpuRequest: string;
    memoryRequest: string;
    cpuLimit: string;
    memoryLimit: string;
    replicas: string;
    envVars: Array<{ key: string; value: string }>;
}

const initialState: WizardState = {
    framework: '',
    name: '',
    description: '',
    intelligenceSource: 'GPT-4o',
    sessionMode: 'per-workflow',
    selectedTools: ['shell', 'web'],
    deploymentType: 'template',
    templateRepo: 'github.com/kayatech/agent-template-pi',
    baseImage: 'kayatech/agent-base:latest',
    cluster: 'prod-k8s-01',
    namespace: 'agents',
    cpuRequest: '250m',
    memoryRequest: '512Mi',
    cpuLimit: '1000m',
    memoryLimit: '2Gi',
    replicas: '2',
    envVars: [{ key: 'LOG_LEVEL', value: 'info' }],
};

export const CreateAgentWizard = ({ open, onClose }: CreateAgentWizardProps) => {
    const [step, setStep] = useState(1);
    const [state, setState] = useState<WizardState>(initialState);

    const update = (patch: Partial<WizardState>) => setState(s => ({ ...s, ...patch }));

    const canProceed = () => {
        if (step === 1) return !!state.framework;
        if (step === 2) return !!state.name.trim() && !!state.intelligenceSource;
        if (step === 3) return true;
        if (step === 4) return !!state.cluster && !!state.namespace;
        return true;
    };

    const handleNext = () => { if (canProceed() && step < 5) setStep(s => s + 1); };
    const handleBack = () => { if (step > 1) setStep(s => s - 1); };

    const toggleTool = (id: string) => {
        update({
            selectedTools: state.selectedTools.includes(id)
                ? state.selectedTools.filter(t => t !== id)
                : [...state.selectedTools, id],
        });
    };

    const addEnvVar = () => update({ envVars: [...state.envVars, { key: '', value: '' }] });
    const removeEnvVar = (i: number) => update({ envVars: state.envVars.filter((_, idx) => idx !== i) });
    const updateEnvVar = (i: number, field: 'key' | 'value', val: string) => {
        const next = state.envVars.map((e, idx) => idx === i ? { ...e, [field]: val } : e);
        update({ envVars: next });
    };

    const labelClass = 'text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1';
    const inputClass = 'w-full text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500';

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl w-full p-0 overflow-hidden" hideCloseButtonClass="hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Create Standalone Agent</h2>
                        <p className="text-xs text-gray-500">Step {step} of {STEPS.length}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={18} />
                    </button>
                </div>

                {/* Step indicators */}
                <div className="flex items-center px-6 pt-4 pb-2">
                    {STEPS.map((s, idx) => (
                        <React.Fragment key={s.id}>
                            <div
                                className={cn('flex items-center gap-x-1.5 cursor-pointer', idx + 1 <= step ? 'opacity-100' : 'opacity-40')}
                                onClick={() => idx + 1 < step && setStep(idx + 1)}
                            >
                                <div className={cn(
                                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0',
                                    step === s.id
                                        ? 'bg-blue-600 text-white'
                                        : s.id < step
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                )}>
                                    {s.id < step ? <CheckCircle2 size={12} /> : s.id}
                                </div>
                                <span className={cn('text-xs font-medium hidden sm:block', step === s.id ? 'text-blue-600' : 'text-gray-500')}>
                                    {s.label}
                                </span>
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div className={cn('flex-1 h-px mx-2', idx + 1 < step ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700')} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step Content */}
                <div className="px-6 py-4 overflow-y-auto max-h-[55vh]">
                    {/* Step 1: Framework */}
                    {step === 1 && (
                        <div className="flex flex-col gap-y-3">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Select Agent Framework</p>
                            {FRAMEWORKS.map(fw => (
                                <div
                                    key={fw.id}
                                    onClick={() => update({ framework: fw.id })}
                                    className={cn(
                                        'border rounded-xl p-4 cursor-pointer transition-all',
                                        state.framework === fw.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                    )}
                                >
                                    <div className="flex items-start gap-x-3">
                                        <div className={cn(
                                            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                                            fw.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-purple-100 dark:bg-purple-900/40'
                                        )}>
                                            <Bot size={20} className={fw.color === 'blue' ? 'text-blue-600' : 'text-purple-600'} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{fw.name}</p>
                                                {state.framework === fw.id && <CheckCircle2 size={16} className="text-blue-500" />}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{fw.description}</p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {fw.features.map(f => (
                                                    <span key={f} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{f}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 2: Configuration */}
                    {step === 2 && (
                        <div className="flex flex-col gap-y-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Agent Configuration</p>
                            <div>
                                <p className={labelClass}>Agent Name *</p>
                                <input
                                    className={inputClass}
                                    placeholder="e.g. Customer Support Bot"
                                    value={state.name}
                                    onChange={e => update({ name: e.target.value })}
                                />
                            </div>
                            <div>
                                <p className={labelClass}>Description</p>
                                <textarea
                                    className={cn(inputClass, 'resize-none h-20')}
                                    placeholder="Describe what this agent does..."
                                    value={state.description}
                                    onChange={e => update({ description: e.target.value })}
                                />
                            </div>
                            <div>
                                <p className={labelClass}>Intelligence Source *</p>
                                <select className={inputClass} value={state.intelligenceSource} onChange={e => update({ intelligenceSource: e.target.value })}>
                                    {INTELLIGENCE_SOURCES.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <p className={labelClass}>Session Mode</p>
                                <div className="flex flex-col gap-y-2">
                                    {SESSION_MODES.map(sm => (
                                        <label key={sm.id} className={cn(
                                            'flex items-center gap-x-3 p-3 rounded-lg border cursor-pointer transition-colors',
                                            state.sessionMode === sm.id
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700'
                                        )}>
                                            <input
                                                type="radio"
                                                name="sessionMode"
                                                value={sm.id}
                                                checked={state.sessionMode === sm.id}
                                                onChange={() => update({ sessionMode: sm.id })}
                                                className="accent-blue-600"
                                            />
                                            <div>
                                                <p className="text-xs font-medium text-gray-700 dark:text-gray-200">{sm.label}</p>
                                                <p className="text-xs text-gray-500">{sm.description}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Tools */}
                    {step === 3 && (
                        <div className="flex flex-col gap-y-3">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Select Agent Tools</p>
                            <p className="text-xs text-gray-500 -mt-1">
                                {state.selectedTools.length} tool{state.selectedTools.length !== 1 ? 's' : ''} selected
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {TOOLS.map(tool => {
                                    const Icon = tool.icon;
                                    const selected = state.selectedTools.includes(tool.id);
                                    return (
                                        <div
                                            key={tool.id}
                                            onClick={() => toggleTool(tool.id)}
                                            className={cn(
                                                'flex items-start gap-x-2.5 p-3 rounded-lg border cursor-pointer transition-all',
                                                selected
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                            )}
                                        >
                                            <div className={cn(
                                                'w-7 h-7 rounded flex items-center justify-center flex-shrink-0',
                                                selected ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-700'
                                            )}>
                                                <Icon size={14} className={selected ? 'text-white' : 'text-gray-500'} />
                                            </div>
                                            <div>
                                                <p className={cn('text-xs font-medium', selected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300')}>
                                                    {tool.label}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">{tool.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Deployment */}
                    {step === 4 && (
                        <div className="flex flex-col gap-y-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Deployment Configuration</p>

                            {/* Deployment type */}
                            <div>
                                <p className={labelClass}>Deployment Source</p>
                                <div className="flex gap-x-2">
                                    {(['template', 'base-image'] as const).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => update({ deploymentType: t })}
                                            className={cn(
                                                'flex-1 py-2 text-xs font-medium rounded-lg border transition-colors',
                                                state.deploymentType === t
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                            )}
                                        >
                                            {t === 'template' ? 'Template Repo' : 'Base Image'}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-2">
                                    {state.deploymentType === 'template' ? (
                                        <input className={inputClass} placeholder="github.com/org/template" value={state.templateRepo} onChange={e => update({ templateRepo: e.target.value })} />
                                    ) : (
                                        <input className={inputClass} placeholder="registry/image:tag" value={state.baseImage} onChange={e => update({ baseImage: e.target.value })} />
                                    )}
                                </div>
                            </div>

                            {/* K8s Config */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className={labelClass}>K8s Cluster *</p>
                                    <select className={inputClass} value={state.cluster} onChange={e => update({ cluster: e.target.value })}>
                                        {K8S_CLUSTERS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <p className={labelClass}>Namespace *</p>
                                    <input className={inputClass} placeholder="agents" value={state.namespace} onChange={e => update({ namespace: e.target.value })} />
                                </div>
                                <div>
                                    <p className={labelClass}>Replicas</p>
                                    <input type="number" min="1" max="20" className={inputClass} value={state.replicas} onChange={e => update({ replicas: e.target.value })} />
                                </div>
                            </div>

                            {/* Resources */}
                            <div>
                                <p className={labelClass}>Resource Limits</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">CPU Request</p>
                                        <input className={inputClass} placeholder="250m" value={state.cpuRequest} onChange={e => update({ cpuRequest: e.target.value })} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">CPU Limit</p>
                                        <input className={inputClass} placeholder="1000m" value={state.cpuLimit} onChange={e => update({ cpuLimit: e.target.value })} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Memory Request</p>
                                        <input className={inputClass} placeholder="512Mi" value={state.memoryRequest} onChange={e => update({ memoryRequest: e.target.value })} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Memory Limit</p>
                                        <input className={inputClass} placeholder="2Gi" value={state.memoryLimit} onChange={e => update({ memoryLimit: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Env vars */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className={labelClass}>Environment Variables</p>
                                    <button onClick={addEnvVar} className="text-xs text-blue-600 hover:text-blue-500">+ Add</button>
                                </div>
                                <div className="flex flex-col gap-y-1.5">
                                    {state.envVars.map((ev, i) => (
                                        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-x-2 items-center">
                                            <input className={inputClass} placeholder="KEY" value={ev.key} onChange={e => updateEnvVar(i, 'key', e.target.value)} />
                                            <input className={inputClass} placeholder="value" value={ev.value} onChange={e => updateEnvVar(i, 'value', e.target.value)} />
                                            <button onClick={() => removeEnvVar(i)} className="text-red-400 hover:text-red-500 text-xs">✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review */}
                    {step === 5 && (
                        <div className="flex flex-col gap-y-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Review & Deploy</p>

                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex flex-col gap-y-3">
                                <ReviewRow label="Framework" value={state.framework === 'pi-agents' ? 'PI Agents' : 'OpenClaw'} />
                                <ReviewRow label="Name" value={state.name} />
                                <ReviewRow label="Intelligence Source" value={state.intelligenceSource} />
                                <ReviewRow label="Session Mode" value={state.sessionMode} />
                                <ReviewRow label="Tools" value={`${state.selectedTools.length} tools selected`} />
                                <ReviewRow label="Cluster" value={`${state.cluster} / ${state.namespace}`} />
                                <ReviewRow label="Replicas" value={state.replicas} />
                                <ReviewRow label="Resources" value={`CPU: ${state.cpuRequest}-${state.cpuLimit} | Mem: ${state.memoryRequest}-${state.memoryLimit}`} />
                                <ReviewRow label="Deployment" value={state.deploymentType === 'template' ? state.templateRepo : state.baseImage} />
                            </div>

                            <div className="flex items-center gap-x-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
                                <Package size={16} className="text-amber-600 flex-shrink-0" />
                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                    Deploying this agent will provision a K8s deployment to <strong>{state.cluster}</strong>. This action may take 2-5 minutes.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <Button variant="secondary" size="sm" onClick={step === 1 ? onClose : handleBack}>
                        {step === 1 ? 'Cancel' : 'Back'}
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={step === 5 ? onClose : handleNext}
                        disabled={!canProceed()}
                        trailingIcon={step < 5 ? <ChevronRight size={14} /> : undefined}
                    >
                        {step === 5 ? 'Deploy Agent' : 'Next'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-200 text-right max-w-[60%] truncate">{value || '—'}</span>
    </div>
);
