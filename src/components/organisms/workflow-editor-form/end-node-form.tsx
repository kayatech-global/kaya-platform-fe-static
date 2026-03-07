/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { IMessagePublisher } from '@/models';
import { Node, useReactFlow } from '@xyflow/react';
import { useDnD } from '@/context';
import { Button } from '@/components';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import MessagePublisher from '@/app/editor/[wid]/[workflow_id]/components/end-node/message-publisher';
import { useMessageBrokerQuery } from '@/hooks/use-common';

interface StartNodeFormProps {
    selectedNode: Node;
    isReadOnly?: boolean;
}

export const EndNodeForm = ({ selectedNode, isReadOnly }: StartNodeFormProps) => {
    const params = useParams();
    const { trigger, setSelectedNodeId, setTrigger } = useDnD();
    const { updateNodeData } = useReactFlow();
    const [messagePublisher, setMessagePublisher] = useState<IMessagePublisher>();

    const { isFetching: fetchingMessageBroker, data: messageBrokers } = useMessageBrokerQuery();

    useEffect(() => {
        const result = selectedNode?.data?.publisherIntegration as IMessagePublisher;
        if (result) {
            setMessagePublisher(result);
        } else {
            setMessagePublisher(undefined);
        }
    }, [selectedNode]);

    const handleSaveNodeData = async () => {
        updateNodeData(selectedNode.id, {
            publisherIntegration: messagePublisher,
        });
        toast.success('End node updated');
        await Promise.resolve().then(() => {
            setTrigger((trigger ?? 0) + 1);
        });
    };

    return (
        <>
            <div
                className={cn('h-full flex items-center justify-center mt-[30%]', {
                    hidden: !fetchingMessageBroker,
                })}
            >
                <div className="flex flex-col items-center gap-y-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-700 font-normal dark:text-gray-200 max-w-[250px] text-center">
                        Hang tight! We&apos;re loading the end node data for you...
                    </p>
                </div>
            </div>
            <div className="group">
                <div
                    className={cn(
                        'agent-form pr-1 flex flex-col gap-y-6 h-[calc(100vh-270px)] overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-transparent group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700',
                        {
                            hidden: fetchingMessageBroker,
                        }
                    )}
                >
                    <div>
                        <MessagePublisher
                            title="Message Publisher"
                            detailButtonLabel="Add a Message Publisher"
                            viewLabel="View Message Publisher"
                            messagePublisher={messagePublisher}
                            messageBrokers={messageBrokers ?? []}
                            isReadOnly={isReadOnly}
                            workflowId={params?.workflow_id as string}
                            setMessagePublisher={setMessagePublisher}
                            description={
                                "No message publisher has been configured. Please use 'Add a Message Publisher' to add one."
                            }
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
