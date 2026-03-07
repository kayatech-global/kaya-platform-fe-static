import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle } from '@/components/atoms/dialog';
import { Button, Input, Select, VaultSelector } from '@/components';
import { ConfigType } from '@/enums/config-type';
import { useApiConfiguration } from '@/hooks/use-api-configuration';
import { AuthorizationType } from '@/enums';
import { PromptIntellisensePicker } from './prompt-intellisense-picker';
import { useIntellisenseData } from '@/hooks/use-intelligence-source';
import { useAuth } from '@/context';
import { useParams } from 'next/navigation';


interface ConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: (configType: string, newValue: string) => void; // Updated to accept values
    setOpenNewModal: Dispatch<SetStateAction<boolean>>;
    accordian_header?: string | null;
    currentValue?: string; //  // Add current value for editing
}

export const ConfigDialog: React.FC<ConfigDialogProps> = ({
    open,
    onOpenChange,
    onSave,
    setOpenNewModal,
    accordian_header,
    currentValue, // Receive current value
}) => {
    const { secrets, refetch, errors, loadingSecrets } = useApiConfiguration();
    const [apiUrl, setApiUrl] = useState('');
    const [mcpAuthType, setMcpAuthType] = useState<string>('');
    const [vaultValue, setVaultValue] = useState<string>('');
    const [testPrompt, setTestPrompt] = useState<string>(
        'abc test {{Agent:Reusable Agent 01}} {{API:GitHub API}} {{Variable:x_name}} {{VectorRAG:Rag 01}} {{Variable:x_age}} pass'
    );
   

    const params = useParams();
    const { token } = useAuth();
    const workspaceId = params.wid as string;
    const { data: intellisenseData } = useIntellisenseData(workspaceId, token ?? null);

    // Initialize form with current value when dialog opens
    useEffect(() => {
        if (open && currentValue !== undefined) {
            if (accordian_header === ConfigType.Prompt) {
                setTestPrompt(currentValue as string);
            } else if (accordian_header === ConfigType.API) {
                setApiUrl(currentValue as string);
            } else if (accordian_header === ConfigType.IntelligenceSource) {
                setVaultValue(currentValue as string);
            } else if (accordian_header === ConfigType.MCP) {
                setMcpAuthType(currentValue as string);
            }
        }
    }, [open, currentValue, accordian_header]);

    const onSetPrompt = (value: string) => {
        setTestPrompt(value);
    };

    const handleSave = () => {
        let newValue: string;

        switch (accordian_header) {
            case ConfigType.Prompt:
                newValue = testPrompt;
                break;
            case ConfigType.API:
                newValue = apiUrl;
                break;
            case ConfigType.IntelligenceSource:
                newValue = vaultValue;
                break;
            case ConfigType.MCP:
                newValue = mcpAuthType;
                break;
            default:
                newValue = '';
        }

        // Pass both the config type and the new value to parent
        if (accordian_header && newValue !== '') {
            onSave?.(accordian_header, newValue);
        }
        
        setOpenNewModal(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configure {accordian_header}</DialogTitle>
                </DialogHeader>
                <DialogBody>
                    {accordian_header === ConfigType.IntelligenceSource && (
                        <div className="space-y-4">
                            <VaultSelector
                                label="Vault Key"
                                placeholder={secrets.length > 0 ? 'Select vault key' : 'No vault key found'}
                                disabled={secrets.length === 0}
                                options={secrets}
                                currentValue={vaultValue}
                                onChange={(e) => setVaultValue(e.target.value)}
                                isDestructive={!!errors?.authorization?.meta?.token?.message}
                                supportiveText={errors?.authorization?.meta?.token?.message}
                                loadingSecrets={loadingSecrets}
                                onRefetch={() => refetch()}
                            />
                        </div>
                    )}
                    {accordian_header === ConfigType.API && (
                        <div className="space-y-4">
                            <Input
                                placeholder="Enter your API URL"
                                label="API URL"
                                value={apiUrl}
                                onChange={e => setApiUrl(e.target.value)}
                                isDestructive={!!errors?.apiUrl?.message}
                                supportiveText={errors?.apiUrl?.message}
                            />
                        </div>
                    )}
                    {accordian_header === ConfigType.MCP && (
                        <div className="space-y-4">
                            <Select
                                placeholder="Select your authorization"
                                options={[
                                    { value: AuthorizationType.NoAuthorization, name: 'No Authorization' },
                                    { value: AuthorizationType.BasicAuth, name: 'Basic Auth' },
                                    { value: AuthorizationType.BearerToken, name: 'Bearer Token' },
                                    { value: AuthorizationType.APIKey, name: 'API Key' },
                                    { value: AuthorizationType.SSO, name: 'Single Sign-On' },
                                ]}
                                label="Authorization Type"
                                currentValue={mcpAuthType}
                                onChange={(e) => setMcpAuthType(e.target.value)}
                                isDestructive={!!errors?.authorization?.authType?.message}
                                supportiveText={errors?.authorization?.authType?.message}
                            />
                        </div>
                    )}
                    {accordian_header === ConfigType.Prompt && (
                        <div className="bg-gray-50 border border-blue-600 p-4 rounded-lg min-h-[300px]">
                         
                                <PromptIntellisensePicker
                                        prompt={testPrompt}
                                        allIntellisenseTest={intellisenseData}
                                        onSetPrompt={onSetPrompt}
                                />
                         
                           
                        </div>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setOpenNewModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Save Configuration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
