import { cn } from "@/src/utils";
import ContentLobby from "./components/content";

export default function Lobby() {
  return (
    <div className="bg-white min-h-[calc(80vh)]">
      <div className="w-full h-2 bg-primary-200"></div>
      <div className={cn("container max-w-12/12 mx-auto", "")}>
        <ContentLobby />
      </div>
    </div>
  );
}
