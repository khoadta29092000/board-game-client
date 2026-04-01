import React from "react";
import ContentLogin from "./components/content";
import { cn } from "@/src/utils";

export default function Login() {
  return (
    <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 min-h-[calc(100vh)]">
      <div className={cn("container max-w-11/12 mx-auto", "my-1")}>
        <ContentLogin />
      </div>
    </div>
  );
}
