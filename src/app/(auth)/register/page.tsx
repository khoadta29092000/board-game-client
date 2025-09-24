import React from "react";
import ContentRegister from "./component/content";
import { cn } from "@/src/utils";

export default function RegisterPage() {
  return (
    <div className="bg-white min-h-[calc(100vh)]">
      <div className="w-full h-2 bg-primary-200"></div>
      <div className={cn("container max-w-11/12 mx-auto", "my-1")}>
        <ContentRegister />
      </div>
    </div>
  );
}
