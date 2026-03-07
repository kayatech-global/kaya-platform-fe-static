import { Input, Label, Tooltip, TooltipContent, TooltipTrigger } from '@/components';
import React from 'react';
import { VectorRagConfigurationFormProps } from './vector-rag-configuration-form';
import { validateField } from '@/utils/validation';
import { RAGRetrievalStrategyType } from '@/enums';
import { getEnumKeyByValueV2, sanitizeNumericInput } from '@/lib/utils';
import { Controller } from 'react-hook-form';
import QueryEditor from '@/components/molecules/query-editor.tsx/query-editor';
import { Info } from 'lucide-react';

interface IRetrievalFormFields {
    props: VectorRagConfigurationFormProps;
    isReadOnly: boolean;
}

export const RetrievalFormFields = ({ props, isReadOnly }: IRetrievalFormFields) => {
    const { errors, isEdit, control, index = 0, register, watch } = props;

    return (
        <>
            <div className="col-span-2 sm:col-span-2">
                <Input
                    {...register(`configurations.retrievals.${index}.topK`, {
                        required: {
                            value: true,
                            message: 'Please enter a max document count (Top K)',
                        },
                        min: {
                            value: 0,
                            message: 'Value cannot be less than 0',
                        },
                        valueAsNumber: true,
                    })}
                    type="number"
                    placeholder="Enter a Max Document Count (Top K)"
                    readOnly={isEdit && isReadOnly}
                    label="Max Document Count (Top K)"
                    isDestructive={!!errors?.configurations?.retrievals?.[index]?.topK?.message}
                    supportiveText={errors?.configurations?.retrievals?.[index]?.topK?.message}
                    helperInfo="This is the maximum number of documents to retrieve for each query. It should be a positive integer."
                    onInput={sanitizeNumericInput}
                />
            </div>
            <div className="col-span-2 sm:col-span-2">
                <Controller
                    name={`configurations.retrievals.${index}.metadata`}
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className="flex flex-col gap-y-2">
                            <Label
                                htmlFor={`enable_configurations.metadata${index}`}
                                className="text-sm font-medium text-gray-700 dark:text-gray-100 flex items-baseline gap-x-1"
                            >
                                Metadata
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info size={13} />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" align="center" className="max-w-[250px]">
                                        Filter documents based on metadata criteria. Use JSON format to specify
                                        conditions for document retrieval based on document properties.
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <QueryEditor
                                {...field}
                                error={fieldState.error?.message}
                                placeholder='e.g. {"source": "tweet"} or {"$and": [{"id": {"$eq": "25"}}, {"location": {"$in": ["pond"]}}]}'
                            />
                        </div>
                    )}
                />
            </div>
            {watch(`configurations.retrievals.${index}.searchType`) ===
                getEnumKeyByValueV2(RAGRetrievalStrategyType, RAGRetrievalStrategyType.SIMILARITY_SCORE_THRESHOLD) && (
                <div className="col-span-1 sm:col-span-1">
                    <Input
                        {...register(`configurations.retrievals.${index}.scoreThreshold`, {
                            required: validateField('score threshold', { required: { value: true } }).required,
                            validate: value =>
                                value && (value > 0 && value < 1) || 'Value must be a float strictly between 0 and 1 (not including 0 or 1)',
                            valueAsNumber: true,
                        })}
                        type="number"
                        placeholder="Enter a Score Threshold"
                        readOnly={isEdit && isReadOnly}
                        label="Score Threshold"
                        isDestructive={!!errors?.configurations?.retrievals?.[index]?.scoreThreshold?.message}
                        supportiveText={errors?.configurations?.retrievals?.[index]?.scoreThreshold?.message}
                        helperInfo="This is the minimum score a document must have to be considered relevant. It should be a positive number."
                    />
                </div>
            )}
            {watch(`configurations.retrievals.${index}.searchType`) ===
                getEnumKeyByValueV2(RAGRetrievalStrategyType, RAGRetrievalStrategyType.MMR) && (
                <>
                    <div className="col-span-1 sm:col-span-2">
                        <Input
                            {...register(`configurations.retrievals.${index}.fetchK`, {
                                required: {
                                    value: true,
                                    message: 'Please enter a max document count (Fetch K)',
                                },
                                min: {
                                    value: 0,
                                    message: 'Value cannot be less than 0',
                                },
                                valueAsNumber: true,
                            })}
                            type="number"
                            placeholder="Enter a Max Document Count (Fetch K)"
                            readOnly={isEdit && isReadOnly}
                            label="Max Document Count (Fetch K)"
                            isDestructive={!!errors?.configurations?.retrievals?.[index]?.fetchK?.message}
                            supportiveText={errors?.configurations?.retrievals?.[index]?.fetchK?.message}
                            helperInfo="This is the maximum number of documents to fetch for Maximum Marginal Relevance (MMR) before applying diversity. It should be a positive integer."
                            onInput={sanitizeNumericInput}
                        />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <Input
                            {...register(`configurations.retrievals.${index}.lambdaMult`, {
                                required: validateField('lambda multiplier', { required: { value: true } }).required,
                                min: {
                                    value: 0,
                                    message: 'Value cannot be less than 0',
                                },
                                max: {
                                    value: 1,
                                    message: 'Value cannot be greater than 1',
                                },
                                valueAsNumber: true,
                            })}
                            type="number"
                            placeholder="Enter a Lambda Multiplier"
                            readOnly={isEdit && isReadOnly}
                            label="Lambda Multiplier"
                            isDestructive={!!errors?.configurations?.retrievals?.[index]?.lambdaMult?.message}
                            supportiveText={errors?.configurations?.retrievals?.[index]?.lambdaMult?.message}
                            helperInfo="The lambda multiplier controls the balance between relevance and diversity in Maximum Marginal Relevance (MMR). A value of 1 maximizes relevance (no diversity), while 0 maximizes diversity (ignores relevance). Typical values range from 0.5 to 0.7 for a good balance between both factors."
                        />
                    </div>
                </>
            )}
        </>
    );
};
