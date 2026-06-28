import type { Locale } from "@/i18n/types"

export type MatchaEncyclopediaCh0Messages = {
  kicker: string
  h1Html: string
  lead: string
  leadEmHtml: string
  tabATitle: string
  tabASub: string
  tabBTitle: string
  tabBSub: string
  tabCTitle: string
  tabCSub: string
  usesLabel: string
  traitsLabel: string
  panelARoute: string
  aTags: [string, string, string, string]
  aTraits: [string, string]
  panelBRoute: string
  bTags: [string, string, string, string]
  bTraits: [string, string]
  panelCRoute: string
  cTags: [string, string, string, string]
  cTraits: [string, string]
  acc1Title: string
  acc1Intro: string
  chipLeaf: string
  chipDry: string
  chipGrind: string
  chipPowder: string
  laneTencha: string
  laneSencha: string
  laneKamairi: string
  laneAS1: string
  laneAS2: string
  laneAS3: string
  laneBS1: string
  laneBS2: string
  laneBS3: string
  laneCS1: string
  laneCS2: string
  acc1NoteHtml: string
  resultPre: string
  resultMain: string
  acc2Title: string
  acc2Intro: string
  grind1Name: string
  grind1DescHtml: string
  grind2Name: string
  grind2DescHtml: string
  grind3Name: string
  grind3DescHtml: string
  acc3Title: string
  stepShade: string
  stepShadeBodyHtml: string
  stepKill: string
  stepKillBodyHtml: string
  stepRoll: string
  stepRollBodyHtml: string
  stepGrind: string
  stepGrindBody: string
  acc4Title: string
  acc4Intro: string
  combo1Title: string
  combo1L1: string
  combo1L2: string
  combo1Result: string
  combo2Title: string
  combo2L1: string
  combo2L2: string
  combo2Result: string
  combo3Title: string
  combo3L1: string
  combo3L2: string
  combo3Result: string
  acc4Note: string
}

