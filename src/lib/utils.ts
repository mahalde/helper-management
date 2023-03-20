export const getDateFormatter = (locale?: string | null, withTime = false) => new Intl.DateTimeFormat(locale ?? 'de-DE', {
	month: '2-digit',
	day: '2-digit',
	year: 'numeric',
	hour: withTime ? '2-digit' : undefined,
	minute: withTime ? '2-digit' : undefined,
	weekday: 'long'
});
export const getTimeFormatter = (locale?: string | null) => new Intl.DateTimeFormat(locale ?? 'de-DE', {
	hour: '2-digit',
	minute: '2-digit'
});