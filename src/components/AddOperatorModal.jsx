import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { User, Mail, AtSign, Lock, ShieldAlert, X } from 'lucide-react';

export default function AddOperatorModal({ onClose, onSave }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('barber');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSimpanOperator = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    let originalSession = null;

    try {
      // Ambil sesi user saat ini
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('[Debug Login] Gagal mengambil sesi:', sessionError.message);
        setError(`Gagal mengambil sesi: ${sessionError.message}`);
        setLoading(false);
        return;
      }

      originalSession = session;
      const user = session?.user;

      if (!user) {
        console.error('[Debug Login] Sesi kosong. Pengguna belum terautentikasi.');
        setError('Akses ditolak: Anda belum terautentikasi.');
        setLoading(false);
        return;
      }

      // Verifikasi Admin: Query ke tabel profiles
      let activeRole = null;
      const { data: activeProfile, error: activeProfileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (activeProfileError) {
        console.warn('[Debug Login] Gagal query profiles:', activeProfileError.message);
        // Fallback ke user_metadata jika query profiles gagal (misal karena error RLS recursion)
        activeRole = user.user_metadata?.role;
        console.log('[Debug Login] Fallback menggunakan role dari metadata:', activeRole);
      } else {
        activeRole = activeProfile?.role;
      }

      if (activeRole !== 'admin') {
        console.error(`[Debug Login] Peran pengguna bukan admin: ${activeRole}`);
        setError('Akses ditolak: Hanya pengguna dengan peran Admin yang diizinkan.');
        setLoading(false);
        return;
      }

      // 1. Logika Proteksi Admin (Krusial)
      if (role === 'admin') {
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'admin');

        if (countError) {
          console.error('[Debug Login] Gagal menghitung admin:', countError.message);
          setError(`Gagal memverifikasi kuota admin: ${countError.message}`);
          setLoading(false);
          return;
        }

        if (count >= 3) {
          console.error('[Debug Login] Kuota admin penuh. Count:', count);
          setError('Maaf, kuota maksimal Admin (3 akun) sudah penuh.');
          setLoading(false);
          return;
        }
      }

      // 2. Proses Pendaftaran (Backend) - Supabase Auth
      // Catatan: supabase.auth.signUp() akan menimpa sesi local.
      // Kita akan merestorasi originalSession di bagian block finally.
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            username: username,
            role: role
          }
        }
      });

      if (signUpError) {
        console.error('[Debug Login] Error signUp:', signUpError.message);
        setError(`Registrasi gagal: ${signUpError.message}`);
        setLoading(false);
        return;
      }

      if (!signUpData?.user) {
        console.error('[Debug Login] Hasil signUp kosong');
        setError('Gagal mendaftarkan pengguna baru.');
        setLoading(false);
        return;
      }

      // 3. Pastikan data tersimpan di tabel profiles dengan role yang dipilih
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username,
          role: role
        })
        .eq('id', signUpData.user.id);

      if (profileError) {
        console.error('[Debug Login] Error updating profile:', profileError.message);
        setError(`Registrasi berhasil, namun gagal menyimpan profil: ${profileError.message}`);
        setLoading(false);
        return;
      }

      setSuccess('Operator berhasil ditambahkan!');
      if (onSave) {
        onSave();
      }

      // Reset form
      setFullName('');
      setEmail('');
      setUsername('');
      setPassword('');
      setRole('barber');

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error('[Debug Login] Exception occurred:', err);
      setError(`Terjadi kesalahan jaringan atau sistem: ${err.message || err}`);
    } finally {
      // Handle Jebakan Sesi Supabase: kembalikan sesi admin semula
      if (originalSession) {
        console.log('[Debug Login] Memulihkan sesi admin semula...');
        const { error: restoreError } = await supabase.auth.setSession({
          access_token: originalSession.access_token,
          refresh_token: originalSession.refresh_token
        });
        if (restoreError) {
          console.error('[Debug Login] Gagal memulihkan sesi admin:', restoreError.message);
        } else {
          console.log('[Debug Login] Sesi admin berhasil dipulihkan.');
        }
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      {/* Click outside to close overlay */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card Box */}
      <div 
        className="relative bg-[#FAF6EE] dark:bg-[#26170c] border border-[#E5D3C5]/60 dark:border-white/10 w-full max-w-[460px] rounded-2xl shadow-2xl p-8 text-[#26170C] dark:text-[#faf3e0] flex flex-col justify-between transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#26170C] via-[#944925] to-[#26170C] dark:from-[#ffb596] dark:via-[#944925] dark:to-[#ffb596] rounded-t-2xl" />

        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6 mt-2">
          <h2 className="text-2xl font-headline italic font-bold text-[#26170C] dark:text-[#faf3e0]">
            Tambah Operator Baru
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 hover:bg-[#efe8d5] dark:hover:bg-white/5 rounded-full text-[#81756e] dark:text-[#faf3e0]/60 hover:text-[#26170C] dark:hover:text-[#faf3e0] transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error & Success Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-2.5 font-sans animate-shake">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 font-sans">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{success}</span>
          </div>
        )}

        {/* Form Wrap */}
        <form onSubmit={handleSimpanOperator} className="space-y-4 font-sans">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#81756e] dark:text-[#faf3e0]/40 flex items-center pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="Masukkan nama lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white dark:bg-black/20 border border-[#E5D3C5] dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#26170C] dark:text-[#faf3e0] focus:outline-none focus:border-[#26170C] dark:focus:border-[#faf3e0] transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-1.5">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#81756e] dark:text-[#faf3e0]/40 flex items-center pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="operator@warisancukur.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-black/20 border border-[#E5D3C5] dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#26170C] dark:text-[#faf3e0] focus:outline-none focus:border-[#26170C] dark:focus:border-[#faf3e0] transition-colors"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#81756e] dark:text-[#faf3e0]/40 flex items-center pointer-events-none">
                <AtSign className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white dark:bg-black/20 border border-[#E5D3C5] dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#26170C] dark:text-[#faf3e0] focus:outline-none focus:border-[#26170C] dark:focus:border-[#faf3e0] transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#81756e] dark:text-[#faf3e0]/40 flex items-center pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-black/20 border border-[#E5D3C5] dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#26170C] dark:text-[#faf3e0] focus:outline-none focus:border-[#26170C] dark:focus:border-[#faf3e0] transition-colors"
              />
            </div>
          </div>

          {/* Pilih Role */}
          <div>
            <label className="block text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-1.5">
              Pilih Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white dark:bg-black/20 border border-[#E5D3C5] dark:border-white/10 rounded-lg px-3 py-2.5 text-xs text-[#26170C] dark:text-[#faf3e0] focus:outline-none focus:border-[#26170C] dark:focus:border-[#faf3e0] transition-colors cursor-pointer"
            >
              <option value="barber" className="dark:bg-[#26170c]">Barber</option>
              <option value="admin" className="dark:bg-[#26170c]">Admin</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-xs font-bold uppercase tracking-widest text-[#26170C]/80 dark:text-[#faf3e0]/70 hover:text-[#26170C] dark:hover:text-[#faf3e0] transition-colors focus:outline-none"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#26170C] dark:bg-[#faf3e0] text-[#FAF6EE] dark:text-[#26170C] px-6 py-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-[#3d2b1f] dark:hover:bg-[#FFF9EC] transition-all transform active:scale-95 shadow-md focus:outline-none disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-[#26170c]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Operator</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
