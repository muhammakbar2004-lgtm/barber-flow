import React, { useState, useEffect } from 'react';
import { Clock, Edit2, Star, Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const initialReviews = [
  {
    id: 1,
    customerName: 'Dimas Prayoga',
    date: '2 Mei 2024',
    barberName: 'Rahardian',
    rating: 5,
    comment: 'Potongan mantap, fade-nya rapi banget. Asik diajak ngobrol!',
  },
  {
    id: 2,
    customerName: 'Michael Tan',
    date: '30 April 2024',
    barberName: 'Gunawan',
    rating: 4,
    comment: 'Cukuran cepet dan presisi. Mantap buat yang buru-buru.',
  },
  {
    id: 3,
    customerName: 'Kevin Sanjaya',
    date: '26 April 2024',
    barberName: 'Eko',
    rating: 5,
    comment: 'Hot towel-nya juara! Brewok jadi rapi dan wangi.',
  },
  {
    id: 4,
    customerName: 'Bpk. Adisatya',
    date: '22 April 2024',
    barberName: 'Rahardian',
    rating: 5,
    comment: 'Servis memuaskan seperti biasa, tempat juga nyaman.',
  },
  {
    id: 5,
    customerName: 'Rian Adi',
    date: '18 April 2024',
    barberName: 'Eko',
    rating: 4,
    comment: 'Gunting rambutnya teliti, pijatannya enak banget setelah cukur.',
  },
  {
    id: 6,
    customerName: 'Andre Wijaya',
    date: '15 April 2024',
    barberName: 'Gunawan',
    rating: 5,
    comment: 'Barber heritage langganan keluarga. Hasil pangkasan selalu konsisten.',
  },
  {
    id: 7,
    customerName: 'Budi Santoso',
    date: '12 April 2024',
    barberName: 'Rahardian',
    rating: 5,
    comment: 'Pelayanan kelas Master. Sangat merekomendasikan Rahardian!',
  },
  {
    id: 8,
    customerName: 'Farhan',
    date: '10 April 2024',
    barberName: 'Eko',
    rating: 4,
    comment: 'Sangat rapi potongannya. Pelayanan cepat dan tidak bertele-tele.',
  },
];

const generateDummyReviews = () => {
  const barbers = ['Rahardian', 'Gunawan', 'Eko'];
  const names = ['Budi', 'Andi', 'Reza', 'Fajar', 'Tomi', 'Hendra', 'Gilang', 'Dika'];
  const dummy = [];
  for (let i = 0; i < 30; i++) {
    const randomMonth = Math.floor(Math.random() * 2) + 3; // 3 (Maret) atau 4 (April)
    const randomDay = Math.floor(Math.random() * 28) + 1;
    const randomBarber = barbers[Math.floor(Math.random() * barbers.length)];
    const randomRating = Math.floor(Math.random() * 5) + 1; // 1 - 5

    dummy.push({
      id: `dummy-${i}`,
      customerName: `${names[Math.floor(Math.random() * names.length)]} (Dummy)`,
      date: `${randomDay} ${randomMonth === 3 ? 'Maret' : 'April'} 2024`,
      barberName: randomBarber,
      rating: randomRating,
      comment: 'Review otomatis dari sistem.'
    });
  }
  return dummy;
};

const allReviewsData = [...initialReviews, ...generateDummyReviews()];

const holidays = [
  '2024-01-01', // Tahun Baru
  '2024-02-08', // Isra Mikraj
  '2024-02-10', // Imlek
  '2024-03-11', // Nyepi
  '2024-03-29', // Wafat Isa Almasih
  '2024-04-10', '2024-04-11', // Idul Fitri
  '2024-05-01', // Hari Buruh
  '2024-05-09', // Kenaikan Isa Almasih
  '2024-05-23', // Waisak
  '2024-06-01', // Lahir Pancasila
  '2024-06-17', // Idul Adha
  '2024-07-07', // Tahun Baru Islam
  '2024-08-17', // Kemerdekaan RI
  '2024-09-16', // Maulid Nabi
  '2024-12-25'  // Natal
];

const generateAttendanceLog = () => {
  const log = { Rahardian: [], Gunawan: [], Eko: [] };
  const start = new Date('2024-03-01');
  const end = new Date('2024-05-03');
  
  // Use a fixed seed-like behavior or a deterministic loop to keep it consistent
  let dayCounter = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const isSunday = d.getDay() === 0;
    const isHoliday = holidays.includes(dateStr);
    
    if (!isSunday && !isHoliday) {
      // Deterministic attendance simulation to keep state stable across re-renders
      if ((dayCounter % 15) !== 3) log.Rahardian.push(dateStr);
      if ((dayCounter % 12) !== 5) log.Gunawan.push(dateStr);
      if ((dayCounter % 18) !== 7) log.Eko.push(dateStr);
      dayCounter++;
    }
  }
  return log;
};

