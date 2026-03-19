'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
    DialogDescription,
} from '@/components/atoms/dialog';
import { Button } from '@/components';
import { Input } from '@/components/atoms/input';
import { Wallet } from 'lucide-react';

// Types
interface CreditBudgetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string | number;
    workspaceName?: string;
    totalAvailableCredits: number;
    currentAllocatedBudget?: number;
    onSave: (workspaceId: string | number, allocatedBudget: number) => void;
}

// Allocate Credit Budget Dialog
export const ResourceQuotasDialog: React.FC<CreditBudgetDialogProps> = ({
    open,
    onOpenChange,
    workspaceId,
    workspaceName,
    totalAvailableCredits,
    currentAllocatedBudget = 0,
    onSave,
}) => {
    const [allocatedBudget, setAllocatedBudget] = useState<string>(currentAllocatedBudget.toString());
    const [error, setError] = useState<string>('');

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setAllocatedBudget(currentAllocatedBudget.toString());
            setError('');
        }
    }, [open, currentAllocatedBudget]);

    const handleBudgetChange = (value: string) => {
        setAllocatedBudget(value);
        const numValue = parseInt(value, 10);
        
        if (isNaN(numValue)) {
            setError('');
        } else if (numValue < 0) {
            setError('Budget cannot be negative');
        } else if (numValue > totalAvailableCredits) {
            setError(`Budget cannot exceed available credits (${totalAvailableCredits.toLocaleString()})`);
        } else {
            setError('');
        }
    };

    const handleSave = () => {
        const numValue = parseInt(allocatedBudget, 10);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= totalAvailableCredits) {
            onSave(workspaceId, numValue);
            onOpenChange(false);
        }
    };

    const numericBudget = parseInt(allocatedBudget, 10) || 0;
    const isValid = !error && numericBudget >= 0 && numericBudget <= totalAvailableCredits;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-green-600" />
                        Allocate Credit Budget
                    </DialogTitle>
                    <DialogDescription>
                        Allocate credits for {workspaceName || 'this workspace'}
                    </DialogDescription>
                </DialogHeader>
                <DialogBody className="space-y-6 py-4">
                    {/* Total Available Credits */}
                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Available Credits</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Organization-wide credit balance</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-green-600">{totalAvailableCredits.toLocaleString()}</span>
                                <span className="text-sm text-gray-500 ml-1">credits</span>
                            </div>
                        </div>
                    </div>

                    {/* Allocate Budget Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-100 block">
                            Budget to Allocate
                        </label>
                        <Input
                            type="number"
                            placeholder="Enter credit amount"
                            value={allocatedBudget}
                            onChange={(e) => handleBudgetChange(e.target.value)}
                            min={0}
                            max={totalAvailableCredits}
                            className="w-full text-lg"
                        />
                        {error && (
                            <p className="text-xs text-red-500">{error}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Enter a value between 0 and {totalAvailableCredits.toLocaleString()} credits
                        </p>
                    </div>

                    {/* Preview */}
                    {isValid && numericBudget > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Allocated Budget</p>
                                <p className="text-lg font-semibold text-blue-600">{numericBudget.toLocaleString()}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Remaining Budget</p>
                                <p className="text-lg font-semibold text-green-600">{(totalAvailableCredits - numericBudget).toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={handleSave}
                        disabled={!isValid}
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
