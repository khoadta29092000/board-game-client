import { AuthInit } from "@/src/components/common/AuthInit";

export default function GameLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthInit />
      {children}
      <div
        id="animation-portal"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 9999
        }}
      />
    </>
  );
}
