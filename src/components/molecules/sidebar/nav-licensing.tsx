'use client';

import React from 'react';
import { FileKey2, Shield, Users, CreditCard, Settings } from 'lucide-react';
import { useSidebar } from './sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/atoms';
import { cn } from '@/lib/utils';

const licensingMenuItems = [
    {
        id: 'license-overview',
        title: 'License Overview',
        icon: FileKey2,
        description: 'View your current license status',
    },
    {
        id: 'license-management',
        title: 'License Management',
        icon: Shield,
        description: 'Manage license keys and activations',
    },
    {
        id: 'user-seats',
        title: 'User Seats',
        icon: Users,
        description: 'Manage user seat allocations',
    },
    {
        id: 'billing',
        title: 'Billing & Payments',
        icon: CreditCard,
        description: 'View billing history and payments',
    },
    {
        id: 'license-settings',
        title: 'License Settings',
        icon: Settings,
        description: 'Configure license preferences',
    },
];

export const NavLicensing = () => {
    const { state } = useSidebar();
    const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

    return (
        <div className="flex flex-col">
            {/* Licensing Header */}
            <div
                className={cn('mb-4', {
                    'px-[10px]': state === 'expanded',
                    'px-[3px]': state === 'collapsed',
                })}
            >
                <div
                    className={cn(
                        'flex items-center gap-x-3 w-full py-2.5 px-3 rounded-md',
                        'bg-[rgba(97,148,250,0.3)] border border-blue-500',
                        'dark:bg-[rgba(31,41,55,0.5)] dark:border-gray-700',
                        {
                            'justify-center': state === 'collapsed',
                        }
                    )}
                >
                    {state === 'expanded' ? (
                        <>
                            <FileKey2 size={18} className="text-gray-100 dark:text-gray-300 flex-shrink-0" />
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs font-normal text-gray-200 dark:text-gray-400 truncate">
                                    License Center
                                </span>
                                <span className="text-sm font-medium text-gray-100 dark:text-gray-200 truncate">
                                    Manage Licensing
                                </span>
                            </div>
                        </>
                    ) : (
                        <TooltipProvider>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <FileKey2 size={20} className="text-gray-100 dark:text-gray-300" />
                                </TooltipTrigger>
                                <TooltipContent sideOffset={12} align="center" side="right">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400">License Center</span>
                                        <span className="font-medium">Manage Licensing</span>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>

            {/* Menu Items */}
            <div
                className={cn('flex flex-col gap-y-1', {
                    'px-[10px]': state === 'expanded',
                    'px-[3px]': state === 'collapsed',
                })}
            >
                {licensingMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedItem === item.id;

                    return state === 'expanded' ? (
                        <button
                            key={item.id}
                            onClick={() => setSelectedItem(item.id)}
                            className={cn(
                                'flex items-center gap-x-3 w-full py-2.5 px-3 rounded-md text-left transition-all duration-200',
                                'text-gray-100 dark:text-gray-300',
                                'hover:bg-[rgba(97,148,250,0.2)] dark:hover:bg-[rgba(31,41,55,0.5)]',
                                {
                                    'bg-[rgba(97,148,250,0.2)] border border-blue-400 dark:bg-[rgba(31,41,55,0.5)] dark:border-gray-700':
                                        isSelected,
                                }
                            )}
                        >
                            <Icon size={18} className="flex-shrink-0" />
                            <span className="text-sm font-medium truncate">{item.title}</span>
                        </button>
                    ) : (
                        <TooltipProvider key={item.id}>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => setSelectedItem(item.id)}
                                        className={cn(
                                            'flex items-center justify-center w-full py-2.5 px-2 rounded-md transition-all duration-200',
                                            'text-gray-100 dark:text-gray-300',
                                            'hover:bg-[rgba(97,148,250,0.2)] dark:hover:bg-[rgba(31,41,55,0.5)]',
                                            {
                                                'bg-[rgba(97,148,250,0.2)] border border-blue-400 dark:bg-[rgba(31,41,55,0.5)] dark:border-gray-700':
                                                    isSelected,
                                            }
                                        )}
                                    >
                                        <Icon size={20} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={12} align="center" side="right">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{item.title}</span>
                                        <span className="text-xs text-gray-400">{item.description}</span>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}
            </div>
        </div>
    );
};
