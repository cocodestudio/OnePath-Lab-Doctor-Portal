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
} from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { loginWithPassword, sendOtp, verifyOtp } from "../../lib/api-client";
import { toast } from "../../components/ui/toast";

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
        toast.success("OTP Sent!", res.message);
        if (res.debug_otp) {
          setOtpCode(res.debug_otp);
        }
      } else {
        setErrorMessage(res.message || "Could not dispatch WhatsApp OTP.");
        toast.error("OTP Failed", res.message);
      }
    } catch (err: any) {
      const msg = err.message || "Failed to send verification code.";
      setErrorMessage(msg);
      toast.error("OTP Error", msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // 3. Verify WhatsApp OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpCode.trim()) {
      setErrorMessage("Please enter the 6-digit code received on WhatsApp.");
      return;
    }

    setOtpLoading(true);
    try {
      const res = await verifyOtp(otpPhone, otpCode.trim());
      if (res.success && res.token && res.doctor) {
        toast.success("Verified Successfully", `Welcome, ${res.doctor.name}`);
        loginWithToken(res.token, res.doctor, res.lab);
        router.replace("/dashboard");
      } else {
        setErrorMessage(res.message || "Invalid or expired OTP code.");
        toast.error("Verification Failed", res.message);
      }
    } catch (err: any) {
      const msg = err.message || "Code verification failed.";
      setErrorMessage(msg);
      toast.error("Verification Error", msg);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] bg-gradient-to-br from-emerald-50/60 via-[#fbfbfa] to-emerald-50/30 text-slate-900 flex flex-col justify-center items-center py-8 px-4 sm:px-6 font-sans">
      <div className="w-full max-w-[420px] sm:max-w-[440px]">
        {/* Main Clean White Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-9 space-y-6">
          {/* Header with Official Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs mb-1">
              <Image
                src="/onepath-logo.png"
                alt="OnePath Lab Logo"
                width={48}
                height={48}
                priority
                className="object-contain h-10 w-10 sm:h-12 sm:w-12"
              />
            </div>

            <div className="flex items-center justify-center leading-none">
              <span className="font-extrabold text-2xl sm:text-[26px] text-slate-900 tracking-tight">
                OnePath
              </span>
              <span className="font-bold text-2xl sm:text-[26px] text-emerald-700 ml-1.5 tracking-tight">
                Lab
              </span>
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider border border-emerald-200/70">
              Doctor Referral Portal
            </div>

            <p className="text-xs text-slate-500 pt-0.5">
              Sign in to view real-time patient reports & referral investigations
            </p>
          </div>

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1 leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* PRIMARY FORM: Email & Password */}
          {authMode === "password" ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email or Registered Mobile
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="doctor@onepathlab.com or 98xxxxxxxx"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-900 placeholder:text-slate-400 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("otp");
                      setErrorMessage(null);
                    }}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer transition"
                  >
                    Login via OTP instead
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-900 placeholder:text-slate-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white gradient-primary hover:opacity-95 active:scale-[0.99] disabled:opacity-50 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
              >
                {passwordLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ALTERNATE FLOW: WhatsApp OTP Login */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp OTP Verification</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("password");
                    setErrorMessage(null);
                    setOtpSent(false);
                  }}
                  className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                >
                  Login with password instead
                </button>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Registered Mobile Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="9876543210"
                        required
                        autoFocus
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono text-slate-900 placeholder:text-slate-400 tracking-wider transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      A 6-digit verification code will be sent to your WhatsApp.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading || otpPhone.length < 10}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white gradient-primary hover:opacity-95 active:scale-[0.99] disabled:opacity-50 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                  >
                    {otpLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Send WhatsApp Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <div>
                      Code sent to <strong>+91 {otpPhone}</strong> on WhatsApp.
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
                      className="w-full px-4 py-2.5 text-center tracking-[0.5em] text-lg font-mono rounded-xl bg-white border border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 transition"
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

                  <button
                    type="submit"
                    disabled={otpLoading || otpCode.length < 6}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white gradient-primary hover:opacity-95 active:scale-[0.99] disabled:opacity-50 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
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
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Footer Security Tag */}
          <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>End-to-End Encrypted Doctor Gateway</span>
          </div>
        </div>
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
