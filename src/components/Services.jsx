import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Grid, 
  List, 
  Search, 
  Clock, 
  Scissors, 
  Droplet, 
  Tag, 
  Sparkles, 
  Leaf, 
  HelpCircle 
} from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('semua');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  
  // Form States
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    duration: '',
    status: 'Aktif',
    description: '',
    is_package: false,
    package_items: []
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching services:', error);
        setServices([]);
      } else if (data) {
        const mapped = data.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category ? s.category.toLowerCase() : '',
          price: s.price_idr,
          duration: s.duration_minutes,
          status: s.is_active ? 'Aktif' : 'Non-Aktif',
          description: s.description || '',
          package_items: s.package_items || []
        }));
        setServices(mapped);
      }
    } catch (err) {
      console.error('Unexpected error fetching services:', err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Helper to format price to Rupiah format
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  // Helper to determine the virtual/effective category of a service
  const getEffectiveCategory = (service) => {
    if (service.package_items && Array.isArray(service.package_items) && service.package_items.length > 0) {
      return 'paket';
    }
    return service.category ? service.category.toLowerCase() : '';
  };

  // Helper to render service description dynamically for packages
  const renderServiceDescription = (service, masterServices = services) => {
    const isPackage = service.service_type === 'package' || 
                      (service.package_items && service.package_items.length > 0) || 
                      getEffectiveCategory(service) === 'paket';
                      
    if (isPackage) {
      const items = service.package_items || [];
      const itemNames = items
        .map((itemId) => {
          const matched = masterServices.find((s) => s.id === itemId);
          return matched ? matched.name : null;
        })
        .filter(Boolean);

      if (itemNames.length > 0) {
        return `Isi paket: ${itemNames.join(', ')}`;
      }
    }
    return service.description || 'Tidak ada deskripsi.';
  };

  // Icon selector based on category and service name
  const getCategoryIcon = (category, name = '') => {
    const n = name.toLowerCase();
    if (n.includes('beard') || n.includes('jenggot')) {
      return <Leaf className="w-5 h-5" />;
    }
    const cat = category ? category.toLowerCase() : '';
    if (cat === 'cukur') {
      return <Scissors className="w-5 h-5" />;
    }
    if (cat === 'perawatan') {
      if (n.includes('detox') || n.includes('wash') || n.includes('cuci')) {
        return <Droplet className="w-5 h-5" />;
      }
      return <Sparkles className="w-5 h-5" />;
    }
    if (cat === 'paket') {
      return <Tag className="w-5 h-5" />;
    }
    return <HelpCircle className="w-5 h-5" />;
  };

  // Filter logic
  const filteredServices = services.filter((service) => {
    const search = searchQuery ? searchQuery.trim().toLowerCase() : '';
    const matchesSearch = !search ? true : (
      (service.name && service.name.toLowerCase().includes(search)) || 
      (service.description && service.description.toLowerCase().includes(search))
    );
    
    const currentTab = (activeTab || 'semua').trim().toLowerCase();
    const matchesCategory = currentTab === 'semua' || 
                            getEffectiveCategory(service) === currentTab;
    
    return matchesSearch && matchesCategory;
  });

  // Form handlers
  const handleOpenAdd = () => {
    setSelectedService(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      duration: '',
      status: 'Aktif',
      description: '',
      is_package: false,
      package_items: []
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      category: service.category ? service.category.toLowerCase() : '',
      price: service.price,
      duration: service.duration,
      status: service.status,
      description: service.description,
      is_package: service.package_items && service.package_items.length > 0 ? true : false,
      package_items: service.package_items || []
    });
    setShowFormModal(true);
  };


  const handleDelete = async (serviceId) => {
    if (window.confirm('Yakin ingin menghapus layanan ini?')) {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) {
        console.log(error);
        alert('Gagal menghapus layanan: ' + error.message);
      } else {
        setServices((prev) => prev.filter((s) => s.id !== serviceId));
      }
    }
  };

  const availableServices = services.filter((s) => {
    if (selectedService && s.id === selectedService.id) return false;
    const isAPackage = getEffectiveCategory(s) === 'paket';
    return !isAPackage && s.status === 'Aktif';
  });

  const handleServiceSelection = (serviceId, isChecked) => {
    setFormData((prev) => {
      const currentItems = prev.package_items || [];
      if (isChecked) {
        if (currentItems.length < 4) {
          return {
            ...prev,
            package_items: [...currentItems, serviceId],
          };
        }
      } else {
        return {
          ...prev,
          package_items: currentItems.filter((id) => id !== serviceId),
        };
      }
      return prev;
    });
  };

  const handleCategoryChange = (value) => {
    setFormData((prev) => {
      const isSelected = value === 'cukur' || value === 'perawatan';
      return {
        ...prev,
        category: value,
        is_package: isSelected ? false : prev.is_package,
        package_items: isSelected ? [] : prev.package_items,
      };
    });
  };

  const handleTogglePackage = (value) => {
    setFormData((prev) => ({
      ...prev,
      is_package: value,
      category: value ? '' : prev.category,
      package_items: value ? prev.package_items : []
    }));
  };

  const handleCreateService = async (namaLayanan, kategori, deskripsi, durasi, harga, packageItems) => {
    const newId = namaLayanan.toLowerCase().replace(/\s+/g, '-');
    const statusAktif = formData.status === 'Aktif';
    const { data, error } = await supabase
      .from('services')
      .insert([{ 
          id: newId, 
          name: namaLayanan, 
          category: kategori, 
          description: deskripsi, 
          duration_minutes: durasi, 
          price_idr: harga,
          is_active: statusAktif,
          package_items: packageItems
      }]);

    if (error) {
      console.log(error);
      alert('Gagal menambahkan layanan: ' + error.message);
    } else {
      const newService = {
        id: newId,
        name: namaLayanan,
        category: kategori,
        description: deskripsi,
        duration: durasi,
        price: harga,
        status: statusAktif ? 'Aktif' : 'Non-Aktif',
        package_items: packageItems || []
      };
      setServices((prev) => [...prev, newService]);
      setShowFormModal(false);
    }
  };

  const handleUpdate = async (serviceId, namaLayanan, kategori, deskripsi, durasi, harga, statusAktif, packageItems) => {
    const { error } = await supabase
      .from('services')
      .update({ 
          name: namaLayanan, 
          category: kategori, 
          description: deskripsi, 
          duration_minutes: durasi, 
          price_idr: harga,
          is_active: statusAktif,
          package_items: packageItems
      })
      .eq('id', serviceId);

    if (error) {
      console.log(error);
      alert('Gagal mengubah layanan: ' + error.message);
    } else {
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId
            ? {
                ...s,
                name: namaLayanan,
                category: kategori,
                description: deskripsi,
                duration: durasi,
                price: harga,
                status: statusAktif ? 'Aktif' : 'Non-Aktif',
                package_items: packageItems || []
              }
            : s
        )
      );
      setShowFormModal(false);
    }
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.duration) {
      alert('Mohon isi semua field wajib.');
      return;
    }

    if (!formData.is_package && !formData.category) {
      alert('Mohon pilih kategori untuk layanan.');
      return;
    }

    const priceNum = parseInt(formData.price);
    const durationNum = parseInt(formData.duration);

    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Harga harus berupa angka positif.');
      return;
    }
    if (isNaN(durationNum) || durationNum <= 0) {
      alert('Durasi harus berupa angka positif.');
      return;
    }

    const packageItemsVal = formData.is_package ? formData.package_items : null;
    const categoryVal = formData.is_package ? null : (formData.category || null);

    if (selectedService) {
      await handleUpdate(
        selectedService.id,
        formData.name,
        categoryVal,
        formData.description,
        durationNum,
        priceNum,
        formData.status === 'Aktif',
        packageItemsVal
      );
    } else {
      await handleCreateService(
        formData.name,
        categoryVal,
        formData.description,
        durationNum,
        priceNum,
        packageItemsVal
      );
    }
  };

  const handleToggleStatus = async (service) => {
    const nextActive = service.status !== 'Aktif';
    const { error } = await supabase
      .from('services')
      .update({ is_active: nextActive })
      .eq('id', service.id);

    if (error) {
      console.log(error);
      alert('Gagal memperbarui status: ' + error.message);
    } else {
      await fetchServices();
    }
  };

  return (
    <main className="p-6 md:p-8 flex-1 bg-[#FFF9EC] dark:bg-[#26170c] transition-colors duration-200 animate-fade-in text-[#26170C] dark:text-[#faf3e0]">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-headline italic text-[#26170C] dark:text-[#faf3e0] leading-tight font-bold">
            Manajemen Layanan
          </h2>
          <p className="text-[#26170C]/70 dark:text-[#faf3e0]/70 mt-2 max-w-xl text-sm">
            Kelola daftar harga dan jenis perawatan di Heritage Grooming.
          </p>
        </div>
        
        {/* Tombol Tambah Layanan */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="bg-[#26170C] dark:bg-[#faf3e0] text-white dark:text-[#26170C] px-5 py-2.5 rounded-lg font-semibold hover:bg-[#3d2514] dark:hover:bg-[#efe8d5] transition-all flex items-center justify-center gap-2 self-start md:self-auto shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>TAMBAH LAYANAN</span>
        </button>
      </div>

      {/* Filter and View Toggle Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[#E5D3C5]/40 dark:border-white/5 pb-4">
        {/* Category Tabs */}
        <div className="flex space-x-1 overflow-x-auto scrollbar-none pb-2 md:pb-0">
          {['semua', 'cukur', 'perawatan', 'paket'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#26170C] text-white dark:bg-[#faf3e0] dark:text-[#26170C]'
                    : 'text-[#81756e] dark:text-[#faf3e0]/60 hover:bg-[#efe8d5]/40 dark:hover:bg-white/5'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Search & View Toggle Container */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 md:flex-none">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#81756e] dark:text-[#faf3e0]/60">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cari layanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-[#26170c]/40 border border-[#E5D3C5] dark:border-white/10 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#26170C] dark:focus:ring-[#faf3e0] w-full md:w-64 text-[#26170C] dark:text-[#faf3e0] placeholder-[#81756e]/60 dark:placeholder-[#faf3e0]/40"
            />
          </div>

          {/* Grid/Table Toggle */}
          <div className="bg-[#efe8d5]/60 dark:bg-[#26170C]/60 p-1 flex rounded-lg border border-[#d2c4bc]/20 dark:border-white/5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#26170C] dark:bg-[#faf3e0] text-white dark:text-[#26170C] shadow-sm'
                  : 'text-[#81756e] dark:text-[#faf3e0]/60 hover:bg-[#efe8d5] dark:hover:bg-[#26170C]'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-all ${
                viewMode === 'table'
                  ? 'bg-[#26170C] dark:bg-[#faf3e0] text-white dark:text-[#26170C] shadow-sm'
                  : 'text-[#81756e] dark:text-[#faf3e0]/60 hover:bg-[#efe8d5] dark:hover:bg-[#26170C]'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering based on Selected View Mode */}
      {loading ? (
        <div className="bg-[#FAF3E0] dark:bg-[#26170C]/30 border border-[#E5D3C5]/20 dark:border-white/5 rounded-xl p-12 text-center text-[#26170C] dark:text-[#faf3e0]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-2" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="text-sm font-semibold mt-2">Memuat data layanan...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-[#FAF3E0] dark:bg-[#26170C]/30 border border-dashed border-[#E5D3C5] dark:border-white/10 rounded-xl p-12 text-center text-[#81756e] dark:text-[#faf3e0]/60 italic">
          Tidak ada layanan yang cocok dengan pencarian dan filter Anda.
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const isAktif = service.status === 'Aktif';
            return (
              <div
                key={service.id}
                className="group relative bg-[#FAF6EE] dark:bg-[#26170C]/30 border border-[#E5D3C5] dark:border-white/5 rounded-xl p-5 shadow-sm transition-all duration-200 flex flex-col justify-between hover:shadow-md hover:scale-[1.01]"
              >
                <div>
                  {/* Card Header Row */}
                  <div className="flex justify-between items-start mb-4">
                    {/* Category Icon */}
                    <div className="w-10 h-10 rounded-lg bg-[#efe8d5] dark:bg-white/5 flex items-center justify-center text-[#26170C] dark:text-[#faf3e0]">
                      {getCategoryIcon(getEffectiveCategory(service), service.name)}
                    </div>

                    {/* Status Badge & Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(service)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:scale-105 active:scale-95 transition-all ${
                          isAktif 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}
                        title="Klik untuk mengubah status aktif/non-aktif"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isAktif ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {service.status}
                      </button>
                    </div>
                  </div>

                  {/* Category Label */}
                  <span className="text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest block mb-1">
                    {getEffectiveCategory(service)}
                  </span>

                  {/* Service Name */}
                  <h3 className="text-xl font-headline italic font-bold text-[#26170C] dark:text-[#faf3e0] mb-2">
                    {service.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[#81756e] dark:text-[#faf3e0]/70 line-clamp-2 mb-6 h-8 overflow-hidden leading-relaxed">
                    {renderServiceDescription(service)}
                  </p>
                </div>

                {/* Card Footer Row */}
                <div className="border-t border-[#E5D3C5]/40 dark:border-white/5 pt-4 flex justify-between items-end">
                  {/* Price info */}
                  <div>
                    <span className="text-[9px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest block mb-0.5">
                      HARGA
                    </span>
                    <span className="text-lg font-bold text-[#26170C] dark:text-[#faf3e0]">
                      {formatRupiah(service.price)}
                    </span>
                  </div>

                  {/* Duration info */}
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest block mb-0.5">
                      DURASI
                    </span>
                    <span className="text-xs font-semibold text-[#26170C] dark:text-[#faf3e0] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#81756e] dark:text-[#faf3e0]/60" />
                      {service.duration} Menit
                    </span>
                  </div>
                </div>

                {/* Hover Action Panel (Desktop style) */}
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-[#FAF6EE]/90 dark:bg-[#26170C]/90 p-1.5 rounded-lg border border-[#E5D3C5]/30 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(service)}
                    className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/20 transition-all"
                    title="Ubah Layanan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                   <button
                    type="button"
                    onClick={() => handleDelete(service.id)}
                    className="p-1 rounded text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-all"
                    title="Hapus Layanan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Dotted Tambah Layanan Card */}
          <div
            onClick={handleOpenAdd}
            className="border-2 border-dashed border-[#E5D3C5] dark:border-white/10 hover:border-[#26170C] dark:hover:border-white/30 cursor-pointer rounded-xl p-5 flex flex-col items-center justify-center min-h-[200px] text-center transition-all bg-[#FAF9F6]/20 dark:bg-white/5 group hover:scale-[1.01]"
          >
            <div className="w-10 h-10 rounded-lg bg-[#efe8d5]/60 dark:bg-white/5 flex items-center justify-center text-[#26170C] dark:text-[#faf3e0] mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-sans uppercase tracking-widest text-[10px] font-black text-[#81756e] dark:text-[#faf3e0]/60 group-hover:text-[#26170C] dark:group-hover:text-[#faf3e0]">
              TAMBAH LAYANAN BARU
            </span>
          </div>
        </div>
      ) : (
        /* TABLE VIEW (Zebra Striping) */
        <div className="bg-white dark:bg-[#26170C]/10 border border-[#E5D3C5] dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[#E5D3C5] dark:border-white/10 text-[#81756e] dark:text-[#faf3e0]/60 font-bold uppercase tracking-wider bg-[#FAF6EE] dark:bg-black/10">
                  <th className="py-4 px-6">Nama Layanan</th>
                  <th className="py-4 px-6">Kategori</th>
                  <th className="py-4 px-6">Durasi</th>
                  <th className="py-4 px-6">Harga</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5D3C5]/30 dark:divide-white/5 text-[#26170C] dark:text-[#faf3e0]">
                {filteredServices.map((service, index) => {
                  const isAktif = service.status === 'Aktif';
                  return (
                    <tr 
                      key={service.id} 
                      className={`hover:bg-[#efe8d5]/10 dark:hover:bg-white/5 transition-colors ${
                        index % 2 === 1 ? 'bg-[#FAF6EE]/30 dark:bg-white-[0.02]/2' : 'bg-white dark:bg-transparent'
                      }`}
                    >
                      {/* Name & Desc */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-sm">{service.name}</div>
                        <div className="text-[10px] text-[#81756e] dark:text-[#faf3e0]/60 truncate max-w-xs mt-0.5">
                          {renderServiceDescription(service)}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6 font-semibold uppercase tracking-wider text-[10px] text-[#81756e] dark:text-[#faf3e0]/80">
                        {getEffectiveCategory(service)}
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-6 font-semibold">
                        {service.duration} Menit
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 font-bold text-sm">
                        {formatRupiah(service.price)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(service)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all ${
                            isAktif 
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' 
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                          }`}
                          title="Klik untuk mengubah status aktif/non-aktif"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isAktif ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {service.status}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(service)}
                            className="p-1.5 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                            title="Ubah"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                           <button
                            type="button"
                            onClick={() => handleDelete(service.id)}
                            className="p-1.5 rounded bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FORM MODAL: ADD / EDIT SERVICE */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveService}
            className="bg-white dark:bg-[#26170c] border border-[#E5D3C5] dark:border-white/10 w-full max-w-md p-6 rounded-xl shadow-2xl text-[#26170c] dark:text-[#faf3e0] animate-scale-up"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-[#E5D3C5]/40 dark:border-white/5">
              <h3 className="text-xl font-serif font-bold text-[#26170C] dark:text-[#faf3e0]">
                {selectedService ? 'Ubah Layanan' : 'Tambah Layanan Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="text-gray-400 hover:text-red-500 transition-colors text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              {/* Nama Layanan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#faf3e0]/60 mb-1">
                  Nama Layanan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Signature Cut"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white dark:bg-[#3d2b1f] border border-[#E5D3C5] dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#26170C] dark:focus:ring-[#faf3e0] text-[#26170C] dark:text-[#faf3e0]"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#faf3e0]/60 mb-1">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  disabled={formData.is_package}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full bg-white dark:bg-[#3d2b1f] border border-[#E5D3C5] dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#26170C] dark:focus:ring-[#faf3e0] text-[#26170C] dark:text-[#faf3e0] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">-- Pilih Kategori --</option>
                  <option value="cukur">CUKUR</option>
                  <option value="perawatan">PERAWATAN</option>
                </select>
              </div>

              {/* Durasi & Harga (Grid) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Durasi */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#faf3e0]/60 mb-1">
                    Durasi (Menit) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="45"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full bg-white dark:bg-[#3d2b1f] border border-[#E5D3C5] dark:border-white/10 rounded-lg pl-3 pr-14 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#26170C] dark:focus:ring-[#faf3e0] text-[#26170C] dark:text-[#faf3e0]"
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-[#81756e]/80 dark:text-[#faf3e0]/60">
                      Min
                    </span>
                  </div>
                </div>

                {/* Harga */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#faf3e0]/60 mb-1">
                    Harga (Rupiah) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#81756e]/80 dark:text-[#faf3e0]/60">
                      Rp
                    </span>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="75000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-white dark:bg-[#3d2b1f] border border-[#E5D3C5] dark:border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#26170C] dark:focus:ring-[#faf3e0] text-[#26170C] dark:text-[#faf3e0]"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#faf3e0]/60 mb-1">
                  Status Layanan
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-white dark:bg-[#3d2b1f] border border-[#E5D3C5] dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#26170C] dark:focus:ring-[#faf3e0] text-[#26170C] dark:text-[#faf3e0]"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
              </div>

              {/* Jadikan Sebagai Paket Toggle */}
              <div className="flex items-center justify-between py-2 border-t border-b border-[#E5D3C5]/30 dark:border-white/5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#faf3e0]/60">
                  Jadikan Sebagai Paket
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_package}
                    onChange={(e) => handleTogglePackage(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Pilih Layanan Individual Checkbox List */}
              {formData.is_package && (
                <div className="space-y-2 border border-[#E5D3C5]/60 dark:border-white/10 rounded-xl p-4 bg-gray-50/50 dark:bg-black/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#faf3e0]/60">
                      Pilih Layanan Individual
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                      Layanan terpilih: {formData.package_items.length}/4
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1">
                    {availableServices.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Tidak ada layanan individual aktif yang tersedia.</p>
                    ) : (
                      availableServices.map((s) => {
                        const isChecked = formData.package_items.includes(s.id);
                        const isDisabled = !isChecked && formData.package_items.length >= 4;
                        return (
                          <label
                            key={s.id}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-[#26170C]/5 dark:bg-white/5 font-semibold'
                                : isDisabled
                                ? 'opacity-40 cursor-not-allowed'
                                : 'hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isDisabled}
                              onChange={(e) => handleServiceSelection(s.id, e.target.checked)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-white/10 dark:bg-[#3d2b1f]"
                            />
                            <span className="text-sm text-[#26170c] dark:text-[#faf3e0]">
                              {s.name}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#faf3e0]/60 mb-1">
                  Deskripsi Layanan
                </label>
                <textarea
                  rows="3"
                  placeholder="Tuliskan deskripsi singkat mengenai layanan ini..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white dark:bg-[#3d2b1f] border border-[#E5D3C5] dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#26170C] dark:focus:ring-[#faf3e0] text-[#26170C] dark:text-[#faf3e0] placeholder-[#81756e]/50 dark:placeholder-[#faf3e0]/40"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-[#E5D3C5]/40 dark:border-white/5">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="px-4 py-2 bg-white dark:bg-white/5 border border-[#E5D3C5] dark:border-white/10 text-gray-700 dark:text-[#faf3e0]/80 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#26170C] dark:bg-[#faf3e0] text-white dark:text-[#26170C] rounded-lg hover:bg-[#3d2514] dark:hover:bg-[#efe8d5] font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Simpan Layanan
              </button>
            </div>
          </form>
        </div>
      )}

    </main>
  );
}
