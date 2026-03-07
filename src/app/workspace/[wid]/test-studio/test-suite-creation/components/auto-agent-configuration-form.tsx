'use client';
import { Label, Textarea } from '@/components';
import { Control, Controller } from 'react-hook-form';
import { ITestSuite } from '@/models';

type AutoAgentConfigurationFormProps = {
    selectedAgentId: string | null;
    control: Control<ITestSuite, unknown>;
};

export const AutoAgentConfigurationForm = ({ selectedAgentId, control }: AutoAgentConfigurationFormProps) => {
    return (
        <div className="border rounded-lg p-4 bg-white">
            <div className="space-y-3">
                <div className="space-y-2">
                    <Label htmlFor="expectedOutput" className="text-xs">
                        Sample Output
                    </Label>
                    <Controller
                        name={`agentOutputFields.${selectedAgentId}.0.expectedOutput`}
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                value={field.value ?? ''}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                placeholder="Enter expected output"
                                rows={3}
                                className="text-xs"
                            />
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="groundTruth" className="text-xs">
                        Expected Workflow Behaviour
                    </Label>
                    <Controller
                        name={`agentOutputFields.${selectedAgentId}.0.expectedBehaviour`}
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                value={field.value ?? ''}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                placeholder="Enter expected agent behavior"
                                rows={3}
                                className="text-xs"
                            />
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="instruction" className="text-xs">
                        Instructions
                    </Label>
                    <Controller
                        name={`agentOutputFields.${selectedAgentId}.0.instruction`}
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                value={field.value ?? ''}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                placeholder="Enter instruction for the generated datasets"
                                rows={3}
                                className="text-xs"
                            />
                        )}
                    />
                </div>
            </div>
        </div>
    );
};
