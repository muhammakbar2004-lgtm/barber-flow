import React from 'react';

export default function Sidebar({ isOpen, onClose, onOpenBookingModal, currentTab = 'jadwal', onChangeTab, isClosed = false, storeStatusLabel = 'Pesan Kursi Baru', onLogout, userRole = 'admin' }) {
  const menuItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: 'dashboard', color: 'text-red-500 dark:text-red-400', roles: ['admin'] },
    { id: 'JADWAL ANTREAN', label: 'Jadwal Antrean', icon: 'calendar_month', color: 'text-blue-500 dark:text-blue-400', roles: ['admin', 'barber'] },
    { id: 'barber', label: 'Data Barber', icon: 'content_cut', color: 'text-amber-500 dark:text-amber-400', roles: ['admin'] },
    { id: 'layanan', label: 'Layanan', icon: 'dry_cleaning', color: 'text-purple-500 dark:text-purple-400', roles: ['admin'] },
    { id: 'laporan', label: 'Laporan Keuangan', icon: 'payments', color: 'text-emerald-500 dark:text-emerald-400', roles: ['admin'] },
  ].filter(item => item.roles.includes(userRole));

  const sidebarContent = (
    <div className="h-full flex flex-col py-4 bg-[#faf3e0] dark:bg-[#26170C] shadow-xl border-r border-[#26170c]/5 dark:border-white/5 transition-colors duration-200">
      {/* Brand Header */}
      <div className="px-6 mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-2.5">
          <span className="material-symbols-outlined text-2xl text-[#944925] dark:text-[#ffb596] font-bold">content_cut</span>
          <div>
            <h1 className="text-sm font-headline italic text-[#26170c] dark:text-[#faf3e0]">Heritage Grooming</h1>
            <p className="font-sans uppercase tracking-widest text-[8px] font-semibold text-[#3d2b1f] dark:text-[#faf3e0]/60 opacity-60">Admin Panel</p>
          </div>
        </div>
        {/* Mobile close button */}
        <button 
          onClick={onClose}
          className="md:hidden p-1 text-[#26170c] dark:text-[#faf3e0] hover:bg-[#e9e2d0] dark:hover:bg-[#26170c] rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (onChangeTab) onChangeTab(item.id);
                if (onClose) onClose(); // close mobile sidebar on click
              }}
              className={`w-[calc(100%-1rem)] flex items-center px-6 py-3 mx-2 my-1 rounded-md transition-all duration-200 text-left ${
                isActive
                  ? 'bg-[#26170c] dark:bg-[#faf3e0] text-[#FFF9EC] dark:text-[#26170c] shadow-md'
                  : 'text-[#26170c] dark:text-[#faf3e0]/80 hover:bg-[#e9e2d0] dark:hover:bg-[#26170c] hover:translate-x-1'
              }`}
            >
              <span className={`material-symbols-outlined mr-3 transition-colors ${isActive ? 'text-current' : item.color}`}>{item.icon}</span>
              <span className="font-sans uppercase tracking-widest text-xs font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 mt-auto space-y-4">
        {/* Oranye Terakota Button */}
        <button 
          onClick={onOpenBookingModal}
          disabled={isClosed}
          className={`w-full py-3 px-4 rounded-md font-sans uppercase tracking-widest text-xs font-bold transition-all duration-150 transform shadow-md ${
            isClosed 
              ? 'bg-[#d2c4bc]/50 dark:bg-white/10 text-[#26170c]/40 dark:text-[#faf3e0]/30 cursor-not-allowed'
              : 'bg-[#944925] hover:bg-[#773310] text-white active:scale-95'
          }`}
        >
          {storeStatusLabel}
        </button>
        <div className="pt-4 border-t border-[#26170c]/10 dark:border-white/10">
          <a href="#" className="flex items-center px-4 py-2 text-[#26170c] dark:text-[#faf3e0]/80 hover:text-[#944925] text-xs font-semibold uppercase tracking-wider transition-colors">
            <span className="material-symbols-outlined mr-2 text-sm">help</span> Bantuan
          </a>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (onLogout) onLogout();
            }}
            className="flex items-center px-4 py-2 text-[#26170c] dark:text-[#faf3e0]/80 hover:text-[#ba1a1a] text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <span className="material-symbols-outlined mr-2 text-sm">logout</span> Keluar
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (visible on md screens and up) */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 hidden md:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (visible only on mobile when isOpen is true) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Overlay */}
          <div 
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity hidden md:block"
          />
          {/* Drawer content */}
          <aside className="relative w-64 h-full flex flex-col z-55 animate-slide-in hidden md:flex">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
