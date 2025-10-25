import * as XLSX from 'xlsx';

/**
 * Exports an array of objects to an Excel file.
 * @param data The array of data (JSON objects).
 * @param fileName The name of the file to be saved (without extension).
 */
export const exportToExcel = (data: any[], fileName: string): void => {
    // 1. Create a new workbook
    const wb = XLSX.utils.book_new();

    // 2. Convert the JSON data to a worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // 3. Optional: Auto-fit columns for better readability
    if (data.length > 0) {
        const colWidths = Object.keys(data[0]).map(key => ({
            wch: Math.max(
                key.length,
                ...data.map(row => String(row[key] || '').length)
            ) + 2 // Add a little extra padding
        }));
        ws['!cols'] = colWidths;
    }

    // 4. Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Results');

    // 5. Write the workbook and trigger a download
    XLSX.writeFile(wb, `${fileName}.xlsx`);
};
