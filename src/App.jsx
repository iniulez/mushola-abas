import React, { useState, useEffect } from 'react';

export default function App() {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ pic: '', whatsapp: '', kegiatan: '', tanggal: '', jamMulai: '', jamSelesai: '' });
  const [pesanError, setPesanError] = useState('');

  const API_URL = "https://script.google.com/macros/s/AKfycbywsY3YpVn6BC_iKcK0HhvEdwe4WogqPVtEoM36jn2VHzvtW3VANPvTmyYpmke--0q9CA/exec";

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => { setJadwal(data); setLoading(false); })
      .catch(err => { console.error("Gagal memuat data:", err); setLoading(false); });
  }, []);

  const formatJam = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } catch (error) { alert("Terjadi kesalahan, coba lagi nanti."); }
  };

  return (
    <div className="min-h-screen bg-abasLight font-sans text-abasDark p-4 md:p-8">
      <header className="max-w-3xl mx-auto text-center my-8">
        <h1 className="font-serif text-4xl font-bold mb-3">Mushola Abu Bakar Ash Shiddiq Cluster Bambu Ori Taman Yasmin Sektor 7 Bogor Barat</h1>
        <p className="text-sm text-gray-500 uppercase tracking-widest">Portal Jadwal & Booking Kegiatan</p>
        <div className="w-16 h-[2px] bg-abasGold mx-auto mt-5"></div>
      </header>

      {/* TOMBOL BOOKING KEMBALI HADIR */}
      <div className="max-w-3xl mx-auto mb-6 text-center">
        <button onClick={() => setShowForm(true)} className="bg-abasDark text-white px-6 py-3 rounded-lg font-medium hover:bg-abasGold transition-colors">
          + Ajukan Booking Ruangan
        </button>
      </div>

      <main className="max-w-3xl mx-auto space-y-3">
        {loading ? <p className="text-center italic text-gray-400">Memuat jadwal...</p> : 
          jadwal.filter(item => item.status !== 'Rejected').map((item) => {
            const tanggalCantik = new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            return (
              <div key={item.id} className="p-5 rounded-lg border-l-4 border-abasGold bg-white border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-serif font-bold text-lg">{item.kegiatan}</h3>
                  <p className="text-sm text-gray-500">📅 {tanggalCantik} | ⏰ {formatJam(item.jamMulai)} - {formatJam(item.jamSelesai)} WIB</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full font-semibold bg-[#ede6da]">{item.status}</span>
              </div>
            );
          })
        }
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-serif text-2xl font-bold">Ajukan Booking</h3>
            <input type="text" placeholder="Nama Kegiatan" required className="w-full p-2 border rounded" onChange={e => setFormData({...formData, kegiatan: e.target.value})} />
            <input type="text" placeholder="Penanggung Jawab" required className="w-full p-2 border rounded" onChange={e => setFormData({...formData, pic: e.target.value})} />
            <input type="date" required className="w-full p-2 border rounded" onChange={e => setFormData({...formData, tanggal: e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
              <input type="time" required className="w-full p-2 border rounded" onChange={e => setFormData({...formData, jamMulai: e.target.value})} />
              <input type="time" required className="w-full p-2 border rounded" onChange={e => setFormData({...formData, jamSelesai: e.target.value})} />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="w-1/2 bg-gray-100 py-2 rounded">Batal</button>
              <button type="submit" className="w-1/2 bg-abasGold text-white py-2 rounded">Kirim</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}