import type { WebSocketService } from './ws.service';

let wsServerInstance: WebSocketService | null = null;

export const setWSServer = (server: WebSocketService) => {
  wsServerInstance = server;
};

export const getWSServer = () => {
  return wsServerInstance;
};
