'use client';
import { FormBody as EmbeddingFormBody } from '@/app/workspace/[wid]/intelligence-enhancers/embedding-models/components/form-body';
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
import { useEmbeddingModelConfiguration } from '@/hooks/use-embedding-model-configuration';
import { IEmbedding } from '@/models';
import { FileX, LoaderCircle, Unplug } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface EmbeddingSelectorProps {
    embedding: IEmbedding | undefined;
    isReadonly?: boolean;
    embeddingsLoading?: boolean;
    allEmbeddings: IEmbedding[];
    label?: string;
    labelClassName?: string;
    description?: string;
    hideDescription?: boolean;
    setEmbedding: React.Dispatch<React.SetStateAction<IEmbedding | undefined>>;
    onEmbeddingChange?: (embedding: IEmbedding | undefined) => void;
    onModalChange?: (open: boolean) => void;
    onRefetch: () => void;
    imageWidth?: string;
}

export const EmbeddingModelSelector = ({
    embedding,
    isReadonly,
    allEmbeddings,
    embeddingsLoading,
    label,
    labelClassName,
    description,
    hideDescription = false,
    setEmbedding,
    onRefetch,
    onEmbeddingChange,
    onModalChange,
    imageWidth,
}: EmbeddingSelectorProps) => {
    const [allSearchableEmbeddings, setAllSearchableEmbeddings] = useState<IEmbedding[]>(allEmbeddings);
    const [checkedItemId, setCheckedItemId] = useState<string>();
    const [openNewModal, setOpenNewModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const {
        providers,
        errors,
        isOpen,
        isValid,
        secrets,
        isSaving,
        loadingSecrets,
        isEdit,
        control,
        register,
        watch,
        setValue,
        setEdit,
        handleSubmit,
        onHandleSubmit,
        setOpen,
        refetch,
    } = useEmbeddingModelConfiguration({ triggerQuery: false, onRefetch });

    useEffect(() => {
        if (searchTerm !== '') {
            const filteredEmbeddings = allEmbeddings.filter(embedding =>
                embedding.name.toLowerCase().includes(searchTerm)
            );
            setAllSearchableEmbeddings(filteredEmbeddings);
        } else {
            setAllSearchableEmbeddings(allEmbeddings);
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
        if (openNewModal && embedding) {
            setCheckedItemId(embedding?.id);
        } else {
            setCheckedItemId(undefined);
        }
    }, [openNewModal, embedding]);

    useEffect(() => {
        setAllSearchableEmbeddings(allEmbeddings);
    }, [allEmbeddings, allEmbeddings?.length]);

    const handleClick = () => {
        const selectedEmbedding = allSearchableEmbeddings.find(p => p.id === checkedItemId);
        setEmbedding(selectedEmbedding);
        setOpenNewModal(false);
        setAllSearchableEmbeddings(allEmbeddings);
        if (onEmbeddingChange) {
            onEmbeddingChange(selectedEmbedding);
        }
    };

    const handleRemove = () => {
        setEmbedding(undefined);
        setCheckedItemId(undefined);
        if (onEmbeddingChange) {
            onEmbeddingChange(undefined);
        }
        if (onModalChange) {
            onModalChange(openNewModal);
        }
    };

    const getEmbedding = () => {
        if (!embedding) {
            return undefined;
        }

        const value: valuesProps[] = [];

        if (embedding) {
            value.push({
                title: embedding.name,
                description: `${embedding.description?.slice(0, 65)}...`,
                imagePath: '/png/embedding.png',
            });
        }

        return value.length > 0 ? value : undefined;
    };

    const handleChange = () => {
        setOpenNewModal(true);
        if (embedding) {
            setCheckedItemId(embedding.id);
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
            setAllSearchableEmbeddings(allEmbeddings);
        } else {
            setOpenNewModal(open);
        }
    };

    const onEdit = (id: string) => {
        const obj = allEmbeddings?.find(x => x.id === id);
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
                label={label ?? 'Embedding Model'}
                labelClassName={labelClassName}
                values={getEmbedding()}
                imagePath="/png/empty_state_embedding.png"
                imageWidth={imageWidth ?? "120"}
                imageType="png"
                description={
                    description ??
                    "No embedding model has been added. Please use 'Add Embedding' to provide instructions for the retrieval."
                }
                hideDescription={hideDescription}
                footer={
                    embedding ? (
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
                            {!embedding && (
                                <Button variant="link" onClick={() => setOpenNewModal(true)}>
                                    Add Embedding
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
                                        if (!isOpen) return 'Embedding Models';
                                        return isEdit ? 'Edit Embedding Model' : 'New Embedding Model';
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
                                        New Embedding Model
                                    </Button>
                                </div>
                            )}
                            {isOpen ? (
                                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                                    <EmbeddingFormBody
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
                                    {embeddingsLoading ? (
                                        <div className="w-full flex flex-col items-center justify-center gap-y-1 justify-center py-4 h-full">
                                            <LoaderCircle
                                                className="animate-spin"
                                                size={25}
                                                width={25}
                                                height={25}
                                                absoluteStrokeWidth={undefined}
                                            />
                                            <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                                Please wait! loading the embeddings data for you...
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <Input
                                                className="w-full"
                                                placeholder="Search embeddings"
                                                onChange={handleSearch}
                                            />
                                            {allSearchableEmbeddings?.length > 0 ? (
                                                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                                                    {allSearchableEmbeddings.map((embedding) => {
                                                        return (
                                                            <SelectableRadioItem
                                                                key={embedding.id as string}
                                                                id={embedding.id as string}
                                                                title="Embedding"
                                                                type={SelectableType.EMBEDDING}
                                                                label={embedding.name}
                                                                description={embedding.description}
                                                                isChecked={checkedItemId === embedding.id}
                                                                imagePath="/png/embedding.png"
                                                                expandTriggerName="Show Embedding"
                                                                handleClick={() => setCheckedItemId(embedding.id)}
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
                                                                No Embeddings have been
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
                                Add embedding
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
