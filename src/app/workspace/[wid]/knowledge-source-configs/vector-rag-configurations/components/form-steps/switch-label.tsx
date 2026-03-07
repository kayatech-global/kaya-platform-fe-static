import { Label, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import { Info } from 'lucide-react';

type SwitchLabelProps = {
    htmlFor: string;
    label: string;
    description?: string;
};
export const SwitchLabel = ({ htmlFor, label, description }: SwitchLabelProps) => {
    return (
        <div className="flex items-center gap-x-2">
            <Label htmlFor={htmlFor}>{label}</Label>
            {description && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info size={13} className="translate-y-[1px]" />
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                            {description}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    );
};
