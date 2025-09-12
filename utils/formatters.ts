export const formatDateLong = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
     if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
};