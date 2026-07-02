declare module "lunar-javascript" {
  export const Solar: {
    fromYmd(year: number, month: number, day: number): {
      getLunar(): Lunar
    }
    fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): {
      getLunar(): Lunar
    }
  }

  export type Lunar = {
    toString(): string
    getYearInGanZhi(): string
    getMonthInGanZhi(): string
    getDayInGanZhi(): string
    getTimeInGanZhi(): string
    getYearGan(): string
    getYearZhi(): string
    getMonthGan(): string
    getMonthZhi(): string
    getDayGan(): string
    getDayZhi(): string
    getTimeGan(): string
    getTimeZhi(): string
    getYearShengXiao(): string
    getYearNaYin(): string
    getMonthNaYin(): string
    getDayNaYin(): string
    getTimeNaYin(): string
    getBaZi(): string[]
    getBaZiWuXing(): string[]
    getBaZiNaYin(): string[]
    getBaZiShiShenGan(): string[]
    getBaZiShiShenZhi(): string[]
    getDayYi(): string[]
    getDayJi(): string[]
    getDayJiShen(): string[]
    getDayXiongSha(): string[]
    getChongDesc(): string
    getSha(): string
  }
}
