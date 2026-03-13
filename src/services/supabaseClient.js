import { createClient } from "@supabase/supabase-js";

// Mengambil variabel dari file .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Membuat client Supabase untuk digunakan di seluruh aplikasi
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
