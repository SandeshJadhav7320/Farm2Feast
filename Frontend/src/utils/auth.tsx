export interface JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
  userId?: number;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export function getToken(): string | null {
  return sessionStorage.getItem("token");
}

export function getJwtPayload(): JwtPayload | null {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64Url = parts[1];

    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(
          (char) =>
            "%" +
            ("00" + char.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Unable to decode JWT:", error);
    return null;
  }
}

export function getUserRole(): string | null {
  const payload = getJwtPayload();

  if (!payload?.role) {
    return null;
  }

  return String(payload.role).toUpperCase();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  return getUserRole() === "ADMIN";
}

export function isUser(): boolean {
  return getUserRole() === "USER";
}

export function logout(): void {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
}