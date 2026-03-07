import { useBreakpoint } from '@/hooks/use-breakpoints';
import { Spinner } from '@/components';
import { cn } from '@/lib/utils';

const WorkspaceContainerSkeleton = () => {
    const { isMobile } = useBreakpoint();

    return (
        <div className="relative flex flex-col items-center justify-center">
            <div className="absolute z-50 flex items-center flex-col gap-y-2">
                <Spinner />
                <p>Hold on</p>
                <p className="text-xs text-center text-gray-700 dark:text-gray-300 z-50 w-[350px]">
                    Your workspace is loading and will be ready shortly
                </p>
            </div>
            <div className="realms-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div
                        className={cn(
                            'realm-container flex flex-col gap-y-9 w-[972px] dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700 animate-pulse',
                            { 'w-[98vw] px-4': isMobile }
                        )}
                        style={{ height: 'calc(100vh - 210px)' }}
                    >
                        <div
                            className={cn(
                                'realm-card h-full w-[972px] bg-[rgba(255,255,255,0.6)] rounded-lg backdrop-blur-[7px] border border-gray-200 px-6 py-3 flex flex-col gap-y-[10px]',
                                'dark:bg-[rgba(31,41,55,0.8)] dark:border-gray-700',
                                'animate-pulse'
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceContainerSkeleton;
