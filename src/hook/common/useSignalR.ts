/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, useCallback } from "react";
import * as signalR from "@microsoft/signalr";

interface UseSignalROptions {
  hubUrl: string;
  autoConnect?: boolean;
}

export const useSignalR = ({
  hubUrl,
  autoConnect = true
}: UseSignalROptions) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const handlersRef = useRef<
    { method: string; handler: (...args: any[]) => void }[]
  >([]);

  const connect = useCallback(async () => {
    if (connectionRef.current) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
        accessTokenFactory: () => localStorage.getItem("user_token") || ""
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    newConnection.onclose(() => setIsConnected(false));
    newConnection.onreconnected(() => setIsConnected(true));

    await newConnection.start();

    // Re-attach các handler đã đăng ký trước khi connection sẵn sàng
    handlersRef.current.forEach(({ method, handler }) => {
      newConnection.on(method, handler);
    });
    handlersRef.current = [];

    connectionRef.current = newConnection;
    setConnection(newConnection);
    setIsConnected(true);
  }, [hubUrl]);

  const invoke = useCallback(async (methodName: string, ...args: any[]) => {
    if (!connectionRef.current || connectionRef.current.state !== "Connected") {
      throw new Error("SignalR not connected");
    }
    return connectionRef.current.invoke(methodName, ...args);
  }, []);

  const on = useCallback(
    (methodName: string, handler: (...args: any[]) => void) => {
      if (connectionRef.current) {
        connectionRef.current.on(methodName, handler);
      } else {
        handlersRef.current.push({ method: methodName, handler });
      }
    },
    []
  );

  const off = useCallback(
    (methodName: string, handler?: (...args: any[]) => void) => {
      connectionRef.current?.off(methodName, handler as any);
    },
    []
  );

  useEffect(() => {
    if (autoConnect) connect();
    return () => {
      connectionRef.current?.stop();
    };
  }, [autoConnect, connect]);

  return { isConnected, connection, invoke, on, off };
};
