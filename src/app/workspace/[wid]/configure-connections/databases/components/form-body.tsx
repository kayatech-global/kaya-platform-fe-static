'use client';

import React, { useEffect, useMemo } from 'react';
import { Input, Select, Textarea } from '@/components';
import { DatabasesFormProp } from './databases-form';
import { DatabaseItemType } from '@/enums';
import { validateField } from '@/utils/validation';
import VectorDatabase from './database-types/vector-database';
import GraphDatabase from './database-types/graph-database';
import RelationalDatabase from './database-types/relational-database';
import NoSqlDatabase from './database-types/nosql-database';
import { validateSpaces } from '@/lib/utils';

export const FormBody = (props: DatabasesFormProp) => {
    const {
        selectedDatabase,
        errors,
        isReadOnly,
        isEdit,
        databaseType,
        register,
        watch,
        setValue,
        onlyRelationalTypeEnabled,
    } = props;

    useEffect(() => {
        if (databaseType) {
            setValue('type', databaseType);
        }
    }, [databaseType]);

    const dbOptions = Object.values(DatabaseItemType).map(db => ({
        name: db
            .replaceAll('_', ' ')
            .toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase()), // Optional beautify
        value: db,
        disabled: onlyRelationalTypeEnabled ? db !== DatabaseItemType.RELATIONAL : false,
    }));

    const options = useMemo(() => {
        if (selectedDatabase) {
            return selectedDatabase?.providers?.map(x => ({ name: x, value: x }));
        }
        return [];
    }, [selectedDatabase]);

    const descriptionValidate = validateField('Description', {
        required: { value: true },
        minLength: { value: 5 },
    });

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
                <Select
                    {...register('type', {
                        required: { value: true, message: 'Please select a type' },
                    })}
                    label="Type"
                    placeholder="Select a Type"
                    options={dbOptions}
                    currentValue={databaseType ?? watch('type')}
                    disabled={!!databaseType || (isEdit && isReadOnly)}
                    isDestructive={!!errors?.type?.message}
                    supportiveText={errors?.type?.message}
                />
            </div>
            <div className="col-span-1 sm:col-span-2">
                <Input
                    {...register('name', {
                        required: { value: true, message: 'Please enter a name' },
                        validate: value => validateSpaces(value, 'name'),
                    })}
                    className="w-full"
                    placeholder="Enter a Name"
                    label="Name"
                    readOnly={isEdit && isReadOnly}
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
                    rows={3}
                    className="w-full"
                    placeholder="Enter a Description"
                    label="Description"
                    readOnly={isEdit && isReadOnly}
                    isDestructive={!!errors?.description?.message}
                    supportiveText={errors?.description?.message}
                />
            </div>
            {selectedDatabase && (
                <>
                    <div className="col-span-1 sm:col-span-2">
                        <Select
                            {...register('configurations.provider', {
                                required: { value: true, message: 'Please select a provider' },
                            })}
                            label="Provider"
                            placeholder="Select a Provider"
                            options={options ?? []}
                            currentValue={watch('configurations.provider')}
                            disabled={isEdit && isReadOnly}
                            isDestructive={!!errors?.configurations?.provider?.message}
                            supportiveText={errors?.configurations?.provider?.message}
                        />
                    </div>
                    {selectedDatabase?.type === DatabaseItemType.VECTOR && (
                        <VectorDatabase {...props} options={options} />
                    )}
                    {selectedDatabase?.type === DatabaseItemType.GRAPH && (
                        <GraphDatabase {...props} options={options} />
                    )}
                    {selectedDatabase?.type === DatabaseItemType.RELATIONAL && (
                        <RelationalDatabase {...props} options={options} />
                    )}
                    {selectedDatabase?.type === DatabaseItemType.NOSQL && (
                        <NoSqlDatabase {...props} options={options} />
                    )}
                </>
            )}
        </div>
    );
};
