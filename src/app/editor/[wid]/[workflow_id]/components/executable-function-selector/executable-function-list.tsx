import React from 'react';
import { Input, Button, SelectableRadioItem } from '@/components';
import { FileX, LoaderCircle } from 'lucide-react';
import { IExecutableFunctionTool } from '@/models';
import { ExecutableFunction } from '@/components/organisms';

interface ExecutableFunctionListProps {
    isLoading?: boolean;
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    currentFunctions: IExecutableFunctionTool[];
    checkedItemIds?: string[];
    onItemCheck: (func: IExecutableFunctionTool) => void;
    onEdit: (id: string) => void;
    selectedFunctions: IExecutableFunctionTool[]; // For showListOnly mode to show selected header
    showSelectedSection?: boolean;
    onAddNewClicked?: () => void;
    isReadonly?: boolean;
    showAddNewButton?: boolean;
    functions?: ExecutableFunction[]; // Prop from parent to check existing selections
}

export const ExecutableFunctionList: React.FC<ExecutableFunctionListProps> = ({
    isLoading,
    searchTerm,
    onSearchChange,
    currentFunctions,
    checkedItemIds,
    onItemCheck,
    onEdit,
    selectedFunctions,
    showSelectedSection,
    onAddNewClicked,
    isReadonly,
    showAddNewButton,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    functions,
}) => {
    if (isLoading) {
        return (
            <div className="w-full flex flex-col items-center justify-center gap-y-1 py-4 h-full">
                <LoaderCircle
                    className="animate-spin"
                    size={25}
                    width={25}
                    height={25}
                    absoluteStrokeWidth={undefined}
                />
                <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                    Please wait! loading the Function data for you...
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[88%] w-full">
            <div className="flex items-center gap-x-5 w-full h-fit mb-2">
                <Input className="w-full" placeholder="Search Functions" value={searchTerm} onChange={onSearchChange} />
                {showAddNewButton && (
                    <Button variant="link" disabled={isReadonly} onClick={onAddNewClicked} className="min-w-fit">
                        New Function
                    </Button>
                )}
            </div>

            {currentFunctions.length > 0 ? (
                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2 h-[600px] border dark:border-gray-600 px-3 py-3 rounded-lg [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 pr-1">
                    {showSelectedSection && selectedFunctions.length > 0 && (
                        <>
                            <p className="text-xs dark:text-gray-400 uppercase tracking-wide mb-1">
                                Selected Functions
                            </p>

                            {selectedFunctions.map(execFunc => (
                                <SelectableRadioItem
                                    key={execFunc.id}
                                    id={execFunc.id}
                                    title="Function"
                                    label={execFunc.name}
                                    description={execFunc.description}
                                    isChecked={checkedItemIds?.includes(execFunc.id) ?? false}
                                    imagePath="/png/api.png"
                                    handleClick={() => onItemCheck(execFunc)}
                                    onEdit={onEdit}
                                />
                            ))}
                            <div className="border-t dark:border-gray-600 border-gray-400 my-3" />
                        </>
                    )}
                    {currentFunctions
                        // Filter out items already shown in selected section if that section is active
                        .filter(execFunc =>
                            showSelectedSection ? !selectedFunctions.some(s => s.id === execFunc.id) : true
                        )
                        .map(execFunc => (
                            <SelectableRadioItem
                                key={execFunc.id}
                                id={execFunc.id}
                                title="Function"
                                label={execFunc.name}
                                description={execFunc.description}
                                isChecked={checkedItemIds?.includes(execFunc.id) ?? false}
                                imagePath="/png/api.png"
                                handleClick={() => onItemCheck(execFunc)}
                                onEdit={onEdit}
                            />
                        ))}
                </div>
            ) : (
                <div className="w-full flex flex-col items-center justify-center gap-y-1 h-full border dark:border-gray-600 px-3 py-3 rounded-lg">
                    <FileX className="text-gray-500 dark:text-gray-300" />
                    <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                        {searchTerm === '' ? (
                            <>
                                No Functions have been
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
