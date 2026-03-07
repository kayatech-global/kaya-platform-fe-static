import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/atoms/dialog';
import { Button, Input, Select, OptionModel } from '@/components';
import { VaultSelector } from '@/components/atoms/vault-selector';
import React, { useState } from 'react';
import { WorkflowSource } from '../../data-generation';

interface ExternalWorkflowParamsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ExternalWorkflowParamsModal = ({ isOpen, onClose }: ExternalWorkflowParamsModalProps) => {
    const [source, setSource] = useState<WorkflowSource>(WorkflowSource.Custom);

    // Mock vault options for UI demonstration
    const vaultOptions: OptionModel[] = [
        { name: 'My Secret Key', value: 'secret-1' },
        { name: 'AWS Access Key', value: 'secret-2' },
        { name: 'Production API Key', value: 'secret-3' },
    ];

    const handleRefetch = () => {
        console.log('Refetching vault secrets...');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] flex flex-col gap-0 p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>External Workflow Configuration</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Source Selection */}
                    <div className="space-y-2">
                        <Select
                            label="Source"
                            options={[
                                { name: 'Custom HTTP Endpoint', value: WorkflowSource.Custom },
                                { name: 'AWS Bedrock Agent', value: WorkflowSource.AwsBedrock },
                            ]}
                            currentValue={source}
                            onChange={e => setSource(e.target.value as WorkflowSource)}
                            placeholder="Select a source"
                        />
                    </div>

                    {/* Dynamic Fields based on Source */}
                    {source === WorkflowSource.Custom && (
                        <div className="space-y-4 border rounded-lg p-4 bg-gray-50/50">
                            <h4 className="text-sm font-medium text-gray-900">Endpoint Details</h4>
                            <Input label="Endpoint URL" placeholder="https://api.example.com/v1/run" />
                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    label="Method"
                                    options={[
                                        { name: 'POST', value: 'POST' },
                                        { name: 'GET', value: 'GET' },
                                    ]}
                                    placeholder="Select Method"
                                    currentValue="POST"
                                />
                                <Input label="Auth Header Key" placeholder="Authorization" />
                            </div>
                            <VaultSelector
                                label="Auth Header Value (Secret)"
                                placeholder="Select a secret for the token"
                                options={vaultOptions}
                                onRefetch={handleRefetch}
                            />
                        </div>
                    )}

                    {source === WorkflowSource.AwsBedrock && (
                        <div className="space-y-4 border rounded-lg p-4 bg-gray-50/50">
                            <h4 className="text-sm font-medium text-gray-900">Bedrock Agent Details</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Region" placeholder="us-east-1" />
                                <Input label="Agent ID" placeholder="e.g. AGENT12345" />
                            </div>
                            <Input label="Agent Alias ID" placeholder="e.g. TSTALIASID" />

                            <div className="space-y-4 pt-2">
                                <h4 className="text-sm font-medium text-gray-900">Credentials</h4>
                                <VaultSelector
                                    label="Access Key ID"
                                    placeholder="Select Access Key Secret"
                                    options={vaultOptions}
                                    onRefetch={handleRefetch}
                                />
                                <VaultSelector
                                    label="Secret Access Key"
                                    placeholder="Select Secret Access Key"
                                    options={vaultOptions}
                                    onRefetch={handleRefetch}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-gray-50">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onClose}>Save Configuration</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
