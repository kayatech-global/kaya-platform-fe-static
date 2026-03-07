import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

type UseExcelUploadResult = {
    excelRows: Record<string, unknown>[];
    isLoadingFile: boolean;
    fileError: string | null;
};

export const useExcelUpload = (
    method: string | undefined,
    uploadedFile: File | null | undefined
): UseExcelUploadResult => {
    const [excelRows, setExcelRows] = useState<Record<string, unknown>[]>([]);
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    useEffect(() => {
        if (method === 'upload' && uploadedFile) {
            if (uploadedFile instanceof Blob) {
                setIsLoadingFile(true);
                setFileError(null);
                setExcelRows([]);

                const reader = new FileReader();
                reader.onload = e => {
                    try {
                        const data = new Uint8Array(e.target?.result as ArrayBuffer);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                        setExcelRows(json as Record<string, unknown>[]);
                        setIsLoadingFile(false);
                    } catch (error) {
                        console.error('Error reading Excel file:', error);
                        setFileError('Failed to read the Excel file. Please check the file format.');
                        setIsLoadingFile(false);
                    }
                };
                reader.onerror = () => {
                    setFileError('Failed to load the file. Please try again.');
                    setIsLoadingFile(false);
                };
                reader.readAsArrayBuffer(uploadedFile);
            } else {
                setFileError('File data is not available. Please re-upload the file.');
                setExcelRows([]);
                setIsLoadingFile(false);
            }
        } else {
            setExcelRows([]);
            setIsLoadingFile(false);
            setFileError(null);
        }
    }, [method, uploadedFile]);

    return { excelRows, isLoadingFile, fileError };
};
