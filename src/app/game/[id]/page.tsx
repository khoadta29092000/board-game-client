import React from "react";
import { cn } from "@/src/utils";
import ContentGameDetail from "./components/content";
import { SignalRProvider } from "@/src/components/signalR/signalRProvider";

export default function Game() {
  return (
    <div className="bg-gradient-to-b from-purple-950 to-gray-900 h-auto sm:h-auto">
      <div className={cn("container max-w-12/12 mx-auto", "")}>
        <SignalRProvider hubURL="/gameHub">
          <ContentGameDetail />
        </SignalRProvider>
      </div>
    </div>
  );
}
