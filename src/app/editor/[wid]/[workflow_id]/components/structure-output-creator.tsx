'use client';
import {
    Button,
    Checkbox,
    DynamicObject,
    DynamicObjectBody,
    DynamicObjectField,
    DynamicObjectItem,
} from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { PopupTextArea } from '@/components/molecules/popup-text-area/popup-text-area';
import { AgentType, StructuredOutputType } from '@/components/organisms';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

interface IStructuredOutputCreatorProps {
    agent?: AgentType;
    structuredOutput: StructuredOutputType;
    setStructuredOutput: React.Dispatch<React.SetStateAction<StructuredOutputType>>;
}

export const StructuredOutputCreator = ({
    agent,
    structuredOutput,
    setStructuredOutput,
}: IStructuredOutputCreatorProps) => {
    const [openStructuredOutputModal, setOpenStructuredOutputModal] = useState(false);
    const [stateStructuredOutput, setStateStructuredOutput] = useState<StructuredOutputType>(structuredOutput);

    useEffect(() => {
        setStateStructuredOutput(structuredOutput);
    }, [structuredOutput]);

    // Form setup for structured output
    const {
        control: controlStructuredOutput,

        reset: resetStructuredOutput,
    } = useForm({
        defaultValues: {
            structuredOutputFields: [] as { name: string; value: string; dataType: string }[],
        },
    });

    const {} = useFieldArray({
        control: controlStructuredOutput,
        name: 'structuredOutputFields',
    });

    const handleSave = () => {
        setStructuredOutput(stateStructuredOutput);
        setOpenStructuredOutputModal(false);
    };

    const handleCancel = () => {
        setStateStructuredOutput(structuredOutput);
        setOpenStructuredOutputModal(false);
    };

    return (
        <React.Fragment>
            <div className="text-input-checkbox flex flex-col gap-y-3">
                <div className="flex gap-x-3 items-start">
                    <Checkbox
                        disabled={agent?.isReusableAgentSelected}
                        checked={structuredOutput.enabled}
                        onCheckedChange={e =>
                            setStructuredOutput({
                                ...structuredOutput,
                                enabled: !!e,
                            })
                        }
                    />
                    <div className="flex flex-col -mt-1 gap-y-1">
                        <p className="text-md font-medium text-gray-700 dark:text-gray-100">Structured Output</p>
                        <p className="text-xs font-normal text-gray-500 dark:text-gray-300">
                            Define a structured format for the agent&apos;s response, ensuring consistent data output
                            that can be easily processed
                        </p>
                        {stateStructuredOutput.enabled && (
                            <div className="flex flex-col gap-y-2">
                                <Button
                                    variant="link"
                                    size="sm"
                                    disabled={agent?.isReusableAgentSelected}
                                    onClick={() => {
                                        // Load existing data into form when opening modal
                                        resetStructuredOutput({
                                            structuredOutputFields: structuredOutput.data.map(item => ({
                                                name: item.name,
                                                value: item.value,
                                                dataType: item.dataType,
                                            })),
                                        });
                                        setOpenStructuredOutputModal(true);
                                    }}
                                >
                                    Configure Output Schema ({structuredOutput.data.length} fields)
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Dialog open={openStructuredOutputModal} onOpenChange={setOpenStructuredOutputModal}>
                <DialogContent>
                    <DialogHeader className="border-none pb-0 px-2">
                        <DialogTitle className="px-2">Output Schema Fields</DialogTitle>
                        <DialogDescription className="flex flex-col gap-y-2">
                            <div className="flex flex-col gap-y-4">
                                <div className="flex flex-col gap-y-2 px-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-300">
                                        Define the structure of the agent&apos;s response. Each field will be included
                                        in the structured output.
                                    </p>
                                </div>
                                <div className="max-h-[75vh] pr-2 px-1 overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-400 group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700">
                                    {stateStructuredOutput && (
                                        <DynamicObject
                                            containerTop={30}
                                            containerHeight={44}
                                            length={stateStructuredOutput.data.length}
                                        >
                                            <DynamicObjectBody
                                                onAdd={() =>
                                                    setStateStructuredOutput(prev => ({
                                                        ...prev,
                                                        data: [
                                                            ...prev.data,
                                                            { name: '', value: '', dataType: 'string' },
                                                        ],
                                                    }))
                                                }
                                            >
                                                {stateStructuredOutput.data.map((item, index) => (
                                                    <DynamicObjectField
                                                        key={index}
                                                        rowId={index}
                                                        removeRow={() => {
                                                            const newData = [...stateStructuredOutput.data];
                                                            newData.splice(index, 1);
                                                            setStateStructuredOutput({
                                                                ...stateStructuredOutput,
                                                                data: newData,
                                                            });
                                                        }}
                                                    >
                                                        <DynamicObjectItem label="Field Name">
                                                            <input
                                                                type="text"
                                                                value={item.name}
                                                                onChange={e => {
                                                                    const newData = [...stateStructuredOutput.data];
                                                                    newData[index].name = e.target.value;
                                                                    setStateStructuredOutput({
                                                                        ...stateStructuredOutput,
                                                                        data: newData,
                                                                    });
                                                                }}
                                                                className="border text-xs text-gray-900 dark:text-white rounded px-2 py-1 w-full bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-700 placeholder:text-gray-400 placeholder:text-xs"
                                                                placeholder="Field Name"
                                                            />
                                                        </DynamicObjectItem>
                                                        <DynamicObjectItem label="Type">
                                                            <select
                                                                value={item.dataType}
                                                                onChange={e => {
                                                                    const newData = [...stateStructuredOutput.data];
                                                                    newData[index].dataType = e.target.value;
                                                                    setStateStructuredOutput({
                                                                        ...stateStructuredOutput,
                                                                        data: newData,
                                                                    });
                                                                }}
                                                                className="border text-xs text-gray-900 dark:text-white rounded px-2 py-1 w-full bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-700 placeholder:text-gray-400 placeholder:text-xs"
                                                            >
                                                                <option value="string">String</option>
                                                                <option value="int">Integer</option>
                                                                <option value="bool">Boolean</option>
                                                                <option value="float">Float</option>
                                                                <option value="list">List</option>
                                                                <option value="dict">Dictionary</option>
                                                            </select>
                                                        </DynamicObjectItem>
                                                        <DynamicObjectItem label="Description">
                                                            <div className="flex items-center gap-2">
                                                                <PopupTextArea
                                                                    value={item.value}
                                                                    onChange={value => {
                                                                        const newData = [...stateStructuredOutput.data];
                                                                        newData[index].value = value;
                                                                        setStateStructuredOutput({
                                                                            ...stateStructuredOutput,
                                                                            data: newData,
                                                                        });
                                                                    }}
                                                                    label="Description"
                                                                />
                                                            </div>
                                                        </DynamicObjectItem>
                                                    </DynamicObjectField>
                                                ))}
                                            </DynamicObjectBody>
                                        </DynamicObject>
                                    )}
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="self-end py-3">
                        <div className="flex gap-x-2 self-end">
                            <Button variant={'secondary'} size={'sm'} onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button size={'sm'} onClick={handleSave}>
                                Save
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
};
