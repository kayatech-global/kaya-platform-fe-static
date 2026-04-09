'use client';

import { Input, Switch, Label } from '@/components';
import { RadioChips } from '@/components/molecules/radio-chips/radio-chips';
import { cn } from '@/lib/utils';
import { IAgentForm, NotificationMode } from '@/models';
import { Bell, Radio, Webhook, Podcast } from 'lucide-react';
import { Control, Controller, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';

interface NotificationSectionProps {
    control: Control<IAgentForm>;
    watch: UseFormWatch<IAgentForm>;
    setValue: UseFormSetValue<IAgentForm>;
    errors?: FieldErrors<IAgentForm>;
    isReadOnly?: boolean;
}

const notificationModeOptions = [
    { value: 'streaming', label: 'Streaming' },
    { value: 'webhook', label: 'Webhook' },
    { value: 'both', label: 'Both' },
];

export const NotificationSection = ({ control, watch, setValue, errors, isReadOnly }: NotificationSectionProps) => {
    const notificationMode = watch('horizonConfig.notifications.mode') || 'streaming';
    const showWebhookConfig = notificationMode === 'webhook' || notificationMode === 'both';

    return (
        <div className="col-span-1 sm:col-span-2 border-2 border-solid border-gray-300 dark:border-gray-700 rounded-lg p-2 sm:p-4">
            <div className="flex flex-col gap-y-4">
                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-[10px]">
                        <Podcast size={20} absoluteStrokeWidth={false} className="stroke-[1px]" />
                        <p className="text-sm font-medium">Streaming & Webhook</p>
                    </div>
                    <p className="text-xs font-normal text-gray-400">
                        Configure how the agent communicates task progress and results.
                    </p>
                </div>

                {/* Notification Mode */}
                    <Controller
                        name="horizonConfig.notifications.mode"
                        control={control}
                        render={({ field }) => (
                            <RadioChips
                                value={field.value || 'streaming'}
                                onValueChange={(value) => field.onChange(value as NotificationMode)}
                                disabled={isReadOnly}
                                options={notificationModeOptions}
                            />
                        )}
                    />

                    {/* Mode Description */}
                    <div
                        className={cn(
                            'flex items-start gap-x-3 p-3 rounded-md border',
                            notificationMode === 'streaming'
                                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                : notificationMode === 'webhook'
                                ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                                : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        )}
                    >
                        {notificationMode === 'streaming' ? (
                            <>
                                <Radio size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div className="flex flex-col gap-y-0.5">
                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                        Streaming Mode
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400">
                                        Real-time updates via Server-Sent Events (SSE). Best for interactive
                                        applications.
                                    </p>
                                </div>
                            </>
                        ) : notificationMode === 'webhook' ? (
                            <>
                                <Webhook
                                    size={18}
                                    className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"
                                />
                                <div className="flex flex-col gap-y-0.5">
                                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                        Webhook Mode
                                    </p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                        Push notifications to your endpoint. Best for background processing.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <Bell size={18} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <div className="flex flex-col gap-y-0.5">
                                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Both Modes</p>
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        Streaming for real-time UI and webhooks for backend integration.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Streaming Enabled Toggle */}
                    {(notificationMode === 'streaming' || notificationMode === 'both') && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex flex-col">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable Streaming
                                </Label>
                                <p className="text-xs text-gray-400">Allow real-time event streaming</p>
                            </div>
                            <Controller
                                name="horizonConfig.notifications.streamingEnabled"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value ?? true}
                                        disabled={isReadOnly}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                        </div>
                    )}

                    {/* Webhook Configuration */}
                    {showWebhookConfig && (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-x-2 mb-4">
                                <Webhook size={16} className="text-gray-500" />
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Webhook Configuration
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Webhook URL */}
                                <div className="col-span-1 sm:col-span-2">
                                    <Controller
                                        name="horizonConfig.notifications.webhookUrl"
                                        control={control}
                                        rules={{
                                            pattern: {
                                                value: /^https?:\/\/.+/,
                                                message: 'Enter a valid URL',
                                            },
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                label="Webhook URL"
                                                placeholder="https://api.example.com/webhook"
                                                value={field.value || ''}
                                                disabled={isReadOnly}
                                                onChange={field.onChange}
                                                isDestructive={!!errors?.horizonConfig?.notifications?.webhookUrl}
                                                supportiveText={
                                                    errors?.horizonConfig?.notifications?.webhookUrl?.message
                                                }
                                            />
                                        )}
                                    />
                                </div>

                                {/* Retry Policy */}
                                <p className="col-span-1 sm:col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">
                                    Retry Policy
                                </p>

                                <Controller
                                    name="horizonConfig.notifications.webhookRetryPolicy.maxRetries"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label="Max Retries"
                                            type="number"
                                            min={0}
                                            max={10}
                                            placeholder="3"
                                            value={field.value ?? 3}
                                            disabled={isReadOnly}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        />
                                    )}
                                />

                                <Controller
                                    name="horizonConfig.notifications.webhookRetryPolicy.initialDelayMs"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label="Initial Delay (ms)"
                                            type="number"
                                            min={100}
                                            max={60000}
                                            placeholder="1000"
                                            value={field.value ?? 1000}
                                            disabled={isReadOnly}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1000)}
                                        />
                                    )}
                                />

                                <Controller
                                    name="horizonConfig.notifications.webhookRetryPolicy.maxDelayMs"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label="Max Delay (ms)"
                                            type="number"
                                            min={1000}
                                            max={300000}
                                            placeholder="30000"
                                            value={field.value ?? 30000}
                                            disabled={isReadOnly}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 30000)}
                                        />
                                    )}
                                />

                                <Controller
                                    name="horizonConfig.notifications.webhookRetryPolicy.backoffMultiplier"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label="Backoff Multiplier"
                                            type="number"
                                            min={1}
                                            max={5}
                                            step={0.1}
                                            placeholder="2"
                                            value={field.value ?? 2}
                                            disabled={isReadOnly}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 2)}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default NotificationSection;
