'use client';
import { FormBody as ReRankingFormBody } from '@/app/workspace/[wid]/intelligence-enhancers/re-ranking-models/components/form-body';
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
import { SelectableType } from '@/enums';
import { useReRankingModelConfiguration } from '@/hooks/use-re-ranking-model-configuration';
import { IReRanking } from '@/models';
import { FileX, LoaderCircle, Unplug } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ReRankingSelectorProps {
    reRanking: IReRanking | undefined;
    isReadonly?: boolean;
    reRankingsLoading?: boolean;
    allReRankings: IReRanking[];
    label?: string;
    labelClassName?: string;
    description?: string;
    hideDescription?: boolean;
    setReRanking: React.Dispatch<React.SetStateAction<IReRanking | undefined>>;
    onReRankingChange?: (reRanking: IReRanking | undefined) => void;
    onModalChange?: (open: boolean) => void;
    onRefetch: () => void;
}

export const ReRankingModelSelector = ({
    reRanking,
    isReadonly,
    allReRankings,
    reRankingsLoading,
    label,
    labelClassName,
    description,
    hideDescription = false,
    setReRanking,
    onRefetch,
    onReRankingChange,
    onModalChange,
}: ReRankingSelectorProps) => {
    const [allSearchableReRankings, setAllSearchableReRankings] = useState<IReRanking[]>(allReRankings);
    const [checkedItemId, setCheckedItemId] = useState<string>();
    const [openNewModal, setOpenNewModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const {
        providers,
        errors,
        isOpen,
        isEdit,
        isValid,
        secrets,
        isSaving,
        loadingSecrets,
        control,
        register,
        watch,
        setValue,
        setEdit,
        handleSubmit,
        onHandleSubmit,
        setOpen,
        refetch,
    } = useReRankingModelConfiguration({ triggerQuery: false, onRefetch });

    useEffect(() => {
        if (searchTerm !== '') {
            const filteredReRankings = allReRankings.filter(reRanking =>
                reRanking.name.toLowerCase().includes(searchTerm)
            );
            setAllSearchableReRankings(filteredReRankings);
        } else {
            setAllSearchableReRankings(allReRankings);
        }
    }, [searchTerm]);

    useEffect(() => {
        if (onModalChange) {
            onModalChange(openNewModal);
        }
    }, [openNewModal]);

    useEffect(() => {
        if (!isOpen || !openNewModal) {
            setEdit(false);
            setSearchTerm('');
        }
    }, [isOpen, openNewModal]);

    useEffect(() => {
        if (openNewModal && reRanking) {
            setCheckedItemId(reRanking?.id);
        } else {
            setCheckedItemId(undefined);
        }
    }, [openNewModal, reRanking]);

    useEffect(() => {
        setAllSearchableReRankings(allReRankings);
    }, [allReRankings, allReRankings?.length]);

    const handleClick = () => {
        const selectedReRanking = allSearchableReRankings.find(p => p.id === checkedItemId);
        setReRanking(selectedReRanking);
        setOpenNewModal(false);
        setAllSearchableReRankings(allReRankings);
        if (onReRankingChange) {
            onReRankingChange(selectedReRanking);
        }
    };

    const handleRemove = () => {
        setReRanking(undefined);
        setCheckedItemId(undefined);
        if (onReRankingChange) {
            onReRankingChange(undefined);
        }
        if (onModalChange) {
            onModalChange(openNewModal);
        }
    };

    const getReRanking = () => {
        if (!reRanking) {
            return undefined;
        }

        const value: valuesProps[] = [];

        if (reRanking) {
            value.push({
                title: reRanking.name,
                description: `${reRanking.description?.slice(0, 65)}...`,
                imagePath: '/png/re-ranking.png',
            });
        }

        return value.length > 0 ? value : undefined;
    };

    const handleChange = () => {
        setOpenNewModal(true);
        if (reRanking) {
            setCheckedItemId(reRanking.id);
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
            setOpenNewModal(false);
            setAllSearchableReRankings(allReRankings);
        } else {
            setOpenNewModal(open);
        }
    };

    const onEdit = (id: string) => {
        const obj = allReRankings?.find(x => x.id === id);
        if (obj) {
            setValue('id', obj.id);
            setValue('name', obj.name);
            setValue('description', obj.description);
            setValue('provider', obj.provider);
            setValue('modelName', obj.modelName);
            setValue('configurations', obj.configurations);
            setValue('configurations.apiKey', obj.configurations.apiKey);
            const originalProvider = providers?.find(x => x.value === obj.provider);
            if (originalProvider) {
                const originalModel = originalProvider.models?.find(x => x.value === obj.modelName);
                if (originalModel) {
                    setValue('modelNameOption', { label: originalModel.value, value: originalModel.value });
                } else {
                    setValue('modelNameOption', { label: obj.modelName, value: obj.modelName });
                }
            }
        }
        setEdit(true);
        setOpen(true);
    };

    return (
        <>
            <DetailItemInput
                label={label ?? 'Re-ranking Model'}
                labelClassName={labelClassName}
                values={getReRanking()}
                imagePath="/png/empty_state_re_ranking.png"
                imageType="png"
                description={
                    description ??
                    "No re-ranking model has been added. Please use 'Add Re-ranking' to provide instructions for the retrieval."
                }
                hideDescription={hideDescription}
                footer={
                    reRanking ? (
                        <div className=" w-full flex justify-start items-center gap-x-3">
                            <Button variant="link" className="text-blue-400" onClick={handleChange}>
                                Change
                            </Button>
                            <Button variant="link" className="text-red-500 hover:text-red-400" onClick={handleRemove}>
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <>
                            {!reRanking && (
                                <Button variant="link" onClick={() => setOpenNewModal(true)}>
                                    Add Re-ranking
                                </Button>
                            )}
                        </>
                    )
                }
            />
            <Dialog open={openNewModal} onOpenChange={onModalClose}>
                <DialogContent className="max-w-[unset] w-[580px]">
                    <DialogHeader className="px-0">
                        <DialogTitle asChild>
                            <div className="px-4 flex gap-2">
                                {isOpen && <Unplug />}
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                    {(() => {
                                        if (!isOpen) return 'Re-ranking Models';
                                        return isEdit ? 'Edit Re-ranking Model' : 'New Re-ranking Model';
                                    })()}
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription asChild>
                        <div className="px-4 flex flex-col gap-y-4 h-[351px]">
                            {!isOpen && (
                                <div className="flex justify-end">
                                    <Button variant="link" disabled={isReadonly} onClick={() => setOpen(true)}>
                                        New Re-ranking Model
                                    </Button>
                                </div>
                            )}
                            {isOpen ? (
                                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                                    <ReRankingFormBody
                                        isOpen={isOpen}
                                        isEdit={isEdit}
                                        isValid={isValid}
                                        secrets={secrets}
                                        isSaving={isSaving}
                                        providers={providers}
                                        control={control}
                                        errors={errors}
                                        loadingSecrets={loadingSecrets}
                                        isModalRequest={true}
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
                                <>
                                    {reRankingsLoading ? (
                                        <div className="w-full flex flex-col items-center justify-center gap-y-1 justify-center py-4 h-full">
                                            <LoaderCircle
                                                className="animate-spin"
                                                size={25}
                                                width={25}
                                                height={25}
                                                absoluteStrokeWidth={undefined}
                                            />
                                            <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                                Please wait! loading the re-rankings data for you...
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <Input
                                                className="w-full"
                                                placeholder="Search re-rankings"
                                                onChange={handleSearch}
                                            />
                                            {allSearchableReRankings?.length > 0 ? (
                                                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                                                    {allSearchableReRankings.map((reRanking) => {
                                                        return (
                                                            <SelectableRadioItem
                                                                key={reRanking.id as string}
                                                                id={reRanking.id as string}
                                                                title="Re-ranking"
                                                                type={SelectableType.RE_RANKING}
                                                                label={reRanking.name}
                                                                description={reRanking.description}
                                                                isChecked={checkedItemId === reRanking.id}
                                                                imagePath="/png/re-ranking.png"
                                                                expandTriggerName="Show Re-ranking"
                                                                handleClick={() => setCheckedItemId(reRanking.id)}
                                                                onEdit={onEdit}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="w-full flex flex-col items-center justify-center gap-y-1 justify-center py-4 h-full">
                                                    <FileX className="text-gray-500 dark:text-gray-300" />
                                                    <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                                        {searchTerm !== '' ? (
                                                            <>No results found</>
                                                        ) : (
                                                            <>
                                                                No Re-rankings have been
                                                                <br /> configured
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
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
                                Add re-ranking
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
