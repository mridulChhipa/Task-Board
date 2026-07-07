import type { Dispatch } from 'react';

import { API_URL } from '../config';
import { NotificationWebSocket } from './Websockets.utils';
import { triggerPopup } from '../context/PopupProvider';
import type { DispatchType } from '../context/AuthContext';

let activeSocket: NotificationWebSocket | null = null;

/**
 * Shared push-notification handling (previously duplicated in AuthProvider
 * and the login page): show a popup and refresh the notification list.
 */
function createNotificationHandler(dispatch: Dispatch<DispatchType>) {
  return async (senderId: number, notification: string) => {
    try {
      const senderRes = await fetch(`${API_URL}/api/auth/${senderId}`, {
        method: 'GET',
        credentials: 'include',
      });
      const senderData = await senderRes.json();
      const sender = senderData.data.personalData.name;
      triggerPopup(sender, notification, false);

      const meRes = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });
      const meData = await meRes.json();
      dispatch({
        type: 'SET_NOTIFICATIONS',
        payload: meData.notifications || [],
      });
    } catch (err) {
      console.error('Notification handling failed:', err);
    }
  };
}

/**
 * Open (or replace) the app-wide notification socket. Keeping a single
 * module-level socket prevents login + session-restore from leaking
 * duplicate connections.
 */
export function connectNotificationSocket(
  dispatch: Dispatch<DispatchType>,
): void {
  activeSocket?.close();
  activeSocket = new NotificationWebSocket(createNotificationHandler(dispatch));
}

export function disconnectNotificationSocket(): void {
  activeSocket?.close();
  activeSocket = null;
}
