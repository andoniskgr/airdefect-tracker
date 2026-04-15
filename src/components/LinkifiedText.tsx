import type { ReactNode } from "react";

const URL_CAPTURE = /(https?:\/\/[^\s]+)/gi;

type LinkifiedTextProps = {
  text: string;
  className?: string;
};

/**
 * Renders plain text with http(s) URLs as clickable links (new tab, noopener).
 */
export function LinkifiedText({ text, className }: LinkifiedTextProps) {
  const parts = text.split(URL_CAPTURE);
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
          className="text-primary underline underline-offset-2 break-all hover:opacity-90"
        >
          {part}
        </a>
      );
    } else {
      nodes.push(part);
    }
  }

  return <span className={className}>{nodes}</span>;
}
