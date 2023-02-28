export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type SlotCategory = 'catering' | 'dressage' | 'showjumping';

export interface Helper {
  id: string;
  name: string;
}

export interface Slot {
  id: string;
  name: string;
  category: SlotCategory;
  start_time: Date;
  end_time: Date;
  min_helpers: number;
  max_helpers: number | null;
  helpers: Helper[];
}