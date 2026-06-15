import { type NextRequest } from 'next/server'

const AIRPORTS: Record<string, { city: string; name: string }> = {
  PEK: { city: '北京', name: '首都国际机场' },
  PKX: { city: '北京', name: '大兴国际机场' },
  SHA: { city: '上海', name: '虹桥国际机场' },
  PVG: { city: '上海', name: '浦东国际机场' },
  CAN: { city: '广州', name: '白云国际机场' },
  SZX: { city: '深圳', name: '宝安国际机场' },
  CTU: { city: '成都', name: '双流国际机场' },
  HGH: { city: '杭州', name: '萧山国际机场' },
  XIY: { city: '西安', name: '咸阳国际机场' },
  WUH: { city: '武汉', name: '天河国际机场' },
  CKG: { city: '重庆', name: '江北国际机场' },
  KMG: { city: '昆明', name: '长水国际机场' },
  SYX: { city: '三亚', name: '凤凰国际机场' },
  XMN: { city: '厦门', name: '高崎国际机场' },
  TAO: { city: '青岛', name: '胶东国际机场' },
  NKG: { city: '南京', name: '禄口国际机场' },
  CSX: { city: '长沙', name: '黄花国际机场' },
  HRB: { city: '哈尔滨', name: '太平国际机场' },
  URC: { city: '乌鲁木齐', name: '地窝堡国际机场' },
}

const AIRLINES = [
  { name: '中国国际航空', code: 'CA' },
  { name: '中国东方航空', code: 'MU' },
  { name: '中国南方航空', code: 'CZ' },
  { name: '海南航空', code: 'HU' },
  { name: '厦门航空', code: 'MF' },
  { name: '深圳航空', code: 'ZH' },
]

function seededRand(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function makeRng(baseSeed: number) {
  let counter = 0
  return () => seededRand(baseSeed + counter++)
}

function randInt(rand: () => number, min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min
}

function formatTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const from = params.get('from') || 'PEK'
  const to = params.get('to') || 'SHA'
  const date = params.get('date') || ''

  const fromAirport = AIRPORTS[from]
  const toAirport = AIRPORTS[to]

  if (!fromAirport || !toAirport) {
    return Response.json({ error: '无效的机场代码' }, { status: 400 })
  }

  if (from === to) {
    return Response.json({ error: '出发地和目的地不能相同' }, { status: 400 })
  }

  // Seed RNG from route + date so results are stable per search
  const seedStr = `${from}${to}${date}`
  let seedNum = 0
  for (let i = 0; i < seedStr.length; i++) seedNum += seedStr.charCodeAt(i) * (i + 1)
  const rand = makeRng(seedNum)

  const directBasePrice = randInt(rand, 800, 2500)

  // 2-3 direct flights
  const directFlights = Array.from({ length: randInt(rand, 2, 3) }, () => {
    const airline = AIRLINES[randInt(rand, 0, AIRLINES.length - 1)]
    const depHour = randInt(rand, 6, 20)
    const depMin = randInt(rand, 0, 11) * 5
    const flightMins = randInt(rand, 90, 240)
    const arrTotalMin = depHour * 60 + depMin + flightMins
    return {
      airline: airline.name,
      airlineCode: airline.code,
      flightNo: `${airline.code}${randInt(rand, 1000, 9999)}`,
      departure: formatTime(depHour, depMin),
      arrival: formatTime(Math.floor(arrTotalMin / 60) % 24, arrTotalMin % 60),
      duration: `${Math.floor(flightMins / 60)}h${flightMins % 60}m`,
      price: directBasePrice + randInt(rand, -100, 200),
    }
  })

  // Via cities for throwaway options
  const viaCandidates = Object.entries(AIRPORTS)
    .filter(([code]) => code !== from && code !== to)
    .sort(() => rand() - 0.5)
    .slice(0, 5)

  const throwaways = viaCandidates
    .map(([viaCode, viaAirport]) => {
      const airline = AIRLINES[randInt(rand, 0, AIRLINES.length - 1)]
      const savings = randInt(rand, 150, 700)
      const price = Math.max(directBasePrice - savings, 300)
      const actualSavings = directBasePrice - price
      const depHour = randInt(rand, 6, 20)
      const depMin = randInt(rand, 0, 11) * 5
      const firstLegMins = randInt(rand, 90, 180)
      const layoverMins = randInt(rand, 60, 120)
      const secondLegMins = randInt(rand, 60, 150)
      const arrFirstTotalMin = depHour * 60 + depMin + firstLegMins
      const depSecondTotalMin = arrFirstTotalMin + layoverMins
      const arrSecondTotalMin = depSecondTotalMin + secondLegMins
      return {
        airline: airline.name,
        airlineCode: airline.code,
        flightNo1: `${airline.code}${randInt(rand, 1000, 9999)}`,
        flightNo2: `${airline.code}${randInt(rand, 1000, 9999)}`,
        viaCode,
        viaCity: viaAirport.city,
        departure: formatTime(depHour, depMin),
        arrivalAtStop: formatTime(Math.floor(arrFirstTotalMin / 60) % 24, arrFirstTotalMin % 60),
        departureFromStop: formatTime(Math.floor(depSecondTotalMin / 60) % 24, depSecondTotalMin % 60),
        finalArrival: formatTime(Math.floor(arrSecondTotalMin / 60) % 24, arrSecondTotalMin % 60),
        price,
        savings: actualSavings,
        savingsPercent: Math.round((actualSavings / directBasePrice) * 100),
      }
    })
    .filter(t => t.savings > 0)
    .sort((a, b) => b.savings - a.savings)

  return Response.json({
    from: { code: from, ...fromAirport },
    to: { code: to, ...toAirport },
    date,
    directFlights,
    throwaways,
  })
}
