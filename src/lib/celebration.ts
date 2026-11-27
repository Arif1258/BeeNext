import confetti from "canvas-confetti";

/**
 * Triggers a bomb-blast style celebration animation with canvas-confetti.
 * Fires a central radial explosion followed by left and right burst cannons.
 */
export function triggerBombBlastCelebration() {
  if (typeof window === "undefined") return;

  try {
    const colors = ["#FF5722", "#FF9800", "#FFD700", "#E52532", "#FFFFFF", "#10B981"];

    // 1. Central Bomb Blast (Radial burst at center of screen)
    confetti({
      particleCount: 120,
      spread: 360,
      startVelocity: 45,
      ticks: 200,
      origin: { x: 0.5, y: 0.5 },
      colors,
      shapes: ["circle", "square"],
      scalar: 1.2,
      zIndex: 9999,
    });

    // 2. High-angle cannon burst from left
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 65,
        startVelocity: 55,
        origin: { x: 0.1, y: 0.65 },
        colors,
        zIndex: 9999,
      });
    }, 150);

    // 3. High-angle cannon burst from right
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 65,
        startVelocity: 55,
        origin: { x: 0.9, y: 0.65 },
        colors,
        zIndex: 9999,
      });
    }, 250);

    // 4. Secondary micro-shimmer blast
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 120,
        startVelocity: 35,
        origin: { x: 0.5, y: 0.4 },
        colors,
        zIndex: 9999,
      });
    }, 400);
  } catch (e) {
    console.warn("Celebration animation failed to execute:", e);
  }
}
