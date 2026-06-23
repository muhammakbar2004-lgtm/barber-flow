import React, { useState, useEffect, useMemo } from 'react';
import heritageBookingBanner from '../assets/heritage_booking_banner.png';
import Register from './Register';
import { supabase } from '../config/supabase';
import { QRCodeSVG } from 'qrcode.react';

const getBarberAvatar = (name = '') => {
  const clean = name.toLowerCase();
  if (clean.includes('gunawan')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkajYKOu0Ol0SEAQC3uKHy3aiw0xWlaDYnFQNZxxtiF_-HCl388Hj4UQuJ382exaQGGT68Dn-4YqQN-7r3nv-CLhu8pfVHDL3UFWf47ajOicvispjVu54A7pCdx0zmjy8EV2yEEJVlrRcqGdZRdfteRiyFqkUIS_kEZ5e_eNCI4ZbF97Tho17JM-gCnMrkZTlvARBOdniCAHgVIdNBqBwBE39RhERrNnBA6DtrVDcgYisbD9EtvIIFrg0tqC3X8AKSjQSPykokwC6b';
  }
  if (clean.includes('eko')) {
    return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv2C9Fo68RuvXOkMuVZ1b8i8B6aotSLGdHw2jU9aeE2m70y-Bo9bDWZhaljJnWltD48wS8NcnuIRSlY5iVMESAOpsEBtt8O6pg_RNicUmcUNwdCTKK4aWbZukkb9ssUeFAjH57UvBYydlKIUJAF-_JJlCO-AdfBWx_oEOIMRBAIZGb-ycTqWyrntqmkiAzvZzRE0SkmNXCQ57Kkg_ZKwAUj9sIO-zmAtjWlkzbcpqmLUt4wen5XZ7pjgBmyHM5ONOMvNoQixZvrOHa';
  }
  return 'https://lh3.googleusercontent.com/aida-public/AB6AXuALgYW6D-zh1ruvvw2PX4HQeP1F5rJXwbSV2WV-8tsaBVgb_do2kM2WkGuN-ccE_MkPZe0u8iSK-JdewUf07W-yBu_lWBtDN45DRDt5ldM-VtVQolmGcayqq-qkcwqVmD559hm3ABMhrSA2VfAh68ZkzgmXNhYiyKB-CBNP9BO0EwF7q2ohCMRGxBy-ISJXi_0nDLijxXql_iEhbZBWqAmQAiAewT4kh3gIDGlxi-UgjLuWd7zYQILN0mkC9za7TdKXQthc-jGBB7tJ';
};


