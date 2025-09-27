/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef
} from "react";
import * as signalR from "@microsoft/signalr";
import * as signalRMsgPack from "@microsoft/signalr-protocol-msgpack";

interface SignalRContextType {
  isConnected: boolean;
  connection: signalR.HubConnection | null;
  invoke: (method: string, ...args: any[]) => Promise<any>;
  on: (method: string, handler: (...args: any[]) => void) => void;
  off: (method: string, handler?: (...args: any[]) => void) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const SignalRContext = createContext<SignalRContextType | null>(null);

export const SignalRProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const handlersRef = useRef<
    { method: string; handler: (...args: any[]) => void }[]
  >([]);

  const connect = useCallback(async () => {
    if (connection || !localStorage.getItem("user_token")) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(process.env.NEXT_PUBLIC_SOCKET_URL + "/roomHub", {
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
        accessTokenFactory: () => localStorage.getItem("user_token") || ""
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .withHubProtocol(new signalRMsgPack.MessagePackHubProtocol())
      .build();

    newConnection.onclose(() => setIsConnected(false));
    newConnection.onreconnected(() => setIsConnected(true));

    await newConnection.start();

    handlersRef.current.forEach(({ method, handler }) => {
      newConnection.on(method, handler);
    });
    handlersRef.current = [];

    setConnection(newConnection);
    setIsConnected(true);
  }, [connection]);

  const disconnect = useCallback(async () => {
    if (connection) {
      await connection.stop();
      setConnection(null);
      setIsConnected(false);
    }
  }, [connection]);

  const invoke = useCallback(
    async (method: string, ...args: any[]) => {
      if (!connection || connection.state !== "Connected") {
        throw new Error("SignalR not connected");
      }
      return connection.invoke(method, ...args);
    },
    [connection]
  );

  const on = useCallback(
    (method: string, handler: (...args: any[]) => void) => {
      if (connection) {
        connection.on(method, handler);
      } else {
        handlersRef.current.push({ method, handler });
      }
    },
    [connection]
  );

  const off = useCallback(
    (method: string, handler?: (...args: any[]) => void) => {
      connection?.off(method, handler as any);
    },
    [connection]
  );

  useEffect(() => {
    if (localStorage.getItem("user_token")) {
      connect();
    }
  }, [connect]);

  return (
    <SignalRContext.Provider
      value={{ isConnected, connection, invoke, on, off, connect, disconnect }}
    >
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => {
  const ctx = useContext(SignalRContext);
  if (!ctx) throw new Error("useSignalR must be used inside SignalRProvider");
  return ctx;
};
