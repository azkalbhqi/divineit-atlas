import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

/**
 * Hashes a plain text password using Node's native scrypt algorithm.
 * Returns the format `salt:hash` in hex.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifies a plain text password against a stored password string.
 * Supports backward-compatible plain-text fallback if the stored password
 * does not contain a salt/hash separator (colon).
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  // Fallback for existing plain-text/seeded user passwords
  if (!storedHash.includes(":")) {
    return password === storedHash;
  }

  try {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash) return false;

    const computedHash = scryptSync(password, salt, 64);
    const storedHashBuffer = Buffer.from(hash, "hex");

    return timingSafeEqual(computedHash, storedHashBuffer);
  } catch (err) {
    console.error("Error during password verification:", err);
    return false;
  }
}
