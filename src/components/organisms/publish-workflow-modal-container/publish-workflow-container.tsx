import { Button, Textarea } from '@/components/atoms';
import { BannerInfo } from '@/components/atoms/banner-info';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/atoms/dialog';
import { useWorkflowPublish } from '@/hooks/useWorkflowPublish';
import { validateSpaces } from '@/lib/utils';
import { IWorkflowTypes } from '@/models';
import { CircleFadingArrowUp, SaveOff } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

interface PublishWorkflowModalContainerProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    version?: string;
    refetchGraph: () => void;
    isDraft?: boolean;
    availableVersions?: IWorkflowTypes[];
    openSaveConfirmationModal: boolean;
    setOpenSaveConfirmationModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PublishWorkflowModalContainer = ({
    open,
    setOpen,
    refetchGraph,
    availableVersions,
    openSaveConfirmationModal,
    setOpenSaveConfirmationModal,
}: PublishWorkflowModalContainerProps) => {
    const { register, watch, errors, onSubmit, handleModalCancel, isSuccessfullyPublished, isPublishing } =
        useWorkflowPublish(open, refetchGraph, setOpen, availableVersions);

    return (
        <div>
            {/* Publish form modal */}
            <Dialog open={open} onOpenChange={handleModalCancel}>
                <DialogContent hideCloseButtonClass="block top-6" className="gap-0 max-w-none w-[650px]">
                    <DialogHeader className="px-4 py-4 flex flex-row gap-x-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-200 rounded">
                            <CircleFadingArrowUp size={16} color="#316FED" />
                        </div>
                        <p className="text-md font-semibold text-gray-700 relative bottom-1 dark:text-gray-100">
                            Publish Workflow | Draft {watch('draftVersion')} &rarr; {watch('publishedVersion')}
                        </p>
                    </DialogHeader>
                    <div className="px-4 py-6 flex flex-col gap-y-6">
                        {isSuccessfullyPublished ? (
                            <div className="w-full flex flex-col gap-y-4 items-center">
                                <Image
                                    src="/png/success-publish.png"
                                    width={100}
                                    height={100}
                                    alt="publish-workflow-success"
                                />
                                <p className="text-md font-semibold text-gray-800 dark:text-gray-100">
                                    Workflow published successfully
                                </p>
                            </div>
                        ) : (
                            <>
                                <BannerInfo
                                    label={
                                        <p className="text-sm text-blue-600">
                                            Publishing this workflow will create version{' '}
                                            <span className="font-bold">{watch('publishedVersion')}</span> from the
                                            current draft <span className="font-bold">{watch('draftVersion')}</span>
                                        </p>
                                    }
                                    icon="ri-information-2-fill"
                                />
                                <Textarea
                                    {...register('comment', {
                                        validate: value => validateSpaces(value, 'publish comment'),
                                    })}
                                    label="Publish Comment"
                                    placeholder="Add a short note about the updates or changes in this version..."
                                    rows={12}
                                    className="w-full resize-none"
                                    isDestructive={!!errors?.comment?.message}
                                    supportiveText={errors?.comment?.message}
                                />
                            </>
                        )}
                    </div>
                    {!isSuccessfullyPublished && (
                        <DialogFooter>
                            <Button variant="secondary" onClick={handleModalCancel}>
                                Cancel
                            </Button>
                            {!isSuccessfullyPublished && (
                                <Button variant="primary" onClick={onSubmit} loading={isPublishing}>
                                    {isPublishing ? 'Publishing...' : 'Publish'}
                                </Button>
                            )}
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
            {/* Save confirmation modal */}
            <Dialog open={openSaveConfirmationModal} onOpenChange={setOpenSaveConfirmationModal}>
                <DialogContent hideCloseButtonClass="block top-6" className="gap-0 max-w-none w-[450px]">
                    <DialogHeader className="px-4 py-4 flex flex-row gap-x-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-200 rounded">
                            <SaveOff size={16} color="#316FED" />
                        </div>
                        <p className="text-md font-semibold text-gray-700 relative bottom-1 dark:text-gray-100">
                            Publish Without Saving?
                        </p>
                    </DialogHeader>
                    <div className="px-4 py-6 flex flex-col justify-center items-center gap-y-4">
                        <SaveOff size={96} color="#316FED" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                            You have changes that haven’t been saved. You can still proceed with publishing, but the
                            latest edits won’t be included.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button size={'sm'} variant="secondary" onClick={() => setOpenSaveConfirmationModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            size={'sm'}
                            variant="primary"
                            onClick={() => {
                                setOpen(true);
                                setOpenSaveConfirmationModal(false);
                            }}
                            loading={isPublishing}
                        >
                            Publish Anyway
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
