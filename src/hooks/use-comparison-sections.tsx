import { useEffect, useMemo, useState } from 'react';
import { ComparisonItem, ComparisonStatus, Configuration } from '@/enums/config-type';
import { $fetch, FetchError, logger } from '@/utils';
import { useMutation, useQuery } from 'react-query';
import { useParams } from 'next/navigation';
import {
    IComparisonPackageDetailsResponse,
    IComparisonSection,
    IComparisonSectionData,
    IComparisonValidateResponse,
    IOption,
    IPaginatedWorkflowRelease,
} from '@/models';
import { toast } from 'sonner';
import { useAuth } from '@/context';
import { isNullOrEmpty } from '@/lib/utils';

interface ComparisonSectionHookProps {
    open?: boolean;
    workFlowId?: string;
    heading?: string;
    sourcePackageName?: string;
    targetPackageName?: string;
    sourceVersion?: string;
    targetVersion?: string;
    isPull?: boolean;
    isEditor?: boolean;
}

const fetchComparisonSections = async (
    workspaceId: string,
    sourcePackageName: string,
    sourceVersion: string,
    targetPackageName: string,
    targetVersion: string,
    comparisonType: string
) => {
    const response = await $fetch<IComparisonSection[]>('/release/packages/compare', {
        method: 'POST',
        body: JSON.stringify({
            sourcePackageName,
            sourceVersion,
            targetPackageName,
            targetVersion,
            comparisonType,
        }),
        headers: {
            'x-workspace-id': workspaceId,
        },
    });

    return response.data;
};

const validateConfigurations = async (
    workspaceId: string,
    payload: {
        sourcePackageName: string;
        sourceVersion: string;
        targetPackageName: string;
        targetVersion: string;
        configurations: Configuration;
    }
) => {
    // Check if configurations object is empty
    if (!payload.configurations || Object.keys(payload.configurations).length === 0) {
        return 'no configurations to validate';
    }

    const response = await $fetch<IComparisonValidateResponse>('/release/packages/validate', {
        method: 'POST',
        body: JSON.stringify({
            sourcePackageName: payload.sourcePackageName,
            sourceVersion: payload.sourceVersion,
            targetPackageName: payload.targetPackageName,
            targetVersion: payload.targetVersion,
            configurations: payload.configurations,
        }),
        headers: {
            'x-workspace-id': workspaceId,
        },
    });

    return response.data;
};

const fetchPackageDetails = async (workspaceId: string, packageName: string, version: string) => {
    const response = await $fetch<IComparisonPackageDetailsResponse>(`/release/packages/${packageName}/${version}`, {
        method: 'GET',
        headers: {
            'x-workspace-id': workspaceId,
        },
    });

    return response.data;
};

const fetchRelease = async (workspaceId: string) => {
    const response = await $fetch<IPaginatedWorkflowRelease>('/release/packages', {
        headers: {
            'x-workspace-id': workspaceId,
        },
    });

    return response.data;
};

const fetchComparisonByVersion = async (workspaceId: string, workFlowId: string, targetVersion: string) => {
    const response = await $fetch<IComparisonSection[]>(
        `/release/packages/compare/${workFlowId}/${decodeURIComponent(targetVersion)}`,
        {
            headers: {
                'x-workspace-id': workspaceId,
            },
        }
    );

    return response.data;
};

const isSectionConfigured = (section: IComparisonSection): boolean => {
    if (!section.comparison) return true;
    return section.comparison.sectionData.every((dataSection: IComparisonSectionData) =>
        dataSection.items.every((item: ComparisonItem) => item.status !== ComparisonStatus.CONFIGURE)
    );
};

const countConfigureStatusInSection = (section: IComparisonSection): number => {
    if (!section.comparison) return 0;
    return section.comparison.sectionData.reduce(
        (acc, dataSection) =>
            acc + dataSection.items.filter(item => item.status === ComparisonStatus.CONFIGURE).length,
        0
    );
};

type AddConfigurationEntry = (globalId: string, field: string, value: string | number | null) => void;

const updateConfigItem = (
    item: ComparisonItem,
    newValue: string | undefined,
    addConfigurationEntry: AddConfigurationEntry
): ComparisonItem => {
    if (item.status !== ComparisonStatus.CONFIGURE) return item;
    if (newValue && item.globalId && item.field) {
        addConfigurationEntry(item.globalId, item.field, newValue);
        return { ...item, status: ComparisonStatus.UPDATED, current: newValue };
    }
    return { ...item, status: ComparisonStatus.UPDATED };
};

