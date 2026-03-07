'use client';

import React, { useEffect, useImperativeHandle, useState } from 'react';
import { Input, LoadingPlaceholder } from '@/components/atoms';
import { SelectableRadioItem } from '@/components/molecules';
import { SelectableType } from '@/enums';
import { FileX } from 'lucide-react';
import { IScheduleTrigger } from '@/models';

export interface ScheduleTriggerSelectorRef {
    selectedValues: () => string | undefined;
}

interface ScheduleTriggerSelectorProps {
    isOpen: boolean;
    scheduleTriggerLoading: boolean;
    scheduleTriggers: IScheduleTrigger[];
    scheduler: string | undefined;
    setScheduler: React.Dispatch<React.SetStateAction<string | undefined>>;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export const ScheduleTriggerSelector = React.forwardRef<ScheduleTriggerSelectorRef, ScheduleTriggerSelectorProps>(
    (
        {
            isOpen,
            scheduleTriggerLoading,
            scheduleTriggers,
            scheduler,
            setScheduler,
            onEdit,
            onDelete,
        }: ScheduleTriggerSelectorProps,
        ref
    ) => {
        const [searchTerm, setSearchTerm] = useState<string>('');
        const [checkedItemId, setCheckedItemId] = useState<string>();
        const [allSearchableTriggers, setAllSearchableTriggers] = useState<IScheduleTrigger[]>(scheduleTriggers);

        useEffect(() => {
            if (searchTerm !== '') {
                const result = scheduleTriggers.filter(x => x.name.toLowerCase().includes(searchTerm));
                setAllSearchableTriggers(result);
            } else {
                setAllSearchableTriggers(scheduleTriggers);
            }
        }, [searchTerm]);

        useEffect(() => {
            if (isOpen && scheduler) {
                setCheckedItemId(scheduler);
            } else {
                setCheckedItemId(undefined);
            }
        }, [isOpen, scheduler]);

        useEffect(() => {
            setAllSearchableTriggers(scheduleTriggers);
        }, [scheduleTriggers, scheduleTriggers?.length]);

        useImperativeHandle(ref, () => ({
            selectedValues: () => {
                return checkedItemId;
            },
        }));

        const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
            const searchTerm = e.target.value.toLowerCase();
            setSearchTerm(searchTerm);
        };

        const handleItemCheck = (trigger: IScheduleTrigger) => {
            setCheckedItemId(trigger?.id);
            setScheduler(trigger?.id);
        };

        return (
            <>
                {scheduleTriggerLoading ? (
                    <LoadingPlaceholder text="Please wait! loading the schedule triggers data for you..." />
                ) : (
                    <>
                        <Input className="w-full" placeholder="Search schedule triggers" onChange={handleSearch} />
                        {allSearchableTriggers?.length > 0 ? (
                            <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                                {allSearchableTriggers
                                    .toSorted((a, b) => {
                                        if (a.id === checkedItemId) return -1;
                                        if (b.id === checkedItemId) return 1;
                                        return 0;
                                    })
                                    .map((trigger) => {
                                        return (
                                            <SelectableRadioItem
                                                key={trigger.id as string}
                                                id={trigger.id as string}
                                                title="Schedule Trigger"
                                                type={SelectableType.SCHEDULE_TRIGGER}
                                                hasDelete={true}
                                                label={trigger.name}
                                                description={
                                                    trigger.description.length > 65
                                                        ? trigger.description.slice(0, 62) + '...'
                                                        : trigger.description
                                                }
                                                isChecked={checkedItemId === trigger.id}
                                                imagePath="/png/calendar_image.png"
                                                isReadOnly={trigger.isReadOnly}
                                                handleClick={() => handleItemCheck(trigger)}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                            />
                                        );
                                    })}
                            </div>
                        ) : (
                            <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-full">
                                <FileX className="text-gray-500 dark:text-gray-300" />
                                <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                    {searchTerm !== '' ? (
                                        <>No results found</>
                                    ) : (
                                        <>
                                            No Schedule Triggers have been
                                            <br /> configured
                                        </>
                                    )}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </>
        );
    }
);

ScheduleTriggerSelector.displayName = 'ScheduleTriggerSelector';
