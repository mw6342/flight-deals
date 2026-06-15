'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface DirectFlight {
  airline: string
  airlineCode: string
  flightNo: string
  departure: string
  arrival: string
  duration: string
  price: number
}

interface ThrowawayFlight {
  airline: string
  airlineCode: string
  flightNo1: string
  flightNo2: string
  viaCode: string
  viaCity: string
  departure: string
  arrivalAtStop: string
  departureFromStop: string
  finalArrival: string
  price: number
  savings: number
  savingsPercent: number
}

interface SearchResult {
  from: { code: string; city: string; name: string }
  to: { code: string; city: string; name: string }
  date: string
  directFlights: DirectFlight[]
  throwaways: ThrowawayFlight[]
}

function ctripUrl(from: string, to: string, date: string) {
  const d = date || new Date().toISOString().split('T')[0]
  return `https://flights.ctrip.com/online/list/oneway-${from.toLowerCase()}-${to.toLowerCase()}?depdate=${d}&cabin=Y&adult=1`
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const date = searchParams.get('date') || ''

  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!from || !to) {
      router.push('/')
      return
    }
    setLoading(true)
    fetch(`/api/search?from=${from}&to=${to}&date=${date}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setResult(data)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('搜索失败，请重试')
        setLoading(false)
      })
  }, [from, to, date, router])

  const cheapestDirect = result
    ? Math.min(...result.directFlights.map(f => f.price))
    : 0

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-blue-200 hover:text-white text-sm transition-colors">
            ← 返回搜索
          </Link>
          {result && (
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span>{result.from.city} ({result.from.code})</span>
              <span className="text-blue-300">→</span>
              <span>{result.to.city} ({result.to.code})</span>
              {date && <span className="text-blue-300 text-sm font-normal ml-2">{date}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-4xl mb-4">✈</div>
            <p>正在搜索甩尾机票...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
            {error}
          </div>
        )}

        {result && !loading && (
          <>
            {/* Direct flights benchmark */}
            <section className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                直飞参考价格
              </h2>
              <div className="flex flex-col gap-2">
                {result.directFlights.map(f => (
                  <div
                    key={f.flightNo}
                    className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                        {f.flightNo}
                      </span>
                      <span className="text-sm text-gray-700">{f.airline}</span>
                      <span className="text-sm text-gray-500">
                        {f.departure} → {f.arrival}
                      </span>
                      <span className="text-xs text-gray-400">{f.duration}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800 text-lg">¥{f.price}</span>
                      <a
                        href={ctripUrl(from, to, date)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 rounded-lg px-2 py-1 transition-colors whitespace-nowrap"
                      >
                        携程验证 →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Throwaway options */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  甩尾优惠方案
                </h2>
                <span className="text-xs text-gray-400">
                  购买联程票 {result.from.city}→{result.to.city}→途经城市，只乘坐至{result.to.city}
                </span>
              </div>

              {result.throwaways.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                  该航线暂无甩尾优惠
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {result.throwaways.map((t, i) => (
                    <div
                      key={t.flightNo1}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                      {/* Savings badge */}
                      <div className="bg-green-50 border-b border-green-100 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {i === 0 && (
                            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              最优惠
                            </span>
                          )}
                          <span className="text-green-700 font-semibold text-sm">
                            省 ¥{t.savings}（{t.savingsPercent}%）
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-400 line-through mr-2">¥{cheapestDirect}</span>
                          <span className="text-xl font-bold text-green-700">¥{t.price}</span>
                        </div>
                      </div>

                      {/* Flight details */}
                      <div className="px-4 py-3">
                        {/* Leg 1: A → B */}
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">
                            {t.flightNo1}
                          </span>
                          <span className="text-gray-600">{t.airline}</span>
                          <span className="text-gray-800 font-medium">
                            {result.from.city} {t.departure}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="text-gray-800 font-medium">
                            {result.to.city} {t.arrivalAtStop}
                          </span>
                          <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                            在此下机 ✓
                          </span>
                        </div>

                        {/* Leg 2: B → C (not taken) */}
                        <div className="flex items-center gap-2 text-sm opacity-40">
                          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                            {t.flightNo2}
                          </span>
                          <span className="text-gray-500">{t.airline}</span>
                          <span className="text-gray-500">
                            {result.to.city} {t.departureFromStop}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="text-gray-500">
                            {t.viaCity} {t.finalArrival}
                          </span>
                          <span className="ml-auto text-xs text-gray-400">（不乘坐）</span>
                        </div>
                      </div>

                      {/* Warning */}
                      <div className="bg-amber-50 border-t border-amber-100 px-4 py-2 text-xs text-amber-700">
                        ⚠ 不可托运行李至终点站 · 不适用于往返票回程 · 可能影响常旅客积分
                      </div>

                      {/* CTA buttons */}
                      <div className="px-4 py-3 flex gap-2 border-t border-gray-100">
                        <a
                          href={ctripUrl(from, t.viaCode, date)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2 transition-colors"
                        >
                          在携程搜索甩尾联程票
                        </a>
                        <a
                          href={ctripUrl(from, to, date)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-2 transition-colors whitespace-nowrap"
                        >
                          对比直飞价
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">✈</div>
          <p>正在搜索甩尾机票...</p>
        </div>
      </main>
    }>
      <ResultsContent />
    </Suspense>
  )
}
