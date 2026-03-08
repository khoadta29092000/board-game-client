export default function GameLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
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
