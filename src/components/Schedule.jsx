import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';

export default function Schedule({ 
  appointments = [], 
  selectedDate = 'Jumat, 3 Mei 2024', 
  viewMode = 'list', 
  selectedDay = 'hari_ini',
  onChangeDay,
  onEditAppointment,
  onDeleteAppointment,
  onOpenBookingModal,
  selectedBarber = 'Semua',
  onChangeBarber,
  setViewMode,
  openTime = '09:00',
  closeTime = '17:30'
}) {
  const [detailModalData, setDetailModalData] = useState(null);

  // Dynamic slots generator based on store hours
  const generateSlots = (open, close) => {
    const parseTime = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const formatTime = (min) => {
      const h = Math.floor(min / 60).toString().padStart(2, '0');
      const m = (min % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    const startMin = parseTime(open || '09:00');
    const endMin = parseTime(close || '17:30');
    
    const result = [];
    let current = startMin;
    const slotDuration = 90; // 1.5 hours
    
    while (current + slotDuration <= endMin) {
      const slotStart = current;
      const slotEnd = current + slotDuration;
      
      // Lunch break handling (12:00 - 13:00)
      if (slotStart < 12 * 60 && slotEnd > 12 * 60) {
        result.push({
          label: `${formatTime(slotStart)} - 12:00`,
          start: formatTime(slotStart),
          end: '12:00'
        });
        result.push({
          label: '12:00 - 13:00',
          start: '12:00',
          end: '13:00',
          isBreak: true
        });
        current = 13 * 60;
        continue;
      }
      
      result.push({
        label: `${formatTime(slotStart)} - ${formatTime(slotEnd)}`,
        start: formatTime(slotStart),
        end: formatTime(slotEnd)
      });
      
      current += slotDuration;
    }
    
    // Add closing indicator slot
    result.push({
      label: formatTime(endMin),
      start: formatTime(endMin),
      end: formatTime(endMin),
      isClosing: true
    });
    
    return result;
  };

  const slots = generateSlots(openTime, closeTime);

  const barbersList = selectedBarber === 'Semua' ? ['Rahardian', 'Gunawan', 'Eko'] : [selectedBarber];

  return (
    <div className="bg-[#faf3e0] dark:bg-[#26170C] rounded-xl overflow-hidden shadow-sm border border-[#26170c]/5 dark:border-white/5 transition-colors duration-200 animate-fade-in">
      
      {/* ======================================================== */}
      {/* 🖥️ DESKTOP HEADER & VIEW MODE (hidden on mobile) */}
      {/* ======================================================== */}
      <div className="hidden md:flex p-6 border-b border-[#d2c4bc]/20 dark:border-white/5 flex-wrap gap-4 justify-between items-center bg-[#FFF9EC] dark:bg-[#26170c] transition-colors duration-200">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onChangeDay && onChangeDay('hari_ini')}
            className="p-2 hover:bg-[#faf3e0] dark:hover:bg-[#26170C] rounded-full text-[#26170C] dark:text-[#faf3e0] transition-colors"
            title="Hari Sebelumnya"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h3 className="text-xl font-headline italic text-[#26170c] dark:text-[#faf3e0] min-w-[200px]">
            {selectedDate}
          </h3>
          <button 
            onClick={() => onChangeDay && onChangeDay('besok')}
            className="p-2 hover:bg-[#faf3e0] dark:hover:bg-[#26170C] rounded-full text-[#26170C] dark:text-[#faf3e0] transition-colors"
            title="Hari Berikutnya"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        
        {/* Segmented Control UI for Day Selection */}
        <div className="bg-[#efe8d5] dark:bg-[#26170C] p-1 flex rounded-full border border-[#d2c4bc]/20 dark:border-white/5 relative transition-all duration-300">
          <button 
            onClick={() => onChangeDay && onChangeDay('hari_ini')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ${
              selectedDay === 'hari_ini'
                ? 'bg-[#26170c] dark:bg-[#faf3e0] text-[#FFF9EC] dark:text-[#26170c] shadow-sm'
                : 'bg-transparent text-[#26170C] dark:text-[#faf3e0]/70 hover:text-[#26170c] dark:hover:text-white'
            }`}
          >
            Hari Ini
          </button>
          <button 
            onClick={() => onChangeDay && onChangeDay('besok')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ${
              selectedDay === 'besok'
                ? 'bg-[#26170c] dark:bg-[#faf3e0] text-[#FFF9EC] dark:text-[#26170c] shadow-sm'
                : 'bg-transparent text-[#26170C] dark:text-[#faf3e0]/70 hover:text-[#26170c] dark:hover:text-white'
            }`}
          >
            Besok
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 📱 MOBILE HEADER & FILTER (visible only on mobile) */}
      {/* ======================================================== */}
      <div className="p-4 border-b border-[#d2c4bc]/20 dark:border-white/5 bg-[#FFF9EC] dark:bg-[#26170c] space-y-4 md:hidden">


        {/* Filters Row */}
        <div className="flex gap-3 justify-between items-center text-xs">
          {/* Barber Picker */}
          <div className="relative flex-1">
            <select 
              value={selectedBarber}
              onChange={(e) => onChangeBarber && onChangeBarber(e.target.value)}
              className="w-full bg-[#efe8d5] dark:bg-[#3d2b1f] border border-[#d2c4bc]/40 dark:border-white/10 rounded-lg px-3 py-2 font-bold uppercase tracking-wider text-[#26170C] dark:text-[#faf3e0] focus:outline-none appearance-none text-center"
            >
              <option value="Semua">BARBER: SEMUA</option>
              <option value="Rahardian">BARBER: RAHARDIAN</option>
              <option value="Gunawan">BARBER: GUNAWAN</option>
              <option value="Eko">BARBER: EKO</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="relative flex-1">
            <select 
              value={selectedDay}
              onChange={(e) => onChangeDay && onChangeDay(e.target.value)}
              className="w-full bg-[#efe8d5] dark:bg-[#3d2b1f] border border-[#d2c4bc]/40 dark:border-white/10 rounded-lg px-3 py-2 font-bold uppercase tracking-wider text-[#26170C] dark:text-[#faf3e0] focus:outline-none appearance-none text-center"
            >
              <option value="hari_ini">Hari Ini 📅</option>
              <option value="besok">Besok 📅</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <div className="pt-1">
          <h4 className="text-lg font-headline italic font-bold text-[#26170c] dark:text-[#faf3e0] tracking-tight">
            Timeline Booking
          </h4>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🖥️ DESKTOP CONTENT (hidden on mobile) */}
      {/* ======================================================== */}
      <div className="hidden md:block">
        {viewMode === 'list' ? (
          /* Desktop List View */
          <div className="divide-y divide-[#d2c4bc]/20 dark:divide-white/5 bg-[#faf3e0] dark:bg-[#26170C] transition-colors duration-200">
            {appointments.length === 0 ? (
              <div className="p-8 text-center text-[#26170C]/70 dark:text-[#faf3e0]/70 text-sm">
                Tidak ada janji temu untuk tanggal ini atau filter terpilih.
              </div>
            ) : (
              appointments.map((apt, index) => {
                if (apt.isBreak) {
                  return (
                    <div key={apt.id} className="p-4 bg-[#faf3e0] dark:bg-[#26170C] flex justify-center items-center transition-colors duration-200">
                      <div className="h-px bg-[#d2c4bc]/30 dark:bg-white/10 flex-1"></div>
                      <span className="mx-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#26170C]/50 dark:text-[#faf3e0]/50">
                        {apt.breakLabel || 'Istirahat'}
                      </span>
                      <div className="h-px bg-[#d2c4bc]/30 dark:bg-white/10 flex-1"></div>
                    </div>
                  );
                }

                const isGrouped = appointments.filter(a => !a.isBreak && a.time === apt.time).length > 1;
                const nextApt = appointments[index + 1];
                const hasSameTimeAsNext = nextApt && !nextApt.isBreak && nextApt.time === apt.time;
                const borderClass = hasSameTimeAsNext ? '' : 'border-b border-[#d2c4bc]/10 dark:border-white/5';
                const bgClass = isGrouped 
                  ? 'bg-[#EAE1CA] dark:bg-[#3d2b1f]/40 hover:bg-[#e2d7b6] dark:hover:bg-[#3d2b1f]/60' 
                  : 'bg-[#FFF9EC] dark:bg-[#26170c] hover:bg-white dark:hover:bg-[#3d2b1f]/50';

                return (
                  <div 
                    key={apt.id} 
                    className={`p-6 grid grid-cols-12 items-center transition-colors group gap-4 md:gap-0 duration-200 ${bgClass} ${borderClass}`}
                  >
                    {/* Time Info */}
                    <div className="col-span-12 md:col-span-2">
                      <span className="text-lg font-headline italic text-[#26170c] dark:text-[#faf3e0]">
                        {apt.time}
                      </span>
                      <p className="text-[10px] uppercase font-bold text-[#26170C]/60 dark:text-[#faf3e0]/60 tracking-wider">
                        {apt.period}
                      </p>
                    </div>

                    {/* Customer Info */}
                    <div className="col-span-12 md:col-span-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#ffdbcd] dark:bg-[#3d2b1f] rounded-lg flex items-center justify-center text-[#944925] dark:text-[#ffb596] mr-3 font-bold">
                          {apt.customerName ? apt.customerName.charAt(0) : '?'}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#26170c] dark:text-[#faf3e0]">{apt.customerName}</h4>
                          <p className="text-xs text-[#944925] dark:text-[#ffb596] font-medium">{apt.phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Service Info */}
                    <div className="col-span-12 md:col-span-3">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className="text-xs text-[#26170C] dark:text-[#faf3e0] font-medium">
                          {apt.serviceName}
                        </span>
                        {apt.paymentMethod && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            apt.paymentMethod === 'Cash'
                              ? 'bg-[#81756e]/10 text-[#4f453f] dark:bg-white/10 dark:text-[#faf3e0]/70'
                              : apt.paymentMethod === 'QRIS'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                          }`}>
                            {apt.paymentMethod}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#26170C]/60 dark:text-[#faf3e0]/60 uppercase tracking-tighter block mt-0.5">
                        {apt.duration}
                      </span>
                    </div>

                    {/* Barber Info */}
                    <div className="col-span-9 md:col-span-2">
                      <div className="flex items-center">
                        <img 
                          src={apt.barberAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuALgYW6D-zh1ruvvw2PX4HQeP1F5rJXwbSV2WV-8tsaBVgb_do2kM2WkGuN-ccE_MkPZe0u8iSK-JdewUf07W-yBu_lWBtDN45DRDt5ldM-VtVQolmGcayqq-qkcwqVmD559hm3ABMhrSA2VfAh68ZkzgmXNhYiyKB-CBNP9BO0EwF7q2ohCMRGxBy-ISJXi_0nDLijxXql_iEhbZBWqAmQAiAewT4kh3gIDGlxi-UgjLuWd7zYQILN0mkC9za7TdKXQthc-jGBB7tJ"}
                          alt="Barber" 
                          className="w-6 h-6 rounded-full mr-2 grayscale group-hover:grayscale-0 transition-all object-cover"
                        />
                        <span className="text-xs text-[#26170C] dark:text-[#faf3e0]">{apt.barberName}</span>
                      </div>
                    </div>

                    {/* Edit & Delete Buttons */}
                    <div className="col-span-3 md:col-span-1 text-right flex items-center justify-end space-x-2">
                      {apt.status === 'completed' ? (
                        <button
                          onClick={() => setDetailModalData(apt)}
                          className="text-[#A48873] hover:text-[#26170C] dark:hover:text-[#faf3e0] cursor-pointer transition-colors p-1"
                          title="Rincian Transaksi"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      ) : (
                        apt.status !== 'serving' && (
                          <>
                            <button 
                              onClick={() => onEditAppointment && onEditAppointment(apt)}
                              className="material-symbols-outlined text-[#26170C]/60 dark:text-[#faf3e0]/60 hover:text-[#26170c] dark:hover:text-[#faf3e0] transition-colors"
                              title="Edit Janji Temu"
                            >
                              edit_note
                            </button>
                            <button 
                              onClick={() => onDeleteAppointment && onDeleteAppointment(apt.id)}
                              className="material-symbols-outlined text-[#ba1a1a] hover:text-[#93000a] transition-colors"
                              title="Hapus Janji Temu"
                            >
                              delete
                            </button>
                          </>
                        )
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Calendar View / CSS Grid Time-block Dynamic Scheduler */
          <div className="p-6 bg-[#faf3e0] dark:bg-[#26170C] transition-colors duration-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Header Columns */}
              <div className="hidden md:block bg-[#FFF9EC] dark:bg-[#26170c] p-4 rounded-lg border border-[#d2c4bc]/20 dark:border-white/5 text-center font-bold text-xs uppercase tracking-wider text-[#26170C] dark:text-[#faf3e0]">
                Waktu
              </div>
              <div className="bg-[#FFF9EC] dark:bg-[#26170c] p-4 rounded-lg border border-[#d2c4bc]/20 dark:border-white/5 text-center font-bold text-xs uppercase tracking-wider text-[#944925] dark:text-[#ffb596]">
                Rahardian
              </div>
              <div className="bg-[#FFF9EC] dark:bg-[#26170c] p-4 rounded-lg border border-[#d2c4bc]/20 dark:border-white/5 text-center font-bold text-xs uppercase tracking-wider text-[#944925] dark:text-[#ffb596]">
                Gunawan
              </div>
              <div className="bg-[#FFF9EC] dark:bg-[#26170c] p-4 rounded-lg border border-[#d2c4bc]/20 dark:border-white/5 text-center font-bold text-xs uppercase tracking-wider text-[#944925] dark:text-[#ffb596]">
                Eko
              </div>

              {/* Time Blocks Loop */}
              {slots.filter(s => !s.isBreak && !s.isClosing).map((slot) => {
                return (
                  <React.Fragment key={slot.label}>
                    {/* Time column */}
                    <div className="bg-[#FFF9EC] dark:bg-[#26170c] p-4 rounded-lg border border-[#d2c4bc]/20 dark:border-white/5 flex items-center justify-center font-mono font-bold text-xs text-[#26170C] dark:text-[#faf3e0]">
                      {slot.label}
                    </div>

                    {/* Barbers Columns */}
                    {['Rahardian', 'Gunawan', 'Eko'].map((barber) => {
                      const matches = appointments.filter(apt => {
                        if (apt.isBreak) return false;
                        if (apt.barberName !== barber) return false;
                        return apt.time >= slot.start && apt.time < slot.end;
                      });

                      if (matches.length > 0) {
                        return (
                          <div key={barber} className="space-y-2">
                            {matches.map((apt) => (
                              <div 
                                key={apt.id} 
                                className="bg-[#26170c] dark:bg-[#3d2b1f] text-white p-4 rounded-lg border border-[#26170c]/5 flex flex-col justify-between shadow-sm min-h-[80px] hover:border-[#944925]/50 transition-all"
                              >
                                <div>
                                  <span className="text-[9px] font-bold text-[#ac9181] uppercase tracking-wider">
                                    {apt.time} - {apt.customerName}
                                  </span>
                                  <p className="text-[10px] font-medium leading-tight mt-0.5">{apt.serviceName}</p>
                                </div>
                                <div className="flex items-center justify-between mt-3 border-t border-white/5 pt-2">
                                  {apt.paymentMethod ? (
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                      apt.paymentMethod === 'Cash'
                                        ? 'bg-[#ac9181]/25 text-white'
                                        : apt.paymentMethod === 'QRIS'
                                        ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-500/20'
                                        : 'bg-blue-900/50 text-blue-200 border border-blue-500/20'
                                    }`}>
                                      {apt.paymentMethod}
                                    </span>
                                  ) : (
                                    <span />
                                  )}
                                  {apt.status === 'completed' ? (
                                    <button 
                                      onClick={() => setDetailModalData(apt)}
                                      className="text-[#A48873] hover:text-white cursor-pointer transition-colors p-1"
                                      title="Rincian Transaksi"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    apt.status !== 'serving' && (
                                      <button 
                                        onClick={() => onEditAppointment && onEditAppointment(apt)}
                                        className="material-symbols-outlined text-white/50 hover:text-white transition-colors text-xs"
                                        title="Edit Janji Temu"
                                      >
                                        edit_note
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      return (
                        <div 
                          key={barber} 
                          className="bg-[#efe8d5] dark:bg-[#26170C] p-4 rounded-lg border border-dashed border-[#d2c4bc]/40 dark:border-white/10 flex items-center justify-center text-xs text-[#26170C]/40 dark:text-[#faf3e0]/40 min-h-[80px]"
                        >
                          Kosong
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 📱 MOBILE VERTICAL TIMELINE AGENDA VIEW (hidden on desktop) */}
      {/* ======================================================== */}
      <div className="md:hidden max-h-[65vh] overflow-y-auto pb-32 bg-[#faf3e0] dark:bg-[#26170C] p-4 relative scrollbar-thin">
        {/* Continuous vertical timeline line */}
        <div className="absolute left-[5.5rem] -translate-x-1/2 top-0 bottom-0 w-0.5 bg-[#d2c4bc]/40 dark:bg-white/10" />

        {/* Time Slots */}
        <div className="space-y-6">
          {slots.map((slot) => {
            // Find dot color and cards for this slot
            let nodeColorClass = 'bg-orange-500'; // default color for Tersedia
            
            if (slot.isBreak || slot.isClosing) {
              nodeColorClass = 'bg-gray-400 dark:bg-gray-600';
            } else {
              const hasServing = barbersList.some(barber => {
                const apt = appointments.find(a => !a.isBreak && a.barberName === barber && a.time >= slot.start && a.time < slot.end);
                return apt && apt.status === 'serving';
              });
              const hasBooking = barbersList.some(barber => {
                const apt = appointments.find(a => !a.isBreak && a.barberName === barber && a.time >= slot.start && a.time < slot.end);
                return apt;
              });

              if (hasServing) {
                nodeColorClass = 'bg-[#944925]';
              } else if (hasBooking) {
                nodeColorClass = 'bg-[#A48873]';
              }
            }

            return (
              <div key={slot.label} className="flex items-stretch relative">
                
                {/* Left Column: Time */}
                <div className="w-16 flex-shrink-0 flex flex-col items-center justify-start pt-3">
                  <span className="text-base font-headline italic font-bold text-[#26170c] dark:text-[#faf3e0]">
                    {slot.start}
                  </span>
                  <span className="text-[9px] text-[#81756e] dark:text-[#faf3e0]/50 font-bold uppercase tracking-wider">
                    {slot.start >= '12:00' ? 'PM' : 'AM'}
                  </span>
                </div>

                {/* Timeline dot (Node) */}
                <div className="absolute left-[5.5rem] -translate-x-1/2 top-5 z-10 flex items-center justify-center">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 border-[#FAF3E0] dark:border-[#26170C] ${nodeColorClass} shadow-sm`} />
                </div>

                {/* Right Column: Cards */}
                <div className="flex-1 pl-8 space-y-3">
                  {slot.isBreak ? (
                    /* Break Card */
                    <div className="border-dashed border-2 border-[#d2c4bc]/60 dark:border-white/10 rounded-xl p-4 flex justify-between items-center text-gray-500 dark:text-gray-400 bg-transparent">
                      <span className="italic font-medium text-xs">Istirahat Siang</span>
                      <span className="material-symbols-outlined text-sm">restaurant</span>
                    </div>
                  ) : slot.isClosing ? (
                    /* Closing Card */
                    <div className="border-dashed border-2 border-[#d2c4bc]/60 dark:border-white/10 rounded-xl p-4 flex justify-between items-center text-gray-500 dark:text-gray-400 bg-transparent">
                      <span className="italic font-medium text-xs">Selesai Operasional / Tutup Toko</span>
                      <span className="material-symbols-outlined text-sm">lock</span>
                    </div>
                  ) : (
                    /* Loop over list of barbers to show booked/available slots */
                    barbersList.map((barber) => {
                      const apt = appointments.find(a => !a.isBreak && a.barberName === barber && a.time >= slot.start && a.time < slot.end);

                      if (apt) {
                        const isServing = apt.status === 'serving';
                        if (isServing) {
                          /* Active / Serving Card - Dark Coklat */
                          return (
                            <div key={apt.id} className="bg-[#3b2a22] text-white rounded-xl p-4 shadow-md relative">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-bold text-sm leading-snug">{apt.customerName}</h5>
                                  <p className="text-[10px] text-white/80 mt-1">{apt.serviceName}</p>
                                </div>
                                <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                                  {apt.duration}
                                </span>
                              </div>

                              <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                                <div className="flex items-center">
                                  <img 
                                    src={apt.barberAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuALgYW6D-zh1ruvvw2PX4HQeP1F5rJXwbSV2WV-8tsaBVgb_do2kM2WkGuN-ccE_MkPZe0u8iSK-JdewUf07W-yBu_lWBtDN45DRDt5ldM-VtVQolmGcayqq-qkcwqVmD559hm3ABMhrSA2VfAh68ZkzgmXNhYiyKB-CBNP9BO0EwF7q2ohCMRGxBy-ISJXi_0nDLijxXql_iEhbZBWqAmQAiAewT4kh3gIDGlxi-UgjLuWd7zYQILN0mkC9za7TdKXQthc-jGBB7tJ"} 
                                    alt={apt.barberName} 
                                    className="w-5 h-5 rounded-full mr-2 object-cover"
                                  />
                                  <span className="text-[10px] font-semibold">{apt.barberName}</span>
                                </div>
                                <span className="text-[9px] font-bold text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  Aktif
                                </span>
                              </div>
                            </div>
                          );
                        } else {
                          /* Upcoming / Akan Datang Card - Krem Terang */
                          return (
                            <div key={apt.id} className="bg-[#f4ebd8] dark:bg-[#3d2b1f]/60 text-[#26170c] dark:text-[#faf3e0] border border-[#e5d3c5] dark:border-white/5 rounded-xl p-4 shadow-sm relative">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-bold text-sm leading-snug">{apt.customerName}</h5>
                                  <p className="text-[10px] text-[#26170c]/80 dark:text-[#faf3e0]/80 mt-1">{apt.serviceName}</p>
                                </div>
                                <span className="text-[9px] bg-[#26170c]/10 dark:bg-white/10 text-[#26170c] dark:text-[#faf3e0] px-2 py-0.5 rounded-full font-bold">
                                  {apt.duration}
                                </span>
                              </div>

                              <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#e5d3c5]/50 dark:border-white/10">
                                <div className="flex items-center">
                                  <img 
                                    src={apt.barberAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuALgYW6D-zh1ruvvw2PX4HQeP1F5rJXwbSV2WV-8tsaBVgb_do2kM2WkGuN-ccE_MkPZe0u8iSK-JdewUf07W-yBu_lWBtDN45DRDt5ldM-VtVQolmGcayqq-qkcwqVmD559hm3ABMhrSA2VfAh68ZkzgmXNhYiyKB-CBNP9BO0EwF7q2ohCMRGxBy-ISJXi_0nDLijxXql_iEhbZBWqAmQAiAewT4kh3gIDGlxi-UgjLuWd7zYQILN0mkC9za7TdKXQthc-jGBB7tJ"} 
                                    alt={apt.barberName} 
                                    className="w-5 h-5 rounded-full mr-2 object-cover"
                                  />
                                  <span className="text-[10px] font-semibold">{apt.barberName}</span>
                                </div>

                                <div className="flex items-center space-x-1.5">
                                  {apt.status === 'completed' ? (
                                    <button 
                                      onClick={() => setDetailModalData(apt)}
                                      className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors text-[#26170c] dark:text-[#faf3e0]"
                                      title="Detail"
                                    >
                                      <span className="material-symbols-outlined text-sm block">info</span>
                                    </button>
                                  ) : (
                                    <>
                                      <button 
                                        onClick={() => onEditAppointment && onEditAppointment(apt)}
                                        className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors text-[#26170c] dark:text-[#faf3e0]"
                                        title="Ubah"
                                      >
                                        <span className="material-symbols-outlined text-sm block">edit</span>
                                      </button>
                                      <button 
                                        onClick={() => onDeleteAppointment && onDeleteAppointment(apt.id)}
                                        className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors text-[#ba1a1a]"
                                        title="Hapus"
                                      >
                                        <span className="material-symbols-outlined text-sm block">delete</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                      }

                      /* Available / Tersedia Card */
                      return (
                        <button 
                          key={barber}
                          type="button"
                          onClick={() => onOpenBookingModal && onOpenBookingModal()}
                          className="w-full bg-[#FAF6EE]/60 hover:bg-[#FAF3E0] dark:bg-[#26170C]/30 dark:hover:bg-[#26170C]/60 border border-[#e5d3c5] dark:border-white/10 rounded-xl p-4 flex justify-between items-center transition-colors text-left"
                        >
                          <span className="font-extrabold text-[10px] tracking-wider text-[#944925] dark:text-[#ffb596] uppercase">
                            TERSEDIA {selectedBarber === 'Semua' ? `(${barber})` : ''}
                          </span>
                          <span className="material-symbols-outlined text-sm text-[#944925] dark:text-[#ffb596]">add_circle</span>
                        </button>
                      );
                    })
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🖥️ DESKTOP FOOTER / Print controls (hidden on mobile) */}
      {/* ======================================================== */}
      <div className="hidden md:flex p-6 bg-[#e9e2d0] dark:bg-[#26170c] justify-between items-center transition-colors duration-200">
        <p className="text-xs text-[#26170C]/80 dark:text-[#faf3e0]/80 font-medium">
          {viewMode === 'list' 
            ? `Menampilkan ${appointments.filter(a => !a.isBreak).length} janji temu`
            : 'Menampilkan tampilan grid kalender'}
        </p>
        <div className="flex space-x-2">
          <button className="bg-[#FFF9EC] dark:bg-[#26170C] p-2 rounded-md border border-[#d2c4bc]/20 dark:border-white/5 hover:bg-[#faf3e0] dark:hover:bg-[#3d2b1f] text-[#26170C] dark:text-[#faf3e0] transition-colors">
            <span className="material-symbols-outlined text-sm">print</span>
          </button>
          <button className="bg-[#FFF9EC] dark:bg-[#26170C] p-2 rounded-md border border-[#d2c4bc]/20 dark:border-white/5 hover:bg-[#faf3e0] dark:hover:bg-[#3d2b1f] text-[#26170C] dark:text-[#faf3e0] transition-colors">
            <span className="material-symbols-outlined text-sm">share</span>
          </button>
        </div>
      </div>

      {/* Detail Modal (Shared for all views) */}
      {detailModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFF9EC] dark:bg-[#26170C] border border-[#26170c]/10 dark:border-white/5 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            {/* Header */}
            <div className="p-6 border-b border-[#26170c]/5 flex justify-between items-center bg-[#faf3e0] dark:bg-[#2d303a]/50">
              <h3 className="text-xl font-headline italic text-[#26170c] dark:text-[#faf3e0]">
                Rincian Transaksi
              </h3>
              <button 
                onClick={() => setDetailModalData(null)}
                className="p-1 text-[#81756e] hover:text-[#26170c] dark:hover:text-[#faf3e0] rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-sm text-[#26170C] dark:text-[#faf3e0]">
              {/* Status Badge */}
              <div className="flex justify-between items-center border-b border-[#26170c]/5 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#81756e] dark:text-[#9ca3af]/80">
                  Status Layanan
                </span>
                <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-emerald-200/50">
                  SELESAI
                </span>
              </div>

              {/* Detail fields */}
              <div className="space-y-3">
                <div className="flex justify-between py-1">
                  <span className="text-[#81756e] dark:text-[#9ca3af]/80 font-medium">Nama Pelanggan:</span>
                  <span className="font-bold">{detailModalData.customerName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#81756e] dark:text-[#9ca3af]/80 font-medium">Barber Preferensi:</span>
                  <span className="font-bold">{detailModalData.barberName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#81756e] dark:text-[#9ca3af]/80 font-medium">Layanan:</span>
                  <span className="font-bold">{detailModalData.serviceName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#81756e] dark:text-[#9ca3af]/80 font-medium">Waktu Sesi:</span>
                  <span className="font-bold font-mono">{detailModalData.time} ({detailModalData.period})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#81756e] dark:text-[#9ca3af]/80 font-medium">Metode Pembayaran:</span>
                  <span className="font-bold">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      detailModalData.paymentMethod === 'Cash'
                        ? 'bg-[#81756e]/10 text-[#4f453f] dark:bg-white/10 dark:text-[#faf3e0]/70'
                        : detailModalData.paymentMethod === 'QRIS'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 text-emerald-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                    }`}>
                      {detailModalData.paymentMethod || 'Cash'}
                    </span>
                  </span>
                </div>
                {['QRIS', 'Transfer Bank'].includes(detailModalData.paymentMethod) && (
                  <>
                    <div className="flex justify-between py-1 items-center">
                      <span className="text-[#81756e] dark:text-[#9ca3af]/80 font-medium">Status Saldo:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/20">
                        VERIFIED
                      </span>
                    </div>
                    <div className="flex justify-between py-1 items-center">
                      <span className="text-[#81756e] dark:text-[#9ca3af]/80 font-medium">No. Referensi:</span>
                      <span className="font-bold font-mono text-xs">
                        {detailModalData.paymentMethod === 'QRIS' ? 'QRS' : 'TRF'}-
                        {Math.abs(detailModalData.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 12345) % 900000 + 100000}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#26170c]/5 bg-[#faf3e0] dark:bg-[#2d303a]/30 flex">
              <button
                type="button"
                onClick={() => setDetailModalData(null)}
                className="w-full bg-[#26170c] dark:bg-[#faf3e0] hover:bg-[#3d2b1f] dark:hover:bg-[#efe8d5] text-white dark:text-[#26170c] py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors active:scale-95 transform shadow-md"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
