import React, { useState, useEffect } from 'react';

export default function App() {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    pic: '', whatsapp: '', kegiatan: '', tanggal: '', jamMulai: '', jamSelesai: ''
  });
  const [pesanError, setPesanError] = useState('');

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

  // Fungsi pembantu untuk mengambil jam (HH:MM) dari string timestamp teknis
  const formatJam = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPesanError('');
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

  return (
    <div className="min-h-screen bg-abasLight font-sans text-abasDark p-4 md:p-8">
      <header className="max-w-3xl mx-auto text-center my-8">
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-3">Mushola ABAS</h1>
        <p className="text-xs md:text-sm tracking-[0.2em] text-gray-500 uppercase font-medium">Portal Jadwal & Booking Kegiatan</p>
        <div className="w-16 h-[2px] bg-abasGold mx-auto mt-5"></div>
      </header>

      <main className="max-w-3xl mx-auto">
        <div className="space-y-3">
          {jadwal.filter(item => item.status !== 'Rejected').map((item) => {
            const tanggalCantik = new Date(item.tanggal).toLocaleDateString('id-ID', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
            // Menggunakan fungsi formatJam yang baru dibuat
            const jamMulaiCantik = formatJam(item.jamMulai);
            const jamSelesaiCantik = formatJam(item.jamSelesai);
            
            return (
              <div key={item.id} className="p-5 rounded-lg border-l-4 border-abasGold bg-white border-y border-r border-gray-100 shadow-sm hover:shadow-md">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-abasDark">{item.kegiatan}</h3>
                    <p className="text-sm text-gray-500">
                      📅 {tanggalCantik} | ⏰ {jamMulaiCantik} - {jamSelesaiCantik} WIB
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full font-semibold bg-[#ede6da] text-abasDark">{item.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}