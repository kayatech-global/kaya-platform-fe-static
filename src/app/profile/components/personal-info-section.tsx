'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/atoms/tooltip';
import { BadgeCheck, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IUserProfile } from '@/models/profile.model';
import { toast } from 'sonner';

interface PersonalInfoSectionProps {
    profile: IUserProfile;
}

export const PersonalInfoSection = ({ profile }: PersonalInfoSectionProps) => {
    const [firstName, setFirstName] = useState(profile.firstName);
    const [lastName, setLastName] = useState(profile.lastName);
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        setIsEditing(false);
        toast.success('Personal information updated (prototype only)');
    };

    const handleCancel = () => {
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
        setIsEditing(false);
    };

    return (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-100">Personal Information</p>
                    {!isEditing && (
                        <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                            Edit
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-4">
                {/* Full name (read-only display) */}
                <div className="flex flex-col gap-y-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {firstName} {lastName}
                    </p>
                </div>

                {/* First / Last name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={!isEditing}
                    />
                    <Input
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={!isEditing}
                    />
                </div>

                {/* Email (always read-only) */}
                <div className="flex flex-col gap-y-[6px]">
                    <div className="flex items-center gap-x-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-100">Email</p>
                        {profile.emailVerified && (
                            <Badge variant="success" size="sm" className="gap-x-1">
                                <BadgeCheck size={12} />
                                Verified
                            </Badge>
                        )}
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="relative">
                                    <Input
                                        value={profile.email}
                                        disabled
                                        trailingIcon={<Info size={14} className="text-gray-400" />}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[260px]">
                                <p>Email changes require Kaya support. Contact your administrator.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Username (read-only) */}
                <Input
                    label="Username"
                    value={profile.username}
                    disabled
                />

                {/* Action buttons */}
                {isEditing && (
                    <div className="flex items-center gap-x-3 pt-2">
                        <Button variant="primary" size="sm" onClick={handleSave}>
                            Save Changes
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
