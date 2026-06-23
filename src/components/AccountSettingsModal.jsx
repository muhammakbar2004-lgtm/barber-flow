import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AddOperatorModal from './AddOperatorModal';

export default function AccountSettingsModal({ onClose, userRole = 'admin' }) {
  const [activeTab, setActiveTab] = useState('PROFIL SAYA');
  const [showAddOperator, setShowAddOperator] = useState(false);
  
  // States for Edit Profile Form
  const [fullName, setFullName] = useState(userRole === 'admin' ? 'Admin Warisan' : 'Rahardian');
  const [username, setUsername] = useState(userRole === 'admin' ? 'admin' : 'rahardian');
  const [email, setEmail] = useState(userRole === 'admin' ? 'admin@heritagegrooming.id' : 'barber@heritagegrooming.id');
  const [password, setPassword] = useState('••••••••••••');

  // Dynamic accounts database state
  const [accounts, setAccounts] = useState([]);

  // Fetch accounts list from Supabase profiles table
  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('username', { ascending: true });

      if (error) {
        console.error('Gagal mengambil daftar akun:', error.message);
        return;
      }

      if (data) {
        // Map data to match existing schema
        const mapped = data.map(acc => ({
          id: acc.id,
          fullName: acc.full_name,
          username: acc.username,
          name: acc.full_name || acc.username || acc.email,
          email: acc.email,
          role: acc.role ? acc.role.toLowerCase() : 'barber',
          tierLevel: acc.tier_level || 'Junior',
          // protect system admins or critical admin accounts from being deleted
          canDelete: acc.role !== 'sys_admin' && acc.role !== 'admin'
        }));
        setAccounts(mapped);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch logged in user profile details
  const fetchCurrentProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Gagal memuat profil Supabase:', error.message);
          return;
        }

        if (data) {
          setFullName(data.full_name || '');
          setUsername(data.username || '');
        }
      } else {
        // Fallback untuk mode mock/local login
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) {
          setEmail(storedEmail);
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', storedEmail)
            .single();
          if (!error && data) {
            setFullName(data.full_name || '');
            setUsername(data.username || '');
          } else {
            setFullName(localStorage.getItem('userName') || (userRole === 'admin' ? 'Admin Warisan' : 'Rahardian'));
            setUsername(localStorage.getItem('userName')?.toLowerCase() || (userRole === 'admin' ? 'admin' : 'rahardian'));
          }
        } else {
          setFullName(userRole === 'admin' ? 'Admin Warisan' : 'Rahardian');
          setEmail(userRole === 'admin' ? 'admin@heritagegrooming.id' : 'barber@heritagegrooming.id');
          setUsername(userRole === 'admin' ? 'admin' : 'rahardian');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCurrentProfile();
    fetchAccounts();
  }, []);

  const handleUpdateTierLevel = async (id, tierLevel) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ tier_level: tierLevel })
        .eq('id', id);

      if (error) {
        alert('Gagal memperbarui level barber: ' + error.message);
      } else {
        setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, tierLevel } : acc));
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memperbarui level.');
    }
  };

  const handleDeleteAccount = async (id) => {
    const targetAccount = accounts.find(acc => acc.id === id);
    if (!targetAccount) return;
    
    if (window.confirm(`Apakah Anda yakin ingin menghapus akun ${targetAccount.name}?`)) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);

        if (error) {
          alert('Gagal menghapus profil: ' + error.message);
        } else {
          alert('Akun berhasil dihapus.');
          fetchAccounts();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddAccount = () => {
    if (userRole !== 'admin') {
      alert('Akses ditolak: Hanya Admin yang dapat menambahkan operator baru.');
      return;
    }
    setShowAddOperator(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let error = null;
      if (user) {
        // 1. Await Supabase profile update
        const { error: dbError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            username: username
          })
          .eq('id', user.id);
        
        error = dbError;

        if (!error) {
          // Update email and password if requested
          const updates = {};
          if (email !== user.email) {
            updates.email = email;
          }
          if (password && password !== '••••••••••••') {
            updates.password = password;
          }

          if (Object.keys(updates).length > 0) {
            const { error: authError } = await supabase.auth.updateUser(updates);
            if (authError) {
              alert('Profil diubah di database, namun gagal memperbarui akun otentikasi: ' + authError.message);
            }
          }
        }
      } else {
        // Fallback untuk mock login
        const storedEmail = localStorage.getItem('userEmail');
        const storedUsername = localStorage.getItem('userName');
        let query = supabase.from('profiles').update({
          full_name: fullName,
          username: username,
          email: email
        });

        if (storedEmail) {
          query = query.eq('email', storedEmail);
        } else if (storedUsername) {
          query = query.eq('username', storedUsername);
        } else {
          query = query.eq('username', username);
        }

        const { error: dbError } = await query;
        error = dbError;
      }

      // 2. Hanya memunculkan notifikasi 'Berhasil' setelah Supabase mengembalikan status sukses (tidak ada error)
      if (error) {
        alert('Gagal memperbarui profil: ' + error.message);
        return;
      }

      // Sinkronisasi ke localStorage
      localStorage.setItem('userName', fullName);
      localStorage.setItem('userEmail', email);

      alert('Berhasil! Pengaturan sistem berhasil disimpan.');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memperbarui profil.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      {/* Click outside to close overlay */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card Box */}
      <div className={`relative bg-[#FAF6EE] dark:bg-[#26170c] border border-[#E5D3C5]/60 dark:border-white/10 w-full rounded-2xl shadow-2xl p-8 text-[#26170C] dark:text-[#faf3e0] flex flex-col justify-between transition-all duration-300 ${
        activeTab === 'DAFTAR AKUN' ? 'max-w-[880px]' : 'max-w-[520px]'
      }`}>
        
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-headline italic font-bold text-[#26170C] dark:text-[#faf3e0]">
            Pengaturan Sistem
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 hover:bg-[#efe8d5] dark:hover:bg-white/5 rounded-full text-[#81756e] dark:text-[#faf3e0]/60 hover:text-[#26170C] dark:hover:text-[#faf3e0] transition-colors focus:outline-none"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex border-b border-[#E5D3C5] dark:border-white/15 mb-8 text-xs font-bold uppercase tracking-widest gap-8">
          {['PROFIL SAYA', 'DAFTAR AKUN', 'UBAH DATA']
            .filter(tab => tab !== 'DAFTAR AKUN' || userRole === 'admin')
            .map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 transition-all relative font-sans ${
                activeTab === tab
                  ? 'text-[#26170C] dark:text-[#faf3e0] font-extrabold'
                  : 'text-[#81756e]/60 dark:text-[#faf3e0]/40 hover:text-[#26170C] dark:hover:text-[#faf3e0]'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#944925] dark:bg-[#ffb596]" />
              )}
            </button>
          ))}
        </div>

        {/* Form Wrap */}
        <form onSubmit={handleUpdateProfile} className="flex-1 flex flex-col justify-between">
          
          {/* Tab Content Section */}
          <div className="min-h-[220px]">
            {activeTab === 'PROFIL SAYA' && (
              <div className="space-y-6 animate-fade-in">
                {/* Top Section: Avatar and Vertical Text block */}
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#E5D3C5] dark:border-white/10 shadow-sm bg-white dark:bg-black/10 flex-shrink-0">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBApJIh4kNKeTAslmYWLnS1omSs7SRUAxinsdypZDFXgq3qnvvlB4cHCL9TbyKnofO94GaMvPzGIVFJ4esYqeWJru34E_CWxRUuI-DF7yhgEdhX_H2IELJLKXtqxFUAq9HTc6rgii3YQb9fNzsTrpq5lRVB7zp1UJcP2OQ6R-UyhLlAtUT9KjGSCgrdKw32mBJqoiPteCQ-jE1xEjIqrKc4RIoZ7wPQv0TCbJpBPwRPEMFcMp-en_n48YPTaOfdOhEzjKSrYkmUZAz0" 
                      alt="Admin Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#944925] dark:text-[#ffb596] uppercase tracking-widest mb-0.5">
                      {userRole === 'admin' ? 'ADMINISTRATOR' : (userRole === 'barber' ? 'BARBER' : 'OPERATOR')}
                    </span>
                    <h3 className="text-2xl font-headline font-bold text-[#26170C] dark:text-[#faf3e0] leading-tight">
                      {fullName}
                    </h3>
                    <span className="text-xs text-[#81756e]/80 dark:text-[#faf3e0]/50 italic font-medium font-sans">
                      {email}
                    </span>
                  </div>
                </div>

                {/* Horizontal Divider */}
                <div className="border-t border-[#E5D3C5]/60 dark:border-white/10" />

                {/* Grid Details Block */}
                <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                  {/* Username */}
                  <div>
                    <span className="block text-[9px] font-extrabold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-1.5 font-sans">
                      USERNAME
                    </span>
                    <span className="text-base font-headline font-semibold text-[#26170C] dark:text-[#faf3e0]">
                      {username}
                    </span>
                  </div>

                  {/* Peran Akses */}
                  <div>
                    <span className="block text-[9px] font-extrabold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-1.5 font-sans">
                      Peran Akses
                    </span>
                    <span className="text-base font-headline font-semibold text-[#26170C] dark:text-[#faf3e0]">
                      {userRole === 'admin' ? 'System Admin' : (userRole === 'barber' ? 'Staff Barber' : 'Operator')}
                    </span>
                  </div>

                  {/* Email Terdaftar */}
                  <div className="col-span-2">
                    <span className="block text-[9px] font-extrabold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-1.5 font-sans">
                      Email Terdaftar
                    </span>
                    <span className="text-base font-headline font-semibold text-[#26170C] dark:text-[#faf3e0]">
                      {email}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'DAFTAR AKUN' && userRole === 'admin' && (
              <div className="space-y-6 animate-fade-in">
                <p className="text-xs text-[#81756e] dark:text-[#faf3e0]/60 font-sans">
                  Berikut adalah daftar akun dengan hak akses administratif sistem Heritage Grooming:
                </p>
                
                {/* 3-Column Grid */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Column 1: ADMIN */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-3 font-sans">
                      ADMIN
                    </h4>
                    <div className="space-y-3">
                      {accounts.filter(acc => acc.role === 'admin' || acc.role === 'sys_admin').map((acc) => (
                        <div key={acc.id} className="bg-white dark:bg-black/10 border border-[#E5D3C5]/60 dark:border-white/10 rounded-xl p-3.5 flex items-center justify-between shadow-sm min-h-[70px]">
                          <div className="min-w-0 pr-2">
                            <span className="text-xs font-bold block text-[#26170C] dark:text-[#faf3e0] truncate">
                              {acc.fullName || acc.username || acc.email}
                            </span>
                            <span className="text-[9px] text-[#81756e] dark:text-[#faf3e0]/60 font-mono block truncate">
                              {acc.email}
                            </span>
                          </div>
                          {acc.canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAccount(acc.id)}
                              className="text-[#ba1a1a]/70 hover:text-[#ba1a1a] dark:text-red-400/70 dark:hover:text-red-400 p-1.5 rounded hover:bg-[#ba1a1a]/5 dark:hover:bg-red-500/10 transition-all focus:outline-none flex-shrink-0"
                              title="Hapus Akun"
                            >
                              <span className="material-symbols-outlined text-sm font-bold">delete</span>
                            </button>
                          )}
                        </div>
                      ))}
                      {accounts.filter(acc => acc.role === 'admin' || acc.role === 'sys_admin').length === 0 && (
                        <div className="p-4 border border-dashed border-[#E5D3C5]/40 rounded-xl text-center text-[10px] text-[#81756e]/60 italic font-sans">
                          Tidak ada admin
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 2: BARBER */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-3 font-sans">
                      BARBER
                    </h4>
                    <div className="space-y-3">
                      {accounts.filter(acc => acc.role === 'barber').map((acc) => (
                        <div key={acc.id} className="bg-white dark:bg-black/10 border border-[#E5D3C5]/60 dark:border-white/10 rounded-xl p-3.5 flex items-center justify-between shadow-sm min-h-[70px]">
                          <div className="min-w-0 pr-2">
                            <span className="text-xs font-bold block text-[#26170C] dark:text-[#faf3e0] truncate">
                              {acc.fullName || acc.username || acc.email}
                            </span>
                            <span className="text-[9px] text-[#81756e] dark:text-[#faf3e0]/60 font-mono block truncate">
                              {acc.email}
                            </span>
                            <select
                              value={acc.tierLevel || 'Junior'}
                              onChange={(e) => handleUpdateTierLevel(acc.id, e.target.value)}
                              className="mt-1.5 bg-[#FAF6EE]/50 dark:bg-black/20 border border-[#E5D3C5]/80 dark:border-white/10 rounded px-1.5 py-0.5 text-[10px] text-[#26170C] dark:text-[#faf3e0] focus:outline-none"
                            >
                              <option value="Junior">Junior</option>
                              <option value="Specialist">Specialist</option>
                              <option value="Senior">Senior</option>
                            </select>
                          </div>
                          {acc.canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAccount(acc.id)}
                              className="text-[#ba1a1a]/70 hover:text-[#ba1a1a] dark:text-red-400/70 dark:hover:text-red-400 p-1.5 rounded hover:bg-[#ba1a1a]/5 dark:hover:bg-red-500/10 transition-all focus:outline-none flex-shrink-0"
                              title="Hapus Akun"
                            >
                              <span className="material-symbols-outlined text-sm font-bold">delete</span>
                            </button>
                          )}
                        </div>
                      ))}
                      {accounts.filter(acc => acc.role === 'barber').length === 0 && (
                        <div className="p-4 border border-dashed border-[#E5D3C5]/40 rounded-xl text-center text-[10px] text-[#81756e]/60 italic font-sans">
                          Tidak ada barber
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 3: CUSTOMER */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-3 font-sans">
                      CUSTOMER
                    </h4>
                    <div className="space-y-3">
                      {accounts.filter(acc => acc.role === 'customer').map((acc) => (
                        <div key={acc.id} className="bg-white dark:bg-black/10 border border-[#E5D3C5]/60 dark:border-white/10 rounded-xl p-3.5 flex items-center justify-between shadow-sm min-h-[70px]">
                          <div className="min-w-0 pr-2">
                            <span className="text-xs font-bold block text-[#26170C] dark:text-[#faf3e0] truncate">
                              {acc.fullName || acc.username || acc.email}
                            </span>
                            <span className="text-[9px] text-[#81756e] dark:text-[#faf3e0]/60 font-mono block truncate">
                              {acc.email}
                            </span>
                          </div>
                          {acc.canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAccount(acc.id)}
                              className="text-[#ba1a1a]/70 hover:text-[#ba1a1a] dark:text-red-400/70 dark:hover:text-red-400 p-1.5 rounded hover:bg-[#ba1a1a]/5 dark:hover:bg-red-500/10 transition-all focus:outline-none flex-shrink-0"
                              title="Hapus Akun"
                            >
                              <span className="material-symbols-outlined text-sm font-bold">delete</span>
                            </button>
                          )}
                        </div>
                      ))}
                      {accounts.filter(acc => acc.role === 'customer').length === 0 && (
                        <div className="p-4 border border-dashed border-[#E5D3C5]/40 rounded-xl text-center text-[10px] text-[#81756e]/60 italic font-sans">
                          Tidak ada customer
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Button to Add New Account */}
                <button
                  type="button"
                  onClick={handleAddAccount}
                  className="w-full border border-dashed border-[#E5D3C5] dark:border-white/10 rounded-xl py-3.5 bg-transparent flex items-center justify-center transition-all duration-200 hover:border-[#944925] hover:text-[#944925] dark:hover:border-[#ffb596] dark:hover:text-[#ffb596] focus:outline-none cursor-pointer group"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#81756e] dark:text-[#faf3e0]/60 group-hover:text-[#944925] dark:group-hover:text-[#ffb596] transition-colors font-sans">
                    + Tambah Akun Baru
                  </span>
                </button>
              </div>
            )}

            {activeTab === 'UBAH DATA' && (
              <div className="space-y-4 animate-fade-in">
                {/* Form fields for actual edit */}
                <div className="space-y-3 font-sans">
                  <div>
                    <label className="block text-[9px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-1.5">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white dark:bg-black/20 border border-[#E5D3C5] dark:border-white/10 rounded-lg px-3 py-2 text-xs text-[#26170C] dark:text-[#faf3e0] focus:outline-none focus:border-[#26170C] dark:focus:border-[#faf3e0] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-white dark:bg-black/20 border border-[#E5D3C5] dark:border-white/10 rounded-lg px-3 py-2 text-xs text-[#26170C] dark:text-[#faf3e0] focus:outline-none focus:border-[#26170C] dark:focus:border-[#faf3e0] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-1.5">
                      Email Terdaftar
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white dark:bg-black/20 border border-[#E5D3C5] dark:border-white/10 rounded-lg px-3 py-2 text-xs text-[#26170C] dark:text-[#faf3e0] focus:outline-none focus:border-[#26170C] dark:focus:border-[#faf3e0] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest mb-1.5">
                      Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      placeholder="Masukkan kata sandi baru"
                      value={password === '••••••••••••' ? '' : password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white dark:bg-black/20 border border-[#E5D3C5] dark:border-white/10 rounded-lg px-3 py-2 text-xs text-[#26170C] dark:text-[#faf3e0] placeholder-[#81756e]/30 focus:outline-none focus:border-[#26170C] dark:focus:border-[#faf3e0] transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer Buttons */}
          <div className="flex justify-end items-center gap-6 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-widest text-[#26170C]/80 dark:text-[#faf3e0]/70 hover:text-[#26170C] dark:hover:text-[#faf3e0] transition-colors focus:outline-none font-sans"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-[#26170C] dark:bg-[#faf3e0] text-[#FAF6EE] dark:text-[#26170C] px-6 py-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-[#3d2b1f] dark:hover:bg-[#FFF9EC] transition-all transform active:scale-95 shadow-md focus:outline-none font-sans"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>

      </div>

      {showAddOperator && (
        <AddOperatorModal 
          onClose={() => setShowAddOperator(false)} 
          onSave={fetchAccounts} 
        />
      )}
    </div>
  );
}
