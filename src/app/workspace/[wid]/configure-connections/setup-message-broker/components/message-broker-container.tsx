'use client';

import React from 'react';
import { MessageBrokerTableContainer } from './message-broker-table-container';
import { MessageBrokerForm } from './message-broker-form';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { useMessageBroker } from '@/hooks/use-message-broker';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';

export const MessageBrokerContainer = () => {
    const { isLg } = useBreakpoint();
    const {
        isFetching,
        isOpen,
        isEdit,
        messageBrokerTableData,
        errors,
        isSaving,
        isValid,
        control,
        secrets,
        loadingSecrets,
        isTopicsTitleValid,
        loadingIntellisense,
        allIntellisenseValues,
        intellisenseOptions,
        messageBrokerProviders,
        topicFields,
        register,
        setValue,
        watch,
        trigger,
        handleSubmit,
        onHandleSubmit,
        setOpen,
        appendTopic,
        removeTopic,
        validateUniqueTitle,
        handleCreate,
        onMessageBrokerFilter,
        onEdit,
        onDelete,
        refetch,
        refetchVariables,
    } = useMessageBroker();

    if (isFetching) return <PlatformConfigurationSuiteSkeleton hasCards={false} />;

    return (
        <div className="metric-page pb-4">
            <div className="flex justify-between gap-x-9">
                <div
                    className={cn('dashboard-left-section flex flex-col w-full', {
                        'gap-y-9': isLg,
                    })}
                >
                    <MessageBrokerTableContainer
                        messageBrokers={messageBrokerTableData}
                        messageBrokerProviders={messageBrokerProviders}
                        onMessageBrokerFilter={onMessageBrokerFilter}
                        onNewButtonClick={handleCreate}
                        onEditButtonClick={onEdit}
                        onDelete={onDelete}
                    />
                </div>
            </div>

            <MessageBrokerForm
                isOpen={isOpen}
                isEdit={isEdit}
                errors={errors}
                isSaving={isSaving}
                isValid={isValid}
                control={control}
                secrets={secrets}
                loadingSecrets={loadingSecrets}
                isTopicsTitleValid={isTopicsTitleValid}
                loadingIntellisense={loadingIntellisense}
                allIntellisenseValues={allIntellisenseValues}
                intellisenseOptions={intellisenseOptions}
                messageBrokerProviders={messageBrokerProviders}
                topicFields={topicFields}
                setOpen={setOpen}
                register={register}
                setValue={setValue}
                watch={watch}
                trigger={trigger}
                appendTopic={appendTopic}
                removeTopic={removeTopic}
                validateUniqueTitle={validateUniqueTitle}
                handleSubmit={handleSubmit}
                onHandleSubmit={onHandleSubmit}
                refetch={refetch}
                refetchVariables={async () => {
                    await refetchVariables();
                }}
            />
        </div>
    );
};
