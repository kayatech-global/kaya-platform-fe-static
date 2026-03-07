import React from 'react';
import { Input, Button, SelectableRadioItem } from '@/components';
import { FileX, LoaderCircle } from 'lucide-react';
import { IConnectorForm, ConnectorType } from '@/models';
import { connectorLogo } from '@/hooks/use-connector';

interface ConnectorListProps {
    isLoading?: boolean;
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    currentConnectors: IConnectorForm[];
    checkedItemIds?: string[];
    onItemCheck: (connector: IConnectorForm) => void;
    onEdit: (id: string) => void;
    selectedConnectors: IConnectorForm[];
    showSelectedSection?: boolean;
    onAddNewClicked?: () => void;
    isReadonly?: boolean;
    showAddNewButton?: boolean;
}

export const ConnectorList: React.FC<ConnectorListProps> = ({
    isLoading,
    searchTerm,
    onSearchChange,
    currentConnectors,
    checkedItemIds,
    onItemCheck,
    onEdit,
    selectedConnectors,
    showSelectedSection,
    onAddNewClicked,
    isReadonly,
    showAddNewButton,
}) => {
    if (isLoading) {
        return (
            <div className="w-full flex flex-col items-center justify-center gap-y-1 py-4 h-full">
                <LoaderCircle className="animate-spin" size={25} />
                <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                    Please wait! loading the Connector data for you...
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[88%] w-full">
            <div className="flex items-center gap-x-5 w-full h-fit mb-2">
                <Input
                    className="w-full"
                    placeholder="Search Connectors"
                    value={searchTerm}
                    onChange={onSearchChange}
                />
                {showAddNewButton && (
                    <Button variant="link" disabled={isReadonly} onClick={onAddNewClicked} className="min-w-fit">
                        New Connector
                    </Button>
                )}
            </div>

            {currentConnectors.length > 0 || (showSelectedSection && selectedConnectors.length > 0) ? (
                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2 h-[600px] border dark:border-gray-600 px-3 py-3 rounded-lg [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 pr-1">
                    {showSelectedSection && selectedConnectors.length > 0 && (
                        <>
                            <p className="text-xs dark:text-gray-400 uppercase tracking-wide mb-1">
                                Selected Connectors
                            </p>
                            {selectedConnectors.map(connector => (
                                <SelectableRadioItem
                                    key={connector.id}
                                    id={connector.id as string}
                                    title="Connectors"
                                    label={connector.name}
                                    description={connector.description}
                                    isChecked={checkedItemIds?.includes(connector.id as string) ?? false}
                                    imagePath={
                                        connectorLogo?.[connector?.type as ConnectorType.Pega] ??
                                        '/png/prompt_image.png'
                                    }
                                    handleClick={() => onItemCheck(connector)}
                                    onEdit={onEdit}
                                />
                            ))}
                            <div className="border-t dark:border-gray-600 border-gray-400 my-3" />
                        </>
                    )}

                    {currentConnectors
                        .filter(connector =>
                            showSelectedSection ? !selectedConnectors.some(s => s.id === connector.id) : true
                        )
                        .map(connector => (
                            <SelectableRadioItem
                                key={connector.id}
                                id={connector.id as string}
                                title="Connectors"
                                label={connector.name}
                                description={connector.description}
                                isChecked={checkedItemIds?.includes(connector.id as string) ?? false}
                                imagePath={
                                    connectorLogo?.[connector?.type as ConnectorType.Pega] ?? '/png/prompt_image.png'
                                }
                                handleClick={() => onItemCheck(connector)}
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
                                No Connectors have been
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
