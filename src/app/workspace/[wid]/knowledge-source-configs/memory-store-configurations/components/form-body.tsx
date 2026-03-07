'use client';
import { Input, Select, Spinner, Textarea } from '@/components';
import React from 'react';

import { DatabaseType } from './memory-store-container';

enum MemoryType {
    ConversationHistory = 'Conversation History',
    UserPreferences = 'User Preferences',
    SessionContext = 'Session Context',
    LongTermMemory = 'Long-term Memory',
    WorkingMemory = 'Working Memory',
}

enum RetentionPolicy {
    TTL = 'TTL (time-to-live)',
    SizeLimits = 'Size Limits',
    ArchivalRules = 'Archival Rules',
}

enum IndexingStrategy {
    Temporal = 'Temporal Indexing',
    Content = 'Content Indexing',
    User = 'User Indexing',
}

interface FormBodyProp {
    isFetching: boolean;
    databaseData: DatabaseType[];
}

export const FormBody = ({ isFetching, databaseData }: FormBodyProp) => {
    const memoryTypeOptions = Object.values(MemoryType).map(type => ({
        value: type,
        name: type,
    }));

    const retentionPolicyOptions = Object.values(RetentionPolicy).map(type => ({
        value: type,
        name: type,
    }));

    const indexingStrategyOptions = Object.values(IndexingStrategy).map(type => ({
        value: type,
        name: type,
    }));

    if (isFetching) {
        return (
            <div className="flex flex-col items-center gap-y-2 mt-[50%]">
                <Spinner />
                <p>Please wait form is loading</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
                <Input className="w-full" placeholder="Enter your memory store name" label="Memory Store Name" />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <Textarea
                    rows={7}
                    className="w-full"
                    placeholder="Enter your memory store description"
                    label="Memory Store Description"
                />
            </div>
            <div className="col-span-1 sm:col-span-2 flex gap-x-4">
                <Select
                    label="Storage"
                    placeholder="Select from configured databases"
                    options={databaseData.map(database => {
                        return { value: database.id, name: database.name };
                    })}
                />
                <Select label="Memory Types" placeholder="Select from memory Types" options={memoryTypeOptions} />
            </div>
            <div className="col-span-1 sm:col-span-2 flex gap-x-4">
                <Select
                    label="Retention Policy"
                    placeholder="Select from retention Policy"
                    options={retentionPolicyOptions}
                />
                <Select
                    label="Indexing Strategy"
                    placeholder="Select from indexing Strategy"
                    options={indexingStrategyOptions}
                />
            </div>
        </div>
    );
};
