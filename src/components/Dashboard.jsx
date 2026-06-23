import React, { useState, useRef, useEffect } from 'react';

// Sub-component for individual serving customer card with Hold-to-Confirm feature
function DashboardServingCard({ sc, onCompleteServing, formatTime, getBarberRole }) {
  const [isHolding, setIsHolding] = useState(false);
  const pressTimer = useRef(null);

  const handlePressStart = (e) => {
    setIsHolding(true);
    pressTimer.current = setTimeout(() => {
      if (onCompleteServing) {
        onCompleteServing(sc.id);
      }
      setIsHolding(false);
    }, 1500); // 1.5 seconds hold time
  };

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    setIsHolding(false);
  };

  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
    };
  }, []);

  return (
    <div className="bg-[#efe8d5] dark:bg-[#2d303a]/30 border border-[#E9E2D0] dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4">
      <div className="flex items-center space-x-3">
        <img 
          src={sc.barberAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuALgYW6D-zh1ruvvw2PX4HQeP1F5rJXwbSV2WV-8tsaBVgb_do2kM2WkGuN-ccE_MkPZe0u8iSK-JdewUf07W-yBu_lWBtDN45DRDt5ldM-VtVQolmGcayqq-qkcwqVmD559hm3ABMhrSA2VfAh68ZkzgmXNhYiyKB-CBNP9BO0EwF7q2ohCMRGxBy-ISJXi_0nDLijxXql_iEhbZBWqAmQAiAewT4kh3gIDGlxi-UgjLuWd7zYQILN0mkC9za7TdKXQthc-jGBB7tJ"} 
          alt="Barber" 
          className="w-12 h-12 rounded-full object-cover border border-[#E9E2D0]"
        />
        <div>
          <h4 className="text-sm font-bold text-[#26170c] dark:text-[#faf3e0]">{sc.barberName}</h4>
          <p className="text-[10px] text-[#81756e] dark:text-[#9ca3af]/80 font-bold uppercase tracking-wider">
            {sc.barberRole || getBarberRole(sc.barberName)}
          </p>
        </div>
      </div>

      {/* Detail Pelayanan */}
      <div className="space-y-2.5 border-t border-[#E9E2D0] dark:border-white/5 pt-3 text-xs text-[#26170C] dark:text-[#faf3e0]">
        <div className="flex justify-between">
          <span className="text-[#81756e] dark:text-[#9ca3af]/80 font-medium">Pelanggan:</span>
          <span className="font-bold">{sc.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#81756e] dark:text-[#9ca3af]/80 font-medium">Layanan:</span>
          <span className="font-bold">{sc.serviceName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#81756e] dark:text-[#9ca3af]/80 font-medium">Waktu Mulai:</span>
          <span className="font-bold font-mono">{formatTime(sc.time)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#81756e] dark:text-[#9ca3af]/80 font-medium">Metode Pembayaran:</span>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
            sc.paymentMethod === 'Cash'
              ? 'bg-[#81756e]/10 text-[#4f453f] dark:bg-white/10 dark:text-[#faf3e0]/70'
              : sc.paymentMethod === 'QRIS'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
          }`}>
            {sc.paymentMethod || 'Cash'}
          </span>
        </div>
      </div>

      {/* Tombol SELESAI */}
      <button 
        type="button"
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        className="w-full py-3 rounded-lg font-bold text-xs uppercase tracking-widest relative overflow-hidden transition-all duration-[1500ms] ease-linear transform bg-[#944925] dark:bg-[#faf3e0] text-white dark:text-[#26170C] active:scale-95 shadow-md select-none"
      >
        <span 
          className={`absolute inset-0 bg-[#A67C52] origin-left -z-10 ${
            isHolding
              ? 'scale-x-100 opacity-100 transition-transform duration-[1500ms] ease-linear'
              : 'scale-x-0 opacity-0 transition-transform duration-300 ease-out'
          }`}
        />
        <span className="relative z-10">
          {sc.paymentMethod === 'Cash' ? 'SELESAI & BAYAR' : 'SELESAI'}
        </span>
      </button>
    </div>
  );
}


export default function Dashboard({ appointments = [], onCompleteServing, onEditAppointment, selectedDate }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterBarber, setFilterBarber] = useState('Semua');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSelectFilter = (barberName) => {
    setFilterBarber(barberName);
    setShowFilter(false);
  };
  // Helper to format time to 12-hour format with AM/PM (e.g. 09:00 -> 09:00 AM)
  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${String(displayHours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const getBarberRole = (name) => {
    if (name === 'Rahardian') return 'Master Barber';
    if (name === 'Gunawan') return 'Senior Barber';
    if (name === 'Eko') return 'Senior Barber';
    return 'Senior Barber';
  };

  // Filter for all serving customers
  const servingCustomers = appointments.filter((a) => !a.isBreak && a.status === 'serving');

  // Remaining items with 'waiting' status are the waiting list
  const waitingList = appointments.filter((a) => !a.isBreak && a.status === 'waiting');

  const filteredWaitingList = filterBarber === 'Semua'
    ? waitingList
    : waitingList.filter((item) => item.barberName === filterBarber);

  // Calculate dynamic stats
  const activeQueuesCount = appointments.filter(a => !a.isBreak && (a.status === 'waiting' || a.status === 'serving')).length;
  const totalCustomersCount = appointments.filter(a => !a.isBreak && a.status !== 'pending').length;
  const todayRevenue = appointments
    .filter(a => !a.isBreak && (a.status === 'completed' || a.status === 'serving' || a.paymentMethod === 'Online'))
    .reduce((sum, a) => sum + (a.totalPrice || 0), 0);

  return (
    <main className="p-6 md:p-8 flex-1 bg-[#FFF9EC] dark:bg-[#26170c] transition-colors duration-200 animate-fade-in">
      {/* Header & Teks */}
      <div className="mb-10">
        <h2 className="text-4xl font-headline italic text-[#26170c] dark:text-[#faf3e0] leading-tight">
          Ikhtisar Dashboard
        </h2>
        <p className="text-[#26170C]/70 dark:text-[#faf3e0]/70 mt-2 max-w-xl">
          Selamat datang kembali, Admin. Berikut adalah performa harian Warisan Cukur untuk tanggal {selectedDate || '3 Mei 2024'}.
        </p>
      </div>

      {/* Tiga Kartu Statistik (Atas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Kartu 1: PENDAPATAN HARI INI */}
        <div className="bg-[#FAF3E0] dark:bg-[#26170C] border-y border-r border-[#E9E2D0] border-l-[6px] border-l-[#26170C] dark:border-l-[6px] dark:border-l-[#944925] dark:border-white/5 rounded-r-2xl p-6 shadow-sm flex items-start justify-between relative overflow-hidden group">
          <div>
            <span className="text-[10px] font-bold text-[#944925] dark:text-[#ffb596] uppercase tracking-wider block">
              PENDAPATAN HARI INI
            </span>
            <h3 className="text-2xl font-bold text-[#26170c] dark:text-[#faf3e0] mt-1.5 tracking-tight">
              Rp {todayRevenue.toLocaleString('id-ID')}
            </h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-3.5 flex items-center">
              <span className="material-symbols-outlined text-xs mr-0.5">trending_up</span>
              Performa hari ini
            </p>
          </div>
          <span className="material-symbols-outlined text-4xl text-[#A48873] dark:text-[#faf3e0]/20 absolute right-4 top-4 select-none">
            payments
          </span>
        </div>

        {/* Kartu 2: TOTAL PELANGGAN */}
        <div className="bg-[#FAF3E0] dark:bg-[#26170C] border-y border-r border-[#E9E2D0] border-l-[6px] border-l-[#26170C] dark:border-l-[6px] dark:border-l-[#944925] dark:border-white/5 rounded-r-2xl p-6 shadow-sm flex items-start justify-between relative overflow-hidden group">
          <div>
            <span className="text-[10px] font-bold text-[#944925] dark:text-[#ffb596] uppercase tracking-wider block">
              TOTAL PELANGGAN
            </span>
            <h3 className="text-2xl font-bold text-[#26170c] dark:text-[#faf3e0] mt-1.5 tracking-tight">
              {totalCustomersCount} Orang
            </h3>
            <p className="text-[10px] text-[#26170C]/60 dark:text-[#faf3e0]/60 font-semibold mt-3.5">
              Kunjungan hari ini
            </p>
          </div>
          <span className="material-symbols-outlined text-4xl text-[#A48873] dark:text-[#faf3e0]/20 absolute right-4 top-4 select-none">
            groups
          </span>
        </div>

        {/* Kartu 3: ANTREAN AKTIF */}
        <div className="bg-[#FAF3E0] dark:bg-[#26170C] border-y border-r border-[#E9E2D0] border-l-[6px] border-l-[#26170C] dark:border-l-[6px] dark:border-l-[#944925] dark:border-white/5 rounded-r-2xl p-6 shadow-sm flex items-start justify-between relative overflow-hidden group">
          <div>
            <span className="text-[10px] font-bold text-[#944925] dark:text-[#ffb596] uppercase tracking-wider block">
              ANTREAN AKTIF
            </span>
            <h3 className="text-2xl font-bold text-[#26170c] dark:text-[#faf3e0] mt-1.5 tracking-tight">
              {activeQueuesCount} Antrean
            </h3>
            <p className="text-[10px] text-[#944925] dark:text-[#ffb596] font-bold mt-3.5 flex items-center">
              <span className="material-symbols-outlined text-xs mr-0.5">hourglass_empty</span>
              Estimasi tunggu: {activeQueuesCount * 30} Menit
            </p>
          </div>
          <span className="material-symbols-outlined text-4xl text-[#A48873] dark:text-[#faf3e0]/20 absolute right-4 top-4 select-none">
            pending_actions
          </span>
        </div>
      </div>

      {/* Layout Bawah (Grid 2 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri - Sedang Dilayani */}
        <div className="bg-[#FAF3E0] dark:bg-[#26170C] border border-[#E9E2D0] dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col justify-start min-h-[360px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E9E2D0] dark:border-white/5">
            <h4 className="text-sm font-bold text-[#26170c] dark:text-[#faf3e0]">Sedang Dilayani</h4>
            <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950/40 px-2 py-0.5 rounded flex items-center space-x-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400" />
              <span>LIVE</span>
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {servingCustomers.length > 0 ? (
              servingCustomers.map((sc) => (
                <DashboardServingCard
                  key={sc.id}
                  sc={sc}
                  onCompleteServing={onCompleteServing}
                  formatTime={formatTime}
                  getBarberRole={getBarberRole}
                />
              ))
            ) : (
              <div className="bg-[#efe8d5]/40 dark:bg-[#2d303a]/10 border border-dashed border-[#81756e]/30 dark:border-white/10 rounded-2xl p-8 text-center text-sm text-[#81756e] dark:text-[#faf3e0]/60 italic min-h-[200px] flex items-center justify-center">
                Menunggu Panggilan Berikutnya
              </div>
            )}
          </div>
        </div>

        {/* Kolom Ranan - Daftar Antrean (Tabel Putih) */}
        <div className="lg:col-span-2 bg-[#FAF3E0] dark:bg-[#26170C] border border-[#E9E2D0] dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-base font-bold text-[#26170c] dark:text-[#faf3e0]">Daftar Antrean</h4>
                <p className="text-xs text-[#81756e] dark:text-[#9ca3af]/80 mt-0.5">
                  ({filteredWaitingList.length} pelanggan menunggu {filterBarber !== 'Semua' ? `untuk ${filterBarber}` : ''})
                </p>
              </div>
              <div className="flex items-center space-x-2 relative">
                <button 
                  onClick={() => setShowFilter(!showFilter)}
                  className="p-2 hover:bg-[#faf3e0] dark:hover:bg-[#26170c] rounded-full text-[#81756e] dark:text-[#faf3e0] cursor-pointer transition-colors" 
                  title="Filter"
                >
                  <span className="material-symbols-outlined text-lg">filter_list</span>
                </button>
                <button 
                  onClick={handleRefresh}
                  className="p-2 hover:bg-[#faf3e0] dark:hover:bg-[#26170c] rounded-full text-[#81756e] dark:text-[#faf3e0] cursor-pointer transition-colors" 
                  title="Refresh"
                >
                  <span className={`material-symbols-outlined text-lg block ${isRefreshing ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                </button>

                {showFilter && (
                  <div className="absolute right-0 top-10 w-40 bg-white dark:bg-[#3d2b1f] border border-[#E5D3C5] dark:border-white/10 shadow-lg rounded-lg py-2 z-20 text-sm">
                    <div className="px-4 py-2 font-semibold text-[#26170C] dark:text-[#faf3e0] border-b border-gray-100 dark:border-white/5">Filter By Barber</div>
                    <button 
                      type="button" 
                      onClick={() => handleSelectFilter('Semua')} 
                      className={`w-full text-left px-4 py-2 hover:bg-[#F9F6F0] dark:hover:bg-white/5 ${filterBarber === 'Semua' ? 'font-bold text-[#26170C] dark:text-[#faf3e0]' : 'text-gray-700 dark:text-[#faf3e0]/80'}`}
                    >
                      Semua
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleSelectFilter('Rahardian')} 
                      className={`w-full text-left px-4 py-2 hover:bg-[#F9F6F0] dark:hover:bg-white/5 ${filterBarber === 'Rahardian' ? 'font-bold text-[#26170C] dark:text-[#faf3e0]' : 'text-gray-700 dark:text-[#faf3e0]/80'}`}
                    >
                      Rahardian
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleSelectFilter('Gunawan')} 
                      className={`w-full text-left px-4 py-2 hover:bg-[#F9F6F0] dark:hover:bg-white/5 ${filterBarber === 'Gunawan' ? 'font-bold text-[#26170C] dark:text-[#faf3e0]' : 'text-gray-700 dark:text-[#faf3e0]/80'}`}
                    >
                      Gunawan
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleSelectFilter('Eko')} 
                      className={`w-full text-left px-4 py-2 hover:bg-[#F9F6F0] dark:hover:bg-white/5 ${filterBarber === 'Eko' ? 'font-bold text-[#26170C] dark:text-[#faf3e0]' : 'text-gray-700 dark:text-[#faf3e0]/80'}`}
                    >
                      Eko
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Responsive Table Container */}
            <div className="w-full overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E9E2D0] dark:border-white/10 text-[#81756e] dark:text-[#faf3e0]/60 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">No.</th>
                    <th className="py-3 px-4">Nama Pelanggan</th>
                    <th className="py-3 px-4">Layanan</th>
                    <th className="py-3 px-4">Barber Preferensi</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26170c]/5 dark:divide-white/5 text-[#26170C] dark:text-[#faf3e0]">
                  {filteredWaitingList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-[#81756e] dark:text-[#faf3e0]/60 font-medium">
                        Tidak ada antrean menunggu untuk filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredWaitingList.map((apt, index) => (
                      <tr key={apt.id} className="hover:bg-[#faf3e0]/30 dark:hover:bg-[#26170c]/20 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold">{index + 1}</td>
                        <td className="py-4 px-4">
                          <span className="font-bold block">{apt.customerName}</span>
                          <span className="text-[10px] text-[#81756e] dark:text-[#9ca3af]/80 font-medium">
                            {apt.bookingSource || 'Walk-in'}
                          </span>
                        </td>
                        <td className="py-4 px-4">{apt.serviceName}</td>
                        <td className="py-4 px-4 font-medium">{apt.barberName}</td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center space-x-1.5 font-bold border border-[#E9E2D0] dark:border-white/10 px-2 py-0.5 rounded-full bg-[#FAF3E0] dark:bg-[#2d303a]/30 text-[#26170C] dark:text-[#faf3e0]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#944925] dark:bg-[#ffb596]" />
                            <span>Menunggu</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}
