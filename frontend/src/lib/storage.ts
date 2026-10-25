import type { User } from '../api/types';

const KEY = 'dealership.auth';

export interface StoredAuth {
  token: string;
  user: User;
}

// Every access is wrapped: storage can be blocked (private mode) or corrupted.
export function loadAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function saveAuth(auth: StoredAuth): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(auth));
  } catch {
    /* storage unavailable: user simply has to log in again next visit */
  }
}

export function clearAuth(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}