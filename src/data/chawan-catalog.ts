/**
 * 抹茶椀カタログ（有田焼・受注生産）
 *
 * 取り扱いはすべて有田焼。受注生産のため個体ごとの写真は用意せず、
 * 「種類（片口・野点・夏用 など）」で絞り込み、
 * 「作風（色・釉調）」で雰囲気を選んでもらう方式。
 *
 * ※ 画像・寸法・ラインアップ・発注条件はすべて【仮】。
 *    実データが揃い次第、差し替える。
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
  /** 品目・作風名 */
  nameJa: string
  nameEn: string
  /** 一言の雰囲気 */
  taglineJa: string
  taglineEn: string
  /** 形の例（仮） */
  shapeJa: string
  shapeEn: string
  /** 用途（仮） */
  useJa: string
  useEn: string
  /** 目安サイズ（仮・受注生産のため個体差あり） */
  sizeJa: string
  sizeEn: string
  /** 参考写真（任意）。未設定なら釉のスウォッチを表示。すべて仮。 */
  image?: string
}

/** 仮の参考写真（実写に差し替え予定） */
const demoBowl = "/images/gallery-strip-2.png"
const demoBowls = "/images/gallery-strip-5.png"

export const chawanStyles: ChawanStyle[] = [
  // ── 抹茶椀 ──────────────────────────────
  {
    id: "hakuji-marugata",
    kind: "matchawan",
    color: "hakuji",
    nameJa: "白磁 丸碗",
    nameEn: "White porcelain — round",
    taglineJa: "抹茶の緑を最も鮮やかに映す、混じりけのない白。",
    taglineEn: "Pure white that shows matcha's green at its brightest.",
    shapeJa: "丸碗（標準）",
    shapeEn: "Standard round",
    useJa: "薄茶・濃茶・撮影映え",
    useEn: "Usucha, koicha, photogenic",
    sizeJa: "口径 約12〜13cm・高さ 約7〜8cm",
    sizeEn: "Ø approx. 12–13cm · H 7–8cm",
  },
  {
    id: "sometsuke-souka",
    kind: "matchawan",
    color: "sometsuke",
    nameJa: "染付 草花文",
    nameEn: "Sometsuke — botanical",
    taglineJa: "呉須の藍で描く草花。有田焼らしい端正な絵付け。",
    taglineEn: "Blue botanical brushwork — the essence of Arita.",
    shapeJa: "丸碗",
    shapeEn: "Round",
    useJa: "薄茶・進物",
    useEn: "Usucha, gifting",
    sizeJa: "口径 約12cm・高さ 約7.5cm",
    sizeEn: "Ø approx. 12cm · H 7.5cm",
    image: demoBowl,
  },
  {
    id: "sometsuke-amime",
    kind: "matchawan",
    color: "sometsuke",
    nameJa: "染付 網目",
    nameEn: "Sometsuke — amime net",
    taglineJa: "繰り返しの網目文。静かで飽きのこない意匠。",
    taglineEn: "A quiet, timeless repeating net pattern.",
    shapeJa: "筒茶碗",
    shapeEn: "Cylindrical",
    useJa: "冬・濃茶",
    useEn: "Winter, koicha",
    sizeJa: "口径 約11cm・高さ 約9cm",
    sizeEn: "Ø approx. 11cm · H 9cm",
  },
  {
    id: "seiji-kannyu",
    kind: "matchawan",
    color: "seiji",
    nameJa: "青磁 貫入",
    nameEn: "Celadon — crackle",
    taglineJa: "淡い青緑の釉に、細かな貫入が景色をつくる。",
    taglineEn: "Pale blue-green glaze with a fine crackle.",
    shapeJa: "丸碗",
    shapeEn: "Round",
    useJa: "薄茶・濃茶",
    useEn: "Usucha, koicha",
    sizeJa: "口径 約12.5cm・高さ 約8cm",
    sizeEn: "Ø approx. 12.5cm · H 8cm",
    image: demoBowls,
  },
  {
    id: "seiji-tsutsu",
    kind: "matchawan",
    color: "seiji",
    nameJa: "青磁 筒茶碗",
    nameEn: "Celadon — cylindrical",
    taglineJa: "深い筒形。冬の濃茶を温かく保つ。",
    taglineEn: "A deep cylinder that keeps winter koicha warm.",
    shapeJa: "筒茶碗",
    shapeEn: "Cylindrical",
    useJa: "冬・濃茶",
    useEn: "Winter, koicha",
    sizeJa: "口径 約10.5cm・高さ 約9.5cm",
    sizeEn: "Ø approx. 10.5cm · H 9.5cm",
  },
  {
    id: "ruri-muji",
    kind: "matchawan",
    color: "ruri",
    nameJa: "瑠璃 無地",
    nameEn: "Ruri — deep blue",
    taglineJa: "深い瑠璃色一色。抹茶の緑と鮮烈に対比。",
    taglineEn: "Deep lapis blue in striking contrast with green.",
    shapeJa: "丸碗",
    shapeEn: "Round",
    useJa: "薄茶・ラテ映え",
    useEn: "Usucha, latte styling",
    sizeJa: "口径 約12cm・高さ 約8cm",
    sizeEn: "Ø approx. 12cm · H 8cm",
  },
  {
    id: "kuro-tenmoku",
    kind: "matchawan",
    color: "kuro",
    nameJa: "黒釉 天目形",
    nameEn: "Black glaze — tenmoku",
    taglineJa: "艶やかな黒。泡立てた抹茶のきめが際立つ。",
    taglineEn: "Lustrous black that highlights the foam's texture.",
    shapeJa: "天目形（端反）",
    shapeEn: "Tenmoku, flared",
    useJa: "薄茶・撮影",
    useEn: "Usucha, photography",
    sizeJa: "口径 約12cm・高さ 約7cm",
    sizeEn: "Ø approx. 12cm · H 7cm",
  },
  {
    id: "tetsu-hakeme",
    kind: "matchawan",
    color: "kuro",
    nameJa: "鉄釉 刷毛目",
    nameEn: "Iron glaze — hakeme",
    taglineJa: "鉄釉に刷毛の景色。素朴で力強い風合い。",
    taglineEn: "Iron glaze with brushed strokes — rustic strength.",
    shapeJa: "丸碗（厚手）",
    shapeEn: "Round, heavier",
    useJa: "冬・日常",
    useEn: "Winter, everyday",
    sizeJa: "口径 約13cm・高さ 約8.5cm",
    sizeEn: "Ø approx. 13cm · H 8.5cm",
  },
  {
    id: "kohiki-muji",
    kind: "matchawan",
    color: "kohiki",
    nameJa: "粉引 無地",
    nameEn: "Kohiki — white slip",
    taglineJa: "白化粧のやわらかな白。経年の景色も楽しめる。",
    taglineEn: "Soft white slip that ages beautifully over time.",
    shapeJa: "丸碗",
    shapeEn: "Round",
    useJa: "薄茶・日常・ラテ",
    useEn: "Usucha, everyday, latte",
    sizeJa: "口径 約12.5cm・高さ 約8cm",
    sizeEn: "Ø approx. 12.5cm · H 8cm",
  },
  {
    id: "kohiki-mishima",
    kind: "matchawan",
    color: "kohiki",
    nameJa: "粉引 三島手",
    nameEn: "Kohiki — Mishima inlay",
    taglineJa: "象嵌の細かな文様。静けさの中に密度がある。",
    taglineEn: "Fine inlaid patterning — density within calm.",
    shapeJa: "丸碗",
    shapeEn: "Round",
    useJa: "薄茶・進物",
    useEn: "Usucha, gifting",
    sizeJa: "口径 約12cm・高さ 約8cm",
    sizeEn: "Ø approx. 12cm · H 8cm",
  },
  // ── 片口 ────────────────────────────────
  {
    id: "hakuji-katakuchi",
    kind: "katakuchi",
    color: "hakuji",
    nameJa: "白磁 片口",
    nameEn: "White porcelain — katakuchi",
    taglineJa: "注ぎ口のある白磁の片口。点て分けにも。",
    taglineEn: "A white katakuchi with a spout — ideal for portioning.",
    shapeJa: "片口（注ぎ口付）",
    shapeEn: "Spouted",
    useJa: "点て分け・取り分け",
    useEn: "Portioning, serving",
    sizeJa: "口径 約13cm・高さ 約7cm",
    sizeEn: "Ø approx. 13cm · H 7cm",
  },
  {
    id: "sometsuke-katakuchi",
    kind: "katakuchi",
    color: "sometsuke",
    nameJa: "染付 片口",
    nameEn: "Sometsuke — katakuchi",
    taglineJa: "藍の片口。席にひとつの景色を添える。",
    taglineEn: "A blue-and-white katakuchi that adds a scene to the table.",
    shapeJa: "片口（注ぎ口付）",
    shapeEn: "Spouted",
    useJa: "点て分け・盛り",
    useEn: "Portioning, plating",
    sizeJa: "口径 約13cm・高さ 約7cm",
    sizeEn: "Ø approx. 13cm · H 7cm",
  },
  // ── 野点 ────────────────────────────────
  {
    id: "kuro-nodate",
    kind: "nodate",
    color: "kuro",
    nameJa: "黒釉 野点碗",
    nameEn: "Black glaze — nodate",
    taglineJa: "持ち運べる小ぶりの黒。屋外の一服に。",
    taglineEn: "A small black bowl to carry — for tea outdoors.",
    shapeJa: "野点碗（小ぶり）",
    shapeEn: "Compact nodate",
    useJa: "野点・携帯",
    useEn: "Outdoor tea, travel",
    sizeJa: "口径 約10.5cm・高さ 約6.5cm",
    sizeEn: "Ø approx. 10.5cm · H 6.5cm",
  },
  {
    id: "kohiki-nodate",
    kind: "nodate",
    color: "kohiki",
    nameJa: "粉引 野点碗",
    nameEn: "Kohiki — nodate",
    taglineJa: "やわらかな白の携帯碗。旅の道具に。",
    taglineEn: "A soft white portable bowl for the journey.",
    shapeJa: "野点碗（小ぶり）",
    shapeEn: "Compact nodate",
    useJa: "野点・携帯",
    useEn: "Outdoor tea, travel",
    sizeJa: "口径 約10.5cm・高さ 約6.5cm",
    sizeEn: "Ø approx. 10.5cm · H 6.5cm",
  },
  // ── 夏用 ────────────────────────────────
  {
    id: "hakuji-hira",
    kind: "natsu",
    color: "hakuji",
    nameJa: "白磁 平茶碗（夏用）",
    nameEn: "White porcelain — flat (summer)",
    taglineJa: "広く浅い夏碗。抹茶が早く冷め、涼やかに。",
    taglineEn: "A wide, shallow summer bowl that cools quickly.",
    shapeJa: "平茶碗",
    shapeEn: "Flat / shallow",
    useJa: "夏・冷抹茶",
    useEn: "Summer, chilled matcha",
    sizeJa: "口径 約14〜15cm・高さ 約6cm",
    sizeEn: "Ø approx. 14–15cm · H 6cm",
  },
  {
    id: "seiji-hira",
    kind: "natsu",
    color: "seiji",
    nameJa: "青磁 平茶碗（夏用）",
    nameEn: "Celadon — flat (summer)",
    taglineJa: "涼やかな青磁の夏碗。水面のような釉肌。",
    taglineEn: "A cool celadon summer bowl with a water-like glaze.",
    shapeJa: "平茶碗",
    shapeEn: "Flat / shallow",
    useJa: "夏・冷抹茶",
    useEn: "Summer, chilled matcha",
    sizeJa: "口径 約14〜15cm・高さ 約6cm",
    sizeEn: "Ø approx. 14–15cm · H 6cm",
  },
  // ── 茶筅たて ────────────────────────────
  {
    id: "hakuji-chasentate",
    kind: "chasentate",
    color: "hakuji",
    nameJa: "白磁 茶筅たて",
    nameEn: "White porcelain — chasen stand",
    taglineJa: "茶筅を休ませる白磁の筒。所作を整える。",
    taglineEn: "A white porcelain rest that keeps the chasen in shape.",
    shapeJa: "茶筅たて（くせ直し）",
    shapeEn: "Chasen rest",
    useJa: "茶筅の保管・乾燥",
    useEn: "Chasen storage & drying",
    sizeJa: "口径 約6cm・高さ 約6cm",
    sizeEn: "Ø approx. 6cm · H 6cm",
  },
  {
    id: "sometsuke-chasentate",
    kind: "chasentate",
    color: "sometsuke",
    nameJa: "染付 茶筅たて",
    nameEn: "Sometsuke — chasen stand",
    taglineJa: "染付の茶筅たて。点前に彩りを添える。",
    taglineEn: "A blue-and-white chasen stand that adds color to the ritual.",
    shapeJa: "茶筅たて（くせ直し）",
    shapeEn: "Chasen rest",
    useJa: "茶筅の保管・乾燥",
    useEn: "Chasen storage & drying",
    sizeJa: "口径 約6cm・高さ 約6cm",
    sizeEn: "Ø approx. 6cm · H 6cm",
  },
  // ── 木箱 ────────────────────────────────
  {
    id: "kibako-a",
    kind: "kibako",
    color: "hakuji",
    nameJa: "木箱 A",
    nameEn: "Wooden box A",
    taglineJa: "器を包む桐の木箱。進物・卸向けの定番仕様。",
    taglineEn: "A paulownia box for the bowl — a classic for gifting and trade.",
    shapeJa: "桐箱（標準）",
    shapeEn: "Paulownia, standard",
    useJa: "進物・保管",
    useEn: "Gifting, storage",
    sizeJa: "器に合わせて調製",
    sizeEn: "Sized to the piece",
  },
  {
    id: "kibako-b",
    kind: "kibako",
    color: "kohiki",
    nameJa: "木箱 B",
    nameEn: "Wooden box B",
    taglineJa: "もう一つの木箱仕様。用途や見た目の好みでお選びください。",
    taglineEn: "A second boxing option — choose by use and look.",
    shapeJa: "桐箱（別仕様）",
    shapeEn: "Paulownia, alternate",
    useJa: "進物・保管",
    useEn: "Gifting, storage",
    sizeJa: "器に合わせて調製",
    sizeEn: "Sized to the piece",
  },
]

/**
 * 工房（有田焼の窯元）の制作風景。カタログページの「制作の現場」で使用。
 * キャプションは i18n（chawanPage.workshopCaptions）と同じ並び順。
 */
export const chawanWorkshopImages = [
  chawanImg("workshop-01-greenware-shelves.png"),
  chawanImg("workshop-02-wheel-trimming.png"),
  chawanImg("workshop-03-drying-foot.png"),
  chawanImg("workshop-05-glaze-buckets.png"),
] as const
