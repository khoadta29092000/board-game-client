export default function ButtonPreview() {
  const buttons = [
    "PointButton",
    "GreenButton",
    "BlueButton",
    "DiamondButton",
    "GoldButton",
    "PurpleButton",
    "RubyButton",
    "CostPurpleButton",
    "CostGreenButton",
    "CostBlueButton",
    "CostDiamondButton",
    "CostRubyButton"
  ];

  return (
    <div className="p-6 bg-black min-h-screen">
      <div className="grid grid-cols-3 gap-4">
        {buttons.map(btn => (
          <div
            key={btn}
            className={`
              ${btn}
              flex items-center justify-center
              h-14 rounded-lg
              text-white font-semibold text-lg
            `}
          >
            123
          </div>
        ))}
      </div>
    </div>
  );
}
