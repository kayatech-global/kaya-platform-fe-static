import { Button } from '@/components';
import { GuardrailsFormBody as GuardrailsApiConfigurationFormBody } from '@/app/workspace/[wid]/guardrails/guardrails-api-configurations/components/guardrails-api-configuration-form';
import { PayloadOutput, useGuardrailsApiConfiguration } from '@/hooks/use-guardrails-api-configuration';
import { IGuardrailConfigForm } from '@/models';
import { useEffect, useRef } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { IGuardrailsApiTool } from './types';

interface GuardrailsFormWrapperProps {
    isEdit: boolean;
    onRefetch: () => void;
    setOpen: (open: boolean) => void;
    editId?: string;
    allGuardrailsApiTools: IGuardrailsApiTool[];
    onCancel: () => void;
}

const initializeFormData = (
    editId: string | undefined,
    allGuardrailsApiTools: IGuardrailsApiTool[],
    setValue: UseFormSetValue<IGuardrailConfigForm>
) => {
    const obj = allGuardrailsApiTools.find(x => x.id === editId);
    if (!obj) return;

    const output = obj?.configurations?.payload ? JSON.parse(obj?.configurations?.payload) : {};
    const outputArray = Object.entries(output as PayloadOutput).map(([key, value]) => ({
        name: key,
        value: value.description,
        dataType: value.type,
    }));

    const promotedVariablesOutput = obj?.configurations?.promotedVariables
        ? JSON.parse(obj?.configurations?.promotedVariables)
        : {};
    const promotedVariables = Object.entries(promotedVariablesOutput as PayloadOutput).map(([key, value]) => ({
        name: key,
        value: value.description,
        dataType: value.type,
    }));

    setValue('id', obj.id);
    setValue('apiHeaders', obj.configurations?.headers);
    setValue('apiMethod', obj.configurations?.method);
    setValue('apiName', obj.name);
    setValue('isReadOnly', obj?.isReadOnly);
    setValue('description', obj.description ?? '');
    setValue('payloadFormat', obj.configurations?.payload);
    setValue('authorization.authType', obj.configurations?.authorization?.authType);
    if (outputArray.length > 0) {
        setValue('payloads', outputArray);
    }
    if (promotedVariables.length > 0) {
        setValue('promotedVariables', promotedVariables);
    }
    if (obj?.configurations?.authorization?.meta) {
        setValue('authorization.meta.username', obj?.configurations?.authorization?.meta?.username);
        setValue('authorization.meta.password', obj?.configurations?.authorization?.meta?.password);
        setValue('authorization.meta.token', obj?.configurations?.authorization?.meta?.token);
        setValue('authorization.meta.headerName', obj?.configurations?.authorization?.meta?.headerName);
        setValue('authorization.meta.headerValue', obj?.configurations?.authorization?.meta?.headerValue);
    }
};

export const GuardrailsFormWrapper = ({
    isEdit,
    onRefetch,
    setOpen,
    editId,
    allGuardrailsApiTools,
    onCancel,
}: GuardrailsFormWrapperProps) => {
    const {
        isValid,
        errors,
        secrets,
        isSaving,
        apiHeaders,
        payloads,
        control,
        loadingSecrets,
        register,
        watch,
        setValue,
        remove,
        append,
        handleSubmit,
        onHandleSubmit,
        updatePayloadDataType,
        refetch,
        promotedVariables,
        updatePromotedVariablesDataType,
        setOpen: setHookOpen,
        isOpen: isHookOpen,
    } = useGuardrailsApiConfiguration({ triggerQuery: false, onRefetch });

    const initialized = useRef(false);

    useEffect(() => {
        setHookOpen(true);
        // Small delay to ensure state update propagates before we start checking for closure
        const timer = setTimeout(() => {
            initialized.current = true;
        }, 100);
        return () => clearTimeout(timer);
    }, [setHookOpen]);

    useEffect(() => {
        if (initialized.current && !isHookOpen) {
            setOpen(false);
        }
    }, [isHookOpen, setOpen]);

    useEffect(() => {
        if (isEdit && editId) {
            initializeFormData(editId, allGuardrailsApiTools, setValue);
        }
    }, [isEdit, editId, allGuardrailsApiTools, setValue]);

    return (
        <>
            <div className="item-list-container overflow-y-auto flex flex-col gap-y-2 h-[351px]">
                <GuardrailsApiConfigurationFormBody
                    isOpen={isHookOpen}
                    isEdit={isEdit}
                    isValid={isValid}
                    errors={errors}
                    secrets={secrets}
                    isSaving={isSaving}
                    hasTestConnection={false}
                    apiHeaders={apiHeaders}
                    payloads={payloads}
                    control={control}
                    loadingSecrets={loadingSecrets}
                    setOpen={setHookOpen}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    remove={remove}
                    append={append}
                    handleSubmit={handleSubmit}
                    onHandleSubmit={onHandleSubmit}
                    updatePayloadDataType={updatePayloadDataType}
                    refetch={refetch}
                    promotedVariables={promotedVariables}
                    updatePromotedVariablesDataType={updatePromotedVariablesDataType}
                />
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" disabled={!isValid || isSaving} onClick={handleSubmit(onHandleSubmit)}>
                    {isEdit ? 'Update' : 'Create'}
                </Button>
            </div>
        </>
    );
};
