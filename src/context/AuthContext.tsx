import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "personal" | "student" | "user";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    personal_id?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load stored auth on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("user"),
        ]);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to load auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Bypass-Tunnel-Reminder": "true",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) throw new Error("Login failed");

      const { user: userData, token: newToken } = await response.json();

      await Promise.all([
        AsyncStorage.setItem("token", newToken),
        AsyncStorage.setItem("user", JSON.stringify(userData)),
      ]);

      setToken(newToken);
      setUser(userData);
      router.replace("/(tabs)/home");
    } catch (error) {
      throw error instanceof Error ? error : new Error("Login failed");
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    personal_id?: string;
  }) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Bypass-Tunnel-Reminder": "true",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error("Registration failed");

      const { user: userData, token: newToken } = await response.json();

      await Promise.all([
        AsyncStorage.setItem("token", newToken),
        AsyncStorage.setItem("user", JSON.stringify(userData)),
      ]);

      setToken(newToken);
      setUser(userData);
      router.replace("/(tabs)/home");
    } catch (error) {
      throw error instanceof Error ? error : new Error("Registration failed");
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem("token"),
        AsyncStorage.removeItem("user"),
      ]);
      setToken(null);
      setUser(null);
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
