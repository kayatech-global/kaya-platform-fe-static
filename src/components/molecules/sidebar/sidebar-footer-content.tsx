'use client';
import React, { useState } from 'react';
import { MoreHorizontal, Settings, Columns3, ShieldCheck, Network } from 'lucide-react';
import { useSidebar } from './sidebar';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { IntelligenceSourceForm, WebHookSettingForm } from '@/components/organisms';
import Link from 'next/link';
import { GuardrailSelector } from '@/app/editor/[wid]/[workflow_id]/components/guardrail-selector';
import { GuardrailBindingLevelType } from '@/enums';
import { useGuardrail } from '@/hooks/use-common';
import { useAuth } from '@/context';

export const SidebarFooterContent = () => {
    const { isWorkspaceAdmin } = useAuth();
    const { state } = useSidebar();
    const { isMobile } = useBreakpoint();
    const [isOpen, setOpen] = useState(false);
    const [isWebHookSettingOpen, setIsWebHookSettingsOpen] = useState(false);
    const { guardrailRef, guardrails, guardrailsLoading, onGuardrail, onRefetch, onWorkspaceGuardrailsChange } =
        useGuardrail();

    return (
        <React.Fragment>
            <div className="flex flex-col gap-y-2">
                <Link href="/workspaces" className="w-full">
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <div
                                    className={cn(
                                        'footer-item-base pr-3 pl-2 py-2 w-full flex justify-between cursor-pointer hover:bg-blue-600 hover:dark:bg-[rgba(31,41,55,0.5)] rounded-md translate-x-0 ease-in-out duration-200',
                                        {
                                            'px-0 cursor-pointer': state === 'collapsed',
                                        }
                                    )}
                                >
                                    <div className="flex items-center gap-x-2">
                                        <i className="ri-arrow-go-back-fill text-md text-gray-300" />
                                        <p
                                            className={cn('text-sm text-gray-100 border-none dark:text-gray-300', {
                                                hidden: state === 'collapsed',
                                            })}
                                        >
                                            Back to workspaces
                                        </p>
                                    </div>
                                </div>
                            </TooltipTrigger>
                            {state === 'collapsed' && (
                                <TooltipContent sideOffset={12} align="start" alignOffset={0} side="right">
                                    <p>Back to workspaces</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </Link>
                {/* Setting menu with dropdown */}
                <DropdownMenu>
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    <div
                                        className={cn(
                                            'footer-item-base pr-3 pl-2 py-2 w-full flex justify-between cursor-pointer hover:bg-blue-600 hover:dark:bg-[rgba(31,41,55,0.5)] rounded-md translate-x-0 ease-in-out duration-200',
                                            {
                                                'px-0 cursor-pointer': state === 'collapsed',
                                            }
                                        )}
                                    >
                                        {state === 'expanded' && (
                                            <div className="flex items-center gap-x-2">
                                                <Settings
                                                    width={20}
                                                    height={20}
                                                    className="text-gray-100 stroke-[1.5px] dark:text-gray-300"
                                                />
                                                <p className="text-sm text-gray-100 border-none dark:text-gray-300">
                                                    Settings
                                                </p>
                                            </div>
                                        )}
                                        <MoreHorizontal
                                            width={20}
                                            height={20}
                                            className="text-gray-100 stroke-[1.5px] dark:text-gray-300"
                                        />
                                    </div>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            {state === 'collapsed' && (
                                <TooltipContent sideOffset={12} align="start" alignOffset={0} side="right">
                                    <p>Settings</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                    {/* setting dropdown */}
                    <DropdownMenuContent
                        side={isMobile ? 'bottom' : 'top'}
                        align="end"
                        className="min-w-48 rounded-lg"
                    >
                        <DropdownMenuLabel className="flex items-center gap-2 px-3 text-sm font-medium">
                            <span>Settings</span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                        <DropdownMenuItem asChild onClick={() => setOpen(true)}>
                            <div className="flex w-full cursor-pointer items-center pr-3 py-[6px] text-left text-xs text-gray-500 dark:text-gray-300">
                                <Columns3 className="h-4 w-4" />
                                Workspace Intelligence Source
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild onClick={() => setIsWebHookSettingsOpen(true)}>
                            <div className="flex w-full cursor-pointer items-center pr-3 py-[6px] text-left text-xs text-gray-500 dark:text-gray-300">
                                <Network className="h-4 w-4" />
                                Webhook Configurations
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild onClick={onGuardrail}>
                            <div className="flex w-full cursor-pointer items-center pr-3 py-[6px] text-left text-xs text-gray-500 dark:text-gray-300">
                                <ShieldCheck className="h-4 w-4" />
                                Workspace Guardrails
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <IntelligenceSourceForm isOpen={isOpen} setOpen={setOpen} />
            <GuardrailSelector
                ref={guardrailRef}
                allGuardrails={guardrails ?? []}
                guardrailsLoading={guardrailsLoading}
                title="Workspace Level Guardrails"
                level={GuardrailBindingLevelType.WORKSPACE}
                isReadonly={!isWorkspaceAdmin}
                onRefetch={onRefetch}
                onGuardrailsChange={onWorkspaceGuardrailsChange}
            />
            <WebHookSettingForm isOpen={isWebHookSettingOpen} setOpen={setIsWebHookSettingsOpen} />
        </React.Fragment>
    );
};
