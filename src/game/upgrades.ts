import { WeaponConfig, PassiveConfig, UpgradeOption, WeaponId, PassiveId, WargearRelic, WargearRelicId } from '../types/game';

export const WARGEAR_RELICS: Record<WargearRelicId, WargearRelic> = {
  relic_macragge: {
    id: 'relic_macragge',
    name: 'Standard of Macragge',
    desc: 'Setiap 4 saat, panahan kilat orbit menyambar musuh berdekatan & memulihkan +8 Perisai.',
    icon: 'Ω'
  },
  chalice_sanguinius: {
    id: 'chalice_sanguinius',
    name: 'Red Grail of Sanguinius',
    desc: 'Setiap 15 bunuhan mencetuskan gelombang darah AoE & memulihkan +6 HP.',
    icon: '🩸'
  },
  pelt_fenris: {
    id: 'pelt_fenris',
    name: 'Frost Pelt of Fenris',
    desc: 'Aura fros memperlahankan musuh berdekatan sebanyak 30% & +15% Peluang Crit.',
    icon: '🐺'
  },
  vulkan_sigil: {
    id: 'vulkan_sigil',
    name: 'Anvil Sigil of Vulkan',
    desc: 'Semua serangan mempunyai 35% peluang membakar musuh (Promethium Burn) & +20% Damage.',
    icon: '🔥'
  }
};

