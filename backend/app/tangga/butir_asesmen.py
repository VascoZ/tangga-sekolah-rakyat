"""
Butir Asesmen - Soal-soal per Tingkat untuk Literasi dan Numerasi
"""

from typing import List, Dict
import random


# === BUTIR LITERASI ===
BUTIR_LITERASI = {
    0: {  # Belum mengenal huruf
        "instruksi_guru": "Tunjukkan 5 huruf acak. Tanyakan: 'Huruf apa ini?'",
        "items": [
            {"huruf": "A", "jawaban": "A"},
            {"huruf": "B", "jawaban": "B"},
            {"huruf": "C", "jawaban": "C"},
            {"huruf": "D", "jawaban": "D"},
            {"huruf": "I", "jawaban": "I"},
        ],
    },
    1: {  # Mengenal huruf
        "instruksi_guru": "Tunjukkan huruf dan minta siswa menyebutkan nama dan bunyinya.",
        "items": [
            {"huruf": "M", "jawaban": "Em / m"},
            {"huruf": "S", "jawaban": "Es / s"},
            {"huruf": "L", "jawaban": "El / l"},
            {"huruf": "P", "jawaban": "Pe / p"},
            {"huruf": "N", "jawaban": "En / n"},
        ],
    },
    2: {  # Membaca suku kata
        "instruksi_guru": "Tunjuk suku kata. Tanyakan: 'Coba baca ini.'",
        "items": [
            {"teks": "BA-TU", "jawaban": "ba-tu"},
            {"teks": "RU-MAH", "jawaban": "ru-mah"},
            {"teks": "I-KAN", "jawaban": "i-kan"},
            {"teks": "SA-PI", "jawaban": "sa-pi"},
            {"teks": "BU-KU", "jawaban": "bu-ku"},
        ],
    },
    3: {  # Membaca kata utuh
        "instruksi_guru": "Tunjukkan kartu kata. Minta siswa membaca dengan lantang.",
        "items": [
            {"teks": "RUMAH", "jawaban": "rumah"},
            {"teks": "JALAN", "jawaban": "jalan"},
            {"teks": "POHON", "jawaban": "pohon"},
            {"teks": "SUNGAI", "jawaban": "sungai"},
            {"teks": "BALO", "jawaban": "balo"},  # pseudo-word
        ],
    },
    4: {  # Membaca kalimat
        "instruksi_guru": "Tunjukkan kalimat. Minta siswa membaca dengan lantang.",
        "items": [
            {"teks": "Ibu pergi ke pasar", "jawaban": "Ibu pergi ke pasar"},
            {"teks": "Adik bermain bola", "jawaban": "Adik bermain bola"},
            {"teks": "Ayah membaca koran", "jawaban": "Ayah membaca koran"},
            {"teks": "Kakak menyapu halaman", "jawaban": "Kakak menyapu halaman"},
            {"teks": "Nenek duduk di kursi", "jawaban": "Nenek duduk di kursi"},
        ],
    },
    5: {  # Membaca paragraf lancar
        "instruksi_guru": "Minta siswa membaca paragraf dengan lancar.",
        "teks": "Pagi ini, Budi pergi ke sekolah. Ia berjalan bersama teman-temannya. Di jalan, mereka melihat banyak pohon dan bunga. Budi senang karena hari ini cerah.",
        "items": [
            {"pertanyaan": "Baca paragraf dengan lancar", "jawaban": "lancar"},
        ],
    },
    6: {  # Memahami bacaan
        "instruksi_guru": "Setelah membaca paragraf, tanyakan pertanyaan berikut.",
        "teks": "Pagi ini, Budi pergi ke sekolah. Ia berjalan bersama teman-temannya. Di jalan, mereka melihat banyak pohon dan bunga. Budi senang karena hari ini cerah.",
        "items": [
            {"pertanyaan": "Siapa yang pergi ke sekolah?", "jawaban": "Budi", "tipe": "tersurat"},
            {"pertanyaan": "Apa yang mereka lihat di jalan?", "jawaban": "pohon dan bunga", "tipe": "tersurat"},
            {"pertanyaan": "Mengapa Budi senang?", "jawaban": "karena hari cerah", "tipe": "tersirat"},
        ],
    },
}

