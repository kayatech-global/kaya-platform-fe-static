'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, SelectableRadioItem } from '@/components'; // Adjust as needed
import { ChevronDown, CirclePlay, FileX, Volume2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { SelectableType } from '@/enums';

interface Voice {
    id: string;
    name: string;
    description: string;
}

interface VoiceSelectorProps {
    selectedVoice: Voice | undefined;
    setSelectedVoice: React.Dispatch<React.SetStateAction<Voice | undefined>>;
    voices: Voice[];
    isReadonly?: boolean;
    onVoiceChange?: (voice: Voice | undefined) => void;
}

interface AddVoiceModalContentProps {
    readonly isCreatingVoice: boolean;
    readonly isReadonly?: boolean;
    readonly newVoiceName: string;
    readonly newVoiceDescription: string;
    readonly searchTerm: string;
    readonly checkedVoiceId?: string;
    readonly filteredVoices: ReadonlyArray<Voice>;
    readonly onNewVoiceNameChange: (v: string) => void;
    readonly onNewVoiceDescriptionChange: (v: string) => void;
    readonly onSearchChange: (v: string) => void;
    readonly onCheckedVoiceChange: (id: string) => void;
    readonly onEditVoice: (id: string) => void;
    readonly onNewVoiceTemplate: () => void;
}

function AddVoiceModalContent({
    isCreatingVoice,
    isReadonly,
    newVoiceName,
    newVoiceDescription,
    searchTerm,
    checkedVoiceId,
    filteredVoices,
    onNewVoiceNameChange,
    onNewVoiceDescriptionChange,
    onSearchChange,
    onCheckedVoiceChange,
    onEditVoice,
    onNewVoiceTemplate,
}: AddVoiceModalContentProps) {
    const showCreateForm = isCreatingVoice;
    const showSearchList = !showCreateForm;
    return (
        <div className="px-4 flex flex-col gap-y-4 h-[351px]">
            {showSearchList && (
                <div className="flex justify-end">
                    <Button variant="link" disabled={isReadonly} onClick={onNewVoiceTemplate}>
                        New Voice Template
                    </Button>
                </div>
            )}
            {showCreateForm ? (
                <div className="flex flex-col gap-y-2">
                    <Input
                        placeholder="Voice Name"
                        value={newVoiceName}
                        onChange={e => onNewVoiceNameChange(e.target.value)}
                    />
                    <Input
                        placeholder="Voice Description"
                        value={newVoiceDescription}
                        onChange={e => onNewVoiceDescriptionChange(e.target.value)}
                    />
                </div>
            ) : (
                <>
                    <Input
                        className="w-full"
                        placeholder="Search voices"
                        onChange={e => onSearchChange(e.target.value.toLowerCase())}
                    />
                    {filteredVoices.length > 0 ? (
                        <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                            {filteredVoices.map(voice => (
                                <SelectableRadioItem
                                    key={`${voice.id}-${checkedVoiceId ?? 'none'}`}
                                    id={voice.id}
                                    title="Voice"
                                    label={voice.name}
                                    description={voice.description}
                                    isChecked={checkedVoiceId === voice.id}
                                    imagePath={<CirclePlay size={30} />}
                                    imageType="component"
                                    expandDetails={voice.description}
                                    expandTriggerName="Show Voice"
                                    handleClick={() => onCheckedVoiceChange(voice.id)}
                                    onEdit={() => onEditVoice(voice.id)}
                                    type={SelectableType.PROMPT}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center justify-center gap-y-1 py-4 h-full">
                            <FileX className="text-gray-500 dark:text-gray-300" />
                            <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                {searchTerm === ''
                                    ? 'No voices have been configured'
                                    : 'No results found'}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export const VoiceSelector = ({
    selectedVoice,
    setSelectedVoice,
    voices,
    isReadonly,
    onVoiceChange,
}: VoiceSelectorProps) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const [isCreatingVoice, setIsCreatingVoice] = useState(false);
    const [isEditingVoice, setIsEditingVoice] = useState(false);
    const [newVoiceName, setNewVoiceName] = useState('');
    const [newVoiceDescription, setNewVoiceDescription] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [checkedVoiceId, setCheckedVoiceId] = useState<string>();
    const [openNewModal, setOpenNewModal] = useState(false);
    const filteredVoices = voices.filter(
        voice => voice.name.toLowerCase().includes(searchTerm) || voice.description.toLowerCase().includes(searchTerm)
    );

    const handleVoiceChange = (voice: Voice) => {
        if (voice.id !== selectedVoice?.id) {
            setSelectedVoice(voice);
            onVoiceChange?.(voice);
        }
        setDropdownOpen(false);
    };
    const handleAddVoice = () => {
        if (!newVoiceName.trim()) return;

        const newVoice: Voice = {
            id: `${Date.now()}`,
            name: newVoiceName,
            description: newVoiceDescription,
        };

        setSelectedVoice(newVoice);
        onVoiceChange?.(newVoice);
        setIsCreatingVoice(false);
        setIsEditingVoice(false);
        setNewVoiceName('');
        setNewVoiceDescription('');
    };
    const handleEditVoice = (id: string) => {
        const voice = voices.find(v => v.id === id);
        if (voice) {
            setNewVoiceName(voice.name);
            setNewVoiceDescription(voice.description);
            setIsCreatingVoice(true);
            setIsEditingVoice(true);
        }
    };
    const handleRemove = () => {
        setSelectedVoice(undefined);
        onVoiceChange?.(undefined);
    };
    const handleCancelEditOrCreate = () => {
        setIsCreatingVoice(false);
        setIsEditingVoice(false);
        setNewVoiceName('');
        setNewVoiceDescription('');
    };

    const handleConfirmAddVoice = () => {
        const selected = voices.find(v => v.id === checkedVoiceId);
        setSelectedVoice(selected);
        setOpenNewModal(false);
    };

    const handleFooterCancel = () => {
        if (isCreatingVoice) handleCancelEditOrCreate();
        else setOpenNewModal(false);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen]);

    return (
        <div className="w-full flex flex-col gap-4">
            <div>
                <p className="text-md font-medium text-gray-700 dark:text-gray-100">Voice Engine</p>

                <div className="flex flex-col gap-y-[10px] items-center">
                    <img width="120" alt="voice placeholder" src="/png/voice_empty_selection.png" />
                </div>

                {selectedVoice ? (
                    <div className="border p-3 rounded bg-gray-50 dark:bg-gray-800">
                        <p className="font-semibold text-gray-800 dark:text-white">{selectedVoice.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{selectedVoice.description}</p>

                        <div className="mt-2 flex gap-3">
                            <Button
                                variant="link"
                                className="text-blue-500"
                                onClick={() => setSelectedVoice(undefined)}
                                disabled={isReadonly}
                            >
                                Change
                            </Button>
                            <Button
                                variant="link"
                                className="text-red-500"
                                onClick={handleRemove}
                                disabled={isReadonly}
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-4 text-center text-sm text-gray-600 dark:text-gray-300">
                            <div className="text-center text-xs font-normal mb-2">
                                Select your preferred voice engine
                            </div>
                            <Button
                                variant="link"
                                onClick={() => {
                                    setCheckedVoiceId(undefined);
                                    setSearchTerm('');
                                    setOpenNewModal(true);
                                }}
                            >
                                {' '}
                                Add a Voice Engine
                            </Button>
                        </div>

                        {!isReadonly && (
                            <div className="relative" ref={dropdownRef}>
                                <div className="mb-2">Voice</div>
                                <button
                                    type="button"
                                    className="w-full text-left flex border p-2 rounded gap-2 text-sm items-center justify-between cursor-pointer bg-transparent"
                                    onClick={() => setDropdownOpen(prev => !prev)}
                                >
                                    <Volume2 size={20} />
                                    Select your preferred voice
                                    <ChevronDown size={20} className="cursor-pointer" />
                                </button>

                                {dropdownOpen && (
                                    <ul className="absolute z-10 mt-2 w-full max-h-60 overflow-y-auto border rounded bg-white dark:bg-gray-900 shadow-lg">
                                        {voices.map(voice => (
                                            <li key={voice.id}>
                                                <button
                                                    type="button"
                                                    className="flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer w-full text-left bg-transparent border-none"
                                                    onClick={() => handleVoiceChange(voice)}
                                                >
                                                    <CirclePlay size={30} className="mt-1" />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                                                            {voice.name}
                                                        </span>
                                                        <span className="text-xs text-gray-600 dark:text-gray-300">
                                                            {voice.description}
                                                        </span>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                        {voices.length === 0 && (
                                            <li className="p-3 text-sm text-gray-500 dark:text-gray-400">
                                                No voices available.
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        )}
                        <Dialog
                            open={openNewModal}
                            onOpenChange={open => {
                                setOpenNewModal(open);
                                if (!open) {
                                    setCheckedVoiceId(undefined);
                                    setSearchTerm('');
                                    setIsCreatingVoice(false);
                                    setIsEditingVoice(false);
                                    setNewVoiceName('');
                                    setNewVoiceDescription('');
                                }
                            }}
                        >
                            <DialogContent className="max-w-[unset] w-[580px]">
                                <DialogHeader className="px-0">
                                    <DialogTitle asChild>
                                        <div className="px-4 flex gap-2">
                                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                                Voices
                                            </p>
                                        </div>
                                    </DialogTitle>
                                </DialogHeader>
                                <DialogDescription asChild>
                                    <AddVoiceModalContent
                                        isCreatingVoice={isCreatingVoice}
                                        isReadonly={isReadonly}
                                        newVoiceName={newVoiceName}
                                        newVoiceDescription={newVoiceDescription}
                                        searchTerm={searchTerm}
                                        checkedVoiceId={checkedVoiceId}
                                        filteredVoices={filteredVoices}
                                        onNewVoiceNameChange={setNewVoiceName}
                                        onNewVoiceDescriptionChange={setNewVoiceDescription}
                                        onSearchChange={setSearchTerm}
                                        onCheckedVoiceChange={setCheckedVoiceId}
                                        onEditVoice={handleEditVoice}
                                        onNewVoiceTemplate={() => setIsCreatingVoice(true)}
                                    />
                                </DialogDescription>
                                <DialogFooter>
                                    <Button variant="secondary" onClick={handleFooterCancel}>
                                        {isCreatingVoice ? 'Back' : 'Cancel'}
                                    </Button>
                                    {isCreatingVoice ? (
                                        <Button variant="primary" onClick={handleAddVoice} disabled={!newVoiceName}>
                                            {isEditingVoice ? 'Update' : 'Create'}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            disabled={!checkedVoiceId}
                                            onClick={handleConfirmAddVoice}
                                        >
                                            Add Voice
                                        </Button>
                                    )}
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </div>
        </div>
    );
};
