import React, { useState, useEffect } from 'react';
import AccountSettingsModal from './AccountSettingsModal';
import { supabase } from '../supabaseClient';

export default function Header({ 
  onOpenMobileSidebar, 
  theme = 'light', 
  onToggleTheme,
  notifications = [],
  customerDatabase = [],
  onMarkNotificationsRead,
  onOpenStoreProfile,
  onLogout,
  userRole = 'admin'
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (!error && data) {
          setCurrentUserProfile(data);
          localStorage.setItem('userName', data.full_name || data.username || user.email.split('@')[0]);
          localStorage.setItem('userEmail', data.email || user.email);
        }
      } else {
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', storedEmail)
            .single();
          if (!error && data) {
            setCurrentUserProfile(data);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching profile in Header:', err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const displayName = currentUserProfile?.full_name || currentUserProfile?.username || localStorage.getItem('userName') || 'Administrator';
  const displayEmail = currentUserProfile?.email || localStorage.getItem('userEmail') || 'admin@heritagegrooming.id';

  const isDarkMode = theme === 'dark';
  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredHistory([]);
      return;
    }
    const cleanQuery = query.toLowerCase();
    const filtered = customerDatabase.filter(cust => 
      cust.name.toLowerCase().includes(cleanQuery) || 
      cust.phone.toLowerCase().includes(cleanQuery)
    );
    setFilteredHistory(filtered);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleItemClick = (actionName) => {
    alert(`Aksi terpilih: ${actionName}`);
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-[#FFF9EC] dark:bg-[#26170c] border-b border-[#26170c]/10 dark:border-white/10 shadow-sm flex justify-between items-center px-6 h-16 w-full sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center min-w-0">
        {/* Burger menu on mobile */}
        <button 
          onClick={onOpenMobileSidebar}
          className="hidden md:block p-2 rounded-full text-[#26170C] dark:text-[#faf3e0] hover:bg-[#faf3e0]/70 dark:hover:bg-[#26170C]/50 transition-colors mr-2 flex-shrink-0"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="font-serif newsreader italic tracking-tight text-sm md:text-2xl font-bold text-[#26170C] dark:text-[#faf3e0] leading-none whitespace-nowrap">
          Heritage Grooming {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Search Bar - Customer Database Search History */}
        <div className="relative">
          <form 
            onSubmit={(e) => e.preventDefault()}
            className="hidden sm:flex bg-[#faf3e0] dark:bg-[#26170C] px-3 py-1.5 rounded-full items-center border border-[#d2c4bc]/20 dark:border-white/5"
          >
            <span className="material-symbols-outlined text-sm mr-2 text-[#26170C] dark:text-[#faf3e0]">search</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari pelanggan..." 
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-48 text-[#26170C] dark:text-[#faf3e0] placeholder-[#26170C]/60 dark:placeholder-[#faf3e0]/60"
            />
          </form>

          {/* Histori Pelanggan Dropdown Menu */}
          {searchQuery.trim() !== '' && filteredHistory.length > 0 && (
            <>
              {/* Overlay to close the dropdown on click outside */}
              <div className="fixed inset-0 z-40" onClick={() => setSearchQuery('')} />
              
              <div className="absolute left-0 mt-2 w-64 bg-[#FFF9EC] dark:bg-[#26170C] border border-[#d2c4bc]/60 dark:border-white/10 rounded-xl shadow-xl py-2 z-50 animate-fade-in max-h-60 overflow-y-auto">
                <div className="px-4 py-1.5 border-b border-[#26170c]/10 dark:border-white/10 mb-1">
                  <span className="text-[10px] font-bold text-[#81756e] uppercase tracking-wider">Histori Pelanggan</span>
                </div>
                {filteredHistory.map((cust) => (
                  <button 
                    key={cust.id} 
                    type="button"
                    onClick={() => {
                      alert(`Pelanggan ditemukan: ${cust.name}\nNo. Telp: ${cust.phone}\nTerakhir Layanan: ${cust.lastService}`);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#faf3e0] dark:hover:bg-[#26170c] transition-colors cursor-pointer text-xs flex flex-col gap-0.5"
                  >
                    <div className="font-bold text-[#26170c] dark:text-[#faf3e0]">{cust.name}</div>
                    <div className="text-[10px] text-[#26170C]/60 dark:text-[#faf3e0]/60 flex justify-between w-full">
                      <span>{cust.phone}</span>
                      <span className="italic text-[#944925] dark:text-[#ffb596]">{cust.lastService}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action icons & Profile Dropdown Container */}
        <div className="flex items-center space-x-2 sm:space-x-4 relative">
          
          {/* Notification Bell with Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                if (!isNotificationOpen && onMarkNotificationsRead) {
                  onMarkNotificationsRead();
                }
              }}
              className={`text-[#26170C] dark:text-[#faf3e0] hover:bg-[#faf3e0] dark:hover:bg-[#26170C] p-2 rounded-full transition-all active:scale-95 duration-150 relative ${isNotificationOpen ? 'bg-[#faf3e0] dark:bg-[#26170C]' : ''}`}
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-[#ba1a1a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[16px] h-[16px] border border-white dark:border-[#26170c]">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {isNotificationOpen && (
              <>
                {/* Click Overlay */}
                <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
                
                {/* Floating Notification Dropdown */}
                <div className="absolute right-0 mt-2 w-72 bg-[#FFF9EC] dark:bg-[#26170C] border border-[#d2c4bc]/60 dark:border-white/10 rounded-xl shadow-xl py-2 z-50 animate-fade-in max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-[#26170c]/10 dark:border-white/10 mb-1 flex justify-between items-center">
                    <p className="text-xs font-bold text-[#26170c] dark:text-[#faf3e0] uppercase tracking-wider">Notifikasi</p>
                    <span className="text-[9px] bg-[#944925]/10 text-[#944925] dark:text-[#ffb596] px-2 py-0.5 rounded font-black">
                      {notifications.length} Total
                    </span>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <p className="text-xs text-[#26170C]/60 dark:text-[#faf3e0]/60 text-center py-6">Tidak ada notifikasi.</p>
                  ) : (
                    <div className="divide-y divide-[#26170c]/5 dark:divide-white/5">
                      {notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`px-4 py-3 text-xs transition-colors ${
                            n.unread ? 'bg-[#faf3e0]/50 dark:bg-[#26170c]/20 font-semibold' : 'text-[#26170C]/80 dark:text-[#faf3e0]/80'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <p className="leading-snug">{n.text}</p>
                            {n.unread && <span className="w-1.5 h-1.5 bg-[#ba1a1a] rounded-full mt-1 flex-shrink-0" />}
                          </div>
                          <span className="text-[9px] text-[#26170C]/40 dark:text-[#faf3e0]/40 font-mono">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          {/* Settings gear button (Triggers Profile Dropdown) */}
          <button 
            onClick={toggleDropdown}
            className={`text-[#26170C] dark:text-[#faf3e0] hover:bg-[#faf3e0] dark:hover:bg-[#26170C] p-2 rounded-full transition-all active:scale-95 duration-150 ${isDropdownOpen ? 'bg-[#faf3e0] dark:bg-[#26170C]' : ''}`}
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
          
          {/* Avatar (Triggers Profile Dropdown) */}
          <button 
            onClick={toggleDropdown}
            className="flex items-center pl-2 border-l border-[#d2c4bc]/50 dark:border-white/10 focus:outline-none"
          >
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBApJIh4kNKeTAslmYWLnS1omSs7SRUAxinsdypZDFXgq3qnvvlB4cHCL9TbyKnofO94GaMvPzGIVFJ4esYqeWJru34E_CWxRUuI-DF7yhgEdhX_H2IELJLKXtqxFUAq9HTc6rgii3YQb9fNzsTrpq5lRVB7zp1UJcP2OQ6R-UyhLlAtUT9KjGSCgrdKw32mBJqoiPteCQ-jE1xEjIqrKc4RIoZ7wPQv0TCbJpBPwRPEMFcMp-en_n48YPTaOfdOhEzjKSrYkmUZAz0" 
              alt={`${displayName} Profile`} 
              className="w-8 h-8 rounded-full border border-[#26170c]/20 object-cover hover:brightness-90 transition-all"
            />
          </button>

          {/* Settings/Profile Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Invisible Click Overlay to Close Dropdown */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsDropdownOpen(false)}
              />
              
              {/* Floating Dropdown Card */}
              <div className="absolute right-0 top-12 w-60 bg-[#FFF9EC] dark:bg-[#26170C] border border-[#d2c4bc]/60 dark:border-white/10 rounded-xl shadow-xl py-2 z-50 animate-fade-in">
                {/* Admin Title Info */}
                <div className="px-4 py-2 border-b border-[#26170c]/10 dark:border-white/10 mb-1">
                  <p className="text-xs font-bold text-[#26170c] dark:text-[#faf3e0]">{displayName}</p>
                  <p className="text-[10px] text-[#26170C]/60 dark:text-[#faf3e0]/60 font-mono">{displayEmail}</p>
                </div>

                {/* Profil Toko */}
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (onOpenStoreProfile) onOpenStoreProfile();
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#26170C] dark:text-[#faf3e0] hover:bg-[#faf3e0] dark:hover:bg-[#26170c] transition-colors text-left"
                >
                  <span className="material-symbols-outlined mr-3 text-sm">store</span>
                  Profil Toko
                </button>

                {/* Pengaturan Akun */}
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsAccountSettingsOpen(true);
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#26170C] dark:text-[#faf3e0] hover:bg-[#faf3e0] dark:hover:bg-[#26170c] transition-colors text-left"
                >
                  <span className="material-symbols-outlined mr-3 text-sm">person</span>
                  Pengaturan Akun
                </button>

                {/* Tema Tampilan Toggle */}
                <div className="w-full flex items-center justify-between px-4 py-2 border-y border-[#26170c]/5 dark:border-white/5 my-1 bg-[#faf3e0]/30 dark:bg-[#26170c]/20">
                  <div className="flex items-center text-xs font-bold uppercase tracking-wider text-[#26170C] dark:text-[#faf3e0]">
                    <span className="material-symbols-outlined mr-3 text-sm">
                      {isDarkMode ? 'dark_mode' : 'light_mode'}
                    </span>
                    Tema
                  </div>
                  
                  {/* Sun/Moon Toggle Button */}
                  <button 
                    type="button"
                    onClick={onToggleTheme}
                    className="flex items-center bg-[#faf3e0] dark:bg-[#26170c] border border-[#d2c4bc]/50 dark:border-white/10 rounded-full p-0.5 w-12 transition-colors relative"
                    title="Ubah Tema"
                  >
                    <div 
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-200 ${
                        isDarkMode ? 'translate-x-6 bg-[#26170c] dark:bg-[#faf3e0] text-[#FFF9EC] dark:text-[#26170c]' : 'bg-[#944925] text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[10px]">
                        {isDarkMode ? 'dark_mode' : 'light_mode'}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Logout / Keluar */}
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#ba1a1a] hover:bg-[#ffdad6]/50 dark:hover:bg-[#ffdad6]/10 transition-colors text-left"
                >
                  <span className="material-symbols-outlined mr-3 text-sm">logout</span>
                  Keluar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {isAccountSettingsOpen && (
        <AccountSettingsModal 
          onClose={() => {
            setIsAccountSettingsOpen(false);
            fetchUserProfile();
          }} 
          userRole={userRole} 
        />
      )}
    </header>
  );
}
