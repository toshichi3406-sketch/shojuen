import type { Locale } from "@/i18n/types"

/** ja は必須。en/zh は任意（無い場合は ja にフォールバック）。 */
export type LocalizedText = { ja: string; en?: string; zh?: string }

export function localize(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.ja
}

export type Article = {
  slug: string
  title: LocalizedText
  excerpt: LocalizedText
  category: LocalizedText
  publishedAt: string
  readMinutes: number
  /** true = journal 一覧・ホームから非表示。直リンクでプレビュー閲覧可。 */
  draft?: boolean
}

/** 公開済み記事（draft でないもの）。一覧・ホーム用。 */
export function getPublishedArticles(): Article[] {
  return articles.filter((a) => !a.draft)
}

/** JOURNAL — 碾茶・抹茶の専門記事。将来 CMS / MDX へ。 */
export const articles: Article[] = [
  {
    slug: "field-note-takeo-chawan-kiln",
    title: {
      ja: "佐賀の焼き物と、武雄の窯元 — 抹茶椀を巡る取材ノート",
      en: "Saga pottery and a Takeo workshop — a field note on matcha bowls",
      zh: "佐賀燒物與武雄窯元 — 抹茶碗採訪筆記",
    },
    excerpt: {
      ja: "当園が抹茶椀を取り扱うにあたり、佐賀・武雄の窯元を訪ねた取材ノート。有田焼・伊万里焼・波佐見焼の文脈のなかで、焼き物を暮らしの彩りとするご主人の話——「2020年」「2021年」の器にまつわるエピソードを、写真とともに残す。",
      en: "A field note from our visit to a workshop in Takeo, Saga, as Shojuen prepares to offer matcha bowls — the kiln owner's view of pottery as color in daily life, set against Arita, Imari, and Hasami, with the story of the pieces named 2020 and 2021.",
      zh: "松壽園準備經手抹茶碗之際，造訪佐賀、武雄窯元的採訪筆記。在有田燒、伊萬里燒、波佐見燒的脈絡中，記錄主人將燒物視為生活彩飾的話語——以及名為「2020年」「2021年」的器物軼事，附照片留存。",
    },
    category: { ja: "取材ノート", en: "Field Notes", zh: "採訪筆記" },
    publishedAt: "2026-06-24",
    readMinutes: 8,
  },
  {
    slug: "field-note-ureshino-kamairi-2026",
    title: {
      ja: "嬉野で聞いた、釜炒り抹茶の話 — 四十三年の目と、三十年ぶりの出来",
      en: "Ureshino kamairi matcha — forty years of the craftsman's eye, and a harvest worth waiting for",
      zh: "嬉野的釜炒抹茶 — 四十三年的眼光，與三十年來最好的一年",
    },
    excerpt: {
      ja: "蒸し製法が主流のいま、嬉野で釜炒り抹茶をつくるのはわずか三件。四十三年以上、水分と火力のバランスを見続けてきた茶師を訪ね、今年「三十年で一番」と聞いた出来と、毎日使える抹茶としての可能性を記録した取材ノート。",
      en: "Steaming dominates today, yet only three makers in Ureshino still pan-fire their matcha. A field note from a visit to a master who has watched the balance of moisture and heat for over forty years — and called this year the best in three decades.",
      zh: "在蒸菁製法為主流的今天，嬉野仍以釜炒製作抹茶的只剩三家。我們拜訪了一位四十三年來持續掌握水分與火候平衡的茶師，記錄下他口中「三十年來最好」的成果，以及作為日常抹茶的可能性。",
    },
    category: { ja: "取材ノート", en: "Field Notes", zh: "採訪筆記" },
    publishedAt: "2026-06-20",
    readMinutes: 6,
  },
  {
    slug: "uji-tencha-shade-structure",
    title: {
      ja: "宇治の覆下栽培：「陰影の階段」とテアニン蓄積の関係",
      en: "Uji shade growing: the “staircase of shade” and theanine accumulation",
      zh: "宇治的覆下栽培：「陰影的階梯」與茶胺酸累積的關係",
    },
    excerpt: {
      ja: "黒い遮光幕の重ね枚数、南側の開口、露地との境界で変わる光量子束密度。一斉に覆うのではなく、段階的に青味を抜く現場の判断基準を、圃場ログとともに整理する。",
      en: "How many layers of black shade cloth, the southern opening, and the photon flux density that shifts at the boundary with open-field rows. Rather than shading all at once, we organize the field's criteria for drawing out greenness in stages, alongside garden logs.",
      zh: "黑色遮光幕的疊放層數、南側的開口，以及在與露天茶畦交界處變化的光量子通量密度。不是一次性遮光，而是分階段抽出青味——我們連同田間紀錄一併整理現場的判斷標準。",
    },
    category: { ja: "産地と栽培", en: "Origin & Growing", zh: "產地與栽培" },
    publishedAt: "2026-04-01",
    readMinutes: 14,
  },
  {
    slug: "nishio-gokou-nitrogen",
    title: {
      ja: "西尾の「ごこう」碾茶：窒素同化と香気の「青芯」",
      en: "Nishio “Gokou” tencha: nitrogen assimilation and the green core of aroma",
      zh: "西尾的「Gokou（ごこう）」碾茶：氮素同化與香氣的『青芯』",
    },
    excerpt: {
      ja: "愛知の平坦な茶畑で育つごこうは、覆下後の蒸し工程で葉の芯まで均一に通熱したとき、独特の花芯のような香気を帯びる。アミノ酸プロファイルと揮発成分の対応を、試飲とヘッドスペース分析の観点から読み解く。",
      en: "Grown on Aichi's flat tea fields, Gokou takes on a distinctive flower-pistil-like aroma when, after shading, the steaming step heats the leaf evenly to its core. We read the correspondence between its amino-acid profile and volatile compounds from the angles of tasting and headspace analysis.",
      zh: "生長於愛知平坦茶園的Gokou，在覆下後的蒸菁工序中，當熱度均勻透至葉芯時，會帶有獨特的花蕊般香氣。我們從試飲與頂空分析（headspace）的角度，解讀其胺基酸組成與揮發成分之間的對應。",
    },
    category: { ja: "品種と製茶", en: "Cultivar & Processing", zh: "品種與製茶" },
    publishedAt: "2026-03-22",
    readMinutes: 11,
  },
  {
    slug: "ishiusu-rpm-and-particle",
    title: {
      ja: "石臼の回転数と粒度分布：「舌に残るザラつき」の正体",
      en: "Stone-mill RPM and particle distribution: the real cause of grit on the tongue",
      zh: "石臼轉速與粒徑分布：「舌上殘留顆粒感」的真相",
    },
    excerpt: {
      ja: "高速回転ほど微粉率は上がるが、過剰な摩擦熱は香気を飛ばす。現場で使われる花崗岩臼の溝の深さと、茶師が耳で聴く「臼の唸り」の意味を、粒子径分布の観点から考察する。",
      en: "Faster rotation raises the fine-powder ratio, but excess friction heat blows off aroma. We examine the groove depth of the granite mills used on site and the meaning of the 'mill's growl' that masters listen for, from the perspective of particle-size distribution.",
      zh: "轉速越高，微粉比例越高，但過度的摩擦熱會帶走香氣。我們從粒徑分布的角度，探討現場所用花崗岩石臼的溝槽深度，以及茶師以耳聆聽的『石臼低鳴』所代表的意義。",
    },
    category: { ja: "碾茶と科学", en: "Tencha & Science", zh: "碾茶與科學" },
    publishedAt: "2026-03-15",
    readMinutes: 10,
  },
  {
    slug: "koicha-usucha-foam-kinin",
    title: {
      ja: "濃茶の泡は立てない：薄茶の「きめ」と茶筅の本数",
      en: "Koicha isn't foamed: usucha's fine texture and the chasen's prong count",
      zh: "濃茶不打泡：薄茶的「細緻泡沫」與茶筅的穗數",
    },
    excerpt: {
      ja: "濃茶は粘度と固形分濃度が高く、茶筅の動きは「解す」に近い。一方、薄茶では細かな泡立ちが旨味の触感と一体になる。茶筅の穗数・硬さと、湯の硬度の相互作用を、茶室での実測メモから。",
      en: "Koicha is high in viscosity and solids, so the chasen's motion is closer to 'loosening.' In usucha, by contrast, fine foam becomes one with the texture of umami. From measured notes in the tea room: the interplay of the chasen's prong count and stiffness with water hardness.",
      zh: "濃茶黏度與固形物濃度高，茶筅的動作較接近「化開」。薄茶則相反，細緻的泡沫與鮮味的觸感融為一體。本文以茶室中的實測筆記，探討茶筅的穗數・軟硬與水質硬度之間的交互作用。",
    },
    category: { ja: "茶道と抽出", en: "Tea Ceremony & Extraction", zh: "茶道與萃取" },
    publishedAt: "2026-03-08",
    readMinutes: 9,
  },
  {
    slug: "chakai-ichigo-ichie-modern",
    title: {
      ja: "茶会の「一期一会」と、モダンな茶の湯の器選び",
      en: "“Ichigo ichie” at a tea gathering, and choosing vessels for a modern chanoyu",
      zh: "茶會的「一期一會」與現代茶之湯的器物選擇",
    },
    excerpt: {
      ja: "古帛紗とガラスの茶碗を同じ一席に並べることの是非ではなく、客人の緊張を解くための視覚的な手掛かりとして、器の肌合いと抹茶の濃緑のコントラストをどう設計するか——現代の茶懐石の現場から。",
      en: "Not whether it's right to place a kobukusa and a glass chawan in the same seat, but how to design the contrast between a vessel's texture and matcha's deep green as a visual cue to ease a guest's tension — from the field of modern cha-kaiseki.",
      zh: "重點不在於將古帛紗與玻璃茶碗並陳於同一席是否得宜，而在於——如何將器物的質地與抹茶濃綠之間的對比，設計成緩解客人緊張的視覺線索。本文來自現代茶懷石的現場。",
    },
    category: { ja: "文化と作法", en: "Culture & Etiquette", zh: "文化與禮法" },
    publishedAt: "2026-02-28",
    readMinutes: 8,
  },
]
