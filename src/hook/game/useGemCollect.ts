import { useMemo, useState } from "react";

export function useGemCollect(
  bankGems: Record<string, number> | null,
  onConfirm?: (gems: Record<string, number>) => void
) {
  const [selectedGems, setSelectedGems] = useState<Record<string, number>>({});

  const totalSelected = useMemo(
    () => Object.values(selectedGems).reduce((a, b) => a + b, 0),
    [selectedGems]
  );

  const selectedColors = useMemo(
    () => Object.keys(selectedGems),
    [selectedGems]
  );

  const handleSelectGem = (color: string, amount: number) => {
    if (amount <= 0) return;

    const currentCount = selectedGems[color] || 0;

    // =============================
    // CASE 1: chưa chọn gì
    // =============================
    if (totalSelected === 0) {
      setSelectedGems({ [color]: 1 });
      return;
    }

    // =============================
    // CASE 2: đã chọn 1 viên
    // =============================
    if (totalSelected === 1) {
      const firstColor = selectedColors[0];

      // Nếu cùng màu → cho lên 2 (option 2), nhưng bank phải có >= 4 viên
      if (firstColor === color) {
        if (amount < 4) return; // ← fix: thiếu điều kiện này
        setSelectedGems({ [color]: 2 });
        return;
      }

      // Nếu khác màu → chọn 2 màu khác nhau
      setSelectedGems(prev => ({ ...prev, [color]: 1 }));
      return;
    }

    // =============================
    // CASE 3: đã chọn 2 viên
    // =============================
    if (totalSelected === 2) {
      const counts = Object.values(selectedGems);

      // Nếu đã là 1 màu x2 → không cho chọn thêm
      if (counts.includes(2)) return;

      // Nếu đang là 2 màu khác nhau → chỉ cho chọn màu thứ 3 mới
      if (!selectedGems[color]) {
        setSelectedGems(prev => ({ ...prev, [color]: 1 }));
      }

      return;
    }

    // =============================
    // CASE 4: đã đủ 3 viên → stop
    // =============================
    return;
  };

  const handleRemoveGem = (color: string) => {
    setSelectedGems(prev => {
      const updated = { ...prev };
      delete updated[color];
      return updated;
    });
  };

  const handleConfirm = () => {
    if (totalSelected === 0) return;
    onConfirm?.(selectedGems);
    setSelectedGems({});
  };

  const isGemSelectable = (color: string, amount: number): boolean => {
    if (amount <= 0) return false;
    if (totalSelected === 0) return true;

    if (totalSelected === 1) {
      const firstColor = selectedColors[0];
      if (firstColor === color) return amount >= 4; // cùng màu: cần >= 4
      return true; // màu khác: ok
    }

    if (totalSelected === 2) {
      const counts = Object.values(selectedGems);
      if (counts.includes(2)) return false; // đã lock 2 cùng màu
      return !selectedGems[color]; // chỉ cho màu mới
    }

    return false; // đủ 3 rồi
  };

  return {
    selectedGems,
    totalSelected,
    handleSelectGem,
    handleRemoveGem,
    handleConfirm,
    isGemSelectable
  };
}
