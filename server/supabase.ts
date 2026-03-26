import { createClient } from "@supabase/supabase-js";

/* ============================================================
   QUẢN LÝ CẤU HÌNH SUPABASE (Hỗ trợ cả SDK và REST API)
   ============================================================ */

// Lấy config linh hoạt từ nhiều nguồn môi trường khác nhau
export const SUPABASE_URL = 
  import.meta.env?.VITE_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  "";

export const SUPABASE_ANON_KEY = 
  import.meta.env?.VITE_SUPABASE_ANON_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ CRITICAL: Thiếu cấu hình Supabase (URL hoặc Key)!");
}

// 1. Dành cho code cũ (Server/Storage) - Giải quyết lỗi build "No matching export"
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Dành cho code mới (Fetch API trực tiếp)
export const supabaseHeaders = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
};

// Helper tạo URL cho REST API
export const getSupabaseUrl = (table: string, params: string = "") => {
  return `${SUPABASE_URL}/rest/v1/${table}${params}`;
};
