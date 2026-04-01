import { SignalRProvider } from "@/src/components/signalR/signalRProvider";

export default function LobbyLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SignalRProvider hubURL="/roomHub">{children}</SignalRProvider>;
}
