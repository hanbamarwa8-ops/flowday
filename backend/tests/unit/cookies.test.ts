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
  } from "../../src/lib/cookies.js";
  
  describe("Cookie utilities", () => {
    const originalNodeEnv = process.env.NODE_ENV;
  
    beforeEach(() => {
      process.env.NODE_ENV = "test";
    });
  
    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });
  
    test("should set the auth cookie in development/test mode", () => {
      const setHeader = jest.fn();
  
      const response = {
        setHeader,
      } as any;
  
      const token = "my-test-token";
  
      setAuthCookie(response, token);
  
      expect(setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        "authToken=my-test-token; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax"
      );
    });
  
    test("should set the auth cookie with Secure and SameSite=None in production", () => {
      process.env.NODE_ENV = "production";
  
      const setHeader = jest.fn();
  
      const response = {
        setHeader,
      } as any;
  
      const token = "production-token";
  
      setAuthCookie(response, token);
  
      expect(setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        "authToken=production-token; HttpOnly; Path=/; Max-Age=604800; SameSite=None; Secure"
      );
    });
  
    test("should clear the auth cookie", () => {
      const setHeader = jest.fn();
  
      const response = {
        setHeader,
      } as any;
  
      clearAuthCookie(response);
  
      expect(setHeader).toHaveBeenCalledWith(
        "Set-Cookie",
        "authToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
      );
    });
  
    test("should get the auth token from cookies", () => {
      const request = {
        headers: {
          cookie: "session=abc; authToken=my-test-token; theme=dark",
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
  
      expect(token).toBe("my encoded token 123");
    });
  
    test("should return null when there is no cookie header", () => {
      const request = {
        headers: {},
      } as any;
  
      const token = getAuthToken(request);
  
      expect(token).toBeNull();
    });
  
    test("should return null when authToken is missing", () => {
      const request = {
        headers: {
          cookie: "session=abc; theme=dark",
        },
      } as any;
  
      const token = getAuthToken(request);
  
      expect(token).toBeNull();
    });
  });