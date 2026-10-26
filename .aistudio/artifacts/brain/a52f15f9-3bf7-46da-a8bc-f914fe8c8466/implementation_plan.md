# Pelan Penambahbaikan: Animasi Kaya, Efek Sinematik & Mekanik Baharu (Space Marine vs Tyranid)

Pelan komprehensif bagi menaik taraf permainan ke tahap arked premium bertaraf Survivor.io dengan animasi cecair terperinci (*rich animations*), efek visual partikel dramatik, kebolehan *Tactical Dash*, peti kurniaan *Imperial Relic Chest*, dron peninjau *Servo-Skull*, sistem kombo *Purge Streak*, dan maklum balas skrin dinamik (*game feel*).

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Mengikut keputusan "buat semua" yang anda pilih, kesemua ciri visual, mekanik baharu dan kesan maklum balas skrin akan digabungkan secara harmoni:
> - **Animasi & Efek**: Letupan sinematik berlapis, serpihan kitin bersepai, percikan bio-darah di lantai, animasi *Tactical Dash* dengan bayangan *afterimage*, dan atmosfera kabus/kilat gothic.
> - **Mekanik Permainan Baharu**: 
>   1. **Peti Kurniaan Imperial Relic (Drop Pod)** yang digugurkan oleh bos mini dengan animasi pembukaan ganjaran ala Survivor.io (memberi 1 hingga 3 naik taraf percuma).
>   2. **Purge Streak Combo**: Membina momentum pembunuhan berterusan untuk kelajuan tembakan ekstra dan bonus XP.
>   3. **Servo-Skull Companion**: Dron tengkorak terapung yang menembak laser sokongan dan menyedut biomass jauh secara automatik.
> - **Game Feel & Maklum Balas Skrin**:
>   - Gegaran skrin dinamik mengikut magnitud impak.
>   - *Hit-Stop* mikro (jeda 30ms apabila membunuh musuh besar untuk sensasi impak padu).
>   - Denyutan amaran merah (*Low HP vignette*) dan degupan jantung apabila nyawa genting.

---

### 1. Overview & Core Enhancements

- **Objektif**: Mengubah pertempuran daripada sekadar tembakan biasa kepada pengalaman arked yang sangat bertenaga, memuaskan (*satisfying*), dan penuh aksi visual.
- **Pengalaman Pemain**: Setiap tembakan, letupan, dan hayunan gergaji memberikan maklum balas visual dan audio yang memukau. Pemain mempunyai kebolehan aktif mengelak (*Dash*) untuk melepaskan diri dari kepungan maut Tyranid.

---

### 2. User Experience & Visual Design

#### A. Animasi & Efek Visual Pertempuran
1. **Tactical Combat Dash (Kekunci Spacebar / Butang Sentuh Dash)**:
   - Space Marine meluru pantas ke hadapan (kelajuan 2.5x selama 0.25 saat).
   - Menghasilkan bayangan piksel biru (*afterimages*) di sepanjang laluan dan debu ekzos di belakang.
   - Kebal (*invulnerable*) seketika semasa tempoh luncuran untuk menembusi kepungan gerombolan musuh.
   - Masa bertenang (cooldown) 3.5 saat dengan penunjuk visual cincin cas semula pada HUD.
2. **Kesan Letupan Berlapis & Serpihan Kitin**:
   - Letupan bom dan plasma menghasilkan cincin gelombang kejutan (*shockwave ring*), bebola api piksel, dan serpihan serangga bersepai (*shattered chitin debris*).
   - Percikan bio-darah ungu dan asid hijau kekal seketika di atas jubin lantai sebelum pudar.
3. **Atmosfera Gothic Hive City Dinamik**:
   - Partikel abu dan spora toksik melayang perlahan merentasi skrin.
   - Kilat jarak jauh sekali-sekala menyinari kawasan runtuhan bandar gothic secara rawak.

#### B. Mekanik Permainan Baharu (Survivor.io Loop)
1. **Imperial Relic Chest (Peti Drop Pod)**:
   - Muncul selepas menewaskan Tyranid Warrior atau Carnifex Boss.
   - Apabila pemain menyentuh peti, permainan berhenti seketika dengan modal pembukaan peti emas bercahaya yang memaparkan ganjaran kurniaan (1-3 Naik Taraf Senjata/Pasif percuma atau pemulihan penuh HP).
2. **Purge Streak Combo Meter**:
   - HUD memaparkan tolok kombo pembunuhan berterusan: `10x`, `25x`, `50x`, `100x PURGE STREAK!`.
   - Mengaktifkan mod *Emperor's Zeal*: Marine diselubungi aura emas bercahaya, kelajuan tembakan meningkat +25%, dan ganjaran biomass berganda.
3. **Servo-Skull Support Drone**:
   - Dron tengkorak terapung dengan kabel bergerak mengelilingi pemain.
   - Menembak pancaran laser merah mini ke arah serangga yang cuba mendekat dari sudut buta.
   - Bertindak sebagai pengumpul magnetik pasif untuk mengutip biomass spores yang terbiar jauh.

#### C. Screen Feel & Maklum Balas Sensori
- **Hit-Stop Micro-Freeze**: Hentaman kritikal pada Carnifex membekukan bingkai selama 30 milisaat untuk memberikan berat fizikal pada setiap serangan.
- **Low HP Pulse Vignette**: Apabila HP berada di bawah 30%, sempadan skrin berdenyut merah seirama dengan degupan jantung dramatik.

---

### 3. Technical Architecture & Component Mapping

```
┌─────────────────────────────────────────────────────────────┐
│                         React App                           │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                      HUD Layer                      │   │
│   │   - Level & XP Bar                                  │   │
│   │   - Survival Timer & Kill Counter                   │   │
│   │   - Purge Streak Meter (10x, 25x, 50x Aura)         │   │
│   │   - Dash Cooldown Indicator Widget                  │   │
│   │   - Low HP Pulsing Vignette Overlay                 │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              2D Pixel Canvas Game Engine            │   │
│   │   - Dash Physics & Afterimage Ghost Renderer        │   │
│   │   - Servo-Skull Entity AI & Auto-Zap Laser          │   │
│   │   - Relic Drop Pod Spawner & Proximity Trigger      │   │
│   │   - Chitin Fragment Physics & Blood Decals          │   │
│   │   - Atmospheric Ash & Ambient Lighting              │   │
│   │   - Dynamic Screen Shake & Hit-Stop Frame Controller│   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │               Modals & Interactive UI               │   │
│   │   - Relic Chest Opening Animation Modal             │   │
│   │   - Level Up 3-Card Selection & Reroll              │   │
│   │   - Mobile Touch Controls (D-Pad + Dash Button)     │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. Verification Plan

1. **Kompilasi & Kod**: Mengesahkan binaan melalui `compile_applet` dan `lint_applet` tanpa ralat jenis TypeScript.
2. **Ujian Fungsi & Game Feel**:
   - Ujian *Tactical Dash*: Memastikan luncuran lancar dengan bayangan *afterimage* dan kekebalan sementara.
   - Ujian *Relic Chest*: Muncul selepas pembunuhan bos/elite dan modal ganjaran membuka item dengan lancar.
   - Ujian *Purge Streak*: Tolok kombo meningkat dengan cepat dan memberikan rangsangan aura serta kelajuan.
   - Ujian *Servo-Skull*: Dron terbang seiring dengan pemain dan menembak laser sokongan secara automatik.
   - Ujian Kawalan Mudah Alih: Butang *Dash* di skrin sentuh berfungsi responsif di sebelah kayu bedik maya (*joystick*).
