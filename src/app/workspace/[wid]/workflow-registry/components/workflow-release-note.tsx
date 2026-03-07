import { Spinner } from '@/components';
import { Dialog, DialogContent, DialogHeader } from '@/components/atoms/dialog';
import { MarkdownText } from '@/components/molecules/mardown-text/markdown-text';
import { cn } from '@/lib/utils';
import { NotepadText } from 'lucide-react';

interface WorkflowReleaseNoteProps {
    isOpen: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    note: string | null;
    isFetching: boolean;
    artifactVersion: string | null;
}

export const WorkflowReleaseNote = ({
    isOpen,
    setOpen,
    isFetching,
    note,
    artifactVersion,
}: WorkflowReleaseNoteProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent hideCloseButtonClass="block top-6" className="gap-0 max-w-none w-[500px]">
                <DialogHeader className="px-4 py-4 flex flex-row gap-x-2">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-200 rounded">
                        <NotepadText size={16} color="#316FED" />
                    </div>
                    <p className="text-md font-semibold text-gray-700 relative bottom-1 dark:text-gray-100">
                        Release Note | V{artifactVersion}
                    </p>
                </DialogHeader>
                <div className="px-4 py-6 flex flex-col gap-y-6 min-h-[250px] max-h-[450px] w-full overflow-auto">
                    <div
                        className={cn(
                            'bg-[#F2F2F2] dark:bg-gray-700 px-2 py-4 rounded-sm h-full overflow-y-auto break-words',
                            {
                                'flex w-full justify-center items-center': isFetching,
                            }
                        )}
                    >
                        {isFetching ? (
                            <div className="flex items-center flex-col gap-y-2 text-gray-400">
                                <Spinner />
                                <p>Loading release note...</p>
                            </div>
                        ) : (
                            <MarkdownText>{note as string}</MarkdownText>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
