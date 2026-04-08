'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Button,
    Badge,
} from '@/components';
import { cn } from '@/lib/utils';
import { IAgentForm, IHorizonValidationResult } from '@/models';
import { Rocket, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { UseFormWatch } from 'react-hook-form';

interface PublishDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    watch: UseFormWatch<IAgentForm>;
    onPublish: () => void;
    isPublishing?: boolean;
    workspaceName?: string;
}

export const validateHorizonConfig = (form: IAgentForm): IHorizonValidationResult => {
    const errors: { field: string; message: string }[] = [];

    // Identity validation
    if (!form.horizonConfig?.identity?.displayName?.trim()) {
        errors.push({ field: 'identity.displayName', message: 'Display name is required' });
    }
    if (!form.horizonConfig?.identity?.version?.trim()) {
        errors.push({ field: 'identity.version', message: 'Version is required' });
    } else if (!/^\d+\.\d+\.\d+$/.test(form.horizonConfig.identity.version)) {
        errors.push({ field: 'identity.version', message: 'Version must be in semantic format (e.g., 1.0.0)' });
    }

    // Skills validation
    if (!form.horizonConfig?.skills || form.horizonConfig.skills.length === 0) {
        errors.push({ field: 'skills', message: 'At least one skill is required' });
    } else {
        form.horizonConfig.skills.forEach((skill, index) => {
            if (!skill.name?.trim()) {
                errors.push({ field: `skills[${index}].name`, message: `Skill ${index + 1} name is required` });
            }
        });
    }

    // Webhook URL validation if webhook mode is selected
    const notificationMode = form.horizonConfig?.notifications?.mode;
    if (notificationMode === 'webhook' || notificationMode === 'both') {
        if (!form.horizonConfig?.notifications?.webhookUrl?.trim()) {
            errors.push({ field: 'notifications.webhookUrl', message: 'Webhook URL is required for webhook mode' });
        } else if (!/^https?:\/\/.+/.test(form.horizonConfig.notifications.webhookUrl)) {
            errors.push({ field: 'notifications.webhookUrl', message: 'Webhook URL must be a valid URL' });
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

export const PublishDialog = ({
    open,
    onOpenChange,
    watch,
    onPublish,
    isPublishing,
    workspaceName,
}: PublishDialogProps) => {
    const formData = {
        horizonConfig: watch('horizonConfig'),
        agentName: watch('agentName'),
        agentDescription: watch('agentDescription'),
    } as IAgentForm;

    const validation = validateHorizonConfig(formData);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-x-2">
                        <Rocket size={20} className="text-blue-600" />
                        Publish Horizon Agent
                    </DialogTitle>
                    <DialogDescription>
                        Publishing will make this agent available at your workspace endpoint.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* Validation Status */}
                    <div
                        className={cn(
                            'p-4 rounded-lg border',
                            validation.isValid
                                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                        )}
                    >
                        <div className="flex items-start gap-x-3">
                            {validation.isValid ? (
                                <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 mt-0.5" />
                            ) : (
                                <AlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <p
                                    className={cn(
                                        'text-sm font-medium',
                                        validation.isValid
                                            ? 'text-green-700 dark:text-green-300'
                                            : 'text-red-700 dark:text-red-300'
                                    )}
                                >
                                    {validation.isValid ? 'Ready to Publish' : 'Validation Failed'}
                                </p>
                                {!validation.isValid && (
                                    <ul className="mt-2 space-y-1">
                                        {validation.errors.map((error, index) => (
                                            <li key={index} className="text-xs text-red-600 dark:text-red-400">
                                                • {error.message}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Publish Summary */}
                    {validation.isValid && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                            <div className="flex items-center gap-x-2">
                                <Info size={16} className="text-gray-500" />
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Publish Summary</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-gray-500">Agent Name:</div>
                                <div className="text-gray-700 dark:text-gray-300 font-medium">
                                    {formData.agentName || 'Untitled'}
                                </div>

                                <div className="text-gray-500">Display Name:</div>
                                <div className="text-gray-700 dark:text-gray-300 font-medium">
                                    {formData.horizonConfig?.identity?.displayName || 'N/A'}
                                </div>

                                <div className="text-gray-500">Version:</div>
                                <div className="text-gray-700 dark:text-gray-300 font-medium">
                                    <Badge variant="secondary">{formData.horizonConfig?.identity?.version || '1.0.0'}</Badge>
                                </div>

                                <div className="text-gray-500">Skills:</div>
                                <div className="text-gray-700 dark:text-gray-300 font-medium">
                                    {formData.horizonConfig?.skills?.length || 0} skill(s)
                                </div>

                                <div className="text-gray-500">Environment:</div>
                                <div className="text-gray-700 dark:text-gray-300 font-medium capitalize">
                                    {formData.horizonConfig?.deploy?.environment || 'dev'}
                                </div>

                                {workspaceName && (
                                    <>
                                        <div className="text-gray-500">Workspace:</div>
                                        <div className="text-gray-700 dark:text-gray-300 font-medium">
                                            {workspaceName}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Warning */}
                    <div className="flex items-start gap-x-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            Publishing will make this agent available for invocation. Ensure all configurations are
                            correct before proceeding.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isPublishing}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onPublish}
                        disabled={!validation.isValid || isPublishing}
                        loading={isPublishing}
                    >
                        <Rocket size={16} className="mr-1" />
                        {isPublishing ? 'Publishing...' : 'Publish'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PublishDialog;
