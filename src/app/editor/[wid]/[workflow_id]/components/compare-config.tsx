'use client';

import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/atoms/accordion';
import { Button, MultiSelect, Spinner } from '@/components/atoms';
import { Badge } from '@/components/atoms/badge';
import { ComparisonGrid } from './comparison-grid';
import { ConfigDialog } from './config-dialog';
import { DeployConfigDialog } from './deploy-config-dialog';
import { ComparisonItem, ComparisonStatus } from '@/enums/config-type';
import { useComparisonSections } from '@/hooks/use-comparison-sections';
import { Repeat2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IComparisonSection, IComparisonSectionData } from '@/models';

export interface CompareConfigProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    workFlowId?: string;
    heading?: string;
    sourcePackageName?: string;
    targetPackageName?: string;
    sourceVersion?: string;
    targetVersion?: string;
    isPull?: boolean;
    isEditor?: boolean;
    isCurrentVersion?: boolean;
    parentCurrentVersion?: boolean;
}

export const CompareConfig: React.FC<CompareConfigProps> = props => {
    const { isMobile } = useBreakpoint();
    const {
        open,
        heading,
        sourcePackageName,
        targetPackageName,
        sourceVersion,
        targetVersion,
        isPull = false,
        isEditor,
        isCurrentVersion,
        parentCurrentVersion,
        setOpen,
    } = props;

    const {
        sections,
        releases,
        selectedVersion,
        isFetching,
        isValidated,
        remainingConfigs,
        isVerified,
        allConfigurationsUpdated,
        openAccordion,
        openNewModal,
        openNewDeployModal,
        sectionDataTitle,
        plannedVersion,
        setOpenAccordion,
        setSelectedVersion,
        setSectionDataTitle,
        setOpenNewModal,
        setOpenNewDeployModal,
        handleVerify,
        handleValidate,
        handleSaveConfig,
        onConfiguration,
    } = useComparisonSections(props);

    return (
        <>
            <AppDrawer
                open={open}
                setOpen={setOpen}
                direction={isMobile ? 'bottom' : 'right'}
                isPlainContentSheet={false}
                className="w-1/2"
                headerIcon={<Repeat2 />}
                header={heading}
                {...(isFetching && {
                    bodyClassName: 'h-full',
                })}
                hideClose={true}
                footer={
                    <div className="flex justify-end items-center">
                        {remainingConfigs > 0 && !isVerified && !isValidated && (
                            <Badge variant="destructive" className="mr-2">
                                {remainingConfigs} configuration{remainingConfigs === 1 ? '' : 's'} remaining
                            </Badge>
                        )}
                        {!isVerified && !isValidated && (
                            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                                {isPull ? 'Cancel' : 'Close'}
                            </Button>
                        )}
                        {isVerified && !isValidated && !isPull && (
                            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                                Back
                            </Button>
                        )}
                        {!isVerified && !isValidated && isPull && (
                            <Button
                                variant="primary"
                                size="sm"
                                className="ms-2"
                                disabled={!allConfigurationsUpdated}
                                onClick={handleVerify}
                            >
                                Verify
                            </Button>
                        )}
                        {isVerified && !isValidated && (
                            <>
                                <Button variant="ghost" size="sm" className="ms-2" onClick={onConfiguration}>
                                    Go to Configurations
                                </Button>
                                <Button variant="primary" size="sm" className="ms-2" onClick={handleValidate}>
                                    Validate
                                </Button>
                            </>
                        )}
                        {isValidated && (
                            <>
                                <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="ms-2"
                                    disabled={sections.some((section: IComparisonSection) =>
                                        section.comparison?.sectionData.some((sec: IComparisonSectionData) =>
                                            sec.items.some(
                                                (item: ComparisonItem) => item.status === ComparisonStatus.FAILED
                                            )
                                        )
                                    )}
                                    onClick={() => setOpenNewDeployModal(true)}
                                >
                                    Deploy
                                </Button>
                            </>
                        )}
                    </div>
                }
                content={
                    <div className={cn('p-4 space-y-6', { 'h-full': isFetching })}>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <i className="ri-stack-line text-md text-dark" /> {sourcePackageName ?? 'N/A'}| Version
                            <Badge variant="default">{isEditor ? 'Current' : `v${sourceVersion}`}</Badge>
                            <i className="ri-repeat-line text-xs text-dark dark:text-white" />
                            {isEditor ? (
                                <MultiSelect
                                    options={releases}
                                    value={selectedVersion}
                                    className="!w-[100px]"
                                    menuPortalTarget={document.body}
                                    isSearchable
                                    placeholder="Search workflows"
                                    isDisabled={isFetching}
                                    onChange={selectedOptions => {
                                        setSelectedVersion(selectedOptions as never);
                                    }}
                                    menuClass="!z-50"
                                    menuPortalClass="!z-50 pointer-events-auto"
                                />
                            ) : (
                                <Badge variant="default">v{targetVersion}</Badge>
                            )}
                        </div>

                        {isFetching ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-4 h-[calc(100%-36px)]">
                                <Spinner />
                                <p className="text-sm text-muted-foreground">Loading comparison data...</p>
                            </div>
                        ) : (
                            <Accordion
                                type="single"
                                collapsible
                                value={openAccordion}
                                onValueChange={val => setOpenAccordion(val)}
                                className="w-full space-y-2"
                            >
                                {sections.map((section: IComparisonSection) => (
                                    <AccordionItem
                                        key={section.id}
                                        value={section.id}
                                        className="border px-2 py-1 bg-gray-50 rounded-md w-full dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <AccordionTrigger
                                            className="hover:no-underline px-0 py-1 text-gray-600 dark:text-white truncate flex items-center gap-x-2"
                                            onClick={() =>
                                                setOpenAccordion(openAccordion === section.id ? '' : section.id)
                                            }
                                        >
                                            <p className="w-full truncate overflow-hidden text-left">{section.label}</p>
                                            <div className="flex gap-2 ml-auto">
                                                {section.differences > 0 && (
                                                    <Badge className="bg-amber-100 text-yellow-800 dark:text-gray-700">
                                                        {section.differences} Different
                                                    </Badge>
                                                )}
                                                {section.missing > 0 && (
                                                    <Badge className="bg-red-100 text-red-800">
                                                        {section.missing} Missing
                                                    </Badge>
                                                )}
                                            </div>
                                        </AccordionTrigger>
                                        {openAccordion === section.id && (
                                            <AccordionContent className="relative text-white px-4 rounded-md mt-2 pb-2">
                                                <div>
                                                    {section.comparison ? (
                                                        <ComparisonGrid
                                                            currentVersion={section.comparison.currentVersion}
                                                            previousVersion={section.comparison.previousVersion}
                                                            sectionData={section.comparison.sectionData}
                                                            setSectionDataTitle={setSectionDataTitle}
                                                            setOpenNewModal={setOpenNewModal}
                                                            sourceVersion={sourceVersion}
                                                            targetVersion={plannedVersion}
                                                            isEditor={isEditor}
                                                            isCurrentVersion={isCurrentVersion}
                                                            isPull={isPull}
                                                            parentCurrentVersion={parentCurrentVersion}
                                                        />
                                                    ) : (
                                                        <div className="text-sm text-blue-500 whitespace-pre-wrap">
                                                            No differences
                                                        </div>
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        )}
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </div>
                }
            />
            <ConfigDialog
                open={openNewModal}
                onOpenChange={setOpenNewModal}
                setOpenNewModal={setOpenNewModal}
                accordian_header={sectionDataTitle}
                onSave={(configType, newValue) => configType && handleSaveConfig(configType, newValue)}
            />

            <DeployConfigDialog
                open={openNewDeployModal}
                onOpenChange={setOpenNewDeployModal}
                setOpenNewModal={setOpenNewDeployModal}
                sourcePackageName={sourcePackageName}
                targetPackageName={targetPackageName}
                sourceVersion={sourceVersion}
                targetVersion={targetVersion}
                sections={sections}
                onSave={(configType, newValue) => configType && handleSaveConfig(configType, newValue)}
            />
        </>
    );
};
