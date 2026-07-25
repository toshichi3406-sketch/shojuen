/**
 * 抹茶椀カタログ（有田焼・陶器／土もの）
 *
 * 取り扱いはすべて有田焼の陶器。窯元在庫から雰囲気で選定。
 * 「種類」で絞り込み、「作風（色・釉調）」で雰囲気を選ぶ方式。
 *
 * ※ ラインアップ・寸法・画像はすべて【仮】。実データが揃い次第、差し替える。
 */
const chawanImg = (name: string) => `/images/chawan/${name}` as const

/** 品目の種類（このページの絞り込み軸） */
export type ChawanKind =
  | "matchawan"
  | "katakuchi"
  | "nodate"
  | "natsu"
  | "chasentate"
  | "kibako"

export const chawanKinds: ChawanKind[] = [
  "matchawan",
  "katakuchi",
  "nodate",
  "natsu",
  "chasentate",
  "kibako",
]

/** 色・釉調による作風（各品目のスウォッチ／ラベルに使用） */
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
  /** 参考写真（任意）。未設定なら釉のスウォッチを表示。すべて仮。 */
  image?: string
}

/** 仮の参考写真（実写に差し替え予定） */
const demoBowl = "/images/gallery-strip-2.png"

/** 仮カタログ（草案用・3点） */
export const chawanStyles: ChawanStyle[] = [
  {
    id: "kohiki-marugata",
    kind: "matchawan",
    color: "kohiki",
    nameJa: "粉引 丸碗",
    nameEn: "Kohiki — round",
    taglineJa: "白化粧のやわらかな白。土ものの温もりが手に残る。",
    taglineEn: "Soft white slip — the warmth of clay in the hand.",
    shapeJa: "丸碗（標準）",
    shapeEn: "Standard round",
    useJa: "薄茶・濃茶",
    useEn: "Usucha, koicha",
    sizeJa: "口径 約12〜13cm・高さ 約7〜8cm",
    sizeEn: "Ø approx. 12–13cm · H 7–8cm",
  },
  {
    id: "kuro-katakuchi",
    kind: "katakuchi",
    color: "kuro",
    nameJa: "黒釉 片口",
    nameEn: "Black glaze — katakuchi",
    taglineJa: "注ぎ口のある黒釉の片口。点て分けにも。",
    taglineEn: "A black-glazed katakuchi with a spout — for portioning.",
    shapeJa: "片口（注ぎ口付）",
    shapeEn: "Spouted",
    useJa: "点て分け・取り分け",
    useEn: "Portioning, serving",
    sizeJa: "口径 約13cm・高さ 約7cm",
    sizeEn: "Ø approx. 13cm · H 7cm",
    image: demoBowl,
  },
  {
    id: "kibako-a",
    kind: "kibako",
    color: "hakuji",
    nameJa: "桐箱",
    nameEn: "Paulownia box",
    taglineJa: "器を包む桐の木箱。進物・卸向け。",
    taglineEn: "A paulownia box for the bowl — for gifting and trade.",
    shapeJa: "桐箱",
    shapeEn: "Paulownia",
    useJa: "進物・保管",
    useEn: "Gifting, storage",
    sizeJa: "器に合わせて調製",
    sizeEn: "Sized to the piece",
  },
]

/**
 * 工房（有田焼の窯元）の制作風景。
 * キャプションは i18n（chawanPage.workshopCaptions）と同じ並び順。
 */
export const chawanWorkshopImages = [
  chawanImg("workshop-01-greenware-shelves.png"),
  chawanImg("workshop-02-wheel-trimming.png"),
  chawanImg("workshop-03-drying-foot.png"),
  chawanImg("workshop-05-glaze-buckets.png"),
] as const
