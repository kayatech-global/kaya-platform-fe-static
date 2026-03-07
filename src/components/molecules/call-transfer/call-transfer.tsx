import {
    Button,
    Checkbox,
    Input,
    Select,
    Textarea,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/atoms';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/atoms/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/atoms/command';
import {
    HumanAgentCallTransferConfig,
    TransferRule,
    TimeRange,
    DayAvailability,
} from '@/components/organisms/workflow-editor-form/voice-agent-form';
import { DaysOfWeekType } from '@/enums';
import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Clock, Globe, Check, ChevronsUpDown, X } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/atoms/label';
import { Switch } from '@/components/atoms/switch';
import { cn, validatePhone } from '@/lib/utils';

interface CallTransferProps {
    initialCallTransfer?: HumanAgentCallTransferConfig;
    setHumanAgentCallTransferConfig: React.Dispatch<React.SetStateAction<HumanAgentCallTransferConfig>>;
}

const DAY_LABEL_MAP: Record<string, string> = {
    [DaysOfWeekType.SUN]: 'sunday',
    [DaysOfWeekType.MON]: 'monday',
    [DaysOfWeekType.TUE]: 'tuesday',
    [DaysOfWeekType.WED]: 'wednesday',
    [DaysOfWeekType.THU]: 'thursday',
    [DaysOfWeekType.FRI]: 'friday',
    [DaysOfWeekType.SAT]: 'saturday',
};

const COMMON_TIMEZONES = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'America/Toronto',
    'America/Vancouver',
    'America/Sao_Paulo',
    'America/Mexico_City',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Moscow',
    'Europe/Istanbul',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Colombo',
    'Asia/Dhaka',
    'Asia/Bangkok',
    'Asia/Singapore',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Africa/Cairo',
    'Africa/Johannesburg',
    'Asia/Riyadh',
    'Australia/Sydney',
    'Australia/Perth',
    'Pacific/Auckland',
    'UTC',
];

const DEFAULT_AVAILABILITY: DayAvailability[] = Object.values(DaysOfWeekType)
    .filter(day => day !== DaysOfWeekType.EMPTY)
    .map(day => ({
        day: DAY_LABEL_MAP[day] || day,
        isEnabled: false,
        time_ranges: [],
    }));

const DEFAULT_RULE: TransferRule = {
    id: '',
    name: '',
    description: '',
    priority: 0,
    scenarioId: '',
    scenarioDescription: '',
    exampleUtterances: [],
    targetType: 'phone',
    targetValue: '',
    askConfirmation: false,
    preTransferMessage: '',
    availabilityEnabled: false,
    timezone: 'UTC',
    availability: { days: DEFAULT_AVAILABILITY },
    fallbackRule: '',
};

