export function setAuthCookie(res, token) {
    const isProduction = process.env.NODE_ENV === "production";
    const cookie = [
        `authToken=${encodeURIComponent(token)}`,
        "HttpOnly",
        "Path=/",
        "Max-Age=604800",
        `SameSite=${isProduction ? "None" : "Lax"}`,
        ...(isProduction ? ["Secure"] : []),
    ].join("; ");
    res.setHeader("Set-Cookie", cookie);
}
export function clearAuthCookie(res) {
    const isProduction = process.env.NODE_ENV === "production";
    const cookie = [
        "authToken=",
        "HttpOnly",
        "Path=/",
        "Max-Age=0",
        `SameSite=${isProduction ? "None" : "Lax"}`,
        ...(isProduction ? ["Secure"] : []),
    ].join("; ");
    res.setHeader("Set-Cookie", cookie);
}
export function getAuthToken(req) {
    const cookies = req.headers.cookie;
    if (!cookies) {
        return null;
    }
    const authCookie = cookies
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith("authToken="));
    if (!authCookie) {
        return null;
    }
    return decodeURIComponent(authCookie.substring("authToken=".length));
}
//# sourceMappingURL=cookies.js.map