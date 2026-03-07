// components/guardrail-dialog.tsx
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { Button } from '@/components/atoms';
import { ReactNode } from 'react';

type GuardrailDialogProps = {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    title: string;
    icon?: ReactNode;
    children: ReactNode;
    footerActions?: ReactNode;
};

export const GuardrailDialog = ({ isOpen, setOpen, title, icon, children, footerActions }: GuardrailDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="max-w-[unset] w-[580px] h-[550px]">
                <DialogHeader className="px-0">
                    <DialogTitle asChild>
                        <div className="px-4 flex gap-2">
                            {icon}
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">{title}</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                    <div className="px-4 flex flex-col gap-y-4 overflow-auto">{children}</div>
                </DialogDescription>
                <DialogFooter>
                    {footerActions ?? (
                        <>
                            <Button variant="secondary" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary">Save</Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
