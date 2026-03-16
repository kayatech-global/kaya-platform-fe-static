'use client';
import { FormBody as ApiConfigurationFormBody } from '@/app/workspace/[wid]/api-configurations/components/api-configuration-form';
import { DetailItemInput, valuesProps } from '@/components/molecules/detail-item-input/detail-item-input';
import { DefaultApiParameter, PayloadOutput, useApiConfiguration } from '@/hooks/use-api-configuration';
import React, { useEffect, useMemo, useState } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import TestApiModal from '@/components/molecules/test-api-modal/test-api-modal';
import { ApiSelectorFooter } from './api-selector-footer';
import { APISelectorProps, IApiConfigForm } from '@/models';
import { useApiSelection } from './api-selector/use-api-selection';
import { ApiList } from './api-selector/api-list';
import { ApiDialog } from './api-selector/api-dialog';
import { Button } from '@/components';
import { AuthenticationGrantType } from '@/enums';
export type { APISelectorProps } from '@/models';

const populateApiConfigurationForm = (
    id: string,
    allApiTools: APISelectorProps['allApiTools'],
    setValue: UseFormSetValue<IApiConfigForm>
) => {
    const obj = allApiTools.find(x => x.id === id);
    if (obj) {
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

        const defaultApiParametersOutput = obj?.configurations?.defaultApiParameters
            ? JSON.parse(obj?.configurations?.defaultApiParameters)
            : {};
        const defaultApiParameters = Object.entries(defaultApiParametersOutput as DefaultApiParameter).map(
            ([key, value]) => ({
                name: key,
                value: value.value,
                dataType: value.type,
            })
        );

        setValue('id', obj.id);
        setValue('apiHeaders', obj.configurations?.headers ?? []);
        setValue('apiMethod', obj.configurations?.method);
        setValue('apiName', obj.name);
        setValue('apiUrl', obj.configurations?.url);
        setValue('isReadOnly', obj?.isReadOnly);
        setValue('description', obj.description ?? '');
        setValue('payloadFormat', obj.configurations?.payload);
        setValue('authorization.authType', obj.configurations?.authorization?.authType);
        setValue('concurrencyLimit', obj?.configurations?.concurrencyLimit ?? null);
        if (outputArray.length > 0) {
            setValue('payloads', outputArray);
        }
        if (promotedVariables.length > 0) {
            setValue('promotedVariables', promotedVariables);
        }
        if (defaultApiParameters.length > 0) {
            setValue('defaultApiParameters', defaultApiParameters);
        }
        if (obj?.configurations?.authorization?.meta) {
            setValue('authorization.meta.username', obj?.configurations?.authorization?.meta?.username);
            setValue('authorization.meta.password', obj?.configurations?.authorization?.meta?.password);
            setValue('authorization.meta.token', obj?.configurations?.authorization?.meta?.token);
            setValue('authorization.meta.headerName', obj?.configurations?.authorization?.meta?.headerName);
            setValue('authorization.meta.headerValue', obj?.configurations?.authorization?.meta?.headerValue);
            setValue(
                'authorization.meta.grantType',
                obj?.configurations?.authorization?.meta?.grantType ?? AuthenticationGrantType.Empty
            );
            setValue('authorization.meta.headerPrefix', obj?.configurations?.authorization?.meta?.headerPrefix);
            setValue('authorization.meta.clientId', obj?.configurations?.authorization?.meta?.clientId);
            setValue('authorization.meta.clientSecret', obj?.configurations?.authorization?.meta?.clientSecret);
            setValue('authorization.meta.audience', obj?.configurations?.authorization?.meta?.audience);
            setValue('authorization.meta.scope', obj?.configurations?.authorization?.meta?.scope);
            setValue('authorization.meta.tokenUrl', obj?.configurations?.authorization?.meta?.tokenUrl);
        }
    }
};

const getApiSelectionItems = (
    agent: APISelectorProps['agent'],
    apis: APISelectorProps['apis'],
    isSelfLearning: boolean | undefined,
    allApiTools: APISelectorProps['allApiTools']
): valuesProps[] | undefined => {
    if (!agent && !apis) {
        return undefined;
    }

    let value: valuesProps[] = [];

    if (agent && 'isReusableAgentSelected' in agent && agent?.isReusableAgentSelected) {
        let apiListFromReusableAgent = agent.apis?.map(api => ({
            title: api.name,
            description: `${api.description?.slice(0, 65)}...`,
            imagePath: '/png/api.png',
        }));

        if (isSelfLearning) {
            apiListFromReusableAgent = allApiTools
                ?.filter(x => agent?.selfLearning?.feedbackRequestIntegration?.id == x.id)
                .map(api => ({
                    title: api.name,
                    description: `${api.description?.slice(0, 65)}...`,
                    imagePath: '/png/api.png',
                }));
        }
        value = [...(apiListFromReusableAgent ?? [])];
    } else if (apis) {
        const selectedAPIs = apis?.map(api => ({
            title: api.name,
            description: `${api.description?.slice(0, 65)}...`,
            imagePath: '/png/api.png',
        }));
        value = [...selectedAPIs];
    }

    return value.length > 0 ? value : undefined;
};

