'use client';
import { Button, Input, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/atoms';
import { BannerInfo } from '@/components/atoms/banner-info';
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { useWorkflowCommit } from '@/hooks/useWorkflowCommit';
import { validateReleaseVersion, validateSpaces } from '@/lib/utils';
import { Dialog } from '@radix-ui/react-dialog';
import { LoaderCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useMemo } from 'react';
import IntelligenceSourceForm from '../platform-setting/intelligence-source-form';
import { Controller } from 'react-hook-form';

import TinyMCEEditor from '@/components/molecules/rich-text-editor/rich-text-editor';
import { VisuallyHidden } from 'radix-ui';

interface CommitWorkflowModalContainerProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CommitWorkflowModalContainer = ({ open, setOpen }: CommitWorkflowModalContainerProps) => {
    const {
        isFetching,
        isArtifactAvailable,
        register,
        errors,
        isValid,
        onSubmit,
        handleAutoGenerate,
        isCommitting,
        isCommittedSuccessfully,
        handleModalCancel,
        intelligentSource,
        openIntelligenceForm,
        setOpenIntelligenceForm,
        control,
        generatingReleaseNote,
        validateArtifactName,
        validateVersion,
        lastPushedVersion,
    } = useWorkflowCommit(open, setOpen);

    useEffect(() => {
        if (open) {
            document.body.style.setProperty('pointer-events', 'auto', 'important');
        }
    }, [open]);

    const isSourceUnavailable = useMemo(() => {
        return !intelligentSource || intelligentSource?.isDeleted;
    }, [intelligentSource]);

    return (
        <div>
            <Dialog open={open} onOpenChange={handleModalCancel}>
                <DialogContent hideCloseButtonClass="block top-6" className="gap-0 max-w-none w-[650px]">
                    <VisuallyHidden.Root>
                        <DialogTitle>Push Workflow to Registry</DialogTitle>
                    </VisuallyHidden.Root>
                    <DialogHeader className="px-4 py-4 flex flex-row gap-x-2">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-200 rounded">
                            <i className="ri-git-repository-commits-fill text-blue-600" />
                        </div>
                        <p className="text-md font-semibold text-gray-700 relative bottom-1 dark:text-gray-100">
                            Push Workflow to Registry
                        </p>
                    </DialogHeader>
                    {isCommittedSuccessfully ? (
                        <div className="w-full flex flex-col gap-y-4 items-center py-12">
                            <Image
                                src="/png/success-publish.png"
                                width={100}
                                height={100}
                                alt="publish-workflow-success"
                            />
                            <p className="text-md font-semibold text-gray-800 dark:text-gray-100">
                                Workflow pushed to registry successfully
                            </p>
                        </div>
                    ) : (
                        <div className="px-4 py-6 flex flex-col gap-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                            {isFetching ? (
                                <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-[450px]">
                                    <LoaderCircle
                                        className="animate-spin"
                                        size={25}
                                        width={25}
                                        height={25}
                                        absoluteStrokeWidth={undefined}
                                    />
                                    <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                        Preparing your data, just a moment...
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <BannerInfo
                                        label={
                                            <p className="text-sm text-blue-600">
                                                This action will package and push the latest published workflow version
                                                to the artifact repository.
                                            </p>
                                        }
                                        icon="ri-information-2-fill"
                                    />
                                    <Input
                                        {...register(
                                            'artifactName',
                                            isArtifactAvailable
                                                ? undefined
                                                : {
                                                      required: {
                                                          value: true,
                                                          message: 'Please enter an artifact name',
                                                      },
                                                      validate: validateArtifactName,
                                                  }
                                        )}
                                        label="Artifact Name"
                                        placeholder="Enter an Artifact Name"
                                        disabled={isArtifactAvailable}
                                        isDestructive={!!errors?.artifactName?.message}
                                        supportiveText={errors?.artifactName?.message}
                                    />
                                    <Input
                                        {...register('version', {
                                            required: { value: true, message: 'Please enter release version' },
                                            validate: {
                                                noSpace: value => validateSpaces(value, 'version'),
                                                versionFormat: value => validateReleaseVersion(value),
                                                validateWithVersion: value => validateVersion(value),
                                            },
                                        })}
                                        label="Release Version"
                                        labelInfo={lastPushedVersion ? `(Current registry version: V${lastPushedVersion})` : undefined}
                                        placeholder="e.g 2.0.1"
                                        isDestructive={!!errors?.version?.message}
                                        supportiveText={errors?.version?.message}
                                    />
                                    <fieldset className="flex flex-col gap-y-[6px]" aria-labelledby="release-note-label">
                                        <div className="flex items-center justify-between">
                                            <span id="release-note-label" className="text-sm font-medium text-gray-700 dark:text-gray-100 flex items-baseline gap-x-1">
                                                Release Note
                                            </span>
                                            <div className="flex items-center gap-x-3">
                                                {isSourceUnavailable && (
                                                    <Button
                                                        size="sm"
                                                        variant="link"
                                                        onClick={() => setOpenIntelligenceForm(true)}
                                                    >
                                                        Configure Intelligence Source
                                                    </Button>
                                                )}
                                                <TooltipProvider>
                                                    <Tooltip open={isSourceUnavailable ? undefined : false}>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                leadingIcon={<Sparkles />}
                                                                variant="secondary"
                                                                onClick={handleAutoGenerate}
                                                                disabled={isSourceUnavailable}
                                                                loading={generatingReleaseNote}
                                                            >
                                                                Auto-generate
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" align="start">
                                                            <div className="flex flex-col gap-y-1 w-[270px]">
                                                                <p className="text-gray-700 text-xs dark:text-gray-200">
                                                                    Please configure an intelligence source to generate
                                                                    the Release Note
                                                                </p>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>
                                        <Controller
                                            name="releaseNote"
                                            rules={{
                                                required: {
                                                    value: true,
                                                    message: 'Please enter a release note',
                                                },
                                                validate: value => validateSpaces(value, 'release note'),
                                            }}
                                            control={control}
                                            render={({ field, fieldState }) => (
                                                <TinyMCEEditor
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    isDestructive={!!fieldState.error?.message}
                                                    supportiveText={fieldState.error?.message}
                                                    supportMarkdown
                                                />
                                            )}
                                        />
                                    </fieldset>
                                </>
                            )}
                        </div>
                    )}
                    {!isCommittedSuccessfully && (
                        <DialogFooter>
                            <Button variant="secondary" onClick={handleModalCancel}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                disabled={!isValid || isFetching}
                                loading={isCommitting}
                                onClick={onSubmit}
                            >
                                Push Workflow
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
            {/* workspace level intelligence source picket */}
            <IntelligenceSourceForm isOpen={openIntelligenceForm} setOpen={setOpenIntelligenceForm} />
        </div>
    );
};
