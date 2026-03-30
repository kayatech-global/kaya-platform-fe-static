'use client';

import React, { useState } from 'react';

import { SIDEBAR_MAIN_MENU_GROUPS } from '@/constants';
import { NavGroupBase } from './nav-group-base';
import { NavWorkspaceOverview } from './nav-workspace-overview';
import { useSidebar } from './sidebar';
import { cn } from '@/lib/utils';

export const NavMain = () => {
    const [selectedMenuGroupId, setSelectedMenuGroupId] = useState<string | undefined>(SIDEBAR_MAIN_MENU_GROUPS[0].id);
    const { state } = useSidebar();
    
    console.log("[v0] SIDEBAR_MAIN_MENU_GROUPS:", SIDEBAR_MAIN_MENU_GROUPS.map(g => g.title));

    return (
        <div className="flex flex-col">
            {/* Workspace Overview Link - Shows workspace name */}
            <NavWorkspaceOverview />

            {/* Menu Groups */}
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
        </div>
    );
};
