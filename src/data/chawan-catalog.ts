/**
 * 抹茶椀カタログ（有田焼・陶器／土もの）
 *
 * ※ 「抹茶椀片口」フォルダ内の抹茶椀１〜６はすべて片口。各フォルダ＝1品目・アングル別写真。
 * ※ 「抹茶椀v2」フォルダ：抹茶椀7〜22（碗／片口）＋茶筅立て。名称はドラフト（仮）。
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
  /** アングル別写真（同一品目）。フォルダ内の複数カット。 */
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

const chasenAngles = (count: number) =>
  Array.from({ length: count }, (_, i) => chawanImg(`chasen-01-${i + 1}.jpg`))

export const chawanStyles: ChawanStyle[] = [
  // ── 抹茶椀（Desktop「抹茶椀v2」７〜１４・１７〜２２） ──
  {
    id: "bowl-07",
    kind: "wan",
    color: "seiji",
    nameJa: "水色しのぎ",
    nameEn: "Pale blue shinogi",
    taglineJa: "水色のしのぎ目がやわらかい景色を作る碗。（仮名）",
    taglineEn: "Pale blue with soft shinogi ridges. (draft name)",
    ...wanCommon,
    images: bowlAngles(7, 9),
  },
  {
    id: "bowl-08",
    kind: "wan",
    color: "kohiki",
    nameJa: "桃紫かいらぎ",
    nameEn: "Peach-purple kairagi",
    taglineJa: "桃紫の梅花皮（かいらぎ）。（仮名）",
    taglineEn: "Peach-purple kairagi texture. (draft name)",
    ...wanCommon,
    images: bowlAngles(8, 8),
  },
  {
    id: "bowl-09",
    kind: "wan",
    color: "kuro",
    nameJa: "白黒かいらぎ",
    nameEn: "Black-and-white kairagi",
    taglineJa: "白と黒が縮れて生まれる梅花皮の碗。（仮名）",
    taglineEn: "Black-and-white kairagi landscape. (draft name)",
    ...wanCommon,
    images: bowlAngles(9, 9),
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
    images: bowlAngles(10, 9),
  },
  {
    id: "bowl-11",
    kind: "wan",
    color: "kuro",
    nameJa: "黒横帯天目",
    nameEn: "Black banded tenmoku",
    taglineJa: "黒地に横帯の入る天目風の碗。（仮名）",
    taglineEn: "Tenmoku-style bowl with a horizontal band. (draft name)",
    ...wanCommon,
    images: bowlAngles(11, 9),
  },
  {
    id: "bowl-12",
    kind: "wan",
    color: "hakuji",
    nameJa: "白灰シンプル",
    nameEn: "Simple ash white",
    taglineJa: "白灰釉のシンプルな碗。（仮名）",
    taglineEn: "Quiet ash-white glaze. (draft name)",
    ...wanCommon,
    // -4 omitted: different tea bowl
    images: [
      chawanImg("bowl-12-1.jpg"),
      chawanImg("bowl-12-2.jpg"),
      chawanImg("bowl-12-3.jpg"),
      chawanImg("bowl-12-5.jpg"),
      chawanImg("bowl-12-6.jpg"),
      chawanImg("bowl-12-7.jpg"),
      chawanImg("bowl-12-8.jpg"),
      chawanImg("bowl-12-9.jpg"),
    ],
  },
  {
    id: "bowl-13",
    kind: "wan",
    color: "kohiki",
    nameJa: "茶褐ドリップ",
    nameEn: "Brown drip",
    taglineJa: "茶褐色の釉が垂れる碗。（仮名）",
    taglineEn: "Warm brown glaze with drips. (draft name)",
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
    images: bowlAngles(14, 9),
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
    images: bowlAngles(17, 9),
  },
  {
    id: "bowl-18",
    kind: "wan",
    color: "seiji",
    nameJa: "青緑ツートン",
    nameEn: "Blue-green two-tone",
    taglineJa: "青緑のツートン釉。（仮名）",
    taglineEn: "Blue-green two-tone glaze. (draft name)",
    ...wanCommon,
    images: bowlAngles(18, 8),
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
    images: bowlAngles(19, 9),
  },
  {
    id: "bowl-20",
    kind: "wan",
    color: "kuro",
    nameJa: "黒地彩釉垂れ",
    nameEn: "Black with colored glaze drips",
    taglineJa: "黒地に黄・白・赤などの彩釉が垂れる碗。",
    taglineEn: "Black body with yellow, white, and red glaze drips.",
    ...wanCommon,
    images: bowlAngles(20, 9),
  },
  {
    id: "bowl-21",
    kind: "wan",
    color: "kuro",
    nameJa: "黒釉胴締",
    nameEn: "Black waisted bowl",
    taglineJa: "胴を締めた黒釉の碗。（仮名・要確認）",
    taglineEn: "Waisted black-glazed bowl. (draft name)",
    ...wanCommon,
    images: bowlAngles(21, 8),
  },
  {
    id: "bowl-22",
    kind: "nodate",
    color: "kohiki",
    nameJa: "野点・クリーム掛分",
    nameEn: "Nodate — cream over brown",
    taglineJa: "野点向き。茶褐地にクリーム釉の掛分。（仮名・要確認）",
    taglineEn: "Nodate form — cream glaze over brown clay. (draft name)",
    ...nodateCommon,
    // -4 omitted
    images: [
      chawanImg("bowl-22-1.jpg"),
      chawanImg("bowl-22-2.jpg"),
      chawanImg("bowl-22-3.jpg"),
      chawanImg("bowl-22-5.jpg"),
      chawanImg("bowl-22-6.jpg"),
      chawanImg("bowl-22-7.jpg"),
      chawanImg("bowl-22-8.jpg"),
      chawanImg("bowl-22-9.jpg"),
    ],
  },

  // ── 片口（Desktop「抹茶椀片口」１〜６ — 各4アングル） ──
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
  // ── 片口（抹茶椀v2：１５・１６） ──
  {
    id: "katakuchi-07",
    kind: "katakuchi",
    color: "kuro",
    nameJa: "暗色 片口",
    nameEn: "Dark katakuchi",
    taglineJa: "落ち着いた暗色の片口。（仮名）",
    taglineEn: "A calm dark katakuchi. (draft name)",
    ...katakuchiCommon,
    images: katakuchiAngles(7, 8),
  },
  {
    id: "katakuchi-08",
    kind: "katakuchi",
    color: "ruri",
    nameJa: "紫 片口",
    nameEn: "Purple katakuchi",
    taglineJa: "紫みがかった釉の片口。（仮名）",
    taglineEn: "Purple-toned katakuchi. (draft name)",
    ...katakuchiCommon,
    images: katakuchiAngles(8, 8),
  },

  // ── 茶筅立て ────────────────────────────
  {
    id: "chasen-01",
    kind: "chasen",
    color: "kuro",
    nameJa: "茶筅立て 黒",
    nameEn: "Black chasen stand",
    taglineJa: "黒釉の茶筅立て。（仮名）",
    taglineEn: "Black-glazed whisk stand. (draft name)",
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
    images: chasenAngles(6),
  },

  // ── 木箱 ────────────────────────────────
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
    ],
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
