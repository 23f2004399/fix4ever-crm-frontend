import { api } from "@/shared/config/axios";
import type { AuthResponse } from "../types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function googleLogin(credential: string): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<AuthResponse>>("/auth/google", {
    credential,
  });
  return res.data.data;
}

export async function emailLogin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", {
    email,
    password,
  });
  return res.data.data;
}

export async function register(
  email: string,
  password: string,
  username: string,
): Promise<AuthResponse> {
  const res = await api.post<ApiResponse<AuthResponse>>("/auth/register", {
    email,
    password,
    username,
  });
  return res.data.data;
}

export async function getMe(): Promise<AuthResponse["user"]> {
  const res = await api.get<ApiResponse<AuthResponse["user"]>>("/auth/me");
  return res.data.data;
}

export async function devCreateAdmin(
  email: string,
  password: string,
  username: string,
): Promise<{ message: string; user: AuthResponse["user"] }> {
  const res = await api.post<
    ApiResponse<{ message: string; user: AuthResponse["user"] }>
  >("/auth/dev/create-admin", { email, password, username });
  return res.data.data;
}