export const INITIAL_WEAPONS: Record<WeaponId, WeaponConfig> = {
  bolter: {
    id: 'bolter',
    name: 'Godwyn Boltgun',
    shortDesc: 'Tembakan peluru reaktif automatik ke arah musuh terdekat.',
    icon: 'bolter',
    level: 1, // Starts at level 1
    maxLevel: 5,
    cooldown: 0.45,
    timer: 0,
    damage: 28,
    descriptionByLevel: [
      'Menembak peluru .75 kaliber secara automatik ke arah sasaran terdekat.',
      '+30% Kelajuan tembakan & +25% Kerosakan.',
      'Menembak 2 peluru serentak (Dwi-tembakan berterusan).',
      'Peluru meletup kecil dan menembusi 1 musuh tambahan.',
      'Evolusi: Imperial Wrath Boltgun - Menembak 3 peluru bertubi-tubi dengan letupan berganda.'
    ]
  },
  heavy_bolter: {
    id: 'heavy_bolter',
    name: 'Heavy Bolter Vulcan',
    shortDesc: 'Meriam berputar menembak rentetan peluru berat tanpa henti ala Gatling.',
    icon: 'heavy_bolter',
    level: 0,
    maxLevel: 5,
    cooldown: 0.12,
    timer: 0,
    damage: 18,
    descriptionByLevel: [
      'Menembak aliran peluru berat berterusan pada kelajuan sangat tinggi (Gatling stream).',
      '+35% Kelajuan tembakan & jarak tembakan lebih jauh.',
      'Dwi-laras berputar: Menembak 2 aliran peluru serentak!',
      'Peluru penembus perisai: Menembusi 2 musuh dan tolak musuh ke belakang.',
      'Evolusi: Devastator Rotary Cannon - 4 laras menembak peluru berletup membanjiri skrin.'
    ]
  },
  lascannon: {
    id: 'lascannon',
    name: 'Godhammer Lascannon',
    shortDesc: 'Pancaran laser bertenaga tinggi yang membelah medan perang dan memantul.',
    icon: 'lascannon',
    level: 0,
    maxLevel: 5,
    cooldown: 1.5,
    timer: 0,
    damage: 110,
    descriptionByLevel: [
      'Pancaran laser maut dari langit/senjata menyambar musuh dalam garis lurus.',
      '+1 Pancaran laser tambahan serentak & +30% kerosakan.',
      'Kesan Kilat Berantai: Laser memantul (chain-arcs) ke 3 Tyranid berdekatan.',
      '-25% Masa bertenang & ketebalan pancaran laser bertambah.',
      'Evolusi: Orbital Lance Strike - 3 laser gergasi membelah skrin dengan letupan elektrik.'
    ]
  },
  orbiting_shield: {
    id: 'orbiting_shield',
    name: 'Storm Shield Barrier',
    shortDesc: 'Perisai Storm Shield berputar menyekat projektil musuh dan menghentam Tyranid.',
    icon: 'shield_orbit',
    level: 0,
    maxLevel: 5,
    cooldown: 0, // continuous
    timer: 0,
    damage: 24,
    descriptionByLevel: [
      '2 perisai tenaga Storm Shield berputar keliling anda, menyerap asid dan memukul musuh.',
      '+1 Perisai tambahan (Jumlah 3 perisai berputar) & +30% tolakan musuh.',
      '+40% Kelajuan putaran dan kerosakan hentaman.',
      '+1 Perisai lagi (Jumlah 4 perisai membentuk benteng pertahanan kukuh).',
      'Evolusi: Aegis of Terra - Perisai mengeluarkan letupan renjatan elektrik setiap kali berlanggar!'
    ]
  },
  vortex_grenade: {
    id: 'vortex_grenade',
    name: 'Warp Vortex Grenade',
    shortDesc: 'Mencipta lohong hitam graviti yang menyedut ratusan Tyranid sebelum meletup.',
    icon: 'vortex',
    level: 0,
    maxLevel: 5,
    cooldown: 3.2,
    timer: 0,
    damage: 90,
    descriptionByLevel: [
      'Melontar bom warp yang membuka pusaran graviti (Vortex) menyedut musuh selama 2 saat.',
      '+40% Radius tarikan graviti vortex dan tempoh pusaran.',
      'Graviti penghancur: Tyranid yang tersedut menerima kerosakan berterusan.',
      'Melontar 2 bom vortex serentak di dua kawasan berbeza.',
      'Evolusi: Singularity Supernova - Pusaran raksasa yang meletup dengan kuasa kosmik.'
    ]
  },
  thunder_hammer: {
    id: 'thunder_hammer',
    name: 'Thunder Hammer Smash',
    shortDesc: 'Hentaman tukul petir ke tanah melepaskan gelombang kejutan elektrik 360 darjah.',
    icon: 'hammer',
    level: 0,
    maxLevel: 5,
    cooldown: 2.2,
    timer: 0,
    damage: 85,
    descriptionByLevel: [
      'Menghantam tanah melepaskan gelombang kejutan elektrik bulat 360 darjah merosakkan musuh.',
      '+35% Radius gelombang kejutan & +25% kerosakan.',
      'Renjatan kilat: Musuh yang terkena kaku seketika (Stun 1 saat).',
      'Dwi-gelombang kejutan serentak berturutan.',
      'Evolusi: Wrath of the Storm - 3 gelombang petir gergasi meninggalkan medan elektrik membakar.'
    ]
  },
  plasma_cannon: {
    id: 'plasma_cannon',
    name: 'Heavy Plasma Cannon',
    shortDesc: 'Bebola tenaga plasma yang meletup memberikan kerosakan kawasan (AoE).',
    icon: 'plasma',
    level: 0,
    maxLevel: 5,
    cooldown: 1.8,
    timer: 0,
    damage: 75,
    descriptionByLevel: [
      'Melancarkan bebola plasma superpanas yang meletup mengenai sekumpulan musuh.',
      '+35% Radius letupan AoE & +30% Kerosakan.',
      '-25% Masa bertenang (cooldown) tembakan.',
      'Letupan meninggalkan sisa api plasma yang membakar selama 1.5 saat.',
      'Evolusi: Sunfury Annihilator - Melancarkan 2 bebola plasma gergasi serentak.'
    ]
  },
  chainsword_orbit: {
    id: 'chainsword_orbit',
    name: 'Astartes Chainswords',
    shortDesc: 'Bilah gergaji berputar mengelilingi Space Marine menghalang musuh.',
    icon: 'chainsword',
    level: 0,
    maxLevel: 5,
    cooldown: 0, // continuous
    timer: 0,
    damage: 22,
    descriptionByLevel: [
      '1 bilah Chainsword berputar mengelilingi anda, memotong musuh yang mendekat.',
      '+1 Chainsword tambahan berputar bertentangan.',
      '+35% Kelajuan putaran & +tolakan musuh (knockback).',
      '+1 Chainsword lagi (Jumlah 3 bilah berputar pantas).',
      'Evolusi: Relic Eviscerators - 4 bilah gergaji berapi suci memotong gerombolan.'
    ]
  },
  frag_grenade: {
    id: 'frag_grenade',
    name: 'Krak Grenade Launcher',
    shortDesc: 'Melontar bom tangan berkuasa tinggi ke dalam kelompok musuh.',
    icon: 'grenade',
    level: 0,
    maxLevel: 5,
    cooldown: 2.4,
    timer: 0,
    damage: 95,
    descriptionByLevel: [
      'Melontar 1 bom Krak ke arah kelompok musuh paling padat.',
      '+1 bom dilontar serentak & +30% kerosakan.',
      '-30% Masa bertenang lontaran.',
      '+1 bom tambahan (Jumlah 3 bom berkelompok).',
      'Evolusi: Orbital Bombardment - Hujan letupan bersiri memusnahkan kawasan luas.'
    ]
  },
  heavy_flamer: {
    id: 'heavy_flamer',
    name: 'Heavy Flamer',
    shortDesc: 'Semburan api kon berterusan membasmi gerombolan serangga di hadapan.',
    icon: 'flamer',
    level: 0,
    maxLevel: 5,
    cooldown: 1.4,
    timer: 0,
    damage: 18,
    descriptionByLevel: [
      'Menyembur api promethium dalam sudut kon menghanguskan Tyranid.',
      '+35% Sudut kon semburan dan jarak jangkauan api.',
      '+40% Kerosakan terbakar berterusan.',
      '-30% Masa bertenang antara semburan.',
      'Evolusi: Emperor\'s Pyre - Api biru melekit membakar musuh sehingga cair.'
    ]
  },
  melta_lance: {
    id: 'melta_lance',
    name: 'Multi-Melta Lance',
    shortDesc: 'Pancaran haba padat menembusi barisan musuh berperisai tebal.',
    icon: 'melta',
    level: 0,
    maxLevel: 5,
    cooldown: 2.8,
    timer: 0,
    damage: 160,
    descriptionByLevel: [
      'Pancaran haba gelombang sub-atomik menembusi musuh dalam satu garisan lurus.',
      '+40% Lebar pancaran dan kerosakan.',
      '-25% Masa bertenang cas melta.',
      'Pancaran meninggalkan gelombang kejutan menolak musuh ke tepi.',
      'Evolusi: Thermal Rupture - 2 pancaran melta serentak ke arah depan dan belakang.'
    ]
  },
  power_sword: {
    id: 'power_sword',
    name: 'Power Sword',
    shortDesc: 'Libasan pedang tenaga biru lebar membelah barisan hadapan Tyranid.',
    icon: 'power_sword',
    level: 0,
    maxLevel: 5,
    cooldown: 1.05,
    timer: 0,
    damage: 46,
    descriptionByLevel: [
      'Melibas lengkok bilah tenaga yang menembusi musuh berdekatan dan menolak mereka.',
      '+30% Kerosakan libasan & +25% lebar gelombang tenaga.',
      'Melancarkan 2 libasan berturut-turut (hadapan & sisi).',
      '-22% Masa bertenang & +20% peluang Critical Hit bilah.',
      'Tahap Maksimum: Gelombang bilah gergasi menembusi sehingga 8 musuh!'
    ]
  },
  assault_cannon: {
    id: 'assault_cannon',
    name: 'Assault Cannon',
    shortDesc: 'Meriam Gatling 6-laras Terminator dengan kadar tembakan ultra-laju.',
    icon: 'assault_cannon',
    level: 0,
    maxLevel: 5,
    cooldown: 0.14,
    timer: 0,
    damage: 19,
    descriptionByLevel: [
      'Menembak rentetan peluru berkaliber tinggi secara berterusan ke arah sasaran.',
      '+25% Kerosakan peluru & menembusi +1 musuh.',
      '-20% Sela tembakan laras berputar.',
      'Menembak 2 aliran peluru berkembar pada setiap pusingan laras.',
      'Tahap Maksimum: Hujan peluru koyak-perisai berkelajuan penuh!'
    ]
  },
  cyclone_missile: {
    id: 'cyclone_missile',
    name: 'Cyclone Missile Launcher',
    shortDesc: 'Pelancar peluru berpandu bahu yang mengejar musuh elit/bos dan meletup.',
    icon: 'cyclone_missile',
    level: 0,
    maxLevel: 5,
    cooldown: 2.35,
    timer: 0,
    damage: 68,
    descriptionByLevel: [
      'Melancarkan 2 peluru berpandu pintar yang memburu sasaran dan meletup AoE.',
      '+1 Peluru berpandu setiap salvo (Jumlah 3) & +20% jejari letupan.',
      '+35% Kerosakan kepala peledak Krak-Frag.',
      '+1 Peluru berpandu (Jumlah 4) & -20% masa muat semula.',
      'Tahap Maksimum: Salvo 5 peluru berpandu pemusnah bio-titan!'
    ]
  }
};

