import React from "react";
import ContentGameDetail from "./components/content";
import { SignalRProvider } from "@/src/components/signalR/signalRProvider";

export default function Game() {
  return (
    <SignalRProvider hubURL="/gameHub">
      <ContentGameDetail />
    </SignalRProvider>
  );
}
