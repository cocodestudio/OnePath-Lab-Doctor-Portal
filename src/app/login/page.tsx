"use client";

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Phone,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { loginWithPassword, sendOtp, verifyOtp } from "../../lib/api-client";
import { toast } from "../../components/ui/toast";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, loginWithToken } = useAuth();

  // Mode: "password" (default) or "otp"
  const [authMode, setAuthMode] = useState<"password" | "otp">("password");

  // Email / Phone + Password state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // WhatsApp OTP state
  const [otpPhone, setOtpPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Auto redirect if already authenticated
  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    }
  }, [token, router]);

  // Handle countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 1. Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage("Please enter both email/phone and password.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await loginWithPassword(identifier.trim(), password.trim());
      if (res.success && res.token && res.doctor) {
        toast.success("Welcome Doctor", `Signed in as ${res.doctor.name}`);
        loginWithToken(res.token, res.doctor, res.lab);
        router.replace("/dashboard");
      } else {
        setErrorMessage(res.message || "Invalid email or password.");
        toast.error("Sign In Failed", res.message || "Invalid credentials.");
      }
    } catch (err: any) {
      const msg = err.message || "Could not complete sign in.";
      setErrorMessage(msg);
      toast.error("Login Error", msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  // 2. Request WhatsApp OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanDigits = otpPhone.replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setOtpLoading(true);
    try {
      const res = await sendOtp(cleanDigits);
      if (res.success) {
        setOtpSent(true);
        setCountdown(60);
        toast.success("OTP Dispatched", res.message || "Verification code sent to your WhatsApp.");
      } else {
        setErrorMessage(res.message || "Could not send OTP code.");
        toast.error("Dispatch Failed", res.message || "Please check the mobile number.");
      }
    } catch (err: any) {
      const msg = err.message || "Could not send OTP code.";
      setErrorMessage(msg);
      toast.error("OTP Error", msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // 3. Verify OTP and Authenticate
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otpCode.length < 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setOtpLoading(true);
    try {
      const cleanDigits = otpPhone.replace(/\D/g, "");
      const res = await verifyOtp(cleanDigits, otpCode);
      if (res.success && res.token && res.doctor) {
        toast.success("Verification Successful", `Welcome Dr. ${res.doctor.name}`);
        loginWithToken(res.token, res.doctor, res.lab);
        router.replace("/dashboard");
      } else {
        setErrorMessage(res.message || "Invalid code entered.");
        toast.error("Verification Failed", res.message || "Please check the OTP.");
      }
    } catch (err: any) {
      const msg = err.message || "Could not verify OTP.";
      setErrorMessage(msg);
      toast.error("Verification Error", msg);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-[#fbfbfa] to-teal-50/40 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-900 font-sans">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-slate-200/90 shadow-xs mb-3.5 p-2">
            <Image
              src="/onepath-logo.png"
              alt="OnePath Lab"
              width={40}
              height={40}
              className="object-contain w-10 h-10"
              priority
            />
          </div>
          <div className="flex items-center justify-center">
            <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
              OnePath
            </span>
            <span className="font-bold text-2xl text-emerald-700 ml-1.5 tracking-tight">
              Lab
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
            Doctor Referral & Investigation Gateway
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xs border-slate-200/90">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("password");
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === "password"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("otp");
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === "otp"
                    ? "bg-white text-emerald-800 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>WhatsApp OTP</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            </div>

            {/* Error Feedback Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-start gap-2 shadow-2xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="flex-1 leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Mode 1: Password Login Form */}
            {authMode === "password" ? (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Registered Email or Phone
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="doctor@clinic.com or 9876543210"
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm text-slate-900 transition shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Secret Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm text-slate-900 transition shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20"
                >
                  {passwordLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating Clinician...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Doctor Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              /* Mode 2: WhatsApp OTP Form */
              <div className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        WhatsApp Registered Mobile
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="tel"
                          value={otpPhone}
                          onChange={(e) => setOtpPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm text-slate-900 font-mono transition shadow-2xs"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20"
                    >
                      {otpLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Dispatching Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send WhatsApp Code</span>
                          <MessageSquare className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Code sent to +91 {otpPhone.slice(-10)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Enter 6-Digit Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                        required
                        autoFocus
                        className="w-full px-4 py-2.5 text-center tracking-[0.5em] text-lg font-mono rounded-xl bg-white border border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 transition shadow-2xs"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="hover:text-slate-900 underline cursor-pointer"
                      >
                        Change Number
                      </button>
                      {countdown > 0 ? (
                        <span>Resend in {countdown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={otpLoading || otpCode.length < 6}
                      className="w-full py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20"
                    >
                      {otpLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Enter Portal</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* Footer Security Tag */}
            <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>End-to-End Encrypted Doctor Gateway</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbfbfa] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
            <div className="h-10 w-36 shimmer-box rounded-xl mx-auto" />
            <div className="h-4 w-48 shimmer-box rounded-md mx-auto" />
            <div className="h-10 w-full shimmer-box rounded-xl mt-6" />
            <div className="h-10 w-full shimmer-box rounded-xl" />
            <div className="h-11 w-full shimmer-box rounded-xl" />
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