export const INITIAL_PASSIVES: Record<PassiveId, PassiveConfig> = {
  iron_halo: {
    id: 'iron_halo',
    name: 'Iron Halo Shield',
    shortDesc: 'Menjana perisai tenaga Imperial yang menyerap serangan musuh.',
    icon: 'iron_halo',
    level: 0,
    maxLevel: 5,
    descriptionByLevel: [
      'Menjana perisai tenaga (Shield) 40 mata yang pulih semula apabila tidak diserang.',
      '+30 Kapasiti perisai & +25% kelajuan pemulihan perisai.',
      '+40 Kapasiti perisai (Jumlah 110 Shield).',
      'Masa bertenang pemulihan perisai dipendekkan 50%.',
      'Relic Halo of Terra: Kapasiti perisai 200 mata dan melepaskan letupan elektrik bila pecah.'
    ]
  },
  purity_seals: {
    id: 'purity_seals',
    name: 'Purity Seals',
    shortDesc: 'Meterai suci Chaplain meningkatkan kelajuan pergerakan.',
    icon: 'purity_seals',
    level: 0,
    maxLevel: 5,
    descriptionByLevel: [
      '+15% Kelajuan pergerakan Space Marine.',
      '+12% Kelajuan pergerakan tambahan (Jumlah +27%).',
      '+12% Kelajuan pergerakan (Jumlah +39%).',
      '+11% Kelajuan pergerakan & kebal impak tolakan kecil.',
      'Kelajuan Maksima Primaris (+55% pergerakan keseluruhan).'
    ]
  },
  auspex_scanner: {
    id: 'auspex_scanner',
    name: 'Auspex Scanner',
    shortDesc: 'Alat pengimbas canggih meluaskan medan tarikan biomass Tyranid.',
    icon: 'auspex',
    level: 0,
    maxLevel: 5,
    descriptionByLevel: [
      '+50% Jarak magnet tarikan Tyranid Biomass Spores.',
      '+40% Jarak magnet tambahan.',
      '+40% Jarak magnet (Spore disedut dari jauh dengan pantas).',
      '+50% Jarak magnet & +15% nilai XP bagi setiap spore.',
      'Imbasan Penuh Sektor: Tarikan magnet seluruh skrin secara berkala!'
    ]
  },
  tactical_doctrine: {
    id: 'tactical_doctrine',
    name: 'Codex Doctrine',
    shortDesc: 'Disiplin taktikal memendekkan masa bertenang semua senjata.',
    icon: 'doctrine',
    level: 0,
    maxLevel: 5,
    descriptionByLevel: [
      '-10% Masa bertenang (cooldown) untuk semua senjata.',
      '-8% Masa bertenang tambahan (Jumlah -18%).',
      '-8% Masa bertenang tambahan (Jumlah -26%).',
      '-7% Masa bertenang tambahan (Jumlah -33%).',
      'Doktrin Pembasmian Mutlak (-42% Masa bertenang semua senjata).'
    ]
  },
  adamantine_plate: {
    id: 'adamantine_plate',
    name: 'Adamantine Plating',
    shortDesc: 'Lapisan perisai bertetulang menambah HP maksimum dan ketahanan.',
    icon: 'plate',
    level: 0,
    maxLevel: 5,
    descriptionByLevel: [
      '+40 Kesihatan Maksimum (Max HP) dan serta-merta memulihkan 40 HP.',
      '+40 Kesihatan Maksimum tambahan (Jumlah +80 HP).',
      '+50 Kesihatan Maksimum tambahan (Jumlah +130 HP).',
      '+50 Kesihatan Maksimum & memulihkan separuh darah.',
      'Juggernaut Ceramite: +120 HP lagi dan rintangan kerosakan 20%.'
    ]
  },
  emperor_wrath: {
    id: 'emperor_wrath',
    name: 'Righteous Zeal',
    shortDesc: 'Semangat pertempuran suci meningkatkan kerosakan semua senjata.',
    icon: 'zeal',
    level: 0,
    maxLevel: 5,
    descriptionByLevel: [
      '+20% Kerosakan bagi semua senjata.',
      '+20% Kerosakan tambahan (Jumlah +40%).',
      '+20% Kerosakan tambahan (Jumlah +60%).',
      '+20% Kerosakan & +8% peluang Critical Hit.',
      'Murka Sang Maharaja: +35% Kerosakan & Critical Hit menghasilkan letupan suci!'
    ]
  }
};