const ja: MatchaEncyclopediaCh0Messages = {
  kicker: "抹茶図鑑 · 第0章",
  h1Html: "ラベルは同じ「抹茶」でも、<br>製法で中身が違う。",
  lead: "市場の粉末は、読み解くための大枠として A / B / C の3タイプに分けられます。",
  leadEmHtml:
    "ただしそれは「地図」にすぎません。茶園・製茶所は遮光・殺青・揉捻・粉砕などを<strong>自由に組み合わせ</strong>、独自の製法で味を出しています。そのレシピが、味わいと向く用途を決めます。",
  tabATitle: "碾茶ルート",
  tabASub: "遮光 → 蒸す → 揉まない",
  tabBTitle: "煎茶ルート",
  tabBSub: "遮光少〜なし → 蒸す → 揉む",
  tabCTitle: "釜炒りルート",
  tabCSub: "遮光あり得る → 釜炒り",
  usesLabel: "向く用途",
  traitsLabel: "特徴",
  panelARoute: "生葉 → 遮光 → 蒸す → 碾茶 → 粉砕 → 抹茶パウダー",
  aTags: ["抹茶ラテ", "点て・薄茶", "こだわり菓子", "量産菓子の着色"],
  aTraits: [
    "旨味・鮮やかな緑 — 「抹茶らしさ」に近い",
    "工程に手間。加熱菓子では繊細さが埋もれがち",
  ],
  panelBRoute: "生葉 → 遮光少〜なし → 蒸す → 煎茶 → 粉砕（多くはボールミル）",
  bTags: ["焼菓子・パン", "アイス混ぜ", "量産スイーツ", "看板ラテ"],
  bTraits: [
    "業務用に多い。加熱・砂糖と相性良い",
    "渋み・黄緑色。ラベルは「抹茶」でも原材料「緑茶」のみ",
  ],
  panelCRoute: "生葉 → 遮光あり／なし → 釜炒り → 粉砕 → 抹茶パウダー",
  cTags: ["香ばしいラテ", "日常ドリンク", "香り活かす菓子", "映える緑ラテ"],
  cTraits: [
    "釜香 — 蒸しとは別カテゴリの風味",
    "遮光・摘採・炒り加減の組み合わせで、産地ごとに個性が出やすい",
  ],
  acc1Title: "茶葉が粉になるまで — 分岐の全体像",
  acc1Intro:
    "入口は3レーン。すべて合流して粉砕し、ラベルは同じ「抹茶パウダー」になります。",
  chipLeaf: "生葉",
  chipDry: "乾燥",
  chipGrind: "粉砕",
  chipPowder: "粉末",
  laneTencha: "碾茶",
  laneSencha: "煎茶",
  laneKamairi: "釜炒り",
  laneAS1: "遮光あり",
  laneAS2: "↓ 蒸す",
  laneAS3: "↓ 揉まない",
  laneBS1: "遮光なし多い",
  laneBS2: "↓ 蒸す",
  laneBS3: "↓ 揉む",
  laneCS1: "遮光あり／なし",
  laneCS2: "↓ 釜炒り",
  acc1NoteHtml:
    "図は大枠だけ。各農園・製茶所は工程を<strong>自由に組み合わせ</strong>る。遮光は<strong>する／しない</strong>で方向が変わる（期間は茶園に合わせて決める）。釜炒りでも遮光して旨味を足す等、タイプだけでは中身は決まらない。",
  resultPre: "すべての組み合わせの行き先",
  resultMain: "できあがり：抹茶パウダー",
  acc2Title: "粉砕 — もう一段、味わいが変わる",
  acc2Intro:
    "A/B/C どの原料でも、最後は乾燥茶葉を粉にする。方式で口当たりと風味の立ち方が変わります。",
  grind1Name: "ボールミル",
  grind1DescHtml: "業務用主流<br>量産・加工向き",
  grind2Name: "機械石臼",
  grind2DescHtml: "量と口当たりの<br>バランス",
  grind3Name: "石臼（手挽き）",
  grind3DescHtml: "低速・低温<br>本格・点て向き",
  acc3Title: "工程ごと — 選ぶと何が変わるか",
  stepShade: "遮光",
  stepShadeBodyHtml:
    "<strong>する</strong> — 旨味・鮮やかな緑。<strong>しない</strong> — 渋みが出やすい。",
  stepKill: "殺青",
  stepKillBodyHtml:
    "<strong>蒸す</strong> — タイプA/Bへ。<strong>釜炒り</strong> — タイプC。",
  stepRoll: "揉捻",
  stepRollBodyHtml:
    "<strong>揉まない</strong> → 碾茶（A）。<strong>揉む</strong> → 煎茶（B）。",
  stepGrind: "粉砕",
  stepGrindBody: "3方式。農園・製茶所の選び方次第で個性が決まる。",
  acc4Title: "中身は組み合わせで決まる — 3つの例",
  acc4Intro:
    "タイプ（A/B/C）ひとつでは味わいも用途も決まりません。農園が選んだレシピを見てください。",
  combo1Title: "加工・量産向き",
  combo1L1: "B 煎茶粉末",
  combo1L2: "遮光なし · 2番茶 · ボールミル",
  combo1Result: "→ 加熱菓子・パン生地",
  combo2Title: "香ばしさ・日常使い",
  combo2L1: "C 釜炒り",
  combo2L2: "遮光あり · 1〜2番 · ボールミル or 機械石臼",
  combo2Result: "→ 香ばしいラテ",
  combo3Title: "本格・こだわり",
  combo3L1: "A or C",
  combo3L2: "遮光あり · 1番 · 石臼",
  combo3Result: "→ 看板ラテ・点て",
  acc4Note:
    "選ぶときは原材料名だけでなく「碾茶か煎茶か釜炒りか」「遮光したか」「何番茶か」「どう粉にしたか」を見る。",
}

