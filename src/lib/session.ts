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

const read = () => window.localStorage.getItem(KEY);

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
