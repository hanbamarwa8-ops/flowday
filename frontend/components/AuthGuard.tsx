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
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        if (isMounted) {
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        router.replace("/login");
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Pendant la vérification de la session,
  // on n'affiche pas le contenu privé.
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