const en: MatchaEncyclopediaCh0Messages = {
  kicker: "Matcha Encyclopedia · Chapter 0",
  h1Html: 'Same label "matcha" —<br>different process, different product.',
  lead: "Market powders are grouped into three broad types — A, B, and C — as a map to read the market.",
  leadEmHtml:
    "That map is only a starting point. Each farm and tea maker <strong>freely combines</strong> shading, fixation, rolling, and grinding to build their own process. That recipe — not the letter alone — defines flavor and best use.",
  tabATitle: "Tencha route",
  tabASub: "Shade → steam → no rolling",
  tabBTitle: "Sencha route",
  tabBSub: "Little/no shade → steam → roll",
  tabCTitle: "Pan-fired route",
  tabCSub: "Shade optional → pan-fire",
  usesLabel: "Best for",
  traitsLabel: "Character",
  panelARoute: "Leaf → shade → steam → tencha → grind → matcha powder",
  aTags: ["Matcha latte", "Whisked tea", "Premium sweets", "Mass-produced coloring"],
  aTraits: [
    'Umami, vivid green — closest to "real matcha"',
    "Labor-intensive; nuance lost in baked goods",
  ],
  panelBRoute: "Leaf → little/no shade → steam → sencha → grind (often ball mill)",
  bTags: ["Baked goods · bread", "Ice cream mix", "Volume sweets", "Signature latte"],
  bTraits: [
    "Common in food service; works with heat and sugar",
    'More astringency, yellow-green; label says matcha, ingredient often green tea only',
  ],
  panelCRoute: "Leaf → shade yes/no → pan-fire → grind → matcha powder",
  cTags: ["Toasty latte", "Everyday drinks", "Aroma-forward sweets", "Vivid green latte"],
  cTraits: [
    'Roasted "kama" aroma — a category apart from steamed tea',
    "Shade, harvest, and firing vary by origin — easy to express individuality",
  ],
  acc1Title: "From leaf to powder — the fork",
  acc1Intro:
    "Three lanes at the start. All merge, are ground, and share the same label: matcha powder.",
  chipLeaf: "Leaf",
  chipDry: "Dry",
  chipGrind: "Grind",
  chipPowder: "Powder",
  laneTencha: "Tencha",
  laneSencha: "Sencha",
  laneKamairi: "Pan-fired",
  laneAS1: "Shaded",
  laneAS2: "↓ Steam",
  laneAS3: "↓ No rolling",
  laneBS1: "Often unshaded",
  laneBS2: "↓ Steam",
  laneBS3: "↓ Roll",
  laneCS1: "Shade yes/no",
  laneCS2: "↓ Pan-fire",
  acc1NoteHtml:
    "The diagram is a framework only. Each farm and maker <strong>combines steps freely</strong>. Shading changes direction (<strong>yes/no</strong>; duration is chosen for the garden). Pan-fired tea can still be shaded — type alone does not define the product.",
  resultPre: "Where every path ends",
  resultMain: "Finished: matcha powder",
  acc2Title: "Grinding — another layer of difference",
  acc2Intro:
    "Every A/B/C leaf is ground last. Method changes mouthfeel and how flavor comes through.",
  grind1Name: "Ball mill",
  grind1DescHtml: "Industry standard<br>volume · processing",
  grind2Name: "Mechanical stone mill",
  grind2DescHtml: "Balance of<br>volume & texture",
  grind3Name: "Hand stone mill",
  grind3DescHtml: "Slow · cool<br>whisking grade",
  acc3Title: "Step by step — what each choice changes",
  stepShade: "Shading",
  stepShadeBodyHtml:
    "<strong>Yes</strong> — umami, vivid green. <strong>No</strong> — more astringency.",
  stepKill: "Kill-green",
  stepKillBodyHtml:
    "<strong>Steam</strong> — routes A/B. <strong>Pan-fire</strong> — route C.",
  stepRoll: "Rolling",
  stepRollBodyHtml:
    "<strong>No roll</strong> → tencha (A). <strong>Roll</strong> → sencha (B).",
  stepGrind: "Grinding",
  stepGrindBody: "Three methods. The farm's choices define the character.",
  acc4Title: "Content is in the combination — three examples",
  acc4Intro: "Type A/B/C alone does not fix flavor or use. Look at the farm's recipe.",
  combo1Title: "Processing · volume",
  combo1L1: "B sencha powder",
  combo1L2: "No shade · 2nd flush · ball mill",
  combo1Result: "→ Baked goods · bread dough",
  combo2Title: "Toasty · everyday",
  combo2L1: "C pan-fired",
  combo2L2: "Shaded · 1st–2nd flush · ball or mechanical stone",
  combo2Result: "→ Toasty latte",
  combo3Title: "Premium · craft",
  combo3L1: "A or C",
  combo3L2: "Shaded · 1st flush · stone mill",
  combo3Result: "→ Signature latte · whisked tea",
  acc4Note:
    "Check: tencha, sencha, or pan-fired? Shaded? Which flush? How ground?",
}

