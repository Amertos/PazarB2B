import { Platform } from "react-native";
import { QueryClient, QueryFunction } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function getApiUrl(): string {
  let host = process.env.EXPO_PUBLIC_DOMAIN || "localhost:5000";
  
  if (Platform.OS === "android" && host.includes("localhost")) {
    host = host.replace("localhost", "10.0.2.2");
  }
  
  const isLocal = host.includes("localhost") || host.includes("10.0.2.2") || host.match(/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/);
  const protocol = isLocal ? "http" : "https";
  return `${protocol}://${host}`;
}

let memoryToken: string | null = null;

export async function getAuthToken(): Promise<string | null> {
  if (memoryToken) return memoryToken;
  return AsyncStorage.getItem("auth_token");
}

export async function setAuthToken(token: string, remember: boolean = true): Promise<void> {
  if (remember) {
    await AsyncStorage.setItem("auth_token", token);
  } else {
    memoryToken = token;
  }
}

export async function clearAuthToken(): Promise<void> {
  memoryToken = null;
  await AsyncStorage.removeItem("auth_token");
}

async function buildHeaders(withBody?: boolean): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (withBody) headers["Content-Type"] = "application/json";
  const token = await getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);
  const headers = await buildHeaders(!!data);

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

export async function apiGet<T>(route: string): Promise<T> {
  const res = await apiRequest("GET", route);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);
    const headers = await buildHeaders(false);

    const res = await fetch(url.toString(), { headers });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
