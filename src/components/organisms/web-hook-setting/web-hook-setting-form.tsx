import {
    Button,
    Input,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { Switch } from '@/components/atoms/switch';
import { useWebhookSettings, Webhook } from '@/hooks/use-webhook-settings';
import { truncate } from 'lodash';
import { LoaderCircle, Network, Plus, Trash, Trash2, Pencil, Loader2, X } from 'lucide-react';
import { useState } from 'react';

interface WebHookSettingFormProps {
    isOpen: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const WebHookSettingForm = (props: WebHookSettingFormProps) => {
    const { isOpen, setOpen } = props;
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const {
        ref,
        webhooks,
        isFetchingWebhooks,
        formUrl,
        setFormUrl,
        formHeaders,
        setFormHeaders,
        formIsActive,
        setFormIsActive,
        editingWebhook,
        setEditingWebhook,
        addWebhook,
        updateWebhook,
        deleteWebhook,
        handleHeaderChange,
        addHeaderField,
        removeHeaderField,
        isValidUrl,
        resetForm,
        scrollToTop,
        isCreating,
        isUpdating,
        isDeleting,
        CopyUrl,
    } = useWebhookSettings();

    const handleSubmit = editingWebhook ? updateWebhook : addWebhook;
    const isSubmitting = isCreating || isUpdating || isDeleting;

    const handleModelClose = () => {
        setOpen(!isOpen);
        resetForm();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleModelClose}>
            <DialogContent ref={ref} className="max-w-[unset] w-[580px] overflow-y-auto">
                <DialogHeader className="px-0">
                    <DialogTitle asChild>
                        <div className="px-4 flex gap-2">
                            <Network />
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                Webhook Configurations
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <DialogDescription asChild>
                    <div className="px-4 flex flex-col gap-y-4 h-[351px]">
                        {isFetchingWebhooks ? (
                            <div className="w-full flex flex-col items-center justify-center py-4 h-full">
                                <LoaderCircle className="animate-spin" size={25} />
                                <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                    Loading webhook configurations...
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-y-4 sm:gap-4">
                                {editingWebhook && (
                                    <button className="flex justify-end">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <X
                                                        className="h-4 w-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
                                                        onClick={resetForm}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent side="left" align="center">
                                                    Close form
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </button>
                                )}
                                {/* URL input */}
                                <div className="space-y-1">
                                    <Input
                                        placeholder="Webhook URL"
                                        value={formUrl}
                                        onChange={e => setFormUrl(e.target.value)}
                                        className={`my-0 py-0 ${
                                            !isValidUrl(formUrl) && formUrl ? 'border-red-500' : ''
                                        }`}
                                    />
                                    {!isValidUrl(formUrl) && formUrl && (
                                        <p className="text-red-500 py-0 text-xs ms-1 my-0">Please enter a valid URL</p>
                                    )}

                                    {/* Headers */}
                                    <div className="flex flex-col mb-5">
                                        <div className="mb-2">
                                            {formHeaders.map((header, i) => (
                                                <div className="flex gap-2 my-2 items-center" key={header.key ? `header-${header.key}` : `header-${i}`}>
                                                    <Input
                                                        placeholder="Key"
                                                        value={header.key}
                                                        onChange={e => handleHeaderChange(i, 'key', e.target.value)}
                                                    />
                                                    <Input
                                                        placeholder="Value"
                                                        value={header.value}
                                                        onChange={e => handleHeaderChange(i, 'value', e.target.value)}
                                                    />
                                                    <Button onClick={() => removeHeaderField(i)} variant="link">
                                                        <Trash className="text-gray-500 dark:text-gray-200" size={20} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    className="bg-gray-500 dark:bg-gray-200"
                                                    checked={formIsActive}
                                                    onCheckedChange={setFormIsActive}
                                                />
                                                <span className={formIsActive ? 'text-green-600' : 'text-red-600'}>
                                                    {formIsActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>

                                            <Button onClick={addHeaderField} variant="link" className="self-end">
                                                Add Header
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Submit button */}
                                    <div className="mt-5">
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={!isValidUrl(formUrl) || isSubmitting}
                                            loading={isCreating || isUpdating}
                                            variant="primary"
                                            className="my-5"
                                        >
                                            {editingWebhook ? (
                                                <>
                                                    <Pencil className="mr-2" size={16} />
                                                    Update Webhook
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="mr-2" size={16} />
                                                    Add Webhook
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <hr className="my-5 border-t border-black dark:border-white" />
                                </div>

                                {/* Webhook list */}
                                <div>
                                    <Table>
                                        <TableBody>
                                            {webhooks.map((webhook: Webhook) => (
                                                <TableRow key={webhook.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className={`w-2.5 h-2.5 rounded-full ${
                                                                    webhook.isActive ? 'bg-green-500' : 'bg-red-500'
                                                                }`}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell
                                                        className="break-words max-w-xs"
                                                        {...(webhook?.configurations?.url?.length > 60 && {
                                                            title: webhook.configurations.url,
                                                        })}
                                                    >
                                                        {truncate(webhook.configurations.url, { length: 60 })}
                                                    </TableCell>
                                                    <TableCell className="flex items-center">
                                                        <CopyUrl webhook={webhook} />
                                                        <Button
                                                            variant="link"
                                                            size="icon"
                                                            onClick={() => {
                                                                setFormUrl(webhook.configurations.url);
                                                                setFormHeaders(webhook.configurations.headers);
                                                                setFormIsActive(webhook.isActive);
                                                                setEditingWebhook(webhook);
                                                                scrollToTop();
                                                            }}
                                                        >
                                                            <Pencil className="w-4 h-4 mx-3 text-gray-500 dark:text-gray-200" />
                                                        </Button>
                                                        <Button
                                                            disabled={isDeleting}
                                                            variant="link"
                                                            size="icon"
                                                            onClick={() => {
                                                                deleteWebhook(webhook.id);
                                                                setDeletingId(webhook.id);
                                                            }}
                                                        >
                                                            {webhook.id == deletingId && isDeleting ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-200" />
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};

export default WebHookSettingForm;
