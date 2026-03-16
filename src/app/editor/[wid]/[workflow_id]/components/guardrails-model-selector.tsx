'use client';
import { GuardrailsFormBody as GuardrailsModelConfigurationFormBody } from '@/app/workspace/[wid]/guardrails/guardrails-model-configurations/components/guardrails-model-configuration-form';
import { Button, Input, SelectableRadioItem } from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { DetailItemInput, valuesProps } from '@/components/molecules/detail-item-input/detail-item-input';
import { AgentType, Model } from '@/components/organisms';
import { useGuardrailsModelConfiguration } from '@/hooks/use-guardrails-model-configuration';
import { IGuardrailModelConfig } from '@/models';
import { FileX, LoaderCircle, ShieldBan } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface GuardrailsModelSelector {
    agent: AgentType | undefined;
    guardrailsModels: Model[] | undefined;
    isReadOnly?: boolean;
    modelLoading?: boolean;
    allGuardrailsModels: IGuardrailModelConfig[];
    label?: string;
    labelClassName?: string;
    isMultiple?: boolean;
    description?: string;
    isSelfLearning?: boolean;
    setGuardrailsModels: React.Dispatch<React.SetStateAction<Model[] | undefined>>;
    onRefetch: () => void;
    onGuardrailsModelChange?: (guardrailsModels: Model[] | undefined) => void;
    onModalChange?: (open: boolean) => void;
}

