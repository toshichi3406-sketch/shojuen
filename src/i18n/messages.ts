import type { Locale } from "./types"

export type HowToBlock = {
  title: string
  subtitle: string
  items: { label: string; value: string }[]
}

export type Messages = {
  languageSwitcher: { label: string; ja: string; en: string }
  nav: { ariaMain: string; ariaMobile: string; openMenu: string }
  navItems: Record<
    "home" | "matcha" | "producers" | "journal" | "howTo" | "contact",
    { label: string; description: string }
  >
  footer: { aria: string; blurb: string; rightsSuffix: string }
  hero: {
    imageAlt: string
    title1: string
    title2: string
    lead: string
    ctaProducers: string
    ctaMatcha: string
    scroll: string
  }
  homeMatchaGallery: {
    kicker: string
    heading: string
    intro: string
    fallbackAlt: string
    imageAlts: readonly [
      string,
      string,
      string,
      string,
      string,
      string,
    ]
  }
  homeClosing: { title: string; body: string; contactLine: string; contactCta: string }
  contactPage: {
    title: string
    mailCta: string
    mailSubject: string
    backHome: string
  }
  latest: {
    kicker: string
    heading: string
    intro: string
    min: string
    viewAll: string
  }
  producersPreview: {
    kicker: string
    heading: string
    intro: string
    cta: string
    cardImageAlt: string
  }
  producersPage: {
    heroKicker: string
    title: string
    intro: string
    jumpNavAria: string
    sectionSoil: string
    sectionProcess: string
    sectionCurator: string
  }
  journalPage: {
    introLead: string
    introStrong: string
    introRest: string
    /** Use "{n}" placeholder for article count */
    articleCount: string
    readArticle: string
    min: string
    matchaMoodImageAlts: readonly [string, string, string]
  }
  theMatchaPage: {
    heroKicker: string
    title: string
    introBefore: string
    introStrong: string
    introAfter: string
    imageAlt: string
    badge: string
    origin: string
    cultivar: string
    milling: string
    color: string
    aroma: string
    palate: string
    finish: string
  }
  howToPage: {
    imageAlt: string
    kicker: string
    title: string
    introBefore: string
    introStrong: string
    introAfter: string
    modernTitle: string
    modernBodyBefore: string
    modernBodyStrong: string
    modernBodyAfter: string
    backHome: string
    blocks: HowToBlock[]
  }
  notFound: { title: string; body: string; backHome: string }
  journalArticle: {
    back: string
    min: string
    draftNote: string
  }
}