export const CallTransfer = ({ initialCallTransfer, setHumanAgentCallTransferConfig }: CallTransferProps) => {
    const [isEnabled, setIsEnabled] = useState(initialCallTransfer?.isEnabled || false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRule, setCurrentRule] = useState<TransferRule>(DEFAULT_RULE);
    const [isEditing, setIsEditing] = useState(false);
    const [timezoneOpen, setTimezoneOpen] = useState(false);
    const [newUtterance, setNewUtterance] = useState('');
    const [editingUtteranceIdx, setEditingUtteranceIdx] = useState<number | null>(null);
    const [editUtteranceValue, setEditUtteranceValue] = useState('');

    useEffect(() => {
        if (initialCallTransfer) {
            setIsEnabled(initialCallTransfer.isEnabled);
        }
    }, [initialCallTransfer?.isEnabled]);

    const handleToggleEnable = (checked: boolean) => {
        setIsEnabled(checked);
        setHumanAgentCallTransferConfig(prev => ({
            ...prev,
            isEnabled: checked,
        }));
    };

    const handleSaveRule = () => {
        if (!currentRule.name) {
            toast.error('Rule Name is required');
            return;
        }
        if (!currentRule.scenarioId) {
            toast.error('Scenario ID is required');
            return;
        }
        if (currentRule.targetType === 'phone') {
            const phoneVal = validatePhone(currentRule.targetValue, 'Target Number');
            if (phoneVal !== true) {
                toast.error(phoneVal);
                return;
            }
        }

        setHumanAgentCallTransferConfig(prev => {
            const rules = prev.rules || [];
            let newRules;
            if (isEditing) {
                newRules = rules.map(r => (r.id === currentRule.id ? currentRule : r));
            } else {
                newRules = [...rules, { ...currentRule, id: crypto.randomUUID() }];
            }
            newRules.sort((a, b) => a.priority - b.priority);

            return {
                ...prev,
                rules: newRules,
            };
        });
        setIsModalOpen(false);
        toast.success(isEditing ? 'Rule updated' : 'Rule added');
    };

    const handleDeleteRule = (ruleId: string) => {
        setHumanAgentCallTransferConfig(prev => ({
            ...prev,
            rules: (prev.rules || []).filter(r => r.id !== ruleId),
        }));
        toast.success('Rule deleted');
    };

    const openAddModal = () => {
        setCurrentRule({
            ...DEFAULT_RULE,
            priority: initialCallTransfer?.rules?.length || 0,
            availability: { days: DEFAULT_AVAILABILITY },
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const openEditModal = (rule: TransferRule) => {
        const mergedAvailability = DEFAULT_AVAILABILITY.map(defaultDay => {
            const existingDay = rule.availability?.days?.find(d => d.day === defaultDay.day);
            return existingDay || defaultDay;
        });

        setCurrentRule({ ...rule, availability: { days: mergedAvailability } });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDayToggle = (dayIndex: number, checked: boolean) => {
        const newDays = [...(currentRule.availability?.days || [])];
        newDays[dayIndex] = {
            ...newDays[dayIndex],
            isEnabled: checked,
            time_ranges:
                checked && newDays[dayIndex].time_ranges.length === 0
                    ? [{ from: '09:00', to: '17:00' }]
                    : newDays[dayIndex].time_ranges,
        };
        setCurrentRule(prev => ({ ...prev, availability: { ...prev.availability, days: newDays } }));
    };

    const handleTimeRangeChange = (dayIndex: number, rangeIndex: number, field: keyof TimeRange, value: string) => {
        const newDays = [...(currentRule.availability?.days || [])];
        const newRanges = [...newDays[dayIndex].time_ranges];
        newRanges[rangeIndex] = { ...newRanges[rangeIndex], [field]: value };
        newDays[dayIndex] = { ...newDays[dayIndex], time_ranges: newRanges };
        setCurrentRule(prev => ({ ...prev, availability: { ...prev.availability, days: newDays } }));
    };

    const addTimeRange = (dayIndex: number) => {
        const newDays = [...(currentRule.availability?.days || [])];
        const newRanges = [...newDays[dayIndex].time_ranges, { from: '09:00', to: '17:00' }];
        newDays[dayIndex] = { ...newDays[dayIndex], time_ranges: newRanges };
        setCurrentRule(prev => ({ ...prev, availability: { ...prev.availability, days: newDays } }));
    };

    const removeTimeRange = (dayIndex: number, rangeIndex: number) => {
        const newDays = [...(currentRule.availability?.days || [])];
        const newRanges = newDays[dayIndex].time_ranges.filter((_, i) => i !== rangeIndex);
        newDays[dayIndex] = { ...newDays[dayIndex], time_ranges: newRanges };
        setCurrentRule(prev => ({ ...prev, availability: { ...prev.availability, days: newDays } }));
    };

    const handleAddUtterance = () => {
        const val = newUtterance.trim();
        if (val) {
            const utterances = [...(currentRule.exampleUtterances || []), val];
            setCurrentRule({ ...currentRule, exampleUtterances: utterances });
            setNewUtterance('');
        }
    };

    const handleStartEditUtterance = (idx: number, value: string) => {
        setEditingUtteranceIdx(idx);
        setEditUtteranceValue(value);
    };

    const handleSaveEditUtterance = () => {
        if (editingUtteranceIdx !== null && editUtteranceValue.trim()) {
            const newUtterances = [...(currentRule.exampleUtterances || [])];
            newUtterances[editingUtteranceIdx] = editUtteranceValue.trim();
            setCurrentRule({ ...currentRule, exampleUtterances: newUtterances });
            setEditingUtteranceIdx(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <Label className="text-base font-medium">Call Transfer</Label>
                    <p className="text-sm text-gray-500">
                        Configure scenario-based call transfers based on conversation context.
                    </p>
                </div>
                <Switch checked={isEnabled} onCheckedChange={handleToggleEnable} />
            </div>

            {isEnabled && (
                <div className="space-y-4 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Transfer Rules</h4>
                        <Button size="sm" onClick={openAddModal} className="h-8 gap-1">
                            <Plus size={14} /> Add Rule
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {initialCallTransfer?.rules?.length === 0 && (
                            <div className="text-center py-6 text-gray-500 text-sm italic">
                                No transfer rules configured.
                            </div>
                        )}
                        {initialCallTransfer?.rules?.map(rule => (
                            <div
                                key={rule.id}
                                className="group flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="w-6 h-6 flex items-center justify-center text-xs font-medium rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 cursor-default">
                                                    {rule.priority}
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">Priority Level {rule.priority}</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium truncate">{rule.name}</span>
                                        <span className="text-xs text-gray-500 truncate">{rule.targetValue}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {rule.availabilityEnabled && <Clock size={14} className="text-gray-400" />}
                                    <Button
                                        variant="ghost"
                                        onClick={() => openEditModal(rule)}
                                        className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                                    >
                                        <Edit2 size={14} className="text-gray-600 dark:text-gray-300" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        onClick={() => handleDeleteRule(rule.id)}
                                        className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                                    >
                                        <Trash2 size={14} className="text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="sticky top-0 bg-white z-10">
                        <div className="flex justify-between">
                            <DialogTitle>{isEditing ? 'Edit Transfer Rule' : 'Add Transfer Rule'}</DialogTitle>
                            <DialogClose asChild>
                                <Button variant="link" size="icon">
                                    <X size={16} />
                                </Button>
                            </DialogClose>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6 p-4 z-0">
                        {/* Rule Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Rule Name"
                                placeholder="e.g. Sales Inquiry"
                                value={currentRule.name}
                                onChange={e => setCurrentRule({ ...currentRule, name: e.target.value })}
                            />
                            <Input
                                type="number"
                                label="Priority"
                                placeholder="0"
                                value={currentRule.priority}
                                onChange={e =>
                                    setCurrentRule({ ...currentRule, priority: parseInt(e.target.value) || 0 })
                                }
                                helperInfo="Lower number means higher priority"
                            />
                        </div>
                        <Textarea
                            label="Description"
                            placeholder="Internal description for this rule"
                            value={currentRule.description}
                            onChange={e => setCurrentRule({ ...currentRule, description: e.target.value })}
                            rows={2}
                        />

                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-3 text-sm">Scenario Definition</h4>
                            <div className="space-y-4">
                                <Input
                                    label="Scenario ID"
                                    placeholder="e.g. sales_inquiry"
                                    value={currentRule.scenarioId}
                                    onChange={e => setCurrentRule({ ...currentRule, scenarioId: e.target.value })}
                                    helperInfo="Unique identifier for the AI to recognize this scenario"
                                />
                                <Textarea
                                    label="Scenario Description"
                                    placeholder="Describe when this transfer should happen (e.g. user asks about pricing)"
                                    value={currentRule.scenarioDescription}
                                    onChange={e =>
                                        setCurrentRule({ ...currentRule, scenarioDescription: e.target.value })
                                    }
                                />

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Example Utterances</Label>
                                    <div className="space-y-2">
                                        {currentRule.exampleUtterances?.map((utterance, idx) => (
                                            <div key={idx} className="flex items-center gap-2 group">
                                                {editingUtteranceIdx === idx ? (
                                                    <div className="flex-1 flex gap-2">
                                                        <Input
                                                            className="h-8 flex-1 text-sm text-primary"
                                                            value={editUtteranceValue}
                                                            onChange={e => setEditUtteranceValue(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') handleSaveEditUtterance();
                                                                if (e.key === 'Escape') setEditingUtteranceIdx(null);
                                                            }}
                                                            autoFocus
                                                        />
                                                        <Button
                                                            size="sm"
                                                            className="h-8 px-2 text-xs"
                                                            onClick={handleSaveEditUtterance}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 px-2 text-xs"
                                                            onClick={() => setEditingUtteranceIdx(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex-1 p-2 text-sm bg-gray-50 dark:bg-gray-900 border rounded-md">
                                                            {utterance}
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-gray-400 hover:text-blue-500"
                                                                onClick={() => handleStartEditUtterance(idx, utterance)}
                                                            >
                                                                <Edit2 size={12} />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-gray-400 hover:text-red-500"
                                                                onClick={() => {
                                                                    const newUtterances = [
                                                                        ...(currentRule.exampleUtterances || []),
                                                                    ];
                                                                    newUtterances.splice(idx, 1);
                                                                    setCurrentRule({
                                                                        ...currentRule,
                                                                        exampleUtterances: newUtterances,
                                                                    });
                                                                }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="e.g. I want to buy a car"
                                            className="flex-1"
                                            value={newUtterance}
                                            onChange={e => setNewUtterance(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddUtterance();
                                                }
                                            }}
                                        />
                                        <Button size="sm" onClick={handleAddUtterance}>
                                            Add
                                        </Button>
                                    </div>
                                    <p className="text-[11px] text-gray-400 italic">
                                        Press Enter or click Add to save each utterance
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-3 text-sm">Transfer Target</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    label="Target Type"
                                    options={[
                                        { name: 'Phone Number', value: 'phone' },
                                        { name: 'Queue', value: 'queue' },
                                    ]}
                                    currentValue={currentRule.targetType}
                                    onChange={e =>
                                        setCurrentRule({
                                            ...currentRule,
                                            targetType: e.target.value as 'phone' | 'queue',
                                        })
                                    }
                                />
                                <Input
                                    label="Target Value"
                                    placeholder="+1234567890"
                                    value={currentRule.targetValue}
                                    onChange={e => setCurrentRule({ ...currentRule, targetValue: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-3 text-sm">Transfer Behavior</h4>
                            <div className="flex items-center space-x-2 mb-4">
                                <Checkbox
                                    checked={currentRule.askConfirmation}
                                    onCheckedChange={checked =>
                                        setCurrentRule({ ...currentRule, askConfirmation: checked as boolean })
                                    }
                                />
                                <span className="text-sm">Ask user for confirmation before transfer</span>
                            </div>
                            <Input
                                label="Pre-Transfer Message"
                                placeholder="e.g. Let me transfer you to a specialist."
                                value={currentRule.preTransferMessage}
                                onChange={e => setCurrentRule({ ...currentRule, preTransferMessage: e.target.value })}
                            />
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                    <Globe size={16} /> Availability Configuration
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Enable Restrictions</span>
                                    <Switch
                                        checked={currentRule.availabilityEnabled}
                                        onCheckedChange={checked =>
                                            setCurrentRule({ ...currentRule, availabilityEnabled: checked })
                                        }
                                    />
                                </div>
                            </div>

                            {currentRule.availabilityEnabled && (
                                <div className="space-y-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Timezone</Label>
                                        <Popover open={timezoneOpen} onOpenChange={setTimezoneOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={timezoneOpen}
                                                    className="w-full justify-between font-normal"
                                                >
                                                    {currentRule.timezone
                                                        ? COMMON_TIMEZONES.find(tz => tz === currentRule.timezone)
                                                        : 'Select timezone...'}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search timezone..." />
                                                    <CommandList>
                                                        <CommandEmpty>No timezone found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {COMMON_TIMEZONES.map(tz => (
                                                                <CommandItem
                                                                    key={tz}
                                                                    value={tz}
                                                                    onSelect={currentValue => {
                                                                        setCurrentRule({
                                                                            ...currentRule,
                                                                            timezone: currentValue,
                                                                        });
                                                                        setTimezoneOpen(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            'mr-2 h-4 w-4',
                                                                            currentRule.timezone === tz
                                                                                ? 'opacity-100'
                                                                                : 'opacity-0'
                                                                        )}
                                                                    />
                                                                    {tz}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium block">Weekly Schedule</Label>
                                        {currentRule.availability?.days?.map((dayAvail, dayIdx) => (
                                            <div
                                                key={dayAvail.day}
                                                className="flex flex-col gap-2 p-3 border rounded-md bg-gray-50/50 dark:bg-gray-800/50"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            checked={dayAvail.isEnabled}
                                                            onCheckedChange={checked =>
                                                                handleDayToggle(dayIdx, checked as boolean)
                                                            }
                                                        />
                                                        <span
                                                            className={cn(
                                                                'text-sm font-medium',
                                                                !dayAvail.isEnabled && 'text-gray-400'
                                                            )}
                                                        >
                                                            {dayAvail.day}
                                                        </span>
                                                    </div>
                                                    {dayAvail.isEnabled && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-6 text-xs"
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                addTimeRange(dayIdx);
                                                            }}
                                                        >
                                                            <Plus size={12} className="mr-1" /> Add Range
                                                        </Button>
                                                    )}
                                                </div>

                                                {dayAvail.isEnabled && (
                                                    <div className="pl-6 space-y-2">
                                                        {dayAvail.time_ranges.map((range, rangeIdx) => (
                                                            <div key={rangeIdx} className="flex items-center gap-2">
                                                                <Input
                                                                    type="time"
                                                                    className="w-28 h-8 text-xs"
                                                                    value={range.from}
                                                                    onChange={e =>
                                                                        handleTimeRangeChange(
                                                                            dayIdx,
                                                                            rangeIdx,
                                                                            'from',
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                                <span className="text-xs text-gray-400">to</span>
                                                                <Input
                                                                    type="time"
                                                                    className="w-28 h-8 text-xs"
                                                                    value={range.to}
                                                                    onChange={e =>
                                                                        handleTimeRangeChange(
                                                                            dayIdx,
                                                                            rangeIdx,
                                                                            'to',
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                                                                    onClick={() => removeTimeRange(dayIdx, rangeIdx)}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        {dayAvail.time_ranges.length === 0 && (
                                                            <span className="text-xs text-gray-400 italic">
                                                                No time ranges set (Available all day?)
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <Select
                                        label="Fallback Rule (Optional)"
                                        options={[
                                            { name: 'None', value: '' },
                                            ...(initialCallTransfer?.rules
                                                ?.filter(r => r.id !== currentRule.id)
                                                .map(r => ({
                                                    name: r.name,
                                                    value: r.id,
                                                })) || []),
                                        ]}
                                        currentValue={currentRule.fallbackRule || ''}
                                        onChange={e => setCurrentRule({ ...currentRule, fallbackRule: e.target.value })}
                                        helperInfo="Select another rule to route to if this scenario is unavailable"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="sticky bottom-0 bg-white z-10">
                        <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSaveRule}>{isEditing ? 'Save Changes' : 'Add Rule'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
