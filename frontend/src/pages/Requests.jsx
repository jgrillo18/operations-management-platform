import { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext'
import api from '../api'
import RequestForm from '../components/RequestForm'

const STATUS_OPTIONS   = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
const PRIORITY_OPTIONS  = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const PAGE_SIZE_OPTIONS = [10, 20, 50]

const STATUS_COLORS = {
  OPEN:        'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED:    'bg-green-100 text-green-800',
  CLOSED:      'bg-gray-100 text-gray-600',
}

export default function Requests() {
  const { tr } = useLang()
  const [data, setData]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus]     = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [page, setPage]       = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1) }, [search, filterStatus, filterPriority, pageSize])

  useEffect(() => { load() }, [])

  function load() {
    setLoading(true)
    api.get('/requests').then(res => {
      setData(res.data)
      setLoading(false)
    })
  }

  function changeStatus(id, status) {
    api.put(`/requests/${id}`, { status }).then(load)
  }

  function deleteReq(id) {
    if (!window.confirm(tr.confirmDelete)) return
    api.delete(`/requests/${id}`).then(load)
  }

  const filtered = data.filter(r => {
    if (filterStatus   && r.status   !== filterStatus)   return false
    if (filterPriority && r.priority !== filterPriority) return false
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
  const firstItem  = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const lastItem   = Math.min(safePage * pageSize, filtered.length)

  function exportCSV() {
    const headers = ['ID', 'Title', 'Description', 'Priority', 'Status', 'Created']
    const rows = filtered.map(r => [
      r.id,
      `"${(r.title       || '').replace(/"/g, '""""')}"`,
      `"${(r.description || '').replace(/"/g, '""""')}"`,
      r.priority,
      r.status,
      new Date(r.created_at).toLocaleDateString(),
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = 'requests.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">{tr.nav?.requests || 'Requests'}</h2>

      <RequestForm reload={load} />

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`🔍  ${tr.titlePlaceholder || 'Search…'}`}
          className="flex-1 min-w-[160px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">{tr.allStatuses || 'All statuses'}</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{tr.statusLabels?.[s] || s}</option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">{tr.allPriorities || 'All priorities'}</option>
          {PRIORITY_OPTIONS.map(p => (
            <option key={p} value={p}>{tr.priorityOptions?.[p] || p}</option>
          ))}
        </select>
        {(search || filterStatus || filterPriority) && (
          <button
            onClick={() => { setSearch(''); setFilterStatus(''); setFilterPriority('') }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition"
          >
            ✕ {tr.clearFilters || 'Clear'}
          </button>
        )}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {filtered.length === 0
              ? '0'
              : `${tr.showing || 'Showing'} ${firstItem}–${lastItem} ${tr.of || 'of'} ${filtered.length}`}
          </span>
          <select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            title={tr.perPage || 'Per page'}
          >
            {PAGE_SIZE_OPTIONS.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition"
          >
            ⬇️ {tr.exportCSV || 'Export CSV'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">{tr.loading}</div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
          <div className="text-4xl mb-2">📭</div>
          <p>{tr.noReqData}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">{tr.col2.id}</th>
                  <th className="px-5 py-3 text-left">{tr.col2.title}</th>
                  <th className="px-5 py-3 text-left">{tr.col2.description}</th>
                  <th className="px-5 py-3 text-left">{tr.col2.priority}</th>
                  <th className="px-5 py-3 text-left">{tr.col2.status}</th>
                  <th className="px-5 py-3 text-left">{tr.col2.created}</th>
                  <th className="px-5 py-3 text-left">{tr.col2.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                      {tr.noFilterResults || 'No results match your filters.'}
                    </td>
                  </tr>
                )}
                {paginated.map(r => (
                  <tr
                    key={r.id}
                    className="border-t border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-5 py-3 text-gray-400 font-mono">#{r.id}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{r.title}</td>
                    <td className="px-5 py-3 text-gray-500 max-w-xs truncate">
                      {r.description || <span className="italic text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        tr.priorityColors?.[r.priority] || 'bg-gray-100 text-gray-600'
                      }`}>
                        {tr.priorityOptions?.[r.priority] || r.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={r.status}
                        onChange={e => changeStatus(r.id, e.target.value)}
                        className={`text-xs font-medium rounded-full px-3 py-1 border cursor-pointer ${
                          STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>
                            {tr.statusLabels[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => deleteReq(r.id)}
                        className="text-red-400 hover:text-red-600 text-xs font-medium transition"
                      >
                        {tr.deleteBtn}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
              <span className="text-xs text-gray-500">
                {tr.pageLabel || 'Page'} {safePage} / {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={safePage === 1}
                  className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-30 transition"
                >
                  «
                </button>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="px-3 py-1 text-xs rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-30 transition"
                >
                  {tr.prev || '← Prev'}
                </button>

                {/* Page number pills */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push('...')
                    acc.push(n)
                    return acc
                  }, [])
                  .map((n, i) =>
                    n === '...' ? (
                      <span key={`e${i}`} className="px-2 text-xs text-gray-400">…</span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-7 h-7 text-xs rounded border transition ${
                          n === safePage
                            ? 'bg-blue-700 text-white border-blue-700'
                            : 'border-gray-200 hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {n}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="px-3 py-1 text-xs rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-30 transition"
                >
                  {tr.next || 'Next →'}
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={safePage === totalPages}
                  className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-30 transition"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
