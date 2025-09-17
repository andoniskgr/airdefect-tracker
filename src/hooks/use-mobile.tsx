import * as React from "react";

// Breakpoint for mobile and tablet devices (includes tablets up to 1024px)
const MOBILE_TABLET_BREAKPOINT = 1024;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(
      `(max-width: ${MOBILE_TABLET_BREAKPOINT - 1}px)`
    );
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_TABLET_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_TABLET_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
