import { VectorRagConfigurationFormProps } from './vector-rag-configuration-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/tabs';
import { GeneratorTab } from './generator-tab';
import { RetrievalTab } from './retrieval-tab';
import { BasicInfoTab } from './basic-info-tab';
import { useEffect, useState } from 'react';

export const FormBody = (props: VectorRagConfigurationFormProps) => {
    const { isOpen, isEdit, currentStep, setCurrentStep } = props;
    const [completed, setCompleted] = useState<boolean>(false);

    const tabValues = ['general_settings', 'retrieval_settings', 'generator_settings'];
    const activeTab = tabValues[(currentStep ?? 1) - 1];

    const ragFormTabHeaders = [
        { id: 'general_settings', label: '1. General Settings', content: <BasicInfoTab {...props} /> },
        { id: 'retrieval_settings', label: '2. Retrieval Settings', content: <RetrievalTab {...props} /> },
        { id: 'generator_settings', label: '3. Generator Settings', content: <GeneratorTab {...props} /> },
    ];

    useEffect(() => {
        if (!isOpen) {
            if (setCurrentStep) {
                setCurrentStep(1);
            }
            setCompleted(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!completed && currentStep === 3) {
            setCompleted(true);
        }
    }, [currentStep]);

    const handleOnTabClick = (tabId: string) => {
        const index = ragFormTabHeaders.findIndex(tab => tab.id === tabId);
        if (index !== -1) {
            if (setCurrentStep) {
                setCurrentStep(index + 1);
            }
        }
    };

    const isTabClickable = (tabIndex: number) => {
        return isEdit || completed || (currentStep !== undefined && currentStep >= tabIndex);
    };

    return (
        <Tabs value={activeTab} className="w-full">
            <TabsList className="p-0 px-1 w-full rounded-none dark:bg-gray-700">
                {ragFormTabHeaders.map((tab, index) => (
                    <TabsTrigger
                        key={tab.id}
                        className="w-full data-[state=active]:dark:bg-gray-600 rounded-sm h-[95%]"
                        value={tab.id}
                        onClick={() => {
                            if (isTabClickable(index + 1)) handleOnTabClick(tab.id);
                        }}
                    >
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
            {ragFormTabHeaders.map(tab => (
                <TabsContent
                    key={tab.id}
                    value={tab.id}
                    {...(currentStep === 3
                        ? {
                              forceMount: true,
                              className: `px-6 pt-[60px] flex flex-col gap-y-5 ${
                                  activeTab === tab.id ? '' : 'hidden'
                              }`.trimEnd(),
                          }
                        : {
                              className: 'px-6 pt-4 flex flex-col gap-y-5 data-[state=inactive]:hidden',
                              
                          })}
                >
                    {tab.content}
                </TabsContent>
            ))}
        </Tabs>
    );
};
