'use client';

import { Button } from '@/components/atoms';
import FileUploader from '@/components/atoms/file-uploader';
import { useDnD } from '@/context';
import { cn } from '@/lib/utils';
import { Node } from '@xyflow/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface FileProcessingAgentFormProps {
    selectedNode: Node;
    isReadOnly?: boolean;
}

export const FileProcessingAgentForm = ({ selectedNode, isReadOnly }: FileProcessingAgentFormProps) => {
    const { setSelectedNodeId } = useDnD();
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);

    // Load file from localStorage on mount
    useEffect(() => {
        const loadFile = async () => {
            const storedData = localStorage.getItem(`field_processing_agent_${selectedNode.id}`);
            if (storedData) {
                try {
                    // Data format: { name: string, type: string, content: string (base64) }
                    const parsedData = JSON.parse(storedData);
                    const res = await fetch(parsedData.content);
                    const buf = await res.arrayBuffer();
                    const file = new File([buf], parsedData.name, { type: parsedData.type });
                    setFiles([file]);
                } catch (error) {
                    console.error('Failed to load file from local storage', error);
                }
            }
            setLoading(false);
        };
        loadFile();
    }, [selectedNode.id]);

    const handleFileChange = (newFiles: File[]) => {
        setFiles(newFiles);
        if (newFiles.length > 0) {
            const file = newFiles[0];
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result as string;
                const fileData = {
                    name: file.name,
                    type: file.type,
                    content: base64String,
                };
                try {
                    localStorage.setItem(`field_processing_agent_${selectedNode.id}`, JSON.stringify(fileData));
                } catch (e) {
                    console.error(e);
                    toast.error('File too large to save locally.');
                }
            };
            reader.readAsDataURL(file);
        } else {
            localStorage.removeItem(`field_processing_agent_${selectedNode.id}`);
        }
    };

    const handleSaveNodeData = () => {
        // Since persistence is automatic on file change for this requirement,
        // we just notify the user and close.
        toast.success('File Processing Agent updated');
        // Optionally close panel? The user didn't specify.
        // StartNodeForm cancels on "Cancel" which sets SelectedNodeId(undefined).
        // Save usually implies "Apply and maybe close or just stay".
        // StartNodeForm stays open.
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="group">
            <div
                className={cn(
                    'agent-form pr-1 flex flex-col gap-y-6 h-[calc(100vh-270px)] overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-transparent group-hover:dark:[&::-webkit-scrollbar-thumb]:bg-gray-700'
                )}
            >
                <fieldset className="flex flex-col gap-y-4 border-none p-0 m-0">
                    <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-100">
                        Upload File
                    </legend>
                    <FileUploader
                        value={files}
                        onChange={handleFileChange}
                        supportMultiUpload={false}
                        placeholder="Upload a file to process"
                        disabled={isReadOnly}
                        accept={['.csv', '.json', '.yaml', '.yml', '.txt', '.pdf', '.docx']} // Reasonable defaults for file processing
                        hideInbuiltUploadHandler={true}
                    />
                </fieldset>

                <div className="agent-form-footer flex gap-x-3 justify-end pb-4 mt-auto">
                    <Button variant="secondary" onClick={() => setSelectedNodeId(undefined)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveNodeData}>
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};
