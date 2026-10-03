"use client"

import Image from "next/image"
import Link from "next/link"

import { FadeIn } from "@/components/motion/fade-in"
import { buttonVariants } from "@/components/ui/button"
import { getContactEmail } from "@/data/site-contact"
import { useLanguage } from "@/i18n/language-context"
import type { Locale } from "@/i18n/types"
import { cn } from "@/lib/utils"

const otsuka = {
  hero: "/images/wholesale/otsuka-hero.jpg",
  cultivation: "/images/wholesale/otsuka-cultivation.jpg",
  process: "/images/wholesale/otsuka-process.jpg",
  grinding: "/images/wholesale/otsuka-grinding.jpg",
} as const

const ureshino = {
  field: "/images/journal/ureshino_20260620/01-tea-field-mist.png",
  rows: "/images/journal/ureshino_20260620/03-tea-garden-rows.png",
  powder: "/images/journal/ureshino_20260620/06-matcha-powder-bowl.png",
  tasting: "/images/journal/ureshino_20260620/04-matcha-bowl-whisk.png",
} as const

type WholesaleCopy = {
  heroKicker: string
  heroTitle: string
  heroLead: string
  heroCta: string
  journalCta: string
  heroNote: string
  trustLabels: readonly string[]
  originKicker: string
  originTitle: string
  originBody: string
  originPhotoCaption: string
  fieldPhotoCaption: string
  processKicker: string
  processTitle: string
  processLead: string
  processPoints: readonly string[]
  processPhotoCaption: string
  fieldKicker: string
  fieldTitle: string
  fieldLead: string
  fieldNotes: readonly string[]
  useKicker: string
  useTitle: string
  useLead: string
  uses: readonly { title: string; body: string }[]
  originsKicker: string
  originsTitle: string
  originsBody: string
  tradeKicker: string
  tradeTitle: string
  tradeLead: string
  tradeItems: readonly { title: string; body: string }[]
  tradeNote: string
  flowKicker: string
  flowTitle: string
  steps: readonly { no: string; title: string; body: string }[]
  faqKicker: string
  faqTitle: string
  faqs: readonly { question: string; answer: string }[]
  inquiryKicker: string
  inquiryTitle: string
  inquiryBody: string
  inquiryFields: readonly string[]
  inquiryCta: string
}

