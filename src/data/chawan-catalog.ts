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

/** 取り扱う抹茶椀はすべて有田焼。以下は「種類」による分類。 */
export type ChawanCategory =
  | "matchawan"
  | "chasentate"
  | "kibako"
  | "katakuchi"
  | "nodate"
  | "natsu"

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
  "matchawan",
  "chasentate",
  "kibako",
  "katakuchi",
  "nodate",
  "natsu",
]

/** 仮画像 — 本番は `/images/chawan/` の実写に差し替え */
const demo = (n: number) => `/images/gallery-strip-${((n - 1) % 6) + 1}.png`

export const chawanCatalog: ChawanItem[] = [
  {
    id: "cw-001",
    images: [demo(1), demo(2), demo(3)],
    nameJa: "有田焼 抹茶椀 白磁",
    nameEn: "Arita — white porcelain matcha bowl",
    category: "matchawan",
    sizeJa: "口径 12.5 cm · 高さ 8 cm",
    sizeEn: "Ø 12.5 cm · H 8 cm",
    detailJa: "有田焼 · 白磁 · 抹茶の緑が映える標準碗",
    detailEn: "Arita ware · white porcelain · standard bowl",
  },
  {
    id: "cw-002",
    images: [demo(2), demo(4)],
    nameJa: "有田焼 抹茶椀 染付",
    nameEn: "Arita — sometsuke matcha bowl",
    category: "matchawan",
    sizeJa: "口径 11.8 cm · 高さ 7.5 cm",
    sizeEn: "Ø 11.8 cm · H 7.5 cm",
    detailJa: "有田焼 · 染付（呉須の絵付） · 薄茶向き",
    detailEn: "Arita ware · sometsuke blue-and-white · for usucha",
  },
  {
    id: "cw-003",
    images: [demo(3), demo(5), demo(1)],
    nameJa: "有田焼 抹茶椀 青磁",
    nameEn: "Arita — celadon matcha bowl",
    category: "matchawan",
    sizeJa: "口径 13 cm · 高さ 9 cm",
    sizeEn: "Ø 13 cm · H 9 cm",
    detailJa: "有田焼 · 青磁釉 · 濃茶・薄茶兼用",
    detailEn: "Arita ware · celadon glaze · koicha & usucha",
  },
  {
    id: "cw-004",
    images: [demo(4), demo(6)],
    nameJa: "有田焼 茶筅たて",
    nameEn: "Arita — chasen stand",
    category: "chasentate",
    sizeJa: "口径 6 cm · 高さ 7 cm",
    sizeEn: "Ø 6 cm · H 7 cm",
    detailJa: "有田焼 · 茶筅の保管・乾燥用 · 穂先を整える",
    detailEn: "Arita ware · for storing and drying the chasen",
  },
  {
    id: "cw-005",
    images: [demo(5), demo(1)],
    nameJa: "有田焼 抹茶椀 桐箱付",
    nameEn: "Arita — matcha bowl with paulownia box",
    category: "kibako",
    sizeJa: "口径 12.5 cm · 高さ 8 cm",
    sizeEn: "Ø 12.5 cm · H 8 cm",
    detailJa: "有田焼 · 桐箱入り（木箱2種より選択可） · 贈答向き",
    detailEn: "Arita ware · in a paulownia box (2 box types) · for gifting",
  },
  {
    id: "cw-006",
    images: [demo(6), demo(3)],
    nameJa: "有田焼 抹茶椀 化粧箱付",
    nameEn: "Arita — matcha bowl with presentation box",
    category: "kibako",
    sizeJa: "口径 13 cm · 高さ 8.5 cm",
    sizeEn: "Ø 13 cm · H 8.5 cm",
    detailJa: "有田焼 · 木箱入り · 名入れ・ロゴ対応可",
    detailEn: "Arita ware · wooden box · custom naming available",
  },
  {
    id: "cw-007",
    images: [demo(1), demo(4)],
    nameJa: "有田焼 片口",
    nameEn: "Arita — katakuchi (spouted bowl)",
    category: "katakuchi",
    sizeJa: "口径 12 cm · 高さ 7 cm",
    sizeEn: "Ø 12 cm · H 7 cm",
    detailJa: "有田焼 · 片口 · 点て分け・振り出しにも",
    detailEn: "Arita ware · spouted bowl · pouring & serving",
  },
  {
    id: "cw-008",
    images: [demo(2), demo(5)],
    nameJa: "有田焼 野点椀",
    nameEn: "Arita — nodate (outdoor) bowl",
    category: "nodate",
    sizeJa: "口径 11 cm · 高さ 6.5 cm",
    sizeEn: "Ø 11 cm · H 6.5 cm",
    detailJa: "有田焼 · 野点向きの小ぶりな椀 · 持ち運びやすい",
    detailEn: "Arita ware · compact bowl for outdoor tea",
  },
  {
    id: "cw-009",
    images: [demo(3), demo(6)],
    nameJa: "有田焼 平茶碗（夏用）",
    nameEn: "Arita — flat summer bowl",
    category: "natsu",
    sizeJa: "口径 15 cm · 高さ 6 cm",
    sizeEn: "Ø 15 cm · H 6 cm",
    detailJa: "有田焼 · 広く浅い平碗 · 抹茶が早く冷める夏向き",
    detailEn: "Arita ware · wide, shallow bowl · cools quickly for summer",
  },
]

/** 本番画像パスの例（差し替え時に参照） */
export const chawanImagePathExample = chawanImg("001-a.jpg")
