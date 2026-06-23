import React, { useState, useEffect } from 'react';

export default function EditModal({ isOpen, appointment, onClose, onSave, onDelete }) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [barberName, setBarberName] = useState('');
  const [time, setTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Pre-fill form when appointment changes
  useEffect(() => {
    if (appointment) {
      setCustomerName(appointment.customerName || '');
      setPhone(appointment.phone || '');
      setServiceName(appointment.serviceName || '');
      setBarberName(appointment.barberName || '');
      setTime(appointment.time || '');
      setPaymentMethod(appointment.paymentMethod || 'Cash');
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Nama pelanggan harus diisi!');
      return;
    }

    onSave({
      ...appointment,
      customerName: customerName.trim(),
      phone: phone.trim() || '08xx-xxxx-xxxx',
      serviceName,
      barberName,
      time,
      period: parseInt(time.split(':')[0]) < 12 ? 'Pagi' : 'Siang',
      paymentMethod
    });
  };

  const services = [
    'Signature Cut & Wash',
    'Royal Grooming Package',
    'Beard Trim & Hot Towel',
    'Heritage Haircut'
  ];

  const barbers = [
    { name: 'Rahardian', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALgYW6D-zh1ruvvw2PX4HQeP1F5rJXwbSV2WV-8tsaBVgb_do2kM2WkGuN-ccE_MkPZe0u8iSK-JdewUf07W-yBu_lWBtDN45DRDt5ldM-VtVQolmGcayqq-qkcwqVmD559hm3ABMhrSA2VfAh68ZkzgmXNhYiyKB-CBNP9BO0EwF7q2ohCMRGxBy-ISJXi_0nDLijxXql_iEhbZBWqAmQAiAewT4kh3gIDGlxi-UgjLuWd7zYQILN0mkC9za7TdKXQthc-jGBB7tJ' },
    { name: 'Gunawan', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkajYKOu0Ol0SEAQC3uKHy3aiw0xWlaDYnFQNZxxtiF_-HCl388Hj4UQuJ382exaQGGT68Dn-4YqQN-7r3nv-CLhu8pfVHDL3UFWf47ajOicvispjVu54A7pCdx0zmjy8EV2yEEJVlrRcqGdZRdfteRiyFqkUIS_kEZ5e_eNCI4ZbF97Tho17JM-gCnMrkZTlvARBOdniCAHgVIdNBqBwBE39RhERrNnBA6DtrVDcgYisbD9EtvIIFrg0tqC3X8AKSjQSPykokwC6b' },
    { name: 'Eko', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv2C9Fo68RuvXOkMuVZ1b8i8B6aotSLGdHw2jU9aeE2m70y-Bo9bDWZhaljJnWltD48wS8NcnuIRSlY5iVMESAOpsEBtt8O6pg_RNicUmcUNwdCTKK4aWbZukkb9ssUeFAjH57UvBYydlKIUJAF-_JJlCO-AdfBWx_oEOIMRBAIZGb-ycTqWyrntqmkiAzvZzRE0SkmNXCQ57Kkg_ZKwAUj9sIO-zmAtjWlkzbcpqmLUt4wen5XZ7pjgBmyHM5ONOMvNoQixZvrOHa' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#FFF9EC] dark:bg-[#26170C] border border-[#26170c]/10 dark:border-white/5 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up"
      >
        <div className="p-6 border-b border-[#26170c]/5 flex justify-between items-center bg-[#faf3e0] dark:bg-[#2d303a]/50">
          <h3 className="text-xl font-headline italic text-[#26170c] dark:text-[#faf3e0]">
            Edit Janji Temu
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 text-[#81756e] hover:text-[#26170c] dark:hover:text-[#faf3e0] rounded-full"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#81756e] dark:text-[#9ca3af]/80 mb-2">
              Nama Pelanggan
            </label>
            <input 
              type="text" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-[#faf3e0] dark:bg-[#2d303a] border border-[#d2c4bc]/40 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-[#26170C] dark:text-[#faf3e0] focus:ring-2 focus:ring-[#944925] focus:outline-none"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#81756e] dark:text-[#9ca3af]/80 mb-2">
              Nomor Telepon
            </label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#faf3e0] dark:bg-[#2d303a] border border-[#d2c4bc]/40 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-[#26170C] dark:text-[#faf3e0] focus:ring-2 focus:ring-[#944925] focus:outline-none"
            />
          </div>

          {/* Service */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#81756e] dark:text-[#9ca3af]/80 mb-2">
              Layanan
            </label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full bg-[#faf3e0] dark:bg-[#2d303a] border border-[#d2c4bc]/40 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-[#26170C] dark:text-[#faf3e0] focus:ring-2 focus:ring-[#944925] focus:outline-none"
            >
              {services.map((srv) => (
                <option key={srv} value={srv}>{srv}</option>
              ))}
            </select>
          </div>

          {/* Barber */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#81756e] dark:text-[#9ca3af]/80 mb-2">
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
                        ? 'border-[#944925] bg-[#944925]/10 text-[#26170c] dark:text-[#faf3e0]'
                        : 'border-[#d2c4bc]/30 dark:border-white/5 bg-[#faf3e0] dark:bg-[#2d303a] text-[#81756e]'
                    }`}
                  >
                    <img 
                      src={b.avatar} 
                      alt={b.name} 
                      className="w-8 h-8 rounded-full object-cover mb-2 border border-[#E9E2D0]"
                    />
                    <span className="text-[11px] font-bold">{b.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#81756e] dark:text-[#9ca3af]/80 mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
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
                    className={`flex items-center justify-center py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-[#944925] bg-[#944925]/10 text-[#26170c] dark:text-[#faf3e0]'
                        : 'border-[#d2c4bc]/30 dark:border-white/5 bg-[#faf3e0] dark:bg-[#2d303a] text-[#81756e]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm mr-1.5">{method.icon}</span>
                    <span>{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#81756e] dark:text-[#9ca3af]/80 mb-2">
              Waktu Janji Temu
            </label>
            <input 
              type="time" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-[#faf3e0] dark:bg-[#2d303a] border border-[#d2c4bc]/40 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-[#26170C] dark:text-[#faf3e0] focus:ring-2 focus:ring-[#944925] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#26170c]/5 flex space-x-3">
            {/* Delete button (Trash / Hapus) inside Modal */}
            <button
              type="button"
              onClick={() => {
                if (onDelete) {
                  onDelete(appointment.id);
                  onClose();
                }
              }}
              className="flex-1 bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors active:scale-95 transform flex items-center justify-center space-x-1"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              <span>Hapus</span>
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#26170c] dark:bg-[#faf3e0] hover:bg-[#3d2b1f] dark:hover:bg-[#efe8d5] text-white dark:text-[#26170c] py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors active:scale-95 transform shadow-md"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