export default function CustomerBookingPortal({ isAuthenticated, user, onLogout, theme, onToggleTheme }) {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [waNotifications, setWaNotifications] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching services:', error);
          loadFallbackServices();
        } else if (data && data.length > 0) {
          const mapped = data.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.price_idr,
            duration: `${s.duration_minutes} MENIT`,
            description: s.description || '',
            tag: s.id.includes('heritage') || s.name.toLowerCase().includes('heritage') ? 'FAVORIT' : undefined,
            package_items: s.package_items || [],
            category: s.category || ''
          }));
          setServices(mapped);
        } else {
          loadFallbackServices();
        }
      } catch (err) {
        console.error('Unexpected error fetching services:', err);
        loadFallbackServices();
      }
    };

    const loadFallbackServices = () => {
      const mappedFallback = [
        {
          id: 'sig-cut',
          name: 'Signature Cut',
          price: 75000,
          duration: '45 MENIT',
          description: 'Potongan rambut klasik dengan konsultasi gaya, pembersihan leher, dan styling premium.'
        },
        {
          id: 'hot-shave',
          name: 'Royal Hot Towel Shave',
          price: 60000,
          duration: '30 MENIT',
          description: 'Pengalaman mencukur tradisional menggunakan pisau lurus, handuk hangat, dan pijat wajah.'
        },
        {
          id: 'her-ritual',
          name: 'The Heritage Ritual',
          price: 150000,
          duration: '90 MENIT',
          description: 'Paket lengkap: Signature Cut, Hot Towel Shave, Head Massage, dan hair wash.',
          tag: 'FAVORIT'
        },
        {
          id: 'hair-detox',
          name: 'Hair Detox & Wash',
          price: 40000,
          duration: '15 MENIT',
          description: 'Pembersihan mendalam untuk kulit kepala, menghilangkan residu produk dan ketombe.'
        }
      ];
      setServices(mappedFallback);
    };

    fetchServices();
  }, []);

  // Helper to render service description dynamically for packages
  const renderServiceDescription = (service, masterServices = services) => {
    const isPackage = service.service_type === 'package' || 
                      (service.package_items && service.package_items.length > 0) || 
                      (service.category && service.category.toLowerCase() === 'paket');
                      
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

  // Helper to determine if a service card should be disabled due to mutual exclusivity between packages and child services
  const isItemDisabled = (item) => {
    // If the item itself is already selected, don't disable it (otherwise the user cannot deselect it!)
    if (selectedServices.includes(item.id)) return false;

    const isPackage = (item.package_items && Array.isArray(item.package_items) && item.package_items.length > 0) || 
                      (item.category && item.category.toLowerCase() === 'paket');

    if (isPackage) {
      // Loop through package items. If any child service is already selected, disable this package.
      const items = item.package_items || [];
      return items.some(itemId => selectedServices.includes(itemId));
    } else {
      // Check if selectedServices contains any selected package that contains this individual service.
      return services.some(s => {
        const isSelectedPackage = selectedServices.includes(s.id) && s.package_items && Array.isArray(s.package_items);
        return isSelectedPackage && s.package_items.includes(item.id);
      });
    }
  };
  
  // Login Form States inside Sidebar
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Settings Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Payment Success States
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [completedOrderTotal, setCompletedOrderTotal] = useState(0);

  // Booking Form States
  const [barbersList, setBarbersList] = useState([]);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('09:00');
  const [selectedBarberId, setSelectedBarberId] = useState('');
  const [activeBooking, setActiveBooking] = useState(null);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('17:30');

  // Fetch active booking and subscribe to updates
  useEffect(() => {
    let authUser = null;
    let subscription = null;

    const fetchActiveBooking = async (customerId) => {
      try {
        const { data, error } = await supabase
          .from('transaksi_antrian')
          .select('*, profiles!barber_id(full_name, username)')
          .eq('customer_id', customerId)
          .in('status', ['pending', 'paid', 'menunggu', 'in_progress'])
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching active booking:', error);
          return;
        }

        if (data && data.length > 0) {
          const booking = data[0];
          setActiveBooking(booking);

          // Hitung berapa antrean di depan
          const bookingDateStr = booking.appointment_date.split('T')[0];
          const { data: allActive, error: queueError } = await supabase
            .from('transaksi_antrian')
            .select('id, status, appointment_date, created_at')
            .in('status', ['paid', 'menunggu', 'in_progress'])
            .gte('appointment_date', `${bookingDateStr}T00:00:00`)
            .lte('appointment_date', `${bookingDateStr}T23:59:59`);

          if (!queueError && allActive) {
            const sorted = allActive.sort((a, b) => {
              const dateA = new Date(a.appointment_date);
              const dateB = new Date(b.appointment_date);
              if (dateA.getTime() !== dateB.getTime()) {
                return dateA - dateB;
              }
              return new Date(a.created_at) - new Date(b.created_at);
            });

            const myIndex = sorted.findIndex(item => item.id === booking.id);
            if (myIndex !== -1) {
              setPeopleAhead(myIndex);
            } else {
              setPeopleAhead(sorted.length);
            }
          }
        } else {
          setActiveBooking(null);
        }
      } catch (err) {
        console.error('Error in fetchActiveBooking:', err);
      }
    };

    const setupActiveBooking = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        authUser = currentUser;
        if (!authUser) {
          setActiveBooking(null);
          return;
        }

        await fetchActiveBooking(authUser.id);

        subscription = supabase
          .channel(`customer_queue_${authUser.id}`)
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'transaksi_antrian',
            filter: `customer_id=eq.${authUser.id}`
          }, async (payload) => {
            console.log('Perubahan antrean customer terdeteksi:', payload);
            await fetchActiveBooking(authUser.id);
          })
          .subscribe();

      } catch (err) {
        console.error('Error setting up active booking subscription:', err);
      }
    };

    if (isAuthenticated) {
      setupActiveBooking();
    } else {
      setActiveBooking(null);
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [isAuthenticated]);

  // Fetch booked times for the selected date and barber
  useEffect(() => {
    const fetchBookedTimes = async () => {
      if (!bookingDate || !selectedBarberId) return;
      try {
        const { data, error } = await supabase
          .from('transaksi_antrian')
          .select('appointment_date')
          .eq('barber_id', selectedBarberId)
          .in('status', ['paid', 'menunggu', 'in_progress'])
          .gte('appointment_date', `${bookingDate}T00:00:00`)
          .lte('appointment_date', `${bookingDate}T23:59:59`);

        if (!error && data) {
          const times = data.map(item => {
            const dateObj = new Date(item.appointment_date);
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
          });
          setBookedTimes(times);
        }
      } catch (err) {
        console.error('Error fetching booked times:', err);
      }
    };
    fetchBookedTimes();
  }, [bookingDate, selectedBarberId]);

  // Auto-select first available time slot if selected slot becomes booked
  useEffect(() => {
    const allSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
    if (bookedTimes.includes(bookingTime)) {
      const firstAvailable = allSlots.find(t => !bookedTimes.includes(t));
      if (firstAvailable) {
        setBookingTime(firstAvailable);
      }
    }
  }, [bookedTimes, bookingTime]);

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, full_name, tier_level')
          .eq('role', 'barber');
        if (!error && data) {
          setBarbersList(data);
          if (data.length > 0) {
            setSelectedBarberId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching barbers:', err);
      }
    };
    fetchBarbers();
  }, []);

  // Fetch store open/close hours from Supabase
  useEffect(() => {
    const fetchStoreHours = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('open_time, close_time')
          .eq('id', 'main_store')
          .single();
        if (!error && data) {
          const fetchedOpen = data.open_time ? data.open_time.substring(0, 5) : '09:00';
          const fetchedClose = data.close_time ? data.close_time.substring(0, 5) : '17:30';
          setOpenTime(fetchedOpen);
          setCloseTime(fetchedClose);
          setBookingTime(fetchedOpen);
        }
      } catch (err) {
        console.error('Error fetching store hours:', err);
      }
    };
    fetchStoreHours();
  }, []);

  useEffect(() => {
    if (isSettingsOpen) {
      const loadProfile = async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            const { data, error } = await supabase
              .from('profiles')
              .select('full_name, username')
              .eq('id', authUser.id)
              .single();
            if (!error && data) {
              setNewFullName(data.full_name || '');
              setNewUsername(data.username || '');
            }
          }
        } catch (err) {
          console.error('Error fetching profile for settings:', err);
        }
      };
      loadProfile();
    }
  }, [isSettingsOpen]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    if (!newUsername.trim() || !newEmail.trim()) {
      setSettingsError('Username dan Email wajib diisi.');
      return;
    }

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setSettingsError('Password baru dan konfirmasi tidak cocok.');
        return;
      }
      if (newPassword.length < 6) {
        setSettingsError('Password minimal harus 6 karakter.');
        return;
      }
    }

    setLoadingSettings(true);
    try {
      // 1. Get current authenticated user
      const { data: { user: authUser }, error: getUserError } = await supabase.auth.getUser();
      if (getUserError || !authUser) {
        setSettingsError('Gagal memvalidasi sesi pengguna.');
        setLoadingSettings(false);
        return;
      }

      // 2. Update email and password if requested
      const updates = {};
      if (newEmail !== authUser.email) {
        updates.email = newEmail;
      }
      if (newPassword) {
        updates.password = newPassword;
      }

      if (Object.keys(updates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(updates);
        if (authError) {
          setSettingsError(authError.message);
          setLoadingSettings(false);
          return;
        }
      }

      // 3. Update profiles table for username and full_name
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          username: newUsername,
          full_name: newFullName
        })
        .eq('id', authUser.id);

      if (profileError) {
        setSettingsError(profileError.message);
        setLoadingSettings(false);
        return;
      }

      // 4. Update local storage to reflect changes immediately
      localStorage.setItem('userName', newFullName || newUsername);
      localStorage.setItem('userEmail', newEmail);

      setSettingsSuccess('Profil berhasil diperbarui!');
      setNewPassword('');
      setConfirmPassword('');
      
      // Auto close after 1.5 seconds and reload page
      setTimeout(() => {
        setIsSettingsOpen(false);
        setSettingsSuccess('');
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.error('Error updating profile:', err);
      setSettingsError('Terjadi kesalahan saat memperbarui profil.');
    } finally {
      setLoadingSettings(false);
    }
  };

  // Toggle service selection
  const handleToggleService = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  // Calculate total price
  const totalPrice = services.filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  // Memoized order items with package items mapped from the masterServices list
  const orderItems = useMemo(() => {
    const activeServicesList = services.filter(s => selectedServices.includes(s.id));

    return activeServicesList.map(service => {
      const packageItemsNames = (service.package_items && Array.isArray(service.package_items))
        ? service.package_items
            .map(itemId => {
              const matched = services.find(s => s.id === itemId);
              return matched ? matched.name : null;
            })
            .filter(Boolean)
        : [];

      return {
        ...service,
        packageItemsNames
      };
    });
  }, [services, selectedServices]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!identifier.trim() || !password.trim()) {
      setLoginError('Harap isi semua bidang.');
      return;
    }

    setLoading(true);
    try {
      // Logika Pengecekan Input (Email vs Username)
      let finalLoginEmail = identifier.trim();

      if (!identifier.includes('@')) {
        // Logika fetch email berdasarkan username dengan .ilike()
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('email')
          .ilike('username', identifier.trim())
          .single();

        if (fetchError || !data || !data.email) {
          setLoginError('Username tidak ditemukan.');
          setLoading(false);
          return;
        }

        finalLoginEmail = data.email; // Assign email dari database
      }

      // Eksekusi Login Final via Supabase Auth
      console.log("Eksekusi login untuk email:", finalLoginEmail);
      const { error } = await supabase.auth.signInWithPassword({
        email: finalLoginEmail,
        password
      });

      if (error) {
        setLoginError(error.message || 'Email atau password salah.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setLoginError('Terjadi kesalahan saat masuk.');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (e) => {
    const val = e.target.value;
    if (!val) return;

    // Bulatkan ke kelipatan 30 menit terdekat
    const [h, m] = val.split(':').map(Number);
    const totalMinutes = h * 60 + m;
    const roundedMinutes = Math.round(totalMinutes / 30) * 30;
    const newH = Math.floor(roundedMinutes / 60);
    const newM = roundedMinutes % 60;
    const finalH = newH >= 24 ? 0 : newH;
    const formattedTime = `${String(finalH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;

    // Validasi batas jam buka dan tutup
    if (formattedTime < openTime) {
      alert(`Mohon maaf, jam layanan belum buka. Jam buka: ${openTime}`);
      setBookingTime(openTime);
      return;
    }
    if (formattedTime > closeTime) {
      alert(`Mohon maaf, jam layanan sudah tutup. Jam tutup: ${closeTime}`);
      setBookingTime(closeTime);
      return;
    }

    // Cek jika slot waktu tersebut sudah dipesan
    if (bookedTimes.includes(formattedTime)) {
      alert(`Waktu ${formattedTime} sudah dipesan. Silakan pilih waktu lain.`);
      return;
    }

    setBookingTime(formattedTime);
  };

  const handleCheckout = async () => {
    if (selectedServices.length === 0) {
      alert('Silakan pilih minimal satu layanan terlebih dahulu.');
      return;
    }
    if (!selectedBarberId) {
      alert('Silakan pilih Barber terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      // Auth Check: Ambil user.id dari session Supabase saat ini. Jika belum login, arahkan ke login/tampilkan alert.
      if (!authUser) {
        alert('Silakan masuk (login) terlebih dahulu menggunakan tombol di kolom kanan untuk melanjutkan pemesanan.');
        // Scroll to login card on sidebar
        const sidebar = document.getElementById('sidebar-login-card');
        if (sidebar) {
          sidebar.scrollIntoView({ behavior: 'smooth' });
        }
        setLoading(false);
        return;
      }

      const totalAmount = totalPrice;
      const serviceId = selectedServices[0];
      const customerId = authUser.id?.trim();
      const barberId = selectedBarberId?.trim();

      // Validate UUID strings
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!customerId || !uuidRegex.test(customerId)) {
        throw new Error('ID Pelanggan tidak valid (harus berupa UUID string).');
      }
      if (!barberId || !uuidRegex.test(barberId)) {
        throw new Error('ID Barber tidak valid (harus berupa UUID string).');
      }

      // Generate Queue Number: prefix Q- + 4 digit angka acak
      const queueNumber = 'Q-' + Math.floor(1000 + Math.random() * 9000);

      // Combine bookingDate & bookingTime into ISO string
      const appointmentDateISO = new Date(`${bookingDate}T${bookingTime}:00`).toISOString();

      // Check if store is active
      const { data: storeSettings, error: storeError } = await supabase
        .from('store_settings')
        .select('is_active')
        .single();
      
      if (!storeError && storeSettings && !storeSettings.is_active) {
        alert('Mohon maaf, pendaftaran ditolak. Toko sedang Tutup.');
        setLoading(false);
        return;
      }

      // Check if time slot is already booked for this barber on this day
      const { data: existingBooking, error: checkError } = await supabase
        .from('transaksi_antrian')
        .select('id')
        .eq('barber_id', barberId)
        .eq('appointment_date', appointmentDateISO)
        .in('status', ['paid', 'menunggu', 'in_progress'])
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      if (existingBooking && existingBooking.length > 0) {
        alert('Mohon maaf, slot waktu tersebut baru saja dipesan oleh pelanggan lain. Silakan pilih waktu atau barber lainnya.');
        setLoading(false);
        return;
      }

      // Selected services formatted as JSON array of objects
      const chosenServicesList = services
        .filter(s => selectedServices.includes(s.id))
        .map(s => ({
          id: s.id,
          name: s.name,
          price: s.price,
          duration: s.duration
        }));

      // Langkah 1 (Insert Pending Antrean)
      const { data: queueData, error: queueError } = await supabase
        .from('transaksi_antrian')
        .insert([
          {
            queue_number: queueNumber,
            customer_id: customerId,
            barber_id: barberId,
            service_id: serviceId, // Maintain for compatibility
            selected_services: chosenServicesList,
            total_price: totalAmount,
            appointment_date: appointmentDateISO,
            status: 'pending' // Insert status as 'pending'
          }
        ])
        .select()
        .single();

      if (queueError) {
        throw new Error(queueError.message);
      }

      // Langkah 2 (Insert Pending Pembayaran)
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert([
          {
            queue_id: queueData.id,
            amount_idr: totalAmount,
            payment_method: 'Online',
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (txError) {
        throw new Error(txError.message);
      }

      const orderId = txData.id;

      // Langkah 3 (Panggil backend server untuk mendapatkan Snap Token Midtrans)
      if (!window.snap) {
        throw new Error('Midtrans Snap SDK tidak termuat. Harap periksa koneksi internet Anda atau muat ulang halaman.');
      }

      const paymentResponse = await fetch('http://localhost:5000/api/create-payment-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          amount: totalAmount,
          customerName: authUser.email ? authUser.email.split('@')[0] : 'Pelanggan',
          email: authUser.email || 'customer@example.com',
          phone: '081234567890'
        })
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Gagal mendapatkan token pembayaran dari Midtrans');
      }

      const { token } = await paymentResponse.json();

      // Langkah 4 (Buka overlay pembayaran Midtrans Snap)
      setLoading(false); // Matikan state loading tombol agar user bisa membayar di overlay Snap

      window.snap.pay(token, {
        onSuccess: async function (result) {
          console.log('Midtrans payment success:', result);
          setLoading(true);
          try {
            // Update status di transaksi_antrian menjadi 'paid'
            const { error: updateQueueError } = await supabase
              .from('transaksi_antrian')
              .update({ status: 'paid' })
              .eq('id', queueData.id);

            if (updateQueueError) throw updateQueueError;

            // Update status di transactions menjadi 'success'
            const { error: updateTxError } = await supabase
              .from('transactions')
              .update({ status: 'success' })
              .eq('queue_id', queueData.id);

            if (updateTxError) throw updateTxError;

            alert('Pemesanan antrean berhasil dikonfirmasi! Pembayaran online sukses diproses.');
            setCompletedOrderTotal(totalAmount);
            setSelectedServices([]);
            setCurrentOrderId(orderId);
            setShowPaymentSuccess(true);
          } catch (e) {
            console.error('Failed to update status after payment:', e);
            alert('Pembayaran sukses, namun gagal memperbarui status antrean: ' + e.message);
          } finally {
            setLoading(false);
          }
        },
        onPending: function (result) {
          console.log('Midtrans payment pending:', result);
          alert('Pembayaran Anda sedang ditinjau/pending. Harap selesaikan pembayaran sesuai petunjuk Midtrans.');
        },
        onError: function (result) {
          console.error('Midtrans payment error:', result);
          alert('Pembayaran gagal: ' + (result.status_message || 'Terjadi kesalahan.'));
        },
        onClose: function () {
          console.log('Midtrans Snap widget closed');
          alert('Jendela pembayaran ditutup sebelum transaksi diselesaikan.');
        }
      });
    } catch (err) {
      console.error('Error inserting transaction:', err);
      alert('Gagal memproses pembayaran: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToQueue = () => {
    if (selectedServices.length === 0) {
      alert("Silakan pilih minimal satu layanan terlebih dahulu!");
      return;
    }
    if (!isAuthenticated) {
      alert("Silakan masuk (login) terlebih dahulu menggunakan tombol di kolom kanan untuk melanjutkan ke antrean.");
      // Scroll to login sidebar on mobile
      const sidebar = document.getElementById('sidebar-login-card');
      if (sidebar) {
        sidebar.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      alert("Antrean Anda berhasil dikonfirmasi! Nomor Antrean Anda adalah #08.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9EC] dark:bg-[#26170c] text-[#26170C] dark:text-[#faf3e0] flex flex-col font-sans transition-colors duration-200 w-full max-w-[100vw] overflow-x-hidden">
      
      {/* 1. Navbar */}
      <header className="w-full bg-[#FFF9EC]/90 dark:bg-[#26170c]/90 backdrop-blur-md border-b border-[#E5D3C5]/40 dark:border-white/5 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex justify-between items-center w-full">
          {/* Logo Teks */}
          <div className="flex items-center">
            <span className="text-xl md:text-2xl font-headline italic font-bold text-[#26170C] dark:text-[#faf3e0] tracking-wide">
              Warisan Barber
            </span>
          </div>

          {/* Navigasi Kanan */}
          <nav className="flex items-center gap-4 md:gap-6 text-xs md:text-sm font-sans font-bold uppercase tracking-wider text-[#26170C]/80 dark:text-[#faf3e0]/80">
            <a href="#beranda" className="border-b-2 border-[#944925] pb-1 text-[#26170C] dark:text-[#faf3e0]">
              Beranda
            </a>

            {/* Tombol KELUAR */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                    if (onLogout) onLogout();
                  } catch (err) {
                    console.error('Error logging out:', err);
                  }
                }}
                className="text-[#26170C]/80 dark:text-[#faf3e0]/80 hover:text-[#944925] dark:hover:text-[#ffb596] transition-colors font-bold uppercase tracking-wider text-xs md:text-sm focus:outline-none"
              >
                Keluar
              </button>
            )}

            {/* Ikon Gear Pengaturan */}
            <button
              type="button"
              onClick={() => {
                setSettingsError('');
                setSettingsSuccess('');
                setNewFullName(user?.name || '');
                setNewUsername(user?.username || user?.name || '');
                setNewEmail(user?.email || '');
                setNewPassword('');
                setConfirmPassword('');
                setIsSettingsOpen(true);
              }}
              className="text-[#26170C]/80 dark:text-[#faf3e0]/80 hover:text-[#944925] dark:hover:text-[#ffb596] transition-colors flex items-center focus:outline-none"
              title="Pengaturan"
            >
              <span className="material-symbols-outlined text-lg md:text-xl">settings</span>
            </button>

            {/* Ikon User Bulat (Hanya tampil jika isAuthenticated === true) */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="w-8 h-8 rounded-full bg-[#2b1810] dark:bg-[#faf3e0] text-white dark:text-[#2b1810] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-lg">person</span>
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#FFF9EC] dark:bg-[#3d2b1f] border border-[#E5D3C5] dark:border-white/5 rounded-xl shadow-xl py-2 z-50 text-left normal-case tracking-normal">
                    <div className="px-4 py-2 border-b border-[#E5D3C5]/40 dark:border-white/5">
                      <p className="text-xs font-bold text-[#26170C] dark:text-[#faf3e0] truncate">
                        {user?.name || 'Pelanggan'}
                      </p>
                      <p className="text-[10px] text-[#81756e] dark:text-[#faf3e0]/50 truncate mt-0.5">
                        {user?.email || 'customer@warisan.id'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-[#ba1a1a] hover:bg-[#efe8d5]/40 dark:hover:bg-white/5 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </nav>
        </div>
      </header>

      {/* Main Content Layout - 2 Kolom */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Kolom Kiri - 60% */}
        <div className="w-full lg:w-[60%] flex flex-col gap-8">
          
          {/* 2. Hero Section */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#E5D3C5] dark:border-white/5 aspect-[16/10] md:aspect-[16/8]">
            <img 
              src={heritageBookingBanner} 
              alt="Heritage Barbershop Banner" 
              className="w-full h-full object-cover" 
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-6 md:p-10 text-white">
              <span className="absolute top-6 left-6 bg-[#944925] text-white text-[8px] md:text-[10px] font-bold uppercase px-3 py-1 rounded tracking-widest shadow-md">
                SEJAK 1950
              </span>
              
              <h2 className="text-2xl md:text-4xl font-headline italic font-bold drop-shadow-md leading-tight mb-2">
                Tradisi Potong Rambut Sejati
              </h2>
              
              <p className="text-xs md:text-sm text-[#E5D3C5] font-sans leading-relaxed max-w-xl mb-6">
                Menghidupkan kembali seni grooming klasik dengan sentuhan modern untuk pria masa kini.
              </p>

              <button
                type="button"
                onClick={() => {
                  const target = document.getElementById('layanan-section');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white hover:bg-gray-100 text-[#2b1810] font-bold text-xs md:text-sm py-2.5 px-6 rounded-lg shadow-lg self-start transition-all transform hover:scale-105 active:scale-95 duration-150"
              >
                Pesan Kursi Sekarang
              </button>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-3 px-1">
            <div className="flex -space-x-2.5 overflow-hidden">
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#FFF9EC] dark:ring-[#26170c] bg-gradient-to-tr from-amber-600 to-amber-400 text-[10px] flex items-center justify-center font-bold text-white">RH</div>
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#FFF9EC] dark:ring-[#26170c] bg-gradient-to-tr from-orange-600 to-orange-400 text-[10px] flex items-center justify-center font-bold text-white">GW</div>
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#FFF9EC] dark:ring-[#26170c] bg-gradient-to-tr from-rose-600 to-rose-400 text-[10px] flex items-center justify-center font-bold text-white">EK</div>
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#FFF9EC] dark:ring-[#26170c] bg-[#944925] text-[9px] flex items-center justify-center font-bold text-white">+1k</div>
            </div>
            <p className="text-[11px] md:text-xs text-[#81756e] dark:text-[#faf3e0]/60 font-sans font-medium">
              Bergabung dengan <span className="font-bold text-[#26170C] dark:text-[#faf3e0]">1,000+ pelanggan puas</span> minggu ini
            </p>
          </div>

          {/* Layanan Section Header */}
          <div id="layanan-section" className="pt-4">
            <span className="text-[10px] md:text-xs font-bold text-[#944925] dark:text-[#ffb596] uppercase tracking-widest block mb-1">
              LAYANAN KAMI
            </span>
            <h2 className="text-2xl md:text-3xl font-headline italic font-bold text-[#26170C] dark:text-[#faf3e0]">
              Silakan Pilih Layanan
            </h2>
            <p className="text-xs md:text-sm text-[#81756e] dark:text-[#faf3e0]/60 mt-1 leading-relaxed">
              Nikmati pengalaman cukur klasik dengan sentuhan modern dari para artisan kami yang berpengalaman.
            </p>
          </div>

          {/* 3. Styling Kartu Layanan (Grid 2x2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {services.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              const isDisabled = isItemDisabled(service);
              return (
                <div
                  key={service.id}
                  onClick={() => {
                    if (!isDisabled) {
                      handleToggleService(service.id);
                    }
                  }}
                  className={`relative p-6 rounded-2xl bg-[#FAF6EE] dark:bg-[#26170C]/30 border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between h-full shadow-sm hover:shadow-md ${
                    isSelected 
                      ? 'border-2 border-[#944925] dark:border-[#ffb596] shadow-[#944925]/5 ring-1 ring-[#944925]' 
                      : isDisabled
                      ? 'border-[#E5D3C5]/30 dark:border-white/5 opacity-50 cursor-not-allowed hover:border-[#E5D3C5]/30'
                      : 'border-[#E5D3C5] dark:border-white/5 hover:border-[#944925]/60'
                  }`}
                >
                  {/* Ribbon 'FAVORIT' miring berwarna cokelat */}
                  {service.tag && (
                    <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 pointer-events-none rounded-tr-2xl">
                      <div className="absolute top-4 -right-8 w-28 bg-[#944925] text-white text-[8px] font-bold uppercase py-1 text-center rotate-45 shadow-md tracking-wider">
                        FAVORIT
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    {/* Judul Kiri Atas, Harga Kanan Atas Sejajar */}
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-bold text-sm md:text-base text-[#26170C] dark:text-[#faf3e0] pr-6">
                        {service.name}
                      </h3>
                      <span className="text-[#944925] dark:text-[#ffb596] font-bold text-sm flex-shrink-0">
                        Rp {service.price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Category Label Badge */}
                    <div className="mt-1 mb-0.5">
                      <span className="inline-block px-2 py-0.5 rounded bg-gray-200/80 dark:bg-white/10 text-[9px] font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-widest leading-none">
                        {service.package_items && service.package_items.length > 0 ? 'PAKET' : (service.category || 'LAINNYA')}
                      </span>
                    </div>

                    {/* Durasi di bawah Judul */}
                    <span className="text-[9px] font-sans font-bold text-[#81756e] dark:text-[#faf3e0]/50 tracking-wider">
                      {service.duration}
                    </span>

                    {/* Deskripsi */}
                    <p className="text-xs text-[#81756e] dark:text-[#faf3e0]/60 leading-relaxed font-sans mt-3">
                      {renderServiceDescription(service)}
                    </p>
                  </div>

                  <div className="flex justify-end items-center mt-5 pt-3 border-t border-[#E5D3C5]/40 dark:border-white/5">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'border-[#944925] bg-[#944925] text-white' 
                        : 'border-[#E5D3C5] dark:border-white/20'
                    }`}>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. Tambahan Elemen Bawah (Kolom Kiri) */}
          {/* Garis Pembatas Berlogo Gunting */}
          <div className="relative flex py-4 items-center justify-center my-2">
            <div className="flex-grow border-t border-[#E5D3C5]/60 dark:border-white/10"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-[#81756e] font-sans flex items-center gap-1 bg-[#FFF9EC] dark:bg-[#26170c] px-3">
              <span className="material-symbols-outlined text-base">content_cut</span>
            </span>
            <div className="flex-grow border-t border-[#E5D3C5]/60 dark:border-white/10"></div>
          </div>

          {/* Kotak INFORMASI TAMBAHAN */}
          <div className="bg-[#FAF6EE] dark:bg-[#26170C]/20 border border-[#E5D3C5] dark:border-white/5 p-5 rounded-2xl flex flex-col gap-3.5">
            <h4 className="text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/50 uppercase tracking-widest">
              INFORMASI TAMBAHAN
            </h4>
            
            <div className="flex flex-col gap-3 text-xs leading-relaxed text-[#26170c] dark:text-[#faf3e0]/80">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-lg flex-shrink-0 mt-0.5">verified_user</span>
                <p>Semua peralatan disterilisasi sebelum penggunaan untuk keamanan Anda.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#944925] dark:text-[#ffb596] text-lg flex-shrink-0 mt-0.5">coffee</span>
                <p>Tersedia minuman kopi atau teh gratis untuk setiap layanan Paket Premium.</p>
              </div>
            </div>
          </div>

          {/* Tombol Lanjut ke Antrean */}
          <button
            type="button"
            onClick={handleContinueToQueue}
            className="w-full bg-[#2b1810] dark:bg-[#faf3e0] hover:bg-[#3d2b1f] dark:hover:bg-white text-white dark:text-[#2b1810] py-4 rounded-xl font-bold text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all transform active:scale-95 shadow-md"
          >
            <span>Lanjut Ke Antrean</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>

        </div>

        {/* Kolom Kanan (Sticky Sidebar) - 40% */}
        <div className="w-full lg:w-[40%] lg:sticky lg:top-20 flex flex-col gap-6 self-start">
          
          {/* KOTAK 1: Sudah Punya Akun? (Hanya tampil jika isAuthenticated === false) */}
          {!isAuthenticated ? (
            <div 
              id="sidebar-login-card"
              className="bg-[#FAF6EE] dark:bg-[#26170C]/20 border border-[#E5D3C5] dark:border-white/5 p-6 rounded-2xl shadow-xl flex flex-col gap-5"
            >
              <div className="text-center pb-2 border-b border-[#E5D3C5]/40 dark:border-white/5">
                <h3 className="text-base font-bold text-[#26170C] dark:text-[#faf3e0] uppercase tracking-wider">
                  Sudah Punya Akun?
                </h3>
                <p className="text-xs text-[#81756e] dark:text-[#faf3e0]/60 mt-1.5 font-sans leading-relaxed">
                  Masuk dengan akun yang sudah terdaftar untuk akses riwayat pesanan.
                </p>
              </div>

              {loginError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs font-semibold text-center leading-normal animate-shake">
                  {loginError}
                </div>
              )}

              {!showEmailForm ? (
                <div className="flex flex-col gap-3">
                  {/* Google Sign-in */}
                  <button
                    type="button"
                    onClick={() => alert('Fitur Google Sign-in sedang dalam pengembangan')}
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-3 rounded-lg font-bold text-xs uppercase tracking-wider w-full flex items-center justify-center gap-2.5 transition-colors shadow-sm active:scale-95 transform"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.99-6.012c1.49 0 2.858.547 3.918 1.455l3.142-3.142C19.123 2.946 16.735 2 13.99 2a10.5 10.5 0 0 0-10.5 10.5A10.5 10.5 0 0 0 13.99 23c6.036 0 10.51-4.241 10.51-10.51 0-.712-.078-1.4-.216-2.205H12.24z"
                      />
                    </svg>
                    <span>Google Sign-in</span>
                  </button>

                  {/* Login dengan Email */}
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(true)}
                    className="bg-[#2b1810] hover:bg-[#3d2b1f] text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wider w-full flex items-center justify-center gap-2.5 transition-colors shadow-md active:scale-95 transform"
                  >
                    <span className="material-symbols-outlined text-base">mail</span>
                    <span>Login dengan Email</span>
                  </button>
                </div>
              ) : (
                /* Inline Email Form */
                <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#81756e] uppercase tracking-wider">Username atau Email</label>
                    <input
                      type="text"
                      placeholder="Masukkan username/email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full bg-white dark:bg-[#26170c]/50 border border-[#E5D3C5] dark:border-white/10 p-3 rounded-lg text-xs focus:ring-1 focus:ring-[#944925] focus:border-[#944925] outline-none text-[#26170C] dark:text-[#faf3e0] font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#81756e] uppercase tracking-wider">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Masukkan password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white dark:bg-[#26170c]/50 border border-[#E5D3C5] dark:border-white/10 p-3 pr-10 rounded-lg text-xs focus:ring-1 focus:ring-[#944925] focus:border-[#944925] outline-none text-[#26170C] dark:text-[#faf3e0] font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#81756e] hover:text-[#26170c] dark:hover:text-[#faf3e0] focus:outline-none flex items-center"
                      >
                        <span className="material-symbols-outlined text-base">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailForm(false);
                        setLoginError('');
                        setShowPassword(false);
                        setIdentifier('');
                      }}
                      className="w-1/2 py-2.5 rounded-lg border border-[#E5D3C5] text-xs font-bold uppercase text-[#26170c] hover:bg-[#efe8d5]/40 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-1/2 py-2.5 bg-[#2b1810] text-white rounded-lg text-xs font-bold uppercase hover:bg-[#3d2b1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'MEMUAT...' : 'Masuk'}
                    </button>
                  </div>

                  {/* Tambahan Teks Pendaftaran */}
                  <div className="text-center mt-3">
                    <p className="text-[11px] text-[#81756e] dark:text-[#faf3e0]/60">
                      Tidak punya akun?{' '}
                      <span 
                        onClick={() => setIsRegisterModalOpen(true)}
                        className="font-bold text-[#944925] dark:text-[#ffb596] hover:underline cursor-pointer"
                      >
                        Ayo daftar
                      </span>
                    </p>
                  </div>
                </form>
              )}
            </div>
          ) : null}

          {/* KOTAK 2: Status Konfirmasi & Nomor Antrean (Hanya tampil jika isAuthenticated === true dan user.role === 'customer') */}
          {isAuthenticated && user?.role === 'customer' ? (
            showPaymentSuccess ? (
              <div className="bg-[#FAF6EE] dark:bg-[#26170C]/20 border border-[#E5D3C5] dark:border-white/5 p-6 rounded-2xl shadow-xl flex flex-col items-center text-center gap-5 animate-fade-in w-full">
                {/* 1. Ikon Centang Hijau Estetik */}
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md">
                  <span className="material-symbols-outlined text-4xl font-bold">check_circle</span>
                </div>

                {/* 2. Judul Sukses */}
                <div>
                  <h3 className="text-base font-headline font-bold text-[#26170C] dark:text-[#faf3e0] uppercase tracking-wider">
                    Pemesanan Berhasil!
                  </h3>
                  <p className="text-xs text-[#81756e] dark:text-[#faf3e0]/60 mt-1 font-sans">
                    Transaksi pembayaran online Anda telah diverifikasi secara real-time.
                  </p>
                </div>

                {/* 3. Detail Order */}
                <div className="w-full bg-[#efe8d5]/30 dark:bg-white/5 p-4 rounded-xl border border-[#E5D3C5]/40 dark:border-white/5 flex flex-col gap-2.5 text-left text-xs font-sans">
                  <div className="flex justify-between items-center">
                    <span className="text-[#81756e] dark:text-[#faf3e0]/50 font-semibold uppercase tracking-wider text-[9px]">ID TRANSAKSI</span>
                    <span className="font-mono font-bold text-[#26170C] dark:text-[#faf3e0]">{currentOrderId}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-[#E5D3C5]/20 dark:border-white/5 pt-2">
                    <span className="text-[#81756e] dark:text-[#faf3e0]/50 font-semibold uppercase tracking-wider text-[9px]">TOTAL BAYAR</span>
                    <span className="font-extrabold text-[#944925] dark:text-[#ffb596] text-sm">
                      Rp {completedOrderTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* 4. QR Code Generated */}
                <div className="bg-white p-4 rounded-xl border border-[#E5D3C5]/60 dark:border-white/10 shadow-sm flex flex-col items-center justify-center gap-2">
                  <QRCodeSVG 
                    value={JSON.stringify({ 
                      orderId: currentOrderId, 
                      user: user?.name, 
                      email: user?.email, 
                      total: completedOrderTotal 
                    })}
                    size={160}
                    level="Q"
                    includeMargin={false}
                    fgColor="#26170C"
                  />
                  <span className="text-[9px] font-sans font-bold text-[#81756e] uppercase tracking-wider mt-1">Scan untuk Verifikasi Kasir</span>
                </div>

                {/* 5. Tombol Kembali ke Beranda */}
                <button
                  type="button"
                  onClick={() => setShowPaymentSuccess(false)}
                  className="w-full bg-[#2b1810] dark:bg-[#faf3e0] hover:bg-[#3d2b1f] dark:hover:bg-white text-white dark:text-[#2b1810] py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  <span>Kembali ke Beranda</span>
                </button>
              </div>
            ) : (
              <div className="bg-[#FAF6EE] dark:bg-[#26170C]/20 border border-[#E5D3C5] dark:border-white/5 p-6 rounded-2xl shadow-xl flex flex-col gap-6">
                
                {/* Status Konfirmasi */}
                {activeBooking && (
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/50 uppercase tracking-widest block">
                      STATUS KONFIRMASI
                    </span>
                    
                    <h4 className="text-xl md:text-2xl font-headline italic font-bold text-[#26170c] dark:text-[#faf3e0] leading-none">
                      Nomor Antrean Anda: {activeBooking.queue_number}
                    </h4>

                    {/* Estimasi Menunggu Box */}
                    <div className="bg-[#efe8d5]/30 dark:bg-white/5 p-4 rounded-xl border border-[#E5D3C5]/40 dark:border-white/5 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-sans font-bold text-[#81756e] uppercase tracking-wider">ESTIMASI MENUNGGU</span>
                          <span className="text-xl font-extrabold text-[#26170c] dark:text-[#faf3e0]">
                            {activeBooking.status === 'in_progress' ? 'Sedang Dilayani' : `${peopleAhead * 30} `}
                            {activeBooking.status !== 'in_progress' && <span className="text-xs font-normal text-[#81756e]">Menit</span>}
                          </span>
                        </div>
                        <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[9px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                          {activeBooking.status === 'in_progress' ? 'Sedang Diproses' : 'Barber Aktif'}
                        </span>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="w-full bg-[#E5D3C5]/50 dark:bg-white/10 h-1.5 rounded-full relative overflow-hidden">
                        <div 
                          className="bg-[#26170c] dark:bg-[#ffb596] h-full rounded-full transition-all duration-500" 
                          style={{ width: activeBooking.status === 'in_progress' ? '100%' : `${Math.max(10, 100 - (peopleAhead * 20))}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[9px] font-bold tracking-normal uppercase text-[#81756e]/85">
                        <span>
                          {activeBooking.status === 'in_progress' 
                            ? 'GILIRAN ANDA SEDANG BERLANGSUNG' 
                            : peopleAhead === 0 
                            ? 'GILIRAN ANDA BERIKUTNYA' 
                            : `SISA ${peopleAhead} ANTREAN DI DEPAN ANDA`}
                        </span>
                        <span className="text-[#944925] dark:text-[#ffb596]">
                          {activeBooking.status === 'in_progress' ? 'DIPROSES' : 'MENUNGGU'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifikasi WhatsApp Toggle */}
                {activeBooking && (
                  <div className="flex items-center justify-between bg-[#efe8d5]/40 dark:bg-white/5 p-4 rounded-xl border border-[#E5D3C5]/40 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-600 text-2xl flex-shrink-0">chat</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#26170c] dark:text-[#faf3e0]">Notifikasi WhatsApp</span>
                        <span className="text-[9px] text-[#81756e] dark:text-[#faf3e0]/50 font-sans mt-0.5">Kirim WA saat giliran tiba</span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setWaNotifications(!waNotifications)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none relative flex-shrink-0 ${
                        waNotifications ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                        waNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                )}

                {/* PILIHAN DETAIL JADWAL & BARBER */}
                <div className="flex flex-col gap-3.5 border-t border-[#E5D3C5]/40 dark:border-white/5 pt-4">
                  <h4 className="text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/50 uppercase tracking-widest pb-1 border-b border-[#E5D3C5]/30 dark:border-white/5">
                    DETAIL JADWAL & BARBER
                  </h4>
                  
                  {/* Tanggal */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#81756e] uppercase tracking-wider">Tanggal Layanan</label>
                    <input 
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      max={(() => {
                        const tom = new Date();
                        tom.setDate(tom.getDate() + 1);
                        return tom.toISOString().split('T')[0];
                      })()}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-white dark:bg-[#26170c]/50 border border-[#E5D3C5] dark:border-white/10 p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-[#944925] focus:border-[#944925] outline-none text-[#26170C] dark:text-[#faf3e0] font-sans"
                    />
                  </div>

                  {/* Jam */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#81756e] uppercase tracking-wider">Waktu Layanan</label>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={handleTimeChange}
                      min={openTime}
                      max={closeTime}
                      step="1800"
                      className="w-full bg-white dark:bg-[#26170c]/50 border border-[#E5D3C5] dark:border-white/10 p-2.5 rounded-lg text-xs focus:ring-1 focus:ring-[#944925] focus:border-[#944925] outline-none text-[#26170C] dark:text-[#faf3e0] font-sans cursor-pointer"
                    />
                  </div>

                  {/* Barber */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/60 uppercase tracking-widest font-sans">Pilih Barber</label>
                    <div className="flex gap-4 items-center">
                      {barbersList.length === 0 ? (
                        <span className="text-xs text-[#81756e] italic">Memuat data barber...</span>
                      ) : (
                        barbersList.map(barber => {
                          const isSelected = selectedBarberId === barber.id;
                          const displayName = barber.full_name || barber.username;
                          const avatarUrl = getBarberAvatar(barber.username || barber.full_name || '');
                          
                          return (
                            <div 
                              key={barber.id}
                              onClick={() => setSelectedBarberId(barber.id)}
                              className={`flex-1 min-w-[100px] max-w-[140px] p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border ${
                                isSelected 
                                  ? 'border-[#26170C] dark:border-[#faf3e0] border-[1.5px] bg-[#E5D3C5]/20 dark:bg-white/5 shadow-sm' 
                                  : 'border-[#E5D3C5] dark:border-white/10 bg-white dark:bg-black/10 hover:border-[#26170C]/50 dark:hover:border-white/50'
                              }`}
                            >
                              <img 
                                src={avatarUrl} 
                                alt={displayName}
                                className="w-14 h-14 rounded-2xl object-cover mb-3 border border-[#E5D3C5]/50 dark:border-white/5 shadow-sm"
                              />
                              <span className="text-xs font-bold text-[#26170C] dark:text-[#faf3e0] text-center mb-0.5 block truncate max-w-full">
                                {displayName}
                              </span>
                              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#81756e] dark:text-[#faf3e0]/50 text-center block">
                                {barber.tier_level ? barber.tier_level.toUpperCase() : 'JUNIOR'}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Ringkasan Pesanan */}
                <div className="flex flex-col gap-3.5 border-t border-[#E5D3C5]/40 dark:border-white/5 pt-4">
                  <h4 className="text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/50 uppercase tracking-widest pb-1 border-b border-[#E5D3C5]/30 dark:border-white/5">
                    RINGKASAN PESANAN
                  </h4>
                  
                  <div className="flex flex-col gap-3 min-h-[40px]">
                    {orderItems.length === 0 ? (
                      <div className="text-xs text-center text-[#81756e] italic">
                        Belum ada layanan terpilih
                      </div>
                    ) : (
                      orderItems.map((item) => (
                        <div key={item.id} className="flex flex-col gap-1">
                          <div className="flex justify-between items-start text-xs">
                            <span className="font-semibold text-[#26170C] dark:text-[#faf3e0]">{item.name}</span>
                            <span className="text-[#81756e] flex-shrink-0">1x</span>
                          </div>
                          {item.packageItemsNames && item.packageItemsNames.length > 0 && (
                            <div className="flex flex-col gap-1 pl-3.5 mt-0.5 text-[10px] text-[#81756e] dark:text-[#faf3e0]/50 font-medium">
                              {item.packageItemsNames.map((name, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 leading-tight animate-slide-in-left">
                                  <span className="text-[#81756e]/70 dark:text-[#faf3e0]/30 select-none">↳</span>
                                  <span>{name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-[#E5D3C5] dark:border-white/10 my-1" />

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#81756e] uppercase tracking-wider">TOTAL PEMBAYARAN</span>
                    <span className="text-base font-extrabold text-[#26170C] dark:text-[#faf3e0]">
                      Rp {totalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Tombol Bayar */}
                <button 
                  type="button"
                  disabled={loading}
                  onClick={handleCheckout}
                  className="w-full bg-[#2b1810] dark:bg-[#faf3e0] hover:bg-[#3d2b1f] dark:hover:bg-white text-white dark:text-[#2b1810] py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">payment</span>
                  <span>{loading ? 'MEMPROSES PEMBAYARAN...' : 'Bayar Secara Online'}</span>
                </button>

                <div className="text-[9px] text-[#81756e]/70 dark:text-[#faf3e0]/40 font-bold tracking-widest text-center uppercase">
                  DUKUNG PEMBAYARAN: GPAY, OVO, DANA, LINKAJA
                </div>
              </div>
            )
          ) : null}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 mt-auto border-t border-[#E5D3C5]/30 dark:border-white/5 bg-[#FFF9EC] dark:bg-[#26170c] text-center text-[10px] font-sans font-bold uppercase tracking-widest text-[#81756e]/50 dark:text-[#faf3e0]/40 transition-colors">
        © 2024 Warisan Barber. Est. 1950.
      </footer>

      {/* Registration Modal Overlay */}
      {isRegisterModalOpen && (
        <Register onClose={() => setIsRegisterModalOpen(false)} />
      )}

      {/* Settings Modal Overlay */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#FFF9EC] dark:bg-[#26170c] border border-[#E5D3C5] dark:border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-[#E5D3C5]/40 dark:border-white/5 flex justify-between items-center bg-[#FAF6EE] dark:bg-[#3d2b1f]/30">
              <h3 className="text-sm font-headline font-bold uppercase tracking-wider text-[#26170c] dark:text-[#faf3e0] flex items-center gap-2">
                <span className="material-symbols-outlined text-base">settings</span>
                Pengaturan
              </h3>
              <button 
                type="button" 
                onClick={() => setIsSettingsOpen(false)}
                className="text-[#81756e] hover:text-[#26170c] dark:hover:text-[#faf3e0] transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              {settingsError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs font-semibold text-center animate-shake">
                  {settingsError}
                </div>
              )}
              {settingsSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg text-xs font-semibold text-center">
                  {settingsSuccess}
                </div>
              )}

              {/* 1. Toggle Dark Mode */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/50 uppercase tracking-widest">
                  Tampilan & Tema
                </span>
                <div className="flex items-center justify-between bg-white dark:bg-[#26170c]/50 border border-[#E5D3C5] dark:border-white/10 p-4 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg text-[#944925] dark:text-[#ffb596]">
                      {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                    </span>
                    <span className="text-xs font-bold text-[#26170c] dark:text-[#faf3e0]">Mode Gelap (Dark Mode)</span>
                  </div>
                  <button 
                    type="button"
                    onClick={onToggleTheme}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none relative flex-shrink-0 ${
                      theme === 'dark' ? 'bg-[#944925]' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                      theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* 2. Edit Profil */}
              {isAuthenticated && (
                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                  <div className="border-t border-[#E5D3C5]/40 dark:border-white/5 pt-2" />
                  <span className="text-[10px] font-bold text-[#81756e] dark:text-[#faf3e0]/50 uppercase tracking-widest mb-1 block">
                    Edit Profil
                  </span>

                  {/* Full Name Input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#81756e] uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda"
                      className="w-full bg-white dark:bg-[#26170c]/50 border border-[#E5D3C5] dark:border-white/10 p-3 rounded-lg text-xs focus:ring-1 focus:ring-[#944925] focus:border-[#944925] outline-none text-[#26170C] dark:text-[#faf3e0] font-sans"
                    />
                  </div>

                  {/* Username Input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#81756e] uppercase tracking-wider">Username</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Ubah username"
                      className="w-full bg-white dark:bg-[#26170c]/50 border border-[#E5D3C5] dark:border-white/10 p-3 rounded-lg text-xs focus:ring-1 focus:ring-[#944925] focus:border-[#944925] outline-none text-[#26170C] dark:text-[#faf3e0] font-sans"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#81756e] uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Ubah email"
                      className="w-full bg-white dark:bg-[#26170c]/50 border border-[#E5D3C5] dark:border-white/10 p-3 rounded-lg text-xs focus:ring-1 focus:ring-[#944925] focus:border-[#944925] outline-none text-[#26170C] dark:text-[#faf3e0] font-sans"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#81756e] uppercase tracking-wider">Password Baru</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Masukkan password baru (opsional)"
                        className="w-full bg-white dark:bg-[#26170c]/50 border border-[#E5D3C5] dark:border-white/10 p-3 pr-10 rounded-lg text-xs focus:ring-1 focus:ring-[#944925] focus:border-[#944925] outline-none text-[#26170C] dark:text-[#faf3e0] font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#81756e] hover:text-[#26170c] dark:hover:text-[#faf3e0] focus:outline-none flex items-center"
                      >
                        <span className="material-symbols-outlined text-base">
                          {showNewPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#81756e] uppercase tracking-wider">Konfirmasi Password Baru</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ubah konfirmasi password baru"
                        className="w-full bg-white dark:bg-[#26170c]/50 border border-[#E5D3C5] dark:border-white/10 p-3 pr-10 rounded-lg text-xs focus:ring-1 focus:ring-[#944925] focus:border-[#944925] outline-none text-[#26170C] dark:text-[#faf3e0] font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#81756e] hover:text-[#26170c] dark:hover:text-[#faf3e0] focus:outline-none flex items-center"
                      >
                        <span className="material-symbols-outlined text-base">
                          {showConfirmPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loadingSettings}
                    className="w-full py-3 bg-[#2b1810] text-white rounded-lg text-xs font-bold uppercase hover:bg-[#3d2b1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                  >
                    {loadingSettings ? 'MEMUAT...' : 'Simpan Perubahan'}
                  </button>
                </form>
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 border-t border-[#E5D3C5]/40 dark:border-white/5 flex justify-end bg-[#FAF6EE] dark:bg-[#3d2b1f]/20">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-[#EFE8D5]/60 hover:bg-[#EFE8D5] text-[#26170c] rounded-lg text-xs font-bold uppercase transition-colors"
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
