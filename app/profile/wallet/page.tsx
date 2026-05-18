'use client'

import Link from 'next/link'
import { ArrowLeft, CreditCard, Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

const transactions: { label: string; amount: number; date: string; type: 'in' | 'out' }[] = []

export default function WalletPage() {
  return (
    <div className="page-scroll">
      <div className="bg-brand-green pt-12 pb-5 px-4 flex items-center gap-3">
        <Link href="/profile" className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
          <ArrowLeft size={18} className="text-white" />
        </Link>
        <h1 className="text-white font-bold text-lg" style={{ fontFamily: 'Lora, serif' }}>Wallet & Payments</h1>
      </div>

      {/* Balance card */}
      <div className="mx-4 -mt-2 bg-white rounded-2xl shadow-card p-5 mb-5">
        <p className="text-xs text-neutral-mid mb-1">Available balance</p>
        <p className="text-4xl font-bold text-neutral-charcoal mb-4">$0.00</p>
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-brand-green text-white text-sm font-semibold">
            <Plus size={15} /> Add funds
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-neutral-light text-sm font-medium text-neutral-charcoal">
            <ArrowUpRight size={15} /> Withdraw
          </button>
        </div>
      </div>

      <div className="px-4">
        {/* Payment methods */}
        <p className="section-title mb-3">Payment methods</p>
        <div className="card p-4 mb-5">
          <button className="w-full flex items-center gap-3 text-brand-green">
            <div className="w-10 h-10 rounded-xl border-2 border-dashed border-brand-green/40 flex items-center justify-center">
              <Plus size={18} className="text-brand-green/60" />
            </div>
            <span className="text-sm font-semibold">Add credit or debit card</span>
          </button>
        </div>

        {/* Payment methods list placeholder */}
        <div className="card p-4 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-pale flex items-center justify-center">
            <CreditCard size={18} className="text-neutral-mid" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-charcoal">No cards saved yet</p>
            <p className="text-xs text-neutral-mid">Add a card to pay for bookings</p>
          </div>
        </div>

        {/* Transaction history */}
        <p className="section-title mb-3">Transaction history</p>
        {transactions.length === 0 ? (
          <div className="card p-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-pale flex items-center justify-center mb-3">
              <ArrowDownLeft size={20} className="text-neutral-mid" />
            </div>
            <p className="text-sm font-semibold text-neutral-charcoal mb-1">No transactions yet</p>
            <p className="text-xs text-neutral-mid">Your payment history will appear here</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            {transactions.map((t, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < transactions.length - 1 ? 'border-b border-neutral-light/60' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'in' ? 'bg-green-50' : 'bg-red-50'}`}>
                  {t.type === 'in' ? <ArrowDownLeft size={14} className="text-status-success" /> : <ArrowUpRight size={14} className="text-status-error" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-charcoal">{t.label}</p>
                  <p className="text-xs text-neutral-mid">{t.date}</p>
                </div>
                <p className={`text-sm font-semibold ${t.type === 'in' ? 'text-status-success' : 'text-status-error'}`}>
                  {t.type === 'in' ? '+' : '-'}${t.amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
