'use client';

import { useEffect, useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/atoms/accordion';
import { ComparisonStatus } from '@/enums/config-type';
import { IComparisonSection, IComparisonSectionData } from '@/models';
import { ComparisonGrid } from './comparison-grid';
import { FileX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonChangesProps {
    sections: IComparisonSection[];
    filterBy?: ComparisonStatus[];
    isLoadFromModal?: boolean;
    setOpenNewModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const getFilteredSectionData = (
    sectionData: IComparisonSectionData[],
    filterBy: ComparisonStatus[]
): IComparisonSectionData[] => {
    return sectionData
        .map(data => {
            const filteredItems = data.items.filter(item => filterBy.includes(item.status));
            return filteredItems.length > 0 ? { ...data, items: filteredItems } : null;
        })
        .filter(Boolean) as IComparisonSectionData[];
};

const getFilteredSections = (sections: IComparisonSection[], filterBy?: ComparisonStatus[]): IComparisonSection[] => {
    if (!filterBy) return sections;

    return sections
        .map(section => {
            if (!section.comparison) return null;

            const filteredSectionData = getFilteredSectionData(section.comparison.sectionData, filterBy);

            if (filteredSectionData.length === 0) return null;

            return {
                ...section,
                comparison: {
                    ...section.comparison,
                    sectionData: filteredSectionData,
                },
            };
        })
        .filter(Boolean) as IComparisonSection[];
};

export const ComparisonChanges = ({ sections, filterBy, isLoadFromModal, setOpenNewModal }: ComparisonChangesProps) => {
    const [openAccordion, setOpenAccordion] = useState<string | undefined>();

    const filteredSections = useMemo(() => {
        return getFilteredSections(sections, filterBy);
    }, [sections, filterBy]);

    useEffect(() => {
        if (filteredSections?.length > 0) {
            setOpenAccordion(filteredSections[0].id);
        } else {
            setOpenAccordion(undefined);
        }
    }, [filteredSections]);

    return (
        <>
            {filteredSections?.length > 0 ? (
                <Accordion
                    type="single"
                    collapsible
                    value={openAccordion}
                    onValueChange={val => setOpenAccordion(val)}
                    className="w-full space-y-2"
                >
                    {filteredSections.map((section: IComparisonSection) => (
                        <AccordionItem
                            key={section.id}
                            value={section.id}
                            className="border px-2 py-1 bg-gray-50 rounded-md w-full dark:bg-gray-700 dark:border-gray-600"
                        >
                            <AccordionTrigger
                                className="hover:no-underline px-0 py-1 text-gray-600 dark:text-white truncate flex items-center gap-x-2"
                                onClick={() => setOpenAccordion(openAccordion === section.id ? '' : section.id)}
                            >
                                <p className="w-full truncate overflow-hidden text-left">{`${section.label} - Changes`}</p>
                            </AccordionTrigger>
                            {openAccordion === section.id && (
                                <AccordionContent className="relative text-white px-4 rounded-md mt-2 pb-2">
                                    <div>
                                        {section.comparison ? (
                                            <ComparisonGrid
                                                currentVersion={section.comparison.currentVersion}
                                                previousVersion={section.comparison.previousVersion}
                                                sectionData={section.comparison.sectionData}
                                                setOpenNewModal={setOpenNewModal}
                                                setSectionDataTitle={() => {}}
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
            ) : (
                <div
                    className={cn('w-full flex flex-col items-center justify-center gap-y-1 justify-center py-4', {
                        'h-full': isLoadFromModal,
                        'border-2 border-solid rounded-lg border-gray-300 dark:border-gray-700': !isLoadFromModal,
                    })}
                >
                    <FileX className="text-gray-500 dark:text-gray-300" />
                    <p className="w-[300px] text-center">No changes available</p>
                </div>
            )}
        </>
    );
};
