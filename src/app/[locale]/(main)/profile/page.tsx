import { cn } from "@/src/utils";
import ContentProfile from "./components/content";

export default function Profile() {
  return (
    <div className="bg-white min-h-[calc(80vh)]">
      <div className="w-full h-2 bg-primary-200"></div>
      <div className={cn("container max-w-12/12 mx-auto", "")}>
        <ContentProfile />
      </div>
    </div>
  );
}
