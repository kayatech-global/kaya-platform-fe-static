'use client';

import { Button } from '@/components';
import { FormBody as ConnectorConfigForm } from '@/app/workspace/[wid]/configure-connections/connectors/components/connector-config-form';
import { DetailItemInput, valuesProps } from '@/components/molecules/detail-item-input/detail-item-input';
import { AgentType } from '@/components/organisms';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import { connectorLogo, useConnector } from '@/hooks/use-connector';
import { ConnectorType, IConnectorForm } from '@/models';
import { useEffect, useRef } from 'react';
import { useConnectorSelection } from './connector-selector/use-connector-selection';
import { ConnectorList } from './connector-selector/connector-list';
import { ConnectorDialog } from './connector-selector/connector-dialog';
import { ConnectorSelectorFooter } from './connector-selector/connector-selector-footer';

export type ConnectorSelectorProps = {
    agent: AgentType | VoiceAgent | undefined;
    connectors: IConnectorForm[];
    isReadonly?: boolean;
    connectorLoading?: boolean;
    setConnectors: React.Dispatch<React.SetStateAction<IConnectorForm[] | undefined>>;
    allConnectors: IConnectorForm[];
    onRefetch: () => void;
    onConnectorsChange?: (connectors: IConnectorForm[] | undefined) => void;
    label?: string;
    labelClassName?: string;
    isMultiple?: boolean;
    description?: string;
    isSelfLearning?: boolean;
    showListOnly?: boolean;
    setInputDataConnectModalOpen?: (open: boolean) => void;
    onModalChange?: (open: boolean) => void;
};

