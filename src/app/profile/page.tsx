'use client';

import React, { useEffect, useState } from 'react';
import { Separator } from '@/components/atoms/separator';
import { Button } from '@/components/atoms/button';
import { Alert } from '@/components/atoms/alert';
import { AlertVariant } from '@/enums/component-type';
import { IUserProfile } from '@/models/profile.model';
import { MOCK_USER_PROFILE } from '@/mocks/user-profile-mock';
import { ProfileSkeleton } from './components/profile-skeleton';
import { AvatarSection } from './components/avatar-section';
import { PersonalInfoSection } from './components/personal-info-section';
import { TimezoneSection } from './components/timezone-section';
import { RolesMembershipsSection } from './components/roles-memberships-section';
import { AccountMetadataSection } from './components/account-metadata-section';
import { RefreshCw, User } from 'lucide-react';

type PageState = 'loading' | 'error' | 'empty' | 'success';

const ProfilePage = () => {
    const [state, setState] = useState<PageState>('loading');
    const [profile, setProfile] = useState<IUserProfile | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setProfile(MOCK_USER_PROFILE);
            setState('success');
        }, 1200);

        return () => clearTimeout(timer);
    }, []);

    const handleRetry = () => {
        setState('loading');
        setProfile(null);
        setTimeout(() => {
            setProfile(MOCK_USER_PROFILE);
            setState('success');
        }, 1200);
    };

    if (state === 'loading') {
        return <ProfileSkeleton />;
    }

    if (state === 'error') {
        return (
            <div className="flex flex-col items-center justify-center gap-y-4 py-20">
                <Alert
                    variant={AlertVariant.Error}
                    title="Failed to load profile"
                    message="Something went wrong while fetching your profile data. Please try again."
                />
                <Button
                    variant="secondary"
                    size="sm"
                    leadingIcon={<RefreshCw size={14} />}
                    onClick={handleRetry}
                >
                    Retry
                </Button>
            </div>
        );
    }

    if (state === 'empty' || !profile) {
        return (
            <div className="flex flex-col items-center justify-center gap-y-4 py-20">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-700">
                    <User size={32} className="text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">No profile data available.</p>
                <Button
                    variant="secondary"
                    size="sm"
                    leadingIcon={<RefreshCw size={14} />}
                    onClick={handleRetry}
                >
                    Refresh
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-y-6">
            {/* Page heading */}
            <div className="flex flex-col gap-y-1">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Profile</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    View and manage your account settings and preferences.
                </p>
            </div>

            <AvatarSection profile={profile} />
            <PersonalInfoSection profile={profile} />
            <TimezoneSection profile={profile} />

            <Separator />

            <RolesMembershipsSection profile={profile} />
            <AccountMetadataSection profile={profile} />
        </div>
    );
};

export default ProfilePage;