const mapSectionDataForConfig = (
    sectionData: IComparisonSectionData[],
    configType: string,
    newValue: string | undefined,
    addConfigurationEntry: AddConfigurationEntry
): IComparisonSectionData[] =>
    sectionData.map(sec =>
        sec.title === configType
            ? {
                  ...sec,
                  items: sec.items.map(item => updateConfigItem(item, newValue, addConfigurationEntry)),
              }
            : sec
    );

const mapSectionDataToVerified = (sectionData: IComparisonSectionData[]): IComparisonSectionData[] =>
    sectionData.map(sec => ({
        ...sec,
        items: sec.items.map(item =>
            item.status === ComparisonStatus.UPDATED ? { ...item, status: ComparisonStatus.VERIFIED } : item
        ),
    }));

export const useComparisonSections = (props: ComparisonSectionHookProps) => {
    const params = useParams();
    const { token } = useAuth();
    const { open, targetVersion, sourceVersion, sourcePackageName, targetPackageName, isPull, isEditor, workFlowId } =
        props;
    const [sections, setSections] = useState<IComparisonSection[]>([]);
    const [updatedSections, setUpdatedSections] = useState<IComparisonSection[]>([]);
    const [isValidated, setIsValidated] = useState<boolean>(false);
    const [configurations, setConfigurations] = useState<Configuration>({});
    const [selectedVersion, setSelectedVersion] = useState<IOption | undefined>();
    const [openAccordion, setOpenAccordion] = useState<string | undefined>();
    const [openNewModal, setOpenNewModal] = useState<boolean>(false);
    const [openNewDeployModal, setOpenNewDeployModal] = useState<boolean>(false);
    const [sectionDataTitle, setSectionDataTitle] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState<boolean>(false);

    useEffect(() => {
        if (!open) {
            setSections([]);
            setUpdatedSections([]);
            setConfigurations({});
            setSelectedVersion(undefined);
            setOpenAccordion(undefined);
            setOpenNewModal(false);
            setOpenNewDeployModal(false);
            setSectionDataTitle(null);
            setIsVerified(false);
            setIsValidated(false);
        }
    }, [open]);

    useEffect(() => {
        if (open && isNullOrEmpty(openAccordion) && sections?.length > 0) {
            setOpenAccordion(sections[0].id);
        }
    }, [open, sections]);

    useEffect(() => {
        if (targetVersion && open) {
            setSelectedVersion({ label: `v${targetVersion}`, value: targetVersion });
        } else {
            setSelectedVersion(undefined);
        }
    }, [targetVersion, open]);

    const allConfigurationsUpdated = useMemo(() => {
        if (!sections) return false;
        return sections.every(isSectionConfigured);
    }, [sections]);

    const remainingConfigs = useMemo(
        () => sections.reduce((count, section) => count + countConfigureStatusInSection(section), 0),
        [sections]
    );

    const plannedVersion = useMemo(() => {
        if (isEditor) {
            return selectedVersion?.value ?? targetVersion;
        }
        return targetVersion;
    }, [isEditor, targetVersion, selectedVersion]);

    const addConfigurationEntry = (globalId: string, field: string, value: string | number | null) => {
        setConfigurations(prev => {
            const newConfig = {
                ...prev,
                [globalId]: {
                    ...prev[globalId],
                    [field]: value,
                },
            };
            return newConfig;
        });
    };

    const {
        isFetching: fetchingReleases,
        data: releases,
        refetch: refetchRelease,
    } = useQuery('releases', () => fetchRelease(params.wid as string), {
        enabled: !!token && !!open && !!isEditor,
        refetchOnWindowFocus: false,
        select: data => {
            console.log(data);
        },
        onError: error => {
            console.error('Failed to fetch releases:', error);
        },
    });

    const { isFetching, refetch } = useQuery(
        'comparisonSections',
        () =>
            fetchComparisonSections(
                params.wid as string,
                sourcePackageName as string,
                sourceVersion as string,
                targetPackageName as string,
                targetVersion as string,
                isPull ? 'pull' : 'compare'
            ),
        {
            enabled: !!token && !!open && !isEditor,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                setSections(data || []);
            },
        }
    );

    const { isFetching: fetchingComparison, refetch: refetchComparison } = useQuery(
        ['comparison-by-version', params.wid, selectedVersion],
        () => fetchComparisonByVersion(params.wid as string, workFlowId as string, selectedVersion?.value as string),
        {
            enabled: !!token && !!open && !!isEditor && !!selectedVersion,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                setSections(data || []);
            },
        }
    );

    const { mutateAsync: mutateValidation, isLoading: isValidating } = useMutation(
        () =>
            validateConfigurations(params.wid as string, {
                sourcePackageName: sourcePackageName as string,
                sourceVersion: sourceVersion as string,
                targetPackageName: targetPackageName as string,
                targetVersion: targetVersion as string,
                configurations: configurations,
            }),
        {
            onSuccess: result => {
                if (result === 'no configurations to validate') {
                    toast.error('No configurations to validate');
                    setIsValidated(true);
                } else if (result.valid) {
                    setSections(updatedSections);
                    setIsValidated(true);
                } else {
                    setSections(result?.entities || []);
                    setIsValidated(false);
                    const errors = result?.errors?.map((item, index) => <div key={`error-${index}-${String(item)}`}>{item}</div>);
                    toast.error(errors);
                }
            },
            onError: (error: FetchError) => {
                setIsValidated(false);
                toast.error(error?.message);
                logger.error('Error while Validating:', error?.message);
            },
        }
    );

    const { mutate: mutateConfirmDeploy } = useMutation(
        ({ targetPackageName, targetVersion }: { targetPackageName: string; targetVersion: string }) =>
            fetchPackageDetails(params.wid as string, targetPackageName, targetVersion),
        {
            onSuccess: data => {
                console.log('[MAIN] Package details fetched successfully:', data);
                setOpenNewModal(false);
            },
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('[MAIN] Error fetching package details for deployment:', error?.message);
                setOpenNewModal(false);
            },
        }
    );

    const handleConfirmDeploy = (targetPackageName: string, targetVersion: string) => {
        mutateConfirmDeploy({ targetPackageName, targetVersion });
    };

    const handleSaveConfig = (configType: string, newValue?: string) => {
        setSections(prevSections =>
            prevSections.map(section => {
                if (!section.comparison) return section;
                return {
                    ...section,
                    comparison: {
                        ...section.comparison,
                        sectionData: mapSectionDataForConfig(
                            section.comparison.sectionData,
                            configType,
                            newValue,
                            addConfigurationEntry
                        ),
                    },
                };
            })
        );
        setOpenNewModal(false);
    };

    const mapUpdatedSections = (prevSections: IComparisonSection[]) =>
        prevSections.map(section => {
            if (!section.comparison) return section;
            return {
                ...section,
                comparison: {
                    ...section.comparison,
                    sectionData: mapSectionDataToVerified(section.comparison.sectionData),
                },
            };
        });

    const handleVerify = async () => {
        setSections(prev => {
            const result = mapUpdatedSections(prev);
            setUpdatedSections(result);
            return result;
        });
        setIsVerified(true);
    };

    const handleValidate = async () => {
        await mutateValidation();
    };

    const onConfiguration = async () => {
        if (open && !isEditor) {
            if (updatedSections?.length > 0) {
                setSections(updatedSections);
            } else {
                await refetch();
            }
        } else if (open && isEditor && selectedVersion) await refetchComparison();
        setIsVerified(false);
        setIsValidated(false);
    };

    return {
        isFetching: isFetching || fetchingReleases || fetchingComparison,
        sections,
        releases: releases ?? [],
        configurations,
        isValidating,
        selectedVersion,
        isValidated,
        updatedSections,
        remainingConfigs,
        isVerified,
        allConfigurationsUpdated,
        openAccordion,
        openNewModal,
        openNewDeployModal,
        sectionDataTitle,
        plannedVersion,
        setOpenAccordion,
        setSectionDataTitle,
        setOpenNewModal,
        setIsValidated,
        setSections,
        setUpdatedSections,
        setOpenNewDeployModal,
        refetch,
        setSelectedVersion,
        refetchComparison,
        refetchRelease,
        setConfigurations,
        addConfigurationEntry,
        handleVerify,
        handleValidate,
        handleSaveConfig,
        handleConfirmDeploy,
        onConfiguration,
    };
};