const getTestApiConfig = (watch: UseFormWatch<IApiConfigForm>) => ({
    name: watch('apiName'),
    url: watch('apiUrl'),
    method: watch('apiMethod'),
    pathParams: [],
    queryParams: ['GET', 'DELETE'].includes(watch('apiMethod'))
        ? watch('payloads').map((p: { name: string; value: string; dataType: string }) => ({ ...p, value: '' }))
        : [],
    bodyParams: ['PUT', 'POST', 'PATCH'].includes(watch('apiMethod'))
        ? watch('payloads').map((p: { name: string; value: string; dataType: string }) => ({ ...p, value: '' }))
        : [],
    headers: watch('apiHeaders') || [],
    auth: watch('authorization'),
});

const useApiSearchReset = (isOpen: boolean, openModal: boolean, setSearchTerm: (term: string) => void) => {
    useEffect(() => {
        if (!isOpen || !openModal) {
            setSearchTerm('');
        }
    }, [isOpen, openModal, setSearchTerm]);
};

export const APISelector: React.FC<APISelectorProps> = ({
    apis,
    isReadonly,
    apiLoading,
    setApis,
    agent,
    allApiTools,

    onModalChange,
    onApiChange,
    label,
    labelClassName,
    isMultiple = true,
    description,
    isSelfLearning,
    showListOnly = false,
    setInputDataConnectModalOpen,
}) => {
    // --- Hooks & Logic ---
    const {
        isOpen, // This is actually "isFormOpen" (Create/Edit API Form)
        isValid,
        errors,
        secrets,
        isSaving,
        apiHeaders,
        payloads,
        defaultApiParameters,
        control,
        loadingSecrets,
        isEdit,
        setEdit,
        setOpen, // Sets isOpen (Form Open)
        register,
        watch,
        setValue,
        remove,
        append,
        handleSubmit,
        onHandleSubmit,
        updatePayloadDataType,
        updateDefaultApiParametersData,
        refetch,
        promotedVariables,
        updatePromotedVariablesDataType,
    } = useApiConfiguration();

    // --- Hooks & Logic ---
    const {
        allSearchableApiTools,
        checkedItemId,
        handleItemCheck,
        handleApplyChanges,
        handleRemoveAll,
        hasAnyChanges,
        selectedApis,
        onModalClose,
        setSearchTerm,
        searchTerm,
        openModal,
        setOpenModal,
        setIsReordered,
    } = useApiSelection({
        apis,
        allApiTools,
        isMultiple,
        setApis,
        onApiChange,
        onModalChange,
        showListOnly,
        setInputDataConnectModalOpen,
        isOpen, // Form open state from useApiConfiguration
        setIsOpen: setOpen, // Setter for form open state
    });

    const [isTestOpen, setIsTestOpen] = useState(false);

    // --- Effects & Handlers ---

    // Reset search when switching modes (handled in hook mostly, but form open needs check)
    useApiSearchReset(isOpen, openModal, setSearchTerm);

    const onEdit = (id: string) => {
        populateApiConfigurationForm(id, allApiTools, setValue);
        setEdit(true);
        setOpen(true);
    };

    const getModelFromReusableAgent = (): valuesProps[] | undefined => {
        return getApiSelectionItems(agent, apis, isSelfLearning, allApiTools);
    };

    const handleChange = () => {
        setOpenModal(true);
        if (!agent?.isReusableAgentSelected && apis) {
            // const selectedIds = apis.map(api => api.id);
            // Re-sync logic is in logic hook but triggering a manual sync for dialog open
            setIsReordered(false); // Force reorder calc
        }
    };

    // Test API Logic
    const apiNameForTest = watch('apiName') || '';
    const apiUrlForTest = watch('apiUrl') || '';
    const apiMethodForTest = watch('apiMethod') || '';
    const hasApiNameForTest = useMemo(() => apiNameForTest.trim().length > 0, [apiNameForTest]);
    const canTestApi = useMemo(
        () => hasApiNameForTest && apiUrlForTest.trim().length > 0 && apiMethodForTest.trim().length > 0,
        [hasApiNameForTest, apiUrlForTest, apiMethodForTest]
    );

    const openModalCloseWrapper = (open: boolean) => {
        onModalClose(open, false);
    };

    const formProps = {
        isValid,
        errors,
        secrets,
        isSaving,
        hasTestConnection: false,
        apiHeaders,
        payloads,
        control,
        loadingSecrets,
        defaultApiParameters,
        register,
        watch,
        setValue,
        remove,
        append,
        handleSubmit,
        onHandleSubmit, // Note: original passes onHandleSubmit as prop but also submits in footer
        updatePayloadDataType,
        refetch,
        promotedVariables,
        updatePromotedVariablesDataType,
        updateDefaultApiParametersData,
    };

    // --- Render ---

    if (showListOnly) {
        return (
            <div className="px-1 flex flex-col gap-y-4 w-full h-full">
                {isOpen ? (
                    // FORM VIEW (Create/Edit)
                    <div className="item-list-container overflow-y-auto flex flex-col gap-y-2 h-[600px] border dark:border-gray-600 px-3 py-3 rounded-lg [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 pr-1">
                        <ApiConfigurationFormBody isOpen={isOpen} isEdit={isEdit} setOpen={setOpen} {...formProps} />
                    </div>
                ) : (
                    // LIST VIEW
                    <ApiList
                        currentApis={allSearchableApiTools}
                        checkedItemIds={checkedItemId}
                        isLoading={apiLoading}
                        isReadonly={isReadonly}
                        onEdit={onEdit}
                        onItemCheck={handleItemCheck}
                        onSearchChange={e => setSearchTerm(e.target.value)}
                        searchTerm={searchTerm}
                        onAddNewClicked={() => setOpen(true)}
                        selectedApis={selectedApis}
                        showSelectedSection={true}
                        showAddNewButton={!isOpen} // Show key "New API" button if form is closed
                    />
                )}

                <div className="h-fit flex justify-end gap-x-2 mr-4">
                    <ApiSelectorFooter
                        isOpen={isOpen}
                        canTestApi={canTestApi}
                        isValid={isValid}
                        isSaving={isSaving}
                        isEdit={isEdit}
                        onHandleSubmit={() => {
                            handleSubmit(onHandleSubmit)();
                        }}
                        onTestClick={() => setIsTestOpen(true)}
                        onAddClick={handleApplyChanges}
                        onModalClose={(o, c) => onModalClose(o, c)}
                        hasAnyChanges={hasAnyChanges}
                    />
                </div>
                <TestApiModal
                    open={isTestOpen}
                    loadingSecrets={loadingSecrets}
                    secrets={secrets}
                    onOpenChange={setIsTestOpen}
                    apiConfig={getTestApiConfig(watch)}
                    onVaultRefetch={refetch}
                />
            </div>
        );
    }

    return (
        <>
            <DetailItemInput
                label={label ?? 'API'}
                labelClassName={labelClassName}
                values={getModelFromReusableAgent()}
                imagePath="/png/api_empty.png"
                imageType="png"
                description={description ?? 'Select the APIs for efficient agent performance and task handling'}
                footer={
                    apis?.length && !agent?.isReusableAgentSelected ? (
                        <div className=" w-full flex justify-start items-center gap-x-3">
                            <Button variant="link" className="text-blue-400" onClick={handleChange}>
                                Change
                            </Button>
                            <Button
                                variant="link"
                                className="text-red-500 hover:text-red-400"
                                onClick={handleRemoveAll}
                            >
                                {isMultiple ? 'Remove all' : 'Remove'}
                            </Button>
                        </div>
                    ) : (
                        <>
                            {(!apis || apis.length === 0) && !agent?.isReusableAgentSelected && !isReadonly && (
                                <Button variant="link" onClick={() => setOpenModal(true)}>
                                    {isMultiple ? 'Add APIs' : 'Add API'}
                                </Button>
                            )}
                        </>
                    )
                }
            />

            <ApiDialog
                open={openModal}
                onOpenChange={openModalCloseWrapper}
                isEdit={isEdit}
                isFormOpen={isOpen}
                setOpenForm={setOpen}
                formProps={formProps}
                apiListProps={{
                    currentApis: allSearchableApiTools,
                    checkedItemIds: checkedItemId,
                    isLoading: apiLoading,
                    isReadonly: isReadonly,
                    onEdit: onEdit,
                    onItemCheck: handleItemCheck,
                    onSearchChange: e => setSearchTerm(e.target.value),
                    searchTerm: searchTerm,
                    selectedApis: [], // Not used in dialog
                    showSelectedSection: false,
                }}
                footerProps={{
                    isOpen: isOpen,
                    canTestApi: canTestApi,
                    isValid: isValid,
                    isSaving: isSaving,
                    isEdit: isEdit,
                    onHandleSubmit: () => {
                        handleSubmit(onHandleSubmit)();
                    },
                    onTestClick: () => setIsTestOpen(true),
                    onAddClick: handleApplyChanges,
                    onModalClose: (o, c) => onModalClose(o, c),
                    hasAnyChanges: hasAnyChanges,
                }}
            />
            <TestApiModal
                open={isTestOpen}
                loadingSecrets={loadingSecrets}
                secrets={secrets}
                onOpenChange={setIsTestOpen}
                apiConfig={getTestApiConfig(watch)}
                onVaultRefetch={refetch}
            />
        </>
    );
};

APISelector.displayName = 'APISelector';
