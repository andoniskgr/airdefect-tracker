import { useEffect, useState, type RefObject } from "react";

export type MobileFormScrollMetrics = {
  /** Extra space to add at the bottom of the scroll area (keyboard overlap). */
  bottomInsetPx: number;
  /** Cap scroll region height so it fits in the visual viewport above the keyboard. */
  maxHeightPx?: number;
};

/**
 * Keeps scrollable modal form regions usable when the mobile software keyboard
 * is open: estimates obscured height and the visible band height from
 * `visualViewport` + the scroll container's position.
 */
export function useMobileFormScrollViewport(
  active: boolean,
  scrollContainerRef: RefObject<HTMLElement | null>
): MobileFormScrollMetrics {
  const [metrics, setMetrics] = useState<MobileFormScrollMetrics>({
    bottomInsetPx: 0,
    maxHeightPx: undefined,
  });

  useEffect(() => {
    if (!active || typeof window === "undefined") {
      setMetrics({ bottomInsetPx: 0, maxHeightPx: undefined });
      return;
    }

    const vv = window.visualViewport;
    if (!vv) {
      setMetrics({ bottomInsetPx: 0, maxHeightPx: undefined });
      return;
    }

    const update = () => {
      const rootH = window.innerHeight;
      const bottomInsetPx = Math.max(
        0,
        Math.round(rootH - vv.height - vv.offsetTop)
      );

      const el = scrollContainerRef.current;
      let maxHeightPx: number | undefined;
      if (el) {
        const top = el.getBoundingClientRect().top;
        const visibleBottom = vv.offsetTop + vv.height;
        maxHeightPx = Math.max(160, Math.round(visibleBottom - top - 12));
      }

      setMetrics({ bottomInsetPx, maxHeightPx });
    };

    update();
    const raf = requestAnimationFrame(() => update());
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(raf);
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      setMetrics({ bottomInsetPx: 0, maxHeightPx: undefined });
    };
  }, [active, scrollContainerRef]);

  return metrics;
}
