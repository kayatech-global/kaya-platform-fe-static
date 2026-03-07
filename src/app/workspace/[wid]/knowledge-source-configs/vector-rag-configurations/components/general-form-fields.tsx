import { DatabaseConnectionSelector, EmbeddingModelSelector, Input, Label, OptionModel, Select } from '@/components';
import React, { useEffect, useState } from 'react';
import { VectorRagConfigurationFormProps } from './vector-rag-configuration-form';
import { DatabaseItemType, DistanceMetricType, RAGRetrievalStrategyType } from '@/enums';
import { sanitizeNumericInput, validateSpaces } from '@/lib/utils';
import { validateField } from '@/utils/validation';
import { Controller } from 'react-hook-form';
import { IDatabase, IEmbedding } from '@/models';
import { Switch } from '@/components/atoms/switch';
import { hybridSearchOptions } from '@/constants/rag-constants';

interface IGeneralFormFields {
    props: VectorRagConfigurationFormProps;
    isReadOnly: boolean;
}

export const GeneralFormFields = ({ props, isReadOnly }: IGeneralFormFields) => {
    const {
        errors,
        isEdit,
        loadingDatabases,
        databases,
        embeddings,
        loadingEmbeddings,
        index = 0,
        control,
        register,
        watch,
        setValue,
        getValues,
        trigger,
        refetchEmbedding,
        refetch,
    } = props;
    const [embedding, setEmbedding] = useState<IEmbedding>();
    const [database, setDatabase] = useState<IDatabase>();

    useEffect(() => {
        if (isEdit) {
            setEmbedding(
                embeddings?.find(
                    embedding => embedding.id === getValues().configurations?.retrievals?.[index]?.embeddingModel
                )
            );
        } else {
            setEmbedding(
                embeddings?.find(
                    embedding => embedding.id === watch(`configurations.retrievals.${index}.embeddingModel`)
                )
            );
        }
    }, [isEdit, watch(`configurations.retrievals.${index}.embeddingModel`), embeddings]);

    useEffect(() => {
        if (isEdit) {
            setDatabase(databases?.find(db => db.id === getValues().configurations?.retrievals?.[index]?.databaseId));
        } else {
            setDatabase(databases?.find(db => db.id === watch(`configurations.retrievals.${index}.databaseId`)));
        }
    }, [isEdit, watch(`configurations.retrievals.${index}.databaseId`), databases]);

    const generateSearchTypeName = (type: RAGRetrievalStrategyType) => {
        switch (type) {
            case RAGRetrievalStrategyType.MMR:
                return 'Maximal marginal relevance (MMR)';
            case RAGRetrievalStrategyType.SIMILARITY_SCORE_THRESHOLD:
                return 'Similarity search with a score threshold';
            case RAGRetrievalStrategyType.SIMILARITY:
                return 'Similarity';
        }
    };

    const mapRAGStrategyToOptions = (): OptionModel[] => {
        return Object.entries(RAGRetrievalStrategyType).map(([key, value]) => ({
            name: generateSearchTypeName(value),
            value: key,
        }));
    };

    const mapDistanceStrategyOption = (): OptionModel[] => {
        return Object.entries(DistanceMetricType).map(([key, value]) => ({
            name: value
                .replace(/_/g, ' ')
                .toLowerCase()
                .replace(/\b\w/g, c => c.toUpperCase()),
            value: key,
        }));
    };

    const onEmbeddingChange = async (embedding: IEmbedding | undefined) => {
        if (embedding) {
            setValue(`configurations.retrievals.${index}.embeddingModel`, embedding?.id as string);
        } else {
            setValue(`configurations.retrievals.${index}.embeddingModel`, '');
        }
        await trigger(`configurations.retrievals.${index}.embeddingModel`);
    };

    const onDatabaseChange = async (db: IDatabase | undefined) => {
        if (db) {
            setValue(`configurations.retrievals.${index}.databaseId`, db?.id as string);
        } else {
            setValue(`configurations.retrievals.${index}.databaseId`, '');
        }
        await trigger(`configurations.retrievals.${index}.databaseId`);
    };

    const distanceSelector = (
        <Select
            {...register(`configurations.retrievals.${index}.distanceStrategy`, {
                required: { value: true, message: 'Please select distance strategy' },
            })}
            label="Distance Strategy"
            placeholder="Select a Distance Strategy"
            options={mapDistanceStrategyOption()}
            disabled={isEdit && isReadOnly}
            currentValue={watch(`configurations.retrievals.${index}.distanceStrategy`)}
            isDestructive={!!errors?.configurations?.retrievals?.[index]?.distanceStrategy?.message}
            supportiveText={errors?.configurations?.retrievals?.[index]?.distanceStrategy?.message}
            helperInfo="This defines how the distance between vectors is calculated. Choose based on your retrieval strategy."
        />
    );

    const searchTypeSelector = (
        <Select
            {...register(`configurations.retrievals.${index}.searchType`, {
                required: { value: true, message: 'Please select search type' },
            })}
            label="Search Type"
            placeholder="Select a Search Type"
            options={mapRAGStrategyToOptions()}
            disabled={isEdit && isReadOnly}
            currentValue={watch(`configurations.retrievals.${index}.searchType`)}
            isDestructive={!!errors?.configurations?.retrievals?.[index]?.searchType?.message}
            supportiveText={errors?.configurations?.retrievals?.[index]?.searchType?.message}
            helperInfo="This defines how the search will be performed on the documents. Choose based on your retrieval strategy."
        />
    );

    return (
        <>
            <div className="col-span-1 sm:col-span-2">
                <Controller
                    name={`configurations.retrievals.${index}.databaseId`}
                    control={control}
                    rules={{
                        required: { value: true, message: 'Please select a database' },
                    }}
                    render={() => (
                        <div
                            className={`mt-2 border-2 border-solid rounded-lg p-2 sm:p-4 ${
                                errors?.configurations?.retrievals?.[index]?.databaseId?.message
                                    ? 'border-red-300'
                                    : 'border-gray-300 dark:border-gray-700'
                            }`}
                        >
                            <DatabaseConnectionSelector
                                database={database}
                                allDatabases={databases}
                                databaseType={DatabaseItemType.VECTOR}
                                databaseLoading={loadingDatabases}
                                isReadonly={isEdit && isReadOnly}
                                setDatabase={setDatabase}
                                onModalChange={async () =>
                                    await trigger(`configurations.retrievals.${index}.databaseId`)
                                }
                                onRefetch={() => refetch()}
                                onDatabaseChange={onDatabaseChange}
                            />
                        </div>
                    )}
                />
                {errors?.configurations?.retrievals?.[index]?.databaseId?.message && (
                    <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                        {errors?.configurations?.retrievals?.[index]?.databaseId?.message}
                    </p>
                )}
            </div>
            <div className="col-span-1 sm:col-span-2">
                <Input
                    {...register(`configurations.retrievals.${index}.tableName`, {
                        required: validateField('table Name / collection Name', {
                            required: { value: true },
                        }).required,
                        validate: value => validateSpaces(value, 'table Name / collection Name'),
                    })}
                    placeholder="Enter a Table Name / Collection Name"
                    readOnly={isEdit && isReadOnly}
                    label="Table Name / Collection Name"
                    isDestructive={!!errors?.configurations?.retrievals?.[index]?.tableName?.message}
                    supportiveText={errors?.configurations?.retrievals?.[index]?.tableName?.message}
                    helperInfo="This is the name of the table or collection where your documents are stored. It should match the name used in your database."
                />
            </div>
            {props?.isModalRequest ? (
                <>
                    <div className="col-span-1 sm:col-span-2">{distanceSelector}</div>
                    <div className="col-span-1 sm:col-span-2">{searchTypeSelector}</div>
                </>
            ) : (
                <div className="col-span-1 sm:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {distanceSelector}
                        {searchTypeSelector}
                    </div>
                </div>
            )}
            <div className="col-span-1 sm:col-span-2">
                <Controller
                    name={`configurations.retrievals.${index}.embeddingModel`}
                    control={control}
                    rules={{
                        required: { value: true, message: 'Please select an embedding model' },
                    }}
                    render={() => (
                        <div
                            className={`mt-2 border-2 border-solid rounded-lg p-2 sm:p-4 ${
                                errors?.configurations?.retrievals?.[index]?.embeddingModel?.message
                                    ? 'border-red-300'
                                    : 'border-gray-300 dark:border-gray-700'
                            }`}
                        >
                            <EmbeddingModelSelector
                                embedding={embedding}
                                allEmbeddings={embeddings}
                                embeddingsLoading={loadingEmbeddings}
                                isReadonly={isEdit && isReadOnly}
                                setEmbedding={setEmbedding}
                                onModalChange={async () =>
                                    await trigger(`configurations.retrievals.${index}.embeddingModel`)
                                }
                                onRefetch={() => refetchEmbedding()}
                                onEmbeddingChange={onEmbeddingChange}
                            />
                        </div>
                    )}
                />
                {errors?.configurations?.retrievals?.[index]?.embeddingModel?.message && (
                    <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                        {errors?.configurations?.retrievals?.[index]?.embeddingModel?.message}
                    </p>
                )}
            </div>
            <div className="col-span-1 sm:col-span-2">
                <Controller
                    name={`configurations.retrievals.${index}.enableHybridSearch`}
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                        <div className="flex items-center gap-x-2">
                            <Switch
                                id={`enable-enableHybridSearch${index}`}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isEdit && isReadOnly}
                            />
                            <Label htmlFor={`enable-enableHybridSearch${index}`}>Enable Hybrid Search</Label>
                        </div>
                    )}
                />
            </div>
            {watch(`configurations.retrievals.${index}.enableHybridSearch`) && (
                <>
                    <div className="col-span-1 sm:col-span-2">
                        <Select
                            {...register(`configurations.retrievals.${index}.hybridSearch`, {
                                required: { value: true, message: 'Please select hybrid search' },
                            })}
                            label="Hybrid Search"
                            placeholder="Select a Hybrid Search"
                            disabled={isEdit && isReadOnly}
                            options={hybridSearchOptions.map(x => ({ name: x.label, value: x.value }))}
                            currentValue={watch(`configurations.retrievals.${index}.hybridSearch`)}
                            isDestructive={!!errors?.configurations?.retrievals?.[index]?.hybridSearch?.message}
                            supportiveText={errors?.configurations?.retrievals?.[index]?.hybridSearch?.message}
                        />
                    </div>
                    {watch(`configurations.retrievals.${index}.hybridSearch`) &&
                        watch(`configurations.retrievals.${index}.hybridSearch`) !== '' && (
                            <div className="col-span-2 sm:col-span-2">
                                <Input
                                    {...register(`configurations.retrievals.${index}.hybridSearchTopK`, {
                                        required: {
                                            value: true,
                                            message: 'Please enter a max document count for hybrid search (Top K)',
                                        },
                                        min: {
                                            value: 0,
                                            message: 'Value cannot be less than 0',
                                        },
                                        valueAsNumber: true,
                                    })}
                                    type="number"
                                    placeholder="Enter a Max Document Count For Hybrid Search (Top K)"
                                    readOnly={isEdit && isReadOnly}
                                    label="Max Document Count For Hybrid Search (Top K)"
                                    isDestructive={
                                        !!errors?.configurations?.retrievals?.[index]?.hybridSearchTopK?.message
                                    }
                                    supportiveText={
                                        errors?.configurations?.retrievals?.[index]?.hybridSearchTopK?.message
                                    }
                                    helperInfo="The maximum number of document to be used in the hybrid search."
                                    onInput={sanitizeNumericInput}
                                />
                            </div>
                        )}
                </>
            )}
        </>
    );
};
