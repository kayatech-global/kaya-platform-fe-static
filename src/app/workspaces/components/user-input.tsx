'use client';
import { Button, Input } from '@/components';
import React, { useState } from 'react';
import { RegisterOptions, UseFormRegister } from 'react-hook-form';
import { IWorkspaceForm } from '@/models';
import { EmailType } from '@/enums';

import { cn } from '@/lib/utils';
import { UserInputHeader } from './user-input-header';
import { UserList } from './user-list';
import { ShieldUser } from 'lucide-react';

interface UserInputsProps {
    label: string;
    placeHolder: string;
    handleAddUser: () => void;
    register: UseFormRegister<IWorkspaceForm>;
    keyName: string;
    admins: string[];
    userEmails: string[];
    adminEmails: string[];
    remove: (index: number, type: EmailType) => void;
    mangeUserRole: (index: number, type: EmailType) => void;
    errors: string | undefined;
    value: string | undefined;
    options?: RegisterOptions<IWorkspaceForm, never>;
    hasCommonErrors: boolean;
    adminUsersError: string | undefined;
}

const UserInputs = ({
    label,
    placeHolder,
    handleAddUser,
    register,
    keyName,
    admins,
    userEmails,
    adminEmails,
    remove,
    mangeUserRole,
    errors,
    value,
    options,
    hasCommonErrors,
    adminUsersError,
}: UserInputsProps) => {
    const [expandUserList, setExpandUserList] = useState(true);

    return (
        <div className="flex flex-col gap-y-2">
            <p className="text-xs text-[#4B5563]">
                Enter the user&apos;s email and click the &quot;Add&quot; button. Once the user is added, click on the{' '}
                <span>
                    <ShieldUser size={14} className="text-blue-600 dark:text-blue-400 inline-block mb-[1px] mr-[1px]" />
                </span>{' '}
                to assign them as an admin, granting them the necessary permissions to manage the workspace efficiently.
            </p>
            <div className={cn('flex gap-x-2 items-end')}>
                <Input
                    {...register(keyName as never, options ?? {})}
                    placeholder={placeHolder}
                    label={label}
                    isDestructive={!!errors}
                />
                <Button
                    disabled={!value || value === '' || hasCommonErrors}
                    className="text-nowrap"
                    size={'sm'}
                    onClick={handleAddUser}
                >
                    Add user
                </Button>
            </div>
            {errors && <p className="text-xs text-red-500">{errors}</p>}
            {(userEmails?.length > 0 || adminEmails?.length > 0) && (
                <div
                    className={cn('flex flex-col border border-[#E5E7EB] rounded-lg px-2 dark:border-gray-700', {
                        '!border-red-300': adminUsersError,
                    })}
                >
                    <UserInputHeader
                        expandUserList={expandUserList}
                        setExpandUserList={setExpandUserList}
                        userEmails={userEmails}
                        adminEmails={adminEmails}
                    />
                    <div
                        className={cn(
                            'flex flex-col pr-1 w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500',
                            {
                                hidden: !expandUserList,
                            }
                        )}
                    >
                        <UserList
                            type={EmailType.Admin}
                            emails={adminEmails}
                            admins={admins}
                            remove={remove}
                            mangeUserRole={mangeUserRole}
                        />
                        <UserList
                            type={EmailType.User}
                            emails={userEmails}
                            remove={remove}
                            mangeUserRole={mangeUserRole}
                        />
                    </div>
                    {adminUsersError && <p className="text-xs pb-2 text-red-500">{adminUsersError}</p>}
                </div>
            )}
        </div>
    );
};

export default UserInputs;
