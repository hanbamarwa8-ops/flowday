"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Trash2,
  Users,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

type UserRole = "USER" | "ADMIN";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
};

type MeResponse = {
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
};

type UsersResponse = {
  users: AdminUser[];
};

async function refreshSession() {
  return fetch(
    `${API_URL}/api/auth/refresh`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    }
  );
}

async function fetchWithRefresh(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  let response = await fetch(input, {
    ...init,
    credentials: "include",
    cache: "no-store",
  });

  if (response.status !== 401) {
    return response;
  }

  const refreshResponse =
    await refreshSession();

  if (!refreshResponse.ok) {
    return response;
  }

  response = await fetch(input, {
    ...init,
    credentials: "include",
    cache: "no-store",
  });

  return response;
}

function formatDate(
  value?: string
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(new Date(value));
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminContent />
    </AuthGuard>
  );
}

function AdminContent() {
  const router = useRouter();

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [users, setUsers] = useState<
    AdminUser[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    async function loadAdminData() {
      try {
        setIsLoading(true);
        setError("");

        // CHECK CURRENT USER

        const meResponse =
          await fetchWithRefresh(
            `${API_URL}/api/auth/me`,
            {
              method: "GET",
            }
          );

        if (!meResponse.ok) {
          router.replace("/login");
          return;
        }

        const meData =
          (await meResponse.json()) as MeResponse;

        const currentUser =
          meData.user;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        setCurrentUserId(
          currentUser.id
        );

        
        // CHECK ROLE

        if (currentUser.role !== "ADMIN") {
          router.replace("/dashboard");
          return;
        }

        // LOAD USERS

        const usersResponse =
          await fetchWithRefresh(
            `${API_URL}/api/admin/users`,
            {
              method: "GET",
            }
          );

        if (
          usersResponse.status === 403
        ) {
          router.replace("/dashboard");
          return;
        }

        if (!usersResponse.ok) {
          throw new Error(
            "Unable to load users"
          );
        }

        const usersData =
          (await usersResponse.json()) as UsersResponse;

        setUsers(
          usersData.users ?? []
        );
      } catch (error) {
        console.error(
          "Unable to load admin page:",
          error
        );

        setError(
          "Unable to load users. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadAdminData();
  }, [router]);

  async function handleDeleteUser(
    userId: string,
    userName: string
  ) {
    if (
      userId === currentUserId
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${userName}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(userId);
      setError("");
      setSuccess("");

      const response =
        await fetchWithRefresh(
          `${API_URL}/api/admin/users/${userId}`,
          {
            method: "DELETE",
          }
        );

      if (
        response.status === 403
      ) {
        setError(
          "You do not have permission to delete this user."
        );
        return;
      }

      if (
        response.status === 400
      ) {
        setError(
          "This user cannot be deleted."
        );
        return;
      }

      if (
        response.status === 404
      ) {
        setError(
          "User not found."
        );

        setUsers((currentUsers) =>
          currentUsers.filter(
            (user) =>
              user._id !== userId
          )
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          "Delete request failed"
        );
      }

      setUsers((currentUsers) =>
        currentUsers.filter(
          (user) =>
            user._id !== userId
        )
      );

      setSuccess(
        `${userName} was deleted successfully.`
      );
    } catch (error) {
      console.error(
        "Unable to delete user:",
        error
      );

      setError(
        "Unable to delete this user. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#faf9ff]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 px-6 py-8 lg:px-8">
          <div className="mx-auto max-w-7xl">

            {/* PAGE HEADER */}

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <ShieldCheck
                      size={19}
                      strokeWidth={1.8}
                    />
                  </div>

                  <span className="text-sm font-medium text-purple-600">
                    Administration
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  User management
                </h1>

                <p className="mt-1 text-sm text-gray-400">
                  Manage FlowDay users from one place.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-purple-100 bg-white px-4 py-3 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Users
                    size={18}
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Total users
                  </p>

                  <p className="text-lg font-semibold text-gray-900">
                    {users.length}
                  </p>
                </div>
              </div>
            </div>

            {/* SUCCESS */}

            {success && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle2
                  size={18}
                  strokeWidth={1.8}
                />

                <span>{success}</span>
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle
                  size={18}
                  strokeWidth={1.8}
                />

                <span>{error}</span>
              </div>
            )}

            {/* USERS CARD */}

            <div className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm">

              {/* CARD HEADER */}

              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="text-base font-semibold text-gray-900">
                  All users
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Users registered in your FlowDay application.
                </p>
              </div>

              {/* LOADING */}

              {isLoading ? (
                <div className="flex min-h-72 items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-purple-100 border-t-purple-500" />

                    <p className="mt-4 text-sm text-gray-400">
                      Loading users...
                    </p>
                  </div>
                </div>
              ) : users.length === 0 ? (
                /* EMPTY */

                <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-500">
                    <Users
                      size={25}
                      strokeWidth={1.7}
                    />
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-gray-800">
                    No users found
                  </h3>

                  <p className="mt-1 text-sm text-gray-400">
                    There are no users to display.
                  </p>
                </div>
              ) : (
                /* TABLE */

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/70">
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          User
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Email
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Role
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Joined
                        </th>

                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map((user) => {
                        const isCurrentUser =
                          user._id ===
                          currentUserId;

                        const isDeleting =
                          deletingId ===
                          user._id;

                        return (
                          <tr
                            key={user._id}
                            className="border-b border-gray-50 last:border-b-0"
                          >
                            {/* USER */}

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
                                  {user.name
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <p className="font-medium text-gray-800">
                                    {user.name}
                                  </p>

                                  {isCurrentUser && (
                                    <p className="mt-0.5 text-xs text-purple-500">
                                      You
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* EMAIL */}

                            <td className="px-6 py-5 text-sm text-gray-500">
                              {user.email}
                            </td>

                            {/* ROLE */}

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                  user.role ===
                                  "ADMIN"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>

                            {/* DATE */}

                            <td className="px-6 py-5 text-sm text-gray-400">
                              {formatDate(
                                user.createdAt
                              )}
                            </td>

                            {/* ACTION */}

                            <td className="px-6 py-5 text-right">
                              <button
                                type="button"
                                disabled={
                                  isCurrentUser ||
                                  isDeleting
                                }
                                onClick={() =>
                                  handleDeleteUser(
                                    user._id,
                                    user.name
                                  )
                                }
                                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                                  isCurrentUser
                                    ? "cursor-not-allowed bg-gray-50 text-gray-300"
                                    : "bg-red-50 text-red-500 hover:bg-red-100"
                                }`}
                                title={
                                  isCurrentUser
                                    ? "You cannot delete your own account"
                                    : "Delete user"
                                }
                              >
                                <Trash2
                                  size={16}
                                  strokeWidth={1.8}
                                />

                                {isDeleting
                                  ? "Deleting..."
                                  : isCurrentUser
                                  ? "Current account"
                                  : "Delete"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}