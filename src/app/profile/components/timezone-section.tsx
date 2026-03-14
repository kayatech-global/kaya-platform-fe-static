'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/atoms/card';
import { Select } from '@/components/atoms/select';
import { Button } from '@/components/atoms/button';
import { Globe } from 'lucide-react';
import { IUserProfile } from '@/models/profile.model';
import { TIMEZONE_OPTIONS } from '@/mocks/user-profile-mock';
import { toast } from 'sonner';

interface TimezoneSectionProps {
    profile: IUserProfile;
}

export const TimezoneSection = ({ profile }: TimezoneSectionProps) => {
    const [timezone, setTimezone] = useState(profile.timezone ?? 'UTC');
    const [savedTimezone, setSavedTimezone] = useState(profile.timezone ?? 'UTC');
    const hasChanges = timezone !== savedTimezone;

    const handleSave = () => {
        setSavedTimezone(timezone);
        toast.success(`Timezone updated to ${timezone} (prototype only)`);
    };

    return (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-100">Timezone</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-4">
                <Select
                    label="Preferred Timezone"
                    options={TIMEZONE_OPTIONS}
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    leadingIcon={<Globe size={16} />}
                    placeholder="Select a timezone"
                />
                {hasChanges && (
                    <div className="flex items-center gap-x-3">
                        <Button variant="primary" size="sm" onClick={handleSave}>
                            Update Timezone
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setTimezone(savedTimezone)}
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
