import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { Unplug } from 'lucide-react';
import { ExecutableFunctionSelectorFooter } from '@/app/editor/[wid]/[workflow_id]/components/executable-function-selector-footer';
import { ExecutableFunctionList } from './executable-function-list';
import { FormBody as ExecutableFunctionFormBody } from '@/app/workspace/[wid]/executable-functions/components/executable-function-config-form';

// We need to define the props interface for the FormBody if not exported, or use ComponentProps
type ExecutableFunctionFormBodyProps = React.ComponentProps<typeof ExecutableFunctionFormBody>;

interface ExecutableFunctionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isEdit: boolean;
    setOpenForm: React.Dispatch<React.SetStateAction<boolean>>;
    isFormOpen: boolean;
    isReadonly?: boolean;
    // Form Props
    formProps: Omit<ExecutableFunctionFormBodyProps, 'isOpen' | 'isEdit' | 'setOpen'>;
    // List Props
    listProps: React.ComponentProps<typeof ExecutableFunctionList>;
    // Footer Props
    footerProps: React.ComponentProps<typeof ExecutableFunctionSelectorFooter>;
}

export const ExecutableFunctionDialog: React.FC<ExecutableFunctionDialogProps> = ({
    open,
    onOpenChange,
    isEdit,
    setOpenForm,
    isFormOpen,
    formProps,
    listProps,
    footerProps,
}) => {
    let titleText = 'Functions';
    if (isFormOpen) {
        titleText = isEdit ? 'Edit Function Config' : 'New Function Config';
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[unset] w-[580px]">
                <DialogHeader className="px-0">
                    <DialogTitle asChild>
                        <div className="px-4 flex gap-2">
                            {isFormOpen && <Unplug />}
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">{titleText}</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                    <div className="px-4 flex flex-col gap-y-4 h-[351px] overflow-auto">
                        {isFormOpen ? (
                            <div className="item-list-container flex flex-col gap-y-2">
                                <ExecutableFunctionFormBody
                                    isOpen={isFormOpen}
                                    isEdit={isEdit}
                                    setOpen={setOpenForm}
                                    {...formProps}
                                />
                            </div>
                        ) : (
                            <div className="h-full">
                                <ExecutableFunctionList
                                    {...listProps}
                                    showAddNewButton={true}
                                    onAddNewClicked={() => setOpenForm(true)}
                                    showSelectedSection={false}
                                />
                            </div>
                        )}
                    </div>
                </DialogDescription>
                <DialogFooter>
                    <ExecutableFunctionSelectorFooter {...footerProps} />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
