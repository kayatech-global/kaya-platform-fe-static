import { Info } from 'lucide-react';

export const ScheduleTriggerStepInfoBox = ({ title, description }: { title: string; description: string }) => {
    return (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-100 dark:text-blue-200">
            <div className="flex items-start gap-x-2">
                <Info size={18} className="text-blue-700 flex-shrink-0 " />
                <div>
                    <p className="text-sm font-medium text-blue-700">{title}</p>
                    <p className="mt-1 text-xs text-blue-600">{description}</p>
                </div>
            </div>
        </div>
    );
};
