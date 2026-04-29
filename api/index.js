// Configure this function to run on Vercel Edge Runtime
export const config = { runtime: "edge" };

// Base target domain (e.g. https://example.com)
// Removes trailing slash if present
const TARGET_BASE = (process.env.TARGET_DOMAIN || "").replace(/\/$/, "");

// Headers that should NOT be forwarded to the target server
// These are either hop-by-hop headers or can break proxy behavior
const STRIP_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "forwarded",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-port",
]);

// Main request handler (acts like a proxy/relay)
export default async function handler(req) {
  // If TARGET_DOMAIN is not set, return server error
  if (!TARGET_BASE) {
    return new Response("Misconfigured: TARGET_DOMAIN is not set", { status: 500 });
  }

  try {
    // Extract path from incoming request URL (skip protocol + domain)
    const pathStart = req.url.indexOf("/", 8);

    // Build target URL by appending path to TARGET_BASE
    const targetUrl =
      pathStart === -1 ? TARGET_BASE + "/" : TARGET_BASE + req.url.slice(pathStart);

    // Prepare outgoing headers
    const out = new Headers();
    let clientIp = null;

    // Loop through incoming request headers
    for (const [k, v] of req.headers) {
      // Skip headers that should not be forwarded
      if (STRIP_HEADERS.has(k)) continue;

      // Skip Vercel-specific internal headers
      if (k.startsWith("x-vercel-")) continue;

      // Capture real client IP if available
      if (k === "x-real-ip") {
        clientIp = v;
        continue;
      }

      // Fallback: use x-forwarded-for if x-real-ip is not set
      if (k === "x-forwarded-for") {
        if (!clientIp) clientIp = v;
        continue;
      }

      // Forward all other headers
      out.set(k, v);
    }

    // Reattach client IP as x-forwarded-for header
    if (clientIp) out.set("x-forwarded-for", clientIp);

    const method = req.method;

    // Only include body for methods that support it
    const hasBody = method !== "GET" && method !== "HEAD";

    // Forward the request to target server
    return await fetch(targetUrl, {
      method,
      headers: out,
      body: hasBody ? req.body : undefined,

      // Required for streaming request bodies in Edge runtime
      duplex: "half",

      // Prevent automatic redirect following
      redirect: "manual",
    });
  } catch (err) {
    // Log error for debugging
    console.error("relay error:", err);

    // Return gateway error if request fails
    return new Response("Bad Gateway: Tunnel Failed", { status: 502 });
  }
}
