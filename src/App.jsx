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

  const periksaBentrok = (inputBaru) => {
    const jadwalHariSama = jadwal.filter(j => 
      j.tanggal === inputBaru.tanggal && j.status !== 'Rejected'
    );
    for (let j of jadwalHariSama) {
      if (inputBaru.jamMulai < j.jamSelesai && inputBaru.jamSelesai > j.jamMulai) {
        return {
          bentrok: true,
          pesan: `Mohon maaf, slot waktu telah terisi oleh "${j.kegiatan}" (${j.jamMulai}-${j.jamSelesai} WIB).`
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
      alert("Pengajuan berhasil dikirim ke database DKM!");
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
        <p className="text-xs md:text-sm tracking-[0.2em] text-gray-500 uppercase font-medium">
          Abu Bakar Ash Shiddiq — Portal Jadwal & Booking Kegiatan
        </p>
        <div className="w-16 h-[2px] bg-abasGold mx-auto mt-5"></div>
      </header>

      <div className="max-w-3xl mx-auto mb-8 flex justify-between items-center">
        <h2 className="font-serif text-xl font-semibold">Daftar Agenda</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-abasDark text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-abasGold transition-colors duration-300 shadow-sm"
        >
          + Ajukan Booking Ruangan
        </button>
      </div>

      <main className="max-w-3xl mx-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-400 font-serif italic">Memuat jadwal mushola...</div>
        ) : (
          <div className="space-y-3">
            {jadwal.filter(item => item.status !== 'Rejected').map((item) => (
              <div key={item.id} onClick={() => setSelectedEvent(item)} className="p-5 rounded-lg border-l-4 border-abasGold bg-white border-y border-r border-gray-100 shadow-sm hover:shadow-md cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-abasDark">{item.kegiatan}</h3>
                    <p className="text-sm text-gray-500">{item.tanggal} | {item.jamMulai} - {item.jamSelesai} WIB</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full font-semibold bg-[#ede6da] text-abasDark">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 max-w-md w-full rounded-xl p-6 shadow-2xl">
            <h3 className="font-serif text-2xl font-bold mb-4">Ajukan Booking</h3>
            {pesanError && <div className="bg-red-50 p-3 mb-4 text-xs text-red-700 font-medium border-l-4 border-red-500">⚠️ {pesanError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <input type="text" placeholder="Nama Kegiatan" required className="w-full p-2.5 border rounded-md" onChange={e => setFormData({...formData, kegiatan: e.target.value})} />
              <input type="text" placeholder="Penanggung Jawab" required className="w-full p-2.5 border rounded-md" onChange={e => setFormData({...formData, pic: e.target.value})} />
              <input type="tel" placeholder="No. WhatsApp" required className="w-full p-2.5 border rounded-md" onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
              <input type="date" required className="w-full p-2.5 border rounded-md" onChange={e => setFormData({...formData, tanggal: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="time" required className="w-full p-2.5 border rounded-md" onChange={e => setFormData({...formData, jamMulai: e.target.value})} />
                <input type="time" required className="w-full p-2.5 border rounded-md" onChange={e => setFormData({...formData, jamSelesai: e.target.value})} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="w-1/2 bg-gray-100 py-2.5 rounded-md">Batal</button>
                <button type="submit" className="w-1/2 bg-abasGold text-white py-2.5 rounded-md">Kirim</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}