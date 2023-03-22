import type { ZodSchema } from 'zod';

function parseLocaleString(localeString?: string | null) {
	return localeString?.split(';')[0];
}

export const getDateFormatter = (locale?: string | null, withTime = false) =>
	new Intl.DateTimeFormat(parseLocaleString(locale) ?? 'de-DE', {
		month: '2-digit',
		day: '2-digit',
		year: 'numeric',
		hour: withTime ? '2-digit' : undefined,
		minute: withTime ? '2-digit' : undefined,
		weekday: 'long'
	});

export const getTimeFormatter = (locale?: string | null) =>
	new Intl.DateTimeFormat(parseLocaleString(locale) ?? 'de-DE', {
		hour: '2-digit',
		minute: '2-digit'
	});

// TODO: type safety
export const valuesFromData = (data: FormData | Record<string, unknown>, schema: ZodSchema) =>
	Object.keys(schema).reduce((acc, key) => {
		if (data instanceof FormData) {
			acc[key] = data.get(key) as string;
		} else {
			acc[key] = data[key];
		}
		return acc;
	}, {} as Record<string, string | unknown>);
