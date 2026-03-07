import React from 'react';
import { Control } from 'react-hook-form';
import { ITestSuite, ITestDataSet } from '../../data-generation';
import { Terminal, Bot, Database } from 'lucide-react';
import { EditableField } from './editable-field';
import { ReviewTestCaseVariables } from './review-test-case-variables';

export interface ReviewTestCaseDataFieldsProps {
    selectedItem: ITestDataSet | undefined;
    selectedTestCaseIndex: number;
    isUpload: boolean;
    control?: Control<ITestSuite>;
}

export const ReviewTestCaseDataFields = ({
    selectedItem,
    selectedTestCaseIndex,
    isUpload,
    control,
}: ReviewTestCaseDataFieldsProps) => {
    // If no item selected, return null or placeholder
    if (!selectedItem) return null;

    return (
        <div className="space-y-2">
            <div className="grid col-span-2 gap-8 w-full">
                {/* Input Section */}
                <div className="space-y-3 w-full col-span-2">
                    <EditableField
                        control={control}
                        name={`testDataSets.${selectedTestCaseIndex}.input.message`}
                        label="Input"
                        value={selectedItem.input?.message}
                        readOnly={!control || isUpload}
                        placeholder="No input provided"
                        icon={<Terminal className="h-4 w-4" />}
                    >
                        <ReviewTestCaseVariables
                            variables={selectedItem.input?.variables}
                            control={control}
                            namePrefix={`testDataSets.${selectedTestCaseIndex}.input`}
                            isUpload={isUpload}
                        />
                    </EditableField>
                </div>
            </div>
            <div className="grid col-span-2 gap-8 w-full">
                <div className="space-y-3 w-full col-span-2">
                    <EditableField
                        control={control}
                        name={`testDataSets.${selectedTestCaseIndex}.expectedOutput`}
                        label="Expected Output"
                        value={selectedItem.expectedOutput}
                        readOnly={!control || isUpload}
                        placeholder="No expected output provided"
                        icon={<Bot className="h-4 w-4" />}
                    />
                </div>
            </div>
            <div className="grid col-span-2 gap-8 w-full">
                <div className="space-y-3 w-full col-span-2">
                    <EditableField
                        control={control}
                        name={`testDataSets.${selectedTestCaseIndex}.expectedBehaviour`}
                        label="Expected Behavior"
                        value={selectedItem.expectedBehaviour}
                        readOnly={!control || isUpload}
                        placeholder="No expected behavior provided"
                        icon={<Database className="h-4 w-4" />}
                    />
                </div>
            </div>
        </div>
    );
};
