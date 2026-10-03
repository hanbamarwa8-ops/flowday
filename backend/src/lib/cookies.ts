import type {
  IncomingMessage,
  ServerResponse,
} from "node:http";

const ACCESS_TOKEN_COOKIE = "authToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

const ACCESS_TOKEN_MAX_AGE = 15 * 60;
const REFRESH_TOKEN_MAX_AGE =
  7 * 24 * 60 * 60;

function getCookieOptions(
  maxAge: number,
  path = "/"
): string[] {
  const isProduction =
    process.env.NODE_ENV === "production";

  return [
    "HttpOnly",
    `Path=${path}`,
    `Max-Age=${maxAge}`,
    `SameSite=${isProduction ? "None" : "Lax"}`,
    ...(isProduction ? ["Secure"] : []),
  ];
}

function appendSetCookie(
  res: ServerResponse,
  cookie: string
) {
  const existing =
    res.getHeader("Set-Cookie");

  if (!existing) {
    res.setHeader("Set-Cookie", cookie);
    return;
  }

  if (Array.isArray(existing)) {
    res.setHeader("Set-Cookie", [
      ...existing.map(String),
      cookie,
    ]);
    return;
  }

  res.setHeader("Set-Cookie", [
    String(existing),
    cookie,
  ]);
}

// ACCESS TOKEN COOKIE

export function setAuthCookie(
  res: ServerResponse,
  token: string
) {
  const cookie = [
    `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(token)}`,
    ...getCookieOptions(
      ACCESS_TOKEN_MAX_AGE,
      "/"
    ),
  ].join("; ");

  appendSetCookie(res, cookie);
}

export function clearAuthCookie(
  res: ServerResponse
) {
  const cookie = [
    `${ACCESS_TOKEN_COOKIE}=`,
    ...getCookieOptions(0, "/"),
  ].join("; ");

  appendSetCookie(res, cookie);
}

// REFRESH TOKEN COOKIE

export function setRefreshTokenCookie(
  res: ServerResponse,
  token: string
) {
  const cookie = [
    `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(token)}`,
    ...getCookieOptions(
      REFRESH_TOKEN_MAX_AGE,
      "/api/auth"
    ),
  ].join("; ");

  appendSetCookie(res, cookie);
}

export function clearRefreshTokenCookie(
  res: ServerResponse
) {
  const cookie = [
    `${REFRESH_TOKEN_COOKIE}=`,
    ...getCookieOptions(
      0,
      "/api/auth"
    ),
  ].join("; ");

  appendSetCookie(res, cookie);
}

// READ ACCESS TOKEN

export function getAuthToken(
  req: IncomingMessage
): string | null {
  const cookies = req.headers.cookie;

  if (!cookies) {
    return null;
  }

  const authCookie = cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) =>
      cookie.startsWith(
        `${ACCESS_TOKEN_COOKIE}=`
      )
    );

  if (!authCookie) {
    return null;
  }

  return decodeURIComponent(
    authCookie.substring(
      `${ACCESS_TOKEN_COOKIE}=`.length
    )
  );
}

// READ REFRESH TOKEN

export function getRefreshToken(
  req: IncomingMessage
): string | null {
  const cookies = req.headers.cookie;

  if (!cookies) {
    return null;
  }

  const refreshCookie = cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) =>
      cookie.startsWith(
        `${REFRESH_TOKEN_COOKIE}=`
      )
    );

  if (!refreshCookie) {
    return null;
  }

  return decodeURIComponent(
    refreshCookie.substring(
      `${REFRESH_TOKEN_COOKIE}=`.length
    )
  );
}