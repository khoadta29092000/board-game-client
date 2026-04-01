import React from "react";
import ContentRegister from "./component/content";
import { cn } from "@/src/utils";

export default function RegisterPage() {
  return (
    <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 min-h-[calc(100vh)]">
      <div className={cn("container max-w-11/12 mx-auto", "my-1")}>
        <ContentRegister />
      </div>
    </div>
  );
}
