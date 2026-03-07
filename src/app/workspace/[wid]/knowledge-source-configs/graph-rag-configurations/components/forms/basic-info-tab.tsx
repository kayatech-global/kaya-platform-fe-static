import { useMemo } from 'react';
import { GraphRagConfigurationFormProps } from '../graph-rag-configuration-form';
import { validateField } from '@/utils/validation';
import { Input, Select, Textarea } from '@/components';
import { validateSpaces } from '@/lib/utils';
import { GraphRagType } from '@/enums';
import { MessageSquareText } from 'lucide-react';
import { motion } from 'framer-motion';
import { graphRagTypeDescriptions } from '@/constants/rag-constants';

export const BasicInfoTab = (props: GraphRagConfigurationFormProps) => {
    const { errors, isEdit, register, watch } = props;

    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    const descriptionValidate = validateField('Description', {
        required: { value: true },
        minLength: { value: 5 },
    });

    return (
        <>
            <div className="col-span-1 sm:col-span-2">
                <Input
                    {...register('name', {
                        required: validateField('Source Name', { required: { value: true } }).required,
                        validate: value => validateSpaces(value, 'source name'),
                    })}
                    placeholder="Enter a Source Name"
                    readOnly={isEdit && isReadOnly}
                    label="Source Name"
                    isDestructive={!!errors?.name?.message}
                    supportiveText={errors?.name?.message}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <Textarea
                    {...register('description', {
                        required: descriptionValidate.required,
                        minLength: descriptionValidate.minLength,
                        validate: value => validateSpaces(value, 'description'),
                    })}
                    label="Description"
                    placeholder="Enter a description"
                    rows={3}
                    readOnly={isEdit && isReadOnly}
                    isDestructive={!!errors?.description?.message}
                    supportiveText={errors?.description?.message}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <div className="w-full">
                    <Select
                        {...register('configurations.graphRagType', {
                            required: { value: true, message: 'Please select graph RAG type' },
                        })}
                        label="Graph Rag Type"
                        placeholder="Select a Graph Rag Type"
                        options={[
                            { name: GraphRagType.STANDARDRAG, value: GraphRagType.STANDARDRAG },
                            { name: GraphRagType.CORRECTIVERAG, value: GraphRagType.CORRECTIVERAG }, // REMOVE THIS ATM
                            // { name: GraphRagType.KG2RAG, value: GraphRagType.KG2RAG },
                        ]}
                        disabled={isEdit && isReadOnly}
                        currentValue={watch('configurations.graphRagType')}
                        isDestructive={!!errors?.configurations?.graphRagType?.message}
                        supportiveText={errors?.configurations?.graphRagType?.message}
                    />
                    {watch('configurations.graphRagType') && (
                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mt-4 flex items-start shadow-sm border border-gray-200 dark:border-gray-600 relative overflow-hidden">
                            <MessageSquareText className="absolute -bottom-4 -right-4 h-24 w-24 text-gray-300 dark:text-gray-600 opacity-40 rotate-12 pointer-events-none" />
                            <div className="flex-1 overflow-hidden z-10">
                                <motion.p
                                    key={watch('configurations.graphRagType')}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    className="text-sm text-gray-700 dark:text-gray-100"
                                >
                                    {
                                        graphRagTypeDescriptions.find(
                                            rag => rag.ragType === watch('configurations.graphRagType')
                                        )?.description
                                    }
                                </motion.p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
