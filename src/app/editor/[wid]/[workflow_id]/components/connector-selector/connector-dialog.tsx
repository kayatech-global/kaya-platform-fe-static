import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { ConnectorSelectorFooter } from './connector-selector-footer';
import { ConnectorList } from './connector-list';
import { Link2 } from 'lucide-react';
import { FormBody as ConnectorConfigForm } from '@/app/workspace/[wid]/configure-connections/connectors/components/connector-config-form';

type ConnectorConfigFormProps = React.ComponentProps<typeof ConnectorConfigForm>;

interface ConnectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isEdit: boolean;
    setOpenForm: React.Dispatch<React.SetStateAction<boolean>>; // Controls the inner form vs list view
    isFormOpen: boolean; // Corresponds to `isOpen` (form view)
    // Form Props
    formProps: Omit<ConnectorConfigFormProps, 'isOpen' | 'isEdit' | 'setOpen'>;
    // List Props
    connectorListProps: React.ComponentProps<typeof ConnectorList>;
    // Footer Props
    footerProps: React.ComponentProps<typeof ConnectorSelectorFooter>;
}

export const ConnectorDialog: React.FC<ConnectorDialogProps> = ({
    open,
    onOpenChange,
    isEdit,
    setOpenForm,
    isFormOpen,
    formProps,
    connectorListProps,
    footerProps,
}) => {
    let dialogTitle = 'Connectors';
    if (isFormOpen) {
        dialogTitle = isEdit ? 'Edit Connector Config' : 'New Connector Config';
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[unset] w-[580px]">
                <DialogHeader className="px-0">
                    <DialogTitle asChild>
                        <div className="px-4 flex gap-2">
                            {isFormOpen && <Link2 />}
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">{dialogTitle}</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                    <div className="px-4 flex flex-col gap-y-4 h-[351px] overflow-auto">
                        {isFormOpen ? (
                            // FORM VIEW INSIDE DIALOG
                            <div className="item-list-container flex flex-col gap-y-2">
                                <ConnectorConfigForm
                                    isOpen={isFormOpen}
                                    isEdit={isEdit}
                                    setOpen={setOpenForm}
                                    {...formProps}
                                />
                            </div>
                        ) : (
                            // LIST VIEW INSIDE DIALOG
                            <div className="h-full">
                                <div className="flex justify-end mb-0"></div>
                                <ConnectorList
                                    {...connectorListProps}
                                    showAddNewButton={true}
                                    onAddNewClicked={() => setOpenForm(true)}
                                    showSelectedSection={false} // Usually list in modal shows checkmarks, not separate section?
                                />
                            </div>
                        )}
                    </div>
                </DialogDescription>
                <DialogFooter>
                    <ConnectorSelectorFooter {...footerProps} />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