const attendanceLog = generateAttendanceLog();

export default function DataBarber() {
  const [reviewsData] = useState(allReviewsData);

  const [reviewFilterBarber, setReviewFilterBarber] = useState('Semua');
  const [reviewFilterRating, setReviewFilterRating] = useState('Semua');

  const [startIndex, setStartIndex] = useState(0);

  const [selectedBarber, setSelectedBarber] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddBarberModal, setShowAddBarberModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('Excel');

  const [viewDate, setViewDate] = useState(new Date(2024, 2, 1)); // Mulai Maret 2024

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const handleOpenEdit = (barber) => { setSelectedBarber(barber); setShowEditModal(true); };
  const handleOpenHistory = (barber) => { setSelectedBarber(barber); setShowHistoryModal(true); };
  const handleCloseModal = () => { 
    setShowEditModal(false); 
    setShowHistoryModal(false); 
    setShowCalendarModal(false); 
    setSelectedBarber(null); 
    setViewDate(new Date(2024, 2, 1)); // Reset ke Maret 2024
  };

  const handleExport = () => {
    // Header CSV
    let csvContent = "Nama Kapster,Status,Komisi,Shift\n";

    // Loop data untuk mengisi baris
    barbersData.forEach(barber => {
      const nama = barber.nama || barber.name;
      const komisi = barber.commission || barber.komisi;
      csvContent += `${nama},${barber.status},${komisi},${barber.shift}\n`;
    });

    // Buat Blob dan trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Laporan_Kapster_Heritage.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadExport = () => {
    if (exportFormat === 'Excel') {
      handleExport();
    } else {
      let pdfContent = "=== LAPORAN KAPSTER HERITAGE GROOMING ===\n\n";
      barbersData.forEach(barber => {
        const nama = barber.nama || barber.name;
        const komisi = barber.commission || barber.komisi;
        pdfContent += `Nama: ${nama}\nStatus: ${barber.status}\nKomisi: ${komisi}%\nShift: ${barber.shift}\n-------------------------\n`;
      });
      const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "Laporan_Kapster_Heritage.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setShowExportModal(false);
  };

  const filteredReviews = reviewsData.filter(review => {
    const matchBarber = reviewFilterBarber === 'Semua' || review.barberName === reviewFilterBarber;
    const matchRating = reviewFilterRating === 'Semua' || review.rating.toString() === reviewFilterRating;
    return matchBarber && matchRating;
  });

  const visibleReviews = filteredReviews.slice(startIndex, startIndex + 4);

  useEffect(() => {
    setStartIndex(0);
  }, [reviewFilterBarber, reviewFilterRating]);

  const handleNext = () => {
    if (startIndex + 4 < filteredReviews.length) setStartIndex(startIndex + 4);
  };

  const handlePrev = () => {
    if (startIndex > 0) setStartIndex(startIndex - 4);
  };

  const [barbersData, setBarbersData] = useState([
    {
      id: 1,
      name: 'Rahardian',
      role: 'Master Barber • Senior',
      status: 'Active',
      efficiency: 98,
      commission: 15,
      shift: '09:00 - 17:30',
      initials: 'RH',
      colorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    },
    {
      id: 2,
      name: 'Gunawan',
      role: 'Heritage Haircut • Specialist',
      status: 'Break',
      efficiency: 85,
      commission: 14,
      shift: '09:00 - 17:30',
      initials: 'GW',
      colorClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300',
    },
    {
      id: 3,
      name: 'Eko',
      role: 'Beard Trim & Hot Towel • Junior',
      status: 'Active',
      efficiency: 92,
      commission: 12,
      shift: '09:00 - 17:30',
      initials: 'EK',
      colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
    },
  ]);

  const getBarberEfficiency = (barberName) => {
    // Asumsi kita melihat dashboard untuk bulan Mei (Bulan ke-5)
    const currentMonthReviews = reviewsData.filter(review => 
      review.barberName === barberName && review.date.includes('Mei')
    );

    let efficiency = 100; // Reset 100% di awal bulan

    currentMonthReviews.forEach(review => {
      if (review.rating === 5) efficiency -= 1;
      else if (review.rating === 4) efficiency -= 3;
      else if (review.rating === 3) efficiency -= 5;
      else if (review.rating === 2) efficiency -= 9; 
      else if (review.rating === 1) efficiency -= 11;
    });

    // Kembalikan nilai minimal 0 agar progress bar tidak error (minus)
    return Math.max(0, efficiency);
  };

  return (
    <main className="p-6 md:p-8 flex-1 bg-[#FFF9EC] dark:bg-[#26170c] transition-colors duration-200 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <div>
          <h2 className="text-4xl font-headline italic text-[#26170c] dark:text-[#faf3e0] leading-tight">
            Manajemen Maestro Kapster
          </h2>
          <p className="text-[#81756e] dark:text-[#faf3e0]/70 mt-2 max-w-xl text-sm leading-relaxed">
            Kelola para pengrajin rambut Heritage Grooming. Pantau performa, atur komisi, dan pastikan setiap kursi terisi oleh tangan terbaik.
          </p>
        </div>
        <div className="flex flex-col w-full gap-3 md:flex-row md:w-auto">
          <button 
            type="button"
            onClick={() => setShowExportModal(true)}
            className="w-full md:w-auto bg-[#26170C] dark:bg-[#faf3e0] text-white dark:text-[#26170C] px-4 py-2 rounded-lg font-semibold hover:bg-[#3d2514] dark:hover:bg-[#efe8d5] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Absensi</span>
          </button>
          <button 
            type="button"
            onClick={() => setShowAddBarberModal(true)}
            className="w-full md:w-auto bg-[#26170C] dark:bg-[#faf3e0] text-white dark:text-[#26170C] px-4 py-2 rounded-lg font-semibold hover:bg-[#3d2514] dark:hover:bg-[#efe8d5] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Barber</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="max-w-7xl mx-auto w-full mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Card 1: TOTAL KAPSTER */}
          <div className="bg-[#FAF3E0] dark:bg-[#26170C]/60 border border-[#E9E2D0] dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-w-0">
            <span className="text-[10px] md:text-xs font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-wider block truncate" title="TOTAL KAPSTER">
              TOTAL KAPSTER
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#26170c] dark:text-[#faf3e0]">3</h3>
              <span className="text-xs text-[#81756e] dark:text-[#faf3e0]/60 font-medium truncate">Tim Utama</span>
            </div>
          </div>

          {/* Card 2: AKTIF BERTUGAS */}
          <div className="bg-[#FAF3E0] dark:bg-[#26170C]/60 border border-[#E9E2D0] dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] md:text-xs font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-wider block truncate" title="AKTIF BERTUGAS">
                AKTIF BERTUGAS
              </span>
              <span className="text-[9px] font-bold text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950/40 px-2 py-0.5 rounded flex items-center space-x-1 animate-pulse flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400" />
                <span>LIVE</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#26170c] dark:text-[#faf3e0]">2</h3>
              <span className="text-xs text-[#81756e] dark:text-[#faf3e0]/60 font-medium truncate">Melayani</span>
            </div>
          </div>

          {/* Card 3: RATA-RATA RATING */}
          <div className="bg-[#FAF3E0] dark:bg-[#26170C]/60 border border-[#E9E2D0] dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-w-0">
            <span className="text-[10px] md:text-xs font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-wider block truncate" title="RATA-RATA RATING">
              RATA-RATA RATING
            </span>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#26170c] dark:text-[#faf3e0]">4.9</h3>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#26170C] text-[#26170C] dark:fill-[#faf3e0] dark:text-[#faf3e0]" />
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: TOTAL KOMISI (HARI INI) */}
          <div className="bg-[#FAF3E0] dark:bg-[#26170C]/60 border border-[#E9E2D0] dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-w-0">
            <span className="text-[10px] md:text-xs font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-wider block truncate" title="TOTAL KOMISI (HARI INI)">
              TOTAL KOMISI (HARI INI)
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-[#26170c] dark:text-[#faf3e0]">Rp 850K</h3>
              <span className="text-xs text-[#81756e] dark:text-[#faf3e0]/60 font-medium italic truncate">Estimasi</span>
            </div>
          </div>

          {/* Card 5: ABSENSI PEGAWAI */}
          <div className="bg-[#FAF3E0] dark:bg-[#26170C]/60 border border-[#E9E2D0] dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-w-0 col-span-2 md:col-span-1">
            <span className="text-[10px] md:text-xs font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-wider block truncate" title="ABSENSI PEGAWAI">
              ABSENSI PEGAWAI
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-[#26170c] dark:text-[#faf3e0] truncate">3/3 Hadir</h3>
              <span className="text-xs text-[#81756e] dark:text-[#faf3e0]/60 font-medium italic truncate">0 Alpa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white dark:bg-[#26170C]/40 border border-[#E9E2D0] dark:border-white/5 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E9E2D0] dark:border-white/10 text-[#81756e] dark:text-[#faf3e0]/60 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Kapster</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Performa</th>
                <th className="py-3 px-4">Komisi</th>
                <th className="py-3 px-4">Shift Terakhir</th>
                <th className="py-3 px-4">Absensi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26170c]/5 dark:divide-white/5 text-[#26170C] dark:text-[#faf3e0]">
              {barbersData.map((b) => {
                const dynamicEfficiency = getBarberEfficiency(b.name);
                return (
                  <tr key={b.id} className="hover:bg-[#faf3e0]/30 dark:hover:bg-[#26170c]/20 transition-colors">
                  {/* Kapster Info */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm select-none ${b.colorClass}`}>
                        {b.initials}
                      </div>
                      <div>
                        <span className="font-bold text-sm block">{b.name}</span>
                        <span className="text-[10px] text-[#81756e] dark:text-[#faf3e0]/60 font-medium block">
                          {b.role}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        b.status === 'Active' 
                          ? 'bg-[#26170C] dark:bg-[#ffb596]' 
                          : 'bg-[#944925] dark:bg-[#ff955c]'
                      }`} />
                      <span className="font-bold">{b.status}</span>
                    </div>
                  </td>

                  {/* Performa */}
                  <td className="py-4 px-4 min-w-[150px]">
                    <div className="flex flex-col space-y-1">
                      <span className="font-bold text-[10px] uppercase tracking-wider">
                        EFFICIENCY {dynamicEfficiency}%
                      </span>
                      {/* Container luar dengan border gelap */}
                      <div className="w-full max-w-[160px] h-2.5 bg-white dark:bg-transparent border border-[#26170C] dark:border-[#ffb596]/30 rounded-full mt-2 overflow-hidden flex p-[0.5px]">
                        {/* Isian bar dengan warna solid dan ujung membulat */}
                        <div 
                          className="h-full bg-[#26170C] dark:bg-[#ffb596] rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${dynamicEfficiency}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Komisi */}
                  <td className="py-4 px-4">
                    <span className="font-bold text-sm">{b.commission}%</span>
                    <span className="text-[10px] text-[#81756e] dark:text-[#faf3e0]/60 font-medium ml-1">
                      / Layan
                    </span>
                  </td>

                  {/* Shift */}
                  <td className="py-4 px-4 font-mono font-medium">{b.shift}</td>

                  {/* Absensi */}
                  <td className="py-4 px-4">
                    <span 
                      className="text-xs text-[#26170C] dark:text-[#ffb596] font-semibold cursor-pointer hover:underline" 
                      onClick={() => { setSelectedBarber(b); setShowCalendarModal(true); }}
                    >
                      Lihat Absensi
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2.5">
                      <button 
                        type="button"
                        onClick={() => handleOpenHistory(b)}
                        className="p-1.5 rounded-lg text-[#81756e] hover:text-[#26170C] dark:hover:text-[#faf3e0] hover:bg-[#efe8d5] dark:hover:bg-white/5 transition-colors"
                        title="Shift Schedule"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 rounded-lg text-[#81756e] hover:text-[#26170C] dark:hover:text-[#faf3e0] hover:bg-[#efe8d5] dark:hover:bg-white/5 transition-colors"
                        title="Edit Barber"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-[#E9E2D0] dark:border-white/10 gap-4">
          <span className="text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-wider">
            MENAMPILKAN 1-3 DARI 3 KAPSTER
          </span>
          <div className="flex items-center space-x-1">
            <button 
              type="button"
              disabled
              className="p-1.5 rounded-lg text-[#81756e]/50 dark:text-[#faf3e0]/30 cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold bg-[#26170C] dark:bg-[#faf3e0] text-white dark:text-[#26170C]"
            >
              1
            </button>
            <button 
              type="button"
              disabled
              className="p-1.5 rounded-lg text-[#81756e]/50 dark:text-[#faf3e0]/30 cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-headline italic text-[#26170c] dark:text-[#faf3e0]">
              Ulasan Pelanggan Terbaru
            </h3>
            <p className="text-xs text-[#81756e] dark:text-[#faf3e0]/60 mt-1">
              Menampilkan feedback 2 minggu terakhir
            </p>
          </div>

          <div className="flex gap-3">
            <select 
              className="bg-white dark:bg-[#3d2b1f] border border-[#E5D3C5] dark:border-white/10 text-[#26170C] dark:text-[#faf3e0] text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#26170C] cursor-pointer"
              value={reviewFilterBarber} 
              onChange={(e) => setReviewFilterBarber(e.target.value)}
            >
              <option value="Semua">Semua Kapster</option>
              <option value="Rahardian">Rahardian</option>
              <option value="Gunawan">Gunawan</option>
              <option value="Eko">Eko</option>
            </select>

            <select 
              className="bg-white dark:bg-[#3d2b1f] border border-[#E5D3C5] dark:border-white/10 text-[#26170C] dark:text-[#faf3e0] text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#26170C] cursor-pointer"
              value={reviewFilterRating} 
              onChange={(e) => setReviewFilterRating(e.target.value)}
            >
              <option value="Semua">Semua Bintang</option>
              <option value="5">Bintang 5</option>
              <option value="4">Bintang 4</option>
              <option value="3">Bintang 3</option>
              <option value="2">Bintang 2</option>
              <option value="1">Bintang 1</option>
            </select>
          </div>
        </div>

        <div className="relative group mt-6">
          {/* Left Navigation Arrow */}
          {startIndex > 0 && (
            <button 
              type="button"
              onClick={handlePrev} 
              className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-[#26170C] dark:bg-[#faf3e0] text-white dark:text-[#26170C] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl cursor-pointer hover:scale-105 active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Right Navigation Arrow */}
          {startIndex + 4 < filteredReviews.length && (
            <button 
              type="button"
              onClick={handleNext} 
              className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-[#26170C] dark:bg-[#faf3e0] text-white dark:text-[#26170C] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl cursor-pointer hover:scale-105 active:scale-95"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* 4 Column Grid of Reviews */}
          {filteredReviews.length === 0 ? (
            <div className="bg-[#FAF3E0] dark:bg-[#26170C]/60 border border-dashed border-[#E9E2D0] dark:border-white/10 rounded-xl p-8 text-center text-sm text-[#81756e] dark:text-[#faf3e0]/60 italic min-h-[150px] flex items-center justify-center">
              Tidak ada ulasan yang cocok dengan filter yang dipilih.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {visibleReviews.map((r) => (
                <div 
                  key={r.id} 
                  className="bg-white dark:bg-[#26170C]/40 border border-[#E9E2D0] dark:border-white/5 rounded-xl p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-[#26170C] dark:text-[#faf3e0]">
                          {r.customerName}
                        </h4>
                        <span className="text-[10px] text-[#81756e] dark:text-[#faf3e0]/60 font-medium block mt-0.5">
                          {r.date}
                        </span>
                      </div>
                    </div>

                    {/* Rating stars */}
                    <div className="flex gap-0.5 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${
                            i < r.rating 
                              ? 'fill-[#26170C] text-[#26170C] dark:fill-[#faf3e0] dark:text-[#faf3e0]' 
                              : 'text-gray-200 dark:text-gray-800'
                          }`} 
                        />
                      ))}
                    </div>

                    {/* Comment text */}
                    <span className="text-xs text-[#4f453f] dark:text-[#faf3e0]/70 italic mt-3.5 leading-relaxed block">
                      "{r.comment}"
                    </span>
                  </div>

                  {/* Barber Tag */}
                  <div className="mt-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#efe8d5]/60 dark:bg-white/5 text-[#26170C] dark:text-[#faf3e0]/80">
                      Kapster: {r.barberName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit (Form) */}
      {showEditModal && selectedBarber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#F9F6F0] dark:bg-[#26170c] w-full max-w-md p-6 rounded-xl shadow-2xl border border-[#E5D3C5] dark:border-white/10 text-[#26170c] dark:text-[#faf3e0]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-serif font-bold text-[#26170C] dark:text-[#faf3e0]">Edit Data Kapster</h3>
              <button 
                onClick={handleCloseModal} 
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#faf3e0]/80 mb-1">Nama Kapster</label>
                <input 
                  type="text" 
                  disabled 
                  value={selectedBarber.nama || selectedBarber.name} 
                  className="w-full bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2 text-gray-500 dark:text-gray-400 cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#faf3e0]/80 mb-1">Status</label>
                <select className="w-full bg-white dark:bg-[#3d2b1f] border border-[#E5D3C5] dark:border-white/10 rounded-lg px-3 py-2 text-[#26170C] dark:text-[#faf3e0] focus:outline-none focus:ring-1 focus:ring-[#26170C]">
                  <option>Active</option>
                  <option>Break</option>
                  <option>Off</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#faf3e0]/80 mb-1">Komisi (%)</label>
                <input 
                  type="number" 
                  defaultValue={parseInt(selectedBarber.commission || selectedBarber.komisi || 0)} 
                  className="w-full bg-white dark:bg-[#3d2b1f] border border-[#E5D3C5] dark:border-white/10 rounded-lg px-3 py-2 text-[#26170C] dark:text-[#faf3e0] focus:outline-none focus:ring-1 focus:ring-[#26170C]" 
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={handleCloseModal} 
                className="px-4 py-2 bg-white dark:bg-white/5 border border-[#E5D3C5] dark:border-white/10 text-gray-700 dark:text-[#faf3e0]/80 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10"
              >
                Batal
              </button>
              <button 
                onClick={handleCloseModal} 
                className="px-4 py-2 bg-[#26170C] dark:bg-[#faf3e0] text-white dark:text-[#26170C] rounded-lg hover:bg-[#3d2514] dark:hover:bg-[#efe8d5]"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Riwayat (History) */}
      {showHistoryModal && selectedBarber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#26170c] w-full max-w-md p-6 rounded-xl shadow-2xl border border-[#E5D3C5] dark:border-white/10 text-[#26170c] dark:text-[#faf3e0]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-serif font-bold text-[#26170C] dark:text-[#faf3e0]">Riwayat Shift Hari Ini</h3>
              <button 
                onClick={handleCloseModal} 
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="text-sm text-gray-600 dark:text-[#faf3e0]/70 mb-4">
              Menampilkan aktivitas: <span className="font-bold text-[#26170C] dark:text-[#faf3e0]">{selectedBarber.nama || selectedBarber.name}</span>
            </div>
            <div className="space-y-3 border-t border-gray-100 dark:border-white/10 pt-3 max-h-60 overflow-y-auto">
              <div className="flex justify-between items-center p-3 border border-gray-100 dark:border-white/5 rounded-lg bg-[#F9F6F0] dark:bg-[#26170C]/60">
                <div>
                  <p className="font-bold text-[#26170C] dark:text-[#faf3e0]">Bpk. Adisatya</p>
                  <p className="text-xs text-gray-500 dark:text-[#faf3e0]/60">Signature Cut & Wash</p>
                </div>
                <span className="text-xs font-semibold bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                  Selesai (09:45)
                </span>
              </div>
              <div className="flex justify-between items-center p-3 border border-gray-100 dark:border-white/5 rounded-lg bg-[#F9F6F0] dark:bg-[#26170C]/60">
                <div>
                  <p className="font-bold text-[#26170C] dark:text-[#faf3e0]">Dimas Prayoga</p>
                  <p className="text-xs text-gray-500 dark:text-[#faf3e0]/60">Signature Cut & Wash</p>
                </div>
                <span className="text-xs font-semibold bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                  Selesai (11:20)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Barber (Pop-up Form) */}
      {showAddBarberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#F9F6F0] dark:bg-[#26170c] w-full max-w-md p-6 rounded-xl shadow-2xl border border-[#E5D3C5] dark:border-white/10 text-[#26170c] dark:text-[#faf3e0]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-serif font-bold text-[#26170C] dark:text-[#faf3e0]">Tambah Maestro Baru</h3>
              <button 
                onClick={() => setShowAddBarberModal(false)} 
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#faf3e0]/80 mb-1">Nama Kapster</label>
                <input 
                  type="text" 
                  placeholder="Nama kapster..." 
                  className="w-full bg-white dark:bg-[#3d2b1f] border border-[#E5D3C5] dark:border-white/10 rounded-lg px-3 py-2 text-[#26170C] dark:text-[#faf3e0] placeholder-[#81756e] dark:placeholder-[#faf3e0]/40 focus:outline-none focus:ring-1 focus:ring-[#26170C]" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#faf3e0]/80 mb-1">Spesialisasi</label>
                <select className="w-full bg-white dark:bg-[#3d2b1f] border border-[#E5D3C5] dark:border-white/10 rounded-lg px-3 py-2 text-[#26170C] dark:text-[#faf3e0] focus:outline-none focus:ring-1 focus:ring-[#26170C]">
                  <option>Senior Barber</option>
                  <option>Haircut Specialist</option>
                  <option>Junior Barber</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#faf3e0]/80 mb-1">Shift Kerja</label>
                <select className="w-full bg-white dark:bg-[#3d2b1f] border border-[#E5D3C5] dark:border-white/10 rounded-lg px-3 py-2 text-[#26170C] dark:text-[#faf3e0] focus:outline-none focus:ring-1 focus:ring-[#26170C]">
                  <option>09:00 - 17:30</option>
                  <option>12:00 - 20:30</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddBarberModal(false)} 
                className="px-4 py-2 bg-white dark:bg-white/5 border border-[#E5D3C5] dark:border-white/10 text-gray-700 dark:text-[#faf3e0]/80 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10"
              >
                Batal
              </button>
              <button 
                onClick={() => setShowAddBarberModal(false)} 
                className="px-4 py-2 bg-[#26170C] dark:bg-[#faf3e0] text-white dark:text-[#26170C] rounded-lg hover:bg-[#3d2514] dark:hover:bg-[#efe8d5]"
              >
                Simpan Kapster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ekspor Laporan */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#26170c] w-full max-w-md p-6 rounded-xl shadow-2xl border border-[#E5D3C5] dark:border-white/10 text-[#26170c] dark:text-[#faf3e0]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-serif font-bold text-[#26170C] dark:text-[#faf3e0]">Ekspor Laporan Kapster</h3>
              <button 
                onClick={() => setShowExportModal(false)} 
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-[#faf3e0]/80 mb-1">Format File</label>
                <select 
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full bg-white dark:bg-[#3d2b1f] border border-[#E5D3C5] dark:border-white/10 rounded-lg px-3 py-2 text-[#26170C] dark:text-[#faf3e0] focus:outline-none focus:ring-1 focus:ring-[#26170C]"
                >
                  <option value="Excel">Excel (.csv)</option>
                  <option value="PDF">PDF (.pdf)</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 dark:text-[#faf3e0]/60 leading-relaxed">
                Laporan akan diekspor berdasarkan data kapster Heritage Grooming yang saat ini terdaftar pada sistem.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setShowExportModal(false)} 
                className="px-4 py-2 bg-white dark:bg-white/5 border border-[#E5D3C5] dark:border-white/10 text-gray-700 dark:text-[#faf3e0]/80 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10"
              >
                Batal
              </button>
              <button 
                onClick={handleDownloadExport} 
                className="px-4 py-2 bg-[#26170C] dark:bg-[#faf3e0] text-white dark:text-[#26170C] rounded-lg hover:bg-[#3d2514] dark:hover:bg-[#efe8d5] font-semibold"
              >
                DOWNLOAD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kalender Absensi */}
      {showCalendarModal && selectedBarber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#26170c] border border-gray-100 dark:border-white/10 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-scale-up">
            
            {/* Header Kalender */}
            <div className="bg-[#A4B624] text-white p-4 flex flex-col items-center relative">
              <button 
                onClick={handleCloseModal} 
                className="absolute right-3 top-3 text-white hover:text-red-200 text-2xl font-bold leading-none"
                title="Tutup"
              >
                &times;
              </button>
              <div className="flex justify-between items-center w-full px-4 mt-2">
                <button 
                  onClick={prevMonth} 
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white font-bold transition-colors active:scale-95"
                >
                  &lt;
                </button>
                <div className="text-center">
                  <h2 className="text-base font-bold font-serif uppercase tracking-wider">
                    {viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </h2>
                  <p className="text-[10px] text-white/90">Absensi: {selectedBarber.name || selectedBarber.nama}</p>
                </div>
                <button 
                  onClick={nextMonth} 
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white font-bold transition-colors active:scale-95"
                >
                  &gt;
                </button>
              </div>
            </div>
            
            {/* Header Hari */}
            <div className="grid grid-cols-7 text-center text-gray-500 dark:text-gray-400 font-bold p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/10">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="text-[10px] tracking-wider">{day}</div>
              ))}
            </div>
            
            {/* Grid Tanggal */}
            <div className="grid grid-cols-7 gap-1.5 p-4 bg-[#F9F6F0] dark:bg-black/20">
              {/* Offset kosong berdasarkan hari pertama bulan */}
              {(() => {
                const startDayOfWeek = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
                return Array.from({ length: startDayOfWeek }).map((_, idx) => (
                  <div key={`offset-${idx}`} />
                ));
              })()}
              
              {/* Render Hari-Hari dalam Bulan */}
              {(() => {
                const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
                const isAttendanceActive = (dateStr) => {
                  const target = new Date(dateStr);
                  const start = new Date('2024-03-01');
                  const end = new Date('2024-05-03');
                  return target >= start && target <= end;
                };

                return Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const currentYear = viewDate.getFullYear();
                  const currentMonth = (viewDate.getMonth() + 1).toString().padStart(2, '0');
                  const currentDay = day.toString().padStart(2, '0');
                  const dateStr = `${currentYear}-${currentMonth}-${currentDay}`;
                  
                  const isHoliday = holidays.includes(dateStr);
                  const isSunday = new Date(currentYear, viewDate.getMonth(), day).getDay() === 0;
                  const barberName = selectedBarber.name || selectedBarber.nama;
                  const hasAttended = attendanceLog[barberName]?.includes(dateStr);
                  const isActive = isAttendanceActive(dateStr);
                  
                  let cellClass = "bg-transparent border border-transparent";
                  let textClass = "text-[#26170C] dark:text-[#faf3e0] font-medium";
                  let titleStr = "Tidak Aktif";
                  
                  if (isHoliday || isSunday) {
                    textClass = "text-red-500 font-bold";
                    titleStr = isHoliday ? "Hari Libur Resmi" : "Hari Minggu";
                  }

                  if (isActive) {
                    if (isHoliday || isSunday) {
                      // Tetap merah
                    } else if (hasAttended) {
                      cellClass = "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30 font-bold";
                      titleStr = "Hadir Kerja";
                    } else {
                      // Active but not attended -> Absen
                      cellClass = "bg-red-50 dark:bg-red-950/10 text-red-900 dark:text-red-300/80 border border-red-100 dark:border-red-950/30";
                      titleStr = "Absen / Tidak Hadir";
                    }
                  } else {
                    // Out of range (inactive period)
                    if (!isHoliday && !isSunday) {
                      textClass = "text-gray-300 dark:text-gray-600";
                    }
                    titleStr = "Periode Absensi Tidak Aktif";
                  }
                  
                  return (
                    <div 
                      key={day} 
                      className={`p-2 text-center rounded-lg text-xs flex flex-col items-center justify-center transition-all ${textClass} ${cellClass}`}
                      title={titleStr}
                    >
                      {day}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Keterangan Warna */}
            <div className="p-4 border-t border-gray-100 dark:border-white/5 flex flex-wrap justify-center gap-3 text-[10px] text-gray-500 dark:text-gray-400 bg-white dark:bg-[#26170c]">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/30 rounded" />
                <span>Hadir</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-950/30 rounded" />
                <span>Absen</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-transparent text-red-500 font-bold flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded text-[8px]">M</span>
                <span>Minggu/Libur</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-transparent border border-gray-300 dark:border-gray-700 rounded text-gray-300 dark:text-gray-600 flex items-center justify-center text-[8px]">-</span>
                <span>Non-Aktif</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
