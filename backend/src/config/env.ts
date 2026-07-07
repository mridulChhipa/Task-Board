import 'dotenv/config';

/**
 * Read a required environment variable, failing loudly instead of silently
 * falling back to an empty value (an empty JWT secret would still sign and
 * verify tokens).
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
