import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import QueueList from './components/QueueList';
import Schedule from './components/Schedule';
import BookingModal from './components/BookingModal';
import EditModal from './components/EditModal';
import QRScannerModal from './components/QRScannerModal';
import CustomerBookingPortal from './components/CustomerBookingPortal';
import StoreProfileModal from './components/StoreProfileModal';
import Dashboard from './components/Dashboard';
import DataBarber from './components/DataBarber';
import Services from './components/Services';
import FinancialReport from './components/FinancialReport';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './config/supabase';

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function ProtectedRoute({ isAuthenticated, userRole, children }) {
  if (!isAuthenticated || userRole === 'customer') {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('customer');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [activeMenu, setActiveMenu] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeMenu') || 'DASHBOARD';
    }
    return 'DASHBOARD';
  });
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const [isStoreActive, setIsStoreActive] = useState(true);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isStoreProfileModalOpen, setIsStoreProfileModalOpen] = useState(false);
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('17:30');

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Fetch store settings on mount
  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .eq('id', 'main_store')
          .single();
        
        if (error) {
          console.warn('Gagal memuat store_settings dari database. Menggunakan default fallback:', error.message);
          return;
        }

        if (data) {
          const fetchedOpen = data.open_time ? data.open_time.substring(0, 5) : '09:00';
          const fetchedClose = data.close_time ? data.close_time.substring(0, 5) : '17:30';
          setOpenTime(fetchedOpen);
          setCloseTime(fetchedClose);
          setIsAutoMode(data.is_auto_mode);
          
          if (data.is_auto_mode) {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const openMin = parseTimeToMinutes(fetchedOpen);
            const closeMin = parseTimeToMinutes(fetchedClose);
            setIsStoreActive(currentMinutes >= openMin && currentMinutes < closeMin);
          } else {
            setIsStoreActive(data.is_store_active);
          }
        }
      } catch (err) {
        console.error('Kesalahan saat memuat store_settings:', err);
      }
    };

    fetchStoreSettings();
  }, []);

  // Realtime subscription for store_settings table updates
  useEffect(() => {
    const subscription = supabase
      .channel('store_settings_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'store_settings', filter: 'id=eq.main_store' }, (payload) => {
        console.log('Perubahan realtime store_settings diterima:', payload.new);
        const newData = payload.new;
        if (newData) {
          if (newData.open_time) setOpenTime(newData.open_time.substring(0, 5));
          if (newData.close_time) setCloseTime(newData.close_time.substring(0, 5));
          setIsAutoMode(newData.is_auto_mode);
          if (newData.is_auto_mode) {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const openMin = parseTimeToMinutes(newData.open_time);
            const closeMin = parseTimeToMinutes(newData.close_time);
            setIsStoreActive(currentMinutes >= openMin && currentMinutes < closeMin);
          } else {
            setIsStoreActive(newData.is_store_active);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [openTime, closeTime]);

  // Supabase Auth State Change Listener
  useEffect(() => {
    let isMounted = true;

    const checkInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) {
          console.warn('Session tidak valid atau tidak ditemukan pada mount. Melakukan pembersihan session lama...');
          
          // Hapus item-item custom session dari localStorage
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');

          // Hapus item token internal Supabase dari localStorage
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('sb-') || key.includes('supabase.auth'))) {
              localStorage.removeItem(key);
            }
          }

          // Trigger signOut secara asinkron untuk memastikan client bersih
          await supabase.auth.signOut().catch(() => {});

          if (isMounted) {
            setIsAuthenticated(false);
            setUserRole('customer');
            setCurrentUser(null);
          }
        } else {
          const user = session.user;
          let role = 'customer';
          let name = user.user_metadata?.full_name || user.user_metadata?.username || user.email.split('@')[0];

          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role, full_name, username')
              .eq('id', user.id)
              .single();

            if (!profileError && profile) {
              if (profile.role) role = profile.role;
              if (profile.full_name) name = profile.full_name;
              else if (profile.username) name = profile.username;
            }
          } catch (profileErr) {
            console.warn('Gagal memuat peran user dari profil:', profileErr);
          }

          if (isMounted) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', role);
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userName', name);

            setIsAuthenticated(true);
            setUserRole(role);
            setCurrentUser({ name, email: user.email, role });
          }
        }
      } catch (err) {
        console.error('Error checking session on mount:', err);
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Event Autentikasi Supabase:', event, session);
      if (session?.user) {
        const user = session.user;
        let role = 'customer';
        let name = user.user_metadata?.full_name || user.user_metadata?.username || user.email.split('@')[0];

        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, full_name, username')
            .eq('id', user.id)
            .single();

          if (!profileError && profile) {
            if (profile.role) role = profile.role;
            if (profile.full_name) name = profile.full_name;
            else if (profile.username) name = profile.username;
          }
        } catch (profileErr) {
          console.warn('Gagal memuat peran user dari profil:', profileErr);
        }

        if (isMounted) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', role);
          localStorage.setItem('userEmail', user.email);
          localStorage.setItem('userName', name);

          setIsAuthenticated(true);
          setUserRole(role);
          setCurrentUser({ name, email: user.email, role });

          if (role === 'admin' || role === 'barber') {
            if (role === 'admin') {
              setActiveMenu('DASHBOARD');
            } else {
              setActiveMenu('JADWAL ANTREAN');
            }
            navigate('/admin-dashboard');
          } else {
            navigate('/');
          }
        }
      } else {
        if (isMounted) {
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          setIsAuthenticated(false);
          setUserRole('customer');
          setCurrentUser(null);
          navigate('/');
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Helper functions for date and period parsing
  const getPeriodFromTime = (dateStr) => {
    if (!dateStr) return 'Siang';
    try {
      const hour = new Date(dateStr).getHours();
      if (hour < 12) return 'Pagi';
      if (hour < 15) return 'Siang';
      return 'Sore';
    } catch (e) {
      return 'Siang';
    }
  };

  const getDayKey = (dateStr) => {
    if (!dateStr) return 'hari_ini';
    try {
      const appDate = new Date(dateStr);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const isSameDay = (d1, d2) => 
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      if (isSameDay(appDate, today)) {
        return 'hari_ini';
      } else if (isSameDay(appDate, tomorrow)) {
        return 'besok';
      }
      return 'hari_ini';
    } catch (e) {
      return 'hari_ini';
    }
  };

  async function fetchQueueAppointments() {
    try {
      const { data, error } = await supabase
        .from('daftar_antrian_ui')
        .select('*, profiles!barber_id(full_name, username)')
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('appointment_date', { ascending: false });

      if (error) {
        console.error('Error fetching queue from Supabase view:', error.message);
        return;
      }

      const grouped = {
        hari_ini: [],
        besok: []
      };

      const mapStatusToUI = (status) => {
        if (status === 'menunggu' || status === 'paid') return 'waiting';
        if (status === 'in_progress') return 'serving';
        if (status === 'completed') return 'completed';
        return status || 'waiting';
      };

      const getBarberAvatar = (name) => {
        const defaultAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv2C9Fo68RuvXOkMuVZ1b8i8B6aotSLGdHw2jU9aeE2m70y-Bo9bDWZhaljJnWltD48wS8NcnuIRSlY5iVMESAOpsEBtt8O6pg_RNicUmcUNwdCTKK4aWbZukkb9ssUeFAjH57UvBYydlKIUJAF-_JJlCO-AdfBWx_oEOIMRBAIZGb-ycTqWyrntqmkiAzvZzRE0SkmNXCQ57Kkg_ZKwAUj9sIO-zmAtjWlkzbcpqmLUt4wen5XZ7pjgBmyHM5ONOMvNoQixZvrOHa';
        if (!name) return defaultAvatar;
        const lowercase = name.toLowerCase();
        if (lowercase.includes('eko')) {
          return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv2C9Fo68RuvXOkMuVZ1b8i8B6aotSLGdHw2jU9aeE2m70y-Bo9bDWZhaljJnWltD48wS8NcnuIRSlY5iVMESAOpsEBtt8O6pg_RNicUmcUNwdCTKK4aWbZukkb9ssUeFAjH57UvBYydlKIUJAF-_JJlCO-AdfBWx_oEOIMRBAIZGb-ycTqWyrntqmkiAzvZzRE0SkmNXCQ57Kkg_ZKwAUj9sIO-zmAtjWlkzbcpqmLUt4wen5XZ7pjgBmyHM5ONOMvNoQixZvrOHa';
        }
        if (lowercase.includes('gunawan')) {
          return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkajYKOu0Ol0SEAQC3uKHy3aiw0xWlaDYnFQNZxxtiF_-HCl388Hj4UQuJ382exaQGGT68Dn-4YqQN-7r3nv-CLhu8pfVHDL3UFWf47ajOicvispjVu54A7pCdx0zmjy8EV2yEEJVlrRcqGdZRdfteRiyFqkUIS_kEZ5e_eNCI4ZbF97Tho17JM-gCnMrkZTlvARBOdniCAHgVIdNBqBwBE39RhERrNnBA6DtrVDcgYisbD9EtvIIFrg0tqC3X8AKSjQSPykokwC6b';
        }
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuRAo0ZT6waub9Kwe7YWTOmIQtGtz7vgMFThd0-eObVTpebu1RGVg5AnmS5tE89mCOponHH2bvrfRtyEZS7MOQyk7mhxlvaMrwn49SNXhiVEt9LTW-bXoeGd-Siofd21MjIkOP2rpdHOxUXnPnnJ3WnEonJNo58dpjwlqBxSeTErUnzrIIVSzar-HdvjvDGoTwygwaFniymFKV5cE1tp4XyNT9sZESYk14e7HJK_34oVWdZYGKNxiwdV28w2rGNvi_v2nmU99yxVHd';
      };

      data.forEach((row) => {
        if (row.status === 'pending') return;

        const dayKey = getDayKey(row.appointment_date);

        let serviceName = 'Signature Cut';
        if (row.selected_services && Array.isArray(row.selected_services)) {
          serviceName = row.selected_services.map(s => s.name).join(', ');
        }

        const barberName = row.profiles?.full_name || row.profiles?.username || 'Rahardian';

        const formatted = {
          id: row.id,
          time: row.appointment_date ? row.appointment_date.substring(11, 16) : '09:00',
          period: getPeriodFromTime(row.appointment_date),
          customerName: row.nama_tampil || 'Pelanggan',
          phone: '0812-xxxx-xxxx',
          serviceName: serviceName,
          duration: '45 Menit',
          barberName: barberName,
          status: mapStatusToUI(row.status),
          code: '#HG-' + (row.queue_number || Math.floor(100 + Math.random() * 900)),
          timeLeft: null,
          bookingSource: row.customer_id ? 'Online' : 'Walk-in',
          paymentMethod: row.customer_id ? 'Online' : 'Cash',
          totalPrice: row.total_price || 0,
          barberAvatar: getBarberAvatar(barberName)
        };

        grouped[dayKey].push(formatted);
      });

      if (grouped.hari_ini.length > 0) {
        grouped.hari_ini.push({ id: 'b1', isBreak: true, breakLabel: 'Istirahat Siang' });
        grouped.hari_ini = sortAndAlignAppointments(grouped.hari_ini);
      }
      if (grouped.besok.length > 0) {
        grouped.besok.push({ id: 'b2', isBreak: true, breakLabel: 'Istirahat Siang' });
        grouped.besok = sortAndAlignAppointments(grouped.besok);
      }

      setDailyAppointments(grouped);
    } catch (err) {
      console.error('Unexpected error in fetchQueueAppointments:', err);
    }
  }

  async function fetchCustomerDatabase() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, email')
        .eq('role', 'customer');
      
      if (error) {
        console.error('Error fetching customers:', error.message);
        return;
      }

      const formatted = data.map(p => ({
        id: p.id,
        name: p.full_name || p.username || p.email?.split('@')[0] || 'Pelanggan',
        phone: '08xx-xxxx-xxxx',
        lastService: 'Signature Cut'
      }));

      setCustomerDatabase(formatted);
    } catch (e) {
      console.error('Unexpected error in fetchCustomerDatabase:', e);
    }
  }

  // Realtime subscription for transaksi_antrian table changes
  useEffect(() => {
    fetchQueueAppointments();
    fetchCustomerDatabase();

    const channel = supabase
      .channel('realtime_queues')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transaksi_antrian' }, async (payload) => {
        console.log('Perubahan data antrean dideteksi secara real-time:', payload.event, payload.new);
        fetchQueueAppointments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStoreSettings = async (updates) => {
    try {
      const { error } = await supabase
        .from('store_settings')
        .update(updates)
        .eq('id', 'main_store');
      
      if (error) {
        console.error('Gagal memperbarui store_settings:', error.message);
        alert('Gagal menyimpan perubahan ke database: ' + error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Kesalahan saat memperbarui store_settings:', err);
      alert('Terjadi kesalahan koneksi.');
      return false;
    }
  };

  const handleSaveHours = async (newOpen, newClose) => {
    const success = await updateStoreSettings({ open_time: newOpen, close_time: newClose });
    if (success) {
      setOpenTime(newOpen);
      setCloseTime(newClose);
      handleAddNotification(`Jam kerja toko diperbarui menjadi ${newOpen} - ${newClose}.`);
    }
  };

  const handleToggleAutoMode = async () => {
    const nextAutoMode = !isAutoMode;
    let nextStoreActive = isStoreActive;
    if (nextAutoMode) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const openMin = parseTimeToMinutes(openTime);
      const closeMin = parseTimeToMinutes(closeTime);
      nextStoreActive = currentMinutes >= openMin && currentMinutes < closeMin;
    }
    
    const success = await updateStoreSettings({ 
      is_auto_mode: nextAutoMode, 
      is_store_active: nextStoreActive 
    });
    
    if (success) {
      setIsAutoMode(nextAutoMode);
      setIsStoreActive(nextStoreActive);
      handleAddNotification(nextAutoMode ? "Mode operasional toko diubah ke Otomatis." : "Mode operasional toko diubah ke Manual.");
    }
  };

  const handleToggleStoreActive = async () => {
    if (isAutoMode) return;
    const nextStoreActive = !isStoreActive;
    const success = await updateStoreSettings({ is_store_active: nextStoreActive });
    if (success) {
      setIsStoreActive(nextStoreActive);
      handleAddNotification(nextStoreActive ? "Toko telah dibuka kembali secara manual." : "Toko ditutup sementara secara manual (Bypass).");
    }
  };

  // Pengujian Koneksi Supabase & Skema Tabel
  useEffect(() => {
    supabase.from('profiles').select('*').limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error('Gagal mengambil data profiles:', error.message);
        } else if (data && data.length > 0) {
          console.log('Skema Tabel profiles (Kolom):', Object.keys(data[0]), data[0]);
        } else {
          console.log('Tabel profiles kosong, tidak ada baris data.');
        }
      });
  }, []);

  // Auto Mode Effect: Keep checking time when isAutoMode is true
  useEffect(() => {
    if (isAutoMode) {
      const checkTime = () => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const openMin = parseTimeToMinutes(openTime);
        const closeMin = parseTimeToMinutes(closeTime);
        const active = currentMinutes >= openMin && currentMinutes < closeMin;
        setIsStoreActive(active);
      };
      checkTime();
      const interval = setInterval(checkTime, 30000);
      return () => clearInterval(interval);
    }
  }, [isAutoMode, openTime, closeTime]);

  // Derived closed status: isClosed is true only if the store is not active (Absolute Override)
  const isClosed = !isStoreActive;
  const storeStatusLabel = isStoreActive ? 'Pesan Kursi Baru' : 'Toko Tutup';

  // Customer database for search history lookup loaded dynamically from Supabase
  const [customerDatabase, setCustomerDatabase] = useState([]);

  // Day Selection and Barber Filter states
  const [currentDate, setCurrentDate] = useState('2024-05-03');
  const [viewMode, setViewMode] = useState('list');
  const [selectedBarber, setSelectedBarber] = useState('Semua');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([
    { 
      id: 'n1', 
      text: 'Sistem Barber Flow siap digunakan.', 
      time: '22:00', 
      unread: true 
    }
  ]);

  // Derived day and date display name
  const selectedDay = currentDate === '2024-05-03' ? 'hari_ini' : 'besok';
  const selectedDate = currentDate === '2024-05-03' ? 'Jumat, 3 Mei 2024' : 'Sabtu, 4 Mei 2024';

  // React State for Theme Management (Class-based Dark Mode)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme;
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Simpan activeMenu ke localStorage setiap kali berubah untuk persistensi navigasi halaman
  useEffect(() => {
    localStorage.setItem('activeMenu', activeMenu);
  }, [activeMenu]);





  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Gagal keluar dari Supabase Auth:', err);
    }
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    setUserRole('customer');
    setCurrentUser(null);
    navigate('/');
  };

  // Redirect barber role users to JADWAL ANTREAN page
  useEffect(() => {
    if (isAuthenticated && userRole === 'barber' && activeMenu !== 'JADWAL ANTREAN') {
      setActiveMenu('JADWAL ANTREAN');
    }
  }, [userRole, isAuthenticated, activeMenu]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Helper to add new notifications
  const handleAddNotification = (text) => {
    const newNotif = {
      id: 'notif-' + Date.now(),
      text,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      unread: true
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Mark all notifications as read
  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Shared State: Empty initial data, loaded dynamically from Supabase view daftar_antrian_ui
  const [dailyAppointments, setDailyAppointments] = useState({
    hari_ini: [],
    besok: []
  });

  // Helper to sort appointments by time and auto-align queue status
  function sortAndAlignAppointments(list) {
    return [...list].sort((a, b) => {
      // Treat isBreak as virtual '12:00' so it sorts correctly between morning and afternoon
      const timeA = a.isBreak ? '12:00' : a.time;
      const timeB = b.isBreak ? '12:00' : b.time;
      return new Date('1970/01/01 ' + timeA) - new Date('1970/01/01 ' + timeB);
    });
  }

  const handleChangeDay = (day) => {
    if (day === 'hari_ini') {
      setCurrentDate('2024-05-03');
    } else if (day === 'besok') {
      setCurrentDate('2024-05-04');
    }
  };

  // State Update Helper to maintain single source of truth
  const updateDailyAppointments = (updateFunction) => {
    setDailyAppointments((prev) => ({
      ...prev,
      [selectedDay]: updateFunction(prev[selectedDay])
    }));
  };

  // Active day selection
  const currentData = dailyAppointments[selectedDay];

  // Deriving the live queue for QueueList (left panel)
  // Mapping queueStatus to status to fit QueueList component specs
  const queue = currentData
    .filter(apt => !apt.isBreak)
    .map(apt => ({
      ...apt,
      status: apt.status || 'waiting'
    }));

  // Handle Search Input: Direct submit check-in to queue + notify
  const handleSearchSubmit = (customerName) => {
    if (!customerName.trim()) return;

    // Business Logic: Absolute Manual Override Validation
    if (!isStoreActive) {
      alert("Mohon maaf, pendaftaran ditolak. Toko sedang Tutup.");
      return;
    }
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const cleanName = customerName.trim();
    const newCode = '#HG-' + Math.floor(100 + Math.random() * 900);
    
    // Make new active appointment with status enabled
    const newApt = {
      id: 'apt-' + Date.now(),
      time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      period: hours < 12 ? 'Pagi' : 'Siang',
      customerName: cleanName,
      phone: '08xx-xxxx-xxxx',
      serviceName: 'Signature Cut & Wash',
      duration: '45 Menit',
      barberName: 'Rahardian',
      barberAvatar: getBarberAvatar('Rahardian'),
      code: newCode,
      status: 'waiting',
      timeLeft: null,
      bookingSource: 'Check-in Search',
      paymentMethod: 'Cash'
    };

    const updateFunction = (prev) => {
      const updatedList = [...prev, newApt];
      return sortAndAlignAppointments(updatedList);
    };

    updateDailyAppointments(updateFunction);

    handleAddNotification(`Pelanggan baru [${cleanName}] telah ditambahkan via Search.`);
  };

  // Call the next customer in queue
  const handleCallCustomer = async (customerId) => {
    try {
      const { error } = await supabase
        .from('transaksi_antrian')
        .update({ status: 'in_progress' })
        .eq('id', customerId);

      if (error) {
        throw new Error(error.message);
      }

      // Local notification feedback
      const appointment = dailyAppointments.hari_ini.find(a => a.id === customerId) || dailyAppointments.besok.find(a => a.id === customerId);
      if (appointment) {
        handleAddNotification(`${appointment.customerName} telah dipanggil ke kursi pelayanan.`);
      }

      fetchQueueAppointments();
    } catch (err) {
      console.error('Error calling customer:', err);
      alert('Gagal memanggil pelanggan: ' + err.message);
    }
  };

  // Complete the serving customer (Selesai & Bayar)
  const handleCompleteServing = async (customerId) => {
    try {
      const appointment = dailyAppointments.hari_ini.find(a => a.id === customerId) || dailyAppointments.besok.find(a => a.id === customerId);
      const totalAmount = appointment ? (appointment.totalPrice || 75000) : 75000;
      const paymentMethod = appointment ? (appointment.paymentMethod || 'Cash') : 'Cash';

      // (1) Mengubah status di transaksi_antrian menjadi 'completed'
      const { error: queueError } = await supabase
        .from('transaksi_antrian')
        .update({ status: 'completed' })
        .eq('id', customerId);

      if (queueError) {
        throw new Error(queueError.message);
      }

      // (2) Mengirim data pembayaran ke tabel transactions
      const { error: txError } = await supabase
        .from('transactions')
        .insert([
          {
            queue_id: customerId,
            amount_idr: totalAmount,
            payment_method: paymentMethod,
            status: 'success'
          }
        ]);

      if (txError) {
        throw new Error(txError.message);
      }

      if (appointment) {
        handleAddNotification(`${appointment.customerName} selesai dilayani & pembayaran dikonfirmasi.`);
      }

      fetchQueueAppointments();
    } catch (err) {
      console.error('Error completing serving:', err);
      alert('Gagal menyelesaikan layanan: ' + err.message);
    }
  };

  // Handle Drag End in QueueList: update active queue items positioning in shared state
  const handleReorderQueue = async (newQueueList) => {
    // Map status back to status to save correctly in source of truth
    const newQueueListMapped = newQueueList.map(item => ({
      ...item,
      status: item.status
    }));

    // OPTIMISTIC UPDATE: Update local state immediately so UI changes without waiting
    const updateFunction = (prevList) => {
      // Collect the original times and periods of queue items in their original order
      const originalTimeSlots = prevList
        .filter((item) => !item.isBreak)
        .map((item) => ({ time: item.time, period: item.period }));

      let queueIdx = 0;
      return prevList.map((item) => {
        if (!item.isBreak) {
          const newItem = { ...newQueueListMapped[queueIdx] };
          // Override time and period with the slot's original time and period
          if (originalTimeSlots[queueIdx]) {
            newItem.time = originalTimeSlots[queueIdx].time;
            newItem.period = originalTimeSlots[queueIdx].period;
          }
          queueIdx++;
          return newItem;
        }
        return item;
      });
    };

    updateDailyAppointments(updateFunction);

    // BACKGROUND SYNC: Skip updating order_index since transaksi_antrian table doesn't have order_index column
    try {
      const waitingItems = newQueueListMapped.filter(item => item.status === 'waiting');
      console.log('Skipping background queue order_index sync as transaksi_antrian does not have order_index.');
    } catch (err) {
      console.warn('Error syncing queue order_index to Supabase:', err);
    }
  };

  // Add new booking from Modal
  const handleSaveBooking = async (bookingData) => {
    if (!isStoreActive) {
      alert("Mohon maaf, pendaftaran ditolak. Toko sedang Tutup.");
      return false;
    }

    try {
      // Find barber ID from profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .eq('role', 'barber');

      const barber = profiles?.find(p => p.full_name === bookingData.barberName || p.username === bookingData.barberName);
      const barberId = barber ? barber.id : null;

      // Find service from services table
      const { data: dbServices } = await supabase
        .from('services')
        .select('id, name, price_idr, duration_minutes');
      
      const service = dbServices?.find(s => s.name === bookingData.serviceName);
      const serviceId = service ? service.id : 'sig-cut';
      const servicePrice = service ? service.price_idr : 75000;
      const serviceDuration = service ? service.duration_minutes : 45;

      const chosenServicesList = [{
        id: serviceId,
        name: bookingData.serviceName,
        price: servicePrice,
        duration: serviceDuration
      }];

      const datePart = bookingData.bookingDate === 'besok' 
        ? new Date(Date.now() + 86400000).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      const appointmentDateISO = new Date(`${datePart}T${bookingData.time}:00`).toISOString();

      const queueNumber = 'Q-' + Math.floor(1000 + Math.random() * 9000);

      // Insert to transaksi_antrian
      const { data: queueData, error: queueError } = await supabase
        .from('transaksi_antrian')
        .insert([
          {
            queue_number: queueNumber,
            customer_id: null,
            guest_name: bookingData.customerName,
            barber_id: barberId,
            service_id: serviceId,
            selected_services: chosenServicesList,
            total_price: servicePrice,
            appointment_date: appointmentDateISO,
            status: bookingData.addToQueue ? 'menunggu' : 'pending'
          }
        ])
        .select()
        .single();

      if (queueError) throw queueError;

      handleAddNotification(`Pemesanan baru atas nama [${bookingData.customerName}] sukses terdaftar.`);
      fetchQueueAppointments();
      return true;
    } catch (e) {
      console.error("Gagal menyimpan pemesanan:", e);
      alert("Gagal mendaftarkan pemesanan: " + e.message);
      return false;
    }
  };

  // QR Scan Success Handler
  const handleQRCheckIn = async (scannedText) => {
    if (!isStoreActive) {
      alert("Mohon maaf, pendaftaran ditolak. Toko sedang Tutup.");
      return false;
    }

    try {
      let queueId = null;

      if (scannedText) {
        const trimmed = scannedText.trim();
        if (trimmed.startsWith('{')) {
          const parsed = JSON.parse(trimmed);
          if (parsed.orderId) {
            const { data: tx } = await supabase
              .from('transactions')
              .select('queue_id')
              .eq('id', parsed.orderId)
              .maybeSingle();
            
            if (tx && tx.queue_id) {
              queueId = tx.queue_id;
            }
          }
        }
      }

      if (queueId) {
        const { error } = await supabase
          .from('transaksi_antrian')
          .update({ status: 'menunggu' })
          .eq('id', queueId);

        if (error) throw error;

        handleAddNotification(`Check-in QR sukses. Pelanggan telah masuk ke daftar tunggu.`);
        fetchQueueAppointments();
        setIsQRModalOpen(false);
        return true;
      } else {
        alert("Kode QR tidak valid atau antrean tidak ditemukan.");
        return false;
      }
    } catch (e) {
      console.error("Gagal melakukan check-in QR:", e);
      alert("Terjadi kesalahan check-in: " + e.message);
      return false;
    }
  };

  // Edit Appointment Handler
  const handleEditAppointment = (appointment) => {
    if (appointment.status === 'serving') {
      alert("Pelanggan yang sedang dilayani tidak dapat diedit!");
      return;
    }
    setEditingAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedApt) => {
    // Business Logic: Absolute Manual Override Validation
    if (!isStoreActive) {
      alert("Mohon maaf, perubahan ditolak. Toko sedang Tutup.");
      return;
    }

    if (updatedApt.status === 'serving') {
      alert("Pelanggan yang sedang dilayani tidak dapat diubah!");
      return;
    }

    const updateFunction = (prevList) => {
      const updatedList = prevList.map((apt) => {
        if (apt.id === updatedApt.id) {
          return {
            ...apt,
            ...updatedApt,
            barberAvatar: getBarberAvatar(updatedApt.barberName)
          };
        }
        return apt;
      });
      return sortAndAlignAppointments(updatedList);
    };

    updateDailyAppointments(updateFunction);

    handleAddNotification(`Perubahan janji temu Bpk/Ibu [${updatedApt.customerName}] berhasil disimpan.`);
    setIsEditModalOpen(false);
  };

  // Delete Appointment Handler
  const handleDeleteAppointment = (id) => {
    const apt = currentData.find((a) => a.id === id);
    if (!apt) return;

    if (apt.status === 'serving') {
      alert("Pelanggan yang sedang dilayani tidak dapat dihapus!");
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus janji temu atas nama Bpk/Ibu ${apt.customerName}?`)) {
      const updateFunction = (prevList) => {
        const filtered = prevList.filter((a) => a.id !== id);
        return sortAndAlignAppointments(filtered);
      };

      updateDailyAppointments(updateFunction);

      handleAddNotification(`Janji temu atas nama [${apt.customerName}] telah dihapus.`);
    }
  };

  const getBarberAvatar = (name) => {
    if (name === 'Gunawan') {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkajYKOu0Ol0SEAQC3uKHy3aiw0xWlaDYnFQNZxxtiF_-HCl388Hj4UQuJ382exaQGGT68Dn-4YqQN-7r3nv-CLhu8pfVHDL3UFWf47ajOicvispjVu54A7pCdx0zmjy8EV2yEEJVlrRcqGdZRdfteRiyFqkUIS_kEZ5e_eNCI4ZbF97Tho17JM-gCnMrkZTlvARBOdniCAHgVIdNBqBwBE39RhERrNnBA6DtrVDcgYisbD9EtvIIFrg0tqC3X8AKSjQSPykokwC6b';
    }
    if (name === 'Eko') {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv2C9Fo68RuvXOkMuVZ1b8i8B6aotSLGdHw2jU9aeE2m70y-Bo9bDWZhaljJnWltD48wS8NcnuIRSlY5iVMESAOpsEBtt8O6pg_RNicUmcUNwdCTKK4aWbZukkb9ssUeFAjH57UvBYydlKIUJAF-_JJlCO-AdfBWx_oEOIMRBAIZGb-ycTqWyrntqmkiAzvZzRE0SkmNXCQ57Kkg_ZKwAUj9sIO-zmAtjWlkzbcpqmLUt4wen5XZ7pjgBmyHM5ONOMvNoQixZvrOHa';
    }
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuALgYW6D-zh1ruvvw2PX4HQeP1F5rJXwbSV2WV-8tsaBVgb_do2kM2WkGuN-ccE_MkPZe0u8iSK-JdewUf07W-yBu_lWBtDN45DRDt5ldM-VtVQolmGcayqq-qkcwqVmD559hm3ABMhrSA2VfAh68ZkzgmXNhYiyKB-CBNP9BO0EwF7q2ohCMRGxBy-ISJXi_0nDLijxXql_iEhbZBWqAmQAiAewT4kh3gIDGlxi-UgjLuWd7zYQILN0mkC9za7TdKXQthc-jGBB7tJ';
  };

  // Perform dynamic filtering based on selected Barber on currentData
  const filteredAppointments = selectedBarber === 'Semua' 
    ? currentData 
    : currentData.filter(item => item.isBreak || item.barberName === selectedBarber);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF9EC] dark:bg-[#26170c] text-[#26170C] dark:text-[#faf3e0]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Memuat Sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root url / is the Customer Booking Portal (Unified Landing Page) */}
      <Route 
        path="/" 
        element={
          isAuthenticated && (userRole === 'admin' || userRole === 'barber') ? (
            <Navigate to="/admin-dashboard" replace />
          ) : (
            <CustomerBookingPortal 
              isAuthenticated={isAuthenticated}
              user={currentUser}
              onLogout={handleLogout}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          )
        } 
      />

      {/* Admin Panel Route */}
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole}>
            <div className="flex w-full max-w-[100vw] overflow-x-hidden bg-[#FFF9EC] dark:bg-[#26170c] text-[#26170C] dark:text-[#faf3e0] min-h-screen font-body antialiased transition-colors duration-200">
              {/* Sidebar Navigation */}
              <Sidebar 
                isOpen={isMobileSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
                onOpenBookingModal={() => setIsBookingModalOpen(true)}
                currentTab={activeMenu}
                onChangeTab={setActiveMenu}
                isClosed={isClosed}
                storeStatusLabel={storeStatusLabel}
                onLogout={handleLogout}
                userRole={userRole}
              />

              {/* Main Layout Area */}
              <div className="flex-1 w-full max-w-full overflow-x-hidden md:ml-64 flex flex-col min-h-screen bg-[#FFF9EC] dark:bg-[#26170c] pb-24 md:pb-0 transition-colors duration-200">
                {/* Top Header Bar */}
                <Header 
                  onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
                  theme={theme}
                  onToggleTheme={toggleTheme}
                  notifications={notifications}
                  customerDatabase={customerDatabase}
                  onMarkNotificationsRead={handleMarkNotificationsRead}
                  onOpenStoreProfile={() => setIsStoreProfileModalOpen(true)}
                  onLogout={handleLogout}
                  userRole={userRole}
                />

                {/* Page Content */}
                {activeMenu === 'JADWAL ANTREAN' ? (
                  <main className="p-6 md:p-8 flex-1 bg-[#FFF9EC] dark:bg-[#26170c] transition-colors duration-200">
                    {/* Title Section */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6 animate-fade-in">
                      <div>
                        <h2 className="text-4xl font-headline italic text-[#26170c] dark:text-[#faf3e0] leading-tight">
                          Jadwal &amp; Antrean Real-time
                        </h2>
                        <p className="text-[#26170C]/70 dark:text-[#faf3e0]/70 mt-2 max-w-lg">
                          Kelola setiap detak layanan hari ini. Pastikan tradisi ketepatan waktu tetap terjaga di Heritage Grooming.
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {/* List vs Calendar View Toggle */}
                        <div className="bg-[#efe8d5] dark:bg-[#26170C] p-1 flex rounded-lg border border-[#d2c4bc]/20 dark:border-white/5">
                          <button 
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded shadow-sm text-sm font-semibold transition-colors ${
                              viewMode === 'list'
                                ? 'bg-[#26170c] dark:bg-[#faf3e0] text-[#FFF9EC] dark:text-[#26170c]'
                                : 'text-[#26170C] dark:text-[#faf3e0] hover:bg-[#e9e2d0] dark:hover:bg-[#26170c]'
                            }`}
                          >
                            List View
                          </button>
                          <button 
                            onClick={() => setViewMode('calendar')}
                            className={`px-4 py-2 rounded shadow-sm text-sm font-semibold transition-colors ${
                              viewMode === 'calendar'
                                ? 'bg-[#26170c] dark:bg-[#faf3e0] text-[#FFF9EC] dark:text-[#26170c]'
                                : 'text-[#26170C] dark:text-[#faf3e0] hover:bg-[#e9e2d0] dark:hover:bg-[#26170c]'
                            }`}
                          >
                            Jadwal
                          </button>
                        </div>

                        {/* Filter Barber Dropdown */}
                        <div className="relative">
                          <button 
                            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                            className="bg-[#e9e2d0] dark:bg-[#26170C] text-[#26170c] dark:text-[#faf3e0] px-5 py-2.5 rounded-lg text-sm font-bold flex items-center border border-[#81756e]/10 dark:border-white/10 transition-colors focus:outline-none"
                          >
                            <span className="material-symbols-outlined mr-2">filter_list</span>
                            Barber: {selectedBarber}
                          </button>

                          {isFilterDropdownOpen && (
                            <>
                              {/* Close overlay */}
                              <div className="fixed inset-0 z-40" onClick={() => setIsFilterDropdownOpen(false)} />
                              
                              <div className="absolute right-0 mt-2 w-48 bg-[#FFF9EC] dark:bg-[#26170C] border border-[#d2c4bc]/60 dark:border-white/10 rounded-xl shadow-xl py-1 z-50 animate-fade-in">
                                {['Semua', 'Rahardian', 'Gunawan', 'Eko'].map((barber) => (
                                  <button
                                    key={barber}
                                    onClick={() => {
                                      setSelectedBarber(barber);
                                      setIsFilterDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-[#efe8d5] dark:hover:bg-[#3d2b1f] transition-colors ${
                                      selectedBarber === barber ? 'text-[#944925] font-bold' : 'text-[#26170c] dark:text-[#faf3e0]'
                                    }`}
                                  >
                                    {barber}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Manual Open Booking Modal */}
                        <button 
                          onClick={() => !isClosed && setIsBookingModalOpen(true)}
                          disabled={isClosed}
                          className={`px-5 py-2.5 rounded-lg text-sm font-bold tracking-wider flex items-center transition-all ${
                            isClosed
                              ? 'bg-[#d2c4bc]/50 text-[#26170c]/40 cursor-not-allowed shadow-none'
                              : 'bg-[#944925] hover:bg-[#773310] text-white active:scale-95 shadow-md'
                          }`}
                        >
                          <span className="material-symbols-outlined mr-2">add_circle</span>
                          Pemesanan
                        </button>
                      </div>
                    </div>

                    {/* Main List view or calendar view */}
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mx-auto max-w-7xl w-full animate-fade-in items-start">
                      {/* Left Column (Antrean Berjalan) - Visible on mobile when viewMode is 'list', always on desktop */}
                      <div className={`w-full lg:w-2/5 ${viewMode === 'list' ? 'block' : 'hidden lg:block'}`}>
                        <QueueList 
                          queue={filteredAppointments}
                          onCallCustomer={handleCallCustomer}
                          onReorderQueue={handleReorderQueue}
                          onOpenQRModal={() => setIsQRModalOpen(true)}
                          onCompleteServing={handleCompleteServing}
                        />
                      </div>

                      {/* Right Column (Jadwal/Timeline) - Visible on mobile when viewMode is 'calendar', always on desktop */}
                      <div className={`w-full lg:w-3/5 ${viewMode === 'calendar' ? 'block' : 'hidden lg:block'}`}>
                        <Schedule 
                          appointments={filteredAppointments}
                          viewMode={viewMode}
                          selectedDay={selectedDay}
                          onChangeDay={handleChangeDay}
                          onEditAppointment={handleEditAppointment}
                          onDeleteAppointment={handleDeleteAppointment}
                          onOpenBookingModal={() => setIsBookingModalOpen(true)}
                          selectedBarber={selectedBarber}
                          onChangeBarber={setSelectedBarber}
                          setViewMode={setViewMode}
                          openTime={openTime}
                          closeTime={closeTime}
                        />
                      </div>
                    </div>
                  </main>
                ) : activeMenu === 'DASHBOARD' ? (
                  <Dashboard 
                    appointments={dailyAppointments[selectedDay] || []}
                    onCompleteServing={handleCompleteServing}
                    onEditAppointment={handleEditAppointment}
                    selectedDate={selectedDay}
                    currentDate={selectedDay}
                  />
                ) : activeMenu === 'laporan' ? (
                  <FinancialReport />
                ) : activeMenu === 'barber' ? (
                  <DataBarber />
                ) : activeMenu === 'layanan' ? (
                  <Services />
                ) : (
                  <main className="p-8 flex-1 flex flex-col items-center justify-center text-center bg-[#FFF9EC] dark:bg-[#26170c] transition-colors duration-200">
                    <span className="material-symbols-outlined text-6xl text-[#81756e] dark:text-[#faf3e0]/60 mb-4">construction</span>
                    <h3 className="text-2xl font-headline italic text-[#26170c] dark:text-[#faf3e0]">Halaman Sedang Dibuat</h3>
                    <p className="text-[#26170C]/70 dark:text-[#faf3e0]/70 mt-2 max-w-sm">
                      Halaman "{activeMenu}" sedang dalam tahap pengembangan integrasi database.
                    </p>
                  </main>
                )}

                {/* Footer */}
                <footer className="w-full py-4 mt-auto border-t border-[#26170c]/5 dark:border-white/5 bg-[#FFF9EC] dark:bg-[#26170c] flex flex-col sm:flex-row justify-between items-center px-8 gap-4 transition-colors duration-200">
                  <p className="font-sans text-[10px] tracking-normal text-[#3d2b1f] dark:text-[#faf3e0]/60 opacity-60 text-center sm:text-left">
                    © 2024 Heritage Grooming Indonesia. Crafted for Tradition.
                  </p>
                  <div className="flex space-x-6">
                    <a href="#" className="font-sans text-[10px] tracking-normal text-[#3d2b1f]/60 dark:text-[#faf3e0]/40 hover:text-[#944925] dark:hover:text-[#ffb596] transition-colors">Kebijakan Privasi</a>
                    <a href="#" className="font-sans text-[10px] tracking-normal text-[#3d2b1f]/60 dark:text-[#faf3e0]/40 hover:text-[#944925] dark:hover:text-[#ffb596] transition-colors">Syarat &amp; Ketentuan</a>
                  </div>
                </footer>
              </div>

              {/* Floating Action Button (FAB) on Desktop (Admin/Staff only) */}
              <button 
                onClick={() => !isClosed && setIsQRModalOpen(true)}
                disabled={isClosed}
                title={isClosed ? storeStatusLabel : "Scan QR Pelanggan"}
                className={`hidden md:flex fixed bottom-8 right-8 w-14 h-14 rounded-full items-center justify-center shadow-[0_8px_32px_rgba(30,28,16,0.25)] transition-all z-45 duration-150 ${
                  isClosed
                    ? 'bg-[#d2c4bc]/50 dark:bg-white/10 text-[#26170c]/40 dark:text-[#faf3e0]/30 cursor-not-allowed'
                    : 'bg-[#2b1810] hover:bg-[#3d2b1f] text-white hover:scale-105 active:scale-95'
                }`}
              >
                {isClosed ? (
                  <span className="material-symbols-outlined text-2xl">lock</span>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                    <rect x="7" y="7" width="10" height="10" rx="1" />
                  </svg>
                )}
              </button>

              {/* Modals and Overlays */}
              <BookingModal 
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                onSave={handleSaveBooking}
                openTime={openTime}
                closeTime={closeTime}
              />

              <EditModal 
                isOpen={isEditModalOpen}
                appointment={editingAppointment}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveEdit}
                onDelete={handleDeleteAppointment}
              />

              <QRScannerModal 
                isOpen={isQRModalOpen}
                onClose={() => setIsQRModalOpen(false)}
                onScanSuccess={handleQRCheckIn}
                isClosed={isClosed}
                storeStatusLabel={storeStatusLabel}
              />

              <StoreProfileModal 
                isOpen={isStoreProfileModalOpen}
                onClose={() => setIsStoreProfileModalOpen(false)}
                isStoreActive={isStoreActive}
                onToggleStoreActive={handleToggleStoreActive}
                isAutoMode={isAutoMode}
                onToggleAutoMode={handleToggleAutoMode}
                userRole={userRole}
                openTime={openTime}
                closeTime={closeTime}
                onSaveHours={handleSaveHours}
              />

              {/* Mobile Bottom Navigation (Admin/Staff only) */}
              {isAuthenticated && userRole !== 'customer' && (
                <div className="fixed bottom-0 left-0 right-0 w-full z-[60] bg-white dark:bg-[#26170c] border-t border-[#26170c]/10 dark:border-white/10 md:hidden grid grid-cols-5 items-center py-2 shadow-lg transition-colors duration-200 animate-slide-up">
                  {/* Floating QR Scanner Button (Top Right Aligned) */}
                  <button 
                    type="button"
                    onClick={() => setIsQRModalOpen(true)}
                    className="absolute right-4 -top-14 z-50 w-14 h-14 bg-[#2b1810] dark:bg-[#faf3e0] text-white dark:text-[#2b1810] rounded-xl flex items-center justify-center border-4 border-[#FDFBF7] dark:border-[#26170c] shadow-lg active:scale-95 transition-transform"
                    title="Scan QR Code"
                  >
                    <span className="material-symbols-outlined text-2xl font-bold">qr_code_scanner</span>
                  </button>

                  {/* Slot 1: Dashboard */}
                  {userRole === 'admin' ? (
                    <button 
                      onClick={() => setActiveMenu('DASHBOARD')}
                      className="flex flex-col items-center py-1 w-full text-center transition-colors"
                    >
                      <span className={`material-symbols-outlined text-2xl mb-0.5 transition-colors ${
                        activeMenu === 'DASHBOARD' ? 'text-[#26170c] dark:text-[#faf3e0]' : 'text-red-500'
                      }`}>dashboard</span>
                      <span className={`text-[9px] uppercase tracking-wider font-sans font-semibold transition-colors ${
                        activeMenu === 'DASHBOARD' ? 'text-[#26170c] dark:text-[#faf3e0] font-bold' : 'text-red-500'
                      }`}>Dashboard</span>
                    </button>
                  ) : (
                    <div className="w-full" />
                  )}

                  {/* Slot 2: Jadwal */}
                  <button 
                    onClick={() => setActiveMenu('JADWAL ANTREAN')}
                    className="flex flex-col items-center py-1 w-full text-center transition-colors"
                  >
                    <span className={`material-symbols-outlined text-2xl mb-0.5 transition-colors ${
                      activeMenu === 'JADWAL ANTREAN' ? 'text-[#26170c] dark:text-[#faf3e0]' : 'text-blue-500'
                    }`}>calendar_month</span>
                    <span className={`text-[9px] uppercase tracking-wider font-sans font-semibold transition-colors ${
                      activeMenu === 'JADWAL ANTREAN' ? 'text-[#26170c] dark:text-[#faf3e0] font-bold' : 'text-blue-500'
                    }`}>Jadwal</span>
                  </button>

                  {/* Slot 3: Barber */}
                  {userRole === 'admin' ? (
                    <button 
                      onClick={() => setActiveMenu('barber')}
                      className="flex flex-col items-center py-1 w-full text-center transition-colors"
                    >
                      <span className={`material-symbols-outlined text-2xl mb-0.5 transition-colors ${
                        activeMenu === 'barber' ? 'text-[#26170c] dark:text-[#faf3e0]' : 'text-amber-500'
                      }`}>content_cut</span>
                      <span className={`text-[9px] uppercase tracking-wider font-sans font-semibold transition-colors ${
                        activeMenu === 'barber' ? 'text-[#26170c] dark:text-[#faf3e0] font-bold' : 'text-amber-500'
                      }`}>Barber</span>
                    </button>
                  ) : (
                    <div className="w-full" />
                  )}

                  {/* Slot 4: Layanan */}
                  {userRole === 'admin' ? (
                    <button 
                      onClick={() => setActiveMenu('layanan')}
                      className="flex flex-col items-center py-1 w-full text-center transition-colors"
                    >
                      <span className={`material-symbols-outlined text-2xl mb-0.5 transition-colors ${
                        activeMenu === 'layanan' ? 'text-[#26170c] dark:text-[#faf3e0]' : 'text-purple-500'
                      }`}>dry_cleaning</span>
                      <span className={`text-[9px] uppercase tracking-wider font-sans font-semibold transition-colors ${
                        activeMenu === 'layanan' ? 'text-[#26170c] dark:text-[#faf3e0] font-bold' : 'text-purple-500'
                      }`}>Layanan</span>
                    </button>
                  ) : (
                    <div className="w-full" />
                  )}

                  {/* Slot 5: Keuangan */}
                  {userRole === 'admin' ? (
                    <button 
                      onClick={() => setActiveMenu('laporan')}
                      className="flex flex-col items-center py-1 w-full text-center transition-colors"
                    >
                      <span className={`material-symbols-outlined text-2xl mb-0.5 transition-colors ${
                        activeMenu === 'laporan' ? 'text-[#26170c] dark:text-[#faf3e0]' : 'text-emerald-500'
                      }`}>payments</span>
                      <span className={`text-[9px] uppercase tracking-wider font-sans font-semibold transition-colors ${
                        activeMenu === 'laporan' ? 'text-[#26170c] dark:text-[#faf3e0] font-bold' : 'text-emerald-500'
                      }`}>Keuangan</span>
                    </button>
                  ) : (
                    <div className="w-full" />
                  )}
                </div>
              )}
            </div>
          </ProtectedRoute>
        } 
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
