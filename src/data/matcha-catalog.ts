/**
 * THE MATCHA — 抹茶（碾茶製品）スペック。テイスティングノート形式。
 */
export type MatchaEntry = {
  id: string
  nameJa: string
  nameEn: string
  origin: string
  cultivar: string
  milling: string
  color: string
  aroma: string
  palate: string
  finish: string
}

export const matchaCatalog: MatchaEntry[] = [
  {
    id: "uji-samidori",
    nameJa: "宇治 さみどり 石臼挽き",
    nameEn: "Uji Samidori · stone-milled",
    origin: "京都府宇治市 · 南山城の覆下圃場",
    cultivar: "さみどり（覆下後に強い青みと旨味のバランス）",
    milling: "花崗岩臼 · 時速 30〜40 回転帯、低温長時間",
    color: "濃緑に黄味が少ない。遮光良好の年はより深いビリジアン",
    aroma: "若葉、海苔、わずかに花の蜜のような甘み",
    palate: "テアニンの丸みと、カテキンの線のある渋みが層になる",
    finish: "喉越しのあとに海苔香が短く残る",
  },
  {
    id: "nishio-gokou",
    nameJa: "西尾 ごこう 特選",
    nameEn: "Nishio Gokō",
    origin: "愛知県西尾市 · 平地型茶園、機械覆下",
    cultivar: "ごこう（花芯香・上品な甘香の傾向）",
    milling: "石臼複数台ローテーション、粒度の均一化に注力",
    color: "鮮やかな緑に、わずかに黄緑のハイライト",
    aroma: "花芯、白桃の皮、蒸した青大豆",
    palate: "口当たり柔らかく、旨味が先に立ち渋みは後追い",
    finish: "甘みが長く、渋みは角がない",
  },
  {
    id: "yame-saemidori-latte",
    nameJa: "八女 さえみどり（ラテ向けブレンド）",
    nameEn: "Yame Saemidori · latte blend",
    origin: "福岡県八女市",
    cultivar: "さえみどり主体、旨味の太さを活かす配合",
    milling: "気流式と石臼のハイブリッド。微粉率を抑えクリーミーに",
    color: "牛乳と混ざると抹茶ラテ色——深緑が白を染めるグラデーション",
    aroma: "焙煎ナッツ、ミルクと合わせるとカスタード様の甘香",
    palate: "固形分が厚く、ミルクの脂肪と乳化しやすい",
    finish: "飲み干した後に煎茶香がふわりと戻る",
  },
  {
    id: "shizuoka-yabukita-ceremonial",
    nameJa: "静岡 やぶきた 表千家御好み挽き",
    nameEn: "Shizuoka Yabukita · ceremonial",
    origin: "静岡県中部 · 冷涼な春気候",
    cultivar: "やぶきた（バランス型。薄茶向きの設定が多い）",
    milling: "茶臼挽き、粒度はやや粗めで泡立ちを重視",
    color: "明るい黄緑がかった濃緑。薄茶の碗面で金緑に見える",
    aroma: "青みが強く、海苔、春の新芽",
    palate: "渋みの立ちが早いが、湯の温度管理で丸みを帯びる",
    finish: "きめの細かい泡と一体になった触感が長く続く",
  },
]