const zh: MatchaEncyclopediaCh0Messages = {
  kicker: "抹茶圖鑑 · 第0章",
  h1Html: "標籤都是「抹茶」，<br>製法不同，內容就不同。",
  lead: "市場上的粉末，可先分成 A / B / C 三種大類，作為閱讀市場的地圖。",
  leadEmHtml:
    "但這只是<strong>地圖</strong>。茶園與製茶所會<strong>自由組合</strong>覆下、殺青、揉捻、粉碎等工序，形成各自的製法。真正決定風味與用途的，是這套組合，而不是 A/B/C 字母本身。",
  tabATitle: "碾茶路線",
  tabASub: "覆下 → 蒸製 → 不揉",
  tabBTitle: "煎茶路線",
  tabBSub: "少〜無覆下 → 蒸製 → 揉捻",
  tabCTitle: "釜炒路線",
  tabCSub: "可有覆下 → 釜炒",
  usesLabel: "適合用途",
  traitsLabel: "特色",
  panelARoute: "生葉 → 覆下 → 蒸製 → 碾茶 → 粉碎 → 抹茶粉末",
  aTags: ["抹茶拿鐵", "點茶・薄茶", "講究甜點", "量產著色"],
  aTraits: ["鮮味・鮮綠 — 最接近「抹茶感」", "工序費工；烘焙中細緻風味易埋没"],
  panelBRoute: "生葉 → 少〜無覆下 → 蒸製 → 煎茶 → 粉碎（多為球磨）",
  bTags: ["烘焙・麵包", "冰淇淋調和", "量產甜點", "招牌拿鐵"],
  bTraits: ["業務用常見；與加熱・砂糖相容", "澀味・黃綠色；標籤寫抹茶，原料常僅標綠茶"],
  panelCRoute: "生葉 → 覆下／無 → 釜炒 → 粉碎 → 抹茶粉末",
  cTags: ["焙香拿鐵", "日常飲品", "強調香氣的點心", "視覺綠拿鐵"],
  cTraits: ["釜香 — 與蒸製茶不同類的風味", "覆下・採摘・炒製火候的組合，產地個性易展現"],
  acc1Title: "從茶葉到粉末 — 分岐總覽",
  acc1Intro: "入口三條路，最後合流粉碎，標籤皆為「抹茶粉末」。",
  chipLeaf: "生葉",
  chipDry: "乾燥",
  chipGrind: "粉碎",
  chipPowder: "粉末",
  laneTencha: "碾茶",
  laneSencha: "煎茶",
  laneKamairi: "釜炒",
  laneAS1: "有覆下",
  laneAS2: "↓ 蒸製",
  laneAS3: "↓ 不揉",
  laneBS1: "多無覆下",
  laneBS2: "↓ 蒸製",
  laneBS3: "↓ 揉捻",
  laneCS1: "覆下／無",
  laneCS2: "↓ 釜炒",
  acc1NoteHtml:
    "圖示僅為大框架。各茶園・製茶所<strong>自由組合</strong>工序。覆下以<strong>有／無</strong>改變方向（天數依茶園而定）。釜炒也可覆下 — 不能只看類型字母。",
  resultPre: "所有組合的終點",
  resultMain: "完成：抹茶粉末",
  acc2Title: "粉碎 — 風味再分一層",
  acc2Intro: "A/B/C 無論哪種原料，最後都要粉碎。方式影響口感與風味。",
  grind1Name: "球磨",
  grind1DescHtml: "業務主流<br>量產・加工",
  grind2Name: "機械石臼",
  grind2DescHtml: "產量與<br>口感平衡",
  grind3Name: "石臼（手挽）",
  grind3DescHtml: "低速・低溫<br>本格・點茶",
  acc3Title: "各工序 — 選擇帶來的差異",
  stepShade: "覆下",
  stepShadeBodyHtml:
    "<strong>有</strong> — 鮮味・鮮綠。<strong>無</strong> — 澀味較明顯。",
  stepKill: "殺青",
  stepKillBodyHtml:
    "<strong>蒸製</strong> — 走向 A/B。<strong>釜炒</strong> — 走向 C。",
  stepRoll: "揉捻",
  stepRollBodyHtml:
    "<strong>不揉</strong> → 碾茶（A）。<strong>揉</strong> → 煎茶（B）。",
  stepGrind: "粉碎",
  stepGrindBody: "三種方式。依茶園選擇決定個性。",
  acc4Title: "內容由組合決定 — 三例",
  acc4Intro: "僅看 A/B/C 無法決定風味與用途。請看茶園的配方。",
  combo1Title: "加工・量產",
  combo1L1: "B 煎茶粉末",
  combo1L2: "無覆下 · 二番 · 球磨",
  combo1Result: "→ 烘焙・麵包",
  combo2Title: "焙香・日常",
  combo2L1: "C 釜炒",
  combo2L2: "有覆下 · 一〜二番 · 球磨或機械石臼",
  combo2Result: "→ 焙香拿鐵",
  combo3Title: "本格・講究",
  combo3L1: "A 或 C",
  combo3L2: "有覆下 · 一番 · 石臼",
  combo3Result: "→ 招牌拿鐵・點茶",
  acc4Note: "選購時看：碾茶／煎茶／釜炒？是否覆下？第幾番？如何粉碎？",
}

export const matchaEncyclopediaCh0ByLocale: Record<
  Locale,
  MatchaEncyclopediaCh0Messages
> = { ja, en, zh }
