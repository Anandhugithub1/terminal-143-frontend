import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook that measures nodes with [data-protected-card] inside a wrapper and
 * returns positions for lock icons. Cleans up observers/listeners automatically.
 *
 * - wrapperRef: ref to the container element that *contains* the protected cards.
 * - enabled: when false the hook clears locks and no observers are attached.
 */
export function useProtectedLocks(enabled = true, options = {}) {
  const { lockSize = 40, verticalAdjust = -6 } = options;
  const wrapperRef = useRef(null);
  const layerRef = useRef(null);
  const [locks, setLocks] = useState([]);

  const measure = useCallback(() => {
    const wrapper = wrapperRef.current;
    const layer = layerRef.current;
    if (!wrapper || !layer || !enabled) {
      setLocks([]);
      return;
    }

    const nodes = Array.from(wrapper.querySelectorAll("[data-protected-card]"));
    if (!nodes.length) {
      setLocks([]);
      return;
    }

    const wrapperRect = wrapper.getBoundingClientRect();
    const w = lockSize;
    const h = lockSize;

    const computed = nodes.map((node, idx) => {
      const r = node.getBoundingClientRect();
      const centerX = r.left + r.width / 2;
      const centerY = r.top + r.height / 2 + verticalAdjust;

      let left = centerX - wrapperRect.left;
      let top = centerY - wrapperRect.top;

      left = Math.max(w / 2 + 6, Math.min(left, wrapperRect.width - w / 2 - 6));
      top = Math.max(h / 2 + 6, Math.min(top, wrapperRect.height - h / 2 - 6));

      return { id: `lock-${idx}`, left, top, width: w, height: h };
    });

    setLocks(computed);
  }, [enabled, lockSize, verticalAdjust]);

  useEffect(() => {
    if (!enabled) {
      setLocks([]);
      return;
    }
    // measure initially and after images/fonts/render
    measure();
    const rafId = requestAnimationFrame(() => setTimeout(measure, 80));

    const onResize = () => requestAnimationFrame(measure);
    const onScroll = () => requestAnimationFrame(measure);

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });

    // ResizeObserver -> reacts to element size changes, images, font changes inside wrapper
    let ro;
    if (wrapperRef.current && "ResizeObserver" in window) {
      ro = new ResizeObserver(() => requestAnimationFrame(measure));
      ro.observe(wrapperRef.current);
    }

    // MutationObserver in case DOM structure inside wrapper changes
    let mo;
    if (wrapperRef.current && "MutationObserver" in window) {
      mo = new MutationObserver(() => requestAnimationFrame(measure));
      mo.observe(wrapperRef.current, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      if (ro) ro.disconnect();
      if (mo) mo.disconnect();
      setLocks([]);
    };
  }, [measure, enabled]);

  return { wrapperRef, layerRef, locks };
}
