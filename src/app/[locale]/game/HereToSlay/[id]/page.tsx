import React from "react";
import { SignalRProvider } from "@/src/components/signalR/signalRProvider";
import ContentHereToSlayDetail from "./components/content";

export default function GameHereToSlay() {
  return (
    <div>
      <SignalRProvider hubURL="/HereToSlayHub">
        <ContentHereToSlayDetail />
      </SignalRProvider>
    </div>
  );
}
