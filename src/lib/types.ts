export interface Doctor {
  id: string;
  name: string;
  degree?: string | null;
  specialty?: string | null;
  clinic_hospital?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  is_active?: boolean;
}

export interface Lab {
  id?: string;
  name: string;
  logo_url?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  tagline?: string | null;
  license_number?: string | null;
  gstin?: string | null;
  report_settings?: any;
  print_header_height?: number | string | null;
  print_footer_height?: number | string | null;
}

export interface ReferredPatient {
  id: string;
  custom_id?: string | null;
  name: string;
  age?: number | string | null;
  age_unit?: string | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  registered_at?: string;
  total_reports: number;
  latest_report_id?: string | null;
  latest_report_status?: string | null;
  latest_report_date?: string | null;
}

export interface TestResultItem {
  id?: string;
  test_name?: string;
  parameter_name?: string;
  result_value?: string;
  unit?: string;
  normal_range?: string;
  flag?: "NORMAL" | "HIGH" | "LOW" | "CRITICAL" | null;
  status?: string;
  notes?: string;
  test?: {
    id?: string;
    name?: string;
    department?: string;
    unit?: string;
    parent?: {
      id?: string;
      name?: string;
      parent?: {
        id?: string;
        name?: string;
      };
    };
  };
}

export interface DoctorReport {
  id: string;
  custom_id?: string;
  barcode?: string;
  report_number?: string;
  date?: string;
  created_at: string;
  status: "PENDING" | "SAMPLE_COLLECTED" | "PROCESSING" | "COMPLETED" | "VERIFIED" | "APPROVED" | "RELEASED" | string;
  is_ready?: boolean;
  patient: {
    id?: string;
    custom_id?: string | null;
    name: string;
    age?: number | string | null;
    age_unit?: string | null;
    gender?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  };
  tests?: string[];
  tests_summary?: string[];
  test_count?: number;
  total_tests?: number;
  results?: TestResultItem[];
  bill?: any;
  lab?: Lab;
  pdf_url?: string | null;
}

export interface CommissionBillItem {
  bill_id: string;
  bill_number: string;
  date: string;
  patient_id?: string;
  patient_code?: string;
  patient_name: string;
  patient_phone?: string;
  patient_age_gender?: string;
  tests: string[];
  gross_total: number;
  discount: number;
  net_amount: number;
  paid_amount: number;
  due_amount: number;
  commission_percent: number;
  doctor_commission: number;
  status: string;
}

export interface DoctorCommissionSummary {
  total_patients: number;
  total_bills: number;
  total_gross: number;
  total_discount: number;
  total_net_sales: number;
  total_paid: number;
  total_due: number;
  total_doctor_commission: number;
  average_commission_per_patient: number;
  base_commission_percent: number;
}

export interface DoctorAnalytics {
  metrics: {
    total_patients: number;
    total_reports: number;
    verified_reports: number;
    pending_reports: number;
    completion_rate: number;
  };
  commission_summary?: DoctorCommissionSummary;
  bills?: CommissionBillItem[];
  period?: {
    filter?: string;
    start_date?: string | null;
    end_date?: string | null;
  };
  monthly_trends: {
    month: string;
    short_month: string;
    reports: number;
    commission?: number;
  }[];
  top_tests: {
    name: string;
    count: number;
    rank: number;
  }[];
}

export interface DoctorAuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  doctor?: Doctor;
  lab?: Lab;
  error?: string;
}

export interface DoctorOtpResponse {
  success: boolean;
  message: string;
  phone?: string;
  dispatched?: boolean;
  debug_otp?: string | null;
  error?: string;
}
