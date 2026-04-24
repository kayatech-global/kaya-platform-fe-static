'use client';

import { Input, Textarea, Button } from '@/components';
import { cn } from '@/lib/utils';
import { IAgentForm, IHorizonSkill } from '@/models';
import { Zap, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Control, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface SkillsSectionProps {
    control: Control<IAgentForm>;
    watch: UseFormWatch<IAgentForm>;
    setValue: UseFormSetValue<IAgentForm>;
    errors?: FieldErrors<IAgentForm>;
    isReadOnly?: boolean;
}

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
                                                v{skill.version}
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
