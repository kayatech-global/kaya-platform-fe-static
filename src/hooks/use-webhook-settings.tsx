import { FetchError, logger } from '@/utils';
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Button } from '@/components';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { webhookService } from '@/services';

export interface Webhook {
    id: string;
    configurations: {
        url: string;
        headers: Array<{ key: string; value: string }>;
    };
    isActive: boolean;
    isDeleted: boolean;
    version: number;
    createdBy: number;
    isReadOnly: boolean;
}

export const useWebhookSettings = () => {
    const params = useParams();
    const workspaceId = params.wid as string;
    const ref = useRef<HTMLDivElement>(null);

    const [formUrl, setFormUrl] = useState('');
    const [formHeaders, setFormHeaders] = useState([{ key: '', value: '' }]);
    const [formIsActive, setFormIsActive] = useState(true);
    const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);

    const CopyUrl = ({ webhook }: { webhook: Webhook }) => {
        const [urlCopied, setUrlCopied] = useState<boolean>(false);

        const handleCopyUrl = (webhook: Webhook) => {
            navigator.clipboard.writeText(webhook?.configurations?.url);
            setUrlCopied(true);
            setTimeout(() => setUrlCopied(false), 2000);
        };

        return (
            <div className="relative inline-block">
                <Button size="icon" variant="link" onClick={() => handleCopyUrl(webhook)}>
                    <Copy className="w-4 h-4 text-gray-500 dark:text-gray-200" />
                </Button>

                {urlCopied && (
                    <div
                        className="absolute right-[-10px] transform -translate-x-1/2 bottom-[-5px] text-xs text-gray-200 bg-black p-2 rounded-md shadow-lg"
                        style={{ zIndex: 10 }}
                    >
                        Copied!
                    </div>
                )}
            </div>
        );
    };

    const {
        data: webhooks = [],
        isFetching: isFetchingWebhooks,
        refetch,
    } = useQuery(['webhooks', workspaceId], async () => [] as Webhook[], {
        enabled: !!workspaceId,
        refetchOnWindowFocus: false,
        onSuccess: (data: Webhook[]) => {
            return data;
        },
    });

    const { mutate: createWebhookMutation, isLoading: isCreating } = useMutation(
        (data: Partial<Webhook>) => webhookService.create<Partial<Webhook>>(data, workspaceId),
        {
            onSuccess: () => {
                toast.success('Webhook created successfully');
                refetch();
                resetForm();
            },
            onError: (error: FetchError) => {
                toast.error(error.message);
                logger.error('Create webhook error:', error.message);
            },
        }
    );

    const { mutate: updateWebhookMutation, isLoading: isUpdating } = useMutation(
        ({ id, data }: { id: string; data: Partial<Webhook> }) =>
            webhookService.update<Partial<Webhook>>(data, workspaceId, id),
        {
            onSuccess: () => {
                toast.success('Webhook updated successfully');
                refetch();
                resetForm();
            },
            onError: (error: FetchError) => {
                toast.error(error.message);
                logger.error('Update webhook error:', error.message);
            },
        }
    );

    const { mutate: deleteWebhookMutation, isLoading: isDeleting } = useMutation(
        (id: string) => webhookService.delete(id, workspaceId),
        {
            onSuccess: () => {
                toast.success('Webhook deleted successfully');
                resetForm();
                refetch();
            },
            onError: (error: FetchError) => {
                toast.error(error.message);
                logger.error('Delete webhook error:', error.message);
            },
        }
    );

    const addWebhook = () => {
        if (!formUrl || !isValidUrl(formUrl)) {
            toast.error('Please enter a valid URL');
            return;
        }

        createWebhookMutation({
            configurations: { url: formUrl, headers: formHeaders },
            isActive: formIsActive,
        });
    };

    const updateWebhookHandler = () => {
        if (!editingWebhook) return;

        updateWebhookMutation({
            id: editingWebhook.id,
            data: {
                configurations: { url: formUrl, headers: formHeaders },
                isActive: formIsActive,
            },
        });
    };

    const deleteWebhookHandler = (id: string) => {
        deleteWebhookMutation(id);
    };

    const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
        const updated = [...formHeaders];
        updated[index][field] = value;
        setFormHeaders(updated);
    };

    const addHeaderField = () => {
        setFormHeaders([...formHeaders, { key: '', value: '' }]);
    };

    const removeHeaderField = (index: number) => {
        setFormHeaders(formHeaders.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setFormUrl('');
        setFormHeaders([{ key: '', value: '' }]);
        setFormIsActive(true);
        setEditingWebhook(null);
    };

    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const scrollToTop = () => {
        if (ref.current) {
            ref.current.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    };

    return {
        // Webhook list
        ref,
        webhooks,
        isFetchingWebhooks,

        // Form state
        formUrl,
        setFormUrl,
        formHeaders,
        setFormHeaders,
        formIsActive,
        setFormIsActive,
        editingWebhook,
        setEditingWebhook,

        // CRUD operations
        addWebhook,
        updateWebhook: updateWebhookHandler,
        deleteWebhook: deleteWebhookHandler,

        // Headers manipulation
        handleHeaderChange,
        addHeaderField,
        removeHeaderField,
        resetForm,

        // Utils
        isValidUrl,
        scrollToTop,
        isCreating,
        isUpdating,
        isDeleting,

        CopyUrl,
    };
};
