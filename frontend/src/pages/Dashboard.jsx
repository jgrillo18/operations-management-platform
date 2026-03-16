import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useLang } from '../context/LangContext'
import { DEMO_REQUESTS } from '../i18n'
import api from '../api'

const STATUS_COLORS = {
  OPEN:        'bg-blue-100 text-blue-800 border-blue-300',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  RESOLVED:    'bg-green-100 text-green-800 border-green-300',
  CLOSED:      'bg-gray-100 text-gray-600 border-gray-300',
}

const STAT_KEYS = [
  { statusKey: null,          color: 'border-l-blue-500',   icon: '📋' },
  { statusKey: 'OPEN',        color: 'border-l-blue-400',   icon: '🔵' },
  { statusKey: 'IN_PROGRESS', color: 'border-l-yellow-400', icon: '🟡' },
  { statusKey: 'RESOLVED',    color: 'border-l-green-400',  icon: '🟢' },
  { statusKey: 'CLOSED',      color: 'border-l-gray-400',   icon: '⚪' },
]

const STATUS_PIE_COLORS  = { OPEN: '#60a5fa', IN_PROGRESS: '#fbbf24', RESOLVED: '#4ade80', CLOSED: '#9ca3af' }
const PRIORITY_BAR_COLORS = { LOW: '#86efac', MEDIUM: '#60a5fa', HIGH: '#fb923c', CRITICAL: '#f87171' }

export default function Dashboard() {
  const { tr } = useLang()
  const [requests, setRequests]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [demoLoading, setDemoLoading] = useState(false)

  useEffect(() => {
    api.get('/requests').then(res => {
      setRequests(res.data)
      setLoading(false)
    })
  }, [])

  async function handleLoadDemo() {
    setDemoLoading(true)
    try {
      for (const req of DEMO_REQUESTS) {
        const res = await api.post('/requests', {
          title: req.title,
          description: req.description,
          priority: req.priority,
        })
        if (req.status !== 'OPEN') {
          await api.put(`/requests/${res.data.id}`, { status: req.status })
        }
      }
      const res = await api.get('/requests')
      setRequests(res.data)
    } finally {
      setDemoLoading(false)
    }
  }

  const count = (key) =>
    key ? requests.filter(r => r.status === key).length : requests.length

  const countPri = (key) => requests.filter(r => r.priority === key).length

  const statusChartData = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
    .map(k => ({ name: tr.statusLabels?.[k] || k, value: count(k), color: STATUS_PIE_COLORS[k] }))
    .filter(d => d.value > 0)

  const priorityChartData = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    .map(k => ({ name: tr.priorityOptions?.[k] || k, value: countPri(k), color: PRIORITY_BAR_COLORS[k] }))
    .filter(d => d.value > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>
          <p>{tr.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{tr.executivePanel}</h2>
        <button
          onClick={handleLoadDemo}
          disabled={demoLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-300 text-blue-700 text-sm font-medium hover:bg-blue-50 disabled:opacity-50 transition"
        >
          {demoLoading ? (
            <><span className="animate-spin">⟳</span> {tr.demoLoading}</>
          ) : (
            <><span>🗂️</span> {tr.loadDemo}</>
          )}
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {STAT_KEYS.map(({ statusKey, color, icon }, i) => (
          <div
            key={i}
            className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${color}`}
          >
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span>{icon}</span> {tr.kpiLabels[i]}
            </p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{count(statusKey)}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {requests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
              {tr.chartStatus}
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  paddingAngle={3} dataKey="value"
                >
                  {statusChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {statusChartData.map(d => (
                <span key={d.name} className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
              {tr.chartPriority}
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={priorityChartData}
                margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent requests table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4">{tr.recentRequests}</h3>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-4">{tr.noRequestsYet}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wide">
                  <th className="pb-3 pr-4">{tr.col.id}</th>
                  <th className="pb-3 pr-4">{tr.col.title}</th>
                  <th className="pb-3 pr-4">{tr.col.status}</th>
                  <th className="pb-3">{tr.col.created}</th>
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 10).map(r => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                    <td className="py-3 pr-4 text-gray-400 font-mono">#{r.id}</td>
                    <td className="py-3 pr-4 text-gray-800 font-medium">{r.title}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tr.statusLabels[r.status] || r.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
