import {
  DoctorAuthResponse,
  DoctorOtpResponse,
  DoctorReport,
  ReferredPatient,
  DoctorAnalytics,
} from "./types";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, "");

/**
 * Common request helper with unified error handling and timeout
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        try {
          localStorage.removeItem("onepath_doctor_token");
          if (!window.location.pathname.includes("/login")) {
            window.location.replace("/login?expired=1");
          }
        } catch {}
      }
      const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  } catch (err: any) {
    if (err.name === "TypeError" && err.message?.includes("fetch")) {
      throw new Error(`Cannot reach Diagnostic API at ${API_BASE_URL}. Ensure Backend server is running.`);
    }
    throw err;
  }
}

/**
 * 1. Login with Email / Phone and Password
 */
export async function loginWithPassword(identifier: string, password: string): Promise<DoctorAuthResponse> {
  return request<DoctorAuthResponse>("/doctor-portal/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

/**
 * 2. Send WhatsApp OTP
 */
export async function sendOtp(phone: string): Promise<DoctorOtpResponse> {
  return request<DoctorOtpResponse>("/doctor-portal/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

/**
 * 3. Verify OTP & Authenticate
 */
export async function verifyOtp(phone: string, code: string): Promise<DoctorAuthResponse> {
  return request<DoctorAuthResponse>("/doctor-portal/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });
}

/**
 * 4. Verify Doctor Access Token
 */
export async function verifyDoctorToken(token: string): Promise<DoctorAuthResponse> {
  if (!token || !token.trim()) {
    return { success: false, error: "Access token is required" };
  }
  const cleanToken = encodeURIComponent(token.trim());
  return request<DoctorAuthResponse>(`/doctor-portal/verify?token=${cleanToken}`);
}

/**
 * 5. Fetch Referred Reports (with search, status & date filtering)
 */
export async function fetchDoctorReports(
  token: string,
  params: {
    search?: string;
    filter?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
  } = {}
): Promise<{
  success: boolean;
  reports: DoctorReport[];
  summary: {
    total_patients: number;
    total_reports: number;
    ready_reports: number;
    pending_reports: number;
  };
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}> {
  const query = new URLSearchParams();
  query.set("token", token.trim());
  
  if (params.search) query.set("search", params.search);
  if (params.filter) query.set("filter", params.filter);
  if (params.status && params.status !== "ALL") query.set("status", params.status);
  if (params.start_date) query.set("start_date", params.start_date);
  if (params.end_date) query.set("end_date", params.end_date);
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));

  return request(`/doctor-portal/reports?${query.toString()}`);
}

/**
 * 6. Fetch Single Report with Complete Tests & Letterhead Specs
 */
export async function fetchDoctorSingleReport(
  token: string,
  reportId: string
): Promise<{ success: boolean; report?: DoctorReport; error?: string }> {
  const cleanToken = encodeURIComponent(token.trim());
  return request<{ success: boolean; report?: DoctorReport; error?: string }>(
    `/doctor-portal/reports/${encodeURIComponent(reportId)}?token=${cleanToken}`
  );
}

/**
 * 7. Fetch Referred Patients Directory
 */
export async function fetchDoctorPatients(
  token: string,
  params: {
    search?: string;
    gender?: string;
    page?: number;
    per_page?: number;
  } = {}
): Promise<{
  success: boolean;
  patients: ReferredPatient[];
  summary: { total_patients: number };
  pagination: { current_page: number; last_page: number; per_page: number; total: number };
}> {
  const query = new URLSearchParams();
  query.set("token", token.trim());
  if (params.search) query.set("search", params.search);
  if (params.gender && params.gender !== "ALL") query.set("gender", params.gender);
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));

  return request(`/doctor-portal/patients?${query.toString()}`);
}

/**
 * 8. Fetch Doctor Referral Analytics & Trends
 */
export async function fetchDoctorAnalytics(token: string): Promise<DoctorAnalytics & { success: boolean }> {
  const cleanToken = encodeURIComponent(token.trim());
  return request<DoctorAnalytics & { success: boolean }>(`/doctor-portal/analytics?token=${cleanToken}`);
}

/**
 * Quick ping / health check to backend
 */
export async function checkBackendHealth(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  const startTime = Date.now();
  try {
    const res = await fetch(`${API_BASE_URL.replace(/\/api$/, "")}/api/doctor-portal/verify?token=ping_check`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const latencyMs = Date.now() - startTime;
    if (res.status === 401 || res.status === 200) {
      return { ok: true, message: "Connected to Diagnostic Backend API", latencyMs };
    }
    return { ok: false, message: `Unexpected status ${res.status}`, latencyMs };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return { ok: false, message: err.message || "Failed to reach backend", latencyMs };
  }
}

/**
 * Normalizes letterhead image URL into full, absolute, CORS-friendly URL.
 */
export function getCleanLetterheadUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  let trimmed = url.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined" || trimmed === "none") {
    return null;
  }
  if (trimmed.startsWith("blob:")) return null;
  if (trimmed.startsWith("data:image/")) return trimmed;

  const origin = API_BASE_URL.replace(/\/api$/, "");
  if (trimmed.startsWith("/storage/")) return `${origin}${trimmed}`;
  if (trimmed.startsWith("storage/")) return `${origin}/${trimmed}`;
  if (trimmed.includes("/storage/")) {
    const storagePath = trimmed.substring(trimmed.indexOf("/storage/"));
    return `${origin}${storagePath}`;
  }
  if (typeof window !== "undefined" && window.location?.hostname && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    trimmed = trimmed.replace(/\/\/(localhost|127\.0\.0\.1)(:\d+)?/, `//${window.location.hostname}$2`);
  }
  return trimmed;
}

