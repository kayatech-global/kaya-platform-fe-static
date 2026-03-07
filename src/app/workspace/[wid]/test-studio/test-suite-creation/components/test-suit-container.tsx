'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { TestSuitsTableContainer } from './test-suits-table-container';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';
import { TestSuiteForm } from './test-suite-form';
import { FormProvider } from 'react-hook-form';
import {useTestSuite} from "@/hooks/use-test-suite";

export const TestSuitContainer = () => {


    const {
        allTestSuits,
        isTestSuitEdit,
        isTestSuitDrawerOpen,
        isLoadingTestSuits,
        fetchTestSuiteForView,
        onCreate,
        onUpdate,
        watch,
        register,
        control,
        errors,
        isValid,
        fields,
        append,
        remove,
        getValues,
        trigger,
        reset,
        handleSubmit,
        setError,
        clearErrors,
        setFocus,
        resetField,
        formState,
        getFieldState,
        unregister,
        setValue,
        setIsTestSuitDrawerOpen,
        refetchAllTestSuits,
        handleOnCreateTestSuite,
        handleOnEditTestSuite,
        handleOnDeleteTestSuite,
        handleSearchByWorkflow,
    } = useTestSuite();

    const formMethods = {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        getValues,
        setError,
        clearErrors,
        setFocus,
        resetField,
        trigger,
        formState,
        reset,
        getFieldState,
        unregister,
    };

    if (isLoadingTestSuits) return <PlatformConfigurationSuiteSkeleton hasCards={false} />;

    return (
        <div className="metric-page pb-4">
            <div className="flex justify-between gap-x-9">
                <div
                    className={cn('dashboard-left-section flex flex-col w-full', {
                        'gap-y-9': true,
                    })}
                >
                    <TestSuitsTableContainer
                        testSuits={allTestSuits ?? []}
                        handleCreate={handleOnCreateTestSuite}
                        handleEdit={handleOnEditTestSuite}
                        handleDelete={handleOnDeleteTestSuite}
                        handleSearchByTestSuiteName={handleSearchByWorkflow}
                        refetchTestSuits={refetchAllTestSuits}
                        fetchTestSuiteForView={fetchTestSuiteForView}
                    />
                </div>
            </div>
            <FormProvider {...formMethods}>
                <TestSuiteForm
                    isOpen={isTestSuitDrawerOpen}
                    setIsOpen={setIsTestSuitDrawerOpen}
                    isEdit={isTestSuitEdit}
                    onCreate={onCreate}
                    onUpdate={onUpdate}
                    register={register}
                    handleSubmit={handleSubmit}
                    control={control}
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                    isValid={isValid}
                    reset={reset}
                    fields={fields}
                    append={append}
                    remove={remove}
                    getValues={getValues}
                    existingTestSuites={allTestSuits ?? []}
                />
            </FormProvider>
        </div>
    );
};
