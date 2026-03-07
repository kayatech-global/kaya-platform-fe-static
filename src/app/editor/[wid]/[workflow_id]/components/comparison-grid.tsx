import { CircleCheckBig, CircleX, Info, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { Button, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components';
import { SectionData, ComparisonItem } from '@/enums/config-type';
interface ComparisonGridProps {
    currentVersion: string;
    previousVersion: string;
    sectionData: SectionData[];
    setOpenNewModal: Dispatch<SetStateAction<boolean>>;
    setSectionDataTitle: Dispatch<SetStateAction<string | null>>;
    sourceVersion?: string;
    targetVersion?: string;
    isEditor?: boolean;
    isCurrentVersion?: boolean;
    parentCurrentVersion?: boolean;
    isPull?: boolean;
}

export const ComparisonGrid: React.FC<ComparisonGridProps> = ({
    currentVersion,
    previousVersion,
    sectionData,
    setOpenNewModal,
    setSectionDataTitle,
    sourceVersion,
    targetVersion,
    isEditor,
    isCurrentVersion,
    parentCurrentVersion,
    isPull,
}) => {
    const [openSections, setOpenSections] = useState<Set<string>>(
        () => new Set(sectionData.map(section => section.title))
    );

    const toggleSection = (sectionTitle: string) => {
        const newOpenSections = new Set(openSections);
        if (newOpenSections.has(sectionTitle)) {
            newOpenSections.delete(sectionTitle);
        } else {
            newOpenSections.add(sectionTitle);
        }
        setOpenSections(newOpenSections);
    };

    const getStatusBadge = (status: string, sectionTitle: string, item?: ComparisonItem) => {
        switch (status) {
            case 'match':
                return (
                    <span className="text-gray-900 flex items-center gap-[5px] dark:text-gray-100">
                        <CircleCheckBig className="text-green-800 w-4 h-4 dark:text-green-400" /> Match
                    </span>
                );
            case 'missing':
                return (
                    <span className="text-gray-900 flex items-center gap-[5px] dark:text-gray-100">
                        <CircleX className="text-red-800 w-4 h-4 dark:text-red-400" /> Missing
                    </span>
                );
            case 'different':
                return (
                    <span className="text-gray-900 flex items-center gap-[5px] dark:text-gray-100">
                        <Info className="text-amber-500 w-4 h-4 dark:text-amber-400" /> Different
                    </span>
                );
            case 'configure':
                return (
                    <Button
                        variant={'link'}
                        size="icon"
                        className="flex items-center gap-[5px] dark:text-white"
                        onClick={() => {
                            setOpenNewModal(true);
                            setSectionDataTitle(sectionTitle);
                        }}
                    >
                        <Settings size={18} className="text-blue-500 cursor-pointer dark:text-blue" />
                        Configure
                    </Button>
                );
            case 'updated':
                return (
                    <span className="text-gray-900 flex items-center gap-[5px] dark:text-gray-100">
                        <CircleCheckBig className="text-blue-800 w-4 h-4 dark:text-blue-400" /> Updated
                    </span>
                );
            case 'verified':
                return (
                    <span className="text-gray-500 flex items-center gap-[5px] dark:text-gray-500">
                        <CircleCheckBig className="text-blue-800 w-4 h-4 dark:text-blue-400" /> Verified
                    </span>
                );
            case 'validated':
                return (
                    <span className="text-gray-900 flex items-center gap-[5px] dark:text-gray-100">
                        <CircleCheckBig className="text-green-800 w-4 h-4 dark:text-green-800" /> Validated
                    </span>
                );
            case 'failed':
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="text-gray-900 flex items-center gap-[5px] dark:text-gray-100 cursor-help">
                                    <CircleX className="text-red-600 w-4 h-4 dark:text-red-400" /> Failed
                                </span>
                            </TooltipTrigger>
                            <TooltipContent className="bg-red-50 text-red-600 border max-w-[250px] border-red-300 dark:bg-red-900/50 dark:text-red-400 dark:border-red-400">
                                {item?.failureMessage ?? 'Validation failed'}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );

            default:
                return null;
        }
    };

    const renderCurrentVersionHeader = () => {
        if (isPull) {
            return (
                <>
                    {sourceVersion ?? currentVersion}{' '}
                    <span className="text-blue-600 dark:text-blue-400">(Current)</span>
                </>
            );
        }
        if (isEditor || isCurrentVersion || parentCurrentVersion) {
            return <span className="text-blue-600 dark:text-blue-400">Current</span>;
        }
        return <>{sourceVersion ?? currentVersion}</>;
    };

    return (
        <div className="space-y-4">
            {sectionData.map(section => {
                const isOpen = openSections.has(section.title);

                return (
                    <div key={section.title} className="border border-gray-200 rounded-md dark:border-gray-600">
                        <button
                            onClick={() => toggleSection(section.title)}
                            className="w-full bg-blue-100 text-gray-800 px-4 py-2 font-medium rounded-t-md hover:bg-blue-200 transition-colors duration-200 flex items-center justify-between dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                        >
                            <span>{section.title} </span>
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                            <div className="px-4 py-2 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-600">
                                <div className="grid grid-cols-4 gap-4 font-semibold text-gray-600 border-b border-gray-200 py-2 dark:text-gray-300 dark:border-gray-600">
                                    <div>Field</div>
                                    <div>{renderCurrentVersionHeader()}</div>
                                    <div>
                                        {isPull ? (
                                            <>
                                                {targetVersion || previousVersion}{' '}
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    ({isEditor ? 'Target' : 'Previous'})
                                                </span>
                                            </>
                                        ) : (
                                            <>{targetVersion || previousVersion}</>
                                        )}
                                        {/* <span className="text-gray-500 dark:text-gray-400">
                                            ({isEditor ? 'Target' : 'Previous'})
                                        </span> */}
                                    </div>
                                    <div>Status</div>
                                </div>

                                {section.items.map((item, itemIdx) => (
                                    <div
                                        key={item.label || itemIdx}
                                        className="grid grid-cols-4 gap-4 py-2 border-b border-gray-100 items-center text-sm dark:border-gray-700"
                                    >
                                        <div className="text-gray-600 dark:text-gray-300">{item.label}</div>
                                        <div className="text-gray-900 dark:text-gray-100 w-20 truncate">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="truncate block cursor-default">
                                                            {item.current ?? '--'}
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-[90vw] sm:max-w-[400px] md:max-w-[600px] lg:max-w-[900px] break-words whitespace-normal">
                                                        {item.current ?? '--'}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <div className="text-gray-900 dark:text-gray-100 w-20 truncate">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="truncate block cursor-default">
                                                            {item.previous ?? '--'}
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-[90vw] sm:max-w-[400px] md:max-w-[600px] lg:max-w-[900px] break-words whitespace-normal">
                                                        {item.previous ?? '--'}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <div>{getStatusBadge(item.status, section.title, item)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
