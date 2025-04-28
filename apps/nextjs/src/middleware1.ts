import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspObject: Record<string, string[]> = {
    "default-src": ["self"],
    "script-src": ["self", `nonce-${nonce}`, "strict-dynamic"],
    "style-src": ["self", `nonce-${nonce}`],
    "img-src": ["self"],
    "font-src": ["self"],
    "object-src": ["none"],
    "base-uri": ["self"],
    "form-action": ["self"],
    "frame-ancestors": ["none"],
    "upgrade-insecure-requests": [],
  };
  const contentSecurityPolicyHeaderValue = Object.keys(cspObject).reduce(
    (acc, key) => {
      const items = cspObject[key];
      return (acc += `${key} ${items.map((i) => `'${i}'`).join(" ")}; `);
    },
    ""
  );

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  requestHeaders.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue
  );

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(
    "Content-Security-Policy",
    contentSecurityPolicyHeaderValue
  );

  return response;
}
