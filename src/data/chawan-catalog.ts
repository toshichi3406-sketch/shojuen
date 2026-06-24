/**
 * 抹茶椀カタログ — 取引先提案用
 *
 * 画像の追加手順:
 * 1. 写真を `public/images/chawan/` に置く（例: `001-a.jpg`, `001-b.jpg`）
 * 2. 下の配列の `images` に複数枚を追加する（先頭がサムネイル/メイン写真）
 *
 * デモ用に既存サイト画像を仮置きしています。実際の椀写真に差し替えてください。
 */
const chawanImg = (name: string) => `/images/chawan/${name}` as const

export type ChawanCategory =
  | "raku"
  | "hagi"
  | "karatsu"
  | "seto"
  | "shino"
  | "oribe"
  | "other"

export type ChawanItem = {
  id: string
  /** 1枚以上。先頭がサムネイル/メイン写真 */
  images: string[]
  nameJa: string
  nameEn: string
  category: ChawanCategory
  /** 口径・高さなど */
  sizeJa: string
  sizeEn: string
  /** 仕上げ・窯元など */
  detailJa: string
  detailEn: string
}

export const chawanCategories: ChawanCategory[] = [
  "raku",
  "hagi",
  "karatsu",
  "seto",
  "shino",
  "oribe",
  "other",
]

/** 仮画像 — 本番は `/images/chawan/` の実写に差し替え */
const demo = (n: number) => `/images/gallery-strip-${((n - 1) % 6) + 1}.png`

export const chawanCatalog: ChawanItem[] = [
  {
    id: "cw-001",
    images: [demo(1), demo(2), demo(3)],
    nameJa: "楽焼 黒楽 茶碗",
    nameEn: "Raku — black chawan",
    category: "raku",
    sizeJa: "口径 12.5 cm · 高さ 8 cm",
    sizeEn: "Ø 12.5 cm · H 8 cm",
    detailJa: "手捏ね · 本手楽 · 箱付",
    detailEn: "Hand-built · hon-raku · with tomobako",
  },
  {
    id: "cw-002",
    images: [demo(2), demo(4)],
    nameJa: "楽焼 赤楽 茶碗",
    nameEn: "Raku — red chawan",
    category: "raku",
    sizeJa: "口径 11.8 cm · 高さ 7.5 cm",
    sizeEn: "Ø 11.8 cm · H 7.5 cm",
    detailJa: "釉薬ムラが映える薄茶向き",
    detailEn: "Glaze variation suited to usucha",
  },
  {
    id: "cw-003",
    images: [demo(3), demo(5), demo(1)],
    nameJa: "萩焼 白萩 茶碗",
    nameEn: "Hagi — white glaze chawan",
    category: "hagi",
    sizeJa: "口径 13 cm · 高さ 9 cm",
    sizeEn: "Ø 13 cm · H 9 cm",
    detailJa: "土肌が透ける淡い釉 · 経年変化向き",
    detailEn: "Pale glaze over clay body · ages gracefully",
  },
  {
    id: "cw-004",
    images: [demo(4), demo(6)],
    nameJa: "萩焼 灰釉 茶碗",
    nameEn: "Hagi — ash glaze chawan",
    category: "hagi",
    sizeJa: "口径 12 cm · 高さ 8.5 cm",
    sizeEn: "Ø 12 cm · H 8.5 cm",
    detailJa: "口沿に釉溜まり · 濃茶・薄茶兼用",
    detailEn: "Glaze pooling at rim · koicha & usucha",
  },
  {
    id: "cw-005",
    images: [demo(5), demo(1), demo(2)],
    nameJa: "唐津 絵唐津 茶碗",
    nameEn: "Karatsu — e-Karatsu chawan",
    category: "karatsu",
    sizeJa: "口径 13.5 cm · 高さ 8 cm",
    sizeEn: "Ø 13.5 cm · H 8 cm",
    detailJa: "鉄絵と灰釉 · 力強い台座",
    detailEn: "Iron brushwork on ash glaze · sturdy foot",
  },
  {
    id: "cw-006",
    images: [demo(6), demo(3)],
    nameJa: "唐津 荒砥 茶碗",
    nameEn: "Karatsu — ara-to chawan",
    category: "karatsu",
    sizeJa: "口径 14 cm · 高さ 9 cm",
    sizeEn: "Ø 14 cm · H 9 cm",
    detailJa: "荒い土肌 · 冬向き厚手",
    detailEn: "Rough clay texture · winter-weight bowl",
  },
  {
    id: "cw-007",
    images: [demo(1), demo(4)],
    nameJa: "瀬戸 灰釉 茶碗",
    nameEn: "Seto — hai-yu chawan",
    category: "seto",
    sizeJa: "口径 12 cm · 高さ 7 cm",
    sizeEn: "Ø 12 cm · H 7 cm",
    detailJa: "口沿が薄く抹茶の色が映える",
    detailEn: "Thin lip shows matcha color clearly",
  },
  {
    id: "cw-008",
    images: [demo(2), demo(5)],
    nameJa: "瀬戸 黄瀬戸 茶碗",
    nameEn: "Seto — ki-Seto chawan",
    category: "seto",
    sizeJa: "口径 11.5 cm · 高さ 7.5 cm",
    sizeEn: "Ø 11.5 cm · H 7.5 cm",
    detailJa: "黄釉 · カフェ・ギフト向き",
    detailEn: "Yellow glaze · café & gift use",
  },
  {
    id: "cw-009",
    images: [demo(3), demo(6), demo(4)],
    nameJa: "志野 茶碗",
    nameEn: "Shino chawan",
    category: "shino",
    sizeJa: "口径 13 cm · 高さ 8.5 cm",
    sizeEn: "Ø 13 cm · H 8.5 cm",
    detailJa: "志野釉の縮み · 箱付",
    detailEn: "Shino glaze crawl · with tomobako",
  },
  {
    id: "cw-010",
    images: [demo(4), demo(1)],
    nameJa: "織部 茶碗",
    nameEn: "Oribe chawan",
    category: "oribe",
    sizeJa: "口径 12.5 cm · 高さ 8 cm",
    sizeEn: "Ø 12.5 cm · H 8 cm",
    detailJa: "緑釉と鉄絵 · モダンな茶席にも",
    detailEn: "Green glaze & iron motif · modern tea settings",
  },
  {
    id: "cw-011",
    images: [demo(5), demo(2)],
    nameJa: "黒釉 筒茶碗",
    nameEn: "Black glaze — cylindrical chawan",
    category: "other",
    sizeJa: "口径 10 cm · 高さ 9 cm",
    sizeEn: "Ø 10 cm · H 9 cm",
    detailJa: "ホテル・アメニティ向け · ロット対応可",
    detailEn: "Hotel amenity · bulk orders available",
  },
  {
    id: "cw-012",
    images: [demo(6), demo(3), demo(5)],
    nameJa: "粉引 茶碗",
    nameEn: "Kohiki chawan",
    category: "other",
    sizeJa: "口径 13 cm · 高さ 8 cm",
    sizeEn: "Ø 13 cm · H 8 cm",
    detailJa: "白化粧 · 卸・小売セット提案可",
    detailEn: "White slip finish · wholesale sets available",
  },
]

/** 本番画像パスの例（差し替え時に参照） */
export const chawanImagePathExample = chawanImg("001-a.jpg")
