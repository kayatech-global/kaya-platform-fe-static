'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/atoms/tooltip';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import type React from 'react';

interface UserInputHeaderProps {
    userEmails: string[];
    adminEmails: string[];
    expandUserList: boolean;
    setExpandUserList: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UserInputHeader = ({
    userEmails,
    adminEmails,
    expandUserList,
    setExpandUserList,
}: UserInputHeaderProps) => {
    const combinedEmails = [...userEmails, ...adminEmails];
    const totalUsers = userEmails.length + adminEmails.length;

    if (totalUsers <= 1) return null;

    return (
        <div
            className={cn(
                'flex items-center justify-between border-border/50 transition-all duration-200',
                expandUserList && 'border-b'
            )}
        >
            <div className="flex items-center gap-3 py-3">
                <div className="flex items-center -space-x-2">
                    {combinedEmails.slice(0, 3).map((email) => (
                        <TooltipProvider key={email}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-blue-50 ring-1 ring-blue-100 transition-transform hover:scale-110 hover:z-10">
                                        <User size={14} className="text-blue-600" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[300px]">
                                    <p className="break-words text-sm">{email}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>

                <button
                    onClick={() => setExpandUserList(!expandUserList)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
                >
                    {combinedEmails[0]} and {totalUsers - 1} others
                </button>
            </div>

            <button
                onClick={() => setExpandUserList(!expandUserList)}
                className="flex items-center justify-center p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                aria-label={expandUserList ? 'Collapse user list' : 'Expand user list'}
            >
                {expandUserList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
        </div>
    );
};
