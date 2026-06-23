import React, { useState } from 'react';
import { User, Mail, AtSign, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Register({ onClose }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validasi awal: Jika 'Kata Sandi' tidak sama dengan 'Konfirmasi Kata Sandi'
    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          username: username,
          role: 'customer'
        }
      }
    });

    if (error) {
      console.error(error.message);
      setError(error.message);
    } else {
      setSuccess('Pendaftaran berhasil!');
      // Bersihkan isi form
      setFullName('');
      setEmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      // Secara otomatis jalankan fungsi onClose agar pop-up tertutup
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Modal Card Container */}
      <div 
        className="w-full max-w-md bg-[#FAF6EE] dark:bg-[#26170c] rounded-xl shadow-2xl overflow-hidden border border-[#E5D3C5]/60 dark:border-white/10 flex flex-col transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Border */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#26170C] via-[#944925] to-[#26170C] dark:from-[#ffb596] dark:via-[#944925] dark:to-[#ffb596]" />

        {/* Modal Content */}
        <div className="p-8 md:p-10 flex-1">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-headline italic font-semibold text-[#26170C] dark:text-[#faf3e0]">
              Daftar Akun Baru
            </h2>
            <p className="text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mt-2 font-sans">
              Heritage Grooming System Administration
            </p>
          </div>

          {/* Error & Success Alert */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-2 font-sans animate-shake">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 font-sans">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Google Signup Button */}
            <button
              type="button"
              className="w-full bg-white hover:bg-gray-50 border border-gray-300 dark:border-white/10 rounded-lg py-2.5 px-4 flex items-center justify-center gap-2.5 shadow-sm active:scale-98 transition-all duration-200 focus:outline-none"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-bold text-[#26170C]">
                Daftar dengan Google
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center w-full my-6">
              <div className="flex-grow border-t border-[#E5D3C5] dark:border-white/10"></div>
              <span className="px-3 text-sm text-[#81756e]/70 dark:text-[#faf3e0]/50 font-sans">
                atau daftar dengan email
              </span>
              <div className="flex-grow border-t border-[#E5D3C5] dark:border-white/10"></div>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-1.5 font-sans">
                Nama Lengkap
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#81756e] dark:text-[#faf3e0]/40 flex items-center pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap Anda"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white dark:bg-[#26170C]/35 border border-[#E5D3C5] dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#26170C] dark:text-[#faf3e0] placeholder-[#81756e]/40 dark:placeholder-[#faf3e0]/20 focus:outline-none focus:border-[#26170C] dark:focus:border-[#faf3e0] focus:ring-1 focus:ring-[#26170C]/10 dark:focus:ring-white/5 transition-all font-sans"
                />
              </div>
            </div>

            {/* Email & Username Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-1.5 font-sans">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#81756e] dark:text-[#faf3e0]/40 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="admin@warisan.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-[#26170C]/35 border border-[#E5D3C5] dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#26170C] dark:text-[#faf3e0] placeholder-[#81756e]/40 dark:placeholder-[#faf3e0]/20 focus:outline-none focus:border-[#26170C] dark:focus:border-[#faf3e0] focus:ring-1 focus:ring-[#26170C]/10 dark:focus:ring-white/5 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-1.5 font-sans">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#81756e] dark:text-[#faf3e0]/40 flex items-center pointer-events-none">
                    <AtSign className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white dark:bg-[#26170C]/35 border border-[#E5D3C5] dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#26170C] dark:text-[#faf3e0] placeholder-[#81756e]/40 dark:placeholder-[#faf3e0]/20 focus:outline-none focus:border-[#26170C] dark:focus:border-[#faf3e0] focus:ring-1 focus:ring-[#26170C]/10 dark:focus:ring-white/5 transition-all font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Kata Sandi */}
            <div>
              <label className="block text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-1.5 font-sans">
                Kata Sandi
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
                  className="w-full bg-white dark:bg-[#26170C]/35 border border-[#E5D3C5] dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#26170C] dark:text-[#faf3e0] placeholder-[#81756e]/40 dark:placeholder-[#faf3e0]/20 focus:outline-none focus:border-[#26170C] dark:focus:border-[#faf3e0] focus:ring-1 focus:ring-[#26170C]/10 dark:focus:ring-white/5 transition-all font-sans"
                />
              </div>
            </div>

            {/* Konfirmasi Kata Sandi */}
            <div>
              <label className="block text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-1.5 font-sans">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#81756e] dark:text-[#faf3e0]/40 flex items-center pointer-events-none">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white dark:bg-[#26170C]/35 border border-[#E5D3C5] dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#26170C] dark:text-[#faf3e0] placeholder-[#81756e]/40 dark:placeholder-[#faf3e0]/20 focus:outline-none focus:border-[#26170C] dark:focus:border-[#faf3e0] focus:ring-1 focus:ring-[#26170C]/10 dark:focus:ring-white/5 transition-all font-sans"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col items-center gap-3">
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#26170C] dark:bg-[#faf3e0] text-[#FAF6EE] dark:text-[#26170C] py-3 rounded-lg text-xs font-bold uppercase tracking-widest shadow-md hover:bg-[#3d2b1f] dark:hover:bg-[#FFF9EC] transition-all transform active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#26170C]/20 dark:focus:ring-white/20 font-sans flex items-center justify-center gap-1.5"
              >
                <span>DAFTAR</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold uppercase tracking-widest text-[#944925] dark:text-[#ffb596] hover:underline transition-all py-1.5 focus:outline-none"
              >
                BATAL
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-[#FFF9EC] dark:bg-[#26170c]/50 border-t border-[#E5D3C5]/40 dark:border-white/5 flex justify-between items-center text-[9px] font-sans font-bold uppercase tracking-wider text-[#81756e]/80 dark:text-[#faf3e0]/40">
          <span>EST. 1950 - JAKARTA</span>
          {/* Dots Indicator */}
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#944925]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5D3C5]" />
          </div>
        </div>
      </div>
    </div>
  );
}
