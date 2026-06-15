'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const AIRPORTS = [
  { code: 'PEK', city: '北京', name: '首都国际机场' },
  { code: 'PKX', city: '北京', name: '大兴国际机场' },
  { code: 'SHA', city: '上海', name: '虹桥国际机场' },
  { code: 'PVG', city: '上海', name: '浦东国际机场' },
  { code: 'CAN', city: '广州', name: '白云国际机场' },
  { code: 'SZX', city: '深圳', name: '宝安国际机场' },
  { code: 'CTU', city: '成都', name: '双流国际机场' },
  { code: 'HGH', city: '杭州', name: '萧山国际机场' },
  { code: 'XIY', city: '西安', name: '咸阳国际机场' },
  { code: 'WUH', city: '武汉', name: '天河国际机场' },
  { code: 'CKG', city: '重庆', name: '江北国际机场' },
  { code: 'KMG', city: '昆明', name: '长水国际机场' },
  { code: 'SYX', city: '三亚', name: '凤凰国际机场' },
  { code: 'XMN', city: '厦门', name: '高崎国际机场' },
  { code: 'TAO', city: '青岛', name: '胶东国际机场' },
  { code: 'NKG', city: '南京', name: '禄口国际机场' },
  { code: 'CSX', city: '长沙', name: '黄花国际机场' },
  { code: 'HRB', city: '哈尔滨', name: '太平国际机场' },
  { code: 'URC', city: '乌鲁木齐', name: '地窝堡国际机场' },
]

const today = new Date().toISOString().split('T')[0]

export default function Home() {
  const router = useRouter()
  const [from, setFrom] = useState('PEK')
  const [to, setTo] = useState('SHA')
  const [date, setDate] = useState(today)
  const [error, setError] = useState('')

  function swap() {
    setFrom(to)
    setTo(from)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (from === to) {
      setError('出发地和目的地不能相同')
      return
    }
    setError('')
    router.push(`/results?from=${from}&to=${to}&date=${date}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl">
        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">✈ 甩尾雷达</h1>
          <p className="text-blue-200 text-base">
            发现联程机票中的隐藏优惠 — A→B→C 的票价，有时比 A→B 更便宜
          </p>
        </div>

        {/* Search form */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            {/* From */}
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                出发地
              </label>
              <select
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {AIRPORTS.map(a => (
                  <option key={a.code} value={a.code}>
                    {a.city} ({a.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap button */}
            <button
              type="button"
              onClick={swap}
              className="mt-5 p-2 rounded-full bg-gray-100 hover:bg-blue-100 transition-colors text-gray-600 hover:text-blue-600 text-lg"
              title="交换出发地和目的地"
            >
              ⇄
            </button>

            {/* To */}
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                目的地
              </label>
              <select
                value={to}
                onChange={e => setTo(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {AIRPORTS.map(a => (
                  <option key={a.code} value={a.code}>
                    {a.city} ({a.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
              出发日期
            </label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-base"
          >
            搜索甩尾机票
          </button>
        </form>

        {/* Disclaimer */}
        <p className="text-center text-blue-300 text-xs mt-6 leading-relaxed px-4">
          甩尾策略指购买 A→B→C 联程票但只乘坐至 B。此类操作通常不违法，但可能违反航空公司条款，请了解相关风险后再使用。
        </p>
      </div>
    </main>
  )
}
