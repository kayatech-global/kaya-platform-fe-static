import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GraphRagConfigurationFormProps } from '../graph-rag-configuration-form';
import {
    Button,
    DatabaseConnectionSelector,
    EmbeddingModelSelector,
    FormFieldGroup,
    Input,
    Label,
    Select,
    TagsInput,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/atoms/accordion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import PreRetrievalFormFields from './pre-retrieval-form-fields';
import { DatabaseItemType, QueryLanguageType } from '@/enums';
import { validateField } from '@/utils/validation';
import { sanitizeNumericInput, validateSpaces } from '@/lib/utils';
import { Controller, useWatch } from 'react-hook-form';
import { Database, Info, Plus, Trash2 } from 'lucide-react';
import { RetrievalPicker, RetrievalPickerRef } from './retrieval-picker';
import { IDatabase, IEmbedding } from '@/models';
import { PostRetrievalFormFields } from './post-retrieval-form-fields';
import { Switch } from '@/components/atoms/switch';
import { hybridSearchOptions } from '@/constants/rag-constants';

interface RetrievalFormProps extends GraphRagConfigurationFormProps {
    index: number;
    hasAccordionItem?: boolean;
}

const RetrievalForm = (props: RetrievalFormProps) => {
    const {
        errors,
        isEdit,
        control,
        embeddings,
        loadingEmbeddings,
        databases,
        loadingDatabases,
        index,
        setValue,
        register,
        getValues,
        watch,
        trigger,
        refetchEmbedding,
        refetchDatabase,
    } = props;
    const [embedding, setEmbedding] = useState<IEmbedding | undefined>(undefined);
    const [database, setDatabase] = useState<IDatabase | undefined>(undefined);

    useEffect(() => {
        if (isEdit) {
            setEmbedding(
                embeddings?.find(
                    embedding => embedding.id === getValues().configurations?.retrievals?.[index]?.embeddingModelId
                )
            );
        } else {
            setEmbedding(
                embeddings?.find(
                    embedding => embedding.id === watch(`configurations.retrievals.${index}.embeddingModelId`)
                )
            );
        }
    }, [isEdit, watch(`configurations.retrievals.${index}.embeddingModelId`), embeddings]);

    useEffect(() => {
        if (isEdit) {
            setDatabase(databases?.find(db => db.id === getValues().configurations?.retrievals?.[index]?.database));
        } else {
            setDatabase(databases?.find(db => db.id === watch(`configurations.retrievals.${index}.database`)));
        }
    }, [isEdit, watch(`configurations.retrievals.${index}.database`), databases]);

    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    const onEmbeddingChange = async (embedding: IEmbedding | undefined) => {
        if (embedding) {
            setValue(`configurations.retrievals.${index}.embeddingModelId`, embedding?.id as string);
        } else {
            setValue(`configurations.retrievals.${index}.embeddingModelId`, '');
        }
        await trigger(`configurations.retrievals.${index}.embeddingModelId`);
    };

    const onDatabaseChange = async (db: IDatabase | undefined) => {
        if (db) {
            setValue(`configurations.retrievals.${index}.database`, db?.id as string);
        } else {
            setValue(`configurations.retrievals.${index}.database`, '');
        }
        await trigger(`configurations.retrievals.${index}.database`);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormFieldGroup title="General" showSeparator={false}>
                <div className="col-span-1 sm:col-span-2">
                    <Controller
                        name={`configurations.retrievals.${index}.database`}
                        control={control}
                        rules={{
                            required: { value: true, message: 'Please select a database' },
                        }}
                        render={() => (
                            <div
                                className={`mt-2 border-2 border-solid rounded-lg p-2 sm:p-4 ${
                                    !!errors?.configurations?.retrievals?.[index]?.database?.message
                                        ? 'border-red-300'
                                        : 'border-gray-300 dark:border-gray-700'
                                }`}
                            >
                                <DatabaseConnectionSelector
                                    database={database}
                                    allDatabases={databases}
                                    databaseType={DatabaseItemType.GRAPH}
                                    databaseLoading={loadingDatabases}
                                    isReadonly={isEdit && isReadOnly}
                                    setDatabase={setDatabase}
                                    onModalChange={async () =>
                                        await trigger(`configurations.retrievals.${index}.database`)
                                    }
                                    onRefetch={() => refetchDatabase()}
                                    onDatabaseChange={onDatabaseChange}
                                />
                            </div>
                        )}
                    />
                    {!!errors?.configurations?.retrievals?.[index]?.database?.message && (
                        <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                            {errors?.configurations?.retrievals?.[index]?.database?.message}
                        </p>
                    )}
                </div>
                <div className="col-span-1 sm:col-span-2">
                    <Controller
                        name={`configurations.retrievals.${index}.embeddingModelId`}
                        control={control}
                        rules={{
                            required: { value: true, message: 'Please select an embedding model' },
                        }}
                        render={() => (
                            <div
                                className={`mt-2 border-2 border-solid rounded-lg p-2 sm:p-4 ${
                                    !!errors?.configurations?.retrievals?.[index]?.embeddingModelId?.message
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
                                        await trigger(`configurations.retrievals.${index}.embeddingModelId`)
                                    }
                                    onRefetch={() => refetchEmbedding()}
                                    onEmbeddingChange={onEmbeddingChange}
                                />
                            </div>
                        )}
                    />
                    {!!errors?.configurations?.retrievals?.[index]?.embeddingModelId?.message && (
                        <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                            {errors?.configurations?.retrievals?.[index]?.embeddingModelId?.message}
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
            </FormFieldGroup>
            <FormFieldGroup title="Pre Retrieval" showSeparator={false}>
                <PreRetrievalFormFields {...props} index={index} />
            </FormFieldGroup>
            <FormFieldGroup title="Retrieval" showSeparator={false}>
                <>
                    <div className="col-span-1 sm:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select
                                {...register(`configurations.retrievals.${index}.queryLanguage`, {
                                    required: { value: true, message: 'Please select query language' },
                                })}
                                label="Query Language"
                                placeholder="Select a Query Language"
                                disabled={isEdit && isReadOnly}
                                options={[{ value: QueryLanguageType.CYPHER, name: QueryLanguageType.CYPHER }]}
                                currentValue={watch(`configurations.retrievals.${index}.queryLanguage`)}
                                isDestructive={!!errors?.configurations?.retrievals?.[index]?.queryLanguage?.message}
                                supportiveText={errors?.configurations?.retrievals?.[index]?.queryLanguage?.message}
                                helperInfo="This is the query language used to interact with the graph database. Currently, only Cypher is supported."
                            />
                            <Input
                                {...register(`configurations.retrievals.${index}.nodeLabel`, {
                                    required: validateField('node label', { required: { value: true } }).required,
                                    validate: value => validateSpaces(value, 'node label'),
                                })}
                                placeholder="Enter a Node Label"
                                label="Node Label"
                                helperInfo="The label assigned to each node in the graph database (e.g., Document, Article). This helps categorize and identify node types."
                                readOnly={isEdit && isReadOnly}
                                isDestructive={!!errors?.configurations?.retrievals?.[index]?.nodeLabel?.message}
                                supportiveText={errors?.configurations?.retrievals?.[index]?.nodeLabel?.message}
                            />
                        </div>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <Input
                            {...register(`configurations.retrievals.${index}.embeddingNodeProperty`, {
                                required: validateField('embedding node property', {
                                    required: { value: true },
                                }).required,
                                validate: value => validateSpaces(value, 'embedding node property'),
                            })}
                            placeholder="Enter an Embedding Node Property"
                            label="Embedding Node Property"
                            helperInfo="The name of the property in each node where the embedding vector will be stored (e.g., embedding_vector)"
                            readOnly={isEdit && isReadOnly}
                            isDestructive={
                                !!errors?.configurations?.retrievals?.[index]?.embeddingNodeProperty?.message
                            }
                            supportiveText={errors?.configurations?.retrievals?.[index]?.embeddingNodeProperty?.message}
                        />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <Input
                            {...register(`configurations.retrievals.${index}.topK`, {
                                required: {
                                    value: true,
                                    message: 'Please enter a max document count (Top K)',
                                },
                                min: {
                                    value: 1,
                                    message: 'Value cannot be less than 1',
                                },
                                valueAsNumber: true,
                            })}
                            placeholder="Enter a Max Document Count (Top K)"
                            readOnly={isEdit && isReadOnly}
                            label="Max Document Count (Top K)"
                            type="number"
                            isDestructive={!!errors?.configurations?.retrievals?.[index]?.topK?.message}
                            supportiveText={errors?.configurations?.retrievals?.[index]?.topK?.message}
                            onInput={sanitizeNumericInput}
                            helperInfo="The maximum number of documents to retrieve for each query. This limits the number of results returned from the graph database."
                        />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <TagsInput
                            name={`configurations.retrievals.${index}.textNodeProperties`}
                            label="Text node properties"
                            helperInfo='A list of property names in each node that contain the textual content to be used for embedding (e.g., ["title", "content"]).'
                            control={control}
                            rules={{
                                validate: (value: string[]) =>
                                    (value && value.length > 0) || 'At least one text node property is required',
                            }}
                            disabled={isEdit && isReadOnly}
                        />
                    </div>
                </>
            </FormFieldGroup>
            <FormFieldGroup title="Post Retrieval" showSeparator={false}>
                <PostRetrievalFormFields {...props} index={index} />
            </FormFieldGroup>
        </div>
    );
};

const AccordionLayout = (props: RetrievalFormProps) => {
    const { control, index, hasAccordionItem, trigger, removeRetrieval } = props;
    const [isValid, setValid] = useState(false);

    const watchedRow = useWatch({
        control,
        name: `configurations.retrievals.${index}`,
    });

    useEffect(() => {
        (async () => {
            if (hasAccordionItem) {
                const validate = await trigger(`configurations.retrievals.${index}`, { shouldFocus: false });
                setValid(validate);
            }
        })();
    }, [watchedRow, index, hasAccordionItem, trigger]);

    if (hasAccordionItem) {
        return (
            <AccordionItem
                value={`item-${index}`}
                className="border border-border rounded-md bg-muted/40 mb-4 overflow-hidden"
            >
                <AccordionTrigger className="px-2 py-2 no-underline hover:no-underline">
                    <div className="flex justify-between items-center w-[95%]">
                        <div className="flex items-center gap-x-2">
                            <div className="h-8 w-8 flex items-center justify-center rounded-md bg-blue-50 dark:bg-blue-500">
                                <Database size={20} className="text-blue-500 dark:text-white" />
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                Retrieval #{index + 1}
                            </p>
                            {!isValid && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info size={16} className="text-red-500 dark:text-red-400" />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" align="center" className="w-[300px]">
                                            {`Please complete all required fields in the retrieval settings before saving.`}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                        <Trash2
                            size={16}
                            className="font-normal text-red-500 dark:text-red-600"
                            onClick={() => removeRetrieval(index)}
                        />
                    </div>
                </AccordionTrigger>
                <AccordionContent className="py-3 px-3" forceMount>
                    <RetrievalForm {...props} />
                </AccordionContent>
            </AccordionItem>
        );
    }

    return <RetrievalForm {...props} />;
};

export const RetrievalTab = (props: GraphRagConfigurationFormProps) => {
    const { retrievalFields, isValid, isEdit, control, watch, appendRetrieval, removeRetrieval, trigger } = props;
    const retrievalPickerRef = useRef<RetrievalPickerRef>(null);
    const [openItem, setOpenItem] = useState<string>('');
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [draftIndex, setDraftIndex] = useState<number | null>(null);
    const [limit] = useState<number>(10);

    const fields = useMemo(() => {
        return retrievalFields?.filter((_, index) => index !== draftIndex);
    }, [retrievalFields, draftIndex]);

    const retrievalRules = useMemo(() => {
        return (
            !openModal && {
                validate: (value: unknown[]) =>
                    (value && value.filter((_, index) => index !== draftIndex).length > 0) ||
                    'At least one retrieval is required',
            }
        );
    }, [openModal, draftIndex]);

    useEffect(() => {
        if (!openModal) {
            if (retrievalPickerRef.current) {
                retrievalPickerRef.current?.triggerBlur();
            }
        }
    }, [openModal, fields]);

    const addRetrieval = () => {
        setOpenItem('');
        const newIndex = retrievalFields.length;
        appendRetrieval();
        setDraftIndex(newIndex);
        setOpenModal(true);
    };

    const onModalClose = (open: boolean) => {
        if (!open && draftIndex !== null) {
            removeRetrieval(draftIndex);
            setDraftIndex(null);
        }
        setOpenModal(open);
    };

    const onSubmit = () => {
        setOpenModal(false);
        setDraftIndex(null);
        if (retrievalPickerRef.current) {
            retrievalPickerRef.current?.triggerBlur();
        }
    };

    return (
        <>
            {watch('configurations.graphRagType') && (
                <>
                    {fields?.length > 0 && (
                        <div className="col-span-1 sm:col-span-2 flex justify-end">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size={'icon'}
                                            variant="secondary"
                                            disabled={
                                                !isValid || (isEdit && !!watch('isReadOnly')) || fields.length >= limit
                                            }
                                            onClick={addRetrieval}
                                        >
                                            <Plus />
                                        </Button>
                                    </TooltipTrigger>
                                    {(fields.length >= limit || !isValid) && (
                                        <TooltipContent side="left" align="center">
                                            {fields.length >= limit
                                                ? `You've reached the limit. Only ${limit} records can be added.`
                                                : 'Each item must be valid before a new one can be added.'}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    )}
                    <div className="col-span-1 sm:col-span-2">
                        {fields?.length > 0 ? (
                            <Accordion
                                type="single"
                                value={openItem}
                                onValueChange={value => setOpenItem(value)}
                                collapsible
                            >
                                {fields?.map((item, index) => (
                                    <AccordionLayout
                                        key={item.id ?? index}
                                        {...props}
                                        index={index}
                                        hasAccordionItem={true}
                                    />
                                ))}
                            </Accordion>
                        ) : (
                            <RetrievalPicker
                                ref={retrievalPickerRef}
                                name="configurations.retrievals"
                                description="Create a new retrieval configuration to use with this Graph RAG configuration."
                                control={control}
                                rules={retrievalRules}
                                trigger={trigger}
                                disabled={isEdit && !!watch('isReadOnly')}
                                onRetrieval={addRetrieval}
                            />
                        )}
                    </div>
                </>
            )}
            <Dialog open={openModal} onOpenChange={onModalClose}>
                <DialogContent className="max-w-[unset] w-[580px] ">
                    <DialogHeader className="px-0">
                        <DialogTitle asChild>
                            <div className="px-4 flex gap-2">
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                    Configure Retrieval
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription asChild>
                        <div className="p-3 flex flex-col gap-y-4 h-[351px] overflow-y-auto">
                            {typeof draftIndex === 'number' && draftIndex >= 0 ? (
                                <AccordionLayout {...props} index={draftIndex} />
                            ) : (
                                <p className="text-center text-xs font-normal">Loading...</p>
                            )}
                        </div>
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => onModalClose(false)}>
                            Cancel
                        </Button>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size={'sm'}
                                        disabled={!isValid || (isEdit && !!watch('isReadOnly'))}
                                        onClick={onSubmit}
                                    >
                                        Create
                                    </Button>
                                </TooltipTrigger>
                                {!isValid && (
                                    <TooltipContent side="left" align="center">
                                        All details need to be filled before the form can be saved
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
