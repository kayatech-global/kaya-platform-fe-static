import { CalendarSync, Ellipsis, Pencil, Plus, Trash, Wallet } from 'lucide-react';
import React from 'react';
import AvatarGroup, { AvatarGroupProps } from '../avatar-group/avatar-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/atoms';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';
import { getWorkspacePath } from '@/lib/utils';
import { IWorkspaceMetadata } from '@/models';

export type GovernanceBadge = {
    label: string;
    variant: 'production' | 'dev' | 'staging' | 'compliant' | 'warning' | 'quota';
};

export interface WorkspaceCardProps extends AvatarGroupProps {
    id: number | string;
    uuid: string;
    name: string;
    description: string;
    metadata?: IWorkspaceMetadata[];
    createdAt: Date;
    showSkelton?: boolean;
    showOptions?: boolean;
    cardWidth?: string;
    governanceBadges?: GovernanceBadge[];
    allocatedBudget?: number;
    remainingBudget?: number;
    onSkeltonClick?: () => void;
    onEditClick: (workspaceId: number | string) => void;
    onDeleteClick: (workspaceId: number | string) => void;
    onAllocateCreditBudget?: (workspaceId: number | string) => void;
}

const getBadgeStyles = (variant: GovernanceBadge['variant']) => {
    switch (variant) {
        case 'production':
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        case 'dev':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'staging':
            return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'compliant':
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        case 'warning':
            return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
        case 'quota':
            return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
};

const WorkspaceCard = ({
    uuid,
    avatars,
    name,
    description,
    createdAt,
    showSkelton = false,
    showOptions = false,
    cardWidth = '!w-[300px]',
    governanceBadges,
    allocatedBudget,
    remainingBudget,
    onSkeltonClick,
    onEditClick,
    onDeleteClick,
    onAllocateCreditBudget,
}: WorkspaceCardProps) => {
    const router = useRouter();
    const date = moment(createdAt).format('DD MMM YY');

    const [workspaceInfo, setWorkspaceInfo] = useLocalStorage('workspaceInfo');

    const cardOnClick = () => {
        setWorkspaceInfo({ id: String(uuid), name: name });
        router.push(getWorkspacePath('/workspace/[wid]/overview', String(uuid)));
    };

    if (showSkelton) {
        return (
            <button
                type="button"
                onClick={() => onSkeltonClick?.()}
                className="flex items-center justify-center realm-card !w-[300px] h-[187px] bg-white border border-gray-300 border-dashed rounded-lg flex-col gap-y-3 cursor-pointer hover:bg-gray-100 hover:shadow-sm dark:bg-gray-700 dark:hover:bg-gray-600"
                aria-label="Create new workspace"
            >
                <div className="group w-6 h-6 border border-gray-300 border-dashed rounded-full flex justify-center items-center">
                    <Plus size={12} />
                </div>
                <p className="text-gray-500 font-medium text-xs dark:text-gray-300">New Workspace</p>
            </button>
        );
    }

    return (
        <div
            className={`realm-card ${cardWidth} min-h-[180px] h-fit bg-white border border-gray-200 rounded-lg flex flex-col gap-y-3 pt-4 hover:shadow-sm dark:bg-gray-700 dark:border-gray-600`}
        >
            <div className="realm-card-header px-4 flex justify-between items-center">
                <button
                    type="button"
                    id={workspaceInfo?.name}
                    className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-700 dark:text-gray-200 dark:hover:text-blue-300 bg-transparent border-none p-0 text-left flex-1 min-w-0"
                    onClick={cardOnClick}
                >
                    {name}
                </button>
                {showOptions && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="stroke-1 text-gray-500 cursor-pointer dark:text-gray-200 p-0 bg-transparent border-none"
                                aria-label="Workspace options"
                            >
                                <Ellipsis size={16} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom">
                            <DropdownMenuItem onClick={() => onEditClick(uuid)}>
                                <Pencil size={12} />
                                <p>Edit</p>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDeleteClick(uuid)}>
                                <Trash size={12} />
                                <p>Delete</p>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onAllocateCreditBudget?.(uuid)}>
                                <Wallet size={12} />
                                <p>Allocate Credit Budget</p>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
            <div className="realm-card-body px-4 min-h-[72px] overflow-hidden">
                <p className="text-xs font-normal text-gray-500 dark:text-gray-400">{description}</p>
                {/* Budget Chips */}
                {(allocatedBudget !== undefined && allocatedBudget > 0) && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            Allocated: {allocatedBudget.toLocaleString()}
                        </span>
                        {remainingBudget !== undefined && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Remaining: {remainingBudget.toLocaleString()}
                            </span>
                        )}
                    </div>
                )}
                {governanceBadges && governanceBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {governanceBadges.map((badge, index) => (
                            <span
                                key={index}
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${getBadgeStyles(badge.variant)}`}
                            >
                                {badge.label}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div className="realm-card-footer px-4 py-3 flex justify-between items-center border-t border-gray-200 dark:border-gray-600">
                {avatars && <AvatarGroup avatars={avatars} />}
                <div className="realm-update-date flex items-center gap-x-1 ml-auto">
                    <CalendarSync size={16} className="text-gray-500 dark:text-gray-300" />
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-300">{date}</p>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceCard;
