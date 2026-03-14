'use client';

import { FC } from 'react';
import { Bot, X, Trash2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/atoms/tooltip';
import { SheetHeader, SheetTitle, SheetDescription } from '@/components/atoms/sheet';
import { AssistantContext } from '@/models/ai-assistant.model';
import { cn } from '@/lib/utils';

interface AssistantHeaderProps {
    context: AssistantContext | null;
    contextLabel: string;
    validationSummary: {
        errorCount: number;
        warningCount: number;
        hasBlockingIssues: boolean;
    };
    onClose: () => void;
    onClear: () => void;
    onRefresh?: () => void;
    isLoading?: boolean;
}

/**
 * Header component for the AI assistant panel
 */
export const AssistantHeader: FC<AssistantHeaderProps> = ({
    context,
    contextLabel,
    validationSummary,
    onClose,
    onClear,
    onRefresh,
    isLoading = false,
}) => {
    const getLevelIcon = () => {
        switch (context?.level) {
            case 'enterprise':
                return 'ri-building-4-line';
            case 'workspace':
                return 'ri-folder-2-line';
            case 'workflow':
                return 'ri-flow-chart';
            case 'execution':
                return 'ri-play-circle-line';
            default:
                return 'ri-home-line';
        }
    };

    return (
        <SheetHeader className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <SheetTitle className="text-white font-semibold text-base">
                            KAYA Assistant
                        </SheetTitle>
                        <SheetDescription className="text-white/80 text-xs mt-0.5 flex items-center gap-1.5">
                            <i className={cn(getLevelIcon(), 'text-sm')} />
                            {contextLabel}
                        </SheetDescription>
                    </div>
                </div>
                
                <div className="flex items-center gap-1">
                    {/* Validation status badges */}
                    {validationSummary.errorCount > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge 
                                    variant="destructive"
                                    className="bg-red-500/90 text-white border-0 text-xs"
                                >
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {validationSummary.errorCount}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                {validationSummary.errorCount} configuration error{validationSummary.errorCount !== 1 ? 's' : ''}
                            </TooltipContent>
                        </Tooltip>
                    )}
                    
                    {validationSummary.warningCount > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge 
                                    variant="warning"
                                    className="bg-amber-500/90 text-white border-0 text-xs"
                                >
                                    {validationSummary.warningCount}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                {validationSummary.warningCount} warning{validationSummary.warningCount !== 1 ? 's' : ''}
                            </TooltipContent>
                        </Tooltip>
                    )}
                    
                    {!validationSummary.hasBlockingIssues && validationSummary.errorCount === 0 && context?.level === 'workflow' && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge 
                                    variant="success"
                                    className="bg-green-500/90 text-white border-0 text-xs"
                                >
                                    <CheckCircle className="h-3 w-3" />
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                No configuration issues
                            </TooltipContent>
                        </Tooltip>
                    )}
                    
                    {/* Action buttons */}
                    {onRefresh && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onRefresh}
                                    disabled={isLoading}
                                    className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                                >
                                    <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Refresh validation</TooltipContent>
                        </Tooltip>
                    )}
                    
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClear}
                                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Clear conversation</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Close assistant</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </SheetHeader>
    );
};

export default AssistantHeader;
