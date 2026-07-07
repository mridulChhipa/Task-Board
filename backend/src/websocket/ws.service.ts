import { WebSocketServer, WebSocket } from 'ws';
import { type Server as HttpServer, type IncomingMessage } from 'http';

import { verifyToken } from '../utils/jwt';
import { requireEnv } from '../config/env';
import { TokenType } from '../types/auth.types';

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
    this.wss.on('connection', (ws, req) => this.newConnection(ws, req));
  }

  newConnection(ws: WebSocket, req: IncomingMessage) {
    // The user identity comes from the auth cookie on the upgrade request.
    // Trusting a client-sent userId would let anyone receive another
    // user's notifications.
    const userId = this.authenticate(req);
    if (userId === null) {
      ws.close(4401, 'Unauthorized');
      return;
    }

    this.addUser(ws, userId);
    ws.on('close', () => {
      if (this.userSockets.get(userId) === ws) {
        this.userSockets.delete(userId);
      }
    });
  }

  private authenticate(req: IncomingMessage): number | null {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      return null;
    }

    const token = cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('refreshToken='))
      ?.slice('refreshToken='.length);

    if (!token) {
      return null;
    }

    try {
      const payload = verifyToken(
        decodeURIComponent(token),
        requireEnv('JWT_REFRESH_SECRET'),
      );
      if (payload.type !== TokenType.REFRESH) {
        return null;
      }
      return payload.sub;
    } catch {
      return null;
    }
  }

  addUser(ws: WebSocket, userId: number) {
    this.userSockets.set(userId, ws);
  }

  getSocket(userId: number): WebSocket | undefined {
    return this.userSockets.get(userId);
  }

  sendNotification(senderId: number, recieverId: number, notification: string) {
    const recieverSocket = this.userSockets.get(recieverId);
    if (!recieverSocket || recieverSocket.readyState !== WebSocket.OPEN) {
      return;
    }
    recieverSocket.send(
      JSON.stringify({ messageType: 'NOTIFICATION', senderId, notification }),
    );
  }

  removeUser(userId: number) {
    this.getSocket(userId)?.close();
    this.userSockets.delete(userId);
  }

  closeServer() {
    this.wss?.close();
  }
}
