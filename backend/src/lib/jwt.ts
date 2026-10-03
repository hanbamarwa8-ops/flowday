import jwt, {
  type JwtPayload,
} from "jsonwebtoken";

const JWT_SECRET: string =
  process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not defined"
  );
}


// ACCESS TOKEN

export type AccessTokenPayload =
  JwtPayload & {
    userId: string;
    tokenType: "access";
  };


export function generateAccessToken(
  userId: string
): string {
  return jwt.sign(
    {
      userId,
      tokenType: "access",
    },
    JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
}


export function verifyAccessToken(
  token: string
): AccessTokenPayload | null {
  try {

    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      );


    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded &&
      typeof decoded.userId === "string" &&
      "tokenType" in decoded &&
      decoded.tokenType === "access"
    ) {
      return decoded as unknown as AccessTokenPayload;
    }


    return null;

  } catch {
    return null;
  }
}