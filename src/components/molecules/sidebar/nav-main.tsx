'use client';

import React, { useState } from 'react';

import { SIDEBAR_MAIN_MENU_GROUPS } from '@/constants';
import { NavGroupBase } from './nav-group-base';
import { useSidebar } from './sidebar';
import { cn } from '@/lib/utils';

export const NavMain = () => {
    const [selectedMenuGroupId, setSelectedMenuGroupId] = useState<string | undefined>(SIDEBAR_MAIN_MENU_GROUPS[0].id);
    const { state } = useSidebar();

    return (
        <div
            className={cn('flex flex-col gap-y-4', {
                'px-[10px]': state === 'expanded',
                'px-[3px]': state === 'collapsed',
            })}
        >
            {SIDEBAR_MAIN_MENU_GROUPS.map(group => {
                return (
                    <NavGroupBase
                        key={group.id}
                        menuGroupItem={group}
                        selectedMenuGroupId={selectedMenuGroupId}
                        setSelectedMenuGroupId={setSelectedMenuGroupId}
                    />
                );
            })}
        </div>
    );
};