/**
 * Weapon evolution pairs (Max Level Weapon + Paired Passive = Evolved Legendary Weapon)
 */
export const WEAPON_EVOLUTIONS: Record<WeaponId, { passive: PassiveId; name: string; desc: string }> = {
  bolter: {
    passive: 'tactical_doctrine',
    name: 'Godhammer Bolter',
    desc: 'Evolusi Legenda: Menembak peluru mikro-nuklear berletupan berantai yang menghancurkan kawanan musuh.'
  },
  heavy_bolter: {
    passive: 'emperor_wrath',
    name: 'Devastator Rotary Cannon',
    desc: 'Evolusi Legenda: 4 laras Gatling berputar menembak peluru berletup membanjiri skrin tanpa henti.'
  },
  lascannon: {
    passive: 'auspex_scanner',
    name: 'Orbital Lance Strike',
    desc: 'Evolusi Legenda: 3 pancaran laser gergasi dari kapal perang di orbit membelah medan perang.'
  },
  orbiting_shield: {
    passive: 'iron_halo',
    name: 'Aegis of Terra',
    desc: 'Evolusi Legenda: 4 perisai suci memancarkan gelombang kejutan renjatan elektrik setiap perlanggaran.'
  },
  vortex_grenade: {
    passive: 'purity_seals',
    name: 'Singularity Supernova',
    desc: 'Evolusi Legenda: Pusaran graviti kosmik raksasa yang menyedut seluruh skrin dan meletup dahsyat.'
  },
  thunder_hammer: {
    passive: 'iron_halo',
    name: 'Thunder God Storm',
    desc: 'Evolusi Legenda: Hentaman tukul mencetuskan petir berantai menyambar hingga 10 Tyranid serentak.'
  },
  plasma_cannon: {
    passive: 'tactical_doctrine',
    name: 'Sunfury Plasma Decimator',
    desc: 'Evolusi Legenda: Bola plasma supernova menghasilkan zon radiasi haba membakar musuh selama 4 saat.'
  },
  chainsword_orbit: {
    passive: 'emperor_wrath',
    name: 'Gorefather Chain-Cyclone',
    desc: 'Evolusi Legenda: 4 gergaji gigi adamantine berputar laju menghiris daging musuh dengan percikan darah.'
  },
  frag_grenade: {
    passive: 'auspex_scanner',
    name: 'Krak Cluster Carpet',
    desc: 'Evolusi Legenda: Melontar 5 bom letupan serpihan kluster yang menyapu bersih medan perang.'
  },
  heavy_flamer: {
    passive: 'adamantine_plate',
    name: 'Promethium Inferno',
    desc: 'Evolusi Legenda: Api biru suci kekal membakar di atas tanah, memperlahankan dan memusnahkan musuh.'
  },
  melta_lance: {
    passive: 'adamantine_plate',
    name: 'Multi-Melta Annihilator',
    desc: 'Evolusi Legenda: Pancaran haba sub-atomik memusnahkan sebarang perisai bos serta-merta.'
  },
  power_sword: {
    passive: 'emperor_wrath',
    name: "Emperor's Burning Blade",
    desc: 'Evolusi Legenda: Pedang berapi Sang Maharaja melepaskan gelombang sabit berapi merentas skrin yang membakar setiap Xenos.'
  },
  assault_cannon: {
    passive: 'tactical_doctrine',
    name: 'Vengeance Gatling Storm',
    desc: 'Evolusi Legenda: Ribut 3 aliran Gatling tanpa henti dengan peluru mikro-letupan berimpak tinggi.'
  },
  cyclone_missile: {
    passive: 'auspex_scanner',
    name: 'Typhoon Barrage System',
    desc: 'Evolusi Legenda: Melancarkan salvo 8 peluru berpandu berkembar serentak dengan gelombang kejutan kluster luas.'
  }
};

