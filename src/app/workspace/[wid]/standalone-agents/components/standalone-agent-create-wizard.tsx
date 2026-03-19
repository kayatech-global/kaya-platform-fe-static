'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { Button } from '@/components';
import { Input } from '@/components';
import { Label } from '@/components/atoms/label';
import { Badge } from '@/components/atoms/badge';
import { Textarea } from '@/components/atoms/textarea';
import {
    SelectV2 as Select,
    SelectContentV2 as SelectContent,
    SelectItemV2 as SelectItem,
    SelectTriggerV2 as SelectTrigger,
    SelectValueV2 as SelectValue,
} from '@/components/atoms/select-v2';
import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group';
import { Checkbox } from '@/components/atoms/checkbox';
import { cn } from '@/lib/utils';
import { Check, Bot, Zap, Plus, Trash2, ChevronRight, ChevronLeft, Pencil } from 'lucide-react';

interface CreateAgentWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const STEPS = [
    { id: 1, label: 'Framework' },
    { id: 2, label: 'Basic Config' },
    { id: 3, label: 'Tools' },
    { id: 4, label: 'Deployment' },
    { id: 5, label: 'Review' },
];

const AVAILABLE_TOOLS = [
    { id: 'shell', label: 'Shell Execution', description: 'Run shell commands in a sandboxed environment' },
    { id: 'code-exec', label: 'Code Execution', description: 'Execute Python/JS code snippets' },
    { id: 'file-tools', label: 'File Tools', description: 'Read, write, and manage files' },
    { id: 'memory', label: 'Memory', description: 'Persistent short and long-term memory' },
    { id: 'email', label: 'Email', description: 'Send and receive email messages' },
    { id: 'web-browse', label: 'Web Browse', description: 'Fetch and parse web pages' },
    { id: 'browser-use', label: 'Browser Use', description: 'Full browser automation with Playwright' },
];

const AVAILABLE_CONNECTORS = [
    { id: 'slack', label: 'Slack Connector' },
    { id: 'zendesk', label: 'Zendesk Connector' },
    { id: 'github', label: 'GitHub Connector' },
    { id: 'gmail', label: 'Gmail Connector' },
    { id: 'notion', label: 'Notion Connector' },
    { id: 'postgres', label: 'PostgreSQL Connector' },
    { id: 's3', label: 'S3 Connector' },
];

const MODELS = [
    'gpt-4o',
    'gpt-4o-mini',
    'claude-3-5-sonnet',
    'claude-3-haiku',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'llama-3-70b',
];

interface WizardState {
    framework: 'PI Agents' | 'OpenClaw' | '';
    name: string;
    description: string;
    systemPrompt: string;
    model: string;
    tools: string[];
    connectors: string[];
    image: string;
    cpu: string;
    memory: string;
    replicas: number;
    envVars: { key: string; value: string }[];
    sessionMode: 'single' | 'per-workflow' | 'per-execution';
}

const initialState: WizardState = {
    framework: '',
    name: '',
    description: '',
    systemPrompt: '',
    model: 'gpt-4o',
    tools: [],
    connectors: [],
    image: 'kayatech/pi-agent-runtime:latest',
    cpu: '500m',
    memory: '512Mi',
    replicas: 1,
    envVars: [{ key: '', value: '' }],
    sessionMode: 'per-workflow',
};

