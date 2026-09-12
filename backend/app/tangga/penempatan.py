"""
Logika Penempatan Tangga - Algoritma Adaptif untuk Asesmen
"""

from typing import List, Dict, Tuple, Optional
from app.tangga.definisi import get_max_tangga, get_tangga_label


class AsesmenAdaptif:
    """
    Kelas untuk mengelola asesmen adaptif.
    Algoritma: mulai dari tingkat terakhir, naik jika lulus 3/5, mundur jika gagal.
    """
    
    def __init__(self, jenis: str, tingkat_awal: int = 0):
        self.jenis = jenis  # LITERASI atau NUMERASI
        self.tingkat_awal = tingkat_awal
        self.tingkat_saat_ini = tingkat_awal
        self.max_tingkat = get_max_tangga(jenis)
        
        # Track jawaban per tingkat
        self.jawaban_per_tingkat: Dict[int, List[bool]] = {}
        
        # Track history
        self.history: List[Dict] = []
        
        # Hasil akhir
        self.hasil_tingkat: Optional[int] = None
        self.selesai = False
    
    def mulai_dari_tingkat(self, tingkat_terakhir: int) -> int:
        """
        Menentukan tingkat awal asesmen berdasarkan posisi terakhir.
        Jika belum pernah asesmen, mulai dari 0.
        """
        if tingkat_terakhir is None or tingkat_terakhir < 0:
            self.tingkat_awal = 0
        else:
            self.tingkat_awal = min(tingkat_terakhir, self.max_tingkat)
        
        self.tingkat_saat_ini = self.tingkat_awal
        return self.tingkat_saat_ini
    
    def catat_jawaban(self, item_ke: int, tingkatan: int, jawaban: bool) -> None:
        """Mencatat jawaban untuk satu item"""
        if tingkatan not in self.jawaban_per_tingkat:
            self.jawaban_per_tingkat[tingkatan] = []
        
        self.jawaban_per_tingkat[tingkatan].append(jawaban)
        
        # Tambah ke history
        self.history.append({
            "item_ke": item_ke,
            "tingkatan": tingkatan,
            "jawaban": jawaban,
        })
    
    def evaluasi_tingkat(self, tingkatan: int) -> str:
        """
        Mengevaluasi apakah lulus tingkat tertentu.
        Kriteria: minimal 3 dari 5 benar.
        """
        jawaban_list = self.jawaban_per_tingkat.get(tingkatan, [])
        if len(jawaban_list) < 5:
            return "belum_selesai"
        
        benar = sum(jawaban_list)
        if benar >= 3:
            return "lulus"
        else:
            return "tidak_lulus"
    
    def tentukan_langkah_selanjutnya(self) -> Dict:
        """
        Menentukan langkah selanjutnya setelah mengevaluasi tingkat saat ini.
        
        Returns:
            Dict dengan keys:
            - aksi: "naik", "turun", "selesai"
            - tingkat_berikutnya: int atau None
            - hasil: int atau None (jika selesai)
        """
        evaluasi = self.evaluasi_tingkat(self.tingkat_saat_ini)
        
        if evaluasi == "lulus":
            # Naik satu tingkat
            tingkat_berikutnya = self.tingkat_saat_ini + 1
            
            if tingkat_berikutnya > self.max_tingkat:
                # Sudah di tingkat tertinggi
                self.hasil_tingkat = self.max_tingkat
                self.selesai = True
                return {
                    "aksi": "selesai",
                    "tingkat_berikutnya": None,
                    "hasil": self.max_tingkat,
                    "pesan": f"Selamat! Anda mencapai tingkat tertinggi: {get_tangga_label(self.jenis, self.max_tingkat)}",
                }
            
            self.tingkat_saat_ini = tingkat_berikutnya
            return {
                "aksi": "naik",
                "tingkat_berikutnya": tingkat_berikutnya,
                "hasil": None,
                "pesan": f"Naik ke tingkat {tingkat_berikutnya}: {get_tangga_label(self.jenis, tingkat_berikutnya)}",
            }
        
        elif evaluasi == "tidak_lulus":
            # Mundur satu tingkat atau selesai
            tingkat_berikutnya = self.tingkat_saat_ini - 1
            
            if tingkat_berikutnya < 0:
                # Sudah di tingkat terendah
                self.hasil_tingkat = 0
                self.selesai = True
                return {
                    "aksi": "selesai",
                    "tingkat_berikutnya": None,
                    "hasil": 0,
                    "pesan": f"Titik pijak: Tingkat 0 - {get_tangga_label(self.jenis, 0)}",
                }
            
            # Cek apakah sudah pernah gagal di tingkat sebelumnya
            if tingkat_berikutnya in self.jawaban_per_tingkat:
                # Sudah pernah dicoba, berarti ini hasilnya
                self.hasil_tingkat = tingkat_berikutnya
                self.selesai = True
                return {
                    "aksi": "selesai",
                    "tingkat_berikutnya": None,
                    "hasil": tingkat_berikutnya,
                    "pesan": f"Titik pijak: Tingkat {tingkat_berikutnya} - {get_tangga_label(self.jenis, tingkat_berikutnya)}",
                }
            
            self.tingkat_saat_ini = tingkat_berikutnya
            return {
                "aksi": "turun",
                "tingkat_berikutnya": tingkat_berikutnya,
                "hasil": None,
                "pesan": f"Mencoba tingkat {tingkat_berikutnya}: {get_tangga_label(self.jenis, tingkat_berikutnya)}",
            }
        
        else:  # belum_selesai
            return {
                "aksi": "lanjut",
                "tingkat_berikutnya": self.tingkat_saat_ini,
                "hasil": None,
                "pesan": "Lanjutkan item berikutnya",
            }
    
    def get_hasil(self) -> Dict:
        """Mendapatkan hasil akhir asesmen"""
        return {
            "jenis": self.jenis,
            "tingkat_awal": self.tingkat_awal,
            "tingkat_hasil": self.hasil_tingkat,
            "label_hasil": get_tangga_label(self.jenis, self.hasil_tingkat) if self.hasil_tingkat is not None else None,
            "history": self.history,
            "jawaban_per_tingkat": {k: sum(v) for k, v in self.jawaban_per_tingkat.items()},
            "selesai": self.selesai,
        }


def hitung_pergerakan(tingkat_awal: int, tingkat_akhir: int) -> int:
    """Menghitung pergerakan (naik/turun) dalam satuan tingkat"""
    return tingkat_akhir - tingkat_awal


def tentukan_kelompok(tingkat: int) -> str:
    """
    Menentukan kelompok berdasarkan tingkat.
    
    Kelompok:
    - "awal": Tingkat 0-2 (Belum Baca Kata)
    - "tengah": Tingkat 3-4 (Baca Kata-Kalimat)
    - "lanjut": Tingkat 5-6 (Baca Paragraf-Paham)
    """
    if tingkat <= 2:
        return "awal"
    elif tingkat <= 4:
        return "tengah"
    else:
        return "lanjut"


def get_kelompok_label(kelompok: str) -> str:
    """Mendapatkan label kelompok"""
    labels = {
        "awal": "Kelompok Awal (T0-2: Belum Baca Kata)",
        "tengah": "Kelompok Tengah (T3-4: Baca Kata-Kalimat)",
        "lanjut": "Kelompok Lanjut (T5-6: Baca Paragraf-Paham)",
    }
    return labels.get(kelompok, "Tidak Diketahui")