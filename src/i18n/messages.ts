import type { Locale } from "./types"

export type HowToBlock = {
  title: string
  subtitle: string
  items: { label: string; value: string }[]
}

export type Messages = {
  languageSwitcher: { label: string; ja: string; en: string; zh: string }
  nav: {
    ariaMain: string
    ariaMobile: string
    openMenu: string
    comingSoon: string
  }
  navItems: Record<
    | "home"
    | "matcha"
    | "chawan"
    | "producers"
    | "journal"
    | "howTo"
    | "contact",
    { label: string; description: string }
  >
  footer: {
    aria: string
    blurb: string
    rightsSuffix: string
  }
  hero: {
    imageAlt: string
    title: string
    lead: string
    subtagline: string
    ctaWholesale: string
    ctaJournal: string
    scroll: string
  }
  wholesaleBanner: {
    kicker: string
    body: string
    lines: string
    replyNote: string
    cta: string
  }
  homeMatchaGallery: {
    kicker: string
    heading: string
    intro: string
    fallbackAlt: string
    imageAlts: readonly string[]
  }
  homeClosing: { title: string; body: string; contactLine: string; contactCta: string }
  contactPage: {
    title: string
    mailCta: string
    mailSubject: string
    backHome: string
    wholesaleTitle: string
    wholesaleIntro: string
    wholesaleFields: string
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
    draftPreviewBanner: string
  }
  chawanPage: {
    heroKicker: string
    title: string
    introBefore: string
    introStrong: string
    introAfter: string
    filterAria: string
    filterAll: string
    /** Use "{n}" placeholder for item count */
    itemCount: string
    emptyFilter: string
    viewDetail: string
    closeLightbox: string
    prevPhoto: string
    nextPhoto: string
    photoLabel: string
    sizeLabel: string
    detailLabel: string
    refLabel: string
    inquireItem: string
    mailSubject: string
    ctaTitle: string
    ctaBody: string
    ctaMail: string
    ctaContact: string
    categories: Record<
      | "raku"
      | "hagi"
      | "karatsu"
      | "seto"
      | "shino"
      | "oribe"
      | "other",
      string
    >
  }
}

