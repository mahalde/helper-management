import type { SlotForOrganizer } from '$lib/types';
import { getDateFormatter, getTimeFormatter } from '$lib/utils';
import { error, redirect } from '@sveltejs/kit';
import * as XLSX from 'xlsx';

interface FormattedSlot {
	name: string;
	start_time: Date;
	end_time: Date;
	helpers: Helper[];
}

interface Helper {
	name: string;
	phone: string;
	additional_data: { name: string; value: string }[];
}

const dateFormatter = getDateFormatter('de-DE');
const timeFormatter = getTimeFormatter('de-DE');

export async function GET({ locals: { supabase, getSession } }) {
	const userId = (await getSession())?.user.id;

	if (!userId) {
		throw redirect(303, '/auth');
	}

	const { data: slots, error: dbError } = await supabase
		.from('slots_for_organizers')
		.select<'*', SlotForOrganizer>('*')
		.contains('contacts', [userId]);

	if (dbError) {
		console.error(dbError);
		throw error(500, { message: 'errors.server_general' });
	}

	const formattedSlots = slots.map((slot) => ({
		name: slot.name,
		start_time: new Date(slot.start_time),
		end_time: new Date(slot.end_time),
		helpers: slot.helpers.map((helper) => {
			const additional_data = helper.additional_field_data.map((data) => ({
				name: slot.additional_fields.find((field) => field.id === data.key)?.name ?? '',
				value: data.value
			}));

			return {
				name: helper.name,
				phone: helper.phone,
				additional_data
			};
		})
	}));

	const slotMap = getSlotMap(formattedSlots);
	const wb = XLSX.utils.book_new();

	if (slotMap.size === 0) {
		XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Keine Zeitslots, bei denen du als Ansprechpartner hinterlegt bist']]));
	}

	for (const [date, slots] of slotMap) {
		const slotsForDisplay = formatSlotsForDisplay(slots);
		const colInfo: XLSX.ColInfo[] = []
		for (let i = 0; i < slotsForDisplay[0].length; i++) {
			const width = slotsForDisplay.reduce((acc, row) => Math.max(row[i]?.length ?? 0, acc), 0);
			colInfo.push({ wch: width });
		}
		const ws = XLSX.utils.aoa_to_sheet(slotsForDisplay);
		ws['!cols'] = colInfo;
		XLSX.utils.book_append_sheet(wb, ws, dateFormatter.format(date));
	}

	const wbout = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
	return new Response(wbout, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': 'attachment; filename="Zeitslots.xlsx"'
		}
	});
}

function getSlotMap(slots: FormattedSlot[]): Map<number, FormattedSlot[]> {
	const slotMap = new Map<number, FormattedSlot[]>();
	slots.forEach((slot) => {
		const key = new Date(
			slot.start_time.getFullYear(),
			slot.start_time.getMonth(),
			slot.start_time.getDate()
		).valueOf();
		const slotList = slotMap.get(key) || [];
		slotList.push(slot);
		slotMap.set(key, slotList);
	});

	for (const slots of slotMap.values()) {
		slots.sort((slotA, slotB) => {
			if (
				slotA.start_time.getHours() === slotB.start_time.getHours() &&
				slotA.start_time.getMinutes() === slotB.start_time.getMinutes()
			) {
				return slotA.name.localeCompare(slotB.name);
			}
			return slotA.start_time.valueOf() - slotB.start_time.valueOf();
		});
	}

	return new Map([...slotMap].sort(([aKey], [bKey]) => aKey - bKey));
}

function formatSlotsForDisplay(slots: FormattedSlot[]): string[][] {
	const slotsForDisplay: string[][] = [];

	for (const slot of slots) {
		slotsForDisplay.push(formatSlotRow(slot));
		if (slot.helpers[0]) {
			slotsForDisplay.push(...formatHelperRow(slot.helpers[0], true));
		}

		for (const helper of slot.helpers.slice(1)) {
			slotsForDisplay.push(...formatHelperRow(helper));
		}

		slotsForDisplay.push([]);
	}

	return slotsForDisplay;
}

function formatSlotRow(slot: FormattedSlot): string[] {
	const timeRange = timeFormatter.formatRange(slot.start_time, slot.end_time);
	const helper = slot.helpers[0];
	return [slot.name, timeRange, helper?.name, helper?.phone, formatAdditionalData(helper?.additional_data[0])];
}

function formatHelperRow(helper: Helper, skipFirstRow?: boolean): string[][] {
	const rows: string[][] = [];
	if (!skipFirstRow) {
		rows.push(['', '', helper.name, helper.phone, formatAdditionalData(helper.additional_data[0])]);
	}

	for (const additionalData of helper.additional_data.slice(1)) {
		rows.push(['', '', '', '', formatAdditionalData(additionalData)]);
	}

	return rows;
}

function formatAdditionalData(data: { name: string; value: string } | undefined): string {
	if (!data) return '';
	return `${data.name}: ${data.value}`;
}
