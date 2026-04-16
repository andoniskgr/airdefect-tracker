import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/** https URLs or embedded data:image (e.g. pasted from clipboard in notes). */
const URL_OR_DATA_IMAGE =
  /(https?:\/\/[^\s]+|data:image\/[a-z0-9+.-]+;base64,[A-Za-z0-9+/=]+)/gi;

type LinkifiedTextProps = {
  text: string;
  className?: string;
  /** When true, inline images open full-size in an overlay on click (portal to body). */
  zoomableImages?: boolean;
};

function getDataImageSources(text: string): string[] {
  const parts = text.split(URL_OR_DATA_IMAGE);
  const out: string[] = [];
  for (const part of parts) {
    if (/^data:image\//i.test(part)) out.push(part);
  }
  return out;
}

function ImageLightbox({
  sources,
  index,
  onNavigate,
  onClose,
}: {
  sources: string[];
  index: number;
  onNavigate: (next: number) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        if (index > 0) onNavigate(index - 1);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        if (index < sources.length - 1) onNavigate(index + 1);
        return;
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose, onNavigate, index, sources.length]);

  const src = sources[index] ?? "";

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex cursor-zoom-out items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="presentation"
    >
      {sources.length > 1 && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-[201] -translate-x-1/2 rounded-full bg-black/65 px-3 py-1.5 text-sm tabular-nums text-white shadow-lg">
          {index + 1} / {sources.length}
          <span className="ml-2 text-white/70">← →</span>
        </div>
      )}
      <img
        src={src}
        alt=""
        className="max-h-[95vh] max-w-[95vw] cursor-default object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body
  );
}

/**
 * Renders plain text with http(s) links and inline data:image URLs as images.
 */
export function LinkifiedText({
  text,
  className,
  zoomableImages = false,
}: LinkifiedTextProps) {
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const imageSrcs = useMemo(() => getDataImageSources(text), [text]);

  useEffect(() => {
    if (zoomIndex === null) return;
    if (imageSrcs.length === 0) {
      setZoomIndex(null);
      return;
    }
    if (zoomIndex >= imageSrcs.length) {
      setZoomIndex(imageSrcs.length - 1);
    }
  }, [imageSrcs.length, zoomIndex, text]);

  const parts = text.split(URL_OR_DATA_IMAGE);
  const nodes: ReactNode[] = [];
  let imgSerial = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (/^https?:\/\//i.test(part)) {
      nodes.push(
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline underline-offset-2 break-all hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {part}
        </a>
      );
    } else if (/^data:image\//i.test(part)) {
      const imgIndex = imgSerial++;
      nodes.push(
        <img
          key={i}
          src={part}
          alt=""
          className={cn(
            "my-2 block max-h-96 max-w-full rounded-md border object-contain",
            zoomableImages &&
              "cursor-zoom-in transition-opacity hover:opacity-90"
          )}
          onClick={
            zoomableImages ? () => setZoomIndex(imgIndex) : undefined
          }
          onKeyDown={
            zoomableImages
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setZoomIndex(imgIndex);
                  }
                }
              : undefined
          }
          role={zoomableImages ? "button" : undefined}
          tabIndex={zoomableImages ? 0 : undefined}
        />
      );
    } else {
      nodes.push(part);
    }
  }

  return (
    <>
      <span className={cn("whitespace-pre-wrap break-words", className)}>
        {nodes}
      </span>
      {zoomIndex !== null && imageSrcs.length > 0 ? (
        <ImageLightbox
          sources={imageSrcs}
          index={zoomIndex}
          onNavigate={setZoomIndex}
          onClose={() => setZoomIndex(null)}
        />
      ) : null}
    </>
  );
}
