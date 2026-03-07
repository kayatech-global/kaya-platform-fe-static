import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { Button } from '@/components';
import { cn } from '@/lib/utils';
import { Unplug } from 'lucide-react';
import React from 'react';

interface GraphRagDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isFormOpen: boolean; // 'isOpen' from useGraphRagConfiguration
    isEdit: boolean;
    children: React.ReactNode;
    footer: React.ReactNode;
    onCreateNew: () => void;
}

export const GraphRagDialog = ({
    open,
    onOpenChange,
    isFormOpen,
    isEdit,
    children,
    footer,
    onCreateNew,
}: GraphRagDialogProps) => {
    const prefix = isEdit ? 'Edit' : 'New';
    const dialogTitle = isFormOpen ? `${prefix} Graph RAG Configurations` : 'Graph RAGs';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[unset] w-[580px]">
                <DialogHeader className="px-0">
                    <DialogTitle asChild>
                        <div className="px-4 flex gap-2">
                            {isFormOpen && <Unplug />}
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">{dialogTitle}</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                    <div
                        className={cn('flex flex-col gap-y-4 h-[351px]', {
                            'px-4': !isFormOpen,
                        })}
                    >
                        {!isFormOpen && (
                            <div className="flex justify-end">
                                <Button variant="link" onClick={onCreateNew}>
                                    New Graph RAG
                                </Button>
                            </div>
                        )}
                        {children}
                    </div>
                </DialogDescription>
                <DialogFooter>{footer}</DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