export const ConnectorSelector = (props: ConnectorSelectorProps) => {
    const {
        allConnectors,
        onRefetch,
        connectors,
        isMultiple,
        setConnectors,
        onConnectorsChange,
        isSelfLearning,
        agent,
        connectorLoading,
        isReadonly,
        label,
        labelClassName,
        description,
        showListOnly = false,
        setInputDataConnectModalOpen,
        onModalChange,
    } = props;

    const isMounted = useRef(true);

    const {
        isOpen, // Form Open state
        setIsOpen,
        isEdit,
        setEdit,
        secrets,
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        errors,
        isValid,
        refetch,
        loadingSecrets,
        onHandleSubmit,
        isSaving,
        allIntellisenseValues,
        loadingDatabases,
        loadingIntellisense,
        refetchVariables,
        editorContent,
        intelligentSource,
        handleEditorChange,
        intellisenseOptions,
        trigger,
        databases,
        refetchDatabase,
    } = useConnector({ triggerQuery: false, onRefetch });

    const {
        searchTerm,
        setSearchTerm,
        allSearchableConnectors,
        checkedItemId,
        handleItemCheck,
        openModal, // Dialog Open state
        setOpenModal,
        handleApplyChanges,
        handleRemoveAll,
        hasAnyChanges,
        selectedConnectors,
        onModalClose,
        setIsReordered,
        setAllSearchableConnectors,
    } = useConnectorSelection({
        connectors,
        allConnectors,
        isMultiple,
        setConnectors,
        onConnectorsChange,
        onModalChange,
        showListOnly,
        setInputDataConnectModalOpen,
        isOpen,
        setIsOpen,
    });

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Reset search when form/modal definition changes (synced in hook mostly)
    useEffect(() => {
        if (!isOpen || !openModal) {
            setSearchTerm('');
        }
    }, [isOpen, openModal, setSearchTerm]);

    const onHandleEdit = (id: string) => {
        const obj = allConnectors.find(connector => connector.id === id);
        if (obj) {
            setValue('id', obj?.id);
            setValue('name', obj?.name);
            setValue('description', obj?.description);
            setValue('type', obj?.type);
            setValue('isReadOnly', obj?.isReadOnly);
            // Casting to any as configurations structure might differ in form vs model or needs strict mapping
            // In original code: setValue('configurations', obj?.configurations);
            setValue('configurations', obj?.configurations);
        }
        setEdit(true);
        setIsOpen(true);
    };

    const getModelFromReusableAgent = () => {
        if (!agent && !connectors) {
            return undefined;
        }

        let value: valuesProps[] = [];

        if (agent && 'isReusableAgentSelected' in agent && agent?.isReusableAgentSelected) {
            let apiListFromReusableAgent = agent.connectors?.map(connector => {
                return {
                    title: connector.name,
                    description: `${connector.description?.slice(0, 65)}...`,
                    imagePath: connectorLogo?.[connector?.type as ConnectorType.Pega] ?? '/png/api.png',
                };
            });

            if (isSelfLearning) {
                apiListFromReusableAgent = allConnectors
                    ?.filter(connector =>
                        [agent?.selfLearning?.feedbackRequestIntegration?.id].includes(connector.id as string)
                    )
                    .map(connector => {
                        return {
                            title: connector.name,
                            description: `${connector.description?.slice(0, 65)}...`,
                            imagePath: connectorLogo?.[connector?.type as ConnectorType.Pega] ?? '/png/api.png',
                        };
                    });
            }
            value = [...(apiListFromReusableAgent ?? [])];
        } else if (connectors) {
            const selectedConnectors = connectors.map(connector => {
                return {
                    title: connector.name,
                    description: `${connector.description?.slice(0, 65)}...`,
                    imagePath: connectorLogo?.[connector?.type as ConnectorType.Pega] ?? '/png/api.png',
                };
            });

            value = [...selectedConnectors];
        }

        return value.length > 0 ? value : undefined;
    };

    const handleChange = () => {
        setOpenModal(true);

        if (!agent?.isReusableAgentSelected && connectors) {
            // Trigger reorder logic manually if needed, logic is in hook but might need nudge if just opening
            const selectedConnectorsIds = new Set(
                connectors.map(connector => connector.id).filter((id): id is string => !!id)
            );
            // Reorder: selected on top
            const selected = allConnectors.filter(x => selectedConnectorsIds.has(x.id as string));
            const unselected = allConnectors.filter(x => !selectedConnectorsIds.has(x.id as string));
            setAllSearchableConnectors([...selected, ...unselected]);
            setIsReordered(true);
        }
    };

    const formProps = {
        isValid,
        errors,
        secrets,
        isSaving,
        loadingSecrets,
        register,
        watch,
        setValue,
        control,
        handleSubmit,
        onHandleSubmit,
        refetch,
        allIntellisenseValues,
        loadingIntellisense,
        onRefetchVariables: async () => {
            await refetchVariables();
        },
        editorContent,
        intelligentSource,
        handleEditorChange,
        intellisenseOptions,
        trigger,
        databases,
        databaseLoading: loadingDatabases,
        refetchDatabase,
    };

    if (showListOnly) {
        return (
            <div className="px-1 flex flex-col gap-y-4 w-full h-full">
                {isOpen ? (
                    <div className="item-list-container overflow-y-auto flex flex-col gap-y-2 h-[600px] border dark:border-gray-600 px-3 py-3 rounded-lg [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 pr-1">
                        <ConnectorConfigForm isOpen={isOpen} isEdit={isEdit} setOpen={setIsOpen} {...formProps} />
                    </div>
                ) : (
                    <ConnectorList
                        isLoading={connectorLoading}
                        searchTerm={searchTerm}
                        onSearchChange={e => setSearchTerm(e.target.value)}
                        currentConnectors={allSearchableConnectors}
                        checkedItemIds={checkedItemId}
                        onItemCheck={handleItemCheck}
                        onEdit={onHandleEdit}
                        selectedConnectors={selectedConnectors}
                        showSelectedSection={true}
                        onAddNewClicked={() => setIsOpen(true)}
                        isReadonly={isReadonly}
                        showAddNewButton={!isOpen}
                    />
                )}
                <ConnectorSelectorFooter
                    isOpen={isOpen}
                    isValid={isValid}
                    isSaving={isSaving}
                    isEdit={isEdit}
                    onHandleSubmit={handleSubmit(onHandleSubmit)}
                    onAddClick={handleApplyChanges}
                    onModalClose={onModalClose}
                    hasAnyChanges={hasAnyChanges}
                />
            </div>
        );
    }

    return (
        <>
            <DetailItemInput
                label={label ?? 'Connector'}
                labelClassName={labelClassName}
                values={getModelFromReusableAgent()}
                imagePath="/png/api_empty.png"
                imageType="png"
                description={description ?? 'Select the Connectors for efficient agent performance and task handling'}
                footer={
                    connectors?.length && !agent?.isReusableAgentSelected && !isReadonly ? (
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
                            {!connectors?.length && !agent && !isReadonly && (
                                <Button variant="link" onClick={() => setOpenModal(true)}>
                                    {isMultiple ? 'Add Connectors' : 'Add Connector'}
                                </Button>
                            )}
                        </>
                    )
                }
            />
            <ConnectorDialog
                open={openModal}
                onOpenChange={o => onModalClose(o, false)}
                isEdit={isEdit}
                setOpenForm={setIsOpen}
                isFormOpen={isOpen}
                formProps={formProps}
                connectorListProps={{
                    isLoading: connectorLoading,
                    searchTerm: searchTerm,
                    onSearchChange: e => setSearchTerm(e.target.value),
                    currentConnectors: allSearchableConnectors,
                    checkedItemIds: checkedItemId,
                    onItemCheck: handleItemCheck,
                    onEdit: onHandleEdit,
                    selectedConnectors: [], // Dialog logic in list component mostly ignores this if showSelectedSection is false, or we pass []
                    showSelectedSection: false,
                    showAddNewButton: true, // Always show "New Connector" button in dialog list view
                    isReadonly: isReadonly,
                    onAddNewClicked: () => setIsOpen(true),
                }}
                footerProps={{
                    isOpen: isOpen,
                    isValid: isValid,
                    isSaving: isSaving,
                    isEdit: isEdit,
                    onHandleSubmit: () => {
                        handleSubmit(onHandleSubmit)();
                    },
                    onAddClick: handleApplyChanges,
                    onModalClose: onModalClose,
                    hasAnyChanges: hasAnyChanges,
                }}
            />
        </>
    );
};
