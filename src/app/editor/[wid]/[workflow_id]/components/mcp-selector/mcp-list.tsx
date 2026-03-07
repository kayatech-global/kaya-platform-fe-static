import { FileX, LoaderCircle } from 'lucide-react';
import { Input, Button, SelectableRadioItem } from '@/components';
import { MCP } from './types';
import { IConnectorTool } from '@/models';
import { IMCPBody } from '@/hooks/use-mcp-configuration';

export interface McpListProps {
    mcps: IConnectorTool[];
    checkedItemId: string[] | undefined;
    handleItemCheck: (mcp: MCP) => void;
    onEdit: (id: string) => void;
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    loading?: boolean;
    showSelectedSection?: boolean;
    selectedMcps?: IConnectorTool[];
    mcpServers?: IMCPBody[];
    onAddNewClicked?: () => void;
    isReadonly?: boolean;
    showAddNewButton?: boolean;
}

export const McpList = ({
    mcps,
    checkedItemId,
    handleItemCheck,
    onEdit,
    searchTerm,
    onSearchChange,
    loading,
    showSelectedSection = false,
    selectedMcps = [],
    mcpServers = [],
    onAddNewClicked,
    isReadonly,
    showAddNewButton,
}: McpListProps) => {
    if (loading) {
        return (
            <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-full">
                <LoaderCircle
                    className="animate-spin"
                    size={25}
                    width={25}
                    height={25}
                    absoluteStrokeWidth={undefined}
                />
                <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                    Please wait! loading the MCP data for you...
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center gap-x-5 w-full h-fit mb-2">
                <Input className="w-full" placeholder="Search MCPs" onChange={onSearchChange} value={searchTerm} />
                {showAddNewButton && (
                    <Button variant="link" disabled={isReadonly} onClick={onAddNewClicked} className="min-w-fit">
                        New MCP
                    </Button>
                )}
            </div>
            {mcps?.length > 0 ? (
                <div className="item-list-container overflow-y-auto flex flex-col gap-y-2 h-[600px] border dark:border-gray-600 px-3 py-3 rounded-lg [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 pr-1">
                    {showSelectedSection && selectedMcps && selectedMcps.length > 0 && (
                        <>
                            <p className="text-xs dark:text-gray-400 uppercase tracking-wide mb-1">Selected MCPs</p>
                            {selectedMcps.map(mcp => (
                                <SelectableRadioItem
                                    key={mcp.id}
                                    id={mcp.id}
                                    title="MCP"
                                    label={mcp.name}
                                    description={mcp.description ?? ''}
                                    isChecked={checkedItemId?.includes(mcp.id) || false}
                                    imagePath="/png/mcp-icon.png"
                                    handleClick={() => handleItemCheck(mcp as MCP)}
                                    onEdit={onEdit}
                                />
                            ))}
                            <div className="border-t dark:border-gray-600 border-gray-400 my-3" />
                        </>
                    )}
                    {mcps
                        .filter(mcp => !mcpServers?.some(server => server.id === mcp.id))
                        .map(mcp => (
                            <SelectableRadioItem
                                key={mcp.id}
                                id={mcp.id}
                                title="MCP"
                                label={mcp.name}
                                description={mcp.description ?? ''}
                                isChecked={checkedItemId?.includes(mcp.id) || false}
                                imagePath="/png/mcp-icon.png"
                                handleClick={() => handleItemCheck(mcp as MCP)}
                                onEdit={onEdit}
                            />
                        ))}
                </div>
            ) : (
                <div className="w-full flex flex-col items-center gap-y-1 justify-center h-full border dark:border-gray-700 px-3 py-3 rounded-lg">
                    <FileX className="text-gray-500 dark:text-gray-300" />
                    <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                        {searchTerm === '' ? (
                            <>
                                No MCPs have been
                                <br /> configured
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
