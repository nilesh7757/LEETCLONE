import { io, Socket } from "socket.io-client";
import { logger } from "./logger";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

class SocketClient {
  private static instance: SocketClient;
  public socket: Socket;

  private constructor() {
    this.socket = io(socketUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false, // Don't connect immediately
    });

    this.socket.on("connect", () => {
      logger.info("Connected to Socket.io server (Singleton)");
    });

    this.socket.on("disconnect", (reason) => {
      logger.warn(`Disconnected from Socket.io server: ${reason}`);
    });

    this.socket.on("connect_error", (error) => {
      logger.error(`Socket.io connection error: ${error.message}`);
    });
  }

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  public connect() {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  public disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }
}

export const socketClient = SocketClient.getInstance();
