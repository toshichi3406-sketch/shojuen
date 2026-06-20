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
  /** 人物の顔が写る等、掲載に本人許可が必要な写真は true */
  needsPermission?: boolean
}

export type JournalArticleMedia = {
  hero?: JournalFigure
  figures?: JournalFigure[]
}

const ureshino = (name: string) =>
  `/images/journal/ureshino_20260620/${name}` as const

export const journalArticleMedia: Record<string, JournalArticleMedia> = {
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
