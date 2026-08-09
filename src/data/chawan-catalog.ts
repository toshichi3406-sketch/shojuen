/**
 * 抹茶椀カタログ（有田焼・陶器／土もの）
 *
 * ※ 「抹茶椀片口」フォルダ内の片口１〜６は既存カットのまま（v3に未収録）。
 * ※ 「抹茶椀v3」フォルダ：碗／野点／片口（暗色・紫）／茶筅立て3種／木箱／セット。
 *    フォルダ名＝商品名。ヒーロー（images[0]）は横からのサイドアングル。
 * ※ v3フォルダ → id 対応は scripts/process-bowl-v3.mjs / scripts/chawan-v3-mapping.txt を参照。
 */
const chawanImg = (name: string) => `/images/chawan/${name}` as const

export type ChawanKind = "wan" | "nodate" | "katakuchi" | "chasen" | "kibako"

export const chawanKinds: ChawanKind[] = [
  "wan",
  "nodate",
  "katakuchi",
  "chasen",
  "kibako",
]

export type ChawanColor =
  | "hakuji"
  | "sometsuke"
  | "seiji"
  | "ruri"
  | "kuro"
  | "kohiki"

export const chawanColors: ChawanColor[] = [
  "hakuji",
  "sometsuke",
  "seiji",
  "ruri",
  "kuro",
  "kohiki",
]

/** 片口に共通の寸法・容量・素材・取扱い */
const katakuchiCommon = {
  shapeJa: "片口",
  shapeEn: "Spouted",
  useJa: "点て分け・取り分け",
  useEn: "Portioning, serving",
  sizeJa: "φ110×H70mm　満水300cc",
  sizeEn: "Ø110 × H70 mm · 300 ml full",
  materialJa: "陶器",
  materialEn: "Pottery (earthenware)",
  careJa: "食洗機〇 / 電子レンジ〇 / 重ね〇 / 直火×",
  careEn: "Dishwasher ✓ · Microwave ✓ · Stackable ✓ · Open flame ✕",
} as const

/** 抹茶椀（碗）共通 — 寸法は仮（要確認） */
const wanCommon = {
  shapeJa: "抹茶椀",
  shapeEn: "Matcha bowl",
  useJa: "薄茶・濃茶",
  useEn: "Usucha, koicha",
  sizeJa: "寸法・容量はお問い合わせください",
  sizeEn: "Size and capacity on request",
  materialJa: "陶器",
  materialEn: "Pottery (earthenware)",
  careJa: "食洗機〇 / 電子レンジ〇 / 重ね〇 / 直火×",
  careEn: "Dishwasher ✓ · Microwave ✓ · Stackable ✓ · Open flame ✕",
} as const

/** 野点椀共通 — 寸法は仮（要確認） */
const nodateCommon = {
  shapeJa: "野点",
  shapeEn: "Nodate",
  useJa: "野点・薄茶",
  useEn: "Outdoor tea (nodate), usucha",
  sizeJa: "寸法・容量はお問い合わせください",
  sizeEn: "Size and capacity on request",
  materialJa: "陶器",
  materialEn: "Pottery (earthenware)",
  careJa: "食洗機〇 / 電子レンジ〇 / 重ね〇 / 直火×",
  careEn: "Dishwasher ✓ · Microwave ✓ · Stackable ✓ · Open flame ✕",
} as const

const chasenCommon = {
  shapeJa: "茶筅立て",
  shapeEn: "Chasen stand",
  useJa: "茶筅の保管・立て",
  useEn: "Whisk rest / storage",
  sizeJa: "寸法はお問い合わせください",
  sizeEn: "Size on request",
  materialJa: "陶器",
  materialEn: "Pottery (earthenware)",
  careJa: "食洗機〇 / 電子レンジ〇 / 直火×",
  careEn: "Dishwasher ✓ · Microwave ✓ · Open flame ✕",
} as const

export type ChawanStyle = {
  id: string
  kind: ChawanKind
  color: ChawanColor
  nameJa: string
  nameEn: string
  taglineJa: string
  taglineEn: string
  shapeJa: string
  shapeEn: string
  useJa: string
  useEn: string
  sizeJa: string
  sizeEn: string
  materialJa?: string
  materialEn?: string
  careJa?: string
  careEn?: string
  /** 代表画像（カード用）。未設定なら images[0] または釉スウォッチ。 */
  image?: string
  /** アングル別写真（同一品目）。フォルダ内の複数カット。index 0 = 横から。 */
  images?: string[]
}

