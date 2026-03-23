import { createClient } from "@supabase/supabase-js";

// Kiểm tra linh hoạt cho cả môi trường Local (Vite) và Production (Node/Render)
const supabaseUrl = 
  process.env.SUPABASE_URL || 
  process.env.VITE_SUPABASE_URL || 
  "";

const supabaseKey = 
  process.env.SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY || 
  "";

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ CRITICAL ERROR: Supabase credentials are missing!");
  console.log("Check your Environment Variables on Render/Netlify.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
