'use client';

import React, { useRef, useState, useEffect } from 'react';
import { partitionFilesByAccept } from '@/lib/utils';
import { toast } from 'sonner';
import { Upload, X, FileText, Trash2 } from 'lucide-react';

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface IFileUploadProps {
    placeholder?: string;
    hideInbuiltUploadHandler?: boolean;
    supportMultiUpload?: boolean;
    value?: File[];
    onChange?: (files: File[]) => void;
    accept?: string | string[];
    onClear?: () => void; // Optional callback when files are cleared
    hasError?: boolean; // Optional prop to show error state
    errorMessage?: string; // Optional error message to display
    disabled?: boolean;
    onFileClick?: () => void;
    toastErrorMessage?:string;
}

export default function FileUploader({
    placeholder = 'Support for multiple files - documents, images, and other file types',
    hideInbuiltUploadHandler = false,
    supportMultiUpload = true,
    value,
    onChange,
    accept,
    onClear,
    hasError = false,
    errorMessage,
    disabled,
    onFileClick,
    toastErrorMessage
}: IFileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showRejectedToast = (rejectedCount: number) => {
        if (rejectedCount > 0) {
            if(toastErrorMessage) {
                toast.error(toastErrorMessage);
            }else{
                toast.error('Only JSON or YAML files are allowed');
            }
        }
    };

    // internal fallback state
    const [internalFiles, setInternalFiles] = useState<File[]>(value ?? []);
    // if parent doesn't clear `value`, `forceEmpty` will let us show the empty upload box anyway
    const [forceEmpty, setForceEmpty] = useState(false);
    useEffect(() => {
        setInternalFiles(value ?? []);
        // whenever parent updates value, stop forcing empty state
        setForceEmpty(false);
    }, [value]);

    const files = forceEmpty ? [] : value ?? internalFiles;

    const setFiles = (newFiles: File[]) => {
        onChange?.(newFiles);
        setInternalFiles(newFiles);
        // If we cleared all files, flip the forceEmpty flag so the upload box shows even if parent
        // doesn't immediately update the controlled `value` prop.
        if (newFiles.length === 0) {
            setForceEmpty(true);
            onClear?.();
        } else {
            setForceEmpty(false);
        }
    };

    const processFiles = (newFiles: File[]) => {
        const { accepted, rejected } = partitionFilesByAccept(newFiles, accept);
        setForceEmpty(false);
        if (supportMultiUpload) setFiles([...(files ?? []), ...accepted]);
        else setFiles(accepted.slice(0, 1));
        showRejectedToast(rejected.length);
    };

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const targetFiles = e.target.files;
        if (!targetFiles || targetFiles.length === 0) return;
        processFiles(Array.from(targetFiles));
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    function handleDrop(e: React.DragEvent<HTMLElement>) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const droppedFiles = e.dataTransfer.files;
        if (!droppedFiles || droppedFiles.length === 0) return;
        processFiles(Array.from(droppedFiles));
    }

    const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));
    const clearAllFiles = () => setFiles([]);
    const getTotalSize = () => files.reduce((total, file) => total + file.size, 0);
    const triggerFileInput = () => fileInputRef.current?.click();

    return (
        <div
            className={`border rounded-md p-4 transition-all duration-200 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 ${
                hasError ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
            }`}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
                multiple={supportMultiUpload}
                accept={Array.isArray(accept) ? accept.join(',') : accept}
                onClick={onFileClick}
            />

            {files.length === 0 ? (
                <button
                    type="button"
                    className={`border-2 border-dashed rounded-md ${
                        isDragging
                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900'
                    } p-6 text-center cursor-pointer transition-colors duration-200 w-full`}
                    onClick={triggerFileInput}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <Upload className="mx-auto h-10 w-10 text-gray-500 dark:text-gray-300" />
                    <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                        {supportMultiUpload
                            ? 'Drag and drop files here, or click to select files'
                            : 'Drag and drop a file here, or click to select a file'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{placeholder}</p>
                </button>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                {supportMultiUpload ? `Selected files (${files.length})` : 'Selected file'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {supportMultiUpload
                                    ? `Total size: ${formatFileSize(getTotalSize())}`
                                    : `Size: ${files.length > 0 ? formatFileSize(files[0].size) : '0 Bytes'}`}
                            </p>
                        </div>
                        {supportMultiUpload && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={clearAllFiles}
                                    disabled={disabled}
                                    className="flex items-center px-2 py-1 text-xs text-red-600 dark:text-red-400 rounded-md hover:text-red-700 dark:hover:text-red-300 transition-colors"
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Clear all
                                </button>
                            </div>
                        )}
                        {!supportMultiUpload && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        removeFile(0);
                                    }}
                                    disabled={disabled}
                                    className="flex items-center px-2 py-1 text-xs text-red-600 dark:text-red-400 rounded-md hover:text-red-700 dark:hover:text-red-300 transition-colors"
                                >
                                    <X className="h-3 w-3 mr-1" />
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        className={`border-2 border-dashed rounded-md ${
                            isDragging
                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                : 'border-gray-200 dark:border-gray-600'
                        } p-3 transition-colors duration-200 bg-white dark:bg-gray-800 cursor-pointer w-full text-left`}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={triggerFileInput}
                        title={supportMultiUpload ? 'Click to add more files' : 'Click to replace file'}
                    >
                        <div className="max-h-48 overflow-y-auto pr-1 space-y-3">
                            {files.map((file, index) => (
                                <div
                                    key={`${file.name}-${file.size}-${index}`}
                                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md group"
                                >
                                    <div className="flex items-center space-x-2 overflow-hidden">
                                        <FileText className="h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-200" />
                                        <span className="text-sm truncate max-w-[200px] text-gray-800 dark:text-gray-100">
                                            {file.name}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-300 flex-shrink-0">
                                            {formatFileSize(file.size)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </button>
                    {!hideInbuiltUploadHandler && (
                        <div className="flex justify-end">
                            <button className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors">
                                {supportMultiUpload
                                    ? `Upload ${files.length} ${files.length === 1 ? 'file' : 'files'}`
                                    : 'Upload file'}
                            </button>
                        </div>
                    )}
                </div>
            )}
            {hasError && errorMessage && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">{errorMessage}</div>
            )}
        </div>
    );
}