const copy: Record<Locale, WholesaleCopy> = {
  ja: {
    heroKicker: "SHOJUEN · 卸売 / 輸出",
    heroTitle: "用途に合う日本茶を、産地から。",
    heroLead:
      "カフェ、ブランド、輸入・卸売事業者向けに、抹茶・碾茶・ほうじ茶をご提案します。産地や銘柄を先に決めるのではなく、用途、味、色、必要量、ご予算を伺いながら最適な選択肢を一緒に探します。",
    heroCta: "卸売・輸出について相談する",
    journalCta: "産地の記録を見る",
    heroNote: "小ロットでのお試しから、継続的なお取引までご相談いただけます。",
    trustLabels: ["MATCHA", "TENCHA", "HOJICHA", "SMALL LOT", "EXPORT"],
    originKicker: "WHOLESALE APPROACH",
    originTitle: "用途に合わせて、選ぶ。",
    originBody:
      "松壽園では、特定の農園や一つの産地に限定せず、現地での確認や飲み比べを重ねながら、用途と条件に合う茶をご提案しています。味や色だけでなく、必要量や価格、継続供給のしやすさまで含めて選びます。",
    originPhotoCaption: "日本の茶産地",
    fieldPhotoCaption: "産地での記録",
    processKicker: "FROM FIELD TO PRODUCT",
    processTitle: "畑から製茶まで、品質の背景を確かめる。",
    processLead:
      "茶畑の状態や製造工程を知ることは、最終的な色・香り・味を見極めるうえで大切です。栽培から製茶、研磨までの流れを踏まえたうえで、実際の用途に合うものを選定します。",
    processPoints: [
      "ラテ、薄茶、菓子、物販など、用途ごとに必要な特性を整理",
      "味と色に加え、価格と必要量も合わせて比較",
      "輸出先や継続供給の条件まで含めて候補を絞る",
    ],
    processPhotoCaption: "日本の茶産地・製茶風景",
    fieldKicker: "HOW WE SELECT",
    fieldTitle: "実際に飲んで、用途との相性を確かめる。",
    fieldLead:
      "粉の色やスペックだけで判断せず、実際に点てたり抽出したりしながら、香り、味、余韻を確認します。カフェ用途では、ミルクやレシピとの相性まで見てご提案します。",
    fieldNotes: [
      "見た目だけでなく、抽出後の香りと味を確認",
      "カフェ用途では、ミルクやレシピとの相性もチェック",
      "商品化に必要な価格、数量、供給の安定性まで考慮",
    ],
    useKicker: "PRODUCT RANGE",
    useTitle: "用途に合わせて、必要な茶を選ぶ。",
    useLead:
      "ラテ、薄茶、菓子、原料、物販では、求められる茶が違います。用途と条件を伺いながら、商品を絞り込んでご提案します。",
    uses: [
      {
        title: "MATCHA / LATTE",
        body: "ミルクに合わせても色と香りが残りやすく、日々の運用で使いやすい価格とのバランスを重視します。",
      },
      {
        title: "MATCHA / STRAIGHT",
        body: "薄茶やストレート向け。旨味、香り、口当たり、余韻を重視して選びます。",
      },
      {
        title: "MATCHA / FOOD",
        body: "菓子・製菓・料理向け。焼成後の色や香り、レシピ原価とのバランスを見ながら選定します。",
      },
      {
        title: "TENCHA",
        body: "原料用途や商品開発向け。必要量や用途に合わせて、産地や特徴を比較しながらご提案します。",
      },
      {
        title: "HOJICHA",
        body: "ラテ、菓子、飲料などの業務用途向け。香ばしさ、色、価格、使いやすさのバランスで選びます。",
      },
      {
        title: "RETAIL / PRIVATE LABEL",
        body: "小売・自社ブランド向け。中身、価格帯、商品設計、継続供給まで含めてご相談いただけます。",
      },
    ],
    originsKicker: "MULTIPLE ORIGINS",
    originsTitle: "産地を限定せず、条件に合うものを。",
    originsBody:
      "宇治、八女、嬉野、鹿児島、宮崎など、各地の茶を比較しながら、時期、用途、ご予算、必要量に合わせてご提案します。",
    tradeKicker: "BUSINESS SUPPORT",
    tradeTitle: "商品選びから、輸出の相談まで。",
    tradeLead:
      "最初から細かな条件が決まっていなくても大丈夫です。用途と取引条件を伺いながら、現実的な進め方を一緒に整理します。",
    tradeItems: [
      {
        title: "取扱商品",
        body: "抹茶・碾茶・ほうじ茶を中心に、用途に合わせて候補をご提案します。",
      },
      {
        title: "数量・サンプル",
        body: "商品によっては、サンプルや小ロットから確認できます。継続供給を前提としたご相談にも対応します。",
      },
      {
        title: "価格・条件",
        body: "商品、数量、納品国などを確認したうえで個別にご案内します。ご希望の価格帯があれば、候補選定の参考にします。",
      },
      {
        title: "輸出・発送",
        body: "納品国に合わせて、梱包、輸送方法、必要書類や輸入側の確認事項を案件ごとに整理します。",
      },
    ],
    tradeNote:
      "取扱可否、サンプル、数量、書類などの条件は、商品・時期・納品国によって異なります。まずは分かる範囲でご相談ください。",
    flowKicker: "HOW WHOLESALE WORKS",
    flowTitle: "ご相談からお取引まで。",
    steps: [
      {
        no: "01",
        title: "用途・条件を伺う",
        body: "納品国、用途、月間使用量、ご予算など、分かる範囲でお知らせください。",
      },
      {
        no: "02",
        title: "候補をご提案",
        body: "用途と条件に合わせて、産地やグレードを比較しながら候補を絞ります。",
      },
      {
        no: "03",
        title: "サンプルで確認",
        body: "対応可能な商品は、サンプルや小ロットからお試しいただけます。",
      },
      {
        no: "04",
        title: "輸出・継続供給",
        body: "梱包、数量、納期、輸入時の必要事項を確認し、継続取引へつなげます。",
      },
    ],
    faqKicker: "FAQ",
    faqTitle: "卸売・輸出について、よくあるご質問",
    faqs: [
      {
        question: "小ロットからでも相談できますか？",
        answer:
          "はい。商品によって条件は異なりますが、小ロットやサンプルから試せるものもあります。まずは希望数量をお知らせください。",
      },
      {
        question: "抹茶のグレードや品種が分からなくても大丈夫ですか？",
        answer:
          "問題ありません。ラテ、薄茶、菓子、物販などの用途と、味・色・ご予算を伺いながら候補を絞ります。",
      },
      {
        question: "海外への発送・輸出も相談できますか？",
        answer:
          "はい。納品国、商品、数量を確認したうえで、梱包や輸送方法、輸入側で必要になる事項を確認しながら進めます。",
      },
      {
        question: "サンプルはありますか？",
        answer:
          "対応可能な商品は、サンプルまたは小ロットでの確認をご案内します。商品や時期によって対応内容は異なります。",
      },
      {
        question: "最初の問い合わせでは何を伝えればいいですか？",
        answer:
          "会社・ブランド名、納品国、用途、月間のおおよその使用量、ご希望の価格帯が分かるとスムーズです。未定の項目があっても構いません。",
      },
    ],
    inquiryKicker: "START A CONVERSATION",
    inquiryTitle: "お探しの用途を、まずはお聞かせください。",
    inquiryBody:
      "品種名やグレードが分からなくても問題ありません。用途と条件を伺いながら、候補を整理してご提案します。",
    inquiryFields: [
      "会社・ブランド名",
      "納品国",
      "用途",
      "月間のおおよその使用量",
      "ご希望の価格帯（あれば）",
    ],
    inquiryCta: "卸売について問い合わせる",
  },
  en: {
    heroKicker: "SHOJUEN · WHOLESALE / EXPORT",
    heroTitle: "Japanese matcha & tea for your business.",
    heroLead:
      "Matcha, tencha and hojicha for cafes, brands, importers and distributors. We do not start with a grade name. We start with your use, flavor, color, volume and target price.",
    heroCta: "Start a wholesale inquiry",
    journalCta: "See our field notes",
    heroNote: "From small test orders to ongoing wholesale supply.",
    trustLabels: ["MATCHA", "TENCHA", "HOJICHA", "SMALL LOT", "EXPORT"],
    originKicker: "WHOLESALE APPROACH",
    originTitle: "Choose tea by the job it needs to do.",
    originBody:
      "SHOJUEN is not a wholesale page for promoting one farm or one origin. We visit, taste and compare, then propose options around your use, flavor, color, volume and target price. The photography is here to show the background behind that work.",
    originPhotoCaption: "Tea fields in Japan",
    fieldPhotoCaption: "Field notes from tea country",
    processKicker: "FROM FIELD TO PRODUCT",
    processTitle: "The photos are context. Your product is the focus.",
    processLead:
      "We look across cultivation, processing and powder production to understand color, aroma, flavor and handling. The goal is not to feature one producer, but to find tea that fits a cafe, brand, importer or distributor.",
    processPoints: [
      "Define the right traits for latte, usucha, bakery or resale",
      "Compare flavor and color together with price and required volume",
      "Narrow options with destination and continuity of supply in mind",
    ],
    processPhotoCaption: "Tea fields and production in Japan",
    fieldKicker: "HOW WE SELECT",
    fieldTitle: "We look beyond the specification sheet.",
    fieldLead:
      "What we see at origin matters, but so does what happens in the cup. We compare color, aroma and taste, then translate those differences into practical choices for wholesale buyers.",
    fieldNotes: [
      "Compare aroma and finish, not only powder color",
      "For cafe use, check how the tea behaves with milk and recipes",
      "Consider price, volume and continuity before proposing an option",
    ],
    useKicker: "PRODUCT RANGE",
    useTitle: "Tea selected around the product you are making.",
    useLead:
      "Latte, straight tea, food production, ingredient use and retail each call for different qualities. We narrow the range around your application, volume and price target.",
    uses: [
      {
        title: "MATCHA / LATTE",
        body: "Selected for color and aroma that still show through milk, with a practical balance of quality and cost for daily cafe use.",
      },
      {
        title: "MATCHA / STRAIGHT",
        body: "For usucha and straight serves, with more emphasis on umami, aroma, texture and finish.",
      },
      {
        title: "MATCHA / FOOD",
        body: "For bakery, confectionery and food production, considering color after processing, aroma retention and recipe cost.",
      },
      {
        title: "TENCHA",
        body: "For ingredient sourcing and product development. We compare origin and character against your intended use and required volume.",
      },
      {
        title: "HOJICHA",
        body: "For lattes, drinks, bakery and food applications, balancing roast aroma, color, price and ease of use.",
      },
      {
        title: "RETAIL / PRIVATE LABEL",
        body: "For retail and own-brand products, including product positioning, contents, price range and continuity of supply.",
      },
    ],
    originsKicker: "MULTIPLE ORIGINS",
    originsTitle: "One origin is not the only answer.",
    originsBody:
      "Uji, Yame, Ureshino, Kagoshima, Miyazaki and more. We compare by season, use, budget and required volume.",
    tradeKicker: "BUSINESS SUPPORT",
    tradeTitle: "From tea selection to export planning.",
    tradeLead:
      "You do not need every detail fixed before contacting us. We can work through the product, volume, price range and destination together and define a practical next step.",
    tradeItems: [
      {
        title: "Products",
        body: "Matcha, tencha and hojicha are the core range. We shortlist options around how the tea will actually be used.",
      },
      {
        title: "Volume & samples",
        body: "Where available, samples or small test lots can be discussed before moving to ongoing supply.",
      },
      {
        title: "Pricing & terms",
        body: "Pricing is discussed case by case based on the product, volume and destination. A target price helps us narrow the options.",
      },
      {
        title: "Export & shipping",
        body: "We work through packing, shipping method, documentation and importer-side requirements according to the destination.",
      },
    ],
    tradeNote:
      "Availability, samples, quantities and document requirements vary by product, timing and destination. Share what you know and we will confirm the rest case by case.",
    flowKicker: "HOW WHOLESALE WORKS",
    flowTitle: "Keep the first conversation simple.",
    steps: [
      { no: "01", title: "Tell us the use", body: "Country, use, monthly volume and target price — whatever you know." },
      { no: "02", title: "We shortlist", body: "We compare origins and options against the job." },
      { no: "03", title: "Test", body: "Where available, begin with samples or a small lot." },
      { no: "04", title: "Export & supply", body: "We align packing, quantity, timing and importer requirements." },
    ],
    faqKicker: "FAQ",
    faqTitle: "Common wholesale & export questions",
    faqs: [
      {
        question: "Can I start with a small order?",
        answer:
          "Yes, depending on the product. Some teas can be tested with samples or a small lot first. Tell us the volume you have in mind and we can suggest practical options.",
      },
      {
        question: "Do I need to know the matcha grade or cultivar?",
        answer:
          "No. Tell us how you plan to use the tea, along with your flavor, color and budget preferences. We can narrow the options from there.",
      },
      {
        question: "Can you discuss international shipping and export?",
        answer:
          "Yes. We confirm the destination, product and volume first, then work through packing, shipping and importer-side requirements for that market.",
      },
      {
        question: "Are samples available?",
        answer:
          "Where available, we can discuss samples or a small test lot. Availability depends on the product and timing.",
      },
      {
        question: "What should I include in my first inquiry?",
        answer:
          "Company or brand name, destination country, intended use, approximate monthly volume and target price are helpful. It is fine if some details are still undecided.",
      },
    ],
    inquiryKicker: "START A CONVERSATION",
    inquiryTitle: "Tell us the cup you want to make.",
    inquiryBody:
      "You do not need to know the cultivar or grade in advance. We can narrow the options with you.",
    inquiryFields: ["Company / brand", "Destination country", "Use", "Approx. monthly volume", "Target price, if any"],
    inquiryCta: "Email wholesale inquiry",
  },
  zh: {
    heroKicker: "SHOJUEN · 批發 / 出口",
    heroTitle: "從產地出發，找到適合您商品的日本茶。",
    heroLead:
      "我們提供抹茶、碾茶與焙茶的批發與出口洽詢，服務咖啡館、品牌商、進口商與經銷商。不是先套用固定等級，而是依用途、風味、色澤、採購量與預算，一起篩選合適的選項。",
    heroCta: "洽詢批發與出口",
    journalCta: "查看產地紀錄",
    heroNote: "可從小量測試開始，也歡迎洽談長期穩定供應。",
    trustLabels: ["MATCHA", "TENCHA", "HOJICHA", "SMALL LOT", "EXPORT"],
    originKicker: "WHOLESALE APPROACH",
    originTitle: "依用途，挑選真正合適的茶。",
    originBody:
      "松壽園不侷限於單一茶園或產地。我們會實際了解產地與製茶現場，並透過品飲比較，依用途、風味、色澤、採購量、預算與供貨條件，提供適合的選擇。",
    originPhotoCaption: "日本茶產地",
    fieldPhotoCaption: "產地紀錄",
    processKicker: "FROM FIELD TO PRODUCT",
    processTitle: "從茶園到製茶，了解影響品質的每個環節。",
    processLead:
      "除了成品本身，我們也重視栽培與製程。透過了解茶葉如何被種植、加工與研磨，判斷色澤、香氣、風味與實際使用時的表現，再選出符合需求的茶。",
    processPoints: [
      "依拿鐵、薄茶、烘焙、零售等用途整理需求",
      "同時比較風味、色澤、價格與採購量",
      "將出口目的地與穩定供貨條件一併納入考量",
    ],
    processPhotoCaption: "日本茶園與製茶風景",
    fieldKicker: "HOW WE SELECT",
    fieldTitle: "實際沖泡與品飲，確認是否適合您的用途。",
    fieldLead:
      "我們不只看粉末顏色和規格，也會實際沖泡、品飲，確認香氣、口感與尾韻。若是咖啡館用途，也會一併考量搭配牛奶或配方後的表現。",
    fieldNotes: [
      "不只看外觀，也確認沖泡後的香氣與風味",
      "咖啡館用途會確認與牛奶、配方的搭配表現",
      "提案時同時考量價格、採購量與供貨穩定性",
    ],
    useKicker: "PRODUCT RANGE",
    useTitle: "依用途，選擇真正需要的茶。",
    useLead:
      "拿鐵、薄茶、烘焙、原料與零售商品，各自需要不同的條件。我們會依實際用途、採購量與預算，協助縮小合適的商品範圍。",
    uses: [
      {
        title: "MATCHA / LATTE",
        body: "重視加入牛奶後仍能呈現色澤與香氣，同時兼顧咖啡館日常使用所需的成本平衡。",
      },
      {
        title: "MATCHA / STRAIGHT",
        body: "適合薄茶或直接品飲，著重鮮味、香氣、口感與尾韻。",
      },
      {
        title: "MATCHA / FOOD",
        body: "適合烘焙、甜點與食品加工，考量加熱後的色澤、香氣保留與配方成本。",
      },
      {
        title: "TENCHA",
        body: "適合原料採購與商品開發，可依用途與需求量，比較不同產地與風味特色。",
      },
      {
        title: "HOJICHA",
        body: "適合拿鐵、飲品、烘焙與食品用途，依焙香、色澤、價格與操作性進行選擇。",
      },
      {
        title: "RETAIL / PRIVATE LABEL",
        body: "適合零售與自有品牌，可一併討論商品內容、價格帶、產品定位與穩定供貨。",
      },
    ],
    originsKicker: "MULTIPLE ORIGINS",
    originsTitle: "不綁定單一產地，依條件選擇。",
    originsBody:
      "宇治、八女、嬉野、鹿兒島、宮崎等地皆可納入比較，並依季節、用途、預算與需求量提供建議。",
    tradeKicker: "BUSINESS SUPPORT",
    tradeTitle: "從選茶到出口，都可以一起討論。",
    tradeLead:
      "第一次洽詢時，不需要把所有條件都準備完整。我們會依用途、採購量、預算與出貨目的地，一起整理適合的方式。",
    tradeItems: [
      {
        title: "商品",
        body: "以抹茶、碾茶與焙茶為主，依實際用途協助篩選合適的選項。",
      },
      {
        title: "數量與樣品",
        body: "部分商品可先從樣品或小量測試開始，也可進一步討論長期穩定供貨。",
      },
      {
        title: "價格與條件",
        body: "會依商品、數量與出貨目的地個別確認。若有目標價格，也可作為篩選商品的參考。",
      },
      {
        title: "出口與運送",
        body: "依目的地確認包裝、運送方式、所需文件，以及進口端需要準備的事項。",
      },
    ],
    tradeNote:
      "商品供應、樣品、數量與文件需求會依商品、時期及出貨目的地而不同。提供目前已知的資訊即可，我們會逐項確認。",
    flowKicker: "HOW WHOLESALE WORKS",
    flowTitle: "從洽詢到長期供應。",
    steps: [
      {
        no: "01",
        title: "提供用途與條件",
        body: "告訴我們出貨國家、用途、每月用量與預算，提供目前已知的資訊即可。",
      },
      {
        no: "02",
        title: "提出合適選項",
        body: "依用途與條件，比較不同產地與等級，協助縮小範圍。",
      },
      {
        no: "03",
        title: "先以樣品確認",
        body: "可提供的商品，可先從樣品或小量測試開始。",
      },
      {
        no: "04",
        title: "出口與持續供貨",
        body: "確認包裝、數量、交期與進口端所需資訊後，銜接後續供貨。",
      },
    ],
    faqKicker: "FAQ",
    faqTitle: "批發與出口常見問題",
    faqs: [
      {
        question: "可以從小量開始洽談嗎？",
        answer:
          "可以，實際條件依商品而定。部分商品可先從樣品或小量測試開始，請先告訴我們您預計的採購量。",
      },
      {
        question: "不清楚抹茶等級或品種，也可以詢問嗎？",
        answer:
          "可以。只要告訴我們用途，例如拿鐵、薄茶、烘焙或零售，以及對風味、色澤與預算的需求，我們會協助縮小選擇範圍。",
      },
      {
        question: "可以洽談海外出貨與出口嗎？",
        answer:
          "可以。我們會先確認出貨目的地、商品與數量，再依實際需求確認包裝、運送方式，以及進口端需要準備的事項。",
      },
      {
        question: "可以提供樣品嗎？",
        answer:
          "可提供的商品，可洽詢樣品或小量測試。實際方式會依商品與時期而有所不同。",
      },
      {
        question: "第一次詢問需要提供哪些資訊？",
        answer:
          "公司或品牌名稱、出貨目的地、用途、預估每月用量與預算會很有幫助。若有尚未決定的項目，也可以先洽詢。",
      },
    ],
    inquiryKicker: "START A CONVERSATION",
    inquiryTitle: "先告訴我們，您想做什麼樣的產品。",
    inquiryBody:
      "不需要先知道品種或等級。我們會依用途與條件，協助整理並提出適合的選項。",
    inquiryFields: [
      "公司 / 品牌名稱",
      "出貨目的地",
      "用途",
      "預估每月用量",
      "預算或目標價格（如有）",
    ],
    inquiryCta: "洽詢批發與出口",
  },

}