const ja: Messages = {
  languageSwitcher: {
    label: "Language",
    ja: "日本語",
    en: "English",
  },
  nav: {
    ariaMain: "メイン",
    ariaMobile: "モバイルメイン",
    openMenu: "メニューを開く",
  },
  navItems: {
    home: { label: "トップ", description: "濃緑と一期一会" },
    matcha: { label: "抹茶図鑑", description: "産地・品種・挽き・味わい" },
    producers: { label: "生産者紹介", description: "茶農家・茶師のこだわり" },
    journal: { label: "JOURNAL", description: "碾茶と茶道の記録" },
    howTo: { label: "点て方", description: "濃茶・薄茶・モダンな楽しみ方" },
    contact: { label: "お問い合わせ", description: "卸・取引・ご相談（メール）" },
  },
  footer: {
    aria: "フッター",
    blurb:
      "抹茶（碾茶）の産地・品種・石臼挽き・茶道の精神性を、濃緑の一杯とともに綴るメディアです。茶農家から仕入れた抹茶の海外卸などのご相談も承ります。",
    rightsSuffix: ". All rights reserved.",
  },
  hero: {
    imageAlt:
      "暗い石目の背景に茶筅と濃緑の抹茶粉・点てた抹茶の泡が写ったビジュアル（茶道イメージ）",
    title1: "一期一会の、",
    title2: "抹茶体験を。",
    lead:
      "澄み切った濃緑、茶筅が立てるきめ細かな泡、石臼の音で挽き上げる香り——抹茶は、日本の風土と作法のなかで育まれた一杯です。松壽園SHOJUENは、その複層を言葉で綴ります。",
    ctaProducers: "PRODUCERS を見る",
    ctaMatcha: "THE MATCHA 図鑑",
    scroll: "Scroll",
  },
  homeMatchaGallery: {
    kicker: "Visual",
    heading: "濃緑のかたち — 抹茶のビジュアル",
    intro:
      "ラテやグラスではなく、粉末・茶筅・黒い茶碗と石目の上で光る濃緑だけを切り取った画角です。碾茶が茶碗に至るまでのイメージを共有します。",
    fallbackAlt: "茶道イメージの抹茶写真",
    imageAlts: [
      "黒いスレートの上の茶筅と抹茶粉、点てた抹茶の茶碗",
      "黒い茶碗に立てた細かい泡の抹茶表面のクローズアップ",
      "黒い石目に抹茶粉と茶筅を並べた俯瞰の静物",
      "茶筅を茶碗にかけ、鮮やかな抹茶粉が盛られた構図",
      "石目の上へ抹茶粉が流れ落ちる動きと茶筅",
      "粉末が茶碗に落ちる瞬間と濃緑の泡、茶筅を含むワイドな茶道シーン",
    ],
  },
  homeClosing: {
    title: "一杯の濃緑に、風土と作法が宿る。",
    body:
      "碾茶は覆下栽培から蒸し、乾燥、石臼挽きまで、工程のすべてが茶碗の色と香りに刻まれます。松壽園SHOJUENでは、抹茶の多様性と文化性を、目利きの視点で記録します。",
    contactLine: "お問い合わせはメールにてお願いいたします。",
    contactCta: "お問い合わせ",
  },
  contactPage: {
    title: "お問い合わせ",
    mailCta: "メールを送る",
    mailSubject: "【松壽園SHOJUEN】お問い合わせ",
    backHome: "トップへ戻る",
  },
  latest: {
    kicker: "Journal",
    heading: "JOURNAL · 最新記事",
    intro:
      "覆下栽培の光環境、石臼の粒度、濃茶と薄茶の作法——碾茶と抹茶の専門的な記録をお届けします。",
    min: "分",
    viewAll: "JOURNAL 一覧へ",
  },
  producersPreview: {
    kicker: "Producers",
    heading: "厳選した碾茶の生産者",
    intro:
      "覆下の日数、蒸しの通熱、石臼の回転に宿る個性。松壽園SHOJUENが長く紹介したい生産者だけを載せています。",
    cta: "PRODUCERS 一覧へ",
    cardImageAlt: "黒い茶器と濃緑の抹茶・茶筅のイメージ写真",
  },
  producersPage: {
    heroKicker: "Producers",
    title: "生産者紹介",
    intro:
      "碾茶の香りは、覆下の日数と蒸しの一秒、石臼の回転に宿る。茶樹が根を下ろす土の履歴、品種選びの意図、そして碾茶工房のこだわりを、現地で何度も点て直しながら記録しています。",
    jumpNavAria: "生産者セクションへジャンプ",
    sectionSoil: "土壌とテロワール",
    sectionProcess: "碾茶・挽きの芯",
    sectionCurator: "目利きの視点",
  },
  journalPage: {
    introLead: "覆下栽培の光環境、蒸しの通熱、石臼の粒度、茶室の作法——",
    introStrong: "抹茶（碾茶）",
    introRest:
      "の文化と科学は、一枚の濃緑に収まりきらない層を持っています。宇治・西尾・各地の現場と文献を往復しながら、目利きの視点で記録します。",
    articleCount: "全 {n} 件",
    readArticle: "本文を読む",
    min: "分",
    matchaMoodImageAlts: [
      "黒いスレートの上の茶筅と抹茶粉、点てた抹茶の茶碗",
      "黒い茶碗に立てた細かい泡の抹茶表面のクローズアップ",
      "黒い石目に抹茶粉と茶筅を並べた俯瞰の静物",
    ],
  },
  theMatchaPage: {
    heroKicker: "The Matcha",
    title: "抹茶図鑑",
    introBefore: "碾茶は覆下栽培から蒸し、乾燥、石臼挽きまで、工程のすべてが杯の",
    introStrong: "濃緑",
    introAfter:
      "に刻まれます。産地の土と品種、臼の音と粒度——ワインのテイスティングノートのように、抹茶のスペクトルを整理した参照表です。",
    imageAlt: "黒い背景に抹茶粉と茶筅を置いた静物写真",
    badge: "抹茶",
    origin: "産地",
    cultivar: "品種",
    milling: "挽き方",
    color: "色味",
    aroma: "香気",
    palate: "味わい",
    finish: "余韻",
  },
  howToPage: {
    imageAlt: "石目の上で抹茶粉が流れ落ちる様子と茶筅のイメージ",
    kicker: "How to",
    title: "点て方・楽しみ方",
    introBefore: "濃茶と薄茶では、湯の量・温度・茶筅の動きの目的がまったく異なります。以下は稽古とカフェ双方で再現しやすい",
    introStrong: "ベースライン",
    introAfter: "です。流派・茶会の礼法がある場合は、そちらを優先してください。",
    modernTitle: "モダンな楽しみ方",
    modernBodyBefore: "抹茶ラテでは、牛乳の脂肪が香気を包み込みやすいため、",
    modernBodyStrong: "濃いめの碾茶",
    modernBodyAfter:
      "か、泡立て器で軽くエアレーションして香気を抜くとバランスが取りやすいです。ソーダ割りでは、微粉が沈殿しやすいのでよく混ぜ、氷の溶解で薄まる分を最初から濃い目にするのがコツです。",
    backHome: "トップへ戻る",
    blocks: [
      {
        title: "薄茶（うすちゃ）",
        subtitle: "碗の中で「きめ」を立てる",
        items: [
          {
            label: "湯温",
            value: "約 75〜85℃（沸かしすぎない。軟水が理想）",
          },
          {
            label: "抹茶量",
            value: "目安 2 ちゃしき（約 2g）／水 70ml 前後",
          },
          {
            label: "茶筅",
            value:
              "穗が細かいもの。W 字型で腕を素早く前後に動かし、泡立ちを確認",
          },
          { label: "待ち", value: "立てすぎない。表面に細かな泡が均一に乗れば完了" },
        ],
      },
      {
        title: "濃茶（こいちゃ）",
        subtitle: "粘度と旨味の塊を「解す」",
        items: [
          {
            label: "湯温",
            value: "やや低め 60〜70℃ 帯が多い（流派・銘柄で差あり）",
          },
          {
            label: "抹茶量",
            value: "目安 3.5〜4g 以上／少量の湯から開始し足すことも",
          },
          {
            label: "茶筅",
            value: "泡を立てない。碗底を這わせるようにゆっくり均一に",
          },
          {
            label: "待ち",
            value: "澱が出ないよう、一気にかき回しすぎない",
          },
        ],
      },
    ],
  },
  notFound: {
    title: "ページが見つかりません",
    body: "URL が変更されたか、記事がまだ公開されていない可能性があります。",
    backHome: "トップへ戻る",
  },
  journalArticle: {
    back: "← JOURNAL 一覧",
    min: "分",
    draftNote: "（本文は編集中です。データソースと図版を追って公開予定です。）",
  },
}

