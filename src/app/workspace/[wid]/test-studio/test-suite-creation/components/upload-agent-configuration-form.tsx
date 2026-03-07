'use client';
import { Label, Select } from '@/components';
import { Control, Controller, UseFormWatch } from 'react-hook-form';
import {ITestSuite} from "@/models";

type UploadAgentConfigurationFormProps = {
    selectedAgentId: string | null;
    control: Control<ITestSuite, unknown>;
    watch: UseFormWatch<ITestSuite>;
};

export const UploadAgentConfigurationForm = ({
    selectedAgentId,
    control,
    watch,
}: UploadAgentConfigurationFormProps) => {
    return (
        <div className="grid grid-cols-1 gap-4 p-4 border rounded-md bg-white mt-4">
            <Label htmlFor="groundTruth" className="text-xs">
                Sample Output
            </Label>
            <Controller
                name={`agentSampleSelections.${selectedAgentId}.output`}
                control={control}
                render={({ field }) => (
                    <Select
                        options={['Select data', ...(watch('excelHeaders') ?? [])].map(h => ({
                            name: h,
                            value: h,
                        }))}
                        currentValue={String(field.value ?? 'Select data')}
                        onChange={e => field.onChange(e?.target?.value || e)}
                        placeholder="Select data"
                        className="border rounded-md px-2 py-1"
                    />
                )}
            />
            <Label htmlFor="groundTruth" className="text-xs">
                Expected Workflow Sample
            </Label>
            <Controller
                name={`agentSampleSelections.${selectedAgentId}.groundTruth`}
                control={control}
                render={({ field }) => (
                    <Select
                        options={['Select data', ...(watch('excelHeaders') ?? [])].map(h => ({
                            name: h,
                            value: h,
                        }))}
                        currentValue={String(field.value ?? 'Select data')}
                        onChange={e => field.onChange(e?.target?.value || e)}
                        placeholder="Select data"
                        className="border rounded-md px-2 py-1"
                    />
                )}
            />
            <Label htmlFor="instruction" className="text-xs">
                Instructions
            </Label>
            <Controller
                name={`agentSampleSelections.${selectedAgentId}.instruction`}
                control={control}
                render={({ field }) => (
                    <Select
                        options={['Select data', ...(watch('excelHeaders') ?? [])].map(h => ({
                            name: h,
                            value: h,
                        }))}
                        currentValue={String(field.value ?? 'Select data')}
                        onChange={e => field.onChange(e?.target?.value || e)}
                        placeholder="Select data"
                        className="border rounded-md px-2 py-1"
                    />
                )}
            />
        </div>
    );
};