const ja: Messages = {
  languageSwitcher: {
    label: "Language",
    ja: "日本語",
    en: "English",
    zh: "繁體中文",
  },
  nav: {
    ariaMain: "メイン",
    ariaMobile: "モバイルメイン",
    openMenu: "メニューを開く",
    comingSoon: "近日公開",
  },
  navItems: {
    home: { label: "トップ", description: "宇治・九州の抹茶卸" },
    matcha: { label: "抹茶図鑑", description: "産地・品種・挽き・味わい" },
    chawan: { label: "抹茶椀", description: "茶碗カタログ・卸提案" },
    producers: { label: "生産者紹介", description: "茶農家・茶師のこだわり" },
    journal: { label: "JOURNAL", description: "産地取材と碾茶の記録" },
    howTo: { label: "点て方", description: "濃茶・薄茶・モダンな楽しみ方" },
    contact: { label: "お問い合わせ", description: "卸・取引・ご相談（メール）" },
  },
  footer: {
    aria: "フッター",
    blurb:
      "こだわった農家の抹茶・碾茶・ほうじ茶を、Journal を通じて国内外の業者様へ届けます。",
    rightsSuffix: ". All rights reserved.",
  },
  hero: {
    imageAlt:
      "暗い石目の背景に茶筅と抹茶粉・点てた抹茶の泡が写ったビジュアル",
    title: "職人のこだわりを味わえる一杯へ。お手伝いします。",
    lead:
      "松壽園は、茶を並べて流すだけの商社ではありません。こだわった農家と製茶所の仕事に向き合い、Journal で記録しながら、抹茶・碾茶・ほうじ茶を国内外の業者様へ届けます。お問い合わせは1営業日以内の返信を目指しています。",
    subtagline: "こだわりの農家から · 卸 · 輸出",
    ctaWholesale: "卸売・輸出のご相談",
    ctaJournal: "Journal を読む",
    scroll: "Scroll",
  },
  wholesaleBanner: {
    kicker: "【業務用・輸出向け】",
    body:
      "松壽園は、抹茶・碾茶・ほうじ茶の業務用・輸出向け卸の窓口です。現地で出会った農家と製茶所のこだわりを、あなたの一杯へ。",
    lines:
      "飲料・烘焙・再販など、用途や量に合わせてご相談ください。",
    replyNote: "1営業日以内に返信目標 →",
    cta: "卸売・輸出のご相談",
  },
  homeMatchaGallery: {
    kicker: "Visual",
    heading: "濃緑のかたち — 抹茶のビジュアル",
    intro:
      "ラテやグラスではなく、粉末・茶筅・黒い茶碗と石目の上で光る濃緑だけを切り取った画角です。碾茶が茶碗に至るまでのイメージを共有します。",
    fallbackAlt: "茶道イメージの抹茶写真",
    imageAlts: [
      "黒いスレートに描かれた抹茶粉の螺旋と茶筅",
      "漆の盆、棗と茶筅、茶碗の縁が見える静物",
      "湯が茶碗の抹茶粉に注がれる瞬間の水滴",
      "碾茶の葉と抹茶粉が並んだ二つの黒い茶碗",
      "石台の上に斜めに並んだ三つの黒い茶碗と点てた抹茶",
      "茶筅で抹茶を立てる動きのモーションブラー",
      "黒い天目茶碗の抹茶粉に、鉄瓶から湯を注ぐ瞬間と立ちのぼる湯気",
      "石臼の溝からあふれる、挽きたての鮮やかな抹茶の微粉",
      "漆塗りの棗にかけた竹の茶杓に山盛りの抹茶粉",
    ],
  },
  homeClosing: {
    title: "産地のこだわりを、業務用の一杯へ。",
    body:
      "碾茶は覆下栽培から蒸し、乾燥、石臼挽きまで、工程のすべてが茶碗の色と香りに刻まれます。松壽園では、こだわった農家と製茶所の仕事を Journal で記録しながら、抹茶・碾茶・ほうじ茶を国内外の業者様へ届けます。",
    contactLine: "お問い合わせはメールにてお願いいたします。",
    contactCta: "お問い合わせ",
  },
  contactPage: {
    title: "お問い合わせ",
    mailCta: "メールを送る",
    mailSubject: "【松壽園SHOJUEN】お問い合わせ",
    backHome: "トップへ戻る",
    wholesaleTitle: "■ 卸売・輸出のお問い合わせ",
    wholesaleIntro:
      "以下をお知らせください（すべて不要・分かる範囲で可）：",
    wholesaleFields:
      "・会社名 / 用途（飲料・烘焙・再販）\n・希望商品・数量（kg）\n・納品国・希望時期",
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
    sectionSoil: "土壌と風土",
    sectionProcess: "碾茶・挽きの芯",
    sectionCurator: "目利きの視点",
  },
  journalPage: {
    introLead: "覆下栽培の光環境、蒸しの通熱、石臼の粒度、茶室の作法——",
    introStrong: "抹茶（碾茶）",
    introRest:
      "の文化と科学は、現場と文献にまたがる層を持っています。宇治・九州の産地を取材しながら、目利きの視点で記録します。",
    articleCount: "全 {n} 件",
    readArticle: "本文を読む",
    min: "分",
    matchaMoodImageAlts: [
      "黒いスレートに描かれた抹茶粉の螺旋と茶筅",
      "漆塗り盆に棗と茶筅、茶碗の縁が見える静物",
      "湯が茶碗の抹茶粉に注がれる瞬間の水滴",
    ],
  },
  theMatchaPage: {
    heroKicker: "The Matcha",
    title: "抹茶図鑑",
    introBefore: "碾茶は覆下栽培から蒸し、乾燥、石臼挽きまで、工程のすべてが杯の",
    introStrong: "濃緑",
    introAfter:
      "に刻まれます。産地の土と品種、臼の音と粒度——ワインのテイスティングノートのように、抹茶のスペクトルを整理した参照表です。",
    imageAlt: "複数の抹茶粉の色味を並べた俯瞰のイメージ",
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
    imageAlt: "茶筅で抹茶を点てる手元のイメージ",
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
    draftPreviewBanner:
      "プレビュー — この記事は未公開です。JOURNAL 一覧には表示されません。",
  },
  chawanPage: {
    heroKicker: "Chawan",
    title: "抹茶椀カタログ",
    introBefore:
      "楽焼・萩・唐津ほか、茶道用茶碗からホテル・アメニティ向けまで。松壽園SHOJUENが",
    introStrong: "取引先向け",
    introAfter:
      "にご提案する抹茶椀のラインアップです。口径・仕上げ・ロット対応の可否など、詳細は各商品またはお問い合わせよりご相談ください。",
    filterAria: "カテゴリで絞り込み",
    filterAll: "すべて",
    itemCount: "全 {n} 点",
    emptyFilter: "該当する商品がありません。",
    viewDetail: "詳細を見る",
    closeLightbox: "閉じる",
    prevPhoto: "前の写真",
    nextPhoto: "次の写真",
    photoLabel: "写真",
    sizeLabel: "サイズ",
    detailLabel: "仕様・特徴",
    refLabel: "参照番号",
    inquireItem: "この椀について問い合わせ",
    mailSubject: "【松壽園SHOJUEN】抹茶椀のお問い合わせ",
    ctaTitle: "卸・取引のご相談",
    ctaBody:
      "数量・納期・箱付・名入れなど、取引条件は案件ごとにご提案します。カタログにない形状・釉色のご要望もお気軽にどうぞ。",
    ctaMail: "メールで相談する",
    ctaContact: "お問い合わせページ",
    categories: {
      raku: "楽焼",
      hagi: "萩",
      karatsu: "唐津",
      seto: "瀬戸",
      shino: "志野",
      oribe: "織部",
      other: "その他",
    },
  },
}

