import { useState } from 'react'
import { useLang } from '../context/LangContext'
import api from '../api'

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function RequestForm({ reload }) {
  const { tr } = useLang()
  const [title, setTitle]             = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority]       = useState('MEDIUM')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) {
      setError(tr.titleRequired)
      return
    }
    setLoading(true)
    setError('')

    api
      .post('/requests', { title: title.trim(), description: description.trim(), priority })
      .then(() => {
        setTitle('')
        setDescription('')
        setPriority('MEDIUM')
        reload()
      })
      .catch(() => setError(tr.createError))
      .finally(() => setLoading(false))
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl shadow-sm p-6 mb-4">
      <h3 className="text-base font-semibold text-gray-700 mb-4">{tr.newRequest}</h3>

      {error && (
        <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={tr.titlePlaceholder}
          maxLength={200}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={tr.descPlaceholder}
          maxLength={1000}
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PRIORITY_OPTIONS.map(p => (
            <option key={p} value={p}>
              {tr.priorityOptions?.[p] || p}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
        >
          {loading ? tr.creating : tr.createBtn}
        </button>
      </div>
    </form>
  )
}
