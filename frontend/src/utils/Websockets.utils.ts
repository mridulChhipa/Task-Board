import { WS_URL } from '../config';

type MessageHandler = (senderId: number, notification: string) => void;

const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Notification push channel. The server identifies the user from the auth
 * cookie on the upgrade request, so no identity message is sent. Reconnects
 * with backoff unless closed by the client.
 */
export class NotificationWebSocket {
  private socket: WebSocket | null = null;
  private messageHandler: MessageHandler;
  private closedByClient = false;
  private reconnectAttempts = 0;

  constructor(messageHandler: MessageHandler) {
    this.messageHandler = messageHandler;
    this.connect();
  }

  private connect() {
    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
    };
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.messageType === 'NOTIFICATION') {
        this.messageHandler(data.senderId, data.notification);
      }
    };
    this.socket.onclose = () => {
      if (
        this.closedByClient ||
        this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS
      ) {
        return;
      }
      this.reconnectAttempts += 1;
      setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
    };
  }

  close() {
    this.closedByClient = true;
    this.socket?.close();
  }
}
