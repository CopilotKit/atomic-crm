//#region src/types.d.ts
interface LicenseOwner {
  org_id: string;
  org_name: string;
  contact_email: string;
}
interface LicenseFeatures {
  headless_ui?: boolean;
  dev_console?: boolean;
  chat?: boolean;
  sidebar?: boolean;
  popup?: boolean;
  suggestions?: boolean;
  agents?: boolean;
  voice?: boolean;
  frontend_tools?: boolean;
  human_in_the_loop?: boolean;
  mcp_integration?: boolean;
  custom_activity_renderers?: boolean;
  guardrails?: boolean;
  max_agents?: number;
  max_tools?: number;
  [key: string]: boolean | number | undefined;
}
type LicenseTier = "developer" | "pro" | "enterprise";
interface LicensePayload {
  version: number;
  license_id: string;
  key_id: string;
  owner: LicenseOwner;
  issued_at: string;
  expires_at: string;
  tier: LicenseTier;
  seat_limit: number;
  features: LicenseFeatures;
  remove_branding: boolean;
}
interface LicenseStatus {
  valid: boolean;
  license: LicensePayload | null;
  error: "invalid_signature" | "expired" | "unknown_key" | "parse_error" | null;
  graceRemaining?: number;
  warningSeverity: "none" | "info" | "warning" | "critical";
}
type LicenseMode = "online" | "offline";
interface OnlineVerifyResponse {
  valid: boolean;
  revoked?: boolean;
  refreshed_token?: string;
  message?: string;
}
interface KeyDeliveryResponse {
  keys: Array<{
    key_id: string;
    public_key: string;
    attestation: string;
    status: string;
  }>;
  master_key_id?: string;
} //#endregion
//#region src/verify.d.ts

//# sourceMappingURL=types.d.ts.map
/**
 * Verify a license token offline using Ed25519 signature.
 * This is a pure function — no caching. Callers should cache the result.
 */
declare function verifyLicense(token: string): LicenseStatus;
/**
 * Check whether a specific feature is enabled in the license.
 * Returns false if the license is null or the feature is not present (deny by default).
 */
declare function isFeatureEnabled(license: LicensePayload | null, feature: string): boolean;
/**
 * Get a numeric feature limit from the license.
 * Returns null if the license is null, the feature is missing, or the value is not a number.
 */
declare function getFeatureLimit(license: LicensePayload | null, feature: string): number | null;

//#endregion
//#region src/keystore.d.ts
//# sourceMappingURL=verify.d.ts.map
/**
 * Master public key — root of trust.
 * Baked in at build time via tsdown `env` (replaces process.env.BAKED_MASTER_PUBLIC_KEY).
 * Not overridable at runtime — this is the root of the trust chain.
 */
declare function getMasterPublicKey(): string | null;
declare const LICENSE_PUBLIC_KEYS: Record<string, string>;
/**
 * Get a public key by key ID.
 * Checks runtime keys first (network-delivered), then bundled keys.
 */
declare function getPublicKey(keyId: string): string | null;
/**
 * Add a runtime key fetched from the network.
 * Only call this after verifying the key's attestation.
 */
declare function addRuntimeKey(keyId: string, publicKey: string): void;
/** Remove all runtime keys from the in-memory registry. */
declare function clearRuntimeKeys(): void;
interface KeyAttestationData {
  keyId: string;
  publicKey: string;
  attestationSig: string;
}
/**
 * Verify a key attestation against the master public key.
 * The attestation is a signature of `keyId:publicKey` by the master key.
 */
declare function verifyKeyAttestation(attestation: KeyAttestationData): boolean;

//#endregion
//#region src/feature-registry.d.ts
//# sourceMappingURL=keystore.d.ts.map
interface FeatureDefinition {
  displayName: string;
  component?: boolean;
  runtime?: boolean;
}
declare const LICENSED_FEATURES: Record<string, FeatureDefinition>;
declare function getFeatureDisplayName(feature: string): string;
declare function isComponentFeature(feature: string): boolean;
declare function isRuntimeFeature(feature: string): boolean;

//#endregion
//#region src/online-verifier.d.ts
declare const LICENSING_BASE_URL = "https://licensing.copilotkit.ai";
interface OnlineVerifierOptions {
  baseUrl?: string;
  timeoutMs?: number;
}
/**
 * Create an online verifier.
 * STUB: Always returns null until ops-api endpoints exist (Phase 6/7).
 */
declare function createOnlineVerifier(_options?: OnlineVerifierOptions): {
  verifyOnline: (_token?: string) => Promise<OnlineVerifyResponse | null>;
  fetchKeys: () => Promise<KeyDeliveryResponse["keys"] | null>;
};

//#endregion
//#region src/context.d.ts
/**
 * License context value exposed to child components.
 * React providers create their own React Context using this shape.
 */
interface LicenseContextValue {
  /** The resolved license status after verification. Null if no token provided. */
  status: LicenseStatus | null;
  /** Convenience: the license payload if valid, null otherwise. */
  license: LicensePayload | null;
  /** Whether a specific feature is licensed. Returns true if no licensing is active (no token). */
  checkFeature: (feature: string) => boolean;
  /** Get a numeric feature limit. Returns null if not applicable. */
  getLimit: (feature: string) => number | null;
}
/**
 * Create a license context value from a verification result.
 * When no token is provided (status is null), all features return true (unlicensed = unrestricted, with branding).
 */
declare function createLicenseContextValue(status: LicenseStatus | null): LicenseContextValue;

//#endregion
//#region src/license-check.d.ts
//# sourceMappingURL=context.d.ts.map
/**
 * Runtime-agnostic license checker that caches verification results
 * and re-evaluates expiration on each access for long-lived processes.
 */
interface LicenseChecker {
  /** Get the current license status, re-evaluating expiration. */
  getStatus(): LicenseStatus;
  /** Check whether a specific feature is enabled. Returns true when no token (soft enforcement). */
  checkFeature(feature: string): boolean;
}
/**
 * Create a license checker that verifies the token once at construction
 * and re-evaluates expiration on each `getStatus()` call.
 *
 * When no token is provided, falls back to `COPILOTKIT_LICENSE_TOKEN` env var.
 * Missing/invalid tokens result in soft enforcement (features allowed, warnings emitted).
 */
declare function createLicenseChecker(licenseToken?: string): LicenseChecker;
/**
 * Generate a license warning HTTP header based on the checker's current status.
 * Returns null when no warning is needed.
 */
declare function getLicenseWarningHeader(checker?: LicenseChecker): {
  key: string;
  value: string;
} | null;

//#endregion
//# sourceMappingURL=license-check.d.ts.map

export { KeyAttestationData, KeyDeliveryResponse, LICENSED_FEATURES, LICENSE_PUBLIC_KEYS, LICENSING_BASE_URL, LicenseChecker, LicenseContextValue, LicenseFeatures, LicenseMode, LicenseOwner, LicensePayload, LicenseStatus, LicenseTier, OnlineVerifyResponse, addRuntimeKey, clearRuntimeKeys, createLicenseChecker, createLicenseContextValue, createOnlineVerifier, getFeatureDisplayName, getFeatureLimit, getLicenseWarningHeader, getMasterPublicKey, getPublicKey, isComponentFeature, isFeatureEnabled, isRuntimeFeature, verifyKeyAttestation, verifyLicense };
//# sourceMappingURL=index.d.mts.map