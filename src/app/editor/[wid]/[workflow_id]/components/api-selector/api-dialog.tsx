import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { ApiSelectorFooter } from '../api-selector-footer';
import { ApiList } from './api-list';
import { Unplug } from 'lucide-react';
import {
    ApiConfigurationFormProps,
    FormBody as ApiConfigurationFormBody,
} from '@/app/workspace/[wid]/api-configurations/components/api-configuration-form';

interface ApiDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isEdit: boolean;
    setOpenForm: React.Dispatch<React.SetStateAction<boolean>>; // Controls the inner form vs list view
    isFormOpen: boolean; // Corresponds to `isOpen` in original code (confusing naming in original: isOpen=FormOpen, openModal=Dialog)
    // Form Props
    formProps: Omit<ApiConfigurationFormProps, 'isOpen' | 'isEdit' | 'setOpen'>;
    // List Props
    apiListProps: React.ComponentProps<typeof ApiList>;
    // Footer Props
    footerProps: React.ComponentProps<typeof ApiSelectorFooter>;
}

export const ApiDialog: React.FC<ApiDialogProps> = ({
    open,
    onOpenChange,
    isEdit,
    setOpenForm,
    isFormOpen,
    formProps,
    apiListProps,
    footerProps,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[unset] w-[580px]">
                <DialogHeader className="px-0">
                    <DialogTitle asChild>
                        <div className="px-4 flex gap-2">
                            {isFormOpen && <Unplug />}
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                {(() => {
                                    if (!isFormOpen) return 'APIs';
                                    return isEdit ? 'Edit API Config' : 'New API Config';
                                })()}
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                    <div className="px-4 flex flex-col gap-y-4 h-[351px] overflow-auto">
                        {isFormOpen ? (
                            // FORM VIEW INSIDE DIALOG
                            <div className="item-list-container flex flex-col gap-y-2">
                                <ApiConfigurationFormBody
                                    isOpen={isFormOpen}
                                    isEdit={isEdit}
                                    setOpen={setOpenForm}
                                    {...formProps}
                                />
                            </div>
                        ) : (
                            // LIST VIEW INSIDE DIALOG
                            <div className="h-full">
                                <div className="flex justify-end mb-2">
                                    {/* This button was floating in original */}
                                </div>
                                <ApiList
                                    {...apiListProps}
                                    showAddNewButton={true}
                                    onAddNewClicked={() => setOpenForm(true)}
                                    showSelectedSection={false}
                                />
                            </div>
                        )}
                    </div>
                </DialogDescription>
                <DialogFooter>
                    <ApiSelectorFooter
                        {...footerProps}
                        // Overwrite specific handlers if needed
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
