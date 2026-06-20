import type { Locale } from "@/i18n/types"

/**
 * JOURNAL 記事の本文。slug → locale → 段落配列。
 * en/zh が無い記事は ja にフォールバックする。
 */
export const journalArticleBodies: Record<
  string,
  Partial<Record<Locale, string[]>>
> = {
  "field-note-ureshino-kamairi-2026": {
    ja: [
      "2026年6月、佐賀・嬉野の茶畑を訪ねました。松壽園が大切にしているのは、袋に詰めて送ることだけではありません。出会った人のこだわりを取材し、そのまま言葉と写真で届けること——今日は、その第一歩として釜炒り抹茶の現場を歩きました。",
      "蒸し製法の抹茶が主流のいま、釜で炒って仕上げる抹茶は、日本茶の中でもごく一部です。嬉野市内でも釜炒り抹茶をつくっているのは三件だけ——全国的にも希少なラインだと、三代目茶師から聞きました。",
      "市の試験場が二か所、この茶師のやり方を参考に釜炒りを試しているそうです。ただ、そちらは色味を出すために火力を弱めるぶん、ぼけやあくが抜けきらないとのこと。一方この工房では、常に釜に張り付いて火力と水分量に挑み続けることで、その辺りも克服している——四十三年以上、水分と火力のバランスを研究してきた職人だからこそ辿り着ける、オリジナルの味があると聞きました。",
      "釜炒り抹茶の難所は「水分」です。釜で炒りながら葉の水分を出し、鉄板の上でさらに炒ってかき混ぜる。吸い取りすぎれば苦くなり、吸い取らなければ煮えて味がぼやける。完成まで七年から八年かかったという話を以前から伺っていましたが、今日は乾燥の現場がよりはっきり見えました。",
      "乾燥工程でも味は変わる——そこで職人の目が常に張り付いている、と。茎の乾燥具合を目安にしているそうです。八女には自動乾燥の設備もあるが、ここではすべて自分の目で見ている、と聞きました。機械に任せず、葉の状態を逐次判断する。それが四十年の積み重ねだと感じました。",
      "栽培は、やぶきたを二十日間遮光。有機肥料には菜種油かすと牡蠣殻。茶園には遮光ネットがかかり、落ち葉を敷いた畦が続いていました。霧の山あい——嬉野らしい風景の中で、今年の収穫とお茶の出来について長く話を聞きました。",
      "そして今年の釜炒りは——過去三十年で一番の出来だ、と現地でそう聞きました。碗に点てた色、粉の鮮やかさ、すっきりとした後味。記録に収めた一杯は、その言葉を体感するためのものです。",
      "嬉野の釜炒りは、薄茶の席で「最高級の蒸し抹茶」と競う茶ではありません。毎日のラテに、料理に。重めの牛乳でも胃もたれしにくい、使うための抹茶——それが松壽園がこのラインを扱う理由です。取扱商品：雪風・霞音・若露・松壽もが など。卸・ご質問は Contact へ。",
    ],
    en: [
      "In June 2026 we visited a tea garden in Ureshino, Saga. What Shojuen values is not only packing matcha into a bag and shipping it. We document the intent of the people we meet, and deliver it as it is — in words and photographs. Today, as a first step, we walked the ground where pan-fired (kamairi) matcha is made.",
      "With steamed matcha now the norm, matcha finished by pan-firing is a tiny niche even within Japanese tea. Even in Ureshino, only three makers still produce kamairi matcha — a rare line nationwide, the third-generation master told us.",
      "Two municipal research stations are said to be trying pan-firing based on this master's methods. There, though, lowering the heat to bring out color means dullness and harshness never quite clear. Here, by contrast, by staying glued to the pan and constantly working the balance of heat and moisture, he overcomes exactly that — an original flavor, we were told, that only a craftsman who has studied the balance of moisture and fire for over forty-three years can reach.",
      "The hardest part of kamairi matcha is moisture. You draw moisture from the leaf while firing it in the pan, then fire and stir it further on an iron plate. Draw out too much and it turns bitter; too little and it stews and goes vague. We had heard before that it took seven or eight years to perfect — and today the drying floor came into far clearer view.",
      "Flavor changes during drying, too — and so the craftsman's eye stays fixed on it, using the dryness of the stems as a guide. There are automated drying lines in Yame, he said, but here everything is judged by his own eyes. Not leaving it to machines, but reading the leaf moment by moment: that, we felt, is what forty years builds.",
      "For cultivation: Yabukita, shaded for twenty days; organic inputs of rapeseed oil cake and oyster shell. Shading nets stretched over the garden, and rows mulched with fallen leaves ran on. In the misty hills — a landscape so like Ureshino — we listened at length about this year's harvest and the tea.",
      "And this year's kamairi — the best in thirty years, we were told on the spot. The color in the bowl, the vividness of the powder, the clean finish. The cup we recorded is a way to feel those words for yourself.",
      "Ureshino's kamairi is not a tea that competes as \"top-grade steamed matcha\" in the thin-tea seat. For everyday lattes and for cooking — a matcha made to be used, that sits lightly even with richer milk. That is why Shojuen carries this line. Products: Yukikaze, Kanon, Jakuro, Matsuju Moga, and more. For wholesale or questions, see Contact.",
    ],
    zh: [
      "2026年6月，我們造訪了佐賀・嬉野的茶園。松壽園所重視的，不只是把抹茶裝袋寄出。我們採訪所遇之人的講究，並原原本本地以文字與照片傳遞——今天，便是以釜炒抹茶的現場作為第一步。",
      "在蒸菁抹茶成為主流的今天，以釜炒方式完成的抹茶，即使在日本茶中也屬極少數。三代目茶師告訴我們，光是嬉野市內仍在製作釜炒抹茶的也只有三家——在全國也是相當稀有的一條產線。",
      "據說市內有兩處試驗場，參考這位茶師的做法嘗試釜炒。但那邊為了帶出色澤而調弱火力，澀味與雜味始終無法完全去除。相對地，這裡靠著時時守在釜前、不斷挑戰火力與水分的拿捏，正好克服了這一點——他說，這種原創的風味，唯有四十三年以上持續鑽研水分與火候平衡的職人才能達到。",
      "釜炒抹茶最困難之處在於「水分」。一邊在釜中翻炒、逼出葉片的水分，再於鐵板上進一步翻炒攪拌。抽得太多會發苦，抽得不夠則會悶熟、風味變得模糊。過去就聽說要花七、八年才得以完成，而今天，乾燥的現場更清楚地呈現在眼前。",
      "乾燥工序同樣會改變風味——因此職人的目光始終緊盯著它，並以茶莖的乾燥程度為判斷依據。他說，八女雖有自動乾燥的設備，但這裡全憑自己的眼睛判斷。不交給機器，而是逐一判讀葉片的狀態——我們感受到，那正是四十年累積而成的功夫。",
      "栽培方面，藪北遮光二十天；有機肥料使用菜籽油粕與牡蠣殼。茶園鋪著遮光網，鋪上落葉的茶畦延伸而去。在霧氣繚繞的山間——這片極具嬉野風情的風景中，我們長談了今年的收成與茶的成果。",
      "而今年的釜炒——在現場聽到的是「三十年來最好的一年」。點在碗中的色澤、茶粉的鮮豔、清爽的餘味。我們記錄下的這一碗，正是為了讓人親身體會那句話。",
      "嬉野的釜炒，並不是要在薄茶席上與「頂級蒸菁抹茶」一較高下的茶。它適合每天的拿鐵、入菜使用；即使搭配較濃的牛奶也不易膩——這就是松壽園經手這條產線的理由。商品：雪風・霞音・若露・松壽もが 等。批發與洽詢請見 Contact。",
    ],
  },
  "uji-tencha-shade-structure": {
    ja: [
      "宇治南山城では、覆下の「何日目にどの遮光率をかけるか」が、テアニンとフラボノイドのバランスを決める。一斉に真っ暗にするのではなく、最初の数日は透過光を残して青味を抜き、その後に重ね幕で光量子束密度を落とす——この段階設計が、碾茶の香気の芯に直結する。",
      "現場のログでは、南側の斜面ほど午前の直射が強く、同じ遮光幕でも葉温のピークが高い。北東向きの圃場では、葉の厚みが均一になり、蒸し工程での通熱ムラが少ない傾向が観察された。",
    ],
    en: [
      "In Uji's Minami-Yamashiro, deciding 'on which day to apply which shade ratio' under cover determines the balance of theanine and flavonoids. Rather than going fully dark all at once, the first few days leave some transmitted light to draw out greenness, and only afterward do layered screens cut the photon flux density — this staged design connects directly to the aromatic core of tencha.",
      "Field logs show that the more a slope faces south, the stronger the morning direct sun, so the leaf-temperature peak runs higher even under the same shade cloth. In northeast-facing gardens, leaf thickness tends to be more uniform, and we observed less uneven heat penetration during the steaming step.",
    ],
    zh: [
      "在宇治南山城，覆下「第幾天施加多少遮光率」決定了茶胺酸與類黃酮的平衡。不是一口氣全部遮黑，而是最初幾天保留透光以抽出青味，其後再以疊幕降低光量子通量密度——這種分階段的設計，直接關係到碾茶香氣的核心。",
      "現場紀錄顯示，越是朝南的斜坡，上午的直射越強，即使使用同樣的遮光幕，葉溫的峰值也較高。在朝東北的茶園中，葉片厚度較為均勻，蒸菁工序中的透熱不均也較少。",
    ],
  },
  "nishio-gokou-nitrogen": {
    ja: [
      "ごこうは、窒素同化の賜物とも言われる品種だが、覆下後の蒸しで「芯まで通す」熱の入り方が、花芯様の香気を引き出す鍵になる。西尾の平地では、朝露と昼間の乾燥のリズムが葉の含水率を均一化し、蒸し後の乾燥で香気の揮発が抑えられやすい。",
      "試飲では、同じごこうでも、蒸しが長時間のロットは香気が閉じ、短時間高温のロットはトップノートが立ちすぎる。碾茶の粒子径と合わせて評価しないと、銘柄の個性は見えない。",
    ],
    en: [
      "Gokou is sometimes called a gift of nitrogen assimilation, but the way heat enters during post-shading steaming — reaching all the way to the core — is the key to drawing out its flower-pistil-like aroma. On Nishio's flatlands, the rhythm of morning dew and midday drying evens out the leaf's moisture content, making it easier to suppress aroma loss during post-steaming drying.",
      "In tasting, even within the same Gokou, lots steamed for a long time have a closed aroma, while short, high-heat lots push the top notes too far forward. Without evaluating them alongside the tencha particle size, a label's individuality won't come into view.",
    ],
    zh: [
      "Gokou被稱為氮素同化的恩賜品種，但覆下後蒸菁時「透至葉芯」的入熱方式，才是引出花蕊般香氣的關鍵。在西尾的平地，晨露與白晝乾燥的節奏使葉片含水率趨於均勻，蒸菁後乾燥時也較易抑制香氣的揮發散失。",
      "在試飲中，即使同為Gokou，長時間蒸菁的批次香氣會收斂，而短時間高溫的批次則前調過於突出。若不連同碾茶的粒徑一併評估，便看不出該品項的個性。",
    ],
  },
  "ishiusu-rpm-and-particle": {
    ja: [
      "石臼の回転数を上げると、微粉率は上がるが、摩擦熱で揮発成分が失われる。茶師が聴く「唸り」は、臼歯と茶の噛み合いの音であり、粒度分布の歪みを耳で補正しているとも言える。",
      "レーザー回折式の粒度計で見ると、理想的な薄茶用は、数ミクロン以下のピークと、十数ミクロンのサブピークが共存する分布が多い。一方で、ラテ向けは意図的にサブピークを抑え、舌触りのクリーミーさを優先する。",
    ],
    en: [
      "Raising the stone mill's rotation increases the fine-powder ratio, but friction heat loses volatile compounds. The 'growl' a master listens for is the sound of the mill's teeth meshing with the leaf — you could say they correct distortions in the particle distribution by ear.",
      "Under a laser-diffraction particle sizer, an ideal usucha grade often shows a distribution where a peak below a few microns coexists with a sub-peak in the low tens of microns. For lattes, by contrast, the sub-peak is intentionally suppressed to prioritize a creamy mouthfeel.",
    ],
    zh: [
      "提高石臼轉速雖能提升微粉比例，但摩擦熱會使揮發成分散失。茶師所聆聽的『低鳴』，是臼齒與茶葉咬合的聲音；可以說，他們是以耳朵修正粒徑分布的偏差。",
      "以雷射繞射式粒徑儀觀察，理想的薄茶用抹茶多呈現數微米以下的主峰與十幾微米的次峰並存的分布。相對地，拿鐵用則刻意抑制次峰，以口感的滑順綿密為優先。",
    ],
  },
  "koicha-usucha-foam-kinin": {
    ja: [
      "濃茶は茶筅で「解す」ことに近く、泡の立ちは不要とされる。粘度が高いため、茶筅の動きは碗底を這わせるようにし、かき混ぜすぎると澱が出る。",
      "薄茶では茶筅の本数と硬さが、きめの細かさに直結する。湯が硬いと泡が粗く、軟水では細かいが持続が短い——水質は茶室でも再現性の変数として記録に値する。",
    ],
    en: [
      "Koicha is closer to 'loosening' with the chasen, and foam is considered unnecessary. Because viscosity is high, the chasen is moved as if grazing the bottom of the bowl; stir too much and sediment appears.",
      "In usucha, the chasen's prong count and stiffness directly govern how fine the texture is. Hard water makes coarse foam; soft water makes it fine but short-lived — water quality deserves recording as a variable for reproducibility, even in the tea room.",
    ],
    zh: [
      "濃茶較接近以茶筅「化開」，並不需要打出泡沫。由於黏度高，茶筅的動作要如貼著碗底般滑動，攪拌過度便會產生沉渣。",
      "在薄茶中，茶筅的穗數與軟硬，直接決定泡沫的細緻程度。水質偏硬則泡沫粗，軟水則細緻但持續較短——即使在茶室中，水質也值得作為再現性的變數加以記錄。",
    ],
  },
  "chakai-ichigo-ichie-modern": {
    ja: [
      "一期一会は、同じ茶会は二度と来ないという時間の倫理の言葉だが、現代の茶会では「客人が初めての緊張を解く」ための視覚的設計も問われる。古帛紗の上に、現代作家のガラス茶碗を置くことの是非は、流派の承認を超えて、客がどこに視線を置けるかの問題でもある。",
      "濃緑の抹茶と、透明な碗の縁のコントラストは、スマートフォンに映える以前に、客の呼吸を浅くする効果がある。ただし、器の冷たさが抹茶の温度を奪う場合もあり、季節と湯の温度の設計が不可欠だ。",
    ],
    en: [
      "Ichigo ichie is a phrase about the ethics of time — that the same gathering will never come again — but a modern tea gathering also calls for visual design that 'eases a first-time guest's tension.' Whether to set a contemporary artist's glass chawan atop a kobukusa is, beyond a school's approval, also a question of where the guest can rest their gaze.",
      "The contrast between deep-green matcha and the rim of a transparent bowl — well before it photographs well on a smartphone — can make a guest catch their breath. That said, a vessel's coldness can sometimes rob the matcha of its warmth, so designing around season and water temperature is essential.",
    ],
    zh: [
      "「一期一會」是關於時間倫理的話語——同樣的茶會永不再來；但在現代茶會中，也需要為「化解客人初次的緊張」而做的視覺設計。是否在古帛紗上擺放當代作家的玻璃茶碗，超越了流派的認可，也是客人視線能落於何處的問題。",
      "濃綠的抹茶與透明茶碗邊緣的對比，早在它適合用智慧型手機拍照之前，便有令客人屏息的效果。不過，器物的冰涼有時會奪走抹茶的溫度，因此針對季節與水溫的設計不可或缺。",
    ],
  },
}
