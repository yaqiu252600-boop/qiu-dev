import { Solar } from "lunar-javascript"

export const cultureDisclaimer =
  "本工具基于传统历法、民俗文化与文字寓意生成内容，结果仅供传统文化研究、娱乐参考与灵感启发使用，不构成现实决策建议。请勿将本工具结果作为医疗、法律、投资、婚恋、升学、就业等重大事项的唯一依据。"

const unsafeAlmanacTerms = new Set(["开光", "法事", "求医", "治病", "安葬", "破土"])
const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
const elementNames = ["木", "火", "土", "金", "水"] as const
type ElementName = (typeof elementNames)[number]
const stemElements: Record<string, ElementName> = {
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
const branchElements: Record<string, ElementName> = {
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
  甲: "甲木如大树，重视生长、原则、秩序和长期积累。",
  乙: "乙木如花草，重视柔韧、审美、适应力和细节经营。",
  丙: "丙火如日光，重视开放、表达、热情和影响力。",
  丁: "丁火如灯烛，重视敏锐、专注、感受力和温和照亮。",
  戊: "戊土如高山，重视承载、稳定、责任感和边界感。",
  己: "己土如田园，重视包容、务实、照料和秩序维护。",
  庚: "庚金如矿石，重视决断、规则、行动力和结构化能力。",
  辛: "辛金如珠玉，重视品质、审美、精细度和分寸感。",
  壬: "壬水如江河，重视流动、视野、学习力和信息整合。",
  癸: "癸水如雨露，重视观察、敏感、渗透力和安静滋养。",
}

const elementTraits: Record<ElementName, string> = {
  木: "成长、规划、学习、创意和关系伸展",
  火: "表达、热情、看见、传播和现场感染力",
  土: "稳定、承载、信用、管理和资源整合",
  金: "规则、判断、效率、品质和边界意识",
  水: "流动、思考、信息、洞察和适应变化",
}

const tenGodMeanings: Record<string, string> = {
  比肩: "自我意识、同辈关系、独立性和竞争感",
  劫财: "行动冲劲、资源争取、合作拉扯和即时反应",
  食神: "表达、享受、输出、审美和稳定的创造力",
  伤官: "突破、才华、锋芒、质疑精神和表达欲",
  偏财: "机会、流动资源、人情往来和市场敏感度",
  正财: "秩序、稳定收益、责任意识和现实经营",
  七杀: "压力、挑战、执行力、速度和风险意识",
  正官: "规则、名誉、责任、规范和组织位置",
  偏印: "直觉、特殊兴趣、独立理解和非线性学习",
  正印: "学习、保护、贵人、体系知识和稳定支持",
  日主: "自我核心、主观感受和表达中心",
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

  const leadingElements = leading.map(([key]) => elementLabelMap[key]) as ElementName[]
  const quietElements = quiet.map(([key]) => elementLabelMap[key]) as ElementName[]

  return {
    leading: leadingElements,
    quiet: quietElements,
    text: `五行统计中，${leadingElements.join("、")}相对突出，${quietElements.join("、")}相对较少。突出的部分代表更容易被看见的表达方式，较少的部分则适合用环境、习惯和长期训练去补足。`,
  }
}

function getElementCount(counts: Record<FiveElementKey, number>, element: ElementName) {
  return counts[elementKeyMap[element]]
}

function joinMeanings(gods: string[]) {
  return Array.from(new Set(gods))
    .map((god) => `${god}偏向${tenGodMeanings[god] ?? "关系与状态变化"}`)
    .join("；")
}

function createBaziAnalysis(params: {
  dayMaster: string
  dayElement: ElementName
  counts: Record<FiveElementKey, number>
  balance: ReturnType<typeof describeElementBalance>
  pillars: string[]
  tenGodStem: string[]
  tenGodBranch: string[]
  naYin: string[]
}) {
  const { dayMaster, dayElement, counts, balance, pillars, tenGodStem, tenGodBranch, naYin } = params
  const allGods = [...tenGodStem, ...tenGodBranch]
  const strongest = balance.leading.join("、")
  const quiet = balance.quiet.join("、")
  const dayElementCount = getElementCount(counts, dayElement)
  const hasOutput = allGods.includes("食神") || allGods.includes("伤官")
  const hasWealth = allGods.includes("正财") || allGods.includes("偏财")
  const hasOfficer = allGods.includes("正官") || allGods.includes("七杀")
  const hasResource = allGods.includes("正印") || allGods.includes("偏印")
  const hasPeer = allGods.includes("比肩") || allGods.includes("劫财")
  const currentYear = new Date().getFullYear()

  const personality = [
    `${dayMasterNotes[dayMaster] ?? "日主代表一个人的核心表达方式。"}本盘日主为${dayMaster}${dayElement}，日主五行在四柱显性统计中出现 ${dayElementCount} 次，说明自我表达并不是孤立存在，而是会受到${strongest}气场牵引。`,
    `${balance.text}${strongest}偏强时，做事更容易从${balance.leading.map((item) => elementTraits[item]).join("、")}这些方向启动；${quiet}偏少时，遇到相关议题可能需要更刻意地练习和补充。`,
    `十神组合里，${joinMeanings(allGods)}。这组关系让性格呈现出多层次：一方面看日主本身的稳定倾向，另一方面也要看外界任务、资源关系和表达欲如何把人推向不同状态。`,
  ].join("\n\n")

  const career = [
    hasOfficer
      ? "事业上，盘中带有官杀信息，适合观察自己在规则、责任、目标压力和组织协作中的表现。遇到清晰标准、明确期限或需要承担责任的位置时，反而容易被激发执行力。"
      : "事业上，盘中官杀压力不算最显眼，路径更适合从兴趣、能力沉淀、作品积累或资源经营里慢慢拉开差距，而不是完全依赖外部头衔推动。",
    hasOutput
      ? "食伤信息明显时，表达、策划、内容输出、产品设计、教学展示、审美创作、技术方案解释等方向更值得测试。重点是把想法做成稳定输出，而不是只停留在灵感。"
      : "食伤信息不强时，工作中可以刻意训练表达和交付能力，把经验沉淀成文档、模板、流程或作品，让别人更容易看见你的价值。",
    hasResource
      ? "印星信息给到学习、体系化和吸收能力，适合长期型专业、证书学习、研究型任务、后台支撑、知识服务或需要持续输入的岗位。"
      : "印星不突出时，不宜完全依赖被动学习，更适合用项目、实战和反馈逼出成长，把知识快速放进真实场景里验证。",
  ].join("\n\n")

  const relationship = [
    hasPeer
      ? "关系相处里，比劫信息会增强自我立场和同辈互动感。优点是讲义气、有参与感，缺点是容易在亲近关系里较劲，或在资源分配上敏感。"
      : "关系相处里，比劫不算最突出，很多时候不会天然把自己放在对抗位置，更适合通过清晰表达需求来建立边界。",
    hasOutput
      ? "表达型十神存在时，感情中的吸引力往往来自真实表达、幽默感、审美和情绪流动。需要注意的是，表达欲强时别把即时感受当成最终结论。"
      : "表达型十神不强时，感情里可能更偏行动或责任表达。建议主动把关心说出来，避免让对方只能靠猜来理解你的在意。",
    `从五行看，${strongest}较突出会让关系中的主要能量落在${balance.leading.map((item) => elementTraits[item]).join("、")}；${quiet}较少则提醒你在相关议题上多一点耐心和练习。`,
  ].join("\n\n")

  const wealth = [
    hasWealth
      ? "财富观念上，财星信息出现，说明盘面很重视现实资源、交换关系、机会捕捉和生活经营。适合把赚钱看成长期能力组合：专业、渠道、信用和执行节奏。"
      : "财富观念上，财星不是最显眼的主轴，早期更适合先建立可复用能力和稳定作品，再通过资源连接与场景选择提升收益质量。",
    hasOutput && hasWealth
      ? "食伤与财星同时可见时，适合测试“输出带来机会”的路径，例如内容、产品、销售表达、技术服务、咨询方案、作品变现等。关键是把输出变成可交付、可复购、可被传播的东西。"
      : "如果想增强财富转化，重点不是追短期机会，而是把能力包装成别人能理解、能购买、能信任的结果。",
    `五行中${strongest}偏强，资源处理方式会带有${balance.leading.map((item) => elementTraits[item]).join("、")}的色彩；做财务规划时，最好把冲动消费、情绪决策和人情压力拆开看。`,
  ].join("\n\n")

  const yearly = [
    `流年简析先以近三年做文化参考。${currentYear} 年适合观察外部环境给你的任务变化：如果正在换方向，重点是先把核心能力和作息节奏稳定下来。`,
    `${currentYear + 1} 年更适合把前一年试出来的方向做结构化整理，尤其是流程、作品、证据、客户反馈和长期学习路径。`,
    `${currentYear + 2} 年适合看成果转化：哪些关系值得长期维护，哪些项目值得扩大，哪些消耗需要停止。流年分析更像年度复盘框架，可以拿来做计划检查表。`,
  ].join("\n\n")

  const communication = [
    `沟通上，${dayMaster}${dayElement}需要先理解自己的启动方式：${elementTraits[dayElement]}是核心底色。遇到冲突时，先区分“事实问题、情绪问题、边界问题”，会比急着判断对错更有效。`,
    `${quiet}较少，说明在${balance.quiet.map((item) => elementTraits[item]).join("、")}相关场景里可以更主动补课。比如用固定复盘、运动、阅读、社交练习、表达训练来补齐体验。`,
  ].join("\n\n")

  const life = [
    `生活建议上，五行不是要追求绝对平均，而是看哪里太满、哪里太少。${strongest}强的时候，要防止同一种模式反复用力；${quiet}少的时候，要给它留出稳定进入生活的入口。`,
    `四柱为${pillars.join("、")}，纳音为${naYin.join("、")}。可以把它当作一组象征系统：用来帮助整理自我观察，而不是替代现实行动。真正能改变体验的，仍然是选择、习惯、关系质量和长期训练。`,
  ].join("\n\n")

  return {
    personality,
    career,
    relationship,
    wealth,
    yearly,
    communication,
    life,
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
  const analysis = createBaziAnalysis({
    dayMaster,
    dayElement: stemElements[dayMaster],
    counts: fiveElements,
    balance,
    pillars: bazi,
    tenGodStem,
    tenGodBranch,
    naYin,
  })

  const summary = [
    `${dayMasterNotes[dayMaster] ?? "日主可作为观察个人表达方式的传统文化符号。"}`,
    balance.text,
    `从十神关系看，天干显示为${tenGodStem.join("、")}，地支显示为${tenGodBranch.join("、")}。这些标签可以帮助观察自我、表达、资源、压力、学习和关系之间的互动。`,
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
    analysis,
    disclaimer: cultureDisclaimer,
  }
}
