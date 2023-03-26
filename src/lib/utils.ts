import { z, ZodSchema } from 'zod';

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
export const valuesFromData = <T extends z.ZodTypeAny>(data: FormData | Record<string, unknown>, schema: T) => 
	zodKeys(schema).reduce((acc, key) => {
		if (data instanceof FormData) {
			acc[key] = data.get(key) as string;
		} else {
			acc[key] = data[key];
		}
		return acc;
	}, {} as Record<string, string | unknown>);

const zodKeys = <T extends z.ZodTypeAny>(schema: T): string[] => {
	// make sure schema is not null or undefined
	if (schema === null || schema === undefined) return [];
	// check if schema is nullable or optional
	if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional) return zodKeys(schema.unwrap());
	// check if schema is an array
	if (schema instanceof z.ZodArray) return zodKeys(schema.element);
	// check if schema is wrapped
	if (schema instanceof z.ZodEffects) return zodKeys(schema.innerType())
	// check if schema is an object
	if (schema instanceof z.ZodObject) {
		// get key/value pairs from schema
		const entries = Object.entries(schema.shape);
		// loop through key/value pairs
		return entries.flatMap(([key, value]) => {
			// get nested keys
			const nested = value instanceof z.ZodType ? zodKeys(value).map(subKey => `${key}.${subKey}`) : [];
			// return nested keys
			return nested.length ? nested : key;
		});
	}
	// return empty array
	return [];
};