import React from "react";
import { SignalRProvider } from "@/src/components/signalR/signalRProvider";
import ContentTutorial from "./components/content";

export default function TutorialPage() {
  return (
    <SignalRProvider hubURL="/tutorialGameHub">
      <ContentTutorial />
    </SignalRProvider>
  );
}