/**
 * Health & Sustenance options offered when all weapons and passives have reached MAX LEVEL.
 */
export const STORE_HEALTH_OPTIONS: UpgradeOption[] = [
  {
    id: 'store_health_heal',
    category: 'STORE_HEALTH',
    name: 'Rawatan Medan Apothecary (+65% HP)',
    description: 'Serta-merta memulihkan 65% Kesihatan (HP) dan membersihkan sebarang kesan asid Tyranid.',
    level: 1,
    isNew: false,
    icon: 'health_heal',
    rarity: 'relic',
    healAmount: 0.65
  },
  {
    id: 'store_health_max',
    category: 'STORE_HEALTH',
    name: 'Pengukuhan Biometrik (+35 Max HP)',
    description: 'Meningkatkan Kesihatan Maksimum (Max HP) sebanyak +35 secara kekal dan memulihkan 35 HP serta-merta.',
    level: 1,
    isNew: false,
    icon: 'health_max',
    rarity: 'blessed',
    maxHpBonus: 35
  },
  {
    id: 'store_health_shield',
    category: 'STORE_HEALTH',
    name: 'Iron Halo Overcharge (+40 Shield & Kebal)',
    description: 'Cas semula perisai Iron Halo ke 100%, tambah +40 Kapasiti Perisai, dan berikan kebal 3 saat.',
    level: 1,
    isNew: false,
    icon: 'health_shield',
    rarity: 'blessed'
  },
  {
    id: 'store_health_stimpack',
    category: 'STORE_HEALTH',
    name: 'Suntikan Purge Stimpack (+40% HP & Kelajuan)',
    description: 'Pulihkan 40% HP serta lonjakan +25% Kelajuan Gerak dan Kelajuan Tembakan selama 20 saat!',
    level: 1,
    isNew: false,
    icon: 'health_stim',
    rarity: 'relic'
  }
];

