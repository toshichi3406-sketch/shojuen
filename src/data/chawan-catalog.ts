/**
 * 抹茶椀カタログ（有田焼・陶器／土もの）
 *
 * ※ 「抹茶椀片口」フォルダ内の抹茶椀１〜６はすべて片口。各フォルダ＝1品目・アングル別写真。
 */
const chawanImg = (name: string) => `/images/chawan/${name}` as const

export type ChawanKind = "katakuchi" | "kibako"

export const chawanKinds: ChawanKind[] = ["katakuchi", "kibako"]

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

const katakuchiAngles = (n: number) =>
  [1, 2, 3, 4].map((a) =>
    chawanImg(`katakuchi-${String(n).padStart(2, "0")}-${a}.jpg`)
  )

export const chawanStyles: ChawanStyle[] = [
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
