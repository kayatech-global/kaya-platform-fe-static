'use client';

import { Input, Textarea, Button, Label, Badge, Select } from '@/components';
import { cn } from '@/lib/utils';
import { IAgentForm, IHorizonSkill, IOMode } from '@/models';
import { Zap, Trash2, ChevronDown, ChevronUp, Tag, X, Plus } from 'lucide-react';
import { Control, Controller, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface SkillsSectionProps {
    control: Control<IAgentForm>;
    watch: UseFormWatch<IAgentForm>;
    setValue: UseFormSetValue<IAgentForm>;
    errors?: FieldErrors<IAgentForm>;
    isReadOnly?: boolean;
}

const ioModeOptions: { name: string; value: IOMode }[] = [
    { name: 'JSON', value: 'application/json' },
    { name: 'Text', value: 'text/plain' },
    { name: 'XML', value: 'application/xml' },
];

const defaultSkill: Omit<IHorizonSkill, 'id'> = {
    name: '',
    description: '',
    instructions: '',
    tags: [],
    examples: [],
    ioModes: ['application/json'],
    inputModes: ['application/json'],
    outputModes: ['application/json'],
    version: '1.0.0',
};

export const SkillsSection = ({ control, watch, setValue, errors, isReadOnly }: SkillsSectionProps) => {
    const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
    const [newTag, setNewTag] = useState<Record<string, string>>({});
    const [newInputMode, setNewInputMode] = useState<Record<string, IOMode>>({});
    const [newOutputMode, setNewOutputMode] = useState<Record<string, IOMode>>({});

    const skills = watch('horizonConfig.skills') || [];

    // Add a new skill
    const addSkill = () => {
        const newSkillId = `skill-${uuidv4()}`;
        const newSkill: IHorizonSkill = {
            ...defaultSkill,
            id: newSkillId,
        };
        setValue('horizonConfig.skills', [...skills, newSkill]);
        // Auto-expand the new skill
        setExpandedSkills(new Set([...expandedSkills, newSkillId]));
    };

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

    const addInputMode = (skillId: string) => {
        const mode = newInputMode[skillId];
        if (mode) {
            const skill = skills.find((s) => s.id === skillId);
            const currentModes = skill?.inputModes || skill?.ioModes || [];
            if (skill && !currentModes.includes(mode)) {
                updateSkill(skillId, { inputModes: [...currentModes, mode] });
            }
            setNewInputMode({ ...newInputMode, [skillId]: '' as IOMode });
        }
    };

    const removeInputMode = (skillId: string, mode: IOMode) => {
        const skill = skills.find((s) => s.id === skillId);
        const currentModes = skill?.inputModes || skill?.ioModes || [];
        if (skill && currentModes.length > 1) {
            updateSkill(skillId, { inputModes: currentModes.filter((m) => m !== mode) });
        }
    };

    const addOutputMode = (skillId: string) => {
        const mode = newOutputMode[skillId];
        if (mode) {
            const skill = skills.find((s) => s.id === skillId);
            const currentModes = skill?.outputModes || skill?.ioModes || [];
            if (skill && !currentModes.includes(mode)) {
                updateSkill(skillId, { outputModes: [...currentModes, mode] });
            }
            setNewOutputMode({ ...newOutputMode, [skillId]: '' as IOMode });
        }
    };

    const removeOutputMode = (skillId: string, mode: IOMode) => {
        const skill = skills.find((s) => s.id === skillId);
        const currentModes = skill?.outputModes || skill?.ioModes || [];
        if (skill && currentModes.length > 1) {
            updateSkill(skillId, { outputModes: currentModes.filter((m) => m !== mode) });
        }
    };

    const getIoModeLabel = (mode: IOMode): string => {
        const option = ioModeOptions.find((o) => o.value === mode);
        return option?.name || mode;
    };

    return (
        <div className="col-span-1 sm:col-span-2 border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-4">
            <div className="flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-y-1">
                        <div className="flex items-center gap-x-[10px]">
                            <Zap size={20} absoluteStrokeWidth={false} className="stroke-[1px]" />
                            <p className="text-sm font-medium">Skills</p>
                        </div>
                        <p className="text-xs font-normal text-gray-400">
                            Define the skills for this agent.
                        </p>
                    </div>
                    {!isReadOnly && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addSkill}
                            className="flex items-center gap-x-1"
                        >
                            <Plus size={14} />
                            Add Skill
                        </Button>
                    )}
                </div>

                {/* Skills List */}
                {skills.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center bg-gray-50 dark:bg-gray-800">
                        <Zap size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No skills configured yet.</p>
                        <p className="text-xs text-gray-400 mt-1">
                            Click &quot;Add Skill&quot; to define a new skill for this agent.
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
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                {skill.name || `Skill ${index + 1}`}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                v{skill.version} | In: {(skill.inputModes || skill.ioModes || []).map(m => getIoModeLabel(m)).join(', ')} | Out: {(skill.outputModes || skill.ioModes || []).map(m => getIoModeLabel(m)).join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                    {!isReadOnly && (
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
                                            {/* Skill ID is auto-generated and stored internally */}

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

                                            {/* Instructions */}
                                            <div className="col-span-1 sm:col-span-2">
                                                <Textarea
                                                    label="Instructions"
                                                    placeholder="Provide detailed instructions for how this skill should be executed. Include specific steps, parameters, expected inputs/outputs, and any constraints."
                                                    value={skill.instructions || ''}
                                                    disabled={isReadOnly}
                                                    onChange={(e) =>
                                                        updateSkill(skill.id, { instructions: e.target.value })
                                                    }
                                                    rows={4}
                                                    className="w-full resize-none"
                                                />
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Define step-by-step instructions for the agent to follow when executing this skill.
                                                </p>
                                            </div>

                                            {/* Input Modes */}
                                            <div className="col-span-1">
                                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                    Input Modes
                                                </Label>
                                                
                                                {/* Existing Input Modes */}
                                                {(skill.inputModes || skill.ioModes || []).length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {(skill.inputModes || skill.ioModes || []).map((mode) => (
                                                            <Badge
                                                                key={mode}
                                                                variant="secondary"
                                                                className="flex items-center gap-x-1 px-3 py-1.5"
                                                            >
                                                                {getIoModeLabel(mode)}
                                                                {!isReadOnly && (skill.inputModes || skill.ioModes || []).length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeInputMode(skill.id, mode)}
                                                                        className="ml-1 hover:text-red-500"
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                )}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {/* Add Input Mode */}
                                                {!isReadOnly && (
                                                    <div className="flex gap-x-2">
                                                        <Select
                                                            options={ioModeOptions.filter(
                                                                (opt) => !(skill.inputModes || skill.ioModes || []).includes(opt.value)
                                                            )}
                                                            currentValue={newInputMode[skill.id] || ''}
                                                            onChange={(e) =>
                                                                setNewInputMode({ ...newInputMode, [skill.id]: e.target.value as IOMode })
                                                            }
                                                            className="flex-1"
                                                            placeholder="Select mode..."
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => addInputMode(skill.id)}
                                                            disabled={
                                                                !newInputMode[skill.id] ||
                                                                (skill.inputModes || skill.ioModes || []).includes(newInputMode[skill.id])
                                                            }
                                                        >
                                                            <Plus size={14} className="mr-1" />
                                                            Add
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Output Modes */}
                                            <div className="col-span-1">
                                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                                    Output Modes
                                                </Label>
                                                
                                                {/* Existing Output Modes */}
                                                {(skill.outputModes || skill.ioModes || []).length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {(skill.outputModes || skill.ioModes || []).map((mode) => (
                                                            <Badge
                                                                key={mode}
                                                                variant="secondary"
                                                                className="flex items-center gap-x-1 px-3 py-1.5"
                                                            >
                                                                {getIoModeLabel(mode)}
                                                                {!isReadOnly && (skill.outputModes || skill.ioModes || []).length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeOutputMode(skill.id, mode)}
                                                                        className="ml-1 hover:text-red-500"
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                )}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {/* Add Output Mode */}
                                                {!isReadOnly && (
                                                    <div className="flex gap-x-2">
                                                        <Select
                                                            options={ioModeOptions.filter(
                                                                (opt) => !(skill.outputModes || skill.ioModes || []).includes(opt.value)
                                                            )}
                                                            currentValue={newOutputMode[skill.id] || ''}
                                                            onChange={(e) =>
                                                                setNewOutputMode({ ...newOutputMode, [skill.id]: e.target.value as IOMode })
                                                            }
                                                            className="flex-1"
                                                            placeholder="Select mode..."
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => addOutputMode(skill.id)}
                                                            disabled={
                                                                !newOutputMode[skill.id] ||
                                                                (skill.outputModes || skill.ioModes || []).includes(newOutputMode[skill.id])
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
