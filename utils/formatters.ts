
import { Student } from "../types";

export const formatDateLong = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
     if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
};

export const formatDateDDMMYYYY = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB');
};

export const dateToWords = (dateString: string): string => {
    if (!dateString) return '_______________________';
    const date = new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) return '_______________________';

    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();

    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const numberToWords = (num: number): string => {
        if (num === 0) return '';
        if (num < 20) return ones[num];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
        if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
        return numberToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
    };

    const dayToOrdinalWord = (d: number): string => {
        if (d === 0) return '';
        const ordinals = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteen', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', 'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth', 'twenty-fifth', 'twenty-sixth', 'twenty-seventh', 'twenty-eighth', 'twenty-ninth', 'thirtieth', 'thirty-first'];
        return ordinals[d - 1] || d.toString();
    };
    
    const yearToWords = (y: number): string => {
        if (y >= 1900 && y < 2000) {
            const firstPart = Math.floor(y / 100); // e.g., 19
            const secondPart = y % 100; // e.g., 99
            let yearText = numberToWords(firstPart) + ' hundred';
            if (secondPart > 0) {
                yearText += ' ' + numberToWords(secondPart);
            }
            return yearText;
        }
        if (y >= 2000 && y < 2100) {
             return numberToWords(y);
        }
        return y.toString();
    };

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const dayInWords = capitalize(dayToOrdinalWord(day));
    const yearInWords = yearToWords(year);
    
    return `${dayInWords} of ${month}, ${yearInWords}`;
};

// Helper function to get image dimensions
export const getImageDimensions = (base64: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
        img.src = base64;
    });
};

export const getGrade = (percentage: number): string => {
    if (percentage > 85) return 'A+';
    if (percentage > 70) return 'A';
    if (percentage > 55) return 'B';
    if (percentage > 40) return 'C';
    if (percentage >= 33) return 'D';
    return 'E';
};