# === BUTIR NUMERASI ===
BUTIR_NUMERASI = {
    0: {  # Belum mengenal bilangan
        "instruksi_guru": "Tunjukkan 5 lambang bilangan. Tanyakan: 'Angka apa ini?'",
        "items": [
            {"bilangan": "1", "jawaban": "satu"},
            {"bilangan": "3", "jawaban": "tiga"},
            {"bilangan": "5", "jawaban": "lima"},
            {"bilangan": "7", "jawaban": "tujuh"},
            {"bilangan": "9", "jawaban": "sembilan"},
        ],
    },
    1: {  # Mengenal bilangan 1-9
        "instruksi_guru": "Tunjukkan bilangan dan minta siswa menyebutkan.",
        "items": [
            {"bilangan": "2", "jawaban": "dua"},
            {"bilangan": "4", "jawaban": "empat"},
            {"bilangan": "6", "jawaban": "enam"},
            {"bilangan": "8", "jawasan": "delapan"},
            {"bilangan": "5", "jawaban": "lima"},
        ],
    },
    2: {  # Bilangan 10-99 dan perbandingan
        "instruksi_guru": "Tanyakan bilangan dan mana yang lebih besar.",
        "items": [
            {"bilangan": "25", "jawaban": "dua puluh lima"},
            {"bilangan": "47", "jawaban": "empat puluh tujuh"},
            {"bilangan": "63", "jawaban": "enam puluh tiga"},
            {"pertanyaan": "Mana lebih besar: 25 atau 47?", "jawaban": "47"},
            {"pertanyaan": "Mana lebih besar: 63 atau 47?", "jawaban": "63"},
        ],
    },
    3: {  # Penjumlahan dan pengurangan
        "instruksi_guru": "Tanyakan hasil operasi berikut.",
        "items": [
            {"soal": "5 + 3 =", "jawaban": "8"},
            {"soal": "12 + 7 =", "jawaban": "19"},
            {"soal": "15 - 8 =", "jawaban": "7"},
            {"soal": "25 - 12 =", "jawaban": "13"},
            {"soal": "9 + 6 =", "jawaban": "15"},
        ],
    },
    4: {  # Perkalian dan pembagian
        "instruksi_guru": "Tanyakan hasil operasi berikut.",
        "items": [
            {"soal": "3 × 4 =", "jawaban": "12"},
            {"soal": "5 × 6 =", "jawaban": "30"},
            {"soal": "20 ÷ 4 =", "jawaban": "5"},
            {"soal": "35 ÷ 7 =", "jawaban": "5"},
            {"soal": "8 × 7 =", "jawaban": "56"},
        ],
    },
    5: {  # Soal cerita sederhana
        "instruksi_guru": "Baca soal cerita dan minta siswa menjawab.",
        "items": [
            {
                "soal": "Ani memiliki 15 buku. Ia memberikan 7 buku kepada Budi. Berapa buku yang tersisa?",
                "jawaban": "8",
            },
            {
                "soal": "Di keranjang ada 24 apel. Apel-apel itu dibagi sama rata ke 6 anak. Berapa apel untuk setiap anak?",
                "jawaban": "4",
            },
            {
                "soal": "Sebuah bus membawa 35 penumpang. Di terminal, 12 penumpang turun dan 8 penumpang naik. Berapa penumpang sekarang?",
                "jawaban": "31",
            },
        ],
    },
}


def get_items_for_tingkat(jenis: str, tingkat: int) -> Dict:
    """Mendapatkan butir soal untuk tingkat tertentu"""
    if jenis == "LITERASI":
        return BUTIR_LITERASI.get(tingkat, {})
    elif jenis == "NUMERASI":
        return BUTIR_NUMERASI.get(tingkat, {})
    return {}


def generate_asesmen_items(jenis: str, tingkat: int, jumlah: int = 5) -> List[Dict]:
    """Generate sejumlah item asesmen untuk tingkat tertentu"""
    items_data = get_items_for_tingkat(jenis, tingkat)
    if not items_data:
        return []
    
    items = items_data.get("items", [])
    if len(items) <= jumlah:
        return items
    
    return random.sample(items, jumlah)