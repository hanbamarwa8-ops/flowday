"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

type AuthGuardProps = {
  children: ReactNode;
};

// Prevent multiple refresh requests from running at the same time.

let refreshPromise: Promise<Response> | null = null;

function refreshSession(): Promise<Response> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = fetch(
    `${API_URL}/api/auth/refresh`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    }
  ).finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const router = useRouter();

  const [isCheckingAuth, setIsCheckingAuth] =
    useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        // CHECK ACCESS TOKEN

        let response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        //  ACCESS TOKEN EXPIRED

        if (response.status === 401) {
          const refreshResponse =
            await refreshSession();


          //  REFRESH FAILED


          if (!refreshResponse.ok) {
            if (isMounted) {
              router.replace("/login");
            }

            return;
          }

          // RETRY /ME

          response = await fetch(
            `${API_URL}/api/auth/me`,
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          );
        }


        // AUTHENTICATION FAILED


        if (!response.ok) {
          if (isMounted) {
            router.replace("/login");
          }

          return;
        }

        // AUTHENTICATED

        if (isMounted) {
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        if (isMounted) {
          router.replace("/login");
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // LOADING


  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9ff]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-100 border-t-purple-500" />

          <p className="mt-4 text-sm text-gray-400">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