function PhotoCaption({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}

export function WholesalePageClient() {
  const { locale, hrefForLocale } = useLanguage()
  const t = copy[locale]
  const email = getContactEmail()
  const contactHref = hrefForLocale("/contact?from=wholesale")

  return (
    <div className="bg-background">
      <section className="relative min-h-[76vh] overflow-hidden border-b border-border/70 bg-stone-950">
        <Image
          src={otsuka.hero}
          alt={t.originPhotoCaption}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/70 to-emerald-950/25"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-stone-950/25"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[76vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-24">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.42em] text-emerald-100/90">
              {t.heroKicker}
            </p>
            <h1 className="mt-5 max-w-4xl font-heading text-4xl font-medium leading-[1.08] tracking-wide text-white sm:text-6xl lg:text-7xl">
              {t.heroTitle}
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-relaxed text-stone-200 sm:text-lg">
              {t.heroLead}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={contactHref}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full px-7 no-underline"
                )}
              >
                {t.heroCta}
              </Link>
              <Link
                href={hrefForLocale("/journal")}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full border-white/35 bg-white/10 px-7 text-white no-underline backdrop-blur-sm hover:bg-white/20"
                )}
              >
                {t.journalCta}
              </Link>
            </div>
            <p className="mt-5 text-sm text-stone-300">{t.heroNote}</p>
          </FadeIn>

          <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/15 pt-5">
            {t.trustLabels.map((label) => (
              <span
                key={label}
                className="font-mono text-[0.68rem] tracking-[0.22em] text-stone-300"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              {t.originKicker}
            </p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <h2 className="font-heading text-3xl font-medium leading-tight tracking-wide text-foreground sm:text-5xl">
                {t.originTitle}
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t.originBody}
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <FadeIn>
              <div className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-muted">
                <Image
                  src={otsuka.hero}
                  alt={t.originPhotoCaption}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                />
              </div>
              <PhotoCaption>{t.originPhotoCaption}</PhotoCaption>
            </FadeIn>

            <FadeIn delay={0.08}>
              <div className="group relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-muted">
                <Image
                  src={ureshino.field}
                  alt={t.fieldPhotoCaption}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                />
              </div>
              <PhotoCaption>{t.fieldPhotoCaption}</PhotoCaption>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-stone-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <FadeIn>
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-emerald-200/85">
                {t.processKicker}
              </p>
              <h2 className="mt-5 font-heading text-3xl font-medium leading-tight tracking-wide sm:text-5xl">
                {t.processTitle}
              </h2>
              <p className="mt-6 text-base leading-relaxed text-stone-300">
                {t.processLead}
              </p>
              <div className="mt-8 space-y-4">
                {t.processPoints.map((point, i) => (
                  <div
                    key={point}
                    className="flex gap-4 border-t border-white/12 pt-4"
                  >
                    <span className="font-mono text-xs text-emerald-200/70">
                      0{i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-stone-200">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <div className="grid gap-4 sm:grid-cols-2">
              <FadeIn>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-stone-900">
                  <Image
                    src={otsuka.cultivation}
                    alt={t.processTitle}
                    fill
                    sizes="(min-width: 640px) 30vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </FadeIn>
              <FadeIn delay={0.08} className="sm:pt-12">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-stone-900">
                  <Image
                    src={otsuka.process}
                    alt={t.processTitle}
                    fill
                    sizes="(min-width: 640px) 30vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </FadeIn>
              <FadeIn className="sm:col-span-2">
                <div className="relative aspect-[16/7] overflow-hidden rounded-[2rem] bg-stone-900">
                  <Image
                    src={otsuka.grinding}
                    alt={t.processTitle}
                    fill
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-stone-400">
                  {t.processPhotoCaption}
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              {t.fieldKicker}
            </p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
              <h2 className="font-heading text-3xl font-medium leading-tight tracking-wide text-foreground sm:text-5xl">
                {t.fieldTitle}
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t.fieldLead}
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-4 lg:grid-cols-12">
            <FadeIn className="lg:col-span-7">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-muted">
                <Image
                  src={ureshino.rows}
                  alt={t.fieldPhotoCaption}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover"
                />
              </div>
            </FadeIn>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
              <FadeIn delay={0.06}>
                <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] bg-muted">
                  <Image
                    src={ureshino.powder}
                    alt={t.fieldTitle}
                    fill
                    sizes="(min-width: 1024px) 40vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] bg-muted">
                  <Image
                    src={ureshino.tasting}
                    alt={t.fieldTitle}
                    fill
                    sizes="(min-width: 1024px) 40vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </FadeIn>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {t.fieldNotes.map((note, i) => (
              <FadeIn key={note} delay={i * 0.05}>
                <div className="border-t border-border pt-4">
                  <span className="font-mono text-xs text-primary">0{i + 1}</span>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {note}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-muted/25">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              {t.useKicker}
            </p>
            <h2 className="mt-5 max-w-4xl font-heading text-3xl font-medium leading-tight tracking-wide text-foreground sm:text-5xl">
              {t.useTitle}
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.useLead}
            </p>
          </FadeIn>

          <div className="mt-12 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {t.uses.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.04}>
                <div className="border-t border-border pt-5">
                  <h3 className="font-heading text-2xl font-medium text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                  <Link
                    href={hrefForLocale(`/contact?from=wholesale&interest=${encodeURIComponent(item.title)}`)}
                    className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {t.inquiryCta}
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border/70">
        <div className="absolute inset-0">
          <Image
            src={ureshino.field}
            alt={t.fieldPhotoCaption}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-stone-950/78" aria-hidden />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-white sm:px-6 lg:py-28">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-emerald-200/85">
              {t.originsKicker}
            </p>
            <h2 className="mt-5 max-w-3xl font-heading text-3xl font-medium leading-tight tracking-wide sm:text-5xl">
              {t.originsTitle}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-stone-300 sm:text-lg">
              {t.originsBody}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              {["UJI", "YAME", "URESHINO", "KAGOSHIMA", "MIYAZAKI"].map(
                (origin) => (
                  <span
                    key={origin}
                    className="rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 font-mono text-xs tracking-[0.18em] text-stone-200"
                  >
                    {origin}
                  </span>
                )
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-b border-border/70 bg-stone-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-emerald-200/85">
              {t.tradeKicker}
            </p>
            <h2 className="mt-5 max-w-4xl font-heading text-3xl font-medium leading-tight tracking-wide sm:text-5xl">
              {t.tradeTitle}
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-stone-300 sm:text-lg">
              {t.tradeLead}
            </p>
          </FadeIn>

          <div className="mt-12 grid gap-x-8 gap-y-8 md:grid-cols-2">
            {t.tradeItems.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.04}>
                <div className="border-t border-white/15 pt-5">
                  <p className="font-mono text-xs tracking-[0.18em] text-emerald-200/70">
                    0{i + 1}
                  </p>
                  <h3 className="mt-4 font-heading text-2xl font-medium">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-300">
                    {item.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="mt-10" delay={0.08}>
            <p className="max-w-4xl border-t border-white/15 pt-5 text-xs leading-relaxed text-stone-400 sm:text-sm">
              {t.tradeNote}
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-b border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              {t.flowKicker}
            </p>
            <h2 className="mt-5 font-heading text-3xl font-medium tracking-wide text-foreground sm:text-5xl">
              {t.flowTitle}
            </h2>
          </FadeIn>

          <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-4">
            {t.steps.map((step, i) => (
              <FadeIn key={step.no} delay={i * 0.05}>
                <div className="border-t border-border pt-5">
                  <p className="font-mono text-xs tracking-[0.2em] text-primary">
                    {step.no}
                  </p>
                  <h3 className="mt-4 font-heading text-xl font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-muted/25">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:py-28">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              {t.faqKicker}
            </p>
            <h2 className="mt-5 font-heading text-3xl font-medium leading-tight tracking-wide text-foreground sm:text-5xl">
              {t.faqTitle}
            </h2>
          </FadeIn>

          <div className="mt-10 divide-y divide-border border-y border-border">
            {t.faqs.map((item, i) => (
              <FadeIn key={item.question} delay={i * 0.03}>
                <details className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left">
                    <span className="font-heading text-lg font-medium text-foreground sm:text-xl">
                      {item.question}
                    </span>
                    <span
                      className="mt-1 text-xl leading-none text-primary transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 max-w-3xl pr-10 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {item.answer}
                  </p>
                </details>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          <FadeIn>
            <div className="grid gap-10 rounded-[2.5rem] border border-border bg-primary/[0.045] p-7 sm:p-10 lg:grid-cols-[1fr_0.8fr] lg:p-12">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
                  {t.inquiryKicker}
                </p>
                <h2 className="mt-5 font-heading text-3xl font-medium leading-tight tracking-wide text-foreground sm:text-5xl">
                  {t.inquiryTitle}
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {t.inquiryBody}
                </p>
                <div className="mt-9">
                  <Link
                    href={contactHref}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "rounded-full px-8 no-underline"
                    )}
                  >
                    {t.inquiryCta}
                  </Link>
                </div>
                <p className="mt-4 font-mono text-xs text-muted-foreground">
                  {email}
                </p>
              </div>

              <div className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-9 lg:pt-0">
                <p className="text-sm font-medium text-foreground">
                  {locale === "ja"
                    ? "分かる範囲で教えてください"
                    : locale === "zh"
                      ? "提供目前已知的資訊即可"
                      : "Share what you know"}
                </p>
                <div className="mt-5 space-y-4">
                  {t.inquiryFields.map((field, i) => (
                    <div key={field} className="flex gap-3 text-sm">
                      <span className="font-mono text-xs text-primary">
                        0{i + 1}
                      </span>
                      <span className="text-muted-foreground">{field}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
