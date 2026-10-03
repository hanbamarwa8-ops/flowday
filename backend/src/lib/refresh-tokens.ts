import crypto from "node:crypto";

import RefreshToken from "../models/RefreshToken.js";

const REFRESH_TOKEN_BYTES = 64;

export const REFRESH_TOKEN_TTL_MS =
  7 * 24 * 60 * 60 * 1000;

// GENERATE REFRESH TOKEN

export function generateRefreshToken(): string {
  return crypto
    .randomBytes(REFRESH_TOKEN_BYTES)
    .toString("hex");
}

// HASH REFRESH TOKEN

export function hashRefreshToken(
  token: string
): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

// GENERATE TOKEN FAMILY ID

export function generateTokenFamilyId(): string {
  return crypto.randomUUID();
}

// CREATE STORED REFRESH TOKEN

export async function createStoredRefreshToken(
  userId: string,
  familyId = generateTokenFamilyId()
) {
  const token =
    generateRefreshToken();

  const tokenHash =
    hashRefreshToken(token);

  const expiresAt = new Date(
    Date.now() +
      REFRESH_TOKEN_TTL_MS
  );

  await RefreshToken.create({
    userId,
    tokenHash,
    familyId,
    expiresAt,
  });

  return {
    token,
    tokenHash,
    familyId,
    expiresAt,
  };
}

// ROTATE REFRESH TOKEN

export async function rotateStoredRefreshToken(
  currentToken: {
    _id: unknown;
    userId: unknown;
    familyId: string;
  }
) {
  const newToken =
    generateRefreshToken();

  const newTokenHash =
    hashRefreshToken(newToken);

  const expiresAt = new Date(
    Date.now() +
      REFRESH_TOKEN_TTL_MS
  );

  const newStoredToken =
    await RefreshToken.create({
      userId: currentToken.userId,
      tokenHash: newTokenHash,
      familyId: currentToken.familyId,
      expiresAt,
    });

  const revokedCurrentToken =
    await RefreshToken.findOneAndUpdate(
      {
        _id: currentToken._id,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
          replacedByTokenHash:
            newTokenHash,
        },
      },
      {
        returnDocument: "after",
      }
    );

  if (!revokedCurrentToken) {
    await RefreshToken.deleteOne({
      _id: newStoredToken._id,
    });

    return null;
  }

  return {
    token: newToken,
    tokenHash: newTokenHash,
    familyId: currentToken.familyId,
    expiresAt,
  };
}

// REVOKE ONE REFRESH TOKEN
export async function revokeRefreshToken(
  token: string
) {
  const tokenHash =
    hashRefreshToken(token);

  return RefreshToken.findOneAndUpdate(
    {
      tokenHash,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
    }
  );
}

// REVOKE TOKEN FAMILY

export async function revokeRefreshTokenFamily(
  familyId: string
) {
  return RefreshToken.updateMany(
    {
      familyId,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    }
  );
}