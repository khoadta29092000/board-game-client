/* eslint-disable @typescript-eslint/no-explicit-any */
// providers/SignalRProvider.tsx
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
import { useAuth } from "@/src/redux/global/selectors"; // <-- your selector

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
  children,
  hubURL
}: {
  children: React.ReactNode;
  hubURL: string;
}) => {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const handlersRef = useRef<
    { method: string; handler: (...args: any[]) => void }[]
  >([]);
  const initRef = useRef(false);

  const reduxProfile = useAuth();

  const connect = useCallback(async () => {
    if (connectionRef.current || !localStorage.getItem("user_token")) return; // ← check ref

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl((process.env.NEXT_PUBLIC_SOCKET_URL ?? "") + hubURL, {
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
        accessTokenFactory: () => localStorage.getItem("user_token") || ""
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    newConnection.onclose(() => setIsConnected(false));
    newConnection.onreconnected(() => setIsConnected(true));

    try {
      await newConnection.start();

      handlersRef.current.forEach(({ method, handler }) => {
        newConnection.on(method, handler);
      });
      handlersRef.current = [];

      connectionRef.current = newConnection; // ← ref, không trigger re-render
      setIsConnected(true);
    } catch (err) {
      console.error("❌ Error while starting connection:", err);
    }
  }, [hubURL]); // ← chỉ hubURL, không có connection

  const disconnect = useCallback(async () => {
    if (connectionRef.current) {
      await connectionRef.current.stop();
      connectionRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const invoke = useCallback(async (method: string, ...args: any[]) => {
    if (!connectionRef.current || connectionRef.current.state !== "Connected") {
      throw new Error("SignalR not connected");
    }
    return connectionRef.current.invoke(method, ...args);
  }, []);

  const on = useCallback(
    (method: string, handler: (...args: any[]) => void) => {
      if (connectionRef.current) {
        connectionRef.current.on(method, handler);
      } else {
        handlersRef.current.push({ method, handler });
      }
    },
    []
  );

  const off = useCallback(
    (method: string, handler?: (...args: any[]) => void) => {
      connectionRef.current?.off(method, handler as any);
    },
    []
  );

  useEffect(() => {
    if (initRef.current) return;
    if (!reduxProfile) return;
    if (!localStorage.getItem("user_token")) return;

    initRef.current = true;
    connect().catch(err => console.error("SignalR connect failed", err));
  }, [reduxProfile, connect]);

  useEffect(() => {
    return () => {
      connectionRef.current?.stop();
      connectionRef.current = null;
      initRef.current = false;
    };
  }, []);

  return (
    <SignalRContext.Provider
      value={{
        isConnected,
        connection: connectionRef.current,
        invoke,
        on,
        off,
        connect,
        disconnect
      }}
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
