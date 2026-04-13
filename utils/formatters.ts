
import { Student } from "../types";

export const formatDateLong = (dateString: string): string => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    const months = [
        '', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (month < 1 || month > 12) return dateString;

    return `${day} ${months[month]}, ${year}`;
};

export const formatDateDDMMYYYY = (dateString: string): string => {
    if (!dateString) return '__________________';
    const parts = dateString.split('-');
    // Input is YYYY-MM-DD, Output should be DD-MM-YYYY
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
};

export const dateToWords = (dateString: string): string => {
    if (!dateString) return '_____________________________________________';
    
    const parts = dateString.split('-');
    if (parts.length !== 3) return '_____________________________________________';

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return '_____________________________________________';

    const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numToWords = (n: number): string => {
        if (n === 0) return '';
        if (n < 20) return ones[n];
        const digit = n % 10;
        return tens[Math.floor(n / 10)] + (digit ? ' ' + ones[digit] : '');
    };

    const dayToOrdinal = (d: number): string => {
        const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth', 'Twenty-first', 'Twenty-second', 'Twenty-third', 'Twenty-fourth', 'Twenty-fifth', 'Twenty-sixth', 'Twenty-seventh', 'Twenty-eighth', 'Twenty-ninth', 'Thirtieth', 'Thirty-first'];
        return ordinals[d - 1] || numToWords(d);
    };

    const yearToWords = (y: number): string => {
        if (y >= 2000) {
            const lastTwo = y % 100;
            if (lastTwo === 0) return 'Two Thousand';
            return 'Two Thousand ' + numToWords(lastTwo);
        } else {
            const firstPart = Math.floor(y / 100);
            const secondPart = y % 100;
            return numToWords(firstPart) + ' Hundred ' + numToWords(secondPart);
        }
    };

    if (month < 1 || month > 12) return 'Invalid Month';

    return `${dayToOrdinal(day)} of ${months[month]}, ${yearToWords(year)}`;
};

export const getImageDimensions = (base64: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
        img.src = base64;
    });
};
