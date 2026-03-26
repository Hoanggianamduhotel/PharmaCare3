/* ============================================================
   QUẢN LÝ CẤU HÌNH SUPABASE (REST API)
   ============================================================ */

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Thiếu cấu hình Supabase trong file .env");
}

export const supabaseHeaders = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
};

// Helper để tạo URL nhanh
export const getSupabaseUrl = (table: string, params: string = "") => {
  return `${SUPABASE_URL}/rest/v1/${table}${params}`;
};
