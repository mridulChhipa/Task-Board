import type { WebSocketService } from "./ws.service";

let wsServerInstance: WebSocketService | null = null;

export const setWSServer = (server: WebSocketService) => {
  wsServerInstance = server;
};

export const getWSServer = () => {
  if (!wsServerInstance) {
    console.warn("WebSocket server is not initialized yet!");
  }
  
  return wsServerInstance;
};