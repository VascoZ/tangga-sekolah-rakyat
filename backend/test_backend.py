"""
Test script to verify TANGGA backend is working correctly
"""

import sys
sys.path.insert(0, '.')

# Test imports
print("Testing imports...")
try:
    from app.main import app
    from app.models import Sekolah, Siswa, PosisiTangga, AsesmenSiswa
    from app.schemas import AsesmenMulai, JenisAsesmen
    from app.tangga.definisi import TANGGA_LITERASI, TANGGA_NUMERASI, get_tangga_label
    from app.tangga.penempatan import AsesmenAdaptif, tentukan_kelompok
    print("[OK] All imports successful")
except Exception as e:
    print(f"[ERROR] Import error: {e}")
    sys.exit(1)

# Test tangga definitions
print("\nTesting tangga definitions...")
try:
    assert len(TANGGA_LITERASI) == 7, "Literasi should have 7 levels"
    assert len(TANGGA_NUMERASI) == 6, "Numerasi should have 6 levels"
    assert get_tangga_label("LITERASI", 0) == "Belum Mengenal Huruf"
    assert get_tangga_label("LITERASI", 6) == "Memahami Bacaan"
    assert get_tangga_label("NUMERASI", 0) == "Belum Mengenal Bilangan"
    print("[OK] Tangga definitions correct")
except Exception as e:
    print(f"[ERROR] Tangga definition error: {e}")
    sys.exit(1)

# Test adaptive assessment logic
print("\nTesting adaptive assessment logic...")
try:
    asesmen = AsesmenAdaptif(jenis="LITERASI", tingkat_awal=2)
    assert asesmen.tingkat_awal == 2
    assert asesmen.max_tingkat == 6
    
    # Test starting level
    start_level = asesmen.mulai_dari_tingkat(2)
    assert start_level == 2
    
    # Test recording answers
    asesmen.catat_jawaban(1, 2, True)
    asesmen.catat_jawaban(2, 2, True)
    asesmen.catat_jawaban(3, 2, True)
    asesmen.catat_jawaban(4, 2, True)
    asesmen.catat_jawaban(5, 2, True)
    
    # Test evaluation
    result = asesmen.evaluasi_tingkat(2)
    assert result == "lulus", "Should pass with 5/5 correct"
    
    # Test next step
    langkah = asesmen.tentukan_langkah_selanjutnya()
    assert langkah["aksi"] == "naik"
    assert langkah["tingkat_berikutnya"] == 3
    
    print("[OK] Adaptive assessment logic correct")
except Exception as e:
    print(f"[ERROR] Adaptive assessment error: {e}")
    sys.exit(1)

# Test kelompok determination
print("\nTesting kelompok determination...")
try:
    assert tentukan_kelompok(0) == "awal"
    assert tentukan_kelompok(1) == "awal"
    assert tentukan_kelompok(2) == "awal"
    assert tentukan_kelompok(3) == "tengah"
    assert tentukan_kelompok(4) == "tengah"
    assert tentukan_kelompok(5) == "lanjut"
    assert tentukan_kelompok(6) == "lanjut"
    print("[OK] Kelompok determination correct")
except Exception as e:
    print(f"[ERROR] Kelompok error: {e}")
    sys.exit(1)

# Test FastAPI app
print("\nTesting FastAPI app...")
try:
    from fastapi.testclient import TestClient
    client = TestClient(app)
    
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    print("[OK] Health endpoint working")
    
    response = client.get("/api/info")
    assert response.status_code == 200
    data = response.json()
    assert "nama" in data
    print("[OK] Info endpoint working")
    
except Exception as e:
    print(f"[ERROR] FastAPI error: {e}")
    sys.exit(1)

print("\n" + "="*50)
print("All tests passed!")
print("="*50)