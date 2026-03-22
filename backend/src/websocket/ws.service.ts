import { WebSocketServer, WebSocket } from 'ws';
import { type Server as HttpServer } from 'http';

type WSMessage =
  | { messageType: 'NEW_USER'; userId: number }
  | {
      messageType: 'NOTIFICATION';
      senderId: number;
      recieverId: number;
      notification: string;
    };

let wsServer: WebSocketService;

export function initWSServer(httpServer: HttpServer) {
  wsServer = new WebSocketService(httpServer);
  return wsServer;
}

export function shutdownWSServer() {
  wsServer.closeServer();
}

export function sendNotif(
  senderId: number,
  recieverId: number,
  notification: string,
) {
  wsServer.sendNotification(senderId, recieverId, notification);
}

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private userSockets = new Map<number, WebSocket>();

  constructor(httpServer: HttpServer) {
    this.wss = new WebSocketServer({ server: httpServer });
    this.wss.on('connection', (ws) => this.newConnection(ws));
  }

  newConnection(ws: WebSocket) {
    console.log('New User Connected');
    ws.on('message', (message) => {
      const data = JSON.parse(message.toString()) as WSMessage;
      if (data.messageType === 'NEW_USER') {
        this.addUser(ws, data.userId);
        console.log('User added to hashmap');
      } else if (data.messageType === 'NOTIFICATION') {
        this.sendNotification(
          data.senderId,
          data.recieverId,
          data.notification,
        );
      }
    });
    ws.on('close', () => {
      for (const [userId, socket] of this.userSockets.entries()) {
        if (socket === ws) {
          this.removeUser(userId);
          return;
        }
      }
    });
  }

  addUser(ws: WebSocket, userId: number) {
    this.userSockets.set(userId, ws);
  }

  getSocket(userId: number): WebSocket | undefined {
    return this.userSockets.get(userId);
  }

  sendNotification(senderId: number, recieverId: number, notification: string) {
    const recieverSocket = this.userSockets.get(recieverId);
    console.log('Reciever Socket: ', recieverSocket);
    if (recieverSocket) {
      if (recieverSocket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not open');
        return;
      }
      recieverSocket.send(
        JSON.stringify({ messageType: 'NOTIFICATION', senderId, notification }),
      );
      console.log('Sent notification');
    } else {
      console.error('No WebSocket found for userId: ', recieverId);
    }
  }

  removeUser(userId: number) {
    this.getSocket(userId)?.close();
    this.userSockets.delete(userId);
  }

  closeServer() {
    this.wss?.close();
  }
}
