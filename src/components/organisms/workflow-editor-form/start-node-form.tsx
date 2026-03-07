/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { IWorkflowTrigger } from '@/models';
import { Node, useReactFlow } from '@xyflow/react';
import { useAuth, useDnD } from '@/context';
import { Button } from '@/components';
import { cn } from '@/lib/utils';
import { useQuery } from 'react-query';
import { useParams } from 'next/navigation';
import { MessageBrokerTopicSelector } from '@/app/editor/[wid]/[workflow_id]/components/message-broker-topic-selector';
import { MessageBrokerTopicType } from '@/enums';
import { toast } from 'sonner';
import { ApiToolResponseType } from '@/app/workspace/[wid]/agents/components/agent-form';
import { useApiQuery, useConnectorQuery, useMessageBrokerQuery } from '@/hooks/use-common';
import { scheduleTriggerService } from '@/services';

interface StartNodeFormProps {
    selectedNode: Node;
    isReadOnly?: boolean;
    setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
}

export const StartNodeForm = ({ selectedNode, isReadOnly, setHasChanges }: StartNodeFormProps) => {
    const params = useParams();
    const { token } = useAuth();
    const { trigger, workflowVariables, sharedVariables, loadingIntellisense, setSelectedNodeId, setTrigger } =
        useDnD();
    const { updateNodeData } = useReactFlow();
    const [workflowTrigger, setWorkflowTrigger] = useState<IWorkflowTrigger>();
    const [updated, setUpdated] = useState<boolean>(false);

    const {
        isFetching: fetchingMessageBroker,
        isLoading: messageBrokerLoading,
        data: messageBrokers,
        refetch: refetchMessageBrokers,
    } = useMessageBrokerQuery();

    const {
        data: allApiTools,
        isFetching: fetchingApiTools,
        isLoading: apiLoading,
        refetch: refetchApiTools,
    } = useApiQuery<ApiToolResponseType>({ queryKey: 'apiTools' });

    const {
        isLoading: loadingConnectors,
        isFetching: fetchingConnectors,
        data: connectors,
        refetch: refetchConnector,
    } = useConnectorQuery();

    const {
        isLoading: loadingScheduleTriggers,
        data: scheduleTriggers,
        refetch: refetchScheduleTrigger,
    } = useQuery(
        'schedule-triggers',
        () => scheduleTriggerService.get(params.wid as string, params.workflow_id as string),
        {
            enabled: !!token,
            refetchOnWindowFocus: false,
            onError: error => {
                console.error('Failed to fetch schedule triggers:', error);
            },
        }
    );

    useEffect(() => {
        const result = selectedNode?.data?.triggers as IWorkflowTrigger;
        if (result) {
            setWorkflowTrigger(result);
        } else {
            setWorkflowTrigger(undefined);
        }
    }, [selectedNode]);

    const handleSaveNodeData = async () => {
        updateNodeData(selectedNode.id, {
            triggers: workflowTrigger,
        });
        toast.success('Start node updated');
        await Promise.resolve()
            .then(() => {
                setTrigger((trigger ?? 0) + 1);
                if (updated) setHasChanges(updated);
            })
            .finally(() => {
                setUpdated(false);
            });
    };

    const refetchIntellisense = async () => {
        await Promise.resolve().then(() => {
            setTrigger((trigger ?? 0) + 1);
        });
    };

    return (
        <>
            <div
                className={cn('h-full flex items-center justify-center mt-[30%]', {
                    hidden:
                        !fetchingMessageBroker && !fetchingApiTools && !fetchingConnectors && !loadingScheduleTriggers,
                })}
            >
                <div className="flex flex-col items-center gap-y-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-700 font-normal dark:text-gray-200 max-w-[250px] text-center">
                        Hang tight! We&apos;re loading the start node data for you...
                    </p>
                </div>
            </div>
            <div className="group">
                <div
                    className={cn(
                        'agent-form pr-1 flex flex-col gap-y-6 h-[calc(100vh-270px)] overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-transparent group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700',
                        {
                            hidden:
                                fetchingMessageBroker ||
                                fetchingApiTools ||
                                fetchingConnectors ||
                                loadingScheduleTriggers,
                        }
                    )}
                >
                    <div>
                        <MessageBrokerTopicSelector
                            label="Triggers"
                            detailLabel="Trigger"
                            detailButtonLabel="Add a Trigger"
                            saveButtonLabel="Add Trigger"
                            description="Create a trigger to start the workflow"
                            workflowTrigger={workflowTrigger}
                            messageBrokerLoading={messageBrokerLoading}
                            topicType={MessageBrokerTopicType.Inbound}
                            messageBrokers={messageBrokers ?? []}
                            isReadonly={isReadOnly}
                            workflowVariables={workflowVariables}
                            sharedVariables={sharedVariables}
                            allApiTools={allApiTools ?? []}
                            apiLoading={apiLoading}
                            loadingConnectors={loadingConnectors}
                            loadingIntellisense={loadingIntellisense}
                            scheduleTriggerLoading={loadingScheduleTriggers}
                            scheduleTriggers={scheduleTriggers ?? []}
                            connectors={connectors ?? []}
                            setWorkflowTrigger={setWorkflowTrigger}
                            refetchApiTools={refetchApiTools}
                            refetchConnector={refetchConnector}
                            refetchIntellisense={refetchIntellisense}
                            onManage={() => setUpdated(true)}
                            onRefetch={refetchMessageBrokers}
                            onRefetchScheduler={async () => {
                                await refetchScheduleTrigger();
                            }}
                        />
                    </div>

                    <div className="agent-form-footer flex gap-x-3 justify-end pb-4 mt-auto">
                        <Button variant="secondary" onClick={() => setSelectedNodeId(undefined)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSaveNodeData}>
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};
