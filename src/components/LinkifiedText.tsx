import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** https URLs or embedded data:image (e.g. pasted from clipboard in notes). */
const URL_OR_DATA_IMAGE =
  /(https?:\/\/[^\s]+|data:image\/[a-z0-9+.-]+;base64,[A-Za-z0-9+/=]+)/gi;

type LinkifiedTextProps = {
  text: string;
  className?: string;
};

/**
 * Renders plain text with http(s) links and inline data:image URLs as images.
 */
export function LinkifiedText({ text, className }: LinkifiedTextProps) {
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
          className="my-2 block max-h-96 max-w-full rounded-md border object-contain"
        />
      );
    } else {
      nodes.push(part);
    }
  }

  return (
    <span className={cn("whitespace-pre-wrap break-words", className)}>
      {nodes}
    </span>
  );
}
