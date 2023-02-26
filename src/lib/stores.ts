import { writable, derived } from 'svelte/store';
import type { NotificationType } from '../app';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timeout?: number;
}

const DEFAULT_TIMEOUT = 3000;

function createNotificationStore() {
  const _notifications = writable<Notification[]>([]);

  function send(message: string, type: 'info' | 'success' | 'warning' | 'error', timeout?: number) {
    _notifications.update(state => [...state, { id: crypto.randomUUID(), type, message, timeout}])
  }

  const notifications = derived<typeof _notifications, Notification[]>(_notifications, ($_notifications, set) => {
    set($_notifications)
    if ($_notifications.length > 0) {
      const timer = setTimeout(() => {
        _notifications.update(state => {
          state.shift();
          return state;
        });
      }, $_notifications[0].timeout ?? DEFAULT_TIMEOUT);
      return () => {
        clearTimeout(timer);
      };
    }
  });
  const { subscribe } = notifications;

  return {
    subscribe,
    info: (msg: string, timeout?: number) => send(msg, 'info', timeout),
    success: (msg: string, timeout?: number) => send(msg, 'success', timeout),
    warning: (msg: string, timeout?: number) => send(msg, 'warning', timeout),
    error: (msg: string, timeout?: number) => send(msg, 'error', timeout),
  }
}

export const notifications = createNotificationStore();