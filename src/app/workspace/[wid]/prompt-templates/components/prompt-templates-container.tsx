'use client';
import React, { useRef, useState } from 'react';
import ActivityFeed from '@/components/molecules/activity-feed/activity-feed';
import { PromptTemplateTableContainer } from './prompt-templates-table-container';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { Button } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { usePromptTemplate } from '@/hooks/use-prompt-template';
import PromptTemplateForm from './prompt-templates-form';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/atoms/card';


export const PromptTemplateContainer = () => {
    const {
        isFetching,
        promptTemplateConfigurationTableData,
        activityData,
        errors,
        isOpen,
        isValid,
        isSaving,
        isPromptViewModelOpen,
        selectedPrompt,
        isOpenModal,
        editorContent,
        intellisenseOptions,
        loadingIntellisense,
        control,
        intelligentSource,
        setIsPromptViewModelOpen,
        bottomRef,
        onPromptTemplateFilter,
        register,
        trigger,
        watch,
        handleSubmit,
        onHandleSubmit,
        onEdit,
        setOpen,
        setValue,
        onDelete,
        getPromptViewData,
        setOpenModal,
        handleEditorChange,
        allIntellisenseValues,
        refetchVariables,
    } = usePromptTemplate();
    const { isLg, isMobile } = useBreakpoint();
    

    const workflowAuthoringPageRef = useRef<HTMLDivElement | null>(null);
    const [workflowAuthoringPageHeighInDrawer, setWorkflowAuthoringPageHeighInDrawer] = useState<number | undefined>(
        undefined
    );
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEdit, setEdit] = useState(false);

    const handleClick = () => {
        setWorkflowAuthoringPageHeighInDrawer(window.innerHeight - 141);
        setIsDrawerOpen(true);
    };

    const handleCreate = () => {
        setEdit(false);
        setOpen(true);
    };

    const handleEdit = (id: string) => {
        onEdit(id);
        setEdit(true);
        setOpen(true);
    };

    const showPromptModel = (id: string) => {
        getPromptViewData(id);
    };

    if (isFetching) return <PlatformConfigurationSuiteSkeleton hasCards={false} />;

    return (
        <React.Fragment>
            <div className="metric-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div
                        ref={workflowAuthoringPageRef}
                        className={cn('dashboard-left-section flex flex-col w-full', {
                            'gap-y-9': isLg,
                        })}
                    >
                        <PromptTemplateTableContainer
                            promptTemplates={promptTemplateConfigurationTableData}
                            onPromptTemplateFilter={onPromptTemplateFilter}
                            onNewButtonClick={() => handleCreate()}
                            onEditButtonClick={handleEdit}
                            onDelete={onDelete}
                            showPromptModel={showPromptModel}
                            onRecentActivity={handleClick}
                        />
                         

                    </div>
                </div>
            </div>
            {/* Recent activities will be shown in the below drawer on small screens */}
            <AppDrawer
                open={isDrawerOpen}
                direction={isMobile ? 'bottom' : 'right'}
                isPlainContentSheet
                setOpen={setIsDrawerOpen}
                footer={
                    <div className="flex justify-end">
                        <Button variant={'secondary'} size={'sm'} onClick={() => setIsDrawerOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                }
                content={
                    <div className={cn('activity-feed-container')}>
                        <ActivityFeed
                            data={activityData}
                            bottomRef={bottomRef}
                            activityBodyHeight={workflowAuthoringPageHeighInDrawer}
                        />
                    </div>
                }
            />
            <PromptTemplateForm
                isOpen={isOpen}
                errors={errors}
                isEdit={isEdit}
                isValid={isValid}
                isSaving={isSaving}
                isOpenModal={isOpenModal}
                editorContent={editorContent}
                intellisenseOptions={intellisenseOptions}
                loadingIntellisense={loadingIntellisense}
                control={control}
                intelligentSource={intelligentSource}
                setOpen={setOpen}
                register={register}
                trigger={trigger}
                watch={watch}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
                setOpenModal={setOpenModal}
                setValue={setValue}
                handleEditorChange={handleEditorChange}
                allIntellisenseValues={allIntellisenseValues}
                onRefetchVariables={async () => {
                    await refetchVariables();
                }}
            />

            <Dialog open={isPromptViewModelOpen} onOpenChange={setIsPromptViewModelOpen}>
                <DialogContent className="overflow-y-auto max-h-[80%] p-2">
                    <DialogHeader className="flex flex-col items-start">
                        <DialogTitle className="text-md font-bold flex items-start gap-2">
                            <Sparkles />
                            Prompt
                        </DialogTitle>
                    </DialogHeader>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full flex justify-center"
                    >
                        <Card className="w-full max-w-lg bg-gray-50 dark:bg-gray-700 max-h-[200px] overflow-y-auto">
                            <CardContent className="text-gray-700 dark:text-gray-100 text-sm p-4">
                                {selectedPrompt}
                            </CardContent>
                        </Card>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
};
 