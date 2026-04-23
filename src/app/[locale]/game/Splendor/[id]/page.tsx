import React from "react";
import ContentGameDetail from "./components/content";
import { SignalRProvider } from "@/src/components/signalR/signalRProvider";

export default function Game() {
  return (
    <div>
      <SignalRProvider hubURL="/gameHub">
        <ContentGameDetail />
       
      </SignalRProvider>
    </div>
  );
}
