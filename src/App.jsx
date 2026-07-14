import React, { useState, useEffect } from 'react';

export default function App() {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // State untuk form input baru
  const [formData, setFormData] = useState({
    pic: '', whatsapp: '', kegiatan: '', tanggal: '', jamMulai: '', jamSelesai: ''
  });
  const [pesanError, setPesanError] = useState('');

  // 1. GANTI URL INI dengan URL Web App dari Google Apps Script (Langkah 2)
  const API_URL = "https://script.google.com/macros/s/AKfycbywsY3YpVn6BC_iKcK0HhvEdwe4WogqPVtEoM36jn2VHzvtW3VANPvTmyYpmke--0q9CA/exec";

  // Mengambil data dari Google Sheets saat aplikasi dibuka
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

  // 2. LOGIKA ANTI-BENTROK JADWAL
  const periksaBentrok = (inputBaru) => {
    // Filter jadwal di hari yang sama yang statusnya "Approved" atau "Pending"
    const jadwalHariSama = jadwal.filter(j => 
      j.tanggal === inputBaru.tanggal && j.status !== 'Rejected'
    );

    for (let j of jadwalHariSama) {
      // Rumus overlap: Mulai A < Selesai B DAN Selesai A > Mulai B
      if (inputBaru.jamMulai < j.jamSelesai && inputBaru.jamSelesai > j.jamMulai) {
        return {
          bentrok: true,
          pesan: `Mohon maaf, jam tersebut bertumpuk dengan acara "${j.kegiatan}" (${j.jamMulai}-${j.jamSelesai} WIB).`
        };
      }
    }
    return { bentrok: false };
  };

  // 3. Handle Submit Form Booking
  const handleSubmit = async (e) => {
  e.preventDefault();
  setPesanError('');

  const cek = periksaBentrok(formData);
  if (cek.bentrok) {
    setPesanError(cek.pesan);
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors', // Penting untuk bypass CORS Google Apps Script
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    alert("Pengajuan berhasil dikirim ke database DKM!");
    setShowForm(false);
    // Optional: Refresh data kalender
    window.location.reload(); 
  } catch (error) {
    alert("Terjadi kesalahan, coba lagi nanti.");
  }
};

    // Jika aman, kirim data ke Google Sheets (bisa via POST/GET parameter ke GAS)
    alert("Pengajuan berhasil dikirim! Menunggu persetujuan Ketua DKM.");
    setShowForm(false);
    // Di sini nantinya ditambahkan fungsi fetch POST ke Google Apps Script Anda
  };

  return (
    <div className="min-h-screen bg-abasLight font-sans text-abasDark p-4 md:p-8">
      {/* Header Eksklusif */}
      <header className="max-w-3xl mx-auto text-center my-8">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-3">
          Mushola ABAS
        </h1>
        <p className="text-xs md:text-sm tracking-[0.2em] text-gray-500 uppercase font-medium">
          Abu Bakar Ash Shiddiq — Portal Jadwal & Booking Kegiatan
        </p>
        <div className="w-16 h-[2px] bg-abasGold mx-auto mt-5"></div>
      </header>

      {/* Tombol Ajukan Kegiatan */}
      <div className="max-w-3xl mx-auto mb-8 flex justify-between items-center">
        <h2 className="font-serif text-xl font-semibold">Daftar Agenda</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-abasDark text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-abasGold transition-colors duration-300 shadow-sm"
        >
          + Ajukan Booking Ruangan
        </button>
      </div>

      {/* Konten Utama (Daftar Jadwal) */}
      <main className="max-w-3xl mx-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-400 font-serif italic">
            Memuat jadwal mushola...
          </div>
        ) : (
          <div className="space-y-3">
            {jadwal.length === 0 && (
              <p className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">Belum ada kegiatan yang terjadwal minggu ini.</p>
            )}
            {jadwal.filter(item => item.status !== 'Rejected').map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedEvent(item)}
                className={`p-5 rounded-lg border-l-4 transition-all cursor-pointer shadow-sm hover:shadow-md ${
                  item.status === 'Approved' 
                    ? 'border-abasGold bg-white border-y border-r border-gray-100' 
                    : 'border-amber-400 bg-amber-50/50 border-y border-r border-amber-100'
                }`}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-abasDark">{item.kegiatan}</h3>
                    <p className="text-sm text-gray-500 font-medium">
                      📅 {item.tanggal} &nbsp;|&nbsp; ⏰ {item.jamMulai} - {item.jamSelesai} WIB
                    </p>
                  </div>
                  <div>
                    <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${
                      item.status === 'Approved' 
                        ? 'bg-[#ede6da] text-abasDark' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status === 'Approved' ? 'Terjadwal (Approved)' : 'Menunggu Approval'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL 1: Detail Kegiatan (Saat jadwal diklik) */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 max-w-md w-full rounded-xl p-6 shadow-2xl">
            <h3 className="font-serif text-2xl font-bold mb-1">{selectedEvent.kegiatan}</h3>
            <p className="text-xs text-abasGold font-semibold uppercase tracking-wider mb-4">Detail Informasi</p>
            
            <div className="space-y-3 text-sm border-t border-b border-gray-100 py-4 my-4">
              <div className="flex justify-between"><span className="text-gray-400">PIC / Pengaju:</span> <span className="font-medium">{selectedEvent.pic}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Tanggal:</span> <span className="font-medium">{selectedEvent.tanggal}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Waktu:</span> <span className="font-medium">{selectedEvent.jamMulai} - {selectedEvent.jamSelesai} WIB</span></div>
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

      {/* MODAL 2: Form Booking Ruangan & Validasi Anti-Bentrok */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 max-w-md w-full rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-2xl font-bold mb-1">Ajukan Booking</h3>
            <p className="text-xs text-gray-400 mb-4">Pastikan jadwal tidak bertumpuk dengan kegiatan lain.</p>

            {pesanError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-xs text-red-700 font-medium">
                ⚠️ {pesanError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Nama Kegiatan / Pengajian</label>
                <input type="text" required placeholder="Misal: Pengajian Ibu-Ibu RT 02" className="w-full p-2.5 border rounded-md focus:outline-none focus:border-abasGold" 
                  value={formData.kegiatan} onChange={e => setFormData({...formData, kegiatan: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Penanggung Jawab (PIC)</label>
                <input type="text" required placeholder="Nama Anda" className="w-full p-2.5 border rounded-md focus:outline-none focus:border-abasGold"
                  value={formData.pic} onChange={e => setFormData({...formData, pic: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">No. WhatsApp</label>
                <input type="tel" required placeholder="0812xxxxxx" className="w-full p-2.5 border rounded-md focus:outline-none focus:border-abasGold"
                  value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Tanggal Kegiatan</label>
                <input type="date" required className="w-full p-2.5 border rounded-md focus:outline-none focus:border-abasGold"
                  value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Jam Mulai</label>
                  <input type="time" required className="w-full p-2.5 border rounded-md focus:outline-none focus:border-abasGold"
                    value={formData.jamMulai} onChange={e => setFormData({...formData, jamMulai: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Jam Selesai</label>
                  <input type="time" required className="w-full p-2.5 border rounded-md focus:outline-none focus:border-abasGold"
                    value={formData.jamSelesai} onChange={e => setFormData({...formData, jamSelesai: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="w-1/2 bg-gray-100 py-2.5 rounded-md font-medium text-gray-600 hover:bg-gray-200">
                  Batal
                </button>
                <button type="submit" className="w-1/2 bg-abasGold text-white py-2.5 rounded-md font-medium hover:bg-[#9c7d4c] transition-colors shadow-sm">
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}