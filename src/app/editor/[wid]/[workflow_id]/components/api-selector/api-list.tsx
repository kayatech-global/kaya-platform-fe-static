import React from 'react';
import { Input, Button, SelectableRadioItem } from '@/components';
import { FileX, LoaderCircle } from 'lucide-react';
import { truncate } from 'lodash';
import { IApiTool } from '@/models';

interface ApiListProps {
    isLoading?: boolean;
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    currentApis: IApiTool[];
    checkedItemIds?: string[];
    onItemCheck: (api: IApiTool) => void;
    onEdit: (id: string) => void;
    selectedApis: IApiTool[]; // For showListOnly mode to show selected header
    showSelectedSection?: boolean;
    onAddNewClicked?: () => void;
    isReadonly?: boolean;
    showAddNewButton?: boolean;
    hideEditButton?: boolean;
}

export const ApiList: React.FC<ApiListProps> = ({
    isLoading,
    searchTerm,
    onSearchChange,
    currentApis,
    checkedItemIds,
    onItemCheck,
    onEdit,
    selectedApis,
    showSelectedSection,
    onAddNewClicked,
    isReadonly,
    showAddNewButton,
    hideEditButton,
}) => {
    if (isLoading) {
        return (
            <div className="w-full flex flex-col items-center justify-center gap-y-1 py-4 h-full">
                <LoaderCircle className="animate-spin" size={25} />
                <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                    Please wait! loading the API data for you...
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[88%] w-full">
            <div className="flex items-center gap-x-5 w-full h-fit mb-2">
                <Input className="w-full" placeholder="Search APIs" value={searchTerm} onChange={onSearchChange} />
                {showAddNewButton && (
                    <Button variant="link" disabled={isReadonly} onClick={onAddNewClicked} className="min-w-fit">
                        New API
                    </Button>
                )}
            </div>

            {currentApis.length > 0 || (showSelectedSection && selectedApis.length > 0) ? (
                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2 h-[600px] border dark:border-gray-600 px-3 py-3 rounded-lg [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 pr-1">
                    {showSelectedSection && selectedApis.length > 0 && (
                        <>
                            <p className="text-xs dark:text-gray-400 uppercase tracking-wide mb-1">Selected APIs</p>
                            {selectedApis.map(api => (
                                <SelectableRadioItem
                                    key={api.id}
                                    id={api.id}
                                    title="API"
                                    label={truncate(api.name, { length: 40 })}
                                    labelTitle={api.name}
                                    description={truncate(api.description, { length: 80 })}
                                    isChecked={checkedItemIds?.includes(api.id) || false}
                                    imagePath="/png/api.png"
                                    handleClick={() => onItemCheck(api)}
                                    onEdit={hideEditButton ? undefined : onEdit}
                                />
                            ))}
                            <div className="border-t dark:border-gray-600 border-gray-400 my-3" />
                        </>
                    )}

                    {currentApis
                        .filter(api => (showSelectedSection ? !selectedApis.some(s => s.id === api.id) : true))
                        .map(api => (
                            <SelectableRadioItem
                                key={api.id}
                                id={api.id}
                                title="API"
                                label={truncate(api.name, { length: 40 })}
                                labelTitle={api.name}
                                description={truncate(api.description, { length: 80 })}
                                isChecked={checkedItemIds?.includes(api.id) || false}
                                imagePath="/png/api.png"
                                handleClick={() => onItemCheck(api)}
                                onEdit={hideEditButton ? undefined : onEdit}
                            />
                        ))}
                </div>
            ) : (
                <div className="w-full flex flex-col items-center justify-center gap-y-1 h-full border dark:border-gray-600 px-3 py-3 rounded-lg">
                    <FileX className="text-gray-500 dark:text-gray-300" />
                    <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                        {searchTerm === '' ? (
                            <>
                                No APIs have been
                                <br /> configured
                            </>
                        ) : (
                            <>No results found</>
                        )}
                    </p>
                </div>
            )}
        </div>
    );
};
