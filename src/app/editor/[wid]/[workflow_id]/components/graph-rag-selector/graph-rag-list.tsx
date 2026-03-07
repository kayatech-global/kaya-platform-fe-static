import { Button, Input, SelectableRadioItem } from '@/components';
import { IGraphRag } from '@/models';
import { FileX, LoaderCircle } from 'lucide-react';

interface GraphRagListProps {
    isLoading: boolean;
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    filteredGraphRAGs: IGraphRag[];
    graphRags: IGraphRag[]; // Currently selected/persisted
    checkedItemIds: string[] | undefined;
    onItemCheck: (config: IGraphRag) => void;
    onEdit: (id: string) => void;
    isReadonly?: boolean;
    showAddNewButton?: boolean;
    onAddNew: () => void;
}

export const GraphRagList = ({
    isLoading,
    searchTerm,
    onSearchChange,
    filteredGraphRAGs,
    graphRags,
    checkedItemIds,
    onItemCheck,
    onEdit,
    isReadonly,
    showAddNewButton,
    onAddNew,
}: GraphRagListProps) => {
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
                    Please wait! loading the graph RAGs data for you...
                </p>
            </div>
        );
    }

    // Use persisted graphRags to determine visual grouping (prevent jumping on check)
    const selectedIds = new Set(graphRags.map(g => g.id));
    const selectedGraphRags = filteredGraphRAGs.filter(config => selectedIds.has(config.id));
    const unselectedGraphRags = filteredGraphRAGs.filter(config => !selectedIds.has(config.id));

    const hasItems = filteredGraphRAGs.length > 0;

    return (
        <>
            <div className="flex items-center gap-x-5 w-full h-fit">
                <Input
                    className="w-full"
                    placeholder="Search Graph RAGs"
                    value={searchTerm}
                    onChange={onSearchChange}
                />
                {showAddNewButton && (
                    <Button variant="link" disabled={isReadonly} onClick={onAddNew} className="min-w-fit">
                        New Graph RAGs
                    </Button>
                )}
            </div>
            {hasItems ? (
                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2 h-[600px] border dark:border-gray-600 px-3 py-3 rounded-lg [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 pr-1">
                    {/* Just mapping filteredGraphRAGs is simpler and respects the sort order from the hook. */}
                    {selectedGraphRags.length > 0 && (
                        <div className="flex flex-col gap-y-2 mb-2">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 uppercase">
                                Selected Graph RAGs
                            </p>
                            {selectedGraphRags.map(config => (
                                <SelectableRadioItem
                                    key={config.id}
                                    id={config.id as string}
                                    title="Graph RAG"
                                    label={config.name}
                                    description={config.description}
                                    isChecked={true}
                                    imagePath="/png/kg.png"
                                    handleClick={() => onItemCheck(config)}
                                    onEdit={onEdit}
                                    hasEdit={!config?.isReadOnly}
                                />
                            ))}
                            <div className="border-b border-gray-200 dark:border-gray-700 my-2" />
                        </div>
                    )}

                    {unselectedGraphRags.map(config => {
                        const isChecked = checkedItemIds?.includes(config.id as string) ?? false;
                        return (
                            <SelectableRadioItem
                                key={config.id}
                                id={config.id as string}
                                title="Graph RAG"
                                label={config.name}
                                description={config.description}
                                isChecked={isChecked}
                                imagePath="/png/kg.png"
                                handleClick={() => onItemCheck(config)}
                                onEdit={onEdit}
                                hasEdit={!config?.isReadOnly}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="w-full flex flex-col items-center gap-y-1 justify-center h-full border dark:border-gray-700 px-3 py-3 rounded-lg">
                    <FileX className="text-gray-500 dark:text-gray-300" />
                    <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                        {searchTerm === '' ? (
                            <>
                                No Graph RAGs have been
                                <br />
                                configured
                            </>
                        ) : (
                            <>No results found</>
                        )}
                    </p>
                </div>
            )}
        </>
    );
};