export const CreateAgentWizard = ({ open, onOpenChange }: CreateAgentWizardProps) => {
    const [step, setStep] = useState(1);
    const [state, setState] = useState<WizardState>(initialState);

    const updateState = (partial: Partial<WizardState>) => {
        setState(prev => ({ ...prev, ...partial }));
    };

    const toggleTool = (id: string) => {
        setState(prev => ({
            ...prev,
            tools: prev.tools.includes(id) ? prev.tools.filter(t => t !== id) : [...prev.tools, id],
        }));
    };

    const toggleConnector = (id: string) => {
        setState(prev => ({
            ...prev,
            connectors: prev.connectors.includes(id)
                ? prev.connectors.filter(c => c !== id)
                : [...prev.connectors, id],
        }));
    };

    const addEnvVar = () => {
        setState(prev => ({ ...prev, envVars: [...prev.envVars, { key: '', value: '' }] }));
    };

    const removeEnvVar = (index: number) => {
        setState(prev => ({ ...prev, envVars: prev.envVars.filter((_, i) => i !== index) }));
    };

    const updateEnvVar = (index: number, field: 'key' | 'value', value: string) => {
        setState(prev => {
            const updated = [...prev.envVars];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, envVars: updated };
        });
    };

    const handleClose = () => {
        setStep(1);
        setState(initialState);
        onOpenChange(false);
    };

    const handleCreate = () => {
        handleClose();
    };

    const canNext = () => {
        if (step === 1) return !!state.framework;
        if (step === 2) return !!state.name && !!state.model;
        return true;
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">Create Standalone Agent</DialogTitle>
                </DialogHeader>

                {/* Step indicator */}
                <div className="flex items-center gap-1 py-2">
                    {STEPS.map((s, index) => (
                        <React.Fragment key={s.id}>
                            <button
                                onClick={() => s.id < step && setStep(s.id)}
                                className={cn(
                                    'flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors',
                                    step === s.id
                                        ? 'bg-blue-500/15 text-blue-400'
                                        : s.id < step
                                        ? 'text-green-400 cursor-pointer hover:bg-green-500/10'
                                        : 'text-muted-foreground cursor-default'
                                )}
                            >
                                {s.id < step ? (
                                    <Check size={12} />
                                ) : (
                                    <span className={cn(
                                        'w-4 h-4 rounded-full flex items-center justify-center text-[10px] border',
                                        step === s.id ? 'border-blue-400 text-blue-400' : 'border-muted-foreground'
                                    )}>
                                        {s.id}
                                    </span>
                                )}
                                {s.label}
                            </button>
                            {index < STEPS.length - 1 && (
                                <div className={cn('flex-1 h-px', step > s.id ? 'bg-green-500/40' : 'bg-border')} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="min-h-[320px] py-2">
                    {/* Step 1: Framework Selection */}
                    {step === 1 && (
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                Select the agent runtime framework for this standalone agent.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(['PI Agents', 'OpenClaw'] as const).map(fw => (
                                    <button
                                        key={fw}
                                        onClick={() => updateState({ framework: fw })}
                                        className={cn(
                                            'text-left p-5 rounded-lg border-2 transition-all',
                                            state.framework === fw
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-border bg-card hover:border-blue-500/40'
                                        )}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={cn(
                                                'p-2 rounded-lg',
                                                fw === 'PI Agents' ? 'bg-blue-500/15' : 'bg-purple-500/15'
                                            )}>
                                                <Bot size={20} className={fw === 'PI Agents' ? 'text-blue-400' : 'text-purple-400'} />
                                            </div>
                                            <span className="font-semibold text-sm text-foreground">{fw}</span>
                                            {state.framework === fw && (
                                                <Check size={16} className="ml-auto text-blue-400" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {fw === 'PI Agents'
                                                ? 'KAYA native agent runtime with built-in A2A protocol support, memory management, and tight workflow integration.'
                                                : 'OpenClaw open-source runtime with flexible tool integration, multi-model support, and ACP protocol compatibility.'}
                                        </p>
                                        <div className="mt-3 flex gap-1 flex-wrap">
                                            {(fw === 'PI Agents'
                                                ? ['A2A', 'Memory', 'Workflow-native']
                                                : ['ACP', 'Multi-model', 'Open-source']
                                            ).map(tag => (
                                                <span key={tag} className={cn(
                                                    'text-[10px] px-1.5 py-0.5 rounded border',
                                                    fw === 'PI Agents'
                                                        ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                                                        : 'border-purple-500/30 text-purple-400 bg-purple-500/10'
                                                )}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Basic Config */}
                    {step === 2 && (
                        <div className="flex flex-col gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="agent-name" className="text-xs font-medium">Agent Name <span className="text-red-400">*</span></Label>
                                <Input
                                    id="agent-name"
                                    placeholder="e.g. Customer Support Agent"
                                    value={state.name}
                                    onChange={e => updateState({ name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="agent-desc" className="text-xs font-medium">Description</Label>
                                <Input
                                    id="agent-desc"
                                    placeholder="Brief description of what this agent does"
                                    value={state.description}
                                    onChange={e => updateState({ description: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="system-prompt" className="text-xs font-medium">System Prompt</Label>
                                <Textarea
                                    id="system-prompt"
                                    placeholder="You are a helpful assistant..."
                                    rows={4}
                                    value={state.systemPrompt}
                                    onChange={e => updateState({ systemPrompt: e.target.value })}
                                    className="resize-none text-sm"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs font-medium">Model <span className="text-red-400">*</span></Label>
                                <Select value={state.model} onValueChange={v => updateState({ model: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MODELS.map(m => (
                                            <SelectItem key={m} value={m}>{m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Tools & Connectors */}
                    {step === 3 && (
                        <div className="flex flex-col gap-5">
                            <div>
                                <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Tools</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {AVAILABLE_TOOLS.map(tool => (
                                        <label
                                            key={tool.id}
                                            className={cn(
                                                'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                                                state.tools.includes(tool.id)
                                                    ? 'border-blue-500/40 bg-blue-500/8'
                                                    : 'border-border hover:border-border/80'
                                            )}
                                        >
                                            <Checkbox
                                                checked={state.tools.includes(tool.id)}
                                                onCheckedChange={() => toggleTool(tool.id)}
                                                className="mt-0.5"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-foreground">{tool.label}</p>
                                                <p className="text-xs text-muted-foreground">{tool.description}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Connectors</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {AVAILABLE_CONNECTORS.map(conn => (
                                        <label
                                            key={conn.id}
                                            className={cn(
                                                'flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors',
                                                state.connectors.includes(conn.id)
                                                    ? 'border-blue-500/40 bg-blue-500/8 text-blue-400'
                                                    : 'border-border text-muted-foreground hover:border-border/80'
                                            )}
                                        >
                                            <Checkbox
                                                checked={state.connectors.includes(conn.id)}
                                                onCheckedChange={() => toggleConnector(conn.id)}
                                            />
                                            {conn.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Deployment Config */}
                    {step === 4 && (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 grid gap-2">
                                    <Label className="text-xs font-medium">Container Image</Label>
                                    <Input
                                        placeholder="kayatech/pi-agent-runtime:latest"
                                        value={state.image}
                                        onChange={e => updateState({ image: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-medium">CPU Request</Label>
                                    <Input
                                        placeholder="500m"
                                        value={state.cpu}
                                        onChange={e => updateState({ cpu: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-medium">Memory Limit</Label>
                                    <Input
                                        placeholder="512Mi"
                                        value={state.memory}
                                        onChange={e => updateState({ memory: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-medium">Replicas</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={state.replicas}
                                        onChange={e => updateState({ replicas: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-xs font-medium">Session Management Mode</Label>
                                <RadioGroup
                                    value={state.sessionMode}
                                    onValueChange={v => updateState({ sessionMode: v as WizardState['sessionMode'] })}
                                    className="flex flex-col gap-2"
                                >
                                    {[
                                        { value: 'single', label: 'Single', desc: 'One shared session for all invocations' },
                                        { value: 'per-workflow', label: 'Per Workflow', desc: 'New session for each workflow run' },
                                        { value: 'per-execution', label: 'Per Execution', desc: 'New session for each individual node execution' },
                                    ].map(opt => (
                                        <label key={opt.value} className={cn(
                                            'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                                            state.sessionMode === opt.value ? 'border-blue-500/40 bg-blue-500/8' : 'border-border'
                                        )}>
                                            <RadioGroupItem value={opt.value} className="mt-0.5" />
                                            <div>
                                                <p className="text-xs font-medium text-foreground">{opt.label}</p>
                                                <p className="text-xs text-muted-foreground">{opt.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </RadioGroup>
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-medium">Environment Variables</Label>
                                    <Button variant="ghost" size="sm" onClick={addEnvVar} className="h-7 text-xs gap-1">
                                        <Plus size={12} /> Add
                                    </Button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {state.envVars.map((env, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                placeholder="KEY"
                                                value={env.key}
                                                onChange={e => updateEnvVar(index, 'key', e.target.value)}
                                                className="font-mono text-xs"
                                            />
                                            <Input
                                                placeholder="value"
                                                value={env.value}
                                                onChange={e => updateEnvVar(index, 'value', e.target.value)}
                                                className="font-mono text-xs"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeEnvVar(index)}
                                                className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-red-400"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review */}
                    {step === 5 && (
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">Review your configuration before creating the agent.</p>

                            {[
                                {
                                    title: 'Framework',
                                    goTo: 1,
                                    content: (
                                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                                            {state.framework}
                                        </Badge>
                                    ),
                                },
                                {
                                    title: 'Basic Config',
                                    goTo: 2,
                                    content: (
                                        <div className="text-xs text-muted-foreground flex flex-col gap-1">
                                            <span><span className="text-foreground/70 font-medium">Name:</span> {state.name || '—'}</span>
                                            <span><span className="text-foreground/70 font-medium">Model:</span> {state.model}</span>
                                            {state.description && <span><span className="text-foreground/70 font-medium">Description:</span> {state.description}</span>}
                                        </div>
                                    ),
                                },
                                {
                                    title: 'Tools & Connectors',
                                    goTo: 3,
                                    content: (
                                        <div className="flex flex-wrap gap-1">
                                            {state.tools.length === 0 && state.connectors.length === 0 && (
                                                <span className="text-xs text-muted-foreground">None selected</span>
                                            )}
                                            {state.tools.map(t => (
                                                <Badge key={t} variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                                                    {AVAILABLE_TOOLS.find(x => x.id === t)?.label}
                                                </Badge>
                                            ))}
                                            {state.connectors.map(c => (
                                                <Badge key={c} variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
                                                    {AVAILABLE_CONNECTORS.find(x => x.id === c)?.label}
                                                </Badge>
                                            ))}
                                        </div>
                                    ),
                                },
                                {
                                    title: 'Deployment',
                                    goTo: 4,
                                    content: (
                                        <div className="text-xs text-muted-foreground flex flex-col gap-1">
                                            <span><span className="text-foreground/70 font-medium">Image:</span> {state.image}</span>
                                            <span><span className="text-foreground/70 font-medium">CPU:</span> {state.cpu} &nbsp;&bull;&nbsp; <span className="text-foreground/70 font-medium">Memory:</span> {state.memory}</span>
                                            <span><span className="text-foreground/70 font-medium">Replicas:</span> {state.replicas} &nbsp;&bull;&nbsp; <span className="text-foreground/70 font-medium">Session:</span> {state.sessionMode}</span>
                                        </div>
                                    ),
                                },
                            ].map(section => (
                                <div key={section.title} className="p-4 rounded-lg border border-border bg-muted/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-semibold text-foreground">{section.title}</p>
                                        <button
                                            onClick={() => setStep(section.goTo)}
                                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                        >
                                            <Pencil size={10} /> Edit
                                        </button>
                                    </div>
                                    {section.content}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={step === 1 ? handleClose : () => setStep(step - 1)}
                        className="gap-1"
                    >
                        {step === 1 ? 'Cancel' : <><ChevronLeft size={14} /> Back</>}
                    </Button>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Step {step} of {STEPS.length}</span>
                        {step < STEPS.length ? (
                            <Button
                                size="sm"
                                onClick={() => setStep(step + 1)}
                                disabled={!canNext()}
                                className="gap-1"
                            >
                                Next <ChevronRight size={14} />
                            </Button>
                        ) : (
                            <Button size="sm" onClick={handleCreate} className="gap-1">
                                <Zap size={14} /> Create Agent
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
