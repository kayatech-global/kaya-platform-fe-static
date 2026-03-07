import { Button, Textarea } from '@/components/atoms';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import React, { useEffect } from 'react';
import { useState } from 'react';

interface IPopupTextAreaProps {
    onChange: (value: string) => void;
    label: string;
    value: string;
}

export const PopupTextArea = ({ onChange, label, value }: IPopupTextAreaProps) => {
    const [open, setOpen] = useState(false);
    const [stateValue, setStateValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDone = () => {
        onChange(stateValue);
        setOpen(false);
    };

    const handleCancel = () => {
        setStateValue(value);
        onChange(value);
        setOpen(false);
    };

    useEffect(() => {
        setLoading(true);
        setStateValue(value);
        setLoading(false);
    }, [value]);

    return (
        <>
            <button
                className=" w-full text-xs text-left border bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-700 rounded h-7 px-[14px]"
                type="button"
                onClick={() => setOpen(true)}
            >
                {value ? (value.length > 15 ? value.slice(0, 15) + '...' : value) : label}
            </button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader className="px-3 py-2 space-y-3">
                        <DialogTitle className="text-sm font-[400]">Description</DialogTitle>
                        <DialogDescription className="flex flex-col gap-y-2">
                            {loading ? (
                                <div>Loading ....</div>
                            ) : (
                                <>
                                    <Textarea
                                        value={stateValue}
                                        rows={6}
                                        onChange={e => setStateValue(e.target.value)}
                                    />
                                    <div className="self-end flex justify-center gap-x-2">
                                        <Button size={'sm'} variant={'secondary'} onClick={handleCancel}>
                                            Cancel
                                        </Button>
                                        <Button size={'sm'} onClick={handleDone}>
                                            Done
                                        </Button>
                                    </div>
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
};
