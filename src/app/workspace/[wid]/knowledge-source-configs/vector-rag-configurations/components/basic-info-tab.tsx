import { useMemo } from 'react';
import { VectorRagConfigurationFormProps } from './vector-rag-configuration-form';
import { validateField } from '@/utils/validation';
import { Input, Select, Textarea } from '@/components';
import { validateSpaces } from '@/lib/utils';
import { ragTypeDescriptions, ragVariantOptions } from '@/constants/rag-constants';
import { MessageSquareText } from 'lucide-react';
import { motion } from 'framer-motion';

export const BasicInfoTab = (props: VectorRagConfigurationFormProps) => {
    const { errors, isEdit, register, watch } = props;

    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    const descriptionValidate = validateField('Description', {
        required: { value: true },
        minLength: { value: 5 },
    });

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="col-span-1 sm:col-span-2">
                <Input
                    {...register('name', {
                        required: validateField('name', { required: { value: true } }).required,
                        validate: value => validateSpaces(value, 'name'),
                    })}
                    placeholder="Enter a Name"
                    readOnly={isEdit && isReadOnly}
                    label="Name"
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
                    placeholder="Enter a Description"
                    readOnly={isEdit && isReadOnly}
                    rows={3}
                    isDestructive={!!errors?.description?.message}
                    supportiveText={errors?.description?.message}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <div className="w-full">
                    <Select
                        {...register('configurations.ragVariant', {
                            required: { value: true, message: 'Please select RAG type' },
                        })}
                        label="Select RAG Type"
                        placeholder="Select a RAG Type"
                        options={ragVariantOptions}
                        disabled={isEdit && isReadOnly}
                        currentValue={watch('configurations.ragVariant')}
                        isDestructive={!!errors?.configurations?.ragVariant?.message}
                        supportiveText={errors?.configurations?.ragVariant?.message}
                    />
                    {watch('configurations.ragVariant') && (
                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mt-4 flex items-start shadow-sm border border-gray-200 dark:border-gray-600 relative overflow-hidden">
                            <MessageSquareText className="absolute -bottom-4 -right-4 h-24 w-24 text-gray-300 dark:text-gray-600 opacity-40 rotate-12 pointer-events-none" />
                            <div className="flex-1 overflow-hidden z-10">
                                <motion.p
                                    key={watch('configurations.ragVariant')}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    className="text-sm text-gray-700 dark:text-gray-100"
                                >
                                    {
                                        ragTypeDescriptions.find(
                                            rag => rag.ragType === watch('configurations.ragVariant')
                                        )?.description
                                    }
                                </motion.p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
