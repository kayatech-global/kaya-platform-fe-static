'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/atoms/accordion';
import { SourceIndexConfig } from '@/constants/rag-constants';
import { cn } from '@/lib/utils';
import {
    AlignHorizontalSpaceAround,
    Code,
    Database,
    DatabaseZap,
    EthernetPort,
    FileLock2,
    FolderPen,
    Globe,
    Grid3x3,
    Info,
    Layers,
    Link,
    List,
    LucideChevronsLeftRightEllipsis,
    NotebookText,
    Router,
    Ruler,
    Server,
    ShieldCheck,
    Shuffle,
    SplitSquareVertical,
    TextQuote,
} from 'lucide-react';
import { useState } from 'react';

type SourceInfoCardProps = {
    data: SourceIndexConfig | null;
};

export const SourceInfoCard = ({ data }: SourceInfoCardProps) => {
    console.log('data : ', data);
    const [openItem, setOpenItem] = useState<string | undefined>(undefined);

    return (
        <div className="w-full p-3 bg-gray-100 rounded-md">
            <div className="w-full">
                <h3 className="font-semibold text-sm text-gray-800 sr-only">Selected Index Information</h3>
                <Accordion type="single" collapsible value={openItem} onValueChange={val => setOpenItem(val)}>
                    <AccordionItem value="item-1" className="border-b-0">
                        <AccordionTrigger className="!p-0 hover:no-underline">
                            <div className="flex items-center gap-x-2">
                                <Info size={16} /> {openItem !== 'item-1' && <span>View</span>} Selected Index
                                informations
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-0 min-h-[200px]">
                            <div className="w-full grid grid-cols-2 gap-3 mt-3">
                                {data?.databaseType && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <Database className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Database Type</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data.databaseType
                                                    .replace(/_/g, ' ')
                                                    .replace(/\b\w/g, char => char.toUpperCase())}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {data?.attributes?.embeddingType && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <Code className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Embedding Type</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.attributes?.embeddingType}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.indexType && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <AlignHorizontalSpaceAround className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Index Type</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.indexType}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.granularityLevel && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <Layers className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Granularity Level</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.granularityLevel}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.indexSubtype && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <SplitSquareVertical className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Index Subtype</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.indexSubtype}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.attributes?.provider && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <Server className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Provider</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.attributes?.provider}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.attributes?.connectionString && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <Server className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Connection String</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.attributes?.connectionString}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.attributes?.host && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <Router className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Host</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.attributes?.host}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.attributes?.port && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <EthernetPort className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Port</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.attributes?.port}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.attributes?.cacheSize && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <DatabaseZap className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Cache Size</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.attributes?.cacheSize}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.attributes?.evictionPolicy && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <ShieldCheck className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Eviction Policy</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.attributes?.evictionPolicy}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {data?.attributes?.url && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <Link className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">URL</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.attributes?.url}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.attributes?.schema && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <NotebookText className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Schema</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.attributes?.schema}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.attributes?.collectionName && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <FolderPen className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Collection Name</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.attributes?.collectionName}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.attributes?.endpoint && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <Globe className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">End Point</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.attributes?.endpoint}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.attributes?.dimension && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <Ruler className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Dimension</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.attributes?.dimension}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.attributes?.distanceMetric && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <Shuffle className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Distance Metric</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.attributes?.distanceMetric}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.attributes?.databaseName && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <DatabaseZap className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Database Name</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.attributes?.databaseName}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.attributes?.credentials && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <FileLock2 className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Credentials</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.attributes?.credentials}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {data?.attributes?.queryLanguage && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <LucideChevronsLeftRightEllipsis className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Query Language</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.attributes?.queryLanguage}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.attributes?.indexName && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <TextQuote className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Index Name</p>
                                            <p className="text-sm font-semibold w-full truncate overflow-hidden">
                                                {data?.attributes?.indexName}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {data?.attributes?.chunks && (
                                    <div className="border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden">
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <Grid3x3 className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Chunks</p>
                                            <div className="text-sm font-semibold w-full truncate overflow-hidden flex items-center gap-2 mt-1 flex-wrap">
                                                {data?.attributes?.chunks?.map(chunk => (
                                                    <div
                                                        className="text-[10px] w-fit bg-gray-200 px-2 rounded-md"
                                                        key={chunk}
                                                    >
                                                        {chunk}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {data?.metadataTypes && (
                                    <div
                                        className={cn(
                                            'border-[1px] border-gray-300 p-3 rounded-md flex items-start gap-x-3 overflow-hidden',
                                            {
                                                'col-span-2': data?.indexName == 'legacy_session_policy_cache',
                                            }
                                        )}
                                    >
                                        <div className="size-6 min-w-6 rounded-full bg-blue-200 flex items-center justify-center">
                                            <List className="text-primary" size={12} />
                                        </div>
                                        <div className="w-full overflow-hidden">
                                            <p className="text-xs text-gray-500">Metadata Types</p>
                                            <div className="text-sm font-semibold w-full truncate overflow-hidden  flex items-center gap-2 mt-1 flex-wrap">
                                                {data?.metadataTypes?.map(metadata => (
                                                    <div
                                                        className="text-[10px] w-fit bg-gray-200 px-2 rounded-md"
                                                        key={metadata}
                                                    >
                                                        {metadata}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
};
