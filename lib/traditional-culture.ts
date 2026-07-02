import { Solar } from "lunar-javascript"

export const cultureDisclaimer =
  "本工具基于传统历法、民俗文化与文字寓意生成内容，结果仅供传统文化研究、娱乐参考与灵感启发使用，不构成现实决策建议。请勿将本工具结果作为医疗、法律、投资、婚恋、升学、就业等重大事项的唯一依据。"

const unsafeAlmanacTerms = new Set(["开光", "法事", "求医", "治病", "安葬", "破土"])
const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
const elementNames = ["木", "火", "土", "金", "水"] as const
const stemElements: Record<string, (typeof elementNames)[number]> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
}
const branchElements: Record<string, (typeof elementNames)[number]> = {
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
}
const hiddenStems: Record<string, string[]> = {
  子: ["癸"],
  丑: ["己", "癸", "辛"],
  寅: ["甲", "丙", "戊"],
  卯: ["乙"],
  辰: ["戊", "乙", "癸"],
  巳: ["丙", "戊", "庚"],
  午: ["丁", "己"],
  未: ["己", "丁", "乙"],
  申: ["庚", "壬", "戊"],
  酉: ["辛"],
  戌: ["戊", "辛", "丁"],
  亥: ["壬", "甲"],
}

function hashSeed(input: string) {
  let hash = 2166136261
  for (const char of input) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function createRandom(seedText: string) {
  let seed = hashSeed(seedText) || 1
  return () => {
    seed = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    seed ^= seed + Math.imul(seed ^ (seed >>> 7), 61 | seed)
    return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(items: T[], random: () => number) {
  return items[Math.floor(random() * items.length) % items.length]
}

function pickMany<T>(items: T[], count: number, random: () => number) {
  return [...items]
    .map((item) => ({ item, score: random() }))
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .map(({ item }) => item)
}

function cleanAlmanacTerms(items: string[]) {
  return items.filter((item) => !unsafeAlmanacTerms.has(item)).slice(0, 8)
}

function parseDateParts(dateText: string) {
  const [year, month, day] = dateText.split("-").map(Number)
  if (!year || !month || !day) {
    throw new Error("日期格式不正确")
  }
  return { year, month, day }
}

function getLunarInfo(dateText: string) {
  const { year, month, day } = parseDateParts(dateText)
  const lunar = Solar.fromYmd(year, month, day).getLunar()
  return { lunar, lunarDate: lunar.toString() }
}

function splitPillar(pillar: string) {
  return { stem: pillar.slice(0, 1), branch: pillar.slice(1, 2) }
}

const fortuneTexts = [
  { position: "上上签", text: "云开见月，心定事明。今日宜把复杂之事拆成小步，稳中见进。" },
  { position: "上吉签", text: "春风入户，旧事可理。适合修补关系、整理计划，也适合给自己留一点余裕。" },
  { position: "中吉签", text: "清泉过石，缓缓成声。今日不必急于求成，持续推进比一时冲刺更有力量。" },
  { position: "小吉签", text: "竹影扶窗，静处有光。适合观察、学习、复盘，在细节里找到新的方向。" },
  { position: "平签", text: "风平水缓，守常亦安。少做情绪化决定，把眼前的小事做好即可。" },
]

const fortuneKeywords = ["沉着", "修整", "沟通", "专注", "留白", "自省", "守信", "更新", "节制", "耐心"]
const colors = ["青色", "白色", "米杏色", "松绿色", "靛蓝色", "朱砂红", "浅金色", "月灰色"]

export function generateDailyFortune(dateText?: string) {
  const today = dateText ?? new Date().toISOString().slice(0, 10)
  const random = createRandom(`daily-fortune:${today}`)
  const { lunar, lunarDate } = getLunarInfo(today)
  const fortune = pick(fortuneTexts, random)
  const yi = cleanAlmanacTerms(lunar.getDayYi())
  const ji = cleanAlmanacTerms(lunar.getDayJi())
  const keyword = pick(fortuneKeywords, random)

  return {
    date: today,
    lunarDate,
    ganZhi: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日`,
    signText: fortune.text,
    signPosition: fortune.position,
    keyword,
    goodFor: yi.length ? yi : ["整理", "学习", "沟通"],
    avoid: ji.length ? ji : ["急躁", "过度消耗", "冲动决定"],
    careerTip: pick(
      [
        "把重要任务排在精力最稳定的时段，少开新坑，多做收尾。",
        "适合复盘流程与沟通细节，先确认边界再推进协作。",
        "今日更适合打基础，耐心处理那些容易被忽略的小问题。",
      ],
      random,
    ),
    relationshipTip: pick(
      [
        "表达时多留一点余地，认真听完对方的真实意思。",
        "适合温和交流，不宜把一时情绪放大成结论。",
        "把关心落到具体行动上，比反复解释更有效。",
      ],
      random,
    ),
    wealthTip: pick(
      [
        "适合整理账目和消费计划，避免为情绪买单。",
        "今日重在稳妥管理，不把娱乐参考当作投资依据。",
        "留意小额支出，给必要事项预留缓冲空间。",
      ],
      random,
    ),
    healthTip: pick(
      [
        "规律作息、少熬夜，给眼睛和肩颈留出休息时间。",
        "适合轻运动和清淡饮食，避免把日程排得太满。",
        "多喝水，保持通风，晚间减少高强度信息摄入。",
      ],
      random,
    ),
    luckyColor: pick(colors, random),
    luckyNumber: Math.floor(random() * 9) + 1,
    disclaimer: cultureDisclaimer,
  }
}

export type NameRequest = {
  surname: string
  gender: "男" | "女" | "不透露"
  birthDate?: string
  birthTime?: string
  nameLength: "单字" | "双字"
  style: "古风" | "大气" | "温柔" | "诗意" | "现代" | "寓意好"
  useFiveElements: boolean
  avoidChars?: string
  generationChar?: string
}

type NameSuggestion = {
  name: string
  givenName: string
  pinyin: string
  meaning: string
  elements: string
  implication: string
  tags: string[]
  reason: string
}

const charBank = [
  { char: "安", pinyin: "an", element: "土", meaning: "安宁、安定", tags: ["温柔", "寓意好", "现代"] },
  { char: "宁", pinyin: "ning", element: "火", meaning: "宁静、平和", tags: ["温柔", "诗意"] },
  { char: "清", pinyin: "qing", element: "水", meaning: "清澈、清正", tags: ["古风", "诗意"] },
  { char: "言", pinyin: "yan", element: "木", meaning: "表达、守信", tags: ["现代", "诗意"] },
  { char: "知", pinyin: "zhi", element: "火", meaning: "知礼、明理", tags: ["寓意好", "现代"] },
  { char: "和", pinyin: "he", element: "水", meaning: "和顺、和美", tags: ["温柔", "寓意好"] },
  { char: "景", pinyin: "jing", element: "木", meaning: "景明、前景", tags: ["大气", "古风"] },
  { char: "辰", pinyin: "chen", element: "土", meaning: "星辰、时序", tags: ["大气", "诗意"] },
  { char: "泽", pinyin: "ze", element: "水", meaning: "润泽、包容", tags: ["大气", "寓意好"] },
  { char: "行", pinyin: "xing", element: "水", meaning: "行动、笃行", tags: ["现代", "大气"] },
  { char: "予", pinyin: "yu", element: "土", meaning: "给予、从容", tags: ["温柔", "现代"] },
  { char: "书", pinyin: "shu", element: "金", meaning: "书卷、学养", tags: ["古风", "诗意"] },
  { char: "若", pinyin: "ruo", element: "木", meaning: "如初、柔和", tags: ["古风", "温柔"] },
  { char: "晏", pinyin: "yan", element: "火", meaning: "安然、晴朗", tags: ["古风", "温柔"] },
  { char: "嘉", pinyin: "jia", element: "木", meaning: "美好、赞许", tags: ["寓意好", "大气"] },
  { char: "明", pinyin: "ming", element: "火", meaning: "明朗、通达", tags: ["现代", "大气"] },
  { char: "珩", pinyin: "heng", element: "水", meaning: "玉饰、端正", tags: ["古风", "大气"] },
  { char: "怀", pinyin: "huai", element: "水", meaning: "胸怀、念想", tags: ["诗意", "大气"] },
  { char: "沐", pinyin: "mu", element: "水", meaning: "润泽、清新", tags: ["诗意", "现代"] },
  { char: "宸", pinyin: "chen", element: "金", meaning: "屋宇、深远", tags: ["大气", "古风"] },
  { char: "然", pinyin: "ran", element: "金", meaning: "自然、坦然", tags: ["现代", "寓意好"] },
  { char: "禾", pinyin: "he", element: "木", meaning: "禾苗、生机", tags: ["温柔", "诗意"] },
  { char: "舟", pinyin: "zhou", element: "金", meaning: "行舟、远行", tags: ["诗意", "现代"] },
  { char: "棠", pinyin: "tang", element: "木", meaning: "海棠、明艳", tags: ["古风", "诗意"] },
  { char: "栩", pinyin: "xu", element: "木", meaning: "生动、有灵气", tags: ["现代", "寓意好"] },
  { char: "瑾", pinyin: "jin", element: "火", meaning: "美玉、温润", tags: ["古风", "寓意好"] },
  { char: "昀", pinyin: "yun", element: "火", meaning: "日光、温暖", tags: ["现代", "温柔"] },
  { char: "砚", pinyin: "yan", element: "土", meaning: "文房、沉静", tags: ["古风", "诗意"] },
]

function inferPreferredElements(birthDate?: string) {
  if (!birthDate) return ["木", "水", "火", "土", "金"]
  const { lunar } = getLunarInfo(birthDate)
  const text = `${lunar.getYearInGanZhi()}${lunar.getMonthInGanZhi()}${lunar.getDayInGanZhi()}`
  const elementOrder = ["木", "火", "土", "金", "水"]
  return [...elementOrder].sort((a, b) => (text.includes(a) ? 1 : 0) - (text.includes(b) ? 1 : 0))
}

export function generateNameSuggestions(input: NameRequest) {
  const surname = input.surname.trim().slice(0, 2)
  if (!surname) throw new Error("请填写姓氏")
  const avoid = new Set((input.avoidChars ?? "").replace(/\s/g, "").split(""))
  const generationChar = (input.generationChar ?? "").trim().slice(0, 1)
  if (generationChar) avoid.delete(generationChar)
  const preferredElements = input.useFiveElements ? inferPreferredElements(input.birthDate) : []
  const random = createRandom(
    `name:${surname}:${input.gender}:${input.nameLength}:${input.style}:${generationChar}:${input.avoidChars ?? ""}:${input.useFiveElements ? input.birthDate ?? "" : ""}`,
  )

  const candidates = charBank
    .filter((item) => !avoid.has(item.char))
    .map((item) => ({
      item,
      score:
        (item.tags.includes(input.style) ? 4 : 0) +
        (preferredElements.includes(item.element) ? 2 : 0) +
        random(),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)

  const suggestions: NameSuggestion[] = []
  for (let index = 0; suggestions.length < 20 && index < candidates.length * candidates.length; index += 1) {
    const first = generationChar
      ? charBank.find((item) => item.char === generationChar) ?? {
          char: generationChar,
          pinyin: generationChar,
          element: "参考",
          meaning: "指定辈分字",
          tags: [input.style],
        }
      : candidates[index % candidates.length]
    const second = input.nameLength === "双字" ? candidates[(index * 7 + 3) % candidates.length] : undefined
    const chars = input.nameLength === "双字" ? `${first.char}${second?.char ?? ""}` : first.char
    if ([...chars].some((char) => avoid.has(char))) continue
    const fullName = `${surname}${chars}`
    if (suggestions.some((item) => item.name === fullName)) continue
    const parts = second ? [first, second] : [first]
    suggestions.push({
      name: fullName,
      givenName: chars,
      pinyin: `${surname} ${parts.map((part) => part.pinyin).join(" ")}`,
      meaning: parts.map((part) => `${part.char}：${part.meaning}`).join("；"),
      elements: input.useFiveElements ? parts.map((part) => `${part.char}属${part.element}`).join("，") : "未启用五行参考",
      implication: `整体寓意偏向${input.style}气质，强调${parts.map((part) => part.meaning.split("、")[0]).join("与")}。`,
      tags: Array.from(new Set([input.style, ...parts.flatMap((part) => part.tags)])).slice(0, 4),
      reason: `作为名字灵感，${chars}读感清晰，字义搭配协调，适合作为文化参考与寓意参考。`,
    })
  }

  return {
    suggestions,
    note: "结果为名字灵感、文化参考与寓意参考，不保存姓氏、出生日期或出生时间，也不用于现实结果承诺。",
    disclaimer: cultureDisclaimer,
  }
}

export type AuspiciousDateRequest = {
  matter: string
  startDate: string
  endDate: string
  zodiac?: string
  weekendsOnly?: boolean
  avoidClash?: boolean
}

const matterTerms: Record<string, string[]> = {
  结婚: ["嫁娶", "纳采", "订盟"],
  搬家: ["移徙", "入宅"],
  开业: ["开市", "交易", "纳财"],
  领证: ["嫁娶", "订盟", "纳采"],
  装修: ["修造", "动土", "上梁"],
  入宅: ["入宅", "移徙", "安床"],
  签约: ["交易", "立券", "会友"],
  出行: ["出行"],
}

const highRiskTerms = ["医疗", "求医", "剖腹产", "手术", "投资", "买卖", "诉讼", "官司", "法律"]

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function generateAuspiciousDates(input: AuspiciousDateRequest) {
  if (highRiskTerms.some((term) => input.matter.includes(term))) {
    return {
      warning: "该工具仅供民俗文化娱乐参考，不能用于医疗、法律、投资等重大决策",
      dates: [],
      disclaimer: cultureDisclaimer,
    }
  }
  const terms = matterTerms[input.matter]
  if (!terms) throw new Error("暂不支持该事项类型")

  const start = new Date(`${input.startDate}T00:00:00`)
  const end = new Date(`${input.endDate}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    throw new Error("请填写有效的日期范围")
  }

  const dates = []
  const cursor = new Date(start)
  for (let days = 0; cursor <= end && days < 120; days += 1) {
    const day = cursor.getDay()
    if (!input.weekendsOnly || day === 0 || day === 6) {
      const dateText = formatDate(cursor)
      const { lunar, lunarDate } = getLunarInfo(dateText)
      const yi = cleanAlmanacTerms(lunar.getDayYi())
      const ji = cleanAlmanacTerms(lunar.getDayJi())
      const clash = lunar.getChongDesc()
      const clashesZodiac = input.zodiac ? clash.includes(input.zodiac) : false
      const matchesYi = terms.some((term) => yi.includes(term))
      const hitsJi = terms.some((term) => ji.includes(term))
      if (!input.avoidClash || !clashesZodiac) {
        const score = Math.max(
          55,
          Math.min(96, 68 + (matchesYi ? 18 : 0) - (hitsJi ? 14 : 0) - (clashesZodiac ? 10 : 0) + (day === 0 || day === 6 ? 4 : 0)),
        )
        if (matchesYi || score >= 70) {
          dates.push({
            date: dateText,
            lunarDate,
            weekday: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][day],
            goodFor: yi,
            avoid: ji,
            clash: `${clash}${lunar.getSha() ? ` 煞${lunar.getSha()}` : ""}`,
            goodGods: lunar.getDayJiShen().slice(0, 5),
            score,
            reason: matchesYi
              ? `黄历宜项中包含${terms.filter((term) => yi.includes(term)).join("、")}，可作为${input.matter}的民俗文化参考。`
              : `该日整体冲忌较少，宜项较为平稳，可作为备选参考日期。`,
          })
        }
      }
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return {
    dates: dates.sort((a, b) => b.score - a.score).slice(0, 20),
    note: "仅按传统黄历信息做筛选，不支持医疗、剖腹产、投资买卖、法律诉讼等高风险择日场景。",
    disclaimer: cultureDisclaimer,
  }
}

export type BaziRequest = {
  birthDate: string
  birthTime: string
  calendarType: "solar" | "lunar"
  gender: "男" | "女" | "不透露"
  birthCity?: string
  useTrueSolarTime?: boolean
}

type FiveElementKey = "wood" | "fire" | "earth" | "metal" | "water"

const elementKeyMap: Record<(typeof elementNames)[number], FiveElementKey> = {
  木: "wood",
  火: "fire",
  土: "earth",
  金: "metal",
  水: "water",
}

const elementLabelMap: Record<FiveElementKey, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  metal: "金",
  water: "水",
}

const dayMasterNotes: Record<string, string> = {
  甲: "甲木如大树，传统命理文化中通常认为其象征向上、生发与原则感。",
  乙: "乙木如花草，可以理解为一种柔韧、细腻与善于适应的倾向。",
  丙: "丙火如日光，传统命理文化中通常认为其象征开放、热情与表达力。",
  丁: "丁火如灯烛，可以理解为一种敏锐、专注与温和照亮他人的倾向。",
  戊: "戊土如高山，传统命理文化中通常认为其象征承载、稳定与责任感。",
  己: "己土如田园，可以理解为一种包容、务实与重视秩序的倾向。",
  庚: "庚金如矿石，传统命理文化中通常认为其象征决断、规则与行动力。",
  辛: "辛金如珠玉，可以理解为一种审美、精细与重视品质的倾向。",
  壬: "壬水如江河，传统命理文化中通常认为其象征流动、视野与学习力。",
  癸: "癸水如雨露，可以理解为一种敏感、观察与润物无声的倾向。",
}

function countFiveElements(pillars: string[]) {
  const counts: Record<FiveElementKey, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  }

  for (const pillar of pillars) {
    const { stem, branch } = splitPillar(pillar)
    const stemElement = stemElements[stem]
    const branchElement = branchElements[branch]
    if (stemElement) counts[elementKeyMap[stemElement]] += 1
    if (branchElement) counts[elementKeyMap[branchElement]] += 1
  }

  return counts
}

function describeElementBalance(counts: Record<FiveElementKey, number>) {
  const sorted = (Object.entries(counts) as Array<[FiveElementKey, number]>).sort(
    (a, b) => b[1] - a[1],
  )
  const leading = sorted.filter(([, value]) => value === sorted[0][1])
  const quiet = sorted.filter(([, value]) => value === sorted[sorted.length - 1][1])

  return {
    leading: leading.map(([key]) => elementLabelMap[key]),
    quiet: quiet.map(([key]) => elementLabelMap[key]),
    text: `五行统计中，${leading.map(([key]) => elementLabelMap[key]).join("、")}相对突出，${quiet.map(([key]) => elementLabelMap[key]).join("、")}相对较少。传统命理文化中通常认为，这可以作为观察气质与表达方式的一个民俗参考。`,
  }
}

export function generateBaziReport(input: BaziRequest) {
  if (!input.birthDate || !input.birthTime) {
    throw new Error("请填写出生日期和出生时间")
  }
  if (input.calendarType !== "solar") {
    throw new Error("第一版暂时仅支持阳历排盘，阴历排盘即将支持")
  }

  const { year, month, day } = parseDateParts(input.birthDate)
  const [hourText, minuteText] = input.birthTime.split(":")
  const hour = Number(hourText)
  const minute = Number(minuteText)
  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error("出生时间格式不正确")
  }

  const lunar = Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar()
  const bazi = lunar.getBaZi()
  const [yearPillar, monthPillar, dayPillar, hourPillar] = bazi
  const yearParts = splitPillar(yearPillar)
  const monthParts = splitPillar(monthPillar)
  const dayParts = splitPillar(dayPillar)
  const hourParts = splitPillar(hourPillar)
  const fiveElements = countFiveElements(bazi)
  const balance = describeElementBalance(fiveElements)
  const dayMaster = dayParts.stem
  const tenGodStem = lunar.getBaZiShiShenGan()
  const tenGodBranch = lunar.getBaZiShiShenZhi()
  const naYin = lunar.getBaZiNaYin()
  const hidden = {
    year: hiddenStems[yearParts.branch] ?? [],
    month: hiddenStems[monthParts.branch] ?? [],
    day: hiddenStems[dayParts.branch] ?? [],
    hour: hiddenStems[hourParts.branch] ?? [],
  }

  const summary = [
    `${dayMasterNotes[dayMaster] ?? "日主可作为观察个人表达方式的传统文化符号。"}这类解读仅供娱乐参考，不建议作为现实重大决策依据。`,
    balance.text,
    `从十神关系看，天干显示为${tenGodStem.join("、")}，地支显示为${tenGodBranch.join("、")}。它更适合被理解为传统术语中的关系标签，而不是对现实结果的判断。`,
    `性格参考上，可以把日主与五行分布看作一种倾向：适合观察自己在沟通、节奏、耐心和行动方式上的偏好。事业方向参考也应回到真实能力、行业机会和长期训练，不宜用排盘结果替代职业选择。`,
    `生活建议上，若某一类五行特别突出，可以提醒自己保持节奏平衡；若某一类较少，则可以在学习、运动、社交和作息中补充相应的生活体验。`,
  ].join("\n\n")

  return {
    ok: true,
    inputSummary: {
      calendarType: input.calendarType,
      gender: input.gender,
      cityProvided: Boolean(input.birthCity?.trim()),
      trueSolarTime: Boolean(input.useTrueSolarTime),
      privacy: "本工具默认不保存你的出生信息，结果仅在本次页面生成。",
    },
    pillars: {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar,
    },
    stemsBranches: {
      yearStem: yearParts.stem,
      yearBranch: yearParts.branch,
      monthStem: monthParts.stem,
      monthBranch: monthParts.branch,
      dayStem: dayParts.stem,
      dayBranch: dayParts.branch,
      hourStem: hourParts.stem,
      hourBranch: hourParts.branch,
    },
    zodiac: lunar.getYearShengXiao(),
    fiveElements,
    fiveElementText: balance.text,
    tenGods: {
      stems: {
        year: tenGodStem[0],
        month: tenGodStem[1],
        day: tenGodStem[2],
        hour: tenGodStem[3],
      },
      branches: {
        year: tenGodBranch[0],
        month: tenGodBranch[1],
        day: tenGodBranch[2],
        hour: tenGodBranch[3],
      },
    },
    hiddenStems: hidden,
    naYin: {
      year: naYin[0],
      month: naYin[1],
      day: naYin[2],
      hour: naYin[3],
    },
    dayMaster: {
      stem: dayMaster,
      element: stemElements[dayMaster],
      description: dayMasterNotes[dayMaster] ?? "日主可作为传统命理文化中的观察符号。",
    },
    summary,
    monetization: {
      paidEnabled: process.env.NEXT_PUBLIC_ENABLE_BAZI_PAID === "true",
      baziPriceCny: process.env.BAZI_REPORT_PRICE_CNY ?? "9.9",
      namePriceCny: "19.9",
      auspiciousDatePriceCny: "9.9",
      status:
        process.env.NEXT_PUBLIC_ENABLE_BAZI_PAID === "true"
          ? "支付能力预留中，请接入真实订单后解锁"
          : "详细报告功能即将开放",
    },
    disclaimer: cultureDisclaimer,
  }
}
