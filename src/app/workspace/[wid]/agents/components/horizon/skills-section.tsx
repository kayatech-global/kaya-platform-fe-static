'use client';

import { Input, Textarea, Button, Label, Checkbox, Badge } from '@/components';
import { cn } from '@/lib/utils';
import { IAgentForm, IHorizonSkill, IOMode, IConnectorForm } from '@/models';
import { Zap, Plus, Trash2, ChevronDown, ChevronUp, Tag, X, Link2 } from 'lucide-react';
import { Control, Controller, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface SkillsSectionProps {
    control: Control<IAgentForm>;
    watch: UseFormWatch<IAgentForm>;
    setValue: UseFormSetValue<IAgentForm>;
    errors?: FieldErrors<IAgentForm>;
    isReadOnly?: boolean;
    connectors?: IConnectorForm[];
}

const ioModeOptions: { label: string; value: IOMode }[] = [
    { label: 'Text', value: 'text' },
    { label: 'Structured', value: 'structured' },
    { label: 'Streaming', value: 'streaming' },
];

const defaultSkill: Omit<IHorizonSkill, 'id'> = {
    name: '',
    description: '',
    tags: [],
    examples: [],
    ioModes: ['text'],
    version: '1.0.0',
};

export const SkillsSection = ({ control, watch, setValue, errors, isReadOnly, connectors = [] }: SkillsSectionProps) => {
    const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
    const [newTag, setNewTag] = useState<Record<string, string>>({});
    const [newExample, setNewExample] = useState<Record<string, string>>({});

    const skills = watch('horizonConfig.skills') || [];

    // Create a skill from a connector
    const createSkillFromConnector = useCallback((connector: IConnectorForm): IHorizonSkill => {
        return {
            id: `connector-${connector.id}`,
            name: connector.name || 'Unnamed Connector',
            description: connector.description || `Data connector skill for ${connector.name}`,
            tags: ['data-connector', connector.type || 'connector'],
            examples: [`Retrieve data using ${connector.name}`],
            ioModes: ['structured'] as IOMode[],
            version: '1.0.0',
            inputConnectorMapping: { connectorId: connector.id || '' },
        };
    }, []);

    // Sync skills with connectors - auto-populate skills from connectors
    useEffect(() => {
        if (connectors.length === 0) return;

        const existingConnectorSkillIds = new Set(
            skills
                .filter((s) => s.id.startsWith('connector-'))
                .map((s) => s.id.replace('connector-', ''))
        );

        const connectorIds = new Set(connectors.map((c) => c.id));
        
        // Find connectors that don't have corresponding skills
        const newConnectorSkills = connectors
            .filter((c) => c.id && !existingConnectorSkillIds.has(c.id))
            .map(createSkillFromConnector);

        // Find skills that no longer have corresponding connectors (to remove)
        const orphanedSkillIds = skills
            .filter((s) => s.id.startsWith('connector-'))
            .filter((s) => !connectorIds.has(s.id.replace('connector-', '')))
            .map((s) => s.id);

        if (newConnectorSkills.length > 0 || orphanedSkillIds.length > 0) {
            const updatedSkills = [
                ...skills.filter((s) => !orphanedSkillIds.includes(s.id)),
                ...newConnectorSkills,
            ];
            setValue('horizonConfig.skills', updatedSkills);
        }
    }, [connectors, skills, setValue, createSkillFromConnector]);

    // Check if a skill is auto-generated from a connector
    const isConnectorSkill = (skillId: string) => skillId.startsWith('connector-');

    const toggleSkill = (skillId: string) => {
        const newExpanded = new Set(expandedSkills);
        if (newExpanded.has(skillId)) {
            newExpanded.delete(skillId);
        } else {
            newExpanded.add(skillId);
        }
        setExpandedSkills(newExpanded);
    };

    const addSkill = () => {
        const newSkillId = uuidv4();
        const newSkill: IHorizonSkill = {
            ...defaultSkill,
            id: newSkillId,
        };
        setValue('horizonConfig.skills', [...skills, newSkill]);
        setExpandedSkills(new Set([...expandedSkills, newSkillId]));
    };

    const removeSkill = (skillId: string) => {
        setValue(
            'horizonConfig.skills',
            skills.filter((s) => s.id !== skillId)
        );
        const newExpanded = new Set(expandedSkills);
        newExpanded.delete(skillId);
        setExpandedSkills(newExpanded);
    };

    const updateSkill = (skillId: string, updates: Partial<IHorizonSkill>) => {
        setValue(
            'horizonConfig.skills',
            skills.map((s) => (s.id === skillId ? { ...s, ...updates } : s))
        );
    };

    const addTag = (skillId: string) => {
        const tag = newTag[skillId]?.trim();
        if (tag) {
            const skill = skills.find((s) => s.id === skillId);
            if (skill && !skill.tags.includes(tag)) {
                updateSkill(skillId, { tags: [...skill.tags, tag] });
            }
            setNewTag({ ...newTag, [skillId]: '' });
        }
    };

    const removeTag = (skillId: string, tag: string) => {
        const skill = skills.find((s) => s.id === skillId);
        if (skill) {
            updateSkill(skillId, { tags: skill.tags.filter((t) => t !== tag) });
        }
    };

    const addExample = (skillId: string) => {
        const example = newExample[skillId]?.trim();
        if (example) {
            const skill = skills.find((s) => s.id === skillId);
            if (skill) {
                updateSkill(skillId, { examples: [...skill.examples, example] });
            }
            setNewExample({ ...newExample, [skillId]: '' });
        }
    };

    const removeExample = (skillId: string, index: number) => {
        const skill = skills.find((s) => s.id === skillId);
        if (skill) {
            updateSkill(skillId, { examples: skill.examples.filter((_, i) => i !== index) });
        }
    };

    const toggleIoMode = (skillId: string, mode: IOMode) => {
        const skill = skills.find((s) => s.id === skillId);
        if (skill) {
            const newModes = skill.ioModes.includes(mode)
                ? skill.ioModes.filter((m) => m !== mode)
                : [...skill.ioModes, mode];
            updateSkill(skillId, { ioModes: newModes.length > 0 ? newModes : ['text'] });
        }
    };

    return (
        <div className="col-span-1 sm:col-span-2 border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-4">
            <div className="flex flex-col gap-y-4">
                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-[10px]">
                        <Zap size={20} absoluteStrokeWidth={false} className="stroke-[1px]" />
                        <p className="text-sm font-medium">Skills Metadata</p>
                    </div>
                    <p className="text-xs font-normal text-gray-400">
                        Skills are automatically generated from Input Data Connects.
                    </p>
                </div>

                {/* Skills List */}
                {skills.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center bg-gray-50 dark:bg-gray-800">
                        <Zap size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No skills configured yet.</p>
                        <p className="text-xs text-gray-400 mt-1">
                            Skills are automatically generated from Input Data Connects.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-y-3">
                        {skills.map((skill, index) => (
                            <div
                                key={skill.id}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                            >
                                {/* Skill Header */}
                                <div
                                    className={cn(
                                        'flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                                        expandedSkills.has(skill.id) && 'bg-gray-50 dark:bg-gray-800'
                                    )}
                                    onClick={() => toggleSkill(skill.id)}
                                >
<div className="flex items-center gap-x-3">
                                                        {expandedSkills.has(skill.id) ? (
                                                            <ChevronUp size={16} className="text-gray-400" />
                                                        ) : (
                                                            <ChevronDown size={16} className="text-gray-400" />
                                                        )}
                                                        <div>
                                                            <div className="flex items-center gap-x-2">
                                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                                    {skill.name || `Skill ${index + 1}`}
                                                                </p>
                                                                {isConnectorSkill(skill.id) && (
                                                                    <Badge 
                                                                        variant="secondary" 
                                                                        className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                                    >
                                                                        <Link2 size={10} className="mr-1" />
                                                                        Data Connect
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-400">
                                                                v{skill.version} | {skill.ioModes.join(', ')}
                                                            </p>
                                                        </div>
                                                    </div>
{!isReadOnly && !isConnectorSkill(skill.id) && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeSkill(skill.id);
                                                            }}
                                                            className="text-gray-400 hover:text-red-500"
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    )}
                                </div>

                                {/* Skill Details */}
                                {expandedSkills.has(skill.id) && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Skill Name */}
                                            <Input
                                                label="Skill Name"
                                                placeholder="Enter skill name"
                                                value={skill.name}
                                                disabled={isReadOnly}
                                                onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                                            />

                                            {/* Version */}
                                            <Input
                                                label="Version"
                                                placeholder="1.0.0"
                                                value={skill.version}
                                                disabled={isReadOnly}
                                                onChange={(e) => updateSkill(skill.id, { version: e.target.value })}
                                            />

                                            {/* Description */}
                                            <div className="col-span-1 sm:col-span-2">
                                                <Textarea
                                                    label="Description"
                                                    placeholder="Describe what this skill does"
                                                    value={skill.description}
                                                    disabled={isReadOnly}
                                                    onChange={(e) =>
                                                        updateSkill(skill.id, { description: e.target.value })
                                                    }
                                                    rows={2}
                                                    className="w-full resize-none"
                                                />
                                            </div>

                                            {/* IO Modes */}
                                            <div className="col-span-1 sm:col-span-2">
                                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                    IO Modes
                                                </Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {ioModeOptions.map((mode) => (
                                                        <label
                                                            key={mode.value}
                                                            className="flex items-center gap-x-2 cursor-pointer"
                                                        >
                                                            <Checkbox
                                                                checked={skill.ioModes.includes(mode.value)}
                                                                disabled={isReadOnly}
                                                                onCheckedChange={() =>
                                                                    toggleIoMode(skill.id, mode.value)
                                                                }
                                                            />
                                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                                {mode.label}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div className="col-span-1 sm:col-span-2">
                                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                    Tags
                                                </Label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {skill.tags.map((tag) => (
                                                        <Badge
                                                            key={tag}
                                                            variant="secondary"
                                                            className="flex items-center gap-x-1"
                                                        >
                                                            <Tag size={12} />
                                                            {tag}
                                                            {!isReadOnly && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeTag(skill.id, tag)}
                                                                    className="ml-1 hover:text-red-500"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            )}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                {!isReadOnly && (
                                                    <div className="flex gap-x-2">
                                                        <Input
                                                            placeholder="Add tag"
                                                            value={newTag[skill.id] || ''}
                                                            onChange={(e) =>
                                                                setNewTag({ ...newTag, [skill.id]: e.target.value })
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    addTag(skill.id);
                                                                }
                                                            }}
                                                            containerClassName="flex-1"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => addTag(skill.id)}
                                                        >
                                                            Add
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Examples */}
                                            <div className="col-span-1 sm:col-span-2">
                                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                    Examples
                                                </Label>
                                                <div className="flex flex-col gap-y-2 mb-2">
                                                    {skill.examples.map((example, exIndex) => (
                                                        <div
                                                            key={exIndex}
                                                            className="flex items-start gap-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                                                        >
                                                            <p className="flex-1 text-sm text-gray-600 dark:text-gray-300">
                                                                {example}
                                                            </p>
                                                            {!isReadOnly && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeExample(skill.id, exIndex)}
                                                                    className="text-gray-400 hover:text-red-500"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                {!isReadOnly && (
                                                    <div className="flex gap-x-2">
                                                        <Input
                                                            placeholder="Add example usage"
                                                            value={newExample[skill.id] || ''}
                                                            onChange={(e) =>
                                                                setNewExample({
                                                                    ...newExample,
                                                                    [skill.id]: e.target.value,
                                                                })
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    addExample(skill.id);
                                                                }
                                                            }}
                                                            containerClassName="flex-1"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => addExample(skill.id)}
                                                        >
                                                            Add
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillsSection;
