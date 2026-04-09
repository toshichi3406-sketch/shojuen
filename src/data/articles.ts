export type Article = {
  slug: string
  title: string
  excerpt: string
  category: string
  publishedAt: string
  readMinutes: number
}

/** JOURNAL — 碾茶・抹茶の専門記事。将来 CMS / MDX へ。 */
export const articles: Article[] = [
  {
    slug: "uji-tencha-shade-structure",
    title: "宇治の覆下栽培：「陰影の階段」とテアニン蓄積の関係",
    excerpt:
      "黒い遮光幕の重ね枚数、南側の開口、露地との境界で変わる光量子束密度。一斉に覆うのではなく、段階的に青味を抜く現場の判断基準を、圃場ログとともに整理する。",
    category: "産地と栽培",
    publishedAt: "2026-04-01",
    readMinutes: 14,
  },
  {
    slug: "nishio-gokou-nitrogen",
    title: "西尾の「ごこう」碾茶：窒素同化と香気の「青芯」",
    excerpt:
      "愛知の平坦な茶畑で育つごこうは、覆下後の蒸し工程で葉の芯まで均一に通熱したとき、独特の花芯のような香気を帯びる。アミノ酸プロファイルと揮発成分の対応を、試飲とヘッドスペース分析の観点から読み解く。",
    category: "品種と製茶",
    publishedAt: "2026-03-22",
    readMinutes: 11,
  },
  {
    slug: "ishiusu-rpm-and-particle",
    title: "石臼の回転数と粒度分布：「舌に残るザラつき」の正体",
    excerpt:
      "高速回転ほど微粉率は上がるが、過剰な摩擦熱は香気を飛ばす。現場で使われる花崗岩臼の溝の深さと、茶師が耳で聴く「臼の唸り」の意味を、粒子径分布の観点から考察する。",
    category: "碾茶と科学",
    publishedAt: "2026-03-15",
    readMinutes: 10,
  },
  {
    slug: "koicha-usucha-foam-kinin",
    title: "濃茶の泡は立てない：薄茶の「きめ」と茶筅の本数",
    excerpt:
      "濃茶は粘度と固形分濃度が高く、茶筅の動きは「解す」に近い。一方、薄茶では細かな泡立ちが旨味の触感と一体になる。茶筅の穗数・硬さと、湯の硬度の相互作用を、茶室での実測メモから。",
    category: "茶道と抽出",
    publishedAt: "2026-03-08",
    readMinutes: 9,
  },
  {
    slug: "chakai-ichigo-ichie-modern",
    title: "茶会の「一期一会」と、モダンな茶の湯の器選び",
    excerpt:
      "古帛紗とガラスの茶碗を同じ一席に並べることの是非ではなく、客人の緊張を解くための視覚的な手掛かりとして、器の肌合いと抹茶の濃緑のコントラストをどう設計するか——現代の茶懐石の現場から。",
    category: "文化と作法",
    publishedAt: "2026-02-28",
    readMinutes: 8,
  },
]
