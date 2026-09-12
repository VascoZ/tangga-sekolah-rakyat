"""
Tangga Kemampuan - Definisi 7 Tingkat Literasi dan 6 Tingkat Numerasi
"""

from typing import List, Dict, Tuple
from enum import Enum


class JenisTangga(str, Enum):
    LITERASI = "LITERASI"
    NUMERASI = "NUMERASI"


# === TANGGA LITERASI (7 tingkat) ===
TANGGA_LITERASI = [
    {
        "tingkat": 0,
        "label": "Belum Mengenal Huruf",
        "deskripsi": "Siswa belum dapat mengenali huruf-huruf alfabet.",
        "kemampuan": "Belum dapat menyebutkan nama huruf yang ditunjuk.",
    },
    {
        "tingkat": 1,
        "label": "Mengenal Huruf",
        "deskripsi": "Siswa dapat mengenali huruf-huruf alfabet dan menyebutkan bunyinya.",
        "kemampuan": "Dapat menyebutkan nama dan bunyi huruf yang ditunjuk.",
    },
    {
        "tingkat": 2,
        "label": "Membaca Suku Kata",
        "deskripsi": "Siswa dapat membaca suku kata (ba-tu, ru-mah, i-kan).",
        "kemampuan": "Dapat membaca suku kata sederhana dengan benar.",
    },
    {
        "tingkat": 3,
        "label": "Membaca Kata Utuh",
        "deskripsi": "Siswa dapat membaca kata utuh (batu, rumah, kucing).",
        "kemampuan": "Dapat membaca kata utuh termasuk kata pseudo (balo, tugi).",
    },
    {
        "tingkat": 4,
        "label": "Membaca Kalimat",
        "deskripsi": "Siswa dapat membaca kalimat sederhana (4-6 kata).",
        "kemampuan": "Dapat membaca kalimat dengan lancar.",
    },
    {
        "tingkat": 5,
        "label": "Membaca Paragraf Lancar",
        "deskripsi": "Siswa dapat membaca paragraf pendek dengan lancar.",
        "kemampuan": "Dapat membaca paragraf dengan intonasi yang tepat.",
    },
    {
        "tingkat": 6,
        "label": "Memahami Bacaan",
        "deskripsi": "Siswa dapat memahami bacaan dan menjawab pertanyaan.",
        "kemampuan": "Dapat menjawab pertanyaan tersurat dan tersirat.",
    },
]

# === TANGGA NUMERASI (6 tingkat) ===
TANGGA_NUMERASI = [
    {
        "tingkat": 0,
        "label": "Belum Mengenal Bilangan",
        "deskripsi": "Siswa belum dapat mengenali lambang bilangan.",
        "kemampuan": "Belum dapat menyebutkan bilangan yang ditunjuk.",
    },
    {
        "tingkat": 1,
        "label": "Mengenal Bilangan 1-9",
        "deskripsi": "Siswa dapat mengenali bilangan 1-9.",
        "kemampuan": "Dapat menyebutkan dan menunjuk bilangan 1-9.",
    },
    {
        "tingkat": 2,
        "label": "Bilangan 10-99 dan Perbandingan",
        "deskripsi": "Siswa dapat membilang 10-99 dan membandingkan bilangan.",
        "kemampuan": "Dapat menyebutkan bilangan puluhan dan membandingkan mana lebih besar.",
    },
    {
        "tingkat": 3,
        "label": "Penjumlahan dan Pengurangan",
        "deskripsi": "Siswa dapat melakukan operasi penjumlahan dan pengurangan.",
        "kemampuan": "Dapat menjumlahkan dan mengurangkan bilangan sederhana.",
    },
    {
        "tingkat": 4,
        "label": "Perkalian dan Pembagian",
        "deskripsi": "Siswa dapat melakukan operasi perkalian dan pembagian.",
        "kemampuan": "Dapat mengalikan dan membagi bilangan sederhana.",
    },
    {
        "tingkat": 5,
        "label": "Soal Cerita Sederhana",
        "deskripsi": "Siswa dapat menyelesaikan soal cerita sederhana.",
        "kemampuan": "Dapat memahami soal cerita dan menentukan operasi yang tepat.",
    },
]


def get_tangga_label(jenis: str, tingkat: int) -> str:
    """Mendapatkan label tangga berdasarkan jenis dan tingkat"""
    if jenis == "LITERASI":
        if 0 <= tingkat < len(TANGGA_LITERASI):
            return TANGGA_LITERASI[tingkat]["label"]
    elif jenis == "NUMERASI":
        if 0 <= tingkat < len(TANGGA_NUMERASI):
            return TANGGA_NUMERASI[tingkat]["label"]
    return "Tidak Diketahui"


def get_tangga_deskripsi(jenis: str, tingkat: int) -> str:
    """Mendapatkan deskripsi tangga"""
    if jenis == "LITERASI":
        if 0 <= tingkat < len(TANGGA_LITERASI):
            return TANGGA_LITERASI[tingkat]["deskripsi"]
    elif jenis == "NUMERASI":
        if 0 <= tingkat < len(TANGGA_NUMERASI):
            return TANGGA_NUMERASI[tingkat]["deskripsi"]
    return ""


def get_max_tangga(jenis: str) -> int:
    """Mendapatkan tingkat maksimum untuk jenis tangga"""
    if jenis == "LITERASI":
        return len(TANGGA_LITERASI) - 1
    elif jenis == "NUMERASI":
        return len(TANGGA_NUMERASI) - 1
    return 0