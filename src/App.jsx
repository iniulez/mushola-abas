import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function App() {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    pic: '', whatsapp: '', kegiatan: '', tanggal: '', jamMulai: '', jamSelesai: ''
  });
  const [pesanError, setPesanError] = useState('');

  // GANTI URL INI dengan URL Web App dari Google Apps Script Anda
  const API_URL = "https://script.google.com/macros/s/AKfycbywsY3YpVn6BC_iKcK0HhvEdwe4WogqPVtEoM36jn2VHzvtW3VANPvTmyYpmke--0q9CA/exec";

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setJadwal(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal memuat data:", err);
        setLoading(false);
      });
  }, []);

  // 1. Format jam untuk tampilan di daftar (bahasa Indonesia)
  const formatJamDisplay = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
      return timeString.toString().slice(0, 5);
    }
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // 2. Format jam KHUSUS FullCalendar (WAJIB pakai titik dua / standar en-GB)
  const formatJamISO = (timeString) => {
    if (!timeString) return '00:00';
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      // Menggunakan en-GB agar dijamin menghasilkan format HH:MM (pakai titik dua)
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    // Jika string mentah seperti "19.30", ubah titik menjadi titik dua secara paksa
    return timeString.toString().slice(0, 5).replace('.', ':');
  };

  const periksaBentrok = (inputBaru) => {
    const jadwalHariSama = jadwal.filter(j => 
      j.tanggal === inputBaru.tanggal && j.status !== 'Rejected'
    );
    for (let j of jadwalHariSama) {
      const eksisMulai = formatJamISO(j.jamMulai);
      const eksisSelesai = formatJamISO(j.jamSelesai);
      
      if (inputBaru.jamMulai < eksisSelesai && inputBaru.jamSelesai > eksisMulai) {
        return {
          bentrok: true,
          pesan: `Slot waktu bertumpuk dengan "${j.kegiatan}" (${formatJamDisplay(j.jamMulai)}-${formatJamDisplay(j.jamSelesai)} WIB).`
        };
      }
    }
    return { bentrok: false };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPesanError('');

    if (formData.jamSelesai <= formData.jamMulai) {
      setPesanError('Jam selesai harus lebih akhir daripada jam mulai.');
      return;
    }

    const cek = periksaBentrok(formData);
    if (cek.bentrok) {
      setPesanError(cek.pesan);
      return;
    }

    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      alert("Pengajuan berhasil dikirim!");
      setShowForm(false);
      window.location.reload(); 
    } catch (error) {
      alert("Terjadi kesalahan, coba lagi nanti.");
    }
  };

  // Mempersiapkan data untuk Calendar View dengan pembersihan waktu ISO yang sempurna
  const calendarEvents = jadwal
    .filter(item => {
      if (!item.status) return false;
      const statusClean = item.status.toString().trim().toLowerCase();
      return statusClean === 'approved' || statusClean.includes('terjadwal');
    })
    .map(item => {
      // Menggunakan fungsi formatJamISO agar dijamin HH:MM (tanpa titik)
      const jamMulaiClean = formatJamISO(item.jamMulai);
      const jamSelesaiClean = formatJamISO(item.jamSelesai);
      
      let tanggalFormatISO = "";
      const dateObj = new Date(item.tanggal);
      
      if (!isNaN(dateObj.getTime())) {
        const tahun = dateObj.getFullYear();
        const bulan = String(dateObj.getMonth() + 1).padStart(2, '0');
        const hari = String(dateObj.getDate()).padStart(2, '0');
        tanggalFormatISO = `${tahun}-${bulan}-${hari}`;
      } else {
        tanggalFormatISO = item.tanggal.toString().split('T')[0].trim();
      }

      return {
        id: item.id,
        title: item.kegiatan,
        start: `${tanggalFormatISO}T${jamMulaiClean}:00`,
        end: `${tanggalFormatISO}T${jamSelesaiClean}:00`,
        extendedProps: { ...item },
        backgroundColor: '#b3925c',
        borderColor: '#9c7d4c',
        textColor: '#ffffff'
      };
    });

  return (
    <div className="min-h-screen bg-abasLight font-sans text-abasDark p-4 md:p-8">
      <style>{`
        .fc { font-family: 'Plus Jakarta Sans', sans-serif; }
        .fc .fc-toolbar-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: bold; color: #1a1918; }
        .fc .fc-button-primary { background-color: #1a1918 !important; border-color: #1a1918 !important; color: #ffffff !important; }
        .fc .fc-button-primary:hover { background-color: #b3925c !important; border-color: #b3925c !important; }
        .fc .fc-button-active { background-color: #b3925c !important; border-color: #b3925c !important; }
        .fc-event { cursor: pointer; padding: 2px 4px; border-radius: 4px; font-size: 0.85em; font-weight: 600; }
        .fc-daygrid-day-number { color: #2c2a29; font-weight: 600; }
        .fc-col-header-cell-cushion { color: #6e675f; text-transform: uppercase; font-size: 0.75rem; tracking: 0.1em; }
      `}</style>

      <header className="max-w-4xl mx-auto text-center my-8">
        {/* Baris 1: Nama Utama dengan font Playfair Display yang besar */}
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-abasDark">
          Mushola Abu Bakar Ash-Shiddiq
        </h1>
        
        {/* Baris 2 & 3: Detail lokasi dengan font Plus Jakarta Sans yang lebih kecil & elegan */}
        <div className="mt-3 font-sans text-xs md:text-sm tracking-[0.15em] text-gray-500 uppercase font-medium leading-relaxed">
          <p>Cluster Bambu Ori</p>
          <p className="mt-1">TM Yasmin VII</p>
          <p className="mt-3">Portal Jadwal & Booking Kegiatan</p>
        </div>
        
        <div className="w-16 h-[2px] bg-abasGold mx-auto mt-5"></div>
      </header>

      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <h2 className="font-serif text-2xl font-semibold">Kalender Kegiatan</h2>
        <button 
          onClick={() => setShowForm(true)} 
          className="bg-abasDark text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-abasGold transition-colors duration-300 shadow-sm"
        >
          + Ajukan Booking Ruangan
        </button>
      </div>

      <main className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="text-center py-12 text-gray-400 font-serif italic">Memuat kalender mushola...</div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
              }}
              events={calendarEvents}
              eventClick={(info) => {
                setSelectedEvent(info.event.extendedProps);
              }}
              locale="id"
              height="auto"
              dayMaxEvents={3}
            />
          )}
        </div>

        <div>
          <h2 className="font-serif text-xl font-semibold mb-4 border-b pb-2">Daftar Agenda & Status Pengajuan</h2>
          {loading ? (
            <div className="text-center py-6 text-gray-400 font-serif italic">Memuat daftar...</div>
          ) : (
            <div className="space-y-3">
              {jadwal.length === 0 && (
                <p className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">Belum ada agenda yang terdaftar.</p>
              )}
              {jadwal.filter(item => item.status !== 'Rejected').map((item) => {
                const tanggalCantik = new Date(item.tanggal).toLocaleDateString('id-ID', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                });
                const jamMulaiCantik = formatJamDisplay(item.jamMulai);
                const jamSelesaiCantik = formatJamDisplay(item.jamSelesai);
                
                return (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedEvent(item)} 
                    className={`p-5 rounded-lg border-l-4 transition-all cursor-pointer shadow-sm hover:shadow-md bg-white border-y border-r ${
                      item.status === 'Approved' ? 'border-abasGold border-gray-100' : 'border-amber-400 bg-amber-50/30 border-amber-100'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-abasDark">{item.kegiatan}</h3>
                        <p className="text-sm text-gray-500">
                          📅 {tanggalCantik} | ⏰ {jamMulaiCantik} - {jamSelesaiCantik} WIB
                        </p>
                      </div>
                      <div>
                        <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${
                          item.status === 'Approved' ? 'bg-[#ede6da] text-abasDark' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status === 'Approved' ? 'Terjadwal (Approved)' : 'Menunggu Approval'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 max-w-md w-full rounded-xl p-6 shadow-2xl animate-fade-in">
            <h3 className="font-serif text-2xl font-bold mb-1">{selectedEvent.kegiatan}</h3>
            <p className="text-xs text-abasGold font-semibold uppercase tracking-wider mb-4">Detail Informasi</p>
            
            <div className="space-y-3 text-sm border-t border-b border-gray-100 py-4 my-4">
              <div className="flex justify-between"><span className="text-gray-400">PIC / Pengaju:</span> <span className="font-medium">{selectedEvent.pic}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Kontak WA:</span> <span className="font-medium">{selectedEvent.whatsapp || '-'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Tanggal:</span> <span className="font-medium">{selectedEvent.tanggal}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Waktu:</span> <span className="font-medium">{formatJamDisplay(selectedEvent.jamMulai)} - {formatJamDisplay(selectedEvent.jamSelesai)} WIB</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Status:</span> <span className="font-semibold text-abasGold">{selectedEvent.status}</span></div>
            </div>

            <button 
              onClick={() => setSelectedEvent(null)}
              className="w-full bg-gray-100 text-abasDark py-2.5 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 max-w-md w-full rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-2xl font-bold mb-4">Ajukan Booking</h3>
            {pesanError && <div className="bg-red-50 p-3 mb-4 text-xs text-red-700 font-medium border-l-4 border-red-500">⚠️ {pesanError}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">NAMA KEGIATAN</label>
                <input type="text" placeholder="Misal: Pengajian Ibu-Ibu" required className="w-full p-2.5 border rounded-md focus:outline-none focus:border-abasGold" onChange={e => setFormData({...formData, kegiatan: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">PENANGGUNG JAWAB (PIC)</label>
                <input type="text" placeholder="Nama Anda" required className="w-full p-2.5 border rounded-md focus:outline-none focus:border-abasGold" onChange={e => setFormData({...formData, pic: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">NOMOR WHATSAPP</label>
                <input type="tel" placeholder="Contoh: 08123456789" required className="w-full p-2.5 border rounded-md focus:outline-none focus:border-abasGold" onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">TANGGAL KEGIATAN</label>
                <input type="date" required className="w-full p-2.5 border rounded-md focus:outline-none focus:border-abasGold" onChange={e => setFormData({...formData, tanggal: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">JAM MULAI</label>
                  <input type="time" required className="w-full p-2.5 border rounded-md focus:outline-none focus:border-abasGold" onChange={e => setFormData({...formData, jamMulai: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">JAM SELESAI</label>
                  <input type="time" required className="w-full p-2.5 border rounded-md focus:outline-none focus:border-abasGold" onChange={e => setFormData({...formData, jamSelesai: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="w-1/2 bg-gray-100 py-2.5 rounded-md font-medium text-gray-600 hover:bg-gray-200 transition-colors">Batal</button>
                <button type="submit" className="w-1/2 bg-abasGold text-white py-2.5 rounded-md font-medium hover:bg-[#9c7d4c] transition-colors shadow-sm">Kirim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}