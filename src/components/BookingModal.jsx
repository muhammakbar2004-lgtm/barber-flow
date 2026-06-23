import React, { useState } from 'react';
import { servicesData } from '../data/servicesData';

const activeServices = servicesData.filter(s => s.status === 'Aktif');

export default function BookingModal({ 
  isOpen, 
  onClose, 
  onSave,
  openTime = '09:00',
  closeTime = '17:30'
}) {
  const [activeStep, setActiveStep] = useState(0); // 0: Informasi, 1: Pilih Barber, 2: Pembayaran

  // Step 0 states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedServices, setSelectedServices] = useState([activeServices[0]?.name || '']);

  // Step 1 states
  const [barberName, setBarberName] = useState('Rahardian');
  const [time, setTime] = useState('14:00');
  const [bookingDate, setBookingDate] = useState('hari_ini');
  const [timeError, setTimeError] = useState('');

  // Step 2 states
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  if (!isOpen) return null;

  const handleClose = () => {
    setActiveStep(0);
    setCustomerName('');
    setPhone('');
    setSelectedServices([activeServices[0]?.name || '']);
    setBarberName('Rahardian');
    setTime('14:00');
    setBookingDate('hari_ini');
    setPaymentMethod('Cash');
    setTimeError('');
    onClose();
  };

  const handleToggleService = (name) => {
    setSelectedServices((prev) => {
      if (prev.includes(name)) {
        return prev.filter((s) => s !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  const handleTabClick = (stepIndex) => {
    // Basic validation when jumping tabs directly
    if (stepIndex > 0) {
      if (!customerName.trim()) {
        alert('Nama pelanggan harus diisi!');
        return;
      }
      if (selectedServices.length === 0) {
        alert('Pilih setidaknya satu layanan!');
        return;
      }
    }
    if (stepIndex === 2) {
      if (time < openTime || time > closeTime) {
        alert(`Waktu layanan hanya tersedia antara pukul ${openTime} - ${closeTime}`);
        return;
      }
    }
    setActiveStep(stepIndex);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate Step 0
    if (!customerName.trim()) {
      alert('Nama pelanggan harus diisi!');
      return;
    }
    if (selectedServices.length === 0) {
      alert('Pilih setidaknya satu layanan!');
      return;
    }

    if (activeStep === 0) {
      setActiveStep(1);
      return;
    }

    // Validate Step 1
    if (time < openTime || time > closeTime) {
      setTimeError(`Waktu layanan hanya tersedia antara pukul ${openTime} - ${closeTime}`);
      return;
    }
    setTimeError('');

    if (activeStep === 1) {
      setActiveStep(2);
      return;
    }

    // Submit Step 2
    if (activeStep === 2) {
      // Calculate total duration in minutes
      const totalDurationMin = activeServices
        .filter(s => selectedServices.includes(s.name))
        .reduce((acc, curr) => acc + curr.duration, 0);

      const success = onSave({
        customerName,
        phone: phone || '08xx-xxxx-xxxx',
        serviceName: selectedServices.join(', '),
        duration: `${totalDurationMin} Menit`,
        barberName,
        time,
        bookingDate,
        addToQueue: true,
        paymentMethod
      });

      if (success !== false) {
        handleClose();
      }
    }
  };

  // Calculate total price in real-time
  const totalHarga = activeServices
    .filter(s => selectedServices.includes(s.name))
    .reduce((acc, curr) => acc + curr.price, 0);

  const barbers = [
    { name: 'Rahardian', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuRAo0ZT6waub9Kwe7YWTOmIQtGtz7vgMFThd0-eObVTpebu1RGVg5AnmS5tE89mCOponHH2bvrfRtyEZS7MOQyk7mhxlvaMrwn49SNXhiVEt9LTW-bXoeGd-Siofd21MjIkOP2rpdHOxUXnPnnJ3WnEonJNo58dpjwlqBxSeTErUnzrIIVSzar-HdvjvDGoTwygwaFniymFKV5cE1tp4XyNT9sZESYk14e7HJK_34oVWdZYGKNxiwdV28w2rGNvi_v2nmU99yxVHd' },
    { name: 'Gunawan', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkajYKOu0Ol0SEAQC3uKHy3aiw0xWlaDYnFQNZxxtiF_-HCl388Hj4UQuJ382exaQGGT68Dn-4YqQN-7r3nv-CLhu8pfVHDL3UFWf47ajOicvispjVu54A7pCdx0zmjy8EV2yEEJVlrRcqGdZRdfteRiyFqkUIS_kEZ5e_eNCI4ZbF97Tho17JM-gCnMrkZTlvARBOdniCAHgVIdNBqBwBE39RhERrNnBA6DtrVDcgYisbD9EtvIIFrg0tqC3X8AKSjQSPykokwC6b' },
    { name: 'Eko', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv2C9Fo68RuvXOkMuVZ1b8i8B6aotSLGdHw2jU9aeE2m70y-Bo9bDWZhaljJnWltD48wS8NcnuIRSlY5iVMESAOpsEBtt8O6pg_RNicUmcUNwdCTKK4aWbZukkb9ssUeFAjH57UvBYydlKIUJAF-_JJlCO-AdfBWx_oEOIMRBAIZGb-ycTqWyrntqmkiAzvZzRE0SkmNXCQ57Kkg_ZKwAUj9sIO-zmAtjWlkzbcpqmLUt4wen5XZ7pjgBmyHM5ONOMvNoQixZvrOHa' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fade-in text-[#26170C]">
      <div 
        className="bg-[#F9F6F0] dark:bg-[#26170C] border border-[#26170c]/10 dark:border-white/5 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#26170c]/5 flex justify-between items-center bg-[#FAF6EE] dark:bg-black/10">
          <h3 className="text-2xl font-serif font-bold italic text-[#26170c] dark:text-[#faf3e0]">
            Pesan Kursi Baru
          </h3>
          <button 
            type="button"
            onClick={handleClose}
            className="p-1 text-[#81756e] hover:text-[#26170c] dark:hover:text-[#faf3e0] rounded-full transition-colors"
          >
            <span className="text-xl font-bold font-sans">&times;</span>
          </button>
        </div>

        {/* Multi-Step Tab Progress Indicators */}
        <div className="flex border-b border-[#E5D3C5]/60 bg-[#FAF6EE]/30">
          {[
            { index: 0, label: 'INFORMASI' },
            { index: 1, label: 'PILIH BARBER' },
            { index: 2, label: 'PEMBAYARAN' }
          ].map((step) => {
            const isActive = activeStep === step.index;
            return (
              <button
                key={step.index}
                type="button"
                onClick={() => handleTabClick(step.index)}
                className={`flex-1 text-center py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                  isActive
                    ? 'border-[#26170C] dark:border-[#faf3e0] text-[#26170C] dark:text-[#faf3e0]'
                    : 'border-transparent text-gray-400 hover:text-[#26170C]/60 dark:hover:text-[#faf3e0]/60'
                }`}
              >
                {step.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* STEP 0: INFORMASI */}
          {activeStep === 0 && (
            <div className="space-y-4 animate-fade-in">
              {/* Nama Pelanggan */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#81756e] dark:text-[#faf3e0]/60 mb-2">
                  Nama Pelanggan <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full bg-[#FAF3E0]/70 dark:bg-[#3d2b1f]/50 border border-[#E5D3C5] dark:border-white/10 rounded-lg px-4 py-3 text-sm text-[#26170C] dark:text-[#faf3e0] placeholder-[#81756e]/50 focus:ring-1 focus:ring-[#26170C] dark:focus:ring-[#faf3e0] focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Nomor Telepon */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#81756e] dark:text-[#faf3e0]/60 mb-2">
                  Nomor Telepon
                </label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full bg-[#FAF3E0]/70 dark:bg-[#3d2b1f]/50 border border-[#E5D3C5] dark:border-white/10 rounded-lg px-4 py-3 text-sm text-[#26170C] dark:text-[#faf3e0] placeholder-[#81756e]/50 focus:ring-1 focus:ring-[#26170C] dark:focus:ring-[#faf3e0] focus:outline-none transition-all"
                />
              </div>

              {/* Checkbox Services List */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#81756e] dark:text-[#faf3e0]/60 mb-2">
                  Pilih Layanan <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeServices.map((srv) => {
                    const isSelected = selectedServices.includes(srv.name);
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => handleToggleService(srv.name)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-[#26170C] dark:border-[#faf3e0] bg-[#26170C]/5 dark:bg-[#faf3e0]/5 text-[#26170C] dark:text-[#faf3e0] font-bold shadow-sm'
                            : 'border-[#E5D3C5]/60 dark:border-white/5 bg-[#FAF3E0]/30 dark:bg-[#3d2b1f]/20 text-[#81756e] dark:text-[#faf3e0]/80 hover:border-[#26170C]/40 dark:hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-[#26170C] dark:bg-[#faf3e0] border-[#26170C] dark:border-[#faf3e0] text-white dark:text-[#26170C]'
                              : 'border-[#E5D3C5] dark:border-white/10 bg-white dark:bg-[#26170c]'
                          }`}>
                            {isSelected && <span className="text-[10px] leading-none font-sans font-bold">✓</span>}
                          </span>
                          <div>
                            <span className="text-xs block text-[#26170C] dark:text-[#faf3e0] font-semibold">{srv.name}</span>
                            <span className="text-[10px] text-[#81756e] dark:text-[#faf3e0]/60 font-medium">{srv.duration} Menit</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#26170C] dark:text-[#faf3e0]">
                          Rp {srv.price.toLocaleString('id-ID')}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Total Estimate */}
                <div className="flex justify-between items-center bg-[#FAF3E0]/60 dark:bg-black/10 border border-[#E5D3C5] dark:border-white/5 p-3.5 rounded-lg mt-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#81756e] dark:text-[#faf3e0]/60">Total Estimasi</span>
                  <span className="text-base font-extrabold text-[#26170C] dark:text-[#faf3e0]">
                    Rp {totalHarga.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: PILIH BARBER & WAKTU */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              {/* Barber Selector */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#81756e] dark:text-[#faf3e0]/60 mb-2">
                  Pilih Barber
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {barbers.map((b) => {
                    const isSelected = barberName === b.name;
                    return (
                      <button
                        key={b.name}
                        type="button"
                        onClick={() => setBarberName(b.name)}
                        className={`flex flex-col items-center p-3 rounded-lg border text-center transition-all ${
                          isSelected
                            ? 'border-[#26170C] dark:border-[#faf3e0] bg-[#26170C]/5 dark:bg-[#faf3e0]/5 text-[#26170C] dark:text-[#faf3e0] font-bold'
                            : 'border-[#d2c4bc]/30 dark:border-white/5 bg-[#FAF3E0]/30 dark:bg-[#2d303a] text-[#81756e]'
                        }`}
                      >
                        <img 
                          src={b.avatar} 
                          alt={b.name} 
                          className="w-10 h-10 rounded-full object-cover mb-2 border border-[#E5D3C5]/60"
                        />
                        <span className="text-[11px] font-bold">{b.name}</span>
                        <span className="text-[8px] opacity-75 mt-0.5 uppercase tracking-wider">
                          {b.name === 'Rahardian' ? 'Senior' : b.name === 'Gunawan' ? 'Specialist' : 'Junior'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hari Layanan */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#81756e] dark:text-[#faf3e0]/60 mb-2">
                  Hari Layanan
                </label>
                <div className="bg-[#FAF3E0]/40 dark:bg-[#2d303a] p-1 flex rounded-lg border border-[#d2c4bc]/20 dark:border-white/5">
                  <button 
                    type="button"
                    onClick={() => setBookingDate('hari_ini')}
                    className={`flex-1 py-2 rounded text-xs font-bold transition-all ${
                      bookingDate === 'hari_ini'
                        ? 'bg-[#26170c] dark:bg-[#faf3e0] text-white dark:text-[#26170c] shadow-sm'
                        : 'text-[#81756e] hover:text-[#26170c] dark:hover:text-[#faf3e0]'
                    }`}
                  >
                    Hari Ini
                  </button>
                  <button 
                    type="button"
                    onClick={() => setBookingDate('besok')}
                    className={`flex-1 py-2 rounded text-xs font-bold transition-all ${
                      bookingDate === 'besok'
                        ? 'bg-[#26170c] dark:bg-[#faf3e0] text-white dark:text-[#26170c] shadow-sm'
                        : 'text-[#81756e] hover:text-[#26170c] dark:hover:text-[#faf3e0]'
                    }`}
                  >
                    Besok
                  </button>
                </div>
              </div>

              {/* Waktu Janji Temu */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#81756e] dark:text-[#faf3e0]/60 mb-2">
                  Waktu Janji Temu
                </label>
                <input 
                  type="time" 
                  value={time}
                  min={openTime}
                  max={closeTime}
                  onChange={(e) => {
                    setTime(e.target.value);
                    if (timeError) setTimeError('');
                  }}
                  className="w-full bg-[#FAF3E0]/70 dark:bg-[#3d2b1f]/50 border border-[#E5D3C5] dark:border-white/10 rounded-lg px-4 py-3 text-sm text-[#26170C] dark:text-[#faf3e0] focus:ring-1 focus:ring-[#26170C] dark:focus:ring-[#faf3e0] focus:outline-none"
                />
                {timeError && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {timeError}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PEMBAYARAN & TINJAUAN */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              {/* Opsi Pembayaran */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#81756e] dark:text-[#faf3e0]/60 mb-2">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'Cash', label: 'Cash', icon: 'payments' },
                    { value: 'QRIS', label: 'QRIS', icon: 'qr_code_scanner' },
                    { value: 'Transfer Bank', label: 'Transfer', icon: 'account_balance' }
                  ].map((method) => {
                    const isSelected = paymentMethod === method.value;
                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPaymentMethod(method.value)}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-bold transition-all ${
                          isSelected
                            ? 'border-[#26170C] dark:border-[#faf3e0] bg-[#26170C]/5 dark:bg-[#faf3e0]/5 text-[#26170C] dark:text-[#faf3e0]'
                            : 'border-[#d2c4bc]/30 dark:border-white/5 bg-[#FAF3E0]/30 dark:bg-[#2d303a] text-[#81756e]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg mb-1">{method.icon}</span>
                        <span>{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rincian Pemesanan Summary */}
              <div className="bg-[#FAF3E0]/50 dark:bg-black/10 border border-[#E5D3C5] dark:border-white/5 rounded-xl p-4 space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#81756e] dark:text-[#faf3e0]/60">Tinjauan Pemesanan</h4>
                <div className="divide-y divide-[#E5D3C5]/40 dark:divide-white/5 text-xs text-[#26170C] dark:text-[#faf3e0]">
                  <div className="py-2 flex justify-between">
                    <span className="text-[#81756e] dark:text-[#faf3e0]/60">Nama Pelanggan</span>
                    <span className="font-bold">{customerName}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-[#81756e] dark:text-[#faf3e0]/60">No. Telepon</span>
                    <span className="font-bold">{phone || '-'}</span>
                  </div>
                  <div className="py-2 flex justify-between items-start">
                    <span className="text-[#81756e] dark:text-[#faf3e0]/60 mr-4">Layanan ({selectedServices.length})</span>
                    <span className="font-bold text-right truncate max-w-[200px]" title={selectedServices.join(', ')}>
                      {selectedServices.join(', ')}
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-[#81756e] dark:text-[#faf3e0]/60">Barber</span>
                    <span className="font-bold">{barberName}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-[#81756e] dark:text-[#faf3e0]/60">Waktu &amp; Tanggal</span>
                    <span className="font-bold">
                      {bookingDate === 'hari_ini' ? 'Hari Ini' : 'Besok'} pukul {time}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between text-sm font-black text-[#26170C] dark:text-[#faf3e0] pt-3">
                    <span>TOTAL BAYAR</span>
                    <span>Rp {totalHarga.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conditional Button Navigation Logics */}
          <div className="pt-4 border-t border-[#26170c]/5 dark:border-white/5 flex space-x-3">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-[#EFE8D5] dark:bg-[#3d2b1f] hover:bg-[#e9e2d0] dark:hover:bg-[#4f3c30] text-[#26170C] dark:text-[#faf3e0] py-3.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
            >
              Batal
            </button>

            {/* Next / Submit Button */}
            {activeStep < 2 ? (
              <button
                type="submit"
                className="flex-1 bg-[#26170C] dark:bg-[#faf3e0] hover:bg-[#3d2514] dark:hover:bg-[#efe8d5] text-white dark:text-[#26170C] py-3.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] shadow-md"
              >
                Lanjut
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 bg-[#944925] hover:bg-[#773310] text-white py-3.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] shadow-md"
              >
                Pesan Sekarang
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
