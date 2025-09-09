/**
 * Generates a timestamp string in 'Asia/Kolkata' (IST) timezone.
 * e.g., "15/07/2024, 05:30:00 PM"
 */
export const getISTTimestamp = (): string => {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
    }).format(new Date());
};