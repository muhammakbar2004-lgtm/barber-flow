import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Pastikan variabel lingkungan terdefinisi sebelum inisialisasi
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Peringatan: VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum diatur di file .env.local');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
