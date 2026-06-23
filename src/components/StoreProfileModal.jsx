import React, { useState, useEffect } from 'react';

export default function StoreProfileModal({ 
  isOpen, 
  onClose, 
  isStoreActive, 
  onToggleStoreActive, 
  isAutoMode, 
  onToggleAutoMode, 
  userRole = 'customer',
  openTime = '09:00',
  closeTime = '17:00',
  onSaveHours
}) {
  if (!isOpen) return null;

  const isAdmin = userRole === 'admin';

  const [localOpenTime, setLocalOpenTime] = useState(openTime);
  const [localCloseTime, setLocalCloseTime] = useState(closeTime);
  const [savingHours, setSavingHours] = useState(false);

  // Sync state with props when open
  useEffect(() => {
    setLocalOpenTime(openTime);
    setLocalCloseTime(closeTime);
  }, [openTime, closeTime, isOpen]);

  const handleSaveHours = async () => {
    setSavingHours(true);
    try {
      if (onSaveHours) {
        await onSaveHours(localOpenTime, localCloseTime);
      }
    } finally {
      setSavingHours(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#FFF9EC] dark:bg-[#26170C] border border-[#26170c]/10 dark:border-white/5 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#26170c]/5 flex justify-between items-center bg-[#faf3e0] dark:bg-[#2d303a]/50">
          <h3 className="text-xl font-headline italic text-[#26170c] dark:text-[#faf3e0] flex items-center">
            <span className="material-symbols-outlined mr-2 text-[#944925]">store</span>
            Profil Toko
          </h3>
          <div className="flex items-center gap-3">
            {!isAdmin && (
              <span className="px-2 py-0.5 rounded bg-[#26170C]/5 dark:bg-white/5 border border-[#26170c]/10 dark:border-white/10 text-[8px] font-extrabold uppercase tracking-widest text-[#81756e] dark:text-[#faf3e0]/60 flex items-center gap-1 font-sans">
                <span className="material-symbols-outlined text-[10px] font-bold">lock</span>
                Read-Only
              </span>
            )}
            <button 
              type="button"
              onClick={onClose}
              className="p-1 text-[#81756e] hover:text-[#26170c] dark:hover:text-[#faf3e0] rounded-full focus:outline-none"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Store Info details */}
          <div className="space-y-4">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#81756e] dark:text-[#9ca3af]/80">Nama Toko</span>
              <p className="text-sm font-bold text-[#26170c] dark:text-[#faf3e0]">Heritage Grooming</p>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#81756e] dark:text-[#9ca3af]/80">Alamat</span>
              <p className="text-xs text-[#26170C]/80 dark:text-[#faf3e0]/80">Jl. Veteran No. 12, Jakarta Pusat</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#81756e] dark:text-[#9ca3af]/80">Telepon</span>
                <p className="text-xs text-[#26170C]/80 dark:text-[#faf3e0]/80">(021) 555-0199</p>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#81756e] dark:text-[#9ca3af]/80">Jam Kerja</span>
                {isAdmin ? (
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="time" 
                        value={localOpenTime} 
                        onChange={(e) => setLocalOpenTime(e.target.value)}
                        className="bg-white dark:bg-black/20 border border-[#E5D3C5] dark:border-white/10 rounded px-1.5 py-0.5 text-xs text-[#26170C] dark:text-[#faf3e0] focus:outline-none w-28 font-sans"
                      />
                      <span className="text-[10px] text-[#81756e]">-</span>
                      <input 
                        type="time" 
                        value={localCloseTime} 
                        onChange={(e) => setLocalCloseTime(e.target.value)}
                        className="bg-white dark:bg-black/20 border border-[#E5D3C5] dark:border-white/10 rounded px-1.5 py-0.5 text-xs text-[#26170C] dark:text-[#faf3e0] focus:outline-none w-28 font-sans"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveHours}
                      disabled={savingHours}
                      className="bg-[#26170C] dark:bg-[#faf3e0] text-[#FAF6EE] dark:text-[#26170C] px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider hover:bg-[#3d2b1f] dark:hover:bg-[#FFF9EC] disabled:opacity-50 transition-colors w-fit focus:outline-none font-sans"
                    >
                      {savingHours ? 'Menyimpan...' : 'Simpan Jam Kerja'}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-[#26170C]/80 dark:text-[#faf3e0]/80 font-bold">{openTime} - {closeTime}</p>
                )}
              </div>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[#81756e] dark:text-[#9ca3af]/80">Deskripsi</span>
              <p className="text-xs text-[#26170C]/70 dark:text-[#faf3e0]/70 leading-relaxed">
                Heritage Grooming menyediakan layanan pangkas rambut and perawatan pria premium dengan memadukan kenyamanan modern dan tradisi ketepatan waktu yang berkelas.
              </p>
            </div>
          </div>

          {/* Operational Settings */}
          <div className="bg-[#faf3e0] dark:bg-[#2d303a]/30 border border-[#d2c4bc]/40 dark:border-white/5 rounded-xl p-4 space-y-4">
            
            {/* Auto/Manual Mode Switch */}
            <div className="flex items-center justify-between pb-3 border-b border-[#26170c]/5 dark:border-white/5">
              <div>
                <h4 className="text-xs font-bold text-[#26170c] dark:text-[#faf3e0]">Mode Operasional</h4>
                <p className="text-[10px] text-[#26170C]/60 dark:text-[#faf3e0]/60 mt-0.5">
                  {isAutoMode ? `Otomatis (Mengikuti Jam Kerja: ${openTime} - ${closeTime})` : 'Manual (Kendali Penuh Admin)'}
                </p>
              </div>
              <button 
                type="button"
                onClick={isAdmin ? onToggleAutoMode : undefined}
                disabled={!isAdmin}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all focus:outline-none ${
                  isAutoMode
                    ? 'border-[#944925] bg-[#944925]/10 text-[#26170c] dark:text-[#faf3e0]'
                    : 'border-[#d2c4bc]/30 dark:border-white/5 bg-[#faf3e0] dark:bg-[#2d303a] text-[#81756e]'
                } ${!isAdmin ? 'opacity-55 cursor-not-allowed border-[#d2c4bc]/30' : ''}`}
                title={!isAdmin ? 'Akses Terkunci (Hanya Admin)' : (isAutoMode ? 'Ubah ke Mode Manual' : 'Ubah ke Mode Otomatis')}
              >
                <span className="material-symbols-outlined text-sm">
                  {!isAdmin ? 'lock' : (isAutoMode ? 'check_circle' : 'back_hand')}
                </span>
                <span>{isAutoMode ? 'Auto' : 'Manual'}</span>
              </button>
            </div>

            {/* Store Status Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-xs font-bold ${isAutoMode || !isAdmin ? 'text-[#26170c]/40 dark:text-[#faf3e0]/40' : 'text-[#26170c] dark:text-[#faf3e0]'}`}>
                  Status Operasional Toko
                </h4>
                <p className="text-[10px] text-[#26170C]/60 dark:text-[#faf3e0]/60 mt-0.5">
                  {isStoreActive ? 'Toko Buka (Aktif)' : 'Toko Tutup (Bypass)'}
                </p>
              </div>
              <button 
                type="button"
                onClick={isAdmin && !isAutoMode ? onToggleStoreActive : undefined}
                disabled={isAutoMode || !isAdmin}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 focus:outline-none flex items-center ${
                  isStoreActive ? 'bg-emerald-500' : 'bg-red-500'
                } ${(isAutoMode || !isAdmin) ? 'opacity-40 cursor-not-allowed' : ''}`}
                title={
                  !isAdmin
                    ? 'Akses Terkunci (Hanya Admin)'
                    : isAutoMode
                    ? 'Nonaktifkan Mode Otomatis terlebih dahulu untuk mengubah'
                    : isStoreActive
                    ? 'Klik untuk Tutup Toko'
                    : 'Klik untuk Buka Toko'
                }
              >
                <div 
                  className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center ${
                    isStoreActive ? 'translate-x-6' : 'translate-x-0'
                  }`}
                >
                  <span className={`material-symbols-outlined text-xs ${
                    isAutoMode || !isAdmin 
                      ? 'text-[#81756e]' 
                      : isStoreActive 
                      ? 'text-emerald-600' 
                      : 'text-red-600'
                  }`}>
                    {isAutoMode || !isAdmin ? 'lock' : (isStoreActive ? 'lock_open' : 'lock')}
                  </span>
                </div>
              </button>
            </div>
            
            <p className="text-[10px] text-[#26170C]/50 dark:text-[#faf3e0]/50 italic leading-snug">
              {!isAdmin 
                ? 'Akses terbatas: Anda login sebagai Barber. Hanya Administrator yang dapat mengubah status operasional toko.' 
                : (isAutoMode 
                  ? `Sistem otomatis mengunci status berdasarkan jam kerja (${openTime} - ${closeTime}).`
                  : 'Gunakan ini untuk menutup toko secara manual (misal: libur mendadak).')}
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-[#efe8d5] dark:bg-[#2d303a] hover:bg-[#e9e2d0] dark:hover:bg-[#3d2b1f] text-[#26170c] dark:text-[#faf3e0] py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors active:scale-95 transform focus:outline-none font-sans"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
