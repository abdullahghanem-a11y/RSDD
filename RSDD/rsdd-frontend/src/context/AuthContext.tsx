import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import {
  getAccessToken,
  getUser,
  loginRequest,
  setUser,
  setTokens,
} from "../api/authService";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<User | null>(getUser());
  const [loading, setLoading] = useState<boolean>(!getAccessToken());
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.data.success) {
          setUserState(res.data.data);
          setUser(res.data.data);
        } else {
          setUserState(null);
          setUser(null);
        }
      })
      .catch(() => {
        setUserState(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username: string, password: string) {
    setLoading(true);
    try {
      const loggedUser = await loginRequest(username, password);
      setUserState(loggedUser);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setTokens(null, null);
    setUser(null);
    setUserState(null);
    navigate("/");
  }

  async function refreshUser() {
    const token = getAccessToken();
    if (!token) return;
    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setUserState(res.data.data);
        setUser(res.data.data);
      }
    } catch {}
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
