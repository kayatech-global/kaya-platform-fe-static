'use client';
import React from 'react';
import Image from 'next/image';
import { Layers, FileKey2 } from 'lucide-react';

import { SidebarHeader, useSidebar } from './sidebar';
import { cn } from '@/lib/utils';
import { useMainNavigation } from '@/context/main-navigation-context';

type MainNavItem = 'workspaces' | 'licensing';

const AppSidebarHeader = () => {
    const { state } = useSidebar();
    const { activeNav, setActiveNav } = useMainNavigation();
    const appLogo = state === 'expanded' ? '/png/kaya-logo-light.png' : '/png/kaya-logo-light-small.png';

    const navItems: { id: MainNavItem; label: string; icon: React.ReactNode }[] = [
        { id: 'workspaces', label: 'Workspaces', icon: <Layers className="size-4" /> },
        { id: 'licensing', label: 'Licensing', icon: <FileKey2 className="size-4" /> },
    ];

    return (
        <SidebarHeader className={cn('flex flex-col gap-y-4 py-4', { 'items-center': state === 'collapsed' })}>
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
                    style={{ width: 'auto', height: 'auto' }}
                />
            </div>

            {/* Main Navigation Tabs */}
            <nav
                className={cn('flex gap-2 px-4', {
                    'flex-col px-2': state === 'collapsed',
                })}
            >
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveNav(item.id)}
                        className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
                            'text-white/70 hover:text-white hover:bg-white/10',
                            {
                                'bg-white/20 text-white': activeNav === item.id,
                                'justify-center px-2': state === 'collapsed',
                            }
                        )}
                        title={state === 'collapsed' ? item.label : undefined}
                    >
                        {item.icon}
                        {state === 'expanded' && <span>{item.label}</span>}
                    </button>
                ))}
            </nav>
        </SidebarHeader>
    );
};

export default AppSidebarHeader;
