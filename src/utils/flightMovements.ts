import { getApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import "@/utils/firebaseDB";
import type { FlightMovementLine } from "@/types/flightMovement";

export const REFRESH_MS = 10_000;
export const TARGET_TAIL = "SX-DVY";

const functions = getFunctions(getApp(), "us-central1");

const callableErrorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === "object") {
    const anyErr = err as {
      message?: string;
      details?: unknown;
      code?: string;
    };
    if (typeof anyErr.message === "string" && anyErr.message.trim()) {
      return anyErr.message.replace(/^Firebase:\s*/i, "").trim();
    }
  }
  return fallback;
};

type LoginResult = { success: boolean };
type LogoutResult = { success: boolean };
type FetchResult = {
  success: boolean;
  lines?: FlightMovementLine[];
  meta?: Record<string, unknown>;
};

export async function loginOpCenter(
  username: string,
  password: string
): Promise<void> {
  try {
    const fn = httpsCallable(functions, "opCenterLogin");
    const result = await fn({ username, password });
    const data = result.data as LoginResult;
    if (!data?.success) {
      throw new Error("OpCenter login failed.");
    }
  } catch (err) {
    throw new Error(callableErrorMessage(err, "OpCenter login failed."));
  }
}

export async function logoutOpCenter(): Promise<void> {
  try {
    const fn = httpsCallable(functions, "opCenterLogout");
    await fn({});
  } catch (err) {
    throw new Error(callableErrorMessage(err, "OpCenter logout failed."));
  }
}

export async function fetchFlightMovementLines(
  tailNumber: string = TARGET_TAIL
): Promise<FlightMovementLine[]> {
  try {
    const fn = httpsCallable(functions, "opCenterFetchMovements");
    const result = await fn({ tailNumber });
    const data = result.data as FetchResult;
    if (!data?.success) {
      throw new Error("Failed to fetch OpCenter movements.");
    }
    return Array.isArray(data.lines) ? data.lines : [];
  } catch (err) {
    throw new Error(
      callableErrorMessage(err, "Failed to fetch OpCenter movements.")
    );
  }
}
