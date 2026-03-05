/* eslint-disable @typescript-eslint/no-explicit-any */
export function LoadingOverlay({ message }: { message: string }) {
  const colors = ["#a78bfa", "#60a5fa", "#4ade80", "#f87171", "#fbbf24"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner gems */}
        <div className="relative w-16 h-16">
          {colors.map((color, i) => (
            <div
              key={i}
              className="gem absolute"
              style={
                {
                  background: color,
                  ["--r" as any]: `${i * (360 / colors.length)}deg`,
                  ["--delay" as any]: `${i * 0.12}s`
                } as React.CSSProperties
              }
            />
          ))}

          <style>{`
            .gem { 
              width: 12px;
              height: 12px;
              border-radius: 9999px;
              top: 50%;
              left: 50%;
              margin-top: -6px;
              margin-left: -6px;
              transform: rotate(var(--r)) translateY(-24px);
              animation: pulse-gem 1.2s ease-in-out infinite;
              animation-delay: var(--delay);
            }

            @keyframes pulse-gem {
              0%,
              100% {
                opacity: 0.3;
                transform: rotate(var(--r)) translateY(-24px) scale(0.8);
              }
              50% {
                opacity: 1;
                transform: rotate(var(--r)) translateY(-24px) scale(1.3);
              }
            }
          `}</style>
        </div>

        <p className="text-gray-300 text-sm font-medium tracking-widest uppercase">
          {message}
        </p>
      </div>
    </div>
  );
}