export const GuardrailsModelSelector = ({
    guardrailsModels,
    modelLoading,
    agent,
    allGuardrailsModels,
    label,
    labelClassName,
    isMultiple = false,
    description,
    isSelfLearning,
    isReadOnly,
    setGuardrailsModels,
    onRefetch,
    onGuardrailsModelChange,
    onModalChange,
}: GuardrailsModelSelector) => {
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [checkedItemId, setCheckedItemId] = useState<string[] | undefined>(undefined);
    const [openModal, setOpenModal] = useState(false);
    const [allSearchableGuardrailsModelTools, setAllSearchableGuardrailsModelTools] =
        useState<IGuardrailModelConfig[]>(allGuardrailsModels);
    const [searchTerm, setSearchTerm] = useState('');
    const {
        isOpen,
        isValid,
        errors,
        secrets,
        isSaving,
        control,
        loadingSecrets,
        setOpen,
        register,
        watch,
        setValue,
        handleSubmit,
        onHandleSubmit,
        refetch,
    } = useGuardrailsModelConfiguration({ triggerQuery: false, onRefetch });

    useEffect(() => {
        if (onModalChange) {
            onModalChange(openModal);
        }
    }, [openModal]);

    useEffect(() => {
        if (searchTerm === '') {
            setAllSearchableGuardrailsModelTools(allGuardrailsModels);
        } else {
            const filteredGuardrailsModels = allGuardrailsModels.filter(guardrailsModel =>
                guardrailsModel.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setAllSearchableGuardrailsModelTools(filteredGuardrailsModels);
        }
    }, [searchTerm, allGuardrailsModels]);

    useEffect(() => {
        if (!isOpen || !openModal) {
            setIsEdit(false);
            setSearchTerm('');
        }
    }, [isOpen, openModal]);

    useEffect(() => {
        if (openModal && guardrailsModels) {
            setCheckedItemId(guardrailsModels?.map(x => x.id));
        } else {
            setCheckedItemId(undefined);
        }
    }, [openModal, guardrailsModels]);

    useEffect(() => {
        setAllSearchableGuardrailsModelTools(allGuardrailsModels);
    }, [allGuardrailsModels?.length]);

    const handleItemCheck = (guardrailsModel: Model) => {
        setCheckedItemId(prevCheckedItemId => {
            if (isMultiple) {
                // If the guardrailsModel.id is already in the array, remove it
                if (prevCheckedItemId?.includes(guardrailsModel.id)) {
                    return prevCheckedItemId.filter(id => id !== guardrailsModel.id);
                }
                // If the guardrailsModel.id is not in the array, add it
                return [...(prevCheckedItemId || []), guardrailsModel.id];
            } else {
                // Single selection logic: toggle on/off
                return prevCheckedItemId?.includes(guardrailsModel.id) ? [] : [guardrailsModel.id];
            }
        });
    };

    const handleClick = () => {
        const checkedGuardrailsModels = allGuardrailsModels
            ?.filter(guardrailsModel => checkedItemId?.includes(guardrailsModel.id as string))
            ?.map(x => ({
                id: x.id as string,
                name: x.name,
                description: x.description,
            }));
        setGuardrailsModels(checkedGuardrailsModels);
        setOpenModal(false);
        setAllSearchableGuardrailsModelTools(allGuardrailsModels);
        if (onGuardrailsModelChange) {
            onGuardrailsModelChange(checkedGuardrailsModels);
        }
    };

    const handleRemove = () => {
        setCheckedItemId(undefined);
        setGuardrailsModels(undefined);
        if (onGuardrailsModelChange) {
            onGuardrailsModelChange(undefined);
        }
        if (onModalChange) {
            onModalChange(false);
        }
    };

    const handleChange = () => {
        setOpenModal(true);
        if (!agent?.isReusableAgentSelected && guardrailsModels) {
            const selectedGuardrailsModels = guardrailsModels.map(guardrailsModel => {
                return guardrailsModel.id;
            });

            setCheckedItemId(selectedGuardrailsModels);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        setSearchTerm(searchTerm);
    };

    const onModalClose = (open: boolean, cancel?: boolean) => {
        if (isOpen) {
            setOpen(false);
        } else if (cancel) {
            setOpenModal(false);
            setAllSearchableGuardrailsModelTools(allGuardrailsModels);
        } else {
            setOpenModal(open);
        }
    };

    const onEdit = (id: string) => {
        const obj = allGuardrailsModels.find(x => x.id === id);
        if (obj) {
            setValue('id', obj.id);
            setValue('name', obj.name);
            setValue('description', obj.description);
            setValue('guardrailType', obj.guardrailType);
            setValue('provider', obj.provider);
            setValue('isReadOnly', obj?.isReadOnly);
            setValue('configurations', obj.configurations);
        }
        setIsEdit(true);
        setOpen(true);
    };

    let dialogTitle = 'Guardrails Model Configurations';
    if (isOpen) {
        dialogTitle = isEdit ? 'Edit Guardrails Model Configuration' : 'New Guardrails Model Configuration';
    }

    const renderSelectionList = () => {
        if (modelLoading) {
            return (
                <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-full">
                    <LoaderCircle
                        className="animate-spin"
                        size={25}
                        width={25}
                        height={25}
                        absoluteStrokeWidth={undefined}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                        Please wait! loading the Guardrails Model data for you...
                    </p>
                </div>
            );
        }

        return (
            <>
                <Input className="w-full" placeholder="Search Guardrails Models" onChange={handleSearch} />
                {allSearchableGuardrailsModelTools?.length > 0 ? (
                    <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                        {allSearchableGuardrailsModelTools.map(guardrailsModel => (
                            <SelectableRadioItem
                                key={guardrailsModel.id as string}
                                id={guardrailsModel.id as string}
                                title="Guardrails Model"
                                label={guardrailsModel.name}
                                description={guardrailsModel.description ?? '-'}
                                isChecked={!!checkedItemId?.includes(guardrailsModel.id as string)}
                                imagePath="/png/guardrail-prompt.png"
                                imageClassname="h-[56px] w-[56px]"
                                handleClick={() => handleItemCheck(guardrailsModel as never)}
                                onEdit={onEdit}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-full">
                        <FileX className="text-gray-500 dark:text-gray-300" />
                        <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                            {searchTerm === '' ? (
                                <>
                                    No Guardrails Model have been
                                    <br /> configured
                                </>
                            ) : (
                                <>No results found</>
                            )}
                        </p>
                    </div>
                )}
            </>
        );
    };

    return (
        <>
            <DetailItemInput
                label={label ?? 'Guardrails Model'}
                labelClassName={labelClassName}
                values={getModelFromReusableAgent(agent, guardrailsModels, isSelfLearning, allGuardrailsModels)}
                imagePath="/png/guardrails.png"
                imageType="png"
                description={
                    description ?? 'Select the Guardrails Models for efficient agent performance and task handling'
                }
                footer={
                    guardrailsModels?.length && !agent?.isReusableAgentSelected && !isReadOnly ? (
                        <div className=" w-full flex justify-start items-center gap-x-3">
                            <Button variant="link" className="text-blue-400" onClick={handleChange}>
                                Change
                            </Button>
                            <Button variant="link" className="text-red-500 hover:text-red-400" onClick={handleRemove}>
                                {isMultiple ? 'Remove all' : 'Remove'}
                            </Button>
                        </div>
                    ) : (
                        <>
                            {!guardrailsModels?.length && !agent && !isReadOnly && (
                                <Button variant="link" onClick={() => setOpenModal(true)}>
                                    {isMultiple ? 'Add a Models' : 'Add a Model'}
                                </Button>
                            )}
                        </>
                    )
                }
            />
            <Dialog open={openModal} onOpenChange={onModalClose}>
                <DialogContent className="max-w-[unset] w-[580px]">
                    <DialogHeader className="px-0">
                        <DialogTitle asChild>
                            <div className="px-4 flex gap-2">
                                {isOpen && <ShieldBan />}
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">{dialogTitle}</p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription asChild>
                        <div className="px-4 flex flex-col gap-y-4 h-[351px]">
                            {!isOpen && (
                                <div className="flex justify-end">
                                    <Button variant="link" onClick={() => setOpen(true)}>
                                        New Guardrails Model
                                    </Button>
                                </div>
                            )}
                            {isOpen ? (
                                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                                    <GuardrailsModelConfigurationFormBody
                                        isOpen={isOpen}
                                        isEdit={isEdit}
                                        isValid={isValid}
                                        errors={errors}
                                        secrets={secrets}
                                        isSaving={isSaving}
                                        hasTestConnection={false}
                                        control={control}
                                        loadingSecrets={loadingSecrets}
                                        setOpen={setOpen}
                                        register={register}
                                        watch={watch}
                                        setValue={setValue}
                                        handleSubmit={handleSubmit}
                                        onHandleSubmit={onHandleSubmit}
                                        refetch={refetch}
                                    />
                                </div>
                            ) : (
                                renderSelectionList()
                            )}
                        </div>
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => onModalClose(false, true)}>
                            Cancel
                        </Button>
                        {isOpen ? (
                            <Button
                                variant="primary"
                                disabled={!isValid || isSaving}
                                onClick={handleSubmit(onHandleSubmit)}
                            >
                                {isEdit ? 'Update' : 'Create'}
                            </Button>
                        ) : (
                            <Button disabled={checkedItemId === undefined} variant="primary" onClick={handleClick}>
                                Add Guardrails Model
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

const getModelFromReusableAgent = (
    agent: AgentType | undefined,
    guardrailsModels: Model[] | undefined,
    isSelfLearning: boolean | undefined,
    allGuardrailsModels: IGuardrailModelConfig[]
): valuesProps[] | undefined => {
    if (!agent && !guardrailsModels) return undefined;

    let items: Model[] | undefined = [];

    if (agent?.isReusableAgentSelected) {
        if (isSelfLearning) {
            items = allGuardrailsModels.filter(
                x => agent?.selfLearning?.feedbackRequestIntegration?.id == x.id && x.id
            ) as unknown as Model[];
        } else {
            items = agent.guardrailsModels;
        }
    } else {
        items = guardrailsModels;
    }

    const value =
        items?.map(guardrailsModel => ({
            title: guardrailsModel.name,
            description: `${guardrailsModel.description?.slice(0, 65)}...`,
            imagePath: '/png/guardrail-prompt.png',
        })) ?? [];

    return value.length > 0 ? value : undefined;
};
