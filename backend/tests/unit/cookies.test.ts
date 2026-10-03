import {
  describe,
  expect,
  jest,
  test,
  beforeEach,
  afterEach,
} from "@jest/globals";

import {
  setAuthCookie,
  clearAuthCookie,
  getAuthToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshToken,
} from "../../src/lib/cookies.js";

function createMockResponse() {
  const headers: Record<
    string,
    string | string[] | undefined
  > = {};

  const setHeader = jest.fn(
    (
      name: string,
      value: string | string[]
    ) => {
      headers[name] = value;
    }
  );

  const getHeader = jest.fn(
    (name: string) => {
      return headers[name];
    }
  );

  return {
    response: {
      setHeader,
      getHeader,
    } as any,

    setHeader,
    getHeader,
    headers,
  };
}

describe("Cookie utilities", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  // ACCESS TOKEN COOKIE

  test("should set the auth cookie in development/test mode", () => {
    const { response, setHeader } =
      createMockResponse();

    const token = "my-test-token";

    setAuthCookie(response, token);

    expect(setHeader).toHaveBeenCalledWith(
      "Set-Cookie",
      "authToken=my-test-token; HttpOnly; Path=/; Max-Age=900; SameSite=Lax"
    );
  });

  test(
    "should set the auth cookie with Secure and SameSite=None in production",
    () => {
      process.env.NODE_ENV = "production";

      const { response, setHeader } =
        createMockResponse();

      const token = "production-token";

      setAuthCookie(response, token);

      expect(setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        "authToken=production-token; HttpOnly; Path=/; Max-Age=900; SameSite=None; Secure"
      );
    }
  );

  test("should clear the auth cookie", () => {
    const { response, setHeader } =
      createMockResponse();

    clearAuthCookie(response);

    expect(setHeader).toHaveBeenCalledWith(
      "Set-Cookie",
      "authToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
    );
  });

  test("should get the auth token from cookies", () => {
    const request = {
      headers: {
        cookie:
          "session=abc; authToken=my-test-token; theme=dark",
      },
    } as any;

    const token = getAuthToken(request);

    expect(token).toBe("my-test-token");
  });

  test("should decode an encoded auth token", () => {
    const request = {
      headers: {
        cookie:
          "authToken=my%20encoded%20token%20123",
      },
    } as any;

    const token = getAuthToken(request);

    expect(token).toBe(
      "my encoded token 123"
    );
  });

  test(
    "should return null when there is no cookie header",
    () => {
      const request = {
        headers: {},
      } as any;

      const token = getAuthToken(request);

      expect(token).toBeNull();
    }
  );

  test(
    "should return null when authToken is missing",
    () => {
      const request = {
        headers: {
          cookie:
            "session=abc; theme=dark",
        },
      } as any;

      const token = getAuthToken(request);

      expect(token).toBeNull();
    }
  );

  // REFRESH TOKEN COOKIE

  test(
    "should set the refresh token cookie in development/test mode",
    () => {
      const { response, setHeader } =
        createMockResponse();

      const token = "my-refresh-token";

      setRefreshTokenCookie(
        response,
        token
      );

      expect(setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        "refreshToken=my-refresh-token; HttpOnly; Path=/api/auth; Max-Age=604800; SameSite=Lax"
      );
    }
  );

  test(
    "should set the refresh token cookie with Secure and SameSite=None in production",
    () => {
      process.env.NODE_ENV = "production";

      const { response, setHeader } =
        createMockResponse();

      const token =
        "production-refresh-token";

      setRefreshTokenCookie(
        response,
        token
      );

      expect(setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        "refreshToken=production-refresh-token; HttpOnly; Path=/api/auth; Max-Age=604800; SameSite=None; Secure"
      );
    }
  );

  test(
    "should clear the refresh token cookie",
    () => {
      const { response, setHeader } =
        createMockResponse();

      clearRefreshTokenCookie(
        response
      );

      expect(setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        "refreshToken=; HttpOnly; Path=/api/auth; Max-Age=0; SameSite=Lax"
      );
    }
  );

  test(
    "should get the refresh token from cookies",
    () => {
      const request = {
        headers: {
          cookie:
            "session=abc; refreshToken=my-refresh-token; theme=dark",
        },
      } as any;

      const token =
        getRefreshToken(request);

      expect(token).toBe(
        "my-refresh-token"
      );
    }
  );

  test(
    "should decode an encoded refresh token",
    () => {
      const request = {
        headers: {
          cookie:
            "refreshToken=my%20encoded%20refresh%20token%20123",
        },
      } as any;

      const token =
        getRefreshToken(request);

      expect(token).toBe(
        "my encoded refresh token 123"
      );
    }
  );

  test(
    "should return null when there is no refresh cookie header",
    () => {
      const request = {
        headers: {},
      } as any;

      const token =
        getRefreshToken(request);

      expect(token).toBeNull();
    }
  );

  test(
    "should return null when refreshToken is missing",
    () => {
      const request = {
        headers: {
          cookie:
            "session=abc; theme=dark",
        },
      } as any;

      const token =
        getRefreshToken(request);

      expect(token).toBeNull();
    }
  );

  // MULTIPLE COOKIES

  test(
    "should support setting both auth and refresh cookies",
    () => {
      const {
        response,
        headers,
      } = createMockResponse();

      setAuthCookie(
        response,
        "access-token"
      );

      setRefreshTokenCookie(
        response,
        "refresh-token"
      );

      expect(
        headers["Set-Cookie"]
      ).toEqual([
        "authToken=access-token; HttpOnly; Path=/; Max-Age=900; SameSite=Lax",
        "refreshToken=refresh-token; HttpOnly; Path=/api/auth; Max-Age=604800; SameSite=Lax",
      ]);
    }
  );

  test(
    "should support clearing both auth and refresh cookies",
    () => {
      const {
        response,
        headers,
      } = createMockResponse();

      clearAuthCookie(response);

      clearRefreshTokenCookie(
        response
      );

      expect(
        headers["Set-Cookie"]
      ).toEqual([
        "authToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
        "refreshToken=; HttpOnly; Path=/api/auth; Max-Age=0; SameSite=Lax",
      ]);
    }
  );
});