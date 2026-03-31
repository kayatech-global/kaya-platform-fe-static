import React from 'react';
import { Button, Input, Metadata, Spinner, Textarea } from '@/components';
import UserInputs from './user-input';
import { DialogBody, DialogFooter } from '@/components/atoms/dialog';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/atoms/tooltip';
import { EmailType } from '@/enums';
import { useWorkspace } from '@/hooks/use-workspace';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context';


export interface WorkspaceFormProps {
    onClose: () => void;
    refetchEnvironment: () => void;
    workspaceId: number | string | undefined;
    metadataCollection: string[];
}

const WorkspaceForm = ({ onClose, refetchEnvironment, workspaceId, metadataCollection }: WorkspaceFormProps) => {
    const { isSuperAdmin } = useAuth();
    const {
        isLoading,
        isFormLoading,
        loading,
        isFetching,
        hasErrors,
        errors,
        requiredUserEmail,
        workspaceNameValidation,
        workspaceDescriptionValidation,
        admins,
        control,
        metadata,
        metadataList,
        hasDuplicateMetadata,
        register,
        setValue,
        getValues,
        manageUserEmail,
        removeEmailByType,
        mangeUserRole,
        watch,
        trigger,
        validateEmail,
        validateWorkspaceName,
        validateWorkspaceDescription,
        handleSubmit,
        onHandleSubmit,
        buttonText,
        addMetadata,
        appendMetadata,
        removeMetadata,
        workspaceCreateError,
    } = useWorkspace({ onClose, refetchEnvironment, workspaceId, metadataCollection });

    return (
        <>
            {isFormLoading ? (
                <div className="my-20">
                    <div className="flex justify-center w-full h-fit">
                        <div className="z-50 flex items-center flex-col gap-y-2">
                            <Spinner />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <DialogBody className="pb-2 max-h-[calc(90vh-200px)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                        <div className={cn('flex gap-y-4 gap-x-4 flex-col')}>
                            <div className={cn('flex flex-col gap-y-4')}>
                                <Input
                                    {...register('name', {
                                        ...workspaceNameValidation,
                                        validate: value => validateWorkspaceName(value),
                                    })}
                                    placeholder="Enter your workspace name"
                                    label="Workspace Name *"
                                    isDestructive={!!errors?.name?.message}
                                    supportiveText={errors?.name?.message}
                                />
                                <Textarea
                                    {...register('description', {
                                        ...workspaceDescriptionValidation,
                                        validate: value => validateWorkspaceDescription(value),
                                    })}
                                    placeholder="Enter workspace description"
                                    className="resize-none"
                                    label="Description *"
                                    rows={4}
                                    isDestructive={!!errors?.description?.message}
                                    supportiveText={errors?.description?.message}
                                />
                                <Metadata
                                    label="Workspace Metadata"
                                    namePrefix="metadata"
                                    namePlaceholder="Select or Create name"
                                    valuePlaceholder="Enter value"
                                    fields={metadata}
                                    control={control}
                                    isRequired={true}
                                    errors={errors}
                                    metadataList={metadataList}
                                    isDestructive={hasDuplicateMetadata}
                                    disabledAdd={hasDuplicateMetadata}
                                    supportiveText={
                                        hasDuplicateMetadata
                                            ? 'Duplicate entries found in workspace metadata'
                                            : undefined
                                    }
                                    list={watch('metadata') || []}
                                    register={register}
                                    setValue={setValue}
                                    watch={watch}
                                    append={appendMetadata}
                                    remove={index => removeMetadata(index)}
                                    disabledInputs={!isSuperAdmin}
                                    onCreate={addMetadata}
                                />
                            </div>
                            <div className={cn('flex flex-col gap-y-3')}>
                                <UserInputs
                                    register={register}
                                    keyName="email"
                                    label="Workspace Users *"
                                    placeHolder="Enter workspace users emails"
                                    admins={admins}
                                    userEmails={getValues('userEmails')}
                                    adminEmails={getValues('adminEmails')}
                                    handleAddUser={manageUserEmail}
                                    remove={removeEmailByType}
                                    mangeUserRole={mangeUserRole}
                                    errors={errors?.email?.message}
                                    value={watch('email')}
                                    options={{ validate: (value: string) => validateEmail(value, EmailType.User) }}
                                    hasCommonErrors={
                                        !!(errors?.email?.message && errors?.email?.message !== requiredUserEmail) ||
                                        isFetching
                                    }
                                    adminUsersError={errors?.adminEmails?.message}
                                />
                            </div>
                            {workspaceCreateError && (
                                <div className="p-3 bg-red-50 border-l-4 border-red-400 border-y border-r border-r-red-400 rounded-md dark:bg-red-900 dark:border-l-4 dark:border-red-600 dark:border-y dark:border-r dark:border-y-red-600 dark:border-r-red-600">
                                    <p className="text-xs text-red-600 dark:text-red-100">{workspaceCreateError}</p>
                                </div>
                            )}
                        </div>
                    </DialogBody>
                    <DialogFooter className="py-4">
                        <div className="flex justify-end flex-col items-end">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            onClick={handleSubmit(onHandleSubmit)}
                                            size={'sm'}
                                            loading={isLoading || loading || isFetching}
                                            disabled={hasErrors}
                                        >
                                            {buttonText()}
                                        </Button>
                                    </TooltipTrigger>
                                    {hasErrors && (
                                        <TooltipContent side="left" align="center">
                                            All details need to be filled before the form can be saved
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </DialogFooter>
                </>
            )}
        </>
    );
};

export default WorkspaceForm;