const en: Messages = {
  languageSwitcher: {
    label: "Language",
    ja: "日本語",
    en: "English",
    zh: "繁體中文",
  },
  nav: {
    ariaMain: "Main",
    ariaMobile: "Main navigation (mobile)",
    openMenu: "Open menu",
    comingSoon: "Coming soon",
  },
  navItems: {
    home: { label: "HOME", description: "Uji & Kyushu matcha wholesale" },
    matcha: {
      label: "THE MATCHA",
      description: "Origin, cultivar, milling, flavor",
    },
    chawan: {
      label: "CHAWAN",
      description: "Matcha bowl catalog & wholesale",
    },
    producers: {
      label: "PRODUCERS",
      description: "Growers & tea craftspeople",
    },
    journal: { label: "JOURNAL", description: "Field notes & tencha records" },
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
      "Matcha, tencha & hojicha from farmers and craftspeople we care about — delivered through our Journal.",
    rightsSuffix: ". All rights reserved.",
  },
  hero: {
    imageAlt:
      "Ceremonial matcha on dark stone: green powder, foam in a black chawan, and a bamboo chasen",
    title:
      "Helping you serve a cup that carries the craftsperson's intent.",
    lead:
      "Shojuen is not a broker that simply lists tea. We work with farmers and mills we believe in, document their craft in our Journal, and deliver matcha, tencha & hojicha to businesses worldwide. We aim to reply within one business day.",
    subtagline: "Farm-sourced · Wholesale · Export",
    ctaWholesale: "Wholesale & export inquiry",
    ctaJournal: "Read the Journal",
    scroll: "Scroll",
  },
  wholesaleBanner: {
    kicker: "For business & export",
    body:
      "Shojuen is the B2B wholesale & export desk for matcha, tencha & hojicha — connecting craft from the field to your cup.",
    lines:
      "Beverage, baking, resale — tell us your use and volume; we're happy to discuss fit and samples.",
    replyNote: "Reply within 1 business day →",
    cta: "Wholesale & export inquiry",
  },
  homeMatchaGallery: {
    kicker: "Visual",
    heading: "The shape of deep green",
    intro:
      "No milk, no glassware — only powder, chasen, dark bowls, and emerald light on slate. A shared visual shorthand for how tencha becomes the bowl in front of you.",
    fallbackAlt: "Ceremonial matcha still life",
    imageAlts: [
      "Matcha powder spiral on black slate with a bamboo whisk",
      "Still life with lacquer tray, natsume caddy, chasen, and chawan rim",
      "Hot water pouring onto matcha powder in a bowl, droplets frozen mid-air",
      "Two dark bowls: tencha leaves and bright matcha powder on weathered wood",
      "Three black chawans in perspective on stone, nearest bowl whisked matcha",
      "Motion blur of whisking matcha with chasen in a dark chawan",
      "Hot water poured from an iron kettle onto matcha powder in a black tenmoku bowl, steam rising",
      "Freshly stone-milled vivid matcha powder spilling from the grooves of a granite mill",
      "A bamboo chashaku heaped with matcha powder resting across a lacquer tea caddy",
    ],
  },
  homeClosing: {
    title: "From origin craft to your business cup.",
    body:
      "From shade-growing and steaming to drying and stone milling, every step of tencha leaves its mark in the bowl. Shojuen documents the work of farmers and mills we care about in our Journal, and delivers matcha, tencha & hojicha to businesses worldwide.",
    contactLine: "Please contact us by email.",
    contactCta: "Contact",
  },
  contactPage: {
    title: "Contact",
    mailCta: "Send email",
    mailSubject: "[SHOJUEN] Inquiry",
    backHome: "Back to home",
    wholesaleTitle: "Wholesale & export inquiries",
    wholesaleIntro:
      "Please share what you can (all fields optional):",
    wholesaleFields:
      "· Company name / use (beverage, baking, resale)\n· Product & quantity (kg)\n· Destination country & timing",
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
    sectionSoil: "Soil & land",
    sectionProcess: "Tencha & milling",
    sectionCurator: "Tasting notes",
  },
  journalPage: {
    introLead: "Light under the shade, steam heat, particle size from the mill, etiquette in the tea room — ",
    introStrong: "matcha (tencha)",
    introRest:
      " holds layers that span field work and literature. We document Uji, Kyushu, and other origins with a curator's lens.",
    articleCount: "All {n} articles",
    readArticle: "Read article",
    min: "min",
    matchaMoodImageAlts: [
      "Matcha powder spiral on black slate with a bamboo whisk",
      "Still life with lacquer tray, natsume caddy, chasen, and chawan rim",
      "Hot water pouring onto matcha powder in a bowl, droplets frozen mid-air",
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
    imageAlt: "Overhead view of several heaps of matcha powder in different greens",
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
    imageAlt: "Hands whisking matcha with a chasen above a chawan",
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
    draftPreviewBanner:
      "Preview — this article is not published yet and does not appear on the JOURNAL index.",
  },
  chawanPage: {
    heroKicker: "Chawan",
    title: "Matcha bowl catalog",
    introBefore:
      "From raku and hagi to karatsu — ceremonial chawan and hotel amenity lines. A ",
    introStrong: "wholesale-facing",
    introAfter:
      " lineup curated by 松壽園SHOJUEN. Tap any bowl for size and finish notes, or email us for MOQ, lead time, and custom packaging.",
    filterAria: "Filter by category",
    filterAll: "All",
    itemCount: "{n} items",
    emptyFilter: "No items in this category.",
    viewDetail: "View details",
    closeLightbox: "Close",
    prevPhoto: "Previous photo",
    nextPhoto: "Next photo",
    photoLabel: "Photo",
    sizeLabel: "Size",
    detailLabel: "Finish & notes",
    refLabel: "Reference",
    inquireItem: "Inquire about this bowl",
    mailSubject: "[SHOJUEN] Matcha bowl inquiry",
    ctaTitle: "Wholesale & trade inquiries",
    ctaBody:
      "We quote volume, lead time, tomobako, and branding per project. Custom shapes and glazes outside this catalog are welcome.",
    ctaMail: "Email us",
    ctaContact: "Contact page",
    categories: {
      raku: "Raku",
      hagi: "Hagi",
      karatsu: "Karatsu",
      seto: "Seto",
      shino: "Shino",
      oribe: "Oribe",
      other: "Other",
    },
  },
}

const zh: Messages = {
  languageSwitcher: {
    label: "語言",
    ja: "日本語",
    en: "English",
    zh: "繁體中文",
  },
  nav: {
    ariaMain: "主選單",
    ariaMobile: "行動版主選單",
    openMenu: "開啟選單",
    comingSoon: "即將推出",
  },
  navItems: {
    home: { label: "首頁", description: "宇治・九州抹茶批發" },
    matcha: { label: "抹茶圖鑑", description: "產地・品種・研磨・風味" },
    chawan: { label: "抹茶碗", description: "茶碗型錄・批發提案" },
    producers: { label: "生產者介紹", description: "茶農與茶師的講究" },
    journal: { label: "JOURNAL", description: "產地取材與碾茶紀錄" },
    howTo: { label: "點茶方式", description: "濃茶・薄茶・現代喝法" },
    contact: { label: "聯絡我們", description: "批發・交易・諮詢（Email）" },
  },
  footer: {
    aria: "頁尾",
    blurb:
      "透過 Journal，將我們信賴的農家抹茶・碾茶・焙茶送達海內外業者。",
    rightsSuffix: ". All rights reserved.",
  },
  hero: {
    imageAlt: "深色石紋背景上的茶筅、抹茶粉與點好的抹茶泡沫",
    title: "協助您呈現承載職人堅持的一杯。",
    lead:
      "松壽園不是只陳列茶葉的商社。我們與信賴的農家與製茶所合作，在 Journal 中記錄他們的堅持，並將抹茶・碾茶・焙茶送達海內外業者。目標一個工作天內回覆。",
    subtagline: "嚴選農家 · 批發 · 出口",
    ctaWholesale: "批發・出口諮詢",
    ctaJournal: "閱讀 Journal",
    scroll: "Scroll",
  },
  wholesaleBanner: {
    kicker: "【業務用・出口向】",
    body: "松壽園是抹茶・碾茶・焙茶的業務用・出口批發窗口。將現地遇見的農家與製茶所之堅持，送到您的一杯。",
    lines: "飲料・烘焙・再販等，依用途與數量歡迎洽詢。",
    replyNote: "目標一個工作天內回覆 →",
    cta: "批發・出口諮詢",
  },
  homeMatchaGallery: {
    kicker: "Visual",
    heading: "濃綠的樣貌 — 抹茶視覺",
    intro:
      "不是拿鐵或玻璃杯，而是只擷取粉末、茶筅、黑碗與石紋上閃耀的濃綠的畫面。分享碾茶化為一碗茶之前的意象。",
    fallbackAlt: "茶道意象的抹茶照片",
    imageAlts: [
      "黑石板上的抹茶粉螺旋與茶筅",
      "漆盤、棗、茶筅與茶碗邊緣的靜物",
      "熱水注入茶碗抹茶粉的瞬間水滴",
      "碾茶葉與抹茶粉並列的兩個黑碗",
      "石台上斜向排列的三個黑碗與點好的抹茶",
      "茶筅點抹茶的動態模糊",
      "鐵壺將熱水注入黑天目茶碗中抹茶粉的瞬間，蒸氣升起",
      "從石臼溝槽溢出的現磨鮮綠抹茶細粉",
      "竹製茶杓上山盛的抹茶粉，橫架於漆器棗罐邊緣",
    ],
  },
  homeClosing: {
    title: "將產地的堅持，化為業務用的一杯。",
    body:
      "碾茶從覆下栽培到蒸菁、乾燥、石臼研磨，每一道工序都刻印在茶碗的色與香裡。松壽園在 Journal 中記錄信賴的農家與製茶所，將抹茶・碾茶・焙茶送達海內外業者。",
    contactLine: "諮詢請以 Email 與我們聯繫。",
    contactCta: "聯絡我們",
  },
  contactPage: {
    title: "聯絡我們",
    mailCta: "寄送 Email",
    mailSubject: "【松壽園SHOJUEN】諮詢",
    backHome: "返回首頁",
    wholesaleTitle: "■ 批發・出口諮詢",
    wholesaleIntro: "請告知以下資訊（全部非必填，能提供的範圍即可）：",
    wholesaleFields:
      "・公司名 / 用途（飲料・烘焙・再販）\n・希望商品・數量（kg）\n・交貨國・希望時期",
  },
  latest: {
    kicker: "Journal",
    heading: "JOURNAL · 最新文章",
    intro:
      "覆下栽培的光環境、石臼的粒度、濃茶與薄茶的作法——為您送上碾茶與抹茶的專業紀錄。",
    min: "分鐘",
    viewAll: "前往 JOURNAL 列表",
  },
  producersPreview: {
    kicker: "Producers",
    heading: "嚴選的碾茶生產者",
    intro:
      "覆下的天數、蒸菁的透熱、石臼轉動間蘊含的個性。只刊載松壽園SHOJUEN想長期介紹的生產者。",
    cta: "前往 PRODUCERS 列表",
    cardImageAlt: "黑色茶具與濃綠抹茶、茶筅的意象照片",
  },
  producersPage: {
    heroKicker: "Producers",
    title: "生產者介紹",
    intro:
      "碾茶的香氣，蘊藏在覆下的天數、蒸菁的每一秒與石臼的轉動裡。茶樹紮根的土壤履歷、選擇品種的用意，以及碾茶工房的講究，我們在現場反覆點茶、反覆記錄。",
    jumpNavAria: "跳至生產者區塊",
    sectionSoil: "土壤與風土",
    sectionProcess: "碾茶・研磨之芯",
    sectionCurator: "鑑賞者的視角",
  },
  journalPage: {
    introLead: "覆下栽培的光環境、蒸菁的透熱、石臼的粒度、茶室的作法——",
    introStrong: "抹茶（碾茶）",
    introRest:
      "的文化與科學，擁有跨越現場與文獻的層次。我們往返於宇治、九州等產地，以鑑賞者的視角記錄。",
    articleCount: "共 {n} 篇",
    readArticle: "閱讀全文",
    min: "分鐘",
    matchaMoodImageAlts: [
      "黑色石板上描繪的抹茶粉螺旋與茶筅",
      "漆盤上的棗形茶罐與茶筅，可見茶碗邊緣的靜物",
      "熱水注入茶碗抹茶粉瞬間的水滴",
    ],
  },
  theMatchaPage: {
    heroKicker: "The Matcha",
    title: "抹茶圖鑑",
    introBefore: "碾茶從覆下栽培到蒸菁、乾燥、石臼研磨，每一道工序都刻印在杯中的",
    introStrong: "濃綠",
    introAfter:
      "裡。產地的土與品種、石臼的聲音與粒度——如同葡萄酒的品飲筆記，整理抹茶光譜的參照表。",
    imageAlt: "並排呈現多種抹茶粉色澤的俯瞰意象",
    badge: "抹茶",
    origin: "產地",
    cultivar: "品種",
    milling: "研磨方式",
    color: "色澤",
    aroma: "香氣",
    palate: "口感",
    finish: "餘韻",
  },
  howToPage: {
    imageAlt: "以茶筅點抹茶的手部意象",
    kicker: "How to",
    title: "點茶與品飲方式",
    introBefore:
      "濃茶與薄茶在用水量、溫度、茶筅動作的目的上完全不同。以下是在練習與咖啡店都容易重現的",
    introStrong: "基準",
    introAfter: "。若有流派或茶會的禮法，請以其為優先。",
    modernTitle: "現代喝法",
    modernBodyBefore: "抹茶拿鐵中，牛奶的脂肪容易包覆香氣，因此使用",
    modernBodyStrong: "濃一點的碾茶",
    modernBodyAfter:
      "，或以打泡器稍微打入空氣帶出香氣，較容易取得平衡。氣泡水調飲時細粉容易沉澱，要充分攪拌，並考量冰塊融化會稀釋，一開始就調濃一些是訣竅。",
    backHome: "返回首頁",
    blocks: [
      {
        title: "薄茶（usucha）",
        subtitle: "在碗中打出細緻的「泡沫」",
        items: [
          {
            label: "水溫",
            value: "約 75〜85℃（勿過度煮沸。軟水為佳）",
          },
          {
            label: "抹茶量",
            value: "約 2 杓（約 2g）／水約 70ml",
          },
          {
            label: "茶筅",
            value: "選穗較細者。以 W 字形快速前後運腕，觀察泡沫生成",
          },
          { label: "收尾", value: "勿過度打發。表面均勻覆上細泡即完成" },
        ],
      },
      {
        title: "濃茶（koicha）",
        subtitle: "化開黏稠而濃郁的鮮味團塊",
        items: [
          {
            label: "水溫",
            value: "多偏低 60〜70℃ 區間（依流派・品牌而異）",
          },
          {
            label: "抹茶量",
            value: "約 3.5〜4g 以上／可先以少量水開始再添加",
          },
          {
            label: "茶筅",
            value: "不打泡。如貼著碗底般緩慢均勻地移動",
          },
          {
            label: "收尾",
            value: "為避免產生沉渣，勿一口氣過度攪拌",
          },
        ],
      },
    ],
  },
  notFound: {
    title: "找不到頁面",
    body: "網址可能已變更，或文章尚未公開。",
    backHome: "返回首頁",
  },
  journalArticle: {
    back: "← JOURNAL 列表",
    min: "分鐘",
    draftNote: "（內文編輯中。將陸續補上資料來源與圖版後公開。）",
    draftPreviewBanner:
      "預覽 — 本文尚未公開，不會出現在 JOURNAL 列表。",
  },
  chawanPage: {
    heroKicker: "Chawan",
    title: "抹茶碗型錄",
    introBefore:
      "從樂燒・萩燒・唐津，到茶道用茶碗與飯店備品。這是松壽園SHOJUEN為",
    introStrong: "合作夥伴",
    introAfter:
      "提案的抹茶碗系列。口徑、表面處理、能否配合批量等細節，請於各商品或來信洽詢。",
    filterAria: "依分類篩選",
    filterAll: "全部",
    itemCount: "共 {n} 件",
    emptyFilter: "沒有符合的商品。",
    viewDetail: "查看詳情",
    closeLightbox: "關閉",
    prevPhoto: "上一張",
    nextPhoto: "下一張",
    photoLabel: "照片",
    sizeLabel: "尺寸",
    detailLabel: "規格與特徵",
    refLabel: "參考編號",
    inquireItem: "洽詢此碗",
    mailSubject: "【松壽園SHOJUEN】抹茶碗洽詢",
    ctaTitle: "批發・交易洽詢",
    ctaBody:
      "數量、交期、附木箱、刻名等交易條件將依個案提案。型錄以外的造型・釉色需求也歡迎洽詢。",
    ctaMail: "以 Email 洽詢",
    ctaContact: "聯絡頁面",
    categories: {
      raku: "樂燒",
      hagi: "萩燒",
      karatsu: "唐津燒",
      seto: "瀨戶燒",
      shino: "志野燒",
      oribe: "織部燒",
      other: "其他",
    },
  },
}

const catalog: Record<Locale, Messages> = { ja, en, zh }

export function getMessages(locale: Locale): Messages {
  return catalog[locale]
}
