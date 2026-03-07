import { ServerCog } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/atoms/dialog';
import {
    FormBody as McpConfigurationFormBody,
    McpConfigurationFormProps,
} from '@/app/workspace/[wid]/mcp-configurations/components/mcp-configuration-form';
import { McpList, McpListProps } from './mcp-list';
import { McpSelectorFooter, McpSelectorFooterProps } from './mcp-selector-footer';

interface McpDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isOpen: boolean; // Form open state
    setIsOpen: (open: boolean) => void;
    isEdit: boolean;
    isReadonly?: boolean;
    formProps: McpConfigurationFormProps;
    mcpListProps: McpListProps;
    footerProps: McpSelectorFooterProps;
}

export const McpDialog = ({
    open,
    onOpenChange,
    isOpen,
    setIsOpen,
    isEdit,
    formProps,
    mcpListProps,
    footerProps,
}: McpDialogProps) => {
    let dialogTitle = 'MCPs';
    if (isOpen) {
        dialogTitle = isEdit ? 'Edit MCP Config' : 'New MCP Config';
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[unset] w-[580px]">
                <DialogHeader className="px-0">
                    <DialogTitle asChild>
                        <div className="px-4 flex gap-2">
                            {isOpen && <ServerCog />}
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">{dialogTitle}</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                    <div className="px-4 flex flex-col gap-y-4 h-[351px]">
                        {!isOpen && (
                            <div className="h-full">
                                <McpList
                                    {...mcpListProps}
                                    showAddNewButton={true}
                                    onAddNewClicked={() => setIsOpen(true)}
                                />
                            </div>
                        )}
                        {isOpen && (
                            <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                                <McpConfigurationFormBody {...formProps} />
                            </div>
                        )}
                    </div>
                </DialogDescription>
                <DialogFooter>
                    <McpSelectorFooter {...footerProps} />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
