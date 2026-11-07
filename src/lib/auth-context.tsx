"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Doctor, Lab } from "./types";
import { verifyDoctorToken } from "./api-client";
import { toast } from "../components/ui/toast";

interface AuthContextType {
  doctor: Doctor | null;
  lab: Lab | null;
  token: string | null;
  isLoading: boolean;
  loginWithToken: (token: string, docData?: Doctor, labData?: Lab) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  doctor: null,
  lab: null,
  token: null,
  isLoading: true,
  loginWithToken: () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [lab, setLab] = useState<Lab | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const verifyAndSetSession = useCallback(async (tokenToVerify: string, docData?: Doctor, labData?: Lab) => {
    if (docData && labData) {
      setToken(tokenToVerify);
      setDoctor(docData);
      setLab(labData);
      localStorage.setItem("onepath_doctor_token", tokenToVerify);
      setIsLoading(false);
      return;
    }

    try {
      const res = await verifyDoctorToken(tokenToVerify);
      if (res.success && res.doctor) {
        setToken(tokenToVerify);
        setDoctor(res.doctor);
        setLab(res.lab || null);
        localStorage.setItem("onepath_doctor_token", tokenToVerify);
      } else {
        localStorage.removeItem("onepath_doctor_token");
        setToken(null);
        setDoctor(null);
        setLab(null);
      }
    } catch {
      // Offline or network error
      localStorage.removeItem("onepath_doctor_token");
      setToken(null);
      setDoctor(null);
      setLab(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Check if token in URL query (e.g. from WhatsApp referral link)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("token");
      const storedToken = localStorage.getItem("onepath_doctor_token");

      const activeToken = urlToken || storedToken;
      if (activeToken) {
        verifyAndSetSession(activeToken);
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [verifyAndSetSession]);

  const loginWithToken = (newToken: string, docData?: Doctor, labData?: Lab) => {
    verifyAndSetSession(newToken, docData, labData);
  };

  const logout = () => {
    try {
      localStorage.removeItem("onepath_doctor_token");
      sessionStorage.clear();
      document.cookie = "onepath_doctor_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0;";
    } catch {}

    setToken(null);
    setDoctor(null);
    setLab(null);

    // Hard browser redirect to /login ensures clean unmount, query param drop, and zero stuck state
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    } else {
      router.push("/login");
    }
  };

  const refreshProfile = async () => {
    if (token) {
      await verifyAndSetSession(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        doctor,
        lab,
        token,
        isLoading,
        loginWithToken,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

