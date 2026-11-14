/**
 * Journal 記事の写真（任意）。slug ごとに hero と本文差し込み figures を持つ。
 *
 * 画像ファイルの置き場所: public/images/journal/<記事フォルダ>/
 * 例: public/images/journal/ureshino_20260620/01-tea-field-mist.png
 *
 * 注意: 人物が特定できる写真（顔出し）は、掲載許可を確認してから公開すること。
 */
export type JournalFigure = {
  src: string
  captionJa: string
  captionEn: string
  captionZh: string
  captionKo?: string
  afterParagraph?: number
  aspectRatio?: string
  /** 人物の顔が写る等、掲載に本人許可が必要な写真は true */
  needsPermission?: boolean
}

export type JournalArticleMedia = {
  hero?: JournalFigure
  figures?: JournalFigure[]
}

const ureshino = (name: string) =>
  `/images/journal/ureshino_20260620/${name}` as const

const takeoChawan = (name: string) =>
  `/images/journal/takeo_chawan_20260624/${name}` as const

export const journalArticleMedia: Record<string, JournalArticleMedia> = {
  "field-note-table-tea-20260705": {
  "hero": {
    "src": "/images/journal/table_tea_20260705/01-pouring.webp",
    "aspectRatio": "1567 / 1045",
    "captionJa": "ガラスの器へ。涼やかな一杯を分かち合う。",
    "captionEn": "Pouring a refreshing cup to share.",
    "captionKo": "시원한 한 잔을 함께 나누며.",
    "captionZh": "倒入玻璃杯中，分享清涼的一杯。"
  },
  "figures": [
    {
      "src": "/images/journal/table_tea_20260705/02-whisking.webp",
      "aspectRatio": "1045 / 1567",
      "captionJa": "テーブルを囲み、先生がお茶を点ててくださる時間。",
      "captionEn": "Our teacher prepares matcha as we gather around the table.",
      "captionKo": "테이블에 둘러앉아 선생님이 말차를 준비해 주시는 시간.",
      "captionZh": "圍坐桌旁，老師為我們點茶的時光。",
      "afterParagraph": 2
    },
    {
      "src": "/images/journal/table_tea_20260705/03-preparing.webp",
      "aspectRatio": "1045 / 1567",
      "captionJa": "一杯を準備する、先生の手元。",
      "captionEn": "Preparing a cup, one gesture at a time.",
      "captionKo": "한 잔을 준비하시는 선생님의 손길.",
      "captionZh": "老師準備一杯茶的雙手。",
      "afterParagraph": 4
    },
    {
      "src": "/images/journal/table_tea_20260705/04-cold-matcha.webp",
      "aspectRatio": "1045 / 1567",
      "captionJa": "また飲みたい、あの日の冷たい抹茶。",
      "captionEn": "The cold matcha we would love to enjoy again.",
      "captionKo": "다시 마시고 싶은, 그날의 차가운 말차.",
      "captionZh": "令人想再品嘗的，那天的冰抹茶。",
      "afterParagraph": 11
    }
  ]
},
  "field-note-ekimae-rivet-20261114": {
  "hero": {
    "src": "/images/journal/rivet_20261114/01-mikuriya.webp",
    "aspectRatio": "1108 / 1477",
    "captionJa": "宇治の石臼挽き抹茶と、駅前リベットの御厨健士朗さん。",
    "captionEn": "Kenshiro Mikuriya at Ekimae Rivet with our stone-milled Uji matcha.",
    "captionZh": "駅前リベット的御厨健士朗先生與宇治石臼研磨抹茶。",
    "captionKo": "우지 맷돌 말차를 든 에키마에 리벳의 미쿠리야 켄시로 씨."
  },
  "figures": [
    {
      "src": "/images/journal/rivet_20261114/02-entrance.webp",
    "aspectRatio": "1108 / 1477",
      "captionJa": "お茶とお酒を楽しめる、駅前リベットの入口。",
      "captionEn": "The entrance to Ekimae Rivet, a place for tea and drinks.",
      "captionZh": "可以品茶與小酌的駅前リベット入口。",
      "captionKo": "차와 술을 즐길 수 있는 에키마에 리벳의 입구.",
      "afterParagraph": 3
    },
    {
      "src": "/images/journal/rivet_20261114/03-award.webp",
    "aspectRatio": "1477 / 1108",
      "captionJa": "店内に飾られた、淹茶選手権2026・最優秀淹茶賞の賞状。",
      "captionEn": "The certificate for the top award at the Encha Championship 2026.",
      "captionZh": "店內展示的淹茶選手権2026「最優秀淹茶賞」獎狀。",
      "captionKo": "매장에 전시된 엔차 선수권 2026 최고상 상장.",
      "afterParagraph": 4
    },
    {
      "src": "/images/journal/rivet_20261114/04-logo.webp",
    "aspectRatio": "1477 / 1108",
      "captionJa": "街の日常にある、駅前リベット。",
      "captionEn": "Ekimae Rivet, part of everyday life in the neighborhood.",
      "captionZh": "融入街坊日常的駅前リベット。",
      "captionKo": "동네의 일상 속에 자리한 에키마에 리벳.",
      "afterParagraph": 7
    }
  ]
},
  "field-note-takeo-chawan-kiln": {
    hero: {
      src: takeoChawan("01-hero-four-bowls.png"),
      captionJa:
        "作業台に並べられた器。左から花器二点、右から抹茶椀二碗。同じ工房から、日用の茶碗と花のための一輪が生まれる。",
      captionEn:
        "Pieces on the workbench: two flower vases on the left, two matcha bowls on the right — daily tea ware and vessels for a single bloom, from the same workshop.",
      captionZh:
        "工作台上排列的器物。左為兩件花器，右為兩只抹茶碗。同一工房，既出日常茶碗，也出一輪之花器。",
    },
    figures: [
      {
        src: takeoChawan("02-pottery-wheel.png"),
        captionJa: "ろくろの前。削りと成形の工程が、茶碗の口当たりまで決める。",
        captionEn:
          "At the wheel — trimming and shaping decide how the bowl meets the lips.",
        captionZh: "拉坯機前。修坯與成形的工序，決定茶碗的口沿觸感。",
      },
      {
        src: takeoChawan("03-glaze-buckets.png"),
        captionJa: "釉薬の桶が並ぶ釉掛け場。色は配合と焼成の記憶に預ける。",
        captionEn:
          "Glaze buckets in the glazing area — color entrusted to recipe and firing memory.",
        captionZh: "排列釉料桶的上釉區。色彩託付於配方與燒成的經驗。",
      },
      {
        src: takeoChawan("04-drying-shelves.png"),
        captionJa: "天日干しの棚に並んだ素焼きの碗。乾燥のペースも仕上がりの一部。",
        captionEn:
          "Bisque bowls on open-air drying shelves — the pace of drying is part of the finish.",
        captionZh: "露天晾乾架上排列的素燒碗。乾燥節奏也是成品的一部分。",
      },
      {
        src: takeoChawan("05-brick-kiln.png"),
        captionJa: "レンガ造りの窯。有田の窯元に残る、昔ながらの焼成スタイル。",
        captionEn:
          "A brick-built kiln — the traditional firing style still kept at this Arita workshop.",
        captionZh: "磚砌窯爐。有田窯元仍保留的傳統燒成方式。",
      },
      {
        src: takeoChawan("06-finished-bowls-crate.png"),
        captionJa:
          "仕上がりの茶碗が詰められたコンテナ。新聞紙に包まれ、日常の席へ向かう——量産ではなく流通。",
        captionEn:
          "Finished bowls packed in a crate, wrapped in newspaper — bound for everyday tables, circulation rather than mass output.",
        captionZh:
          "裝入容器中的完成茶碗，以報紙包裹——流向日常餐桌，是流通而非單純量產。",
      },
      {
        src: takeoChawan("07-workshop-working.png"),
        captionJa: "工房の奥で手を動かす作り手。碗の重心と口縁は、この段階で決まる。",
        captionEn:
          "A maker's hands deep in the workshop — a bowl's balance and rim are settled at this stage.",
        captionZh: "工房深處動手的製作者。茶碗的重心與口沿在此階段定案。",
        needsPermission: true,
      },
      {
        src: takeoChawan("08-workshop-scene-a.png"),
        captionJa: "工房の一角。道具と半製品が、仕事のリズムをそのまま残している。",
        captionEn:
          "A corner of the workshop — tools and half-finished pieces holding the day's rhythm.",
        captionZh: "工房一隅。工具與半成品，留存著工作的節奏。",
      },
      {
        src: takeoChawan("09-workshop-scene-b.png"),
        captionJa:
          "釉掛け前後の碗と道具。一つの作業台に、窯元の一日が凝縮されている。",
        captionEn:
          "Bowls and tools before and after glazing — a whole day's work condensed on one bench.",
        captionZh: "上釉前後的茶碗與工具。一張工作台，濃縮窯元的一日。",
      },
    ],
  },
  "field-note-ureshino-kamairi-2026": {
    hero: {
      src: ureshino("01-tea-field-mist.png"),
      captionJa: "霧がかかった嬉野の山あいの茶畑。",
      captionEn: "A misty tea garden in the hills of Ureshino.",
      captionZh: "霧氣繚繞的嬉野山間茶園。",
    },
    figures: [
      {
        src: ureshino("03-tea-garden-rows.png"),
        captionJa: "落ち葉を敷いた畦。手入れの跡が見える。",
        captionEn: "Rows mulched with fallen leaves — signs of careful tending.",
        captionZh: "鋪上落葉的茶畦，看得見細心照料的痕跡。",
      },
      {
        src: ureshino("02-tea-bushes.png"),
        captionJa: "二十日間遮光したやぶきた。雨に濡れた新芽。",
        captionEn: "Yabukita shaded for twenty days; new buds after the rain.",
        captionZh: "遮光二十天的藪北品種，雨後的新芽。",
      },
      {
        src: ureshino("05-matcha-powder-dish.png"),
        captionJa: "碾茶の質感。",
        captionEn: "The texture of tencha.",
        captionZh: "碾茶的質感。",
      },
      {
        src: ureshino("06-matcha-powder-bowl.png"),
        captionJa: "今年の釜炒り抹茶。鮮やかな緑。",
        captionEn: "This year's kamairi matcha — a vivid green.",
        captionZh: "今年的釜炒抹茶，鮮豔的綠。",
      },
      {
        src: ureshino("04-matcha-bowl-whisk.png"),
        captionJa:
          "八女の玉露仕立ての抹茶との飲み比べ。泡は立てず、水色と味わいで比べる。",
        captionEn:
          "A side-by-side tasting against a Yame gyokuro-style matcha — poured, not whisked, and compared on liquor color and taste.",
        captionZh:
          "與八女玉露製成的抹茶進行品飲比較。不打泡，以湯色與風味相比。",
      },
    ],
  },
}

/** 記事カード・OG 用。hero 画像があればそのパスを返す。 */
export function getArticleCoverImage(slug: string): string | undefined {
  return journalArticleMedia[slug]?.hero?.src
}