const katakuchiAngles = (n: number, count = 4) =>
  Array.from({ length: count }, (_, i) =>
    chawanImg(`katakuchi-${String(n).padStart(2, "0")}-${i + 1}.jpg`)
  )

const bowlAngles = (n: number, count = 4) =>
  Array.from({ length: count }, (_, i) =>
    chawanImg(`bowl-${String(n).padStart(2, "0")}-${i + 1}.jpg`)
  )

const chasenAngles = (n: number, count: number) =>
  Array.from({ length: count }, (_, i) =>
    chawanImg(`chasen-${String(n).padStart(2, "0")}-${i + 1}.jpg`)
  )

export const chawanStyles: ChawanStyle[] = [
  // ── 抹茶椀（Desktop「抹茶椀v3」01〜07・09・10・12・13） ──
  {
    id: "bowl-07",
    kind: "wan",
    color: "seiji",
    nameJa: "水色しのぎ",
    nameEn: "Pale blue shinogi",
    taglineJa: "水色のしのぎ目がやわらかい景色を作る碗。",
    taglineEn: "Pale blue with soft shinogi ridges.",
    ...wanCommon,
    images: bowlAngles(7, 7),
  },
  {
    id: "bowl-08",
    kind: "wan",
    color: "kohiki",
    nameJa: "桃紫かいらぎ",
    nameEn: "Peach-purple kairagi",
    taglineJa: "桃紫の梅花皮（かいらぎ）が縮れて生まれる景色。",
    taglineEn: "Peach-purple kairagi texture.",
    ...wanCommon,
    images: bowlAngles(8, 7),
  },
  {
    id: "bowl-09",
    kind: "wan",
    color: "kuro",
    nameJa: "白黒かいらぎ",
    nameEn: "Black-and-white kairagi",
    taglineJa: "白と黒が縮れて生まれる梅花皮の碗。",
    taglineEn: "Black-and-white kairagi landscape.",
    ...wanCommon,
    images: bowlAngles(9, 7),
  },
  {
    id: "bowl-10",
    kind: "wan",
    color: "kohiki",
    nameJa: "赤なまこ",
    nameEn: "Red namako",
    taglineJa: "赤なまこ釉の景色が広がる碗。",
    taglineEn: "Red namako glaze with a mottled landscape.",
    ...wanCommon,
    images: bowlAngles(10, 7),
  },
  {
    id: "bowl-11",
    kind: "wan",
    color: "kuro",
    nameJa: "黒横帯天目",
    nameEn: "Black banded tenmoku",
    taglineJa: "黒地に横帯の入る天目風の碗。",
    taglineEn: "Tenmoku-style bowl with a horizontal band.",
    ...wanCommon,
    images: bowlAngles(11, 7),
  },
  {
    id: "bowl-12",
    kind: "wan",
    color: "hakuji",
    nameJa: "白灰",
    nameEn: "Ash white",
    taglineJa: "白灰釉の静かな碗。",
    taglineEn: "Quiet ash-white glaze.",
    ...wanCommon,
    images: bowlAngles(12, 7),
  },
  {
    id: "bowl-13",
    kind: "wan",
    color: "kohiki",
    nameJa: "茶褐ドリップ",
    nameEn: "Brown drip",
    taglineJa: "茶褐色の釉が垂れる碗。",
    taglineEn: "Warm brown glaze with drips.",
    ...wanCommon,
    images: bowlAngles(13, 7),
  },
  {
    id: "bowl-14",
    kind: "nodate",
    color: "kuro",
    nameJa: "野点・黒地五彩垂れ",
    nameEn: "Nodate — black with five-color drips",
    taglineJa: "野点向き。黒地に黄・白・青・赤の釉が垂れる碗。",
    taglineEn: "Nodate form — black body with yellow, white, blue, and red glaze drips.",
    ...nodateCommon,
    images: bowlAngles(14, 6),
  },
  {
    id: "bowl-17",
    kind: "wan",
    color: "kuro",
    nameJa: "金彩",
    nameEn: "Gold accent (kinsai)",
    taglineJa: "金彩が映える、深みのある碗。",
    taglineEn: "A deep bowl lifted by gold accent.",
    ...wanCommon,
    images: bowlAngles(17, 7),
  },
  {
    id: "bowl-18",
    kind: "wan",
    color: "ruri",
    nameJa: "青銀",
    nameEn: "Blue-silver",
    taglineJa: "青と銀のような釉調が重なる碗。",
    taglineEn: "Blue over a silvery, sandy glaze.",
    ...wanCommon,
    images: bowlAngles(18, 7),
  },
  {
    id: "bowl-19",
    kind: "nodate",
    color: "kohiki",
    nameJa: "野点・赤なまこ",
    nameEn: "Nodate — red namako",
    taglineJa: "野点向きの赤なまこ釉の碗。",
    taglineEn: "Red namako glaze in a nodate form.",
    ...nodateCommon,
    images: bowlAngles(19, 6),
  },
  {
    id: "bowl-20",
    kind: "wan",
    color: "kuro",
    nameJa: "黒地五彩垂れ",
    nameEn: "Black with five-color drips",
    taglineJa: "黒地に黄・白・赤などの彩釉が垂れる碗。",
    taglineEn: "Black body with yellow, white, and red glaze drips.",
    ...wanCommon,
    images: bowlAngles(20, 7),
  },
  {
    id: "bowl-21",
    kind: "wan",
    color: "kuro",
    nameJa: "黒釉胴締",
    nameEn: "Black waisted bowl",
    taglineJa: "胴を締めた黒釉の碗。",
    taglineEn: "Waisted black-glazed bowl.",
    ...wanCommon,
    images: bowlAngles(21, 6),
  },
  {
    id: "bowl-22",
    kind: "nodate",
    color: "kohiki",
    nameJa: "野点抹茶椀・黄土色",
    nameEn: "Nodate matcha bowl — ochre",
    taglineJa: "野点向き。黄土色の景色が広がる碗。",
    taglineEn: "Nodate form — ochre landscape on the clay.",
    ...nodateCommon,
    images: bowlAngles(22, 6),
  },

  // ── 片口（Desktop「抹茶椀片口」１〜６ — 各4アングル・v3未収録） ──
  {
    id: "katakuchi-01",
    kind: "katakuchi",
    color: "ruri",
    nameJa: "瑠璃釉 片口",
    nameEn: "Lapis glaze — katakuchi",
    taglineJa: "落ち着いた瑠璃色。注ぎ口で点て分け・取り分けに。",
    taglineEn: "A calm lapis blue — spouted for portioning.",
    ...katakuchiCommon,
    images: katakuchiAngles(1),
  },
  {
    id: "katakuchi-02",
    kind: "katakuchi",
    color: "ruri",
    nameJa: "梅花皮青 片口",
    nameEn: "Blue kairagi (梅花皮) — katakuchi",
    taglineJa: "釉が縮んで生まれる梅花皮（かいらぎ）の青景色。",
    taglineEn: "Blue kairagi — glaze that shrinks into a textured landscape.",
    ...katakuchiCommon,
    images: katakuchiAngles(2),
  },
  {
    id: "katakuchi-03",
    kind: "katakuchi",
    color: "hakuji",
    nameJa: "白なまこ 片口",
    nameEn: "White namako — katakuchi",
    taglineJa: "白なまこ釉の流れが土を見せる片口。",
    taglineEn: "White namako glaze that drips to reveal the clay.",
    ...katakuchiCommon,
    images: katakuchiAngles(3),
  },
  {
    id: "katakuchi-04",
    kind: "katakuchi",
    color: "kuro",
    nameJa: "黒釉 片口",
    nameEn: "Black glaze — katakuchi",
    taglineJa: "黒釉に垂れる淡い景色。",
    taglineEn: "Black glaze with a pale drip of landscape.",
    ...katakuchiCommon,
    images: katakuchiAngles(4),
  },
  {
    id: "katakuchi-05",
    kind: "katakuchi",
    color: "kuro",
    nameJa: "金彩 片口",
    nameEn: "Gold accent — katakuchi",
    taglineJa: "金彩が映える、深みのある片口。",
    taglineEn: "A deep katakuchi lifted by gold accent.",
    ...katakuchiCommon,
    images: katakuchiAngles(5),
  },
  {
    id: "katakuchi-06",
    kind: "katakuchi",
    color: "kohiki",
    nameJa: "梅花皮赤 片口",
    nameEn: "Red kairagi (梅花皮) — katakuchi",
    taglineJa: "釉が縮んで生まれる梅花皮（かいらぎ）の赤景色。",
    taglineEn: "Red kairagi — glaze that shrinks into a warm textured landscape.",
    ...katakuchiCommon,
    images: katakuchiAngles(6),
  },
  // ── 片口（抹茶椀v3：21・22） ──
  {
    id: "katakuchi-07",
    kind: "katakuchi",
    color: "kuro",
    nameJa: "片口暗色",
    nameEn: "Dark katakuchi",
    taglineJa: "落ち着いた暗色に淡い垂れの片口。",
    taglineEn: "A calm dark katakuchi with pale drips.",
    ...katakuchiCommon,
    images: katakuchiAngles(7, 7),
  },
  {
    id: "katakuchi-08",
    kind: "katakuchi",
    color: "ruri",
    nameJa: "紫 片口",
    nameEn: "Purple katakuchi",
    taglineJa: "紫みがかった釉の片口。",
    taglineEn: "Purple-toned katakuchi.",
    ...katakuchiCommon,
    images: katakuchiAngles(8, 6),
  },

  // ── 茶筅立て（v3：3種） ────────────────
  {
    id: "chasen-01",
    kind: "chasen",
    color: "kuro",
    nameJa: "茶筅立て・黒マット",
    nameEn: "Black matte chasen stand",
    taglineJa: "黒マット釉の茶筅立て。",
    taglineEn: "Black matte-glazed whisk stand.",
    ...chasenCommon,
    images: chasenAngles(1, 2),
  },
  {
    id: "chasen-02",
    kind: "chasen",
    color: "kuro",
    nameJa: "茶筅立て・黒アメ釉",
    nameEn: "Black ame-yu chasen stand",
    taglineJa: "黒アメ釉の茶筅立て。",
    taglineEn: "Black ame-yu glazed whisk stand.",
    ...chasenCommon,
    images: chasenAngles(2, 2),
  },
  {
    id: "chasen-03",
    kind: "chasen",
    color: "kuro",
    nameJa: "茶筅立て・黒斑点",
    nameEn: "Black speckled chasen stand",
    taglineJa: "黒地に斑点のある茶筅立て。",
    taglineEn: "Black speckled whisk stand.",
    ...chasenCommon,
    images: chasenAngles(3, 2),
  },

  // ── 木箱・セット ────────────────────────
  {
    id: "kibako-a",
    kind: "kibako",
    color: "hakuji",
    nameJa: "木箱",
    nameEn: "Wooden box",
    taglineJa: "器を包む木箱。進物・卸向け。",
    taglineEn: "A wooden box for the bowl — for gifting and trade.",
    shapeJa: "木箱",
    shapeEn: "Wooden box",
    useJa: "進物・保管",
    useEn: "Gifting, storage",
    sizeJa: "14.7×14.7×10.8cm",
    sizeEn: "14.7 × 14.7 × 10.8 cm",
    materialJa: "木",
    materialEn: "Wood",
    images: [
      chawanImg("box-01.jpg"),
      chawanImg("box-02.jpg"),
      chawanImg("box-03.jpg"),
      chawanImg("box-04.jpg"),
      chawanImg("box-05.jpg"),
    ],
  },
  {
    id: "set-01",
    kind: "kibako",
    color: "hakuji",
    nameJa: "木箱・茶筅・茶筅たてセット",
    nameEn: "Box, chasen & stand set",
    taglineJa: "木箱に茶筅と茶筅立てを添えたセット。",
    taglineEn: "Wooden box with chasen and chasen stand.",
    shapeJa: "セット",
    shapeEn: "Set",
    useJa: "進物・一式",
    useEn: "Gifting, complete set",
    sizeJa: "寸法はお問い合わせください",
    sizeEn: "Size on request",
    materialJa: "木・竹・陶器",
    materialEn: "Wood, bamboo, pottery",
    images: [chawanImg("set-01-1.jpg")],
  },
]

/** ページ途中に差し込む雰囲気写真（羅列ギャラリーではない） */
export const chawanAtmosphere = {
  kilnShelves: chawanImg("atm-kiln-shelves.jpg"),
  katakuchiCrates: chawanImg("atm-katakuchi-crates.jpg"),
  dryingFoot: "/images/chawan/workshop-03-drying-foot.png",
  wheelTrimming: "/images/chawan/workshop-02-wheel-trimming.png",
  boxYard: chawanImg("box-atm.jpg"),
  boxStamping: chawanImg("atm-box-stamping.jpg"),
} as const

export function styleImages(style: ChawanStyle): string[] {
  if (style.images?.length) return style.images
  if (style.image) return [style.image]
  return []
}
