export class NotificationWebSocket {
  userId: number;
  socket: WebSocket;
  messageHandler: (senderId: number, notification: string) => void;

  constructor(
    userId: number,
    messageHandler: (senderId: number, notification: string) => void,
  ) {
    this.userId = userId;
    this.socket = new WebSocket('ws://localhost:3000');
    this.messageHandler = messageHandler;
    this.setup();
    
    console.log('WebSocket connection established for user', userId);
  }

  setup() {
    this.socket.onopen = () => {
      this.socket.send(
        JSON.stringify({ messageType: 'NEW_USER', userId: this.userId }),
      );
    };
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.messageType === 'NOTIFICATION') {
        this.messageHandler(data.senderId, data.notification);
      }
    };
    this.socket.onerror = (error) => {
      console.error('WebSocket error: ', error);
    };
    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }
}
