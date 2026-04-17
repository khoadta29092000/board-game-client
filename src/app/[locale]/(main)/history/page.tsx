import React from "react";
import { cn } from "@/src/utils";
import ContentHistory from "./components/content";

export default function History() {
  return (
    <div className="bg-gray-50 min-h-[calc(80vh)]">
      <div className="w-full h-2 bg-primary-200"></div>
      <div className={cn("container max-w-12/12 mx-auto", "")}>
        <ContentHistory />
      </div>
    </div>
  );
}
