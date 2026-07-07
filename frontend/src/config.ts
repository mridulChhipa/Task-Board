/**
 * API endpoints come from Vite env vars so the app can run against any
 * backend, falling back to the local dev server.
 */
export const API_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const WS_URL: string =
  import.meta.env.VITE_WS_URL ?? API_URL.replace(/^http/, 'ws');
