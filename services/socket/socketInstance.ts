import SocketService from "./socketService";

let socketServiceInstance: SocketService | null = null;

export const setSocketService = (instance: SocketService) => {
  socketServiceInstance = instance;
};

export const getSocketService = (): SocketService | null => {
  return socketServiceInstance;
};
