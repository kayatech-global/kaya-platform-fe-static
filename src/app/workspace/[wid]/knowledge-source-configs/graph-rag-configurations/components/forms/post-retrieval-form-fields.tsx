import { Controller } from 'react-hook-form';
import { GraphRagConfigurationFormProps } from '../graph-rag-configuration-form';
import { Switch } from '@/components/atoms/switch';
import { Input, Label, ReRankingModelSelector } from '@/components';
import { useEffect, useMemo, useState } from 'react';
import { validateField } from '@/utils/validation';
import { IReRanking } from '@/models';

export const PostRetrievalFormFields = (props: GraphRagConfigurationFormProps) => {
    const {
        errors,
        isEdit,
        control,
        reRankings,
        loadingReRankings,
        index = 0,
        getValues,
        setValue,
        register,
        trigger,
        watch,
        refetchReRanking,
    } = props;
    const [reRanking, setReRanking] = useState<IReRanking>();

    useEffect(() => {
        if (isEdit) {
            setReRanking(
                reRankings?.find(
                    reRanking => reRanking.id === getValues().configurations?.retrievals?.[index]?.reRankingModelId
                )
            );
        } else {
            setReRanking(
                reRankings?.find(
                    reRanking => reRanking.id === watch(`configurations.retrievals.${index}.reRankingModelId`)
                )
            );
        }
    }, [isEdit, watch(`configurations.retrievals.${index}.reRankingModelId`), reRanking]);

    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    const onReRankingChange = async (reRanking: IReRanking | undefined) => {
        if (reRanking) {
            setValue(`configurations.retrievals.${index}.reRankingModelId`, reRanking?.id as string);
        } else {
            setValue(`configurations.retrievals.${index}.reRankingModelId`, '');
        }
        await trigger(`configurations.retrievals.${index}.reRankingModelId`);
    };

    return (
        <>
            <div className="col-span-1 sm:col-span-2">
                <Controller
                    name={`configurations.retrievals.${index}.enableReRanking`}
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                        <div className="flex items-center gap-x-2">
                            <Switch
                                id={`enable-enableReRanking${index}`}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isEdit && isReadOnly}
                            />
                            <Label htmlFor={`enable-enableReRanking${index}`}>Enable Re-ranking</Label>
                        </div>
                    )}
                />
            </div>
            {watch(`configurations.retrievals.${index}.enableReRanking`) && (
                <>
                    <div className="col-span-1 sm:col-span-2">
                        <Controller
                            name={`configurations.retrievals.${index}.reRankingModelId`}
                            control={control}
                            rules={{
                                required: { value: true, message: 'Please select a re-ranking model' },
                            }}
                            render={() => (
                                <div
                                    className={`mt-2 border-2 border-solid rounded-lg p-2 sm:p-4 ${
                                        errors?.configurations?.retrievals?.[index]?.reRankingModelId?.message
                                            ? 'border-red-300'
                                            : 'border-gray-300 dark:border-gray-700'
                                    }`}
                                >
                                    <ReRankingModelSelector
                                        reRanking={reRanking}
                                        allReRankings={reRankings}
                                        reRankingsLoading={loadingReRankings}
                                        isReadonly={isEdit && isReadOnly}
                                        setReRanking={setReRanking}
                                        onModalChange={async () =>
                                            await trigger(`configurations.retrievals.${index}.reRankingModelId`)
                                        }
                                        onRefetch={() => refetchReRanking()}
                                        onReRankingChange={onReRankingChange}
                                    />
                                </div>
                            )}
                        />
                        {errors?.configurations?.retrievals?.[index]?.reRankingModelId?.message && (
                            <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                                {errors?.configurations?.retrievals?.[index]?.reRankingModelId?.message}
                            </p>
                        )}
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                        <Input
                            {...register(`configurations.retrievals.${index}.reRankingScoreThreshold`, {
                                required: validateField('Re-ranking score threshold', {
                                    required: { value: true },
                                }).required,
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
                            placeholder="Enter Re-ranking score threshold"
                            readOnly={isEdit && isReadOnly}
                            label="Re-ranking Score Threshold"
                            isDestructive={
                                !!errors?.configurations?.retrievals?.[index]?.reRankingScoreThreshold?.message
                            }
                            supportiveText={
                                errors?.configurations?.retrievals?.[index]?.reRankingScoreThreshold?.message
                            }
                            helperInfo="The score threshold for re-ranking results. Only results with a score above this threshold will be considered."
                        />
                    </div>
                </>
            )}
        </>
    );
};
