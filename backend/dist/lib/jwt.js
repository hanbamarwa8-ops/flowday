import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}
export function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: "7d",
    });
}
export function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === "object" &&
            decoded !== null &&
            "userId" in decoded &&
            typeof decoded.userId === "string") {
            return decoded;
        }
        return null;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=jwt.js.map