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

// Purple Slider Component
const PurpleSlider: React.FC<{
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
}> = ({ value, min, max, onChange }) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="relative w-32 h-2">
            <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div
                className="absolute inset-y-0 left-0 rounded-full bg-purple-600"
                style={{ width: `${percentage}%` }}
            />
            <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-purple-600 shadow-sm cursor-pointer"
                style={{ left: `calc(${percentage}% - 8px)` }}
            />
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>
    );
};

// Types
interface CreditBudgetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string | number;
    workspaceName?: string;
    totalAvailableCredits: number;
    currentAllocatedBudget?: number;
    onSave: (workspaceId: string | number, allocatedBudget: number, config?: {
        maxCreditsPerExecution: number;
        graceCredits: number;
        warningThreshold: number;
        criticalThreshold: number;
    }) => void;
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
    
    // Execution Limits
    const [maxCreditsPerExecution, setMaxCreditsPerExecution] = useState<string>('50000');
    const [graceCredits, setGraceCredits] = useState<string>('5000');
    
    // Alert Configuration
    const [warningThreshold, setWarningThreshold] = useState<number>(80);
    const [criticalThreshold, setCriticalThreshold] = useState<number>(95);

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setAllocatedBudget(currentAllocatedBudget.toString());
            setError('');
            setMaxCreditsPerExecution('50000');
            setGraceCredits('5000');
            setWarningThreshold(80);
            setCriticalThreshold(95);
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
            onSave(workspaceId, numValue, {
                maxCreditsPerExecution: parseInt(maxCreditsPerExecution, 10) || 50000,
                graceCredits: parseInt(graceCredits, 10) || 5000,
                warningThreshold,
                criticalThreshold,
            });
            onOpenChange(false);
        }
    };

    const numericBudget = parseInt(allocatedBudget, 10) || 0;
    const isValid = !error && numericBudget >= 0 && numericBudget <= totalAvailableCredits;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader className="pb-2">
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <Wallet className="h-4 w-4 text-green-600" />
                        Allocate Credit Budget
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Allocate credits for {workspaceName || 'this workspace'}
                    </DialogDescription>
                </DialogHeader>
                <DialogBody className="space-y-3 py-2 overflow-y-auto flex-1">
                    {/* Total Available Credits */}
                    <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100">Total Available Credits</h4>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">Organization-wide credit balance</p>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-bold text-green-600">{totalAvailableCredits.toLocaleString()}</span>
                                <span className="text-xs text-gray-500 ml-1">credits</span>
                            </div>
                        </div>
                    </div>

                    {/* Allocate Budget Input */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-100 block">
                            Budget to Allocate
                        </label>
                        <Input
                            type="number"
                            placeholder="Enter credit amount"
                            value={allocatedBudget}
                            onChange={(e) => handleBudgetChange(e.target.value)}
                            min={0}
                            max={totalAvailableCredits}
                            className="w-full text-sm h-9"
                        />
                        {error && (
                            <p className="text-[10px] text-red-500">{error}</p>
                        )}
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            Enter a value between 0 and {totalAvailableCredits.toLocaleString()} credits
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-700" />

                    {/* Execution Limits Section */}
                    <div className="space-y-2">
                        <h3 className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Execution Limits
                        </h3>
                        
                        {/* Max Credits per Execution */}
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-xs text-gray-700 dark:text-gray-300">Max Credits per Execution</span>
                            <Input
                                type="number"
                                value={maxCreditsPerExecution}
                                onChange={(e) => setMaxCreditsPerExecution(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-24 text-right text-xs h-8"
                                min={0}
                            />
                        </div>

                        {/* Grace Credits */}
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-xs text-gray-700 dark:text-gray-300">Grace Credits</span>
                            <Input
                                type="number"
                                value={graceCredits}
                                onChange={(e) => setGraceCredits(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-24 text-right text-xs h-8"
                                min={0}
                            />
                        </div>
                    </div>

                    {/* Alert Configuration Section */}
                    <div className="space-y-2">
                        <h3 className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Alert Configuration
                        </h3>

                        {/* Budget Warning Threshold */}
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-xs text-gray-700 dark:text-gray-300">Budget Warning Threshold (%)</span>
                            <div className="flex items-center gap-2">
                                <PurpleSlider
                                    value={warningThreshold}
                                    min={50}
                                    max={90}
                                    onChange={setWarningThreshold}
                                />
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 w-8 text-right">
                                    {warningThreshold}%
                                </span>
                            </div>
                        </div>

                        {/* Critical Alert Threshold */}
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-xs text-gray-700 dark:text-gray-300">Critical Alert Threshold (%)</span>
                            <div className="flex items-center gap-2">
                                <PurpleSlider
                                    value={criticalThreshold}
                                    min={80}
                                    max={100}
                                    onChange={setCriticalThreshold}
                                />
                                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 w-8 text-right">
                                    {criticalThreshold}%
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogBody>
                <DialogFooter className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={handleSave}
                        disabled={!isValid}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        Save Configuration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
