import * as XLSX from 'xlsx';

export function getExcelHeaders(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const headers: string[] = [];
            const range = XLSX.utils.decode_range(worksheet['!ref'] as string);
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
                const header = cell?.v ?? `Column${C + 1}`;
                headers.push(header);
            }
            resolve(headers);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}
