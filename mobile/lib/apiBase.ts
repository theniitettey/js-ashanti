import Constants from "expo-constants";

/** Must match backend default `PORT` (see backend `.env.example`). */
export const DEV_API_PORT = 4001;

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Expo sets `hostUri` / `experienceUrl` to the Reachable Metro address.
 * Same host normally runs Express on your machine, so reuse it for the API URL.
 */
function hostFromLanStyleHostUri(hostUri: string): string {
  // IPv6 " [::1]:8081 " style — keep full bracket section as host if present
  const ipv6Bracket = hostUri.startsWith("[");
  const portSep = ipv6Bracket
    ? hostUri.indexOf("]:") !== -1
      ? hostUri.indexOf("]:")
      : -1
    : hostUri.lastIndexOf(":");

  if (portSep === -1) return hostUri;
  const host = ipv6Bracket ? hostUri.slice(0, portSep + 1) : hostUri.slice(0, portSep);

  return host.trim();
}

/** Host Expo uses to reach Metro in dev — use for API calls to the dev machine too. */
function inferDevPackagerHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (typeof hostUri === "string" && hostUri.trim()) {
    const host = hostFromLanStyleHostUri(hostUri.trim());
    return host.trim() ? host.trim() : null;
  }

  const expUrl = Constants.experienceUrl;
  if (typeof expUrl === "string" && expUrl.startsWith("exp://")) {
    const rest = expUrl.slice("exp://".length).split(/[/?]/)[0] ?? "";
    if (!rest) return null;

    let authority = rest;
    if (authority.includes("@")) {
      authority = authority.split("@").pop()!;
    }

    const host = hostFromLanStyleHostUri(authority.trim());
    return host.trim() ? host.trim() : null;
  }

  return null;
}

/** Whether this host looks like we're on LAN / loopback vs cloud tunnel URLs. */
function isLikelyLocalDevPackager(host: string): boolean {
  if (host === "localhost" || host === "127.0.0.1") return true;
  const ipv4 = /^\d{1,3}(\.\d{1,3}){3}$/;
  return ipv4.test(host);
}

/** Resolve HTTPS / HTTP backend base URL (no trailing slash). */
export function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) return stripTrailingSlash(fromEnv);

  if (__DEV__) {
    const packagerHost = inferDevPackagerHost();
    if (packagerHost && isLikelyLocalDevPackager(packagerHost)) {
      return `http://${packagerHost}:${DEV_API_PORT}`;
    }
    if (packagerHost && __DEV__) {
      console.warn(
        `[api] Metro host "${packagerHost}" is not a LAN/loopback address. Local API unlikely to work.`,
        `Set EXPO_PUBLIC_API_BASE_URL to your backend (e.g. http://YOUR_MAC_LAN_IP:${DEV_API_PORT}) or expose the API via HTTPS.`,
      );
    }
  }

  return `http://localhost:${DEV_API_PORT}`;
}
