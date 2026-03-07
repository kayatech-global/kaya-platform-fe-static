import { useEffect, useMemo, useState } from 'react';
import { GuardrailSelectorProps } from '@/app/editor/[wid]/[workflow_id]/components/guardrail-selector';
import { IGuardrailGroup, IGuardrailSetup } from '@/models';
import { useGuardrailConfiguration } from '@/hooks/use-guardrail-configuration';
import { GuardrailBindingLevelType } from '@/enums';
import { valuesProps } from '@/components/molecules/detail-item-input/detail-item-input';
import { Badge } from '@/components/atoms/badge';
import { useApp } from '@/context/app-context';
import { isEqual } from 'lodash';

export const useGuardrailSelector = (props: GuardrailSelectorProps) => {
    const {
        agent,
        guardrails,
        allGuardrails,
        isMultiple = true,
        level,
        setGuardrails,
        onRefetch,
        onGuardrailsChange,
        onModalChange,
    } = props;
    const {
        control,
        errors,
        isOpen,
        isValid,
        isSaving,
        isEdit,
        loadingBinding,
        guardrailBindingData,
        sensitiveDataRuleFields,
        customSensitiveDataRuleFields,
        languageModerationFields,
        microsoftPresidioFields,
        allModels,
        guardrailsModels,
        llmModelsLoading,
        guardrailsModelsLoading,
        hasDuplicateError,
        isValidSensitiveDataRule,
        isValidCustomSensitiveDataRule,
        protectionModeErrorMessage,
        setOpen,
        setEdit,
        register,
        watch,
        trigger,
        getValues,
        setValue,
        clearErrors,
        setGuardrailValues,
        getGuardrailBinding,
        appendSensitiveDataRule,
        appendCustomSensitiveDataRule,
        appendLanguageModeration,
        removeSensitiveDataRule,
        removeCustomSensitiveDataRule,
        removeLanguageModeration,
        validateRegex,
        validateProtection,
        handleSubmit,
        onHandleSubmit,
        refetchLLM,
        refetchGuardrailModels,
    } = useGuardrailConfiguration({ triggerQuery: false, onRefetch });
    const { guardrailBinding } = useApp();
    const [checkedItemId, setCheckedItemId] = useState<string[]>();
    const [openModal, setOpenModal] = useState(false);
    const [allSearchableGuardrails, setAllSearchableGuardrails] = useState<IGuardrailSetup[]>(allGuardrails);
    const [searchTerm, setSearchTerm] = useState('');

    const getBadgeVariant = (level: GuardrailBindingLevelType) => {
        if (level === GuardrailBindingLevelType.WORKSPACE) return 'success';
        if (level === GuardrailBindingLevelType.WORKFLOW) return 'info';
        return 'warning';
    };

    const reorderGuardrails = (list: IGuardrailSetup[], selectedIds: string[]) => {
        const selected = list.filter(x => selectedIds.includes(x.id as string));
        const unselected = list.filter(x => !selectedIds.includes(x.id as string));
        const orderedSelected = selectedIds
            .map(id => selected.find(x => x.id === id))
            .filter(Boolean) as IGuardrailSetup[];
        return [...orderedSelected, ...unselected];
    };

    useEffect(() => {
        if (searchTerm) {
            const filteredGuardrails = allGuardrails?.filter(x =>
                x.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setAllSearchableGuardrails(filteredGuardrails);
        } else {
            setAllSearchableGuardrails(prev => {
                if (isEqual(prev, allGuardrails)) return prev;
                return allGuardrails;
            });
        }
    }, [searchTerm, allGuardrails]);

    useEffect(() => {
        if (!isOpen || !openModal) {
            setEdit(false);
            setSearchTerm('');
        }
    }, [isOpen, openModal]);

    useEffect(() => {
        if (openModal && (guardrails || guardrailBindingData)) {
            const guardrailIds = guardrails ?? [];
            if (level === GuardrailBindingLevelType.WORKSPACE) {
                const bindingIds =
                    guardrailBindingData
                        ?.filter(x => x.level === GuardrailBindingLevelType.WORKSPACE)
                        ?.map(x => x.guardrailId) ?? [];
                const combinedIds = Array.from(new Set([...guardrailIds, ...bindingIds]));
                setCheckedItemId(combinedIds);
            } else if (level === GuardrailBindingLevelType.WORKFLOW) {
                const bindingIds =
                    guardrailBindingData
                        ?.filter(x => x.level === GuardrailBindingLevelType.WORKFLOW)
                        ?.map(x => x.guardrailId) ?? [];
                const combinedIds = Array.from(new Set([...guardrailIds, ...bindingIds]));
                setCheckedItemId(combinedIds);
            } else {
                setCheckedItemId(guardrails);
            }
        } else {
            setCheckedItemId(undefined);
        }
    }, [openModal, guardrails, guardrailBindingData, level]);

    useEffect(() => {
        setAllSearchableGuardrails(allGuardrails);
    }, [allGuardrails?.length]);

    useEffect(() => {
        if (onModalChange) {
            onModalChange(openModal);
        }
    }, [openModal]);

    const disabledOptions = useMemo(() => {
        if (guardrailBindingData && guardrailBindingData?.length > 0 && level === GuardrailBindingLevelType.WORKSPACE) {
            return [];
        } else if (
            guardrailBindingData &&
            guardrailBindingData?.length > 0 &&
            level === GuardrailBindingLevelType.WORKFLOW
        ) {
            return guardrailBindingData
                ?.filter(x => x.level === GuardrailBindingLevelType.WORKSPACE)
                ?.map(x => x.guardrailId);
        }
        if (guardrailBindingData && guardrailBindingData?.length > 0 && level === GuardrailBindingLevelType.AGENT) {
            return guardrailBindingData?.map(x => x.guardrailId);
        }
        return [];
    }, [level, guardrailBindingData]);

    const selectedGuardrails = useMemo(() => {
        let results: IGuardrailGroup[] = [];
        const sortPriority: Record<GuardrailBindingLevelType, number> = {
            [GuardrailBindingLevelType.WORKSPACE]: 0,
            [GuardrailBindingLevelType.WORKFLOW]: 1,
            [GuardrailBindingLevelType.AGENT]: 2,
        };

        if (disabledOptions.length > 0) {
            results =
                guardrailBindingData
                    ?.filter(x => disabledOptions.includes(x.guardrailId))
                    ?.map(
                        x =>
                            ({
                                ...(allGuardrails?.find(y => y.id === x.guardrailId) ?? x.guardrail),
                                level: x.level,
                                badge:
                                    x.level === GuardrailBindingLevelType.WORKSPACE
                                        ? 'Workspace Level'
                                        : 'Workflow Level',
                            }) as IGuardrailGroup
                    ) ?? [];
        }

        if (allGuardrails?.length > 0 && level === GuardrailBindingLevelType.WORKFLOW) {
            const arr = allGuardrails
                ?.filter(x => checkedItemId?.includes(x.id as string))
                ?.map(
                    x =>
                        ({
                            ...x,
                            level,
                            badge: 'Workflow Level',
                        }) as IGuardrailGroup
                );
            results = [...results, ...arr];
        }

        if (allGuardrails?.length > 0 && level === GuardrailBindingLevelType.AGENT) {
            const arr = allGuardrails
                ?.filter(x => checkedItemId?.includes(x.id as string))
                ?.map(
                    x =>
                        ({
                            ...x,
                            level,
                            badge: 'Agent Level',
                        }) as IGuardrailGroup
                );
            results = [...results, ...arr];
        }
        return results.sort((a, b) => {
            return sortPriority[a.level] - sortPriority[b.level];
        });
    }, [allGuardrails, level, checkedItemId, disabledOptions, guardrailBindingData]);

    const selectedItems = useMemo(() => {
        if (disabledOptions?.length > 0) {
            return [...disabledOptions, ...(checkedItemId ?? [])];
        }
        return checkedItemId ?? [];
    }, [checkedItemId, disabledOptions]);

    const hasAnyChanges = useMemo(() => {
        if (
            (!guardrailBindingData || guardrailBindingData?.length === 0) &&
            (!checkedItemId || checkedItemId?.length === 0)
        ) {
            return false;
        }

        if (level === GuardrailBindingLevelType.WORKSPACE && guardrailBindingData && guardrailBindingData?.length > 0) {
            const existingIds = guardrailBindingData
                .filter(x => x.level === GuardrailBindingLevelType.WORKSPACE)
                .map(x => x.guardrailId);
            return !isEqual(checkedItemId, existingIds);
        } else if (
            level === GuardrailBindingLevelType.WORKFLOW &&
            guardrailBindingData &&
            guardrailBindingData?.length > 0
        ) {
            const existingIds = guardrailBindingData
                .filter(x => x.level === GuardrailBindingLevelType.WORKFLOW)
                .map(x => x.guardrailId);
            return !isEqual(checkedItemId, existingIds);
        } else if (level === GuardrailBindingLevelType.AGENT && allGuardrails?.length > 0) {
            const existingIds = allGuardrails
                .filter(x => guardrails?.includes(x.id as string))
                .map(x => x.id as string);
            return !isEqual(checkedItemId, existingIds);
        } else {
            return !!(checkedItemId && checkedItemId?.length > 0);
        }
    }, [checkedItemId, guardrailBindingData, level, allGuardrails, guardrails]);

    const guardrailBindingDetails = useMemo(() => {
        return (
            guardrailBinding?.map(x => ({
                title: x.guardrail.name,
                description: `${x.guardrail.description?.slice(0, 65)}...`,
                imagePath: '/png/guardrail-prompt.png',
                info: (
                    <Badge variant={getBadgeVariant(x.level)} className="text-xs px-2 py-0.5">
                        {x.level === GuardrailBindingLevelType.WORKSPACE ? 'Workspace Level' : 'Workflow Level'}
                    </Badge>
                ),
            })) ?? []
        );
    }, [guardrailBinding]);

    const handleItemCheck = (guardrail: IGuardrailSetup) => {
        setCheckedItemId(prevCheckedItemId => {
            let updated: string[] = [];

            if (!isMultiple) {
                updated = prevCheckedItemId?.includes(guardrail.id as string) ? [] : [guardrail.id as string];
            } else if (prevCheckedItemId?.includes(guardrail.id as string)) {
                // unselect → remove from list
                updated = prevCheckedItemId.filter(id => id !== (guardrail.id as string));
            } else {
                // select → add to end
                updated = [...(prevCheckedItemId || []), guardrail.id as string];
            }

            setAllSearchableGuardrails(prev => reorderGuardrails(prev, updated));

            return updated;
        });
    };

    const handleClick = () => {
        const checkedGuardrails = allGuardrails?.filter(x => checkedItemId?.includes(x.id as string));
        const results = checkedGuardrails?.map(x => x.id as string);
        setGuardrails?.(results);
        setOpenModal(false);
        setAllSearchableGuardrails(allGuardrails);
        if (onGuardrailsChange) {
            onGuardrailsChange(results);
        }
    };

    const handleRemove = () => {
        setCheckedItemId(undefined);
        setGuardrails?.(undefined);
        if (onGuardrailsChange) {
            onGuardrailsChange(undefined);
        }
        if (onModalChange) {
            onModalChange(openModal);
        }
    };

    const getGuardrails = () => {
        if (!agent && !guardrails && !guardrailBinding) {
            return undefined; // Return undefined if both agent and guardrails are missing
        }

        let value: valuesProps[] = []; // Initialize as an empty array

        if (
            agent &&
            'isReusableAgentSelected' in agent &&
            agent?.isReusableAgentSelected &&
            allGuardrails?.length > 0
        ) {
            const bindingIds = guardrailBinding?.map(x => x.guardrailId) ?? [];
            const results = agent?.guardrails?.filter(x => !bindingIds.includes(x));
            const _guardrails = allGuardrails?.filter(x => results?.includes(x.id as string));
            const guardrailListFromReusableAgent = _guardrails?.map(x => {
                return {
                    title: x.name,
                    description: `${x.description?.slice(0, 65)}...`,
                    imagePath: '/png/guardrail-prompt.png',
                    info: (
                        <Badge variant="warning" className="text-xs px-2 py-0.5">
                            Agent Level
                        </Badge>
                    ),
                };
            });
            value = [...guardrailBindingDetails, ...(guardrailListFromReusableAgent ?? [])];
        } else if (guardrails && allGuardrails?.length > 0) {
            const results = allGuardrails?.filter(x => guardrails?.includes(x.id as string));
            const output = results?.map(x => {
                return {
                    title: x.name,
                    description: `${x.description?.slice(0, 65)}...`,
                    imagePath: '/png/guardrail-prompt.png',
                    info: (
                        <Badge variant="warning" className="text-xs px-2 py-0.5">
                            Agent Level
                        </Badge>
                    ),
                };
            });

            value = [...guardrailBindingDetails, ...output];
        } else if (level === GuardrailBindingLevelType.AGENT && guardrailBinding && guardrailBinding?.length > 0) {
            value = [...guardrailBindingDetails];
        }

        return value.length > 0 ? value : undefined;
    };

    const handleChange = () => {
        getGuardrailBinding();
        setOpenModal(true);
        if (!agent?.isReusableAgentSelected && guardrails) {
            setCheckedItemId(guardrails);
            setAllSearchableGuardrails(prev => reorderGuardrails(prev, guardrails));
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        setSearchTerm(searchTerm);
    };

    const onModalClose = (open: boolean, cancel?: boolean) => {
        if (isOpen) {
            setOpen(false);
        } else if (cancel) {
            setOpenModal(false);
            setAllSearchableGuardrails(allGuardrails);
        } else {
            setOpenModal(open);
        }
    };

    const onEdit = (id: string) => {
        const obj = allGuardrails?.find(x => x.id === id);
        if (obj) {
            setGuardrailValues(obj);
        }
        setEdit(true);
        setOpen(true);
    };

    return {
        control,
        errors,
        isOpen,
        isValid,
        isSaving,
        isEdit,
        loadingBinding,
        sensitiveDataRuleFields,
        customSensitiveDataRuleFields,
        languageModerationFields,
        microsoftPresidioFields,
        allModels,
        guardrailsModels,
        llmModelsLoading,
        guardrailsModelsLoading,
        hasDuplicateError,
        isValidSensitiveDataRule,
        isValidCustomSensitiveDataRule,
        protectionModeErrorMessage,
        allSearchableGuardrails,
        checkedItemId,
        searchTerm,
        openModal,
        selectedItems,
        disabledOptions,
        selectedGuardrails,
        guardrailBinding,
        hasAnyChanges,
        setOpenModal,
        setOpen,
        register,
        watch,
        trigger,
        getValues,
        setValue,
        clearErrors,
        getGuardrailBinding,
        appendSensitiveDataRule,
        appendCustomSensitiveDataRule,
        appendLanguageModeration,
        removeSensitiveDataRule,
        removeCustomSensitiveDataRule,
        removeLanguageModeration,
        validateRegex,
        validateProtection,
        handleSubmit,
        onHandleSubmit,
        refetchLLM,
        refetchGuardrailModels,
        getGuardrails,
        handleChange,
        handleRemove,
        handleSearch,
        handleItemCheck,
        handleClick,
        onEdit,
        onModalClose,
    };
};
