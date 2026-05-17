'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, ImagePlus, Save, Send } from 'lucide-react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CURRENCIES = ['USD', 'NPR', 'EUR', 'GBP']

export interface ListingInitialData {
  type: string
  title: string
  region: string
  district: string
  description: string
  culturalNote: string
  difficulty: string
  durationDays: number | null
  maxGroupSize: number | null
  maxAltitudeM: number | null
  pricePerPerson: number
  currency: string
  included: string[]
  excluded: string[]
  tags: string[]
  bestMonths: string[]
  isHiddenGem: boolean
  latitude: number | null
  longitude: number | null
  images: string[]
  status: string
}

interface Props {
  mode: 'create' | 'edit'
  listingId?: string
  userId: string
  initial?: Partial<ListingInitialData>
}

export default function ListingForm({ mode, listingId, userId, initial }: Props) {
  const router = useRouter()

  const [type,          setType]          = useState(initial?.type ?? 'trek')
  const [title,         setTitle]         = useState(initial?.title ?? '')
  const [region,        setRegion]        = useState(initial?.region ?? '')
  const [district,      setDistrict]      = useState(initial?.district ?? '')
  const [description,   setDescription]   = useState(initial?.description ?? '')
  const [culturalNote,  setCulturalNote]  = useState(initial?.culturalNote ?? '')
  const [difficulty,    setDifficulty]    = useState(initial?.difficulty ?? '')
  const [durationDays,  setDurationDays]  = useState(initial?.durationDays?.toString() ?? '')
  const [maxGroupSize,  setMaxGroupSize]  = useState(initial?.maxGroupSize?.toString() ?? '')
  const [maxAltitudeM,  setMaxAltitudeM]  = useState(initial?.maxAltitudeM?.toString() ?? '')
  const [price,         setPrice]         = useState(initial?.pricePerPerson?.toString() ?? '')
  const [currency,      setCurrency]      = useState(initial?.currency ?? 'USD')
  const [included,      setIncluded]      = useState<string[]>(initial?.included?.length ? initial.included : [''])
  const [excluded,      setExcluded]      = useState<string[]>(initial?.excluded?.length ? initial.excluded : [''])
  const [tags,          setTags]          = useState<string[]>(initial?.tags?.length ? initial.tags : [''])
  const [bestMonths,    setBestMonths]    = useState<string[]>(initial?.bestMonths ?? [])
  const [isHiddenGem,   setIsHiddenGem]   = useState(initial?.isHiddenGem ?? false)
  const [latitude,      setLatitude]      = useState(initial?.latitude?.toString() ?? '')
  const [longitude,     setLongitude]     = useState(initial?.longitude?.toString() ?? '')

  const [keptImages,    setKeptImages]    = useState<string[]>(initial?.images ?? [])
  const [newFiles,      setNewFiles]      = useState<File[]>([])
  const [newPreviews,   setNewPreviews]   = useState<string[]>([])

  const [busy,    setBusy]    = useState<'draft' | 'pending' | null>(null)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  const imageInputRef = useRef<HTMLInputElement>(null)

  const status       = initial?.status
  const isReadOnly   = status === 'approved' || status === 'pending'
  const totalImages  = keptImages.length + newFiles.length

  // ── Dynamic list helpers ──────────────────────────────────────────
  function updateItem(list: string[], set: (v: string[]) => void, i: number, val: string) {
    set(list.map((s, idx) => idx === i ? val : s))
  }
  function addItem(list: string[], set: (v: string[]) => void) {
    set([...list, ''])
  }
  function removeItem(list: string[], set: (v: string[]) => void, i: number) {
    set(list.length === 1 ? [''] : list.filter((_, idx) => idx !== i))
  }
  function toggleMonth(m: string) {
    setBestMonths(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  // ── Image handling ────────────────────────────────────────────────
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (totalImages + files.length > 10) { setError('Maximum 10 images allowed.'); return }
    setNewFiles(prev => [...prev, ...files])
    setNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }
  function removeKept(i: number) { setKeptImages(prev => prev.filter((_, idx) => idx !== i)) }
  function removeNew(i: number) {
    URL.revokeObjectURL(newPreviews[i])
    setNewFiles(prev => prev.filter((_, idx) => idx !== i))
    setNewPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  async function uploadNewImages(): Promise<string[]> {
    if (!newFiles.length) return []
    const supabase = createClient()
    const urls: string[] = []
    for (const file of newFiles) {
      const ext  = file.name.split('.').pop() ?? 'jpg'
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`
      const { error: upErr } = await supabase.storage.from('listing-images').upload(path, file)
      if (!upErr) {
        const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(path)
        urls.push(publicUrl)
      }
    }
    return urls
  }

  // ── Save handler ──────────────────────────────────────────────────
  async function save(newStatus: 'draft' | 'pending') {
    if (!title.trim())   { setError('Title is required.');                                   return }
    if (!region.trim())  { setError('Region is required.');                                  return }
    if (!price || Number(price) <= 0) { setError('A valid price per person is required.');   return }
    if (newStatus === 'pending' && !description.trim()) {
      setError('Please add a description before submitting for review.')
      return
    }

    setBusy(newStatus)
    setError('')
    setSuccess('')

    let uploaded: string[] = []
    try { uploaded = await uploadNewImages() }
    catch { setError('Image upload failed. Please try again.'); setBusy(null); return }

    const allImages = [...keptImages, ...uploaded]

    const payload = {
      type,
      title:          title.trim(),
      region:         region.trim(),
      district:       district.trim(),
      description:    description.trim(),
      culturalNote:   culturalNote.trim(),
      difficulty:     difficulty || null,
      durationDays:   durationDays  ? Number(durationDays)  : null,
      maxGroupSize:   maxGroupSize  ? Number(maxGroupSize)  : null,
      maxAltitudeM:   maxAltitudeM  ? Number(maxAltitudeM)  : null,
      pricePerPerson: Number(price),
      currency,
      included:       included.filter(s => s.trim()),
      excluded:       excluded.filter(s => s.trim()),
      tags:           tags.filter(s => s.trim()),
      bestMonths,
      isHiddenGem,
      latitude:       latitude  ? Number(latitude)  : null,
      longitude:      longitude ? Number(longitude) : null,
      images:         allImages,
      status:         newStatus,
    }

    const res = await fetch(
      mode === 'edit' ? `/api/host/listings/${listingId}` : '/api/host/listings',
      { method: mode === 'edit' ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    )
    const json = await res.json()

    if (!res.ok) { setError(json.error ?? 'Something went wrong.'); setBusy(null); return }

    // Commit uploaded images to kept state
    newPreviews.forEach(p => URL.revokeObjectURL(p))
    setNewFiles([])
    setNewPreviews([])
    setKeptImages(allImages)

    if (newStatus === 'draft') {
      setSuccess(mode === 'create' ? 'Draft saved!' : 'Changes saved!')
      if (mode === 'create' && json.id) router.replace(`/host/listings/${json.id}/edit`)
    } else {
      setSuccess('Submitted for review! Redirecting…')
      setTimeout(() => router.push('/host'), 1200)
    }
    setBusy(null)
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24">

      {/* Status banner */}
      {status && (
        <div className={`rounded-xl px-4 py-2.5 text-sm font-medium text-center ${
          status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          status === 'pending'  ? 'bg-amber-50  text-amber-700  border border-amber-200'    :
          status === 'rejected' ? 'bg-red-50    text-status-error border border-red-200'    :
                                  'bg-neutral-pale text-neutral-mid border border-neutral-light'
        }`}>
          {status === 'draft'    && 'Draft — not yet submitted for review'}
          {status === 'pending'  && 'Submitted — awaiting admin review. Editing locked.'}
          {status === 'approved' && '✓ Approved — visible in the app. Editing locked.'}
          {status === 'rejected' && 'Rejected — update the listing and resubmit.'}
        </div>
      )}

      {/* ── Section 1: Type ── */}
      <section className="bg-white rounded-2xl shadow-card p-5">
        <h2 className="text-sm font-bold text-neutral-charcoal mb-3">Listing type</h2>
        <div className="grid grid-cols-3 gap-3">
          {([
            { value: 'trek',       icon: '🏔', label: 'Trek'       },
            { value: 'homestay',   icon: '🏡', label: 'Homestay'   },
            { value: 'experience', icon: '🎭', label: 'Experience' },
          ] as const).map(({ value, icon, label }) => (
            <button key={value} type="button" disabled={isReadOnly} onClick={() => setType(value)}
              className={`rounded-xl border-2 p-3 text-center transition-all disabled:cursor-not-allowed ${
                type === value ? 'border-brand-green bg-brand-green-pale' : 'border-neutral-light hover:border-brand-green-light'
              }`}>
              <span className="text-2xl block mb-0.5">{icon}</span>
              <span className="text-xs font-semibold text-neutral-charcoal">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Section 2: Basic info ── */}
      <section className="bg-white rounded-2xl shadow-card p-5 space-y-4">
        <h2 className="text-sm font-bold text-neutral-charcoal">Basic information</h2>
        <div>
          <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} disabled={isReadOnly}
            placeholder={type === 'trek' ? '3-Day Langtang Valley Trek' : type === 'homestay' ? 'Traditional Gurung Homestay' : 'Thangka Painting Class'}
            className="input-field disabled:bg-neutral-pale disabled:text-neutral-mid" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Region *</label>
            <input type="text" value={region} onChange={e => setRegion(e.target.value)} disabled={isReadOnly}
              placeholder="e.g. Gandaki" className="input-field disabled:bg-neutral-pale" />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">District</label>
            <input type="text" value={district} onChange={e => setDistrict(e.target.value)} disabled={isReadOnly}
              placeholder="e.g. Gorkha" className="input-field disabled:bg-neutral-pale" />
          </div>
        </div>
      </section>

      {/* ── Section 3: Description ── */}
      <section className="bg-white rounded-2xl shadow-card p-5 space-y-4">
        <h2 className="text-sm font-bold text-neutral-charcoal">Description</h2>
        <div>
          <label className="text-xs font-semibold text-neutral-mid block mb-1.5">
            Description {!isReadOnly && <span className="text-status-error">* (required to submit)</span>}
          </label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={isReadOnly}
            rows={5} placeholder="Describe the experience in detail — the route, highlights, what travellers can expect…"
            className="input-field resize-none disabled:bg-neutral-pale" />
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Cultural note</label>
          <textarea value={culturalNote} onChange={e => setCulturalNote(e.target.value)} disabled={isReadOnly}
            rows={3} placeholder="Share cultural insights, customs, or local etiquette…"
            className="input-field resize-none disabled:bg-neutral-pale" />
        </div>
      </section>

      {/* ── Section 4: Details ── */}
      <section className="bg-white rounded-2xl shadow-card p-5 space-y-4">
        <h2 className="text-sm font-bold text-neutral-charcoal">Details</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Duration (days)</label>
            <input type="number" min="1" value={durationDays} onChange={e => setDurationDays(e.target.value)}
              disabled={isReadOnly} placeholder="e.g. 5" className="input-field disabled:bg-neutral-pale" />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Max group size</label>
            <input type="number" min="1" value={maxGroupSize} onChange={e => setMaxGroupSize(e.target.value)}
              disabled={isReadOnly} placeholder="e.g. 12" className="input-field disabled:bg-neutral-pale" />
          </div>
          {(type === 'trek' || type === 'experience') && (
            <div>
              <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} disabled={isReadOnly}
                className="input-field disabled:bg-neutral-pale">
                <option value="">Select</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          )}
          {type === 'trek' && (
            <div>
              <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Max altitude (m)</label>
              <input type="number" value={maxAltitudeM} onChange={e => setMaxAltitudeM(e.target.value)}
                disabled={isReadOnly} placeholder="e.g. 5364" className="input-field disabled:bg-neutral-pale" />
            </div>
          )}
        </div>

        {/* Best months */}
        <div>
          <label className="text-xs font-semibold text-neutral-mid block mb-2">Best months</label>
          <div className="grid grid-cols-6 gap-1.5">
            {MONTHS.map(m => (
              <button key={m} type="button" disabled={isReadOnly} onClick={() => toggleMonth(m)}
                className={`rounded-lg py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${
                  bestMonths.includes(m) ? 'bg-brand-green text-white' : 'bg-neutral-pale text-neutral-mid hover:bg-brand-green-pale hover:text-brand-green'
                }`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: Pricing ── */}
      <section className="bg-white rounded-2xl shadow-card p-5 space-y-4">
        <h2 className="text-sm font-bold text-neutral-charcoal">Pricing</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Price per person *</label>
            <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
              disabled={isReadOnly} placeholder="0.00" className="input-field disabled:bg-neutral-pale" />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} disabled={isReadOnly}
              className="input-field disabled:bg-neutral-pale">
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* ── Section 6: Included / Excluded ── */}
      <section className="bg-white rounded-2xl shadow-card p-5 space-y-5">
        <h2 className="text-sm font-bold text-neutral-charcoal">What&apos;s included / excluded</h2>

        {[
          { label: 'Included', list: included, set: setIncluded, ph: 'e.g. All meals, Permits, Guide' },
          { label: 'Excluded', list: excluded, set: setExcluded, ph: 'e.g. International flights, Insurance' },
        ].map(({ label, list, set, ph }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-neutral-mid">{label}</p>
              {!isReadOnly && (
                <button type="button" onClick={() => addItem(list, set)}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-green">
                  <Plus size={12} /> Add
                </button>
              )}
            </div>
            <div className="space-y-2">
              {list.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={item} disabled={isReadOnly}
                    onChange={e => updateItem(list, set, i, e.target.value)}
                    placeholder={ph}
                    className="input-field flex-1 disabled:bg-neutral-pale"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }} />
                  {!isReadOnly && (
                    <button type="button" onClick={() => removeItem(list, set, i)}
                      className="text-neutral-mid hover:text-status-error p-1 shrink-0 transition-colors">
                      <X size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Section 7: Photos ── */}
      <section className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-neutral-charcoal">Photos</h2>
          <span className="text-xs text-neutral-mid">{totalImages}/10</span>
        </div>

        {(keptImages.length > 0 || newPreviews.length > 0) && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
            {keptImages.map((url, i) => (
              <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-pale">
                <img src={url} alt="" className="w-full h-full object-cover" />
                {i === 0 && <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-full">Cover</span>}
                {!isReadOnly && (
                  <button type="button" onClick={() => removeKept(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors">
                    <X size={10} />
                  </button>
                )}
              </div>
            ))}
            {newPreviews.map((url, i) => (
              <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-pale">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 bg-brand-green/80 text-white text-[9px] px-1.5 py-0.5 rounded-full">New</span>
                <button type="button" onClick={() => removeNew(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors">
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {!isReadOnly && totalImages < 10 && (
          <>
            <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
            <button type="button" onClick={() => imageInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-neutral-light rounded-xl py-8 hover:border-brand-green-light transition-colors">
              <ImagePlus size={24} className="text-neutral-mid" />
              <p className="text-xs text-neutral-mid">
                Click to upload — <span className="text-brand-green font-semibold">Browse files</span>
              </p>
              <p className="text-[10px] text-neutral-mid">JPG, PNG, WEBP · up to 10 photos · first photo is the cover</p>
            </button>
          </>
        )}
        {isReadOnly && totalImages === 0 && (
          <p className="text-sm text-neutral-mid text-center py-4">No photos uploaded.</p>
        )}
      </section>

      {/* ── Section 8: Tags & Location ── */}
      <section className="bg-white rounded-2xl shadow-card p-5 space-y-4">
        <h2 className="text-sm font-bold text-neutral-charcoal">Tags & location</h2>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-neutral-mid">Tags</p>
            {!isReadOnly && (
              <button type="button" onClick={() => addItem(tags, setTags)}
                className="flex items-center gap-1 text-xs font-semibold text-brand-green">
                <Plus size={12} /> Add
              </button>
            )}
          </div>
          <div className="space-y-2">
            {tags.map((tag, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" value={tag} disabled={isReadOnly}
                  onChange={e => updateItem(tags, setTags, i, e.target.value)}
                  placeholder="e.g. remote, cultural, family-friendly"
                  className="input-field flex-1 disabled:bg-neutral-pale"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }} />
                {!isReadOnly && (
                  <button type="button" onClick={() => removeItem(tags, setTags, i)}
                    className="text-neutral-mid hover:text-status-error p-1 shrink-0 transition-colors">
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hidden gem toggle */}
        <button type="button" disabled={isReadOnly} onClick={() => setIsHiddenGem(!isHiddenGem)}
          className="flex items-center gap-3 disabled:cursor-not-allowed">
          <div className={`w-10 h-6 rounded-full transition-colors relative ${isHiddenGem ? 'bg-brand-green' : 'bg-neutral-light'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isHiddenGem ? 'translate-x-5' : 'translate-x-1'}`} />
          </div>
          <span className="text-sm text-neutral-charcoal font-medium">Mark as hidden gem 💎</span>
        </button>

        {/* Map coordinates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Latitude</label>
            <input type="number" step="0.000001" value={latitude} onChange={e => setLatitude(e.target.value)}
              disabled={isReadOnly} placeholder="e.g. 28.2096" className="input-field disabled:bg-neutral-pale" />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-mid block mb-1.5">Longitude</label>
            <input type="number" step="0.000001" value={longitude} onChange={e => setLongitude(e.target.value)}
              disabled={isReadOnly} placeholder="e.g. 84.1185" className="input-field disabled:bg-neutral-pale" />
          </div>
        </div>
      </section>

      {/* ── Feedback ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-xs text-status-error">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <p className="text-xs text-emerald-700 font-semibold">{success}</p>
        </div>
      )}

      {/* ── Sticky action bar ── */}
      {!isReadOnly && (
        <div className="fixed bottom-0 left-0 right-0 md:left-56 bg-white border-t border-neutral-light px-4 py-3 flex gap-3 z-40">
          <button type="button" onClick={() => save('draft')} disabled={!!busy}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-brand-green text-brand-green font-semibold text-sm disabled:opacity-60 hover:bg-brand-green-pale transition-colors">
            <Save size={15} />
            {busy === 'draft' ? 'Saving…' : 'Save draft'}
          </button>
          <button type="button" onClick={() => save('pending')} disabled={!!busy}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-green text-white font-semibold text-sm disabled:opacity-60 hover:opacity-90 transition-opacity">
            <Send size={15} />
            {busy === 'pending' ? 'Submitting…' : 'Submit for review'}
          </button>
        </div>
      )}

      {status === 'pending' && (
        <div className="text-center py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium">
          Listing submitted — awaiting admin review
        </div>
      )}
      {status === 'approved' && (
        <div className="text-center py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
          ✓ Approved and live in the app
        </div>
      )}
    </div>
  )
}
