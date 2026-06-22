/**
 * auth.service.js — Authentication operations
 *
 * All auth logic lives here. UI components never call base44.auth directly.
 *
 * Migration path: replace the base44 imports with your new auth provider
 * (Supabase Auth, Firebase Auth, Auth0, etc.) and update the function bodies.
 * The exported function signatures stay the same.
 */
import { auth, DEMO_MODE } from "./base44Client.js";

/** @returns {Promise<import("./types.js").User|null>} */
export async function getCurrentUser() {
  if (DEMO_MODE) {
    return { id: "demo-user", email: "parent@familysync.app", fullName: "Demo Parent" };
  }
  return auth.me();
}

/**
 * @param {string} email
 * @param {string} password
 */
export async function loginWithEmail(email, password) {
  return auth.loginViaEmailPassword(email, password);
}

/** Opens Google OAuth flow */
export async function loginWithGoogle() {
  return auth.loginWithProvider("google");
}

/**
 * @param {{ email: string, password: string, fullName: string }} data
 */
export async function register(data) {
  return auth.register(data);
}

export async function logout() {
  if (DEMO_MODE) return;
  return auth.logout?.();
}

export async function verifyOtp(email, otpCode) {
  return auth.verifyOtp({ email, otpCode });
}

export async function resendOtp(email) {
  return auth.resendOtp(email);
}