/**
 * Generates 3 unique upgrade choices for level-up screen.
 * Accommodates up to 6 simultaneous weapons, 6 passives, weapon evolutions,
 * and falls back to STORE HEALTH / APOTHECARY SUPPLIES when all upgrades are MAX level!
 */
export function generateUpgradeChoices(
  weapons: Record<WeaponId, WeaponConfig>,
  passives: Record<PassiveId, PassiveConfig>,
  lockedOption?: UpgradeOption | null,
  banishedIds?: Set<string>,
  count: number = 3,
  maxWeapons: number = 6
): UpgradeOption[] {
  const eligibleChoices: UpgradeOption[] = [];

  // 1. Check for Weapon Evolutions first (Weapon at Max Level 5 + Matching Passive owned)
  for (const [wId, w] of Object.entries(weapons) as [WeaponId, WeaponConfig][]) {
    if (banishedIds?.has(wId)) continue;
    if (w.level >= 5 && !w.isEvolved) {
      const evo = WEAPON_EVOLUTIONS[wId];
      if (evo && passives[evo.passive] && passives[evo.passive].level > 0) {
        eligibleChoices.push({
          id: w.id,
          category: 'WEAPON',
          name: `${evo.name} (EVOLVED)`,
          description: evo.desc,
          level: 6,
          isNew: false,
          icon: w.icon,
          rarity: 'evolution'
        });
      }
    }
  }

  // 2. Standard Weapon Upgrades (up to maxWeapons active weapons)
  const activeWeaponsCount = Object.values(weapons).filter(w => w.level > 0).length;
  const canAcquireNewWeapon = activeWeaponsCount < maxWeapons;

  for (const w of Object.values(weapons)) {
    if (banishedIds?.has(w.id)) continue;
    const evoInfo = WEAPON_EVOLUTIONS[w.id];
    const evoPassiveReq = evoInfo ? {
      id: evoInfo.passive,
      name: passives[evoInfo.passive]?.name || evoInfo.passive,
      hasPassive: (passives[evoInfo.passive]?.level || 0) > 0
    } : undefined;

    if (w.level === 0 && canAcquireNewWeapon) {
      eligibleChoices.push({
        id: w.id,
        category: 'WEAPON',
        name: w.name,
        description: w.descriptionByLevel[0],
        level: 1,
        isNew: true,
        icon: w.icon,
        rarity: 'blessed',
        evoPassiveReq
      });
    } else if (w.level > 0 && w.level < w.maxLevel) {
      const nextLevel = w.level + 1;
      eligibleChoices.push({
        id: w.id,
        category: 'WEAPON',
        name: w.name,
        description: w.descriptionByLevel[nextLevel - 1] + (nextLevel === w.maxLevel ? ` (Sedia untuk EVO bila ada ${passives[WEAPON_EVOLUTIONS[w.id].passive]?.name || 'Pasif'})` : ''),
        level: nextLevel,
        isNew: false,
        icon: w.icon,
        rarity: nextLevel === w.maxLevel ? 'relic' : 'standard',
        evoPassiveReq
      });
    }
  }

  // 3. Passive Upgrades (up to 6 active passives)
  const activePassivesCount = Object.values(passives).filter(p => p.level > 0).length;
  const canAcquireNewPassive = activePassivesCount < 6;

  for (const p of Object.values(passives)) {
    if (banishedIds?.has(p.id)) continue;
    // Find best matching weapon that evolves with this passive (prioritize owned weapons)
    const pairedWeaponEntries = (Object.entries(WEAPON_EVOLUTIONS) as [WeaponId, { passive: PassiveId; name: string; desc: string }][])
      .filter(([, evo]) => evo.passive === p.id);
    const ownedPaired = pairedWeaponEntries.find(([wId]) => weapons[wId]?.level > 0) || pairedWeaponEntries[0];
    const evoWeaponReq = ownedPaired ? {
      id: ownedPaired[0],
      name: pairedWeaponEntries.map(([wId]) => weapons[wId]?.name || wId).join(' / '),
      weaponLevel: weapons[ownedPaired[0]]?.level || 0,
      isEvolved: !!weapons[ownedPaired[0]]?.isEvolved
    } : undefined;

    if (p.level === 0 && canAcquireNewPassive) {
      eligibleChoices.push({
        id: p.id,
        category: 'PASSIVE',
        name: p.name,
        description: p.descriptionByLevel[0],
        level: 1,
        isNew: true,
        icon: p.icon,
        rarity: 'blessed',
        evoWeaponReq
      });
    } else if (p.level > 0 && p.level < p.maxLevel) {
      const nextLevel = p.level + 1;
      eligibleChoices.push({
        id: p.id,
        category: 'PASSIVE',
        name: p.name,
        description: p.descriptionByLevel[nextLevel - 1],
        level: nextLevel,
        isNew: false,
        icon: p.icon,
        rarity: nextLevel === p.maxLevel ? 'relic' : 'standard',
        evoWeaponReq
      });
    }
  }

  // 4. CRITICAL REQUIREMENT: If everything is maxed out or no eligible upgrades exist,
  // return STORE HEALTH options so players can heal, expand max HP, and get buffs!
  if (eligibleChoices.length === 0) {
    const healthShuffled = [...STORE_HEALTH_OPTIONS].sort(() => 0.5 - Math.random());
    return healthShuffled.slice(0, count);
  }

  // Preserve locked card if still valid in eligibleChoices
  const matchedLock = lockedOption
    ? eligibleChoices.find(c => c.id === lockedOption.id && c.category === lockedOption.category)
    : undefined;

  const remainingPool = matchedLock
    ? eligibleChoices.filter(c => !(c.id === matchedLock.id && c.category === matchedLock.category))
    : eligibleChoices;

  // Keep a ready Legendary visible when it becomes available.
  const legendary = remainingPool.filter(choice => choice.rarity === 'evolution');
  const ordinary = remainingPool.filter(choice => choice.rarity !== 'evolution');
  const shuffled = ordinary.sort(() => 0.5 - Math.random());

  let result: UpgradeOption[];
  if (matchedLock) {
    const rest = [...legendary.slice(0, 1), ...shuffled].slice(0, Math.max(0, count - 1));
    result = [matchedLock, ...rest];
  } else {
    result = [...legendary.slice(0, 1), ...shuffled.slice(0, Math.max(0, count - Math.min(1, legendary.length)))];
  }

  // Pad with store health options if count > result.length (e.g. for 5x Jackpot when near max level)
  if (result.length < count) {
    const extra = [...STORE_HEALTH_OPTIONS].sort(() => 0.5 - Math.random());
    while (result.length < count && extra.length > 0) {
      result.push(extra.pop()!);
    }
  }

  return result.slice(0, count);
}
