'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, XCircle } from 'lucide-react'

const CONFIRM: Record<string, string> = {
  draft:    'Delete this draft? This cannot be undone.',
  pending:  'Withdraw this listing from review? It will be removed.',
  approved: 'Delete this live listing? This cannot be undone.',
}

export default function DeleteListingButton({ listingId, status }: { listingId: string; status: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    if (!confirm(CONFIRM[status] ?? 'Delete this listing?')) return
    setBusy(true)
    setError('')
    const res = await fetch(`/api/host/listings/${listingId}`, { method: 'DELETE' })
    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? 'Could not delete listing.')
      setBusy(false)
      return
    }
    router.refresh()
  }

  const isPending = status === 'pending'

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleDelete}
        disabled={busy}
        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium disabled:opacity-50 transition-colors ${
          isPending
            ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
            : 'border-neutral-light text-neutral-mid hover:border-status-error hover:text-status-error'
        }`}
      >
        {isPending ? <XCircle size={13} /> : <Trash2 size={13} />}
        {isPending ? 'Withdraw' : ''}
      </button>
      {error && <p className="text-xs text-status-error">{error}</p>}
    </div>
  )
}
