'use client';
import React from 'react';
import Image from 'next/image';

import { SidebarHeader, useSidebar } from './sidebar';
import { cn } from '@/lib/utils';

const AppSidebarHeader = () => {
    const { state } = useSidebar();
    const appLogo = state === 'expanded' ? '/png/kaya-logo-light.png' : '/png/kaya-logo-light-small.png';

    return (
        <SidebarHeader className={cn('flex flex-col gap-y-8 py-4', { 'items-center': state === 'collapsed' })}>
            <div
                className={cn('logo w-fit h-fit pl-6 py-[6.5px]', {
                    'px-2': state === 'collapsed',
                })}
            >
                <Image
                    alt="kaya-logo"
                    width={state === 'collapsed' ? 20 : 142}
                    height={state === 'collapsed' ? 20 : 29}
                    src={appLogo}
                />
            </div>
        </SidebarHeader>
    );
};

export default AppSidebarHeader;