const en: Messages = {
  languageSwitcher: {
    label: "Language",
    ja: "日本語",
    en: "English",
  },
  nav: {
    ariaMain: "Main",
    ariaMobile: "Main navigation (mobile)",
    openMenu: "Open menu",
  },
  navItems: {
    home: { label: "HOME", description: "Deep green, ichigo ichie" },
    matcha: {
      label: "THE MATCHA",
      description: "Origin, cultivar, milling, flavor",
    },
    producers: {
      label: "PRODUCERS",
      description: "Growers & tea craftspeople",
    },
    journal: { label: "JOURNAL", description: "Tencha & tea ceremony notes" },
    howTo: {
      label: "HOW TO",
      description: "Koicha, usucha & modern serves",
    },
    contact: {
      label: "CONTACT",
      description: "Email us",
    },
  },
  footer: {
    aria: "Footer",
    blurb:
      "Editorial on matcha (tencha): origins, cultivars, stone milling, and the tea room — alongside sourcing matcha from tea farms and export wholesale inquiries.",
    rightsSuffix: ". All rights reserved.",
  },
  hero: {
    imageAlt:
      "Ceremonial matcha on dark stone: vivid green powder, foam in a black chawan, and a bamboo chasen (tea ceremony mood, not a latte)",
    title1: "Ichigo ichie —",
    title2: "a matcha moment.",
    lead:
      "Clear deep green, fine foam from the chasen, aroma lifted by the stone mill — matcha is a bowl shaped by Japanese land and practice. 松壽園SHOJUEN puts those layers into words.",
    ctaProducers: "Meet the producers",
    ctaMatcha: "The matcha catalog",
    scroll: "Scroll",
  },
  homeMatchaGallery: {
    kicker: "Visual",
    heading: "The shape of deep green",
    intro:
      "No milk, no glassware — only powder, chasen, dark bowls, and emerald light on slate. A shared visual shorthand for how tencha becomes the bowl in front of you.",
    fallbackAlt: "Ceremonial matcha still life",
    imageAlts: [
      "Chasen and matcha powder on black slate beside a bowl of whisked tea",
      "Close-up of fine foam on whisked matcha in a dark ceramic bowl",
      "Overhead still life of matcha powder and chasen on dark stone",
      "Dark chawan with bright matcha powder and a chasen resting on the rim",
      "Matcha powder cascading onto slate beside a bamboo whisk",
      "Wide ceremonial scene: powder falling into a bowl, frothy matcha, and chasen",
    ],
  },
  homeClosing: {
    title: "In one bowl of deep green: place, craft, and ritual.",
    body:
      "From shade-growing and steaming to drying and stone milling, every step of tencha leaves its mark in the color and aroma of the tea in your bowl. 松壽園SHOJUEN records the diversity of matcha and its culture with a curator's eye.",
    contactLine: "Please contact us by email.",
    contactCta: "Contact",
  },
  contactPage: {
    title: "Contact",
    mailCta: "Send email",
    mailSubject: "[SHOJUEN] Inquiry",
    backHome: "Back to home",
  },
  latest: {
    kicker: "Journal",
    heading: "JOURNAL · Latest",
    intro:
      "Shade-growing light, stone-mill particle size, koicha & usucha technique — specialist notes on tencha and matcha.",
    min: "min",
    viewAll: "View all in JOURNAL",
  },
  producersPreview: {
    kicker: "Producers",
    heading: "Tencha producers we return to",
    intro:
      "Character lives in shade days, steam heat, and how the mill turns. Only growers we want to keep spotlighting — curated by 松壽園SHOJUEN.",
    cta: "Browse all producers",
    cardImageAlt: "Dark tea ware with vivid green matcha and a chasen",
  },
  producersPage: {
    heroKicker: "Producers",
    title: "Producers",
    intro:
      "Tencha's aroma lives in shade days, each second of steaming, and the turn of the mill. We record the history in the soil, intent in cultivar choice, and the craft of the workshop — tasting again and again in the field.",
    jumpNavAria: "Jump to producer sections",
    sectionSoil: "Soil & terroir",
    sectionProcess: "Tencha & milling",
    sectionCurator: "Tasting notes",
  },
  journalPage: {
    introLead: "Light under the shade, steam heat, particle size from the mill, etiquette in the tea room — ",
    introStrong: "matcha (tencha)",
    introRest:
      " holds more layers than one bowl of green can hold. We move between Uji, Nishio, other fields and the literature, with a curator's lens.",
    articleCount: "All {n} articles",
    readArticle: "Read article",
    min: "min",
    matchaMoodImageAlts: [
      "Chasen and matcha powder on black slate beside a bowl of whisked tea",
      "Close-up of fine foam on whisked matcha in a dark ceramic bowl",
      "Overhead still life of matcha powder and chasen on dark stone",
    ],
  },
  theMatchaPage: {
    heroKicker: "The Matcha",
    title: "Matcha catalog",
    introBefore:
      "From shade-growing through steam, dry, and stone mill, every step is etched into the bowl's ",
    introStrong: "deep green",
    introAfter:
      ". Soil and cultivar, the sound of the mill and particle size — a reference sheet for matcha's spectrum, like wine tasting notes.",
    imageAlt: "Matcha powder and chasen on a dark background",
    badge: "Matcha",
    origin: "Origin",
    cultivar: "Cultivar",
    milling: "Milling",
    color: "Color",
    aroma: "Aroma",
    palate: "Palate",
    finish: "Finish",
  },
  howToPage: {
    imageAlt: "Matcha powder flowing onto slate with a bamboo chasen",
    kicker: "How to",
    title: "How to prepare & enjoy",
    introBefore:
      "Koicha and usucha differ completely in how much water you use, how hot it is, and what the chasen is trying to do. Below is an easy-to-repeat ",
    introStrong: "baseline",
    introAfter:
      " for both practice and café-style serves. If your school or ceremony has specific forms, follow those first.",
    modernTitle: "Modern serves",
    modernBodyBefore: "In a matcha latte, milk fat can wrap around aroma, so a ",
    modernBodyStrong: "stronger tencha",
    modernBodyAfter:
      " or a quick aeration with a frother can balance the cup. For soda splits, fine powder settles — stir well and start a bit stronger to account for dilution from the ice.",
    backHome: "Back to home",
    blocks: [
      {
        title: "Usucha (thin tea)",
        subtitle: "Raise fine foam in the bowl",
        items: [
          {
            label: "Water temp",
            value: "About 75–85°C (don't over-boil). Soft water is ideal.",
          },
          {
            label: "Matcha amount",
            value: "Roughly 2 chashaku scoops (~2 g) / ~70 ml water.",
          },
          {
            label: "Chasen",
            value:
              "Fine tines. Move the wrist quickly back and forth in a W shape; watch the foam form.",
          },
          {
            label: "Finish",
            value:
              "Don't over-whisk. Done when a fine, even foam covers the surface.",
          },
        ],
      },
      {
        title: "Koicha (thick tea)",
        subtitle: "Dissolve a dense mass of umami",
        items: [
          {
            label: "Water temp",
            value: "Often lower, around 60–70°C (varies by school and tea).",
          },
          {
            label: "Matcha amount",
            value:
              "Often 3.5–4 g or more / start with a little water and add more if needed.",
          },
          {
            label: "Chasen",
            value: "No foam. Glide slowly and evenly along the bowl bottom.",
          },
          {
            label: "Finish",
            value: "Avoid heavy stirring that leaves dregs or clumps.",
          },
        ],
      },
    ],
  },
  notFound: {
    title: "Page not found",
    body: "The URL may have changed, or this article is not published yet.",
    backHome: "Back to home",
  },
  journalArticle: {
    back: "← All JOURNAL articles",
    min: "min",
    draftNote:
      "(Full article in preparation — sources and figures to follow.)",
  },
}

const catalog: Record<Locale, Messages> = { ja, en }

export function getMessages(locale: Locale): Messages {
  return catalog[locale]
}
