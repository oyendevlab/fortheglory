# Cadangan Naik Taraf Karakter Pixel (Space Marine & Tyranid)

Berdasarkan 2 imej rujukan yang anda berikan, berikut adalah pelan transformasi lengkap bagi semua karakter di dalam permainan agar mempunyai gaya seni piksel *chunky*, garisan hitam kemas (*black outline*), bayang terperinci, dan warna rasmi Warhammer 40k.

---

## 1. Rujukan Imej yang Diberikan

### Rujukan Space Marine (Ultramarine Chibi Arcade)
![Space Marine Reference](/public/assets/aistudio/Screenshot_2026-10-23_at_1.57.41_PM_15ee0167.png)
- **Ciri Khas**:
  - Garisan luar hitam tebal (*bold black pixel outline*) yang sangat jelas di atas lantai industri.
  - Kubah topi keledar bersudut dengan lambang helang emas (*golden crest*) di dahi.
  - Visor hitam dengan sepasang kanta mata merah menyala (*angular ruby-red eye lenses*).
  - Paip sensor *Auspex* di sisi topi keledar.
  - Bahu kiri (*pauldron*) besar dengan lambang **Ultima "U" emas** serta meterai kesucian lilin merah berserta riben panjang melambai di belakang (*purity seal ribbon*).
  - Senjata **Godwyn Boltgun** terperinci dengan lambang sayap Aquila emas, muncung laras keluli, dan tabard merah tergantung di antara kaki.

---

### Rujukan Tyranid (Hormagaunt Swarm)
![Tyranid Reference](/public/assets/aistudio/Screenshot_2026-10-23_at_1.58.50_PM_25d9c086.png)
- **Ciri Khas**:
  - Kulit bio-organik ungu muda / *lilac* lembut (`#d8b4e2` & `#e9d5ff`) dengan tompokan bintik merah jambu.
  - Lapisan kitin bergerigi ungu gelap (*deep violet carapace*) di sepanjang belakang dan kepala (`#6b21a8` & `#4c1d95`).
  - Sepasang cakar sabit depan merah kirmizi (*crimson scything talons*) tajam (`#e11d48` & `#be123c`).
  - Ekor bersenggat melengkung dan postur lari raptor yang sangat dinamik.

---

## 2. Spesifikasi Lengkap Semua Karakter yang Dinaik Taraf

| Karakter | Peranan / Saiz | Ciri Reka Bentuk Baru Berpandukan Rujukan | Palet Warna Utama |
| :--- | :--- | :--- | :--- |
| **Space Marine (Ultramarine)** | Watak Utama (38×36 px) | Mengikut sepenuhnya gaya imej 1: Garisan hitam luar, helmet kubah, kanta merah ruby tajam, lambang Ultima emas, riben kesucian merah melambai, dan Boltgun Aquila emas. Animasi berjalan menggerakkan sabaton boot dan hayunan riben. | Biru Kobalt (`#0284c7`), Biru Gelap (`#075985`), Emas (`#f59e0b`), Merah Lilin (`#dc2626`), Hitam Garisan (`#0f172a`). |
| **Hormagaunt** | Musuh Gerombolan Pantas (32×24 px) | Mengikut sepenuhnya gaya imej 2: Tubuh raptor berkulit lilac cerah, kitin belakang ungu tajam berlapis 3, cakar sabit merah carmine bersedia merodok mangsa, dan ekor melibas ketika mengejar. | Kulit Lilac (`#d8b4e2`), Kitin Ungu Gelap (`#581c87`), Cakar Merah (`#e11d48`). |
| **Termagant** | Penembak Asid Jarak Sederhana (34×24 px) | Tubuh serupa dengan Hormagaunt tetapi membawa bio-simbiot **Fleshborer** hijau berbisa di bahagian lengan hadapan, menyembur titisan larva asid bercahaya. | Lilac (`#d8b4e2`), Kitin Violet (`#4c1d95`), Senjata Bio-Hijau (`#84cc16`). |
| **Genestealer** | Pembunuh Lincah 4 Lengan (38×32 px) | Mengadaptasi rujukan dengan skala lebih tegap: 4 lengan serentak (2 cakar rending putih gading di atas + 2 cakar bawah), kepala licin berurat bio-alien, perisai kitin biru gelap/indigo. | Biru Indigo Gelap (`#312e81`), Kitin Ungu Gelap (`#4338ca`), Kuku Tulang (`#f1f5f9`). |
| **Tyranid Warrior** | Pemimpin Sinaptik (48×44 px) | Saiz 2x ganda lebih besar: Mahkota kepala sinaptik tebal, twin bio-swords merah kirmizi menyala, rongga pernafasan beracun di bahagian belakang. | Kitin Ungu Diraja (`#3b0764`), Daging Ungu (`#7e22ce`), Pedang Tulang Asid Merah (`#f43f5e`). |
| **Carnifex Boss** | Raksasa Behemoth (74×64 px) | Raksasa gergasi living battering ram: Kitin hitam-ungu ultra-tebal, sepasang Scything Claws raksasa berwarna merah darah, cerobong spora belakang mengeluarkan kepulan gas hijau bio-toksik, dan mata kuning predator. | Ungu Gelap Pekat (`#2e1065`), Cakar Darah (`#be123c`), Gas Spora Hijau (`#22c55e`), Garisan Hitam Tegap. |

---

## 3. Peringkat Seterusnya

Sekiranya anda berpuas hati dengan gaya dan padanan reka bentuk semua karakter di atas:
1. Tekan butang **Proceed** atau nyatakan persetujuan anda.
2. Kami akan segera mengemas kini kod lukisan piksel kanvas di `src/game/pixelSprites.ts` untuk memaparkan karakter-karakter terperinci ini secara langsung dalam permainan!
