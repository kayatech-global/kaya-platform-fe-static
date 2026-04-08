'use client';

import { Input, Textarea, Button, Label, Badge, Select } from '@/components';
import { cn } from '@/lib/utils';
import { IAgentForm, IHorizonSkill, IOMode, IConnectorForm } from '@/models';
import { Zap, Trash2, ChevronDown, ChevronUp, Tag, X, Link2, Plus, Hash } from 'lucide-react';
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

const ioModeOptions: { name: string; value: IOMode }[] = [
    { name: 'JSON', value: 'application/json' as IOMode },
    { name: 'Text', value: 'text/plain' as IOMode },
    { name: 'XML', value: 'application/xml' as IOMode },
];

const defaultSkill: Omit<IHorizonSkill, 'id'> = {
    name: '',
    description: '',
    tags: [],
    examples: [],
    ioModes: ['application/json' as IOMode],
    version: '1.0.0',
};

export const SkillsSection = ({ control, watch, setValue, errors, isReadOnly, connectors = [] }: SkillsSectionProps) => {
    const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
    const [newTag, setNewTag] = useState<Record<string, string>>({});
    const [newIoMode, setNewIoMode] = useState<Record<string, IOMode>>({});

    const skills = watch('horizonConfig.skills') || [];

    // Create a skill from a connector with auto-populated fields
    const createSkillFromConnector = useCallback((connector: IConnectorForm): IHorizonSkill => {
        const skillId = `skill-${connector.id || uuidv4()}`;
        return {
            id: skillId,
            name: connector.name || 'Unnamed Connector',
            description: connector.description || `Data connector skill for ${connector.name}. Provides access to ${connector.type || 'external'} data source.`,
            tags: ['data-connector', connector.type || 'connector', 'auto-generated'],
            examples: [],
            ioModes: ['application/json'] as IOMode[],
            version: '1.0.0',
            inputConnectorMapping: { connectorId: connector.id || '' },
        };
    }, []);

    // Sync skills with connectors - auto-populate skills from connectors
    useEffect(() => {
        if (connectors.length === 0) return;

        const existingConnectorSkillIds = new Set(
            skills
                .filter((s) => s.inputConnectorMapping?.connectorId)
                .map((s) => s.inputConnectorMapping?.connectorId)
        );

        const connectorIds = new Set(connectors.map((c) => c.id));
        
        // Find connectors that don't have corresponding skills
        const newConnectorSkills = connectors
            .filter((c) => c.id && !existingConnectorSkillIds.has(c.id))
            .map(createSkillFromConnector);

        // Find skills that no longer have corresponding connectors (to remove)
        const orphanedSkillIds = skills
            .filter((s) => s.inputConnectorMapping?.connectorId)
            .filter((s) => !connectorIds.has(s.inputConnectorMapping?.connectorId))
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
    const isConnectorSkill = (skill: IHorizonSkill) => !!skill.inputConnectorMapping?.connectorId;

    const toggleSkill = (skillId: string) => {
        const newExpanded = new Set(expandedSkills);
        if (newExpanded.has(skillId)) {
            newExpanded.delete(skillId);
        } else {
            newExpanded.add(skillId);
        }
        setExpandedSkills(newExpanded);
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

    const addIoMode = (skillId: string) => {
        const mode = newIoMode[skillId];
        if (mode) {
            const skill = skills.find((s) => s.id === skillId);
            if (skill && !skill.ioModes.includes(mode)) {
                updateSkill(skillId, { ioModes: [...skill.ioModes, mode] });
            }
            setNewIoMode({ ...newIoMode, [skillId]: 'text' });
        }
    };

    const removeIoMode = (skillId: string, mode: IOMode) => {
        const skill = skills.find((s) => s.id === skillId);
        if (skill && skill.ioModes.length > 1) {
            updateSkill(skillId, { ioModes: skill.ioModes.filter((m) => m !== mode) });
        }
    };

    const getIoModeLabel = (mode: IOMode): string => {
        const option = ioModeOptions.find((o) => o.value === mode);
        return option?.name || mode;
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
                                                {isConnectorSkill(skill) && (
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
                                                v{skill.version} | {skill.ioModes.map(m => getIoModeLabel(m)).join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                    {!isReadOnly && !isConnectorSkill(skill) && (
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
                                            {/* Skill ID - Editable but auto-populated */}
                                            <div className="col-span-1 sm:col-span-2">
                                                <Input
                                                    label="Skill ID"
                                                    placeholder="skill-unique-id"
                                                    value={skill.id}
                                                    disabled={isReadOnly}
                                                    onChange={(e) => updateSkill(skill.id, { id: e.target.value })}
                                                    leftIcon={<Hash size={14} className="text-gray-400" />}
                                                    className="font-mono"
                                                />
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Auto-generated but can be customized. Must be unique within this agent.
                                                </p>
                                            </div>

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

                                            {/* IO Modes - Dropdown based like Auth Schemes */}
                                            <div className="col-span-1 sm:col-span-2">
                                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                    IO Modes
                                                </Label>
                                                
                                                {/* Existing IO Modes */}
                                                {skill.ioModes.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {skill.ioModes.map((mode) => (
                                                            <Badge
                                                                key={mode}
                                                                variant="secondary"
                                                                className="flex items-center gap-x-1 px-3 py-1.5"
                                                            >
                                                                {getIoModeLabel(mode)}
                                                                {!isReadOnly && skill.ioModes.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeIoMode(skill.id, mode)}
                                                                        className="ml-1 hover:text-red-500"
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                )}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {/* Add IO Mode */}
                                                {!isReadOnly && (
                                                    <div className="flex gap-x-2">
                                                        <Select
                                                            options={ioModeOptions.filter(
                                                                (opt) => !skill.ioModes.includes(opt.value)
                                                            )}
                                                            currentValue={newIoMode[skill.id] || ''}
                                                            onChange={(e) =>
                                                                setNewIoMode({ ...newIoMode, [skill.id]: e.target.value as IOMode })
                                                            }
                                                            className="flex-1"
                                                            placeholder="Select IO mode..."
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => addIoMode(skill.id)}
                                                            disabled={
                                                                !newIoMode[skill.id] ||
                                                                skill.ioModes.includes(newIoMode[skill.id])
                                                            }
                                                        >
                                                            <Plus size={14} className="mr-1" />
                                                            Add
                                                        </Button>
                                                    </div>
                                                )}
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
