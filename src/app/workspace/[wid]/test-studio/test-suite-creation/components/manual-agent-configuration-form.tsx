'use client';
import { Label, Textarea } from '@/components';
import { truncate } from 'lodash';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/atoms/accordion';
import { ITestDataSet, ITestSuite } from '@/models';
import { Control, Controller } from 'react-hook-form';

type ManualAgentConfigurationFormProps = {
    validInputs: ITestDataSet[];
    inputs: ITestDataSet[];
    selectedAgentId: string | null;
    control: Control<ITestSuite, unknown>;
};

export const ManualAgentConfigurationForm = ({
    validInputs,
    inputs,
    selectedAgentId,
    control,
}: ManualAgentConfigurationFormProps) => {
    if (validInputs.length > 0) {
        return validInputs.map((dataset, idx) => {
            const originalIndex = inputs.indexOf(dataset);
            const agentId = selectedAgentId ?? '';
            return (
                <Accordion
                    key={originalIndex}
                    type="single"
                    collapsible
                    className="w-full border rounded-lg bg-white"
                >
                    <AccordionItem value={`input-${originalIndex}`} className="border-0">
                        <AccordionTrigger className="text-sm hover:no-underline px-4 py-3 hover:bg-blue-50 rounded-lg">
                            <span
                                className="font-medium text-left block w-full"
                                title={`#M${originalIndex + 1} - ${
                                    dataset.input || `Input ${originalIndex + 1}`
                                }`}
                            >
                                {truncate(
                                    `#M${originalIndex + 1} - ${
                                        dataset.input || `Input ${originalIndex + 1}`
                                    }`,
                                    { length: 80 }
                                )}
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4" forceMount>
                            <div className="space-y-3 pt-3">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor={`expectedOutput-${originalIndex}`}
                                        className="text-xs"
                                    >
                                        Output <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        name={`agentOutputFields.${agentId}.${idx}.expectedOutput`}
                                        control={control}
                                        render={({ field }) => (
                                            <Textarea
                                                id={`expectedOutput-${originalIndex}`}
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                placeholder="Enter expected output..."
                                                rows={3}
                                                className="text-xs"
                                            />
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label
                                        htmlFor={`groundTruth-${originalIndex}`}
                                        className="text-xs"
                                    >
                                        Expected agent behavior
                                    </Label>
                                    <Controller
                                        name={`agentOutputFields.${agentId}.${idx}.expectedBehaviour`}
                                        control={control}
                                        render={({ field }) => (
                                            <Textarea
                                                id={`groundTruth-${originalIndex}`}
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                placeholder="Enter expected agent behavior..."
                                                rows={3}
                                                className="text-xs"
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            );
        });
    } else {
        return (
            <div className="border rounded-lg p-4 text-center text-sm text-gray-500">
                No inputs were found
            </div>
        );
    }
};
