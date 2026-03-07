import React from 'react';
import { ShieldUser, User, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { EmailType } from '@/enums';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context';

interface UserListProps {
    emails: string[];
    admins?: string[];
    mangeUserRole: (index: number, type: EmailType) => void;
    remove: (index: number, type: EmailType) => void;
    type: EmailType;
}

const ADMIN_ICON_SCALE = 0.85;

export const UserList = ({ emails, admins = [], mangeUserRole, remove, type }: UserListProps) => {
    const { user, isSuperAdmin } = useAuth();
    return (
        <React.Fragment>
            {emails?.map((email, index) => {
                return (
                    <div key={email} className="workspace-user-inline-card flex items-center w-full py-3">
                        <div className="flex w-full items-center gap-x-2">
                            <div className="avatar bg-[#F0F5FF] w-7 h-6 rounded-full flex items-center justify-center pl-[1px]">
                                <User size={14} className="text-blue-600" />
                            </div>
                            <p className="text-xs text-gray-700 hover:text-gray-800 dark:text-gray-300 truncate w-full">
                                {email}
                            </p>
                        </div>
                        <div className="flex items-center gap-x-2">
                            <motion.div whileTap={{ scale: ADMIN_ICON_SCALE }}>
                                <ShieldUser
                                    size={18}
                                    className={cn('cursor-pointer', {
                                        'text-blue-600 dark:text-blue-400': type === EmailType.Admin,
                                        'text-gray-700 dark:text-gray-400': type === EmailType.User,
                                    })}
                                    onClick={() =>
                                        (!((email === user?.email) || admins.includes(email)) || isSuperAdmin) &&
                                        mangeUserRole(index, type)
                                    }
                                />
                            </motion.div>
                            {(!((email === user?.email) || admins.includes(email)) || isSuperAdmin) && (
                                <X
                                    size={16}
                                    className="cursor-pointer text-gray-700 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-500"
                                    onClick={() => remove(index, type)}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </React.Fragment>
    );
};
