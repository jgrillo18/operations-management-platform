import { useEffect, useState } from 'react'
import { useLang } from '../context/LangContext'
import api from '../api'

const ACTION_COLORS = {
  CREATE_REQUEST: 'bg-blue-100 text-blue-700',
  UPDATE_STATUS:  'bg-yellow-100 text-yellow-700',
  DELETE_REQUEST: 'bg-red-100 text-red-700',
}

export default function AuditLog() {
  const { tr } = useLang()
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/audit?limit=200').then(res => {
      setLogs(res.data)
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{tr.auditTitle}</h2>
        <span className="text-sm text-gray-400">{logs.length} {tr.entries}</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">{tr.loading}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">{tr.col3.timestamp}</th>
                  <th className="px-5 py-3 text-left">{tr.col3.action}</th>
                  <th className="px-5 py-3 text-left">{tr.col3.entity}</th>
                  <th className="px-5 py-3 text-left">{tr.col3.detail}</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-gray-400">
                      {tr.noAudit}
                    </td>
                  </tr>
                )}
                {logs.map(l => (
                  <tr
                    key={l.id}
                    className="border-t border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap font-mono text-xs">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded font-mono ${
                          ACTION_COLORS[l.action] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {l.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{l.entity}</td>
                    <td className="px-5 py-3 text-gray-500">{l.detail || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
