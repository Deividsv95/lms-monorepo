import { apiRequest } from "./api";

const STORAGE_KEY = "lms_user";

const ROLE_LABELS = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
};

export function loadSessionUser() {
  try {
    const rawUser = localStorage.getItem(STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

export function saveSessionUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}

export function clearSessionUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || "User";
}

export async function signIn(credentials) {
  const username = String(credentials?.username || "").trim();
  const password = String(credentials?.password || "");

  if (!username) {
    throw new Error("Username is required.");
  }

  if (!password) {
    throw new Error("Password is required.");
  }

  const data = await apiRequest(
    "/auth/login",
    {
      method: "POST",
      body: { username, password },
    },
    { authToken: null },
  );

  const loggedInUser = data?.user ?? null;
  const accessToken = data?.access ?? "";

  if (!loggedInUser || !accessToken) {
    throw new Error("Login response is missing required authentication data.");
  }

  const sessionUser = {
    accessToken,
    id: loggedInUser.id,
    name: loggedInUser.name || loggedInUser.username || `User ${loggedInUser.id}`,
    refreshToken: data?.refresh || "",
    role: loggedInUser.role,
    username: loggedInUser.username || username,
  };

  saveSessionUser(sessionUser);

  return {
    roleLabel: getRoleLabel(sessionUser.role),
    sessionUser,
  };
}
