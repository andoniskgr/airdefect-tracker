const SESSION_ACTIVE_KEY = "airdefect_session_active";

export function clearAppLocalStorage(): void {
  try {
    localStorage.clear();
  } catch {
    // ignore storage errors
  }
}

export function endAppSession(): void {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    // ignore storage errors
  }
}

export function initAppSession(): void {
  try {
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const isReload = nav?.type === "reload";

    if (isReload) {
      if (!localStorage.getItem(SESSION_ACTIVE_KEY)) {
        localStorage.setItem(SESSION_ACTIVE_KEY, "true");
      }
      return;
    }

    if (!localStorage.getItem(SESSION_ACTIVE_KEY)) {
      localStorage.clear();
      localStorage.setItem(SESSION_ACTIVE_KEY, "true");
    }
  } catch {
    // ignore storage errors
  }
}

function handlePageHide(event: PageTransitionEvent): void {
  if (event.persisted) {
    return;
  }

  try {
    localStorage.removeItem(SESSION_ACTIVE_KEY);
  } catch {
    // ignore storage errors
  }
}

export function registerSessionLifecycleHandlers(): void {
  window.addEventListener("pagehide", handlePageHide);
}
