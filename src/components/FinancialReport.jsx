import React, { useState, useMemo } from 'react';
import { servicesData } from '../data/servicesData';
import { 
  TrendingUp, 
  CreditCard, 
  Coins, 
  Calendar, 
  ArrowUpRight, 
  DollarSign, 
  FileText, 
  BarChart2 
} from 'lucide-react';

// Deterministic transaction list generator (March 1, 2024 to May 3, 2024)
const generateTransactions = () => {
  const txs = [];
  const services = [
    { name: 'Signature Cut', price: 75000, category: 'CUKUR' },
    { name: 'Royal Hot Towel Shave', price: 60000, category: 'PERAWATAN' },
    { name: 'The Heritage Ritual', price: 150000, category: 'PAKET' },
    { name: 'Beard Sculpting', price: 45000, category: 'PERAWATAN' },
    { name: 'Hair Detox & Wash', price: 40000, category: 'PERAWATAN' }
  ];
  const methods = ['Cash', 'QRIS', 'Transfer Bank'];
  const customerNames = [
    'Budi Santoso', 'Arya Wiguna', 'Dimas Prayoga', 'Kevin Sanjaya', 'Michael Tan',
    'Rian Wijaya', 'Dian Nugraha', 'Ferry Salim', 'Hendra Wijaya', 'Ahmad Fauzi',
    'Taufik Hidayat', 'Rudi Hermawan', 'Aditya Pratama', 'Eko Prasetyo', 'Gunawan Wibowo'
  ];

  const startDate = new Date('2024-03-01');
  const endDate = new Date('2024-05-03');
  
  let idCounter = 1;
  // Loop daily
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    
    // Sunday is off/closed, Saturday is very busy (10 transactions), weekdays have 4-6
    let numTxs = 5;
    if (dayOfWeek === 0) numTxs = 0;
    else if (dayOfWeek === 6) numTxs = 10;
    else if (dayOfWeek === 5) numTxs = 7; // Friday is moderately busy

    for (let i = 0; i < numTxs; i++) {
      // Deterministic generation
      const serviceIdx = (idCounter * 17) % services.length;
      const methodIdx = (idCounter * 11) % methods.length;
      const nameIdx = (idCounter * 13) % customerNames.length;
      const service = services[serviceIdx];
      
      txs.push({
        id: `tx-${idCounter}`,
        date: dateStr,
        customerName: customerNames[nameIdx],
        serviceName: service.name,
        price: service.price,
        category: service.category,
        paymentMethod: methods[methodIdx],
        time: `${String(9 + (idCounter % 8)).padStart(2, '0')}:${String((idCounter * 12) % 60).padStart(2, '0')}`
      });
      idCounter++;
    }
  }
  return txs;
};

const allTransactions = generateTransactions();

