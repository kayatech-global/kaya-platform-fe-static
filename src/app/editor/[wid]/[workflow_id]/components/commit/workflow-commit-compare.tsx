import { Dispatch, SetStateAction } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { renderIcon } from '@/lib/utils';
import { FileX, Repeat2 } from 'lucide-react';
import { Button, Spinner } from '@/components';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context';
import { IComparisonSection } from '@/models';
import { $fetch, FetchError, logger } from '@/utils';
import { useQuery } from 'react-query';
import { ComparisonChanges } from '../comparison-changes';
import { toast } from 'sonner';

interface WorkflowCommitCompareProps {
    isOpen: boolean;
    version?: string;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const fetchComparisonByVersion = async (workspaceId: string, workFlowId: string, targetVersion: string) => {
    const response = await $fetch<IComparisonSection[]>(
        `/release/packages/compare/${workFlowId}/${decodeURIComponent(targetVersion)}`,
        {
            headers: {
                'x-workspace-id': workspaceId,
            },
        }
    );

    return response.data;
};

export const WorkflowCommitCompare = ({ isOpen, version, setOpen }: WorkflowCommitCompareProps) => {
    const params = useParams();
    const { token } = useAuth();

    const { isFetching, data } = useQuery(
        'comparison-by-version',
        () => fetchComparisonByVersion(params.wid as string, params.workflow_id as string, version as string),
        {
            enabled: !!token && !!isOpen && !!version,
            refetchOnWindowFocus: false,
            onError: (error: FetchError) => {
                toast.error(error?.message);
                logger.error('Error while comparison:', error?.message);
            },
        }
    );

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="max-w-[unset] w-[50%]">
                <DialogHeader className="px-0">
                    <DialogTitle asChild>
                        <div className="px-4 flex items-center gap-x-2">
                            <div className="bg-blue-100 flex items-center justify-center w-8 h-8 rounded dark:bg-blue-900">
                                {renderIcon(<Repeat2 />, 16, 'text-blue-600 dark:text-blue-200')}
                            </div>
                            <div className="text-md font-regular text-gray-900 dark:text-gray-50">Compare</div>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                    <div className="px-4 flex flex-col gap-y-4 h-[400px] overflow-y-auto">
                        {isFetching ? (
                            <div className="w-full flex flex-col items-center justify-center gap-y-1 justify-center py-4 h-full">
                                <Spinner />
                                <p className="w-[300px] text-center">
                                    Just a moment, we&apos;are checking the changes...
                                </p>
                            </div>
                        ) : (
                            <>
                                {data && data?.length > 0 ? (
                                    <ComparisonChanges
                                        isLoadFromModal={true}
                                        sections={data}
                                        setOpenNewModal={() => {}}
                                    />
                                ) : (
                                    <div className="w-full flex flex-col items-center justify-center gap-y-1 justify-center py-4 h-full">
                                        <FileX className="text-gray-500 dark:text-gray-300" />
                                        <p className="w-[300px] text-center">No changes available</p>
                                    </div>
                                )}
                            </>
                        )}
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
