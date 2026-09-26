import { useSyncExternalStore } from "react";
import { ACCOUNTS, type Account } from "@/data/accounts";

/** Who is signed in. Stored in the browser for the demo; there is no server session. */
const KEY = "skynet.session";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/**
 * Demo data version. Bumping it wipes every skynet.* key on next load, so the
 * four demo accounts always start the showcase from a clean state.
 */
const DATA_VERSION = "4";
let checked = false;
function resetStaleDemoData() {
  if (checked) return;
  checked = true;
  if (window.localStorage.getItem("skynet.version") === DATA_VERSION) return;
  Object.keys(window.localStorage).filter((k) => k.startsWith("skynet.")).forEach((k) => window.localStorage.removeItem(k));
  window.localStorage.setItem("skynet.version", DATA_VERSION);
}

const read = () => {
  resetStaleDemoData();
  return window.localStorage.getItem(KEY);
};

export type Session = { status: "loading" } | { status: "out" } | { status: "in"; account: Account };

export function useSession(): Session {
  const id = useSyncExternalStore(subscribe, read, () => "__loading__");
  if (id === "__loading__") return { status: "loading" };
  const account = ACCOUNTS.find((a) => a.officeId === id);
  return account ? { status: "in", account } : { status: "out" };
}

export function signIn(account: Account) {
  window.localStorage.setItem(KEY, account.officeId);
  listeners.forEach((cb) => cb());
}

export function signOut() {
  window.localStorage.removeItem(KEY);
  listeners.forEach((cb) => cb());
}
