import React from "react";
import { cn } from "@/src/utils";
import ContentRoomDetail from "./components/content";

export default function Login() {
  return (
    <div className="bg-white min-h-[calc(80vh)]">
      <div className="w-full h-2 bg-primary-200"></div>
      <div className={cn("container max-w-12/12 mx-auto", "")}>
        <ContentRoomDetail />
      </div>
    </div>
  );
}
