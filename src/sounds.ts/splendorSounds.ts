// =====================================================================
// src/sounds/sounds.ts
// Lazy init — tạo Howl sau user interaction (browser autoplay policy)
// 3 files: card.wav, gems.wav, nobles.wav
// =====================================================================
import { Howl } from "howler";

type SoundKey =
  | "gemCollect"
  | "gemReturn"
  | "cardPurchase"
  | "cardReserve"
  | "nobleClaim"
  | "endGame";

type Sounds = Record<SoundKey, Howl>;

let _sounds: Sounds | null = null;

function createSounds(): Sounds {
  const gems = new Howl({ src: ["/sounds/gems.wav"], volume: 0.5 });
  const card = new Howl({ src: ["/sounds/card.wav"], volume: 0.4 });
  const nobles = new Howl({ src: ["/sounds/nobles.wav"], volume: 0.4 });
  const endGame = new Howl({ src: ["/sounds/end.wav"], volume: 0.4 });

  return {
    gemCollect: gems,
    gemReturn: gems,
    cardPurchase: card,
    cardReserve: card,
    nobleClaim: nobles,
    endGame: endGame
  };
}

export function getSounds(): Sounds {
  if (!_sounds) _sounds = createSounds();
  return _sounds;
}

export function playSound(key: SoundKey) {
  try {
    getSounds()[key].play();
  } catch (e) {
    console.warn(`[Sound] Failed to play ${key}:`, e);
  }
}

export function preloadSounds() {
  getSounds();
}

export function playLoopSound(key: SoundKey) {
  try {
    const sound = getSounds()[key];
    sound.loop(true); // bật loop
    sound.play();
  } catch (e) {
    console.warn(`[Sound] Failed to loop ${key}:`, e);
  }
}

export function stopSound(key: SoundKey) {
  try {
    const sound = getSounds()[key];
    sound.loop(false);
    sound.stop();
  } catch (e) {
    console.warn(`[Sound] Failed to stop ${key}:`, e);
  }
}
