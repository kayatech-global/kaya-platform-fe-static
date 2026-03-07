import React from 'react';
import { SelectableRadioItem, Select, OptionModel } from '@/components';
import { DraggableTabsList, Tabs, TabsContent, TabsTrigger } from '@/components/atoms/tabs';
import { FileX } from 'lucide-react';
import { IMessageBroker, IMessageBrokerTopic, IWorkflowTrigger } from '@/models';
import { MessageBrokerTopicType } from '@/enums';

interface MessageBrokerTabProps {
    messageBrokerProviders: OptionModel[];
    options: IMessageBroker[];
    broker: string | undefined;
    workflowTrigger: IWorkflowTrigger | undefined;
    transformData: IMessageBrokerTopic[];
    topicType?: MessageBrokerTopicType;
    selectedMessageBroker: string | undefined;
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    setBroker: React.Dispatch<React.SetStateAction<string | undefined>>;
    setSelectedMessageBroker: React.Dispatch<React.SetStateAction<string | undefined>>;
    onEdit: (id: string, topicId: string) => void;
}

export const MessageBrokerTab = ({
    messageBrokerProviders,
    options,
    broker,
    workflowTrigger,
    transformData,
    topicType,
    selectedMessageBroker,
    activeTab,
    setActiveTab,
    setBroker,
    setSelectedMessageBroker,
    onEdit,
}: MessageBrokerTabProps) => {
    return (
        <Tabs defaultValue="apache-kafka" value={activeTab} onValueChange={setActiveTab} className="w-[550px] h-full">
            <DraggableTabsList className="dark:bg-gray-700 p-[5px] rounded-[6px] w-full justify-start gap-x-1">
                {messageBrokerProviders?.map((provider) => (
                    <TabsTrigger
                        key={provider.value as string}
                        value={provider.value as string}
                        className="px-3 py-[6px] rounded-sm text-sm font-medium"
                    >
                        {provider.name}
                    </TabsTrigger>
                ))}
            </DraggableTabsList>

            {messageBrokerProviders?.map((provider) => (
                <TabsContent key={provider.value as string} value={provider.value as string} className="mt-0">
                    <div className="overflow-y-auto flex flex-col gap-y-2 mt-4 h-[300px]">
                        {options?.length > 0 ? (
                            <>
                                {/* Dropdown above the options */}
                                <div className="flex flex-col gap-y-2 flex-shrink-0">
                                    <Select
                                        label="Message Broker Name"
                                        placeholder="Select Message Broker"
                                        value={broker}
                                        currentValue={broker}
                                        options={options?.map(
                                            x =>
                                                ({
                                                    name: x.name.length > 70 ? x.name.slice(0, 60) + '...' : x.name,
                                                    value: x.id,
                                                } as OptionModel)
                                        )}
                                        onChange={e => {
                                            setBroker(e.target.value);
                                            if (!workflowTrigger) setSelectedMessageBroker(undefined);
                                        }}
                                    />
                                </div>

                                {/* SelectableRadioItem list */}
                                <div className="overflow-y-auto flex flex-col gap-y-2 flex-1">
                                    {transformData?.length > 0 || !broker ? (
                                        <>
                                            {transformData.map((topic) => (
                                                <SelectableRadioItem
                                                    key={topic.id}
                                                    id={topic.id}
                                                    label={
                                                        topic.title.length > 70
                                                            ? topic.title.slice(0, 50) + '...'
                                                            : topic.title
                                                    }
                                                    labelTitle={topic.title}
                                                    title="Message Broker"
                                                    description={topicType ?? ''}
                                                    isChecked={topic.id === selectedMessageBroker}
                                                    imagePath="/png/Message-queue.png"
                                                    imageType="png"
                                                    imageClassname="h-[56px] w-[56px]"
                                                    handleClick={() => {
                                                        setSelectedMessageBroker(topic.id);
                                                    }}
                                                    onEdit={() => onEdit(broker as string, topic.id)}
                                                />
                                            ))}
                                        </>
                                    ) : (
                                        <div className="w-full flex flex-col items-center justify-center gap-y-1 justify-center py-4 h-full">
                                            <FileX className="text-gray-500 dark:text-gray-300" />
                                            <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                                {`No ${
                                                    topicType ? `${topicType.toLowerCase()} topics` : 'topics'
                                                } have been`}
                                                <br /> configured
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="w-full flex flex-col items-center justify-center gap-y-1 justify-center py-4 h-full">
                                <FileX className="text-gray-500 dark:text-gray-300" />
                                <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                    No Message Brokers have been
                                    <br /> configured
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            ))}
        </Tabs>
    );
};
