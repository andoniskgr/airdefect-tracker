import { useEffect, useState, type ReactNode } from "react";
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

function ImageLightbox({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex cursor-zoom-out items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="presentation"
    >
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
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const parts = text.split(URL_OR_DATA_IMAGE);
  const nodes: ReactNode[] = [];

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
            zoomableImages ? () => setZoomSrc(part) : undefined
          }
          onKeyDown={
            zoomableImages
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setZoomSrc(part);
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
      {zoomSrc ? (
        <ImageLightbox src={zoomSrc} onClose={() => setZoomSrc(null)} />
      ) : null}
    </>
  );
}
