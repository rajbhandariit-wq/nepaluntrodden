'use client'

import { useState } from 'react'
import { ArrowLeft, Send, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const conversations = [
  {
    id: 'c1',
    name: 'Ram Thapa',
    role: 'Guide',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop',
    lastMessage: 'Namaste! We meet at 7am at Gongabu bus park.',
    time: '2 min ago',
    unread: true,
    online: true,
    messages: [
      { from: 'them', text: 'Namaste! Looking forward to the trek.', time: '10:00 AM' },
      { from: 'me',   text: 'Me too! I am vegetarian, is that okay?', time: '10:05 AM' },
      { from: 'them', text: 'No problem at all! I will arrange dal bhat with extra vegetables.', time: '10:07 AM', translated: true },
      { from: 'me',   text: 'Perfect. What should I bring?', time: '10:10 AM' },
      { from: 'them', text: 'Warm jacket, trekking poles if you have them, and a good sleeping bag.', time: '10:12 AM', translated: true },
      { from: 'them', text: 'Namaste! We meet at 7am at Gongabu bus park.', time: '2 min ago', translated: true },
    ],
  },
  {
    id: 'c2',
    name: 'Sita Gurung',
    role: 'Homestay Host',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop',
    lastMessage: 'Your room is ready! Mountain view 🏔',
    time: 'Yesterday',
    unread: false,
    online: false,
    messages: [
      { from: 'them', text: 'Namaste! Welcome. Your room is ready.', time: 'Yesterday' },
      { from: 'them', text: 'Beautiful mountain view from your window!', time: 'Yesterday', translated: true },
    ],
  },
  {
    id: 'c3',
    name: 'Nepal Untrodden Support',
    role: 'Support',
    avatar: null,
    lastMessage: 'Booking confirmed — NEP-8723A',
    time: 'Oct 28',
    unread: false,
    online: true,
    messages: [
      { from: 'them', text: 'Your booking NEP-8723A has been confirmed. Have a great trip!', time: 'Oct 28' },
    ],
  },
]

export default function InboxPage() {
  const [active, setActive] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  const activeConv = conversations.find((c) => c.id === active)

  const ConversationList = () => (
    <>
      <div className="px-4 pt-12 md:pt-5 pb-4 border-b border-neutral-light">
        <h1 className="text-2xl font-bold text-neutral-charcoal" style={{ fontFamily: 'Lora, serif' }}>Inbox</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => setActive(conv.id)}
            className={cn(
              'w-full flex items-center gap-3 py-4 px-4 border-b border-neutral-light/60 text-left transition-colors',
              active === conv.id ? 'bg-brand-green-pale/40' : 'hover:bg-neutral-pale'
            )}
          >
            {conv.avatar ? (
              <div className="relative shrink-0">
                <img src={conv.avatar} alt={conv.name} className="w-12 h-12 rounded-full object-cover" />
                {conv.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-status-success rounded-full border-2 border-brand-cream" />
                )}
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center text-white font-bold shrink-0">N</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm ${conv.unread ? 'font-bold text-neutral-charcoal' : 'font-semibold text-neutral-charcoal'}`}>
                  {conv.name}
                </p>
                <p className="text-xs text-neutral-mid shrink-0">{conv.time}</p>
              </div>
              <p className="text-xs text-neutral-mid truncate">{conv.lastMessage}</p>
            </div>
            {conv.unread && (
              <span className="w-2 h-2 rounded-full bg-brand-green shrink-0" />
            )}
          </button>
        ))}
      </div>
    </>
  )

  const ChatPanel = ({ conv }: { conv: typeof conversations[0] }) => (
    <>
      {/* Chat header */}
      <div className="bg-white border-b border-neutral-light px-4 pt-12 md:pt-5 pb-3 flex items-center gap-3 shrink-0">
        <button onClick={() => setActive(null)} className="md:hidden">
          <ArrowLeft size={20} className="text-neutral-charcoal" />
        </button>
        {conv.avatar ? (
          <img src={conv.avatar} alt={conv.name} className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-brand-green flex items-center justify-center text-white font-bold text-sm">N</div>
        )}
        <div>
          <p className="font-semibold text-sm text-neutral-charcoal">{conv.name}</p>
          <p className="text-xs text-neutral-mid flex items-center gap-1">
            {conv.online && <span className="w-1.5 h-1.5 rounded-full bg-status-success inline-block" />}
            {conv.online ? 'Online' : 'Offline'} · {conv.role}
          </p>
        </div>
        <button className="ml-auto text-brand-green">
          <Globe size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-brand-cream">
        {conv.messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[78%] ${msg.from === 'me' ? 'bg-brand-green text-white' : 'bg-white text-neutral-charcoal border border-neutral-light'} rounded-2xl px-3.5 py-2.5 shadow-sm`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[10px] ${msg.from === 'me' ? 'text-white/70' : 'text-neutral-mid'}`}>{msg.time}</span>
                {'translated' in msg && msg.translated && (
                  <span className={`text-[10px] ${msg.from === 'me' ? 'text-white/70' : 'text-brand-green'} flex items-center gap-0.5`}>
                    <Globe size={9} /> Translated
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-neutral-light px-4 py-3 flex items-center gap-2 pb-safe">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-neutral-pale rounded-full px-4 py-2.5 text-sm outline-none text-neutral-charcoal placeholder:text-neutral-mid"
          onKeyDown={(e) => { if (e.key === 'Enter') setDraft('') }}
        />
        <button
          onClick={() => setDraft('')}
          className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center shrink-0 active:scale-90 transition-transform"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </>
  )

  const EmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div className="w-16 h-16 rounded-full bg-brand-green-pale flex items-center justify-center mb-4">
        <Send size={24} className="text-brand-green" />
      </div>
      <p className="font-semibold text-neutral-charcoal mb-1">Select a conversation</p>
      <p className="text-sm text-neutral-mid">Choose a guide or host from your inbox</p>
    </div>
  )

  return (
    /* Desktop: side-by-side panels | Mobile: single column (list or chat) */
    <div className="md:flex" style={{ height: '100dvh' }}>

      {/* Conversation list — mobile: shown when no active; desktop: always shown */}
      <div className={cn(
        'flex flex-col md:w-80 md:border-r md:border-neutral-light md:shrink-0',
        active ? 'hidden md:flex' : 'flex'
      )}>
        <ConversationList />
      </div>

      {/* Chat panel — mobile: shown when active; desktop: always shown (empty state if none) */}
      <div className={cn(
        'flex flex-col flex-1',
        active ? 'flex' : 'hidden md:flex'
      )}>
        {activeConv ? <ChatPanel conv={activeConv} /> : <EmptyState />}
      </div>
    </div>
  )
}
