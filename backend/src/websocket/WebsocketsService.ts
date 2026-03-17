import { WebSocketServer, WebSocket } from 'ws';
import { get, type Server as HttpServer } from 'http';

type WSMessage =
  | { messageType: 'NEW_USER'; userId: number }
  | {
      messageType: 'NOTIFICATION';
      senderId: number;
      recieverIds: number[];
      notification: string;
    };
let wsServer: WebsocketService;

export function initWSServer(httpServer: HttpServer) {
  wsServer = new WebsocketService(httpServer);
  return wsServer;
}

export function shutdownWSServer() {
  wsServer.closeServer();
}

export function sendNotif(
  senderId: number,
  recieverIds: number[],
  notification: string,
) {
  wsServer.sendNotification(senderId, recieverIds, notification);
}

export class WebsocketService {
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
        console.log("User added to hashmap")
      } else if (data.messageType === 'NOTIFICATION') {
        this.sendNotification(
          data.senderId,
          data.recieverIds,
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

  sendNotification(
    senderId: number,
    recieverIds: number[],
    notification: string,
  ) {
    const recieverSockets = recieverIds.map((id) => this.userSockets.get(id));
    console.log('Reciever Sockets: ', recieverSockets);
    recieverSockets.map((socket) => {
      if (!socket) {
        return;
      }
      if (socket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not open');
        return;
      }
      socket.send(
        JSON.stringify({ messageType: 'NOTIFICATION', senderId, notification }),
      );
      console.log("Sent notification");
    });
  }

  removeUser(userId: number) {
    this.getSocket(userId)?.close();
    this.userSockets.delete(userId);
  }

  closeServer() {
    this.wss?.close();
  }
}
