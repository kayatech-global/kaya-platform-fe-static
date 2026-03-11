import { CalendarSync, Ellipsis, Pencil, Plus, Trash } from 'lucide-react';
import React from 'react';
import AvatarGroup, { AvatarGroupProps } from '../avatar-group/avatar-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/atoms';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';
import { getWorkspacePath } from '@/lib/utils';
import { IWorkspaceMetadata } from '@/models';

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
    onSkeltonClick?: () => void;
    onEditClick: (workspaceId: number | string) => void;
    onDeleteClick: (workspaceId: number | string) => void;
}

const WorkspaceCard = ({
    uuid,
    avatars,
    name,
    description,
    createdAt,
    showSkelton = false,
    showOptions = false,
    cardWidth = '!w-[300px]',
    onSkeltonClick,
    onEditClick,
    onDeleteClick,
}: WorkspaceCardProps) => {
    const router = useRouter();
    const date = moment(createdAt).format('DD MMM YY');

    const [workspaceInfo, setWorkspaceInfo] = useLocalStorage('workspaceInfo');

    const cardOnClick = () => {
        setWorkspaceInfo({ id: String(uuid), name: name });
        router.push(getWorkspacePath('/workspace/[wid]/overview', String(uuid)));
    };

    return (
        <React.Fragment>
            {!showSkelton ? (
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
                                        <Trash />
                                        <p>Delete</p>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                    <div className="realm-card-body px-4 min-h-[72px] overflow-hidden _">
                        <p className="text-xs font-normal text-gray-500 dark:text-gray-400">{description}</p>
                    </div>
                    <div className="realm-card-footer px-4 py-3 flex justify-between items-center border-t border-gray-200 dark:border-gray-600">
                        {avatars && <AvatarGroup avatars={avatars} />}
                        <div className="realm-update-date flex items-center gap-x-1">
                            <CalendarSync size={16} className="text-gray-500 dark:text-gray-300" />
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-300">{date}</p>
                        </div>
                    </div>
                </div>
            ) : (
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
            )}
        </React.Fragment>
    );
};

export default WorkspaceCard;