export default function FinancialReport() {
  const [timeRange, setTimeRange] = useState('weekly'); // 'daily' | 'weekly' | 'monthly'

  // Format number to Rupiah format
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  // Perform dynamic financial calculations
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let cashRevenue = 0;
    let digitalRevenue = 0;
    let totalSessions = allTransactions.length;

    // Grouping for service table dynamics
    const serviceGroups = {};
    
    allTransactions.forEach((tx) => {
      totalRevenue += tx.price;
      if (tx.paymentMethod === 'Cash') {
        cashRevenue += tx.price;
      } else {
        digitalRevenue += tx.price;
      }

      // Group sessions count & income per service
      if (!serviceGroups[tx.serviceName]) {
        serviceGroups[tx.serviceName] = { sessions: 0, revenue: 0 };
      }
      serviceGroups[tx.serviceName].sessions += 1;
      serviceGroups[tx.serviceName].revenue += tx.price;
    });

    // Recent 5 transactions (last items in array)
    const recentTransactions = [...allTransactions]
      .slice(-5)
      .reverse();

    // Map service list dynamically from servicesData master
    const dynamicServiceStats = servicesData.map((s) => {
      const groupedData = serviceGroups[s.name] || { sessions: 0, revenue: 0 };
      return {
        id: s.id,
        name: s.name,
        category: s.category,
        price: s.price,
        sessions: groupedData.sessions,
        revenue: groupedData.revenue,
        contribution: totalRevenue > 0 ? (groupedData.revenue / totalRevenue) * 100 : 0
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      cashRevenue,
      digitalRevenue,
      totalSessions,
      recentTransactions,
      serviceStats: dynamicServiceStats
    };
  }, []);

  // SVG Chart points generator based on timeRange
  const chartData = useMemo(() => {
    // Generate data aggregates
    if (timeRange === 'daily') {
      // Last 7 days in transactions list
      const days = ['27 Apr', '28 Apr', '29 Apr', '30 Apr', '01 Mei', '02 Mei', '03 Mei'];
      const values = [550000, 0, 480000, 520000, 610000, 480000, 640000];
      return { labels: days, values };
    } else if (timeRange === 'monthly') {
      // March, April, May (up to 3rd)
      const months = ['Maret 2024', 'April 2024', 'Mei 2024 (Awal)'];
      const values = [11850000, 11450000, 1730000];
      return { labels: months, values };
    } else {
      // Weekly (Default) - 5 Weeks
      const weeks = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4', 'Minggu 5'];
      const values = [2650000, 3100000, 2800000, 3450000, 3200000];
      return { labels: weeks, values };
    }
  }, [timeRange]);

  // Max value in chart for scale
  const maxChartValue = Math.max(...chartData.values, 1);

  // Percent breakdowns
  const cashPercent = stats.totalRevenue > 0 ? (stats.cashRevenue / stats.totalRevenue) * 100 : 0;
  const digitalPercent = stats.totalRevenue > 0 ? (stats.digitalRevenue / stats.totalRevenue) * 100 : 0;

  // SVG Chart points generator based on timeRange (zoomed-in Y-axis scaling)
  const chartPoints = useMemo(() => {
    const labels = chartData.labels;
    const values = chartData.values;
    const N = values.length;
    if (N === 0) return { points: [], gridLines: [], areaPath: '', linePath: '', leftMargin: 90, rightMargin: 30, topMargin: 30, bottomMargin: 50 };

    const leftMargin = 110;
    const rightMargin = 40;
    const topMargin = 30;
    const bottomMargin = 55;

    const plotWidth = 600 - leftMargin - rightMargin;
    const plotHeight = 350 - topMargin - bottomMargin;

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;
    
    // Zoomed-in domain calculations (auto-adjusts domain to data, adding 5% margin at the top)
    const yMin = Math.max(0, minValue - (range === 0 ? minValue * 0.05 : range * 0.02));
    const yMax = maxValue + (range === 0 ? maxValue * 0.05 : range * 0.05);
    const yRange = yMax - yMin;

    const points = values.map((val, idx) => {
      const x = leftMargin + (N > 1 ? idx * (plotWidth / (N - 1)) : plotWidth / 2);
      const y = topMargin + plotHeight - (yRange > 0 ? ((val - yMin) / yRange) * plotHeight : plotHeight / 2);
      return { x, y, val, label: labels[idx] };
    });

    const gridLines = [];
    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const val = yMin + (i * yRange) / gridSteps;
      const y = topMargin + plotHeight - (i * plotHeight) / gridSteps;
      gridLines.push({ y, val });
    }

    let areaPath = '';
    let linePath = '';
    if (points.length > 0) {
      const yBottom = topMargin + plotHeight;
      linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      areaPath = `M ${points[0].x} ${yBottom} L ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${points[points.length - 1].x} ${yBottom} Z`;
    }

    return { points, gridLines, areaPath, linePath, leftMargin, rightMargin, topMargin, bottomMargin, yMin, yMax };
  }, [chartData]);

  return (
    <main className="p-6 md:p-8 flex-1 bg-[#FFF9EC] dark:bg-[#26170c] transition-colors duration-200 animate-fade-in text-[#26170C] dark:text-[#faf3e0]">
      {/* Header Halaman */}
      <div className="mb-8">
        <h2 className="text-4xl font-headline italic text-[#26170C] dark:text-[#faf3e0] leading-tight font-bold">
          Laporan Keuangan
        </h2>
        <p className="text-[#26170C]/70 dark:text-[#faf3e0]/70 mt-2 max-w-xl text-sm">
          Ringkasan analitik dan rincian performa transaksi bisnis Heritage Grooming (1 Maret 2024 s/d 3 Mei 2024).
        </p>
      </div>

      {/* 3 Header Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Pendapatan Card */}
        <div className="bg-[#FAF6EE] dark:bg-[#26170C]/40 border border-[#E5D3C5] dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#26170C] dark:bg-[#faf3e0]" />
          <div className="pl-3">
            <span className="text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#26170C] dark:text-[#faf3e0]" />
              TOTAL PENDAPATAN (AKUMULASI)
            </span>
            <h3 className="text-3xl font-extrabold text-[#26170C] dark:text-[#faf3e0] mt-3">
              {formatRupiah(stats.totalRevenue)}
            </h3>
            <p className="text-xs text-[#81756e] dark:text-[#faf3e0]/50 mt-2">
              Berdasarkan total {stats.totalSessions} sesi terlayani
            </p>
          </div>
        </div>

        {/* Pendapatan Digital Card */}
        <div className="bg-[#FAF6EE] dark:bg-[#26170C]/40 border border-[#E5D3C5] dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#944925]" />
          <div className="pl-3">
            <span className="text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#944925]" />
              PENDAPATAN DIGITAL (QRIS/TRANSFER)
            </span>
            <h3 className="text-3xl font-extrabold text-[#26170C] dark:text-[#faf3e0] mt-3">
              {formatRupiah(stats.digitalRevenue)}
            </h3>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 mb-1">
                <span>KONTRIBUSI</span>
                <span>{digitalPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[#E5D3C5]/40 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#944925] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${digitalPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pendapatan Tunai Card */}
        <div className="bg-[#FAF6EE] dark:bg-[#26170C]/40 border border-[#E5D3C5] dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-600" />
          <div className="pl-3">
            <span className="text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              PENDAPATAN TUNAI (CASH)
            </span>
            <h3 className="text-3xl font-extrabold text-[#26170C] dark:text-[#faf3e0] mt-3">
              {formatRupiah(stats.cashRevenue)}
            </h3>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 mb-1">
                <span>KONTRIBUSI</span>
                <span>{cashPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[#E5D3C5]/40 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${cashPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Chart (Left) & Recent Transactions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Chart Card */}
        <div className="lg:col-span-8 bg-[#FAF6EE] dark:bg-[#26170C]/40 border border-[#E5D3C5] dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-headline italic font-bold text-[#26170C] dark:text-[#faf3e0] flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#26170C] dark:text-[#faf3e0]" />
                Tren Pendapatan Bisnis
              </h3>
              <p className="text-xs text-[#81756e] dark:text-[#faf3e0]/60 mt-0.5">
                Visualisasi fluktuasi omset penjualan jasa
              </p>
            </div>

            {/* Time Toggle Control */}
            <div className="bg-[#efe8d5]/60 dark:bg-[#26170C]/60 p-1 flex rounded-lg border border-[#d2c4bc]/20 dark:border-white/5 self-start sm:self-auto">
              {[
                { key: 'daily', label: 'Harian' },
                { key: 'weekly', label: 'Mingguan' },
                { key: 'monthly', label: 'Bulanan' }
              ].map((range) => (
                <button
                  key={range.key}
                  type="button"
                  onClick={() => setTimeRange(range.key)}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                    timeRange === range.key
                      ? 'bg-[#26170c] dark:bg-[#faf3e0] text-white dark:text-[#26170c] shadow-sm'
                      : 'text-[#81756e] dark:text-[#faf3e0]/60 hover:bg-[#efe8d5] dark:hover:bg-[#26170c]'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line / Area Chart Graphic ( Majestic Taller Container ) */}
          <div className="h-[420px] w-full relative bg-transparent px-2">
            <svg viewBox="0 0 600 350" className="w-full h-full" preserveAspectRatio="none">
              {/* Gradients */}
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#944925" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#944925" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines & Y-Axis Labels */}
              {chartPoints.gridLines.map((line, idx) => (
                <g key={idx}>
                  {/* Grid line */}
                  <line 
                    x1={chartPoints.leftMargin} 
                    y1={line.y} 
                    x2={600 - chartPoints.rightMargin} 
                    y2={line.y} 
                    stroke="#E5D3C5" 
                    strokeWidth="1" 
                    strokeDasharray="4 4" 
                    className="opacity-40 dark:opacity-20"
                  />
                  {/* Y-Axis Label */}
                  <text 
                    x={chartPoints.leftMargin - 15} 
                    y={line.y + 4} 
                    textAnchor="end" 
                    className="text-[9px] font-mono font-bold fill-[#81756e] dark:fill-[#faf3e0]/60"
                  >
                    {formatRupiah(line.val)}
                  </text>
                </g>
              ))}

              {/* Area Fill Path */}
              {chartPoints.areaPath && (
                <path d={chartPoints.areaPath} fill="url(#areaGradient)" />
              )}

              {/* Area Border Stroke Line (Thicker stroke line) */}
              {chartPoints.linePath && (
                <path 
                  d={chartPoints.linePath} 
                  fill="none" 
                  stroke="#944925" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              )}

              {/* Circular Points/Dots (Enhanced dots) */}
              {chartPoints.points.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  {/* Outer glow circle on hover */}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="12" 
                    fill="#944925" 
                    className="opacity-0 group-hover:opacity-20 transition-opacity"
                  />
                  {/* Solid dot */}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="7" 
                    fill="#26170C" 
                    stroke="#FAF6EE" 
                    strokeWidth="2.5" 
                    className="transition-all duration-150 group-hover:scale-125"
                  />
                  {/* Label tooltip */}
                  <text 
                    x={p.x} 
                    y={p.y - 14} 
                    textAnchor="middle" 
                    className="text-[9px] font-bold font-mono fill-[#26170C] dark:fill-[#faf3e0] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  >
                    {formatRupiah(p.val)}
                  </text>
                </g>
              ))}

              {/* X-Axis labels */}
              {chartPoints.points.map((p, idx) => (
                <text 
                  key={idx}
                  x={p.x} 
                  y={350 - chartPoints.bottomMargin + 25} 
                  textAnchor="middle" 
                  className="text-[9px] font-black uppercase tracking-widest fill-[#81756e] dark:fill-[#faf3e0]/60"
                >
                  {p.label}
                </text>
              ))}
            </svg>
          </div>
        </div>


        {/* Recent Transactions Sidebar */}
        <div className="lg:col-span-4 bg-[#FAF6EE] dark:bg-[#26170C]/40 border border-[#E5D3C5] dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-headline italic font-bold text-[#26170C] dark:text-[#faf3e0] flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-[#26170C] dark:text-[#faf3e0]" />
              Transaksi Terbaru
            </h3>
            <p className="text-xs text-[#81756e] dark:text-[#faf3e0]/60 mb-6">
              Aktivitas penjualan kasir terakhir
            </p>
          </div>

          {/* List group */}
          <div className="space-y-4 flex-1">
            {stats.recentTransactions.map((tx) => {
              const isCash = tx.paymentMethod === 'Cash';
              return (
                <div 
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-black/10 border border-[#E5D3C5]/40 dark:border-white/5 rounded-xl transition-all hover:translate-x-1"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-[#26170C] dark:text-[#faf3e0] block truncate">
                      {tx.customerName}
                    </span>
                    <span className="text-[9px] text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest font-bold mt-0.5 block truncate">
                      {tx.serviceName}
                    </span>
                    <span className="text-[8px] text-gray-400 font-mono mt-1 block">
                      {tx.date} • {tx.time}
                    </span>
                  </div>

                  <div className="text-right pl-3 flex-shrink-0">
                    <span className="text-sm font-bold text-[#26170C] dark:text-[#faf3e0] block">
                      {formatRupiah(tx.price)}
                    </span>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider mt-1 ${
                      isCash 
                        ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300' 
                        : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {tx.paymentMethod}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Service Comparison Table */}
      <div className="bg-[#FAF6EE] dark:bg-[#26170C]/40 border border-[#E5D3C5] dark:border-white/5 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-[#26170C] dark:text-[#faf3e0]" />
          <div>
            <h3 className="text-xl font-headline italic font-bold text-[#26170C] dark:text-[#faf3e0]">
              Perbandingan Kinerja Layanan
            </h3>
            <p className="text-xs text-[#81756e] dark:text-[#faf3e0]/60 mt-0.5">
              Analisis pendapatan terintegrasi dinamis dengan master data layanan
            </p>
          </div>
        </div>

        {/* Table container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="border-b border-[#E5D3C5] dark:border-white/10 text-[#81756e] dark:text-[#faf3e0]/60 font-bold uppercase tracking-wider bg-white dark:bg-black/10">
                <th className="py-4 px-6 rounded-l-xl">Nama Layanan</th>
                <th className="py-4 px-6">Kategori</th>
                <th className="py-4 px-6 text-center">Volume Sesi</th>
                <th className="py-4 px-6 text-right">Total Pendapatan</th>
                <th className="py-4 px-6 text-right rounded-r-xl">Kontribusi (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5D3C5]/30 dark:divide-white/5 text-[#26170C] dark:text-[#faf3e0]">
              {stats.serviceStats.map((service, index) => {
                return (
                  <tr 
                    key={service.id} 
                    className={`hover:bg-[#efe8d5]/20 dark:hover:bg-white/5 transition-colors ${
                      index % 2 === 1 ? 'bg-white dark:bg-transparent' : 'bg-[#FAF6EE]/30 dark:bg-white-[0.02]/2'
                    }`}
                  >
                    {/* Name */}
                    <td className="py-4 px-6 font-bold text-sm">
                      {service.name}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6 font-semibold uppercase tracking-wider text-[10px] text-[#81756e] dark:text-[#faf3e0]/80">
                      {service.category}
                    </td>

                    {/* Session Volume */}
                    <td className="py-4 px-6 text-center font-bold text-sm">
                      {service.sessions} Sesi
                    </td>

                    {/* Total Revenue */}
                    <td className="py-4 px-6 text-right font-extrabold text-sm text-[#26170C] dark:text-[#faf3e0]">
                      {formatRupiah(service.revenue)}
                    </td>

                    {/* Contribution percentage */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold text-xs">{service.contribution.toFixed(1)}%</span>
                        {/* Miniature progress pill */}
                        <div className="w-12 bg-[#E5D3C5]/40 dark:bg-white/5 h-2 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className="bg-[#26170C] dark:bg-[#faf3e0] h-full rounded-full" 
                            style={{ width: `${service.contribution}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
