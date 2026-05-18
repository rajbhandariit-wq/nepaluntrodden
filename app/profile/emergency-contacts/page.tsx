'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Phone } from 'lucide-react'

interface Contact { id: string; name: string; phone: string; relationship: string }

const STORAGE_KEY = 'nu_emergency_contacts'

const blank = (): Contact => ({ id: Date.now().toString(), name: '', phone: '', relationship: '' })

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [form, setForm]         = useState<Contact | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setContacts(JSON.parse(raw))
    } catch {}
  }, [])

  const save = (list: Contact[]) => {
    setContacts(list)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }

  const submitForm = () => {
    if (!form || !form.name.trim() || !form.phone.trim()) return
    const existing = contacts.find(c => c.id === form.id)
    const updated = existing
      ? contacts.map(c => (c.id === form.id ? form : c))
      : [...contacts, form]
    save(updated)
    setForm(null)
  }

  const remove = (id: string) => save(contacts.filter(c => c.id !== id))

  const relationships = ['Parent', 'Spouse / Partner', 'Sibling', 'Friend', 'Other']

  return (
    <div className="page-scroll">
      <div className="bg-brand-green pt-12 pb-5 px-4 flex items-center gap-3">
        <Link href="/profile" className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
          <ArrowLeft size={18} className="text-white" />
        </Link>
        <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Lora, serif' }}>Emergency Contacts</h1>
      </div>

      <div className="px-4 py-5">
        <p className="text-xs text-neutral-mid mb-4">These contacts will be notified in case of an emergency during your trek or homestay.</p>

        {contacts.length > 0 && (
          <div className="card overflow-hidden mb-4">
            {contacts.map((c, i) => (
              <div key={c.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < contacts.length - 1 ? 'border-b border-neutral-light/60' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-brand-green-pale flex items-center justify-center shrink-0">
                  <Phone size={15} className="text-brand-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-charcoal">{c.name}</p>
                  <p className="text-xs text-neutral-mid">{c.relationship} · {c.phone}</p>
                </div>
                <button onClick={() => setForm(c)} className="text-xs text-brand-green font-semibold mr-2">Edit</button>
                <button onClick={() => remove(c.id)}>
                  <Trash2 size={15} className="text-status-error" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!form && (
          <button
            onClick={() => setForm(blank())}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-brand-green/30 text-brand-green text-sm font-semibold"
          >
            <Plus size={16} /> Add emergency contact
          </button>
        )}

        {form && (
          <div className="card p-4 space-y-3">
            <p className="text-sm font-semibold text-neutral-charcoal mb-1">{contacts.find(c => c.id === form.id) ? 'Edit contact' : 'New contact'}</p>
            <div>
              <label className="text-xs text-neutral-mid block mb-1">Full name *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Ram Sharma"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-light text-sm focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-mid block mb-1">Phone number *</label>
              <input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+977 98XXXXXXXX"
                type="tel"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-light text-sm focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-mid block mb-1">Relationship</label>
              <div className="flex flex-wrap gap-2">
                {relationships.map(r => (
                  <button
                    key={r}
                    onClick={() => setForm({ ...form, relationship: r })}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${form.relationship === r ? 'bg-brand-green text-white border-brand-green' : 'border-neutral-light text-neutral-mid'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setForm(null)} className="flex-1 py-2.5 rounded-xl border border-neutral-light text-sm font-medium text-neutral-mid">Cancel</button>
              <button onClick={submitForm} className="flex-1 py-2.5 rounded-xl bg-brand-green text-white text-sm font-semibold">Save</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
