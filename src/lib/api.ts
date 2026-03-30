import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.100.18:8000/api";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "Bypass-Tunnel-Reminder": "true",
  "ngrok-skip-browser-warning": "true",
};

async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem("token");
}

export async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const url = `${API_URL}${path}`;

  const headers: HeadersInit = {
    ...DEFAULT_HEADERS,
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 - unauthorized
  if (response.status === 401) {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T,>(path: string) => fetchWithAuth<T>(path, { method: "GET" }),

  post: <T,>(path: string, data?: unknown) =>
    fetchWithAuth<T>(path, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T,>(path: string, data?: unknown) =>
    fetchWithAuth<T>(path, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T,>(path: string) => fetchWithAuth<T>(path, { method: "DELETE" }),

  postForm: <T,>(path: string, formData: FormData) =>
    fetchWithAuth<T>(path, {
      method: "POST",
      headers: {
        "Bypass-Tunnel-Reminder": "true",
        "ngrok-skip-browser-warning": "true",
      },
      body: formData,
    }),
};
