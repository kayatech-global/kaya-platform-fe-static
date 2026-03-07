import { Button } from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { Repeat2 } from 'lucide-react';

interface WorkflowReleaseCompareProps {
    isOpen: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const WorkflowReleaseCompare = ({ isOpen, setOpen }: WorkflowReleaseCompareProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="max-w-[unset] w-[580px]">
                <DialogHeader className="px-0">
                    <DialogTitle asChild>
                        <div className="px-4 flex gap-2">
                            <Repeat2 />
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">Compare</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                    <div className="px-4 flex flex-col gap-y-4 h-[351px] overflow-y-auto">
                        <div className="w-full flex flex-col items-center justify-center gap-y-1 justify-center py-4 h-full">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Coming soon</p>
                        </div>
                    </div>
                </DialogDescription>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
