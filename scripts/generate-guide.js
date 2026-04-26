const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

// ─── Colours ────────────────────────────────────────────────────────────────
const GREEN       = '#2D6A4F'
const GREEN_LIGHT = '#40916C'
const GREEN_PALE  = '#D8F3DC'
const OCHRE       = '#C9903E'
const CREAM       = '#FAF7F2'
const CHARCOAL    = '#1A1A1A'
const MID_GREY    = '#6B7280'
const LIGHT_GREY  = '#D1D5DB'
const WHITE       = '#FFFFFF'
const RED         = '#E63946'

// ─── Page dimensions ────────────────────────────────────────────────────────
const W = 595.28   // A4 width  (points)
const H = 841.89   // A4 height (points)
const MARGIN = 48
const CONTENT_W = W - MARGIN * 2

const doc = new PDFDocument({ size: 'A4', margin: 0, info: {
  Title:   'Nepal Untrodden – App Navigation Guide',
  Author:  'Nepal Untrodden',
  Subject: 'Step-by-step guide for Travelers and Hosts',
} })

const outDir  = path.join(__dirname, '..', 'public')
const outFile = path.join(outDir, 'Nepal-Untrodden-App-Guide.pdf')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

const stream = fs.createWriteStream(outFile)
doc.pipe(stream)

// ─── Helpers ────────────────────────────────────────────────────────────────
let currentY = 0

function newPage() {
  doc.addPage()
  currentY = MARGIN
}

function ensureSpace(needed) {
  if (currentY + needed > H - MARGIN - 30) newPage()
}

function filledRect(x, y, w, h, color) {
  doc.save().rect(x, y, w, h).fill(color).restore()
}

function roundedRect(x, y, w, h, r, fillColor, strokeColor) {
  doc.save()
  doc.roundedRect(x, y, w, h, r)
  if (fillColor)  doc.fill(fillColor)
  if (strokeColor && !fillColor) doc.stroke(strokeColor)
  if (strokeColor && fillColor) { doc.fill(fillColor); doc.roundedRect(x, y, w, h, r).stroke(strokeColor) }
  doc.restore()
}

// ─── Cover page ─────────────────────────────────────────────────────────────
function drawCover() {
  // Full-page green background
  filledRect(0, 0, W, H, GREEN)

  // Decorative circle top-right
  doc.save().circle(W - 30, -30, 140).fillOpacity(0.08).fill(WHITE).restore()
  doc.save().circle(W + 10, 60, 90).fillOpacity(0.06).fill(WHITE).restore()

  // Decorative circle bottom-left
  doc.save().circle(-40, H + 20, 160).fillOpacity(0.07).fill(WHITE).restore()

  // Mountain silhouette (simple triangles)
  doc.save()
  doc.polygon([0, H * 0.72], [80, H * 0.52], [160, H * 0.68], [240, H * 0.44], [320, H * 0.62], [400, H * 0.38], [480, H * 0.56], [W, H * 0.45], [W, H], [0, H])
  .fillOpacity(0.10).fill(WHITE).restore()

  // Logo mark — compass circle
  const cx = MARGIN + 26, cy = 66
  doc.save().circle(cx, cy, 22).fillOpacity(0.2).fill(WHITE).restore()
  doc.save().fontSize(22).fillColor(WHITE).text('◎', cx - 12, cy - 13).restore()

  // App name
  doc.save()
    .fontSize(36).font('Helvetica-Bold').fillColor(WHITE)
    .text('Nepal Untrodden', MARGIN + 56, 48, { lineBreak: false })
  doc.restore()

  // Tagline
  doc.save()
    .fontSize(14).font('Helvetica').fillColor('rgba(255,255,255,0.75)')
    .text('Venture Beyond the Trails', MARGIN + 56, 88, { lineBreak: false })
  doc.restore()

  // Divider
  doc.save().moveTo(MARGIN, 118).lineTo(W - MARGIN, 118).strokeColor('rgba(255,255,255,0.2)').lineWidth(1).stroke().restore()

  // Document title block
  doc.save()
    .fontSize(11).font('Helvetica').fillColor('rgba(255,255,255,0.6)')
    .text('APP NAVIGATION GUIDE', MARGIN, 138, { characterSpacing: 2 })
  doc.restore()

  doc.save()
    .fontSize(28).font('Helvetica-Bold').fillColor(WHITE)
    .text('How to Use the App', MARGIN, 156, { width: CONTENT_W })
  doc.restore()

  doc.save()
    .fontSize(13).font('Helvetica').fillColor('rgba(255,255,255,0.8)')
    .text('Step-by-step instructions for Travelers and Local Hosts', MARGIN, 196, { width: CONTENT_W })
  doc.restore()

  // Two audience cards
  const cardY = 250, cardH = 110, gap = 16, cardW = (CONTENT_W - gap) / 2

  // Traveler card
  doc.save().roundedRect(MARGIN, cardY, cardW, cardH, 12).fillOpacity(0.15).fill(WHITE).restore()
  doc.save().fontSize(28).text('🧳', MARGIN + 16, cardY + 14).restore()
  doc.save().fontSize(14).font('Helvetica-Bold').fillColor(WHITE).text('For Travelers', MARGIN + 16, cardY + 52).restore()
  doc.save().fontSize(10).font('Helvetica').fillColor('rgba(255,255,255,0.75)').text('Discover · Book · Trek', MARGIN + 16, cardY + 70).restore()
  doc.save().fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.6)').text('Page 3', MARGIN + 16, cardY + 88).restore()

  // Host card
  const hx = MARGIN + cardW + gap
  doc.save().roundedRect(hx, cardY, cardW, cardH, 12).fillOpacity(0.15).fill(WHITE).restore()
  doc.save().fontSize(28).text('🏠', hx + 16, cardY + 14).restore()
  doc.save().fontSize(14).font('Helvetica-Bold').fillColor(WHITE).text('For Hosts & Guides', hx + 16, cardY + 52).restore()
  doc.save().fontSize(10).font('Helvetica').fillColor('rgba(255,255,255,0.75)').text('List · Manage · Earn', hx + 16, cardY + 70).restore()
  doc.save().fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.6)').text('Page 9', hx + 16, cardY + 88).restore()

  // Quick-access URL box
  doc.save().roundedRect(MARGIN, 382, CONTENT_W, 44, 10).fillOpacity(0.12).fill(WHITE).restore()
  doc.save().fontSize(11).font('Helvetica').fillColor('rgba(255,255,255,0.7)').text('🌐  Access the app at:', MARGIN + 16, 392).restore()
  doc.save().fontSize(12).font('Helvetica-Bold').fillColor(WHITE).text('http://localhost:3100', MARGIN + 152, 392).restore()

  // Section overview
  const sections = [
    ['🧭', 'Discover',  'Browse hidden gems & treks'],
    ['🗺️', 'Map',       'Explore all listings on a live map'],
    ['🎒', 'Trips',     'Manage upcoming & past bookings'],
    ['💬', 'Inbox',     'Chat with guides and hosts'],
    ['👤', 'Profile',   'Badges, wallet & settings'],
  ]
  doc.save().fontSize(10).font('Helvetica-Bold').fillColor('rgba(255,255,255,0.55)').text('APP SECTIONS', MARGIN, 446, { characterSpacing: 1.5 }).restore()

  sections.forEach(([emoji, name, desc], i) => {
    const row = 464 + i * 28
    doc.save().fontSize(13).text(emoji, MARGIN, row - 1).restore()
    doc.save().fontSize(11).font('Helvetica-Bold').fillColor(WHITE).text(name, MARGIN + 24, row).restore()
    doc.save().fontSize(10).font('Helvetica').fillColor('rgba(255,255,255,0.6)').text(desc, MARGIN + 24 + 70, row).restore()
  })

  // Footer
  doc.save()
    .moveTo(MARGIN, H - 60).lineTo(W - MARGIN, H - 60)
    .strokeColor('rgba(255,255,255,0.15)').lineWidth(1).stroke()
  .restore()
  doc.save().fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.45)')
    .text('Nepal Untrodden  ·  App Navigation Guide  ·  Version 1.0  ·  April 2026', MARGIN, H - 46, { width: CONTENT_W, align: 'center' })
  .restore()
}

// ─── Section divider page ────────────────────────────────────────────────────
function drawSectionPage(emoji, title, subtitle, accentColor) {
  doc.addPage()
  filledRect(0, 0, W, H, accentColor)

  // Decorative circles
  doc.save().circle(W - 60, -60, 180).fillOpacity(0.07).fill(WHITE).restore()
  doc.save().circle(-50, H - 60, 200).fillOpacity(0.06).fill(WHITE).restore()

  // Centre content
  doc.save().fontSize(72).text(emoji, W / 2 - 44, H / 2 - 110).restore()
  doc.save().fontSize(32).font('Helvetica-Bold').fillColor(WHITE)
    .text(title, MARGIN, H / 2 - 28, { width: CONTENT_W, align: 'center' })
  .restore()
  doc.save().fontSize(14).font('Helvetica').fillColor('rgba(255,255,255,0.75)')
    .text(subtitle, MARGIN, H / 2 + 18, { width: CONTENT_W, align: 'center' })
  .restore()

  // Footer line
  doc.save().moveTo(MARGIN, H - 55).lineTo(W - MARGIN, H - 55).strokeColor('rgba(255,255,255,0.2)').lineWidth(1).stroke().restore()
  doc.save().fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.45)')
    .text('Nepal Untrodden  ·  App Navigation Guide', MARGIN, H - 40, { width: CONTENT_W, align: 'center' })
  .restore()

  currentY = MARGIN
}

// ─── Content page header ─────────────────────────────────────────────────────
function drawContentHeader(label, color = GREEN) {
  filledRect(0, 0, W, 52, color)
  doc.save().fontSize(9).font('Helvetica').fillColor('rgba(255,255,255,0.65)')
    .text('NEPAL UNTRODDEN  ·  APP GUIDE', MARGIN, 14, { characterSpacing: 1.5 })
  .restore()
  doc.save().fontSize(12).font('Helvetica-Bold').fillColor(WHITE)
    .text(label, W - MARGIN - 200, 14, { width: 200, align: 'right' })
  .restore()
  currentY = 68
}

// ─── Page footer ─────────────────────────────────────────────────────────────
function drawFooter(pageNum) {
  doc.save()
    .moveTo(MARGIN, H - 36).lineTo(W - MARGIN, H - 36)
    .strokeColor(LIGHT_GREY).lineWidth(0.5).stroke()
  .restore()
  doc.save().fontSize(8).font('Helvetica').fillColor(MID_GREY)
    .text('Nepal Untrodden  ·  App Navigation Guide', MARGIN, H - 25)
    .text(`Page ${pageNum}`, W - MARGIN - 40, H - 25)
  .restore()
}

// ─── Step block ──────────────────────────────────────────────────────────────
function drawStep(num, title, lines, tips, pageNum) {
  // Height estimate
  const lineH = 16
  const bodyH = lines.length * lineH + (tips ? tips.length * 16 + 8 : 0)
  const totalH = 32 + bodyH + 28

  ensureSpace(totalH)

  const x = MARGIN
  const y = currentY
  const w = CONTENT_W

  // Card background
  doc.save().roundedRect(x, y, w, totalH, 8).fill(WHITE)
    .roundedRect(x, y, w, totalH, 8).strokeColor(LIGHT_GREY).lineWidth(0.5).stroke()
  .restore()

  // Step number badge
  doc.save().circle(x + 22, y + 22, 14).fill(GREEN).restore()
  doc.save().fontSize(10).font('Helvetica-Bold').fillColor(WHITE)
    .text(String(num), x + 22 - (num > 9 ? 7 : 5), y + 16)
  .restore()

  // Step title
  doc.save().fontSize(12).font('Helvetica-Bold').fillColor(CHARCOAL)
    .text(title, x + 44, y + 15, { width: w - 54, lineBreak: false })
  .restore()

  // Divider
  doc.save().moveTo(x + 44, y + 31).lineTo(x + w - 8, y + 31).strokeColor(LIGHT_GREY).lineWidth(0.4).stroke().restore()

  let iy = y + 37
  lines.forEach((line) => {
    const bullet = line.startsWith('•') || line.startsWith('→') || line.startsWith('◆')
    if (bullet) {
      doc.save().fontSize(7).fillColor(GREEN).text('●', x + 44, iy + 3).restore()
      doc.save().fontSize(10).font('Helvetica').fillColor(CHARCOAL).text(line.replace(/^[•→◆]\s*/, ''), x + 56, iy, { width: w - 68 }).restore()
    } else {
      doc.save().fontSize(10).font('Helvetica').fillColor(CHARCOAL).text(line, x + 44, iy, { width: w - 54 }).restore()
    }
    iy += lineH
  })

  if (tips && tips.length) {
    iy += 6
    doc.save().roundedRect(x + 44, iy, w - 54, tips.length * 16 + 6, 4).fill(GREEN_PALE).restore()
    tips.forEach((tip, ti) => {
      doc.save().fontSize(9).font('Helvetica').fillColor(GREEN_LIGHT)
        .text('💡 ' + tip, x + 50, iy + 4 + ti * 16, { width: w - 64 })
      .restore()
    })
    iy += tips.length * 16 + 6
  }

  currentY = y + totalH + 12
  drawFooter(pageNum)
}

// ─── Section heading ─────────────────────────────────────────────────────────
function drawSectionHeading(emoji, title, subtitle, bgColor = GREEN_PALE, textColor = GREEN) {
  ensureSpace(80)
  const x = MARGIN, y = currentY, w = CONTENT_W
  doc.save().roundedRect(x, y, w, 66, 10).fill(bgColor).restore()
  doc.save().fontSize(26).text(emoji, x + 16, y + 10).restore()
  doc.save().fontSize(15).font('Helvetica-Bold').fillColor(textColor)
    .text(title, x + 56, y + 14, { width: w - 70 })
  .restore()
  doc.save().fontSize(10).font('Helvetica').fillColor(MID_GREY)
    .text(subtitle, x + 56, y + 36, { width: w - 70 })
  .restore()
  currentY += 80
}

// ─── Info box ────────────────────────────────────────────────────────────────
function drawInfoBox(emoji, text, color = GREEN_PALE, textColor = GREEN) {
  ensureSpace(40)
  const h = Math.max(38, Math.ceil(text.length / 72) * 14 + 18)
  doc.save().roundedRect(MARGIN, currentY, CONTENT_W, h, 8).fill(color).restore()
  doc.save().fontSize(11).text(emoji, MARGIN + 12, currentY + (h / 2) - 9).restore()
  doc.save().fontSize(10).font('Helvetica').fillColor(textColor)
    .text(text, MARGIN + 34, currentY + (h / 2) - 7, { width: CONTENT_W - 46 })
  .restore()
  currentY += h + 10
}

// ─── Table of contents ───────────────────────────────────────────────────────
function drawTOC() {
  doc.addPage()
  drawContentHeader('Table of Contents')
  drawFooter(2)

  doc.save().fontSize(20).font('Helvetica-Bold').fillColor(CHARCOAL)
    .text('Table of Contents', MARGIN, currentY)
  .restore()
  currentY += 34

  const sections = [
    { label: 'PART 1 — FOR TRAVELERS',  color: GREEN,  items: [
      ['Getting Started',           '3'],
      ['Discovering Experiences',   '3'],
      ['Viewing a Listing',         '4'],
      ['The Booking Flow (7 Steps)','5'],
      ['Pre-Trip Preparation',      '6'],
      ['During Your Trek',          '7'],
      ['After Your Trip',           '7'],
    ]},
    { label: 'PART 2 — FOR HOSTS & GUIDES', color: OCHRE, items: [
      ['Creating Your Account',     '9'],
      ['Setting Up Your Profile',   '9'],
      ['Creating a Listing',        '10'],
      ['Managing Booking Requests', '11'],
      ['Managing Your Calendar',    '11'],
      ['Running the Trip',          '12'],
      ['Getting Paid',              '12'],
    ]},
    { label: 'QUICK REFERENCE', color: MID_GREY, items: [
      ['Bottom Navigation Tabs',    '13'],
      ['Emergency SOS',             '13'],
      ['Offline Mode Guide',        '14'],
      ['Payment Methods',           '14'],
    ]},
  ]

  sections.forEach(({ label, color, items }) => {
    ensureSpace(30 + items.length * 26)

    // Section header
    doc.save().roundedRect(MARGIN, currentY, CONTENT_W, 26, 6).fill(color).restore()
    doc.save().fontSize(9).font('Helvetica-Bold').fillColor(WHITE)
      .text(label, MARGIN + 12, currentY + 8, { characterSpacing: 0.8 })
    .restore()
    currentY += 30

    items.forEach(([name, page], i) => {
      const bg = i % 2 === 0 ? '#F9FAFB' : WHITE
      doc.save().rect(MARGIN, currentY, CONTENT_W, 24).fill(bg).restore()
      doc.save().fontSize(11).font('Helvetica').fillColor(CHARCOAL)
        .text(name, MARGIN + 12, currentY + 6)
      .restore()
      // Dot leader
      const dotStart = MARGIN + 12 + doc.widthOfString(name, { fontSize: 11 }) + 6
      doc.save().fontSize(9).fillColor(LIGHT_GREY)
        .text('· · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·', dotStart, currentY + 8, { width: W - MARGIN * 2 - 60 - dotStart + MARGIN, lineBreak: false })
      .restore()
      doc.save().fontSize(11).font('Helvetica-Bold').fillColor(color)
        .text(page, W - MARGIN - 28, currentY + 6)
      .restore()
      currentY += 24
    })
    currentY += 12
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
//  BUILD THE PDF
// ═══════════════════════════════════════════════════════════════════════════════

// Cover
drawCover()

// TOC
drawTOC()

// ─── PART 1: TRAVELER ───────────────────────────────────────────────────────
drawSectionPage('🧳', 'Part 1: For Travelers', 'Discover · Book · Trek · Review', GREEN)

// Page 3 — Getting Started + Discover
doc.addPage()
drawContentHeader('Part 1 — Traveler Guide', GREEN)
drawFooter(3)

drawSectionHeading('🚀', 'Getting Started', 'Sign up and personalise your feed in under 2 minutes')
drawStep(1, 'Open the App', [
  'Navigate to http://localhost:3100 in your browser',
  '• On mobile, add to your Home Screen for a native feel',
  '• The splash screen shows "Venture Beyond the Trails"',
], ['The app works best in Chrome, Safari, or Firefox on mobile width.'], 3)

drawStep(2, 'Create Your Account', [
  '• Tap Sign Up on the welcome screen',
  '• Choose: Email/Password, Google sign-in, or Phone OTP',
  '• Enter your name, email address (or phone number)',
  '• Agree to the Terms & Privacy Policy, then tap Continue',
], ['Use Phone OTP if you don\'t have easy email access — it\'s just as fast.'], 3)

drawStep(3, 'Select Your Role', [
  '• Tap  🧳 I\'m a Traveler  (this is the Traveler guide)',
  '• This determines which screens and features you see',
  '• You can switch roles later in Profile → Settings',
], null, 3)

drawStep(4, 'Set Your Preferences (Optional)', [
  '• Choose interests: Trekking, Village stays, Culture, Food, Photography...',
  '• Set your preferred trek difficulty (Easy → Expert)',
  '• Set your daily budget range',
  '• Tap Done  — or  Skip  to go straight to the feed',
], ['Setting preferences now means your Discover feed shows relevant suggestions immediately.'], 3)

// Page 4 — Discovering + Listing
doc.addPage()
drawContentHeader('Part 1 — Traveler Guide', GREEN)
drawFooter(4)

drawSectionHeading('🧭', 'Discovering Experiences', 'Browse the Discover feed — your gateway to off-path Nepal')

drawStep(5, 'Browse the Discover Feed', [
  '• The Discover tab (compass icon) opens automatically after login',
  '• Scroll down to see Trek, Homestay and Experience cards',
  '• The top card is the "Hidden Gem of the Week" — always worth a look',
  '• Tap the  🎲 Surprise Me  button to see a random hidden trail',
], ['Pull down to refresh the feed. New listings are added weekly.'], 4)

drawStep(6, 'Search & Filter', [
  '• Tap the search bar and type a destination, guide name, or region',
  '→ Examples: "Dolpa", "Ram", "Sindhupalchok"',
  '• Use the filter chips below the search bar:',
  '  — Treks / Homestays / Experiences  (by type)',
  '  — Easy / Moderate / Hard  (by difficulty)',
  '• Tap a chip once to activate it; tap again to clear',
], ['Combining a text search with a filter chip gives the most precise results.'], 4)

drawStep(7, 'Save to Wishlist', [
  '• Tap the ❤ heart icon on any card to save it for later',
  '• View all saved listings in Profile → Wishlist',
  '• You\'ll be notified if a wishlisted item becomes unavailable',
], null, 4)

drawSectionHeading('🔍', 'Viewing a Listing', 'Everything you need to know before you book')

drawStep(8, 'Open a Listing Detail Page', [
  '• Tap anywhere on a card to open the full detail page',
  '• Swipe the photo carousel left/right to see all images',
  '• Tap any thumbnail at the bottom of the photo to jump to it',
], null, 4)

drawStep(9, 'Check the Guide or Host Profile', [
  '• The guide/host block shows: photo, rating, experience, languages',
  '• Look for these trust badges:',
  '  🛡 Gov ID — government-issued guide licence verified',
  '  🩺 First Aid — wilderness first-aid certified',
  '  🤝 Co-op — member of a local cooperative',
  '• Tap  View →  to see the full profile and all reviews',
], ['All guides with a Gov ID badge have been manually reviewed by our team.'], 4)

// Page 5 — Booking Flow
doc.addPage()
drawContentHeader('Part 1 — Traveler Guide', GREEN)
drawFooter(5)

drawSectionHeading('📅', 'The Booking Flow', 'Seven simple steps to secure your experience')

drawInfoBox('ℹ️', 'Tap  Request to Book  at the bottom of any listing detail page to begin. You can go back to any earlier step at any time.', GREEN_PALE, GREEN)

drawStep(10, 'Step 1 — Select Dates', [
  '• Tap Start date and choose your arrival day from the calendar',
  '• Tap End date and choose your last day',
  '• Greyed-out dates are already booked or blocked by the host',
  '• The "Best months" panel shows ideal visiting windows',
  '• Tap  Continue →  when your dates are selected',
], null, 5)

drawStep(11, 'Step 2 — Number of Travelers', [
  '• Tap  +  to increase adults (age 18+); tap  −  to decrease',
  '• Add children (under 12) separately using the second row',
  '• The maximum group size is shown — don\'t exceed it',
], ['Children typically travel free or at reduced rates — confirm with your host after booking.'], 5)

drawStep(12, 'Step 3 — Optional Add-ons', [
  '• Porter  ($10/day) — carries up to 25 kg of your gear',
  '• Sleeping bag rental  ($15 total) — high-altitude rated, −10°C',
  '• Cooking class  ($20) — learn to cook dal bhat with your host',
  '• Satellite messenger  ($30) — Garmin inReach rental for remote treks',
  '• Tap any add-on card to toggle it on/off; the price updates instantly',
], null, 5)

drawStep(13, 'Step 4 — Review Price Breakdown', [
  '• Check every line item: base price, add-ons, platform fee (10%), insurance',
  '• The green box shows how much goes directly to your guide/host',
  '• Toggle  Add booking insurance  to cover cancellation & evacuation (+5%)',
  '• Tap  Continue →  when you are satisfied',
], ['The platform fee (10%) is our only charge to you. Hosts keep 88–90% of the base price.'], 5)

drawStep(14, 'Step 5 — Message to Host (Optional)', [
  '• Type any notes for your host: dietary needs, fitness level, special requests',
  '• Maximum 300 characters',
  '• Tap  Skip  if you have nothing to add',
], null, 5)

drawStep(15, 'Step 6 — Choose Payment Method', [
  '• Credit / Debit card — Visa, Mastercard, Amex (via Stripe)',
  '• eSewa — Nepal\'s most widely used digital wallet',
  '• Khalti — second major Nepal digital wallet',
  '• Bank transfer — details sent after confirmation',
  '• Pay on arrival — cash only, for remote areas without connectivity',
  '• Tap your preferred method, then  Confirm Booking',
], ['Card payments are secured by Stripe. We never store your card details.'], 5)

drawStep(16, 'Step 7 — Booking Confirmed', [
  '• A green confirmation screen shows your Booking ID (e.g. NEP-8723A)',
  '• Your guide is notified immediately',
  '• The booking appears in the  My Trips  tab',
  '• Tap  Download Offline Pack  to save maps and contacts for the trail',
], null, 5)

// Page 6 — Pre-trip
doc.addPage()
drawContentHeader('Part 1 — Traveler Guide', GREEN)
drawFooter(6)

drawSectionHeading('🎒', 'Pre-Trip Preparation', 'Everything you need before you leave for the trailhead')

drawStep(17, 'Access Your Trip Details', [
  '• Go to the  Trips  tab (backpack icon in the bottom nav)',
  '• Your confirmed booking appears under  Upcoming',
  '• Tap  View →  to open the full trip detail screen',
], null, 6)

drawStep(18, 'Download Your Offline Pack', [
  '• Tap  Download Offline Pack  on the trip detail or confirmation screen',
  '• The pack includes:',
  '  → GPX trail map with offline markers (works without internet)',
  '  → Emergency contacts (guide, nearest hospital, police)',
  '  → Meeting point with map pin and time',
  '  → 30 essential Nepali phrases with transliteration',
  '• Download while on Wi-Fi before heading to the trailhead',
], ['The offline pack is your safety lifeline in areas with no mobile signal. Download it before you leave the city.'], 6)

drawStep(19, 'Check the Weather Alert', [
  '• From the trip detail screen, the weather widget shows a daily forecast',
  '• If severe weather is predicted, you\'ll receive a push notification',
  '• Refresh requires an internet connection — check before leaving Kathmandu',
], null, 6)

drawStep(20, 'Chat With Your Guide', [
  '• Tap  Chat guide  or go to the Inbox tab and select your guide\'s conversation',
  '• Messages are automatically translated (English ↔ Nepali)',
  '• You can share photos, your meeting point, and ask last-minute questions',
  '• Tap the 🌐 globe icon in the chat to toggle translation on/off',
], ['If you have no signal on the trail, messages are queued and sent automatically when you reconnect.'], 6)

drawSectionHeading('🏔️', 'During Your Trek', 'Stay safe and connected on the trail')

drawStep(21, 'Guide Check-In', [
  '• When you meet your guide at the agreed meeting point, they will:',
  '  → Open their app and tap  Check In Guest',
  '  → Show you a QR code or tap a location-based check-in',
  '• This officially starts your trip and releases the payment to the guide',
], null, 6)

drawStep(22, 'View Daily Logs', [
  '• Your guide posts a photo and brief note each evening',
  '• These are visible in  My Trips → Trip Detail → Daily Log',
  '• Your emergency contact at home can also view them via a shared link',
  '• If no log is posted for 24 hours, both you and the platform are alerted',
], null, 6)

drawStep(23, 'Use the Emergency SOS Button', [
  '• The red SOS button is visible in  My Trips → Trip Detail',
  '• Hold the button for 3 seconds to activate (prevents accidental triggers)',
  '• On activation, the app will:',
  '  → Call the nearest local emergency number',
  '  → Send an SMS to your registered emergency contact with your GPS location',
  '  → Send your guide\'s phone number to your emergency contact',
  '• Works via device SMS even without mobile data',
], ['Register your emergency contact before leaving: Profile → Emergency Contacts.'], 6)

// Page 7 — After trip
doc.addPage()
drawContentHeader('Part 1 — Traveler Guide', GREEN)
drawFooter(7)

drawSectionHeading('⭐', 'After Your Trip', 'Leave a review and see your community impact')

drawStep(24, 'Trip Completion', [
  '• Your guide marks the trip  Completed  in their app on the final day',
  '• You receive a push notification: "Rate your experience"',
  '• The trip moves from  Upcoming  to  Past  in the Trips tab',
], null, 7)

drawStep(25, 'Leave a Review', [
  '• Go to  Trips → Past  and tap  Write Review  next to your completed trip',
  '• Rate your experience: 1–5 stars (required)',
  '• Write a comment (optional but hugely valuable for future travelers)',
  '• Upload a photo from your trek (optional)',
  '• Add a tip for your guide — sent directly to their wallet',
], ['Your review is the most important thing you can do for the local guide\'s future income.'], 7)

drawStep(26, 'View Your Impact Summary', [
  '• After the review, an impact report is generated automatically',
  '• It shows:',
  '  → Exact amount paid to your guide/host (in NPR)',
  '  → Percentage contributed to the local community fund',
  '  → Carbon offset contribution (if you opted in)',
  '• Share the impact card on social media from the share button',
], null, 7)

drawStep(27, 'Collect Your Badges & Discount', [
  '• Badges unlock based on your trip history:',
  '  🥾 Trail Seeker — complete your first trip',
  '  🏛️ Culture Lover — 3+ trips with cultural listings',
  '  🌱 Eco Traveler — opt into carbon offset',
  '  ⛰️ Altitude Chaser — trek above 3,500m',
  '• Each new badge gives a 10% discount code (valid 90 days)',
  '• View all badges in  Profile → My Badges',
], null, 7)

drawInfoBox('🔁', 'Ready for your next adventure? Tap the  Explore now →  button in the impact report, or return to the Discover tab to browse more hidden trails.', GREEN_PALE, GREEN)

// ─── PART 2: HOST / GUIDE ───────────────────────────────────────────────────
drawSectionPage('🏠', 'Part 2: For Hosts & Guides', 'List · Manage · Earn', OCHRE)

// Page 9 — Host: Getting started
doc.addPage()
drawContentHeader('Part 2 — Host & Guide Guide', OCHRE)
drawFooter(9)

drawSectionHeading('🚀', 'Creating Your Account', 'Get set up in minutes — we\'ll help every step', '#FFF7ED', OCHRE)

drawStep(1, 'Open the App & Sign Up', [
  '• Go to http://localhost:3100',
  '• Tap  Sign Up  and enter your name and phone number',
  '• Receive a one-time password (OTP) by SMS — enter it to verify',
  '• You can also sign up with email or Google',
], ['Phone OTP is the easiest option if you have limited email access.'], 9)

drawStep(2, 'Select Your Role', [
  '• Tap  🏠 I\'m a Homestay Host  OR  🥾 I\'m a Guide',
  '• Homestay Host — you offer accommodation and/or experiences',
  '• Guide — you lead trekking or cultural tours',
  '• You can hold both roles from the same account',
], null, 9)

drawStep(3, 'Set Your Language', [
  '• After sign-up, go to  Profile → Language',
  '• Switch to  नेपाली  if you prefer to use the app in Nepali',
  '• The core host actions (Accept, Decline, Check-in, Withdraw) use',
  '  large icon buttons with Nepali labels — minimal reading required',
], null, 9)

drawSectionHeading('🛂', 'Setting Up Your Profile', 'A complete profile earns 3× more bookings', '#FFF7ED', OCHRE)

drawStep(4, 'Add Your Profile Photo & Bio', [
  '• Go to  Profile → Edit Profile',
  '• Upload a clear, smiling profile photo (tap the avatar circle)',
  '• Write a short bio: your experience, what makes your place/trek special',
  '• Add the languages you speak',
], ['Hosts with a photo and bio receive significantly more booking inquiries.'], 9)

drawStep(5, 'Upload Verification Documents', [
  '• Go to  Profile → ID Verification',
  '• Upload the following (JPG, PNG or PDF, max 10 MB each):',
  '  🪪 Government-issued guide licence (guides only)',
  '  🩺 First-aid certificate (Wilderness First Responder preferred)',
  '  🔒 Police clearance certificate',
  '• Tap  Submit for Review',
  '• Our team reviews documents within 48 hours',
  '• On approval, a  ✓ Verified  badge appears on your profile',
], ['Your documents are encrypted and only viewed by our verification team. They are never shared publicly.'], 9)

// Page 10 — Creating a listing
doc.addPage()
drawContentHeader('Part 2 — Host & Guide Guide', OCHRE)
drawFooter(10)

drawSectionHeading('📝', 'Creating a Listing', 'Your listing is your storefront — make it shine', '#FFF7ED', OCHRE)

drawStep(6, 'Create a New Listing', [
  '• Go to  Profile → Edit availability  (or from the Dashboard)',
  '• Tap  + New Listing',
  '• Choose a listing type:',
  '  🥾 Trek — guided multi-day trekking route',
  '  🏠 Homestay — accommodation in your home',
  '  🎨 Experience — cooking class, cultural tour, farm visit, etc.',
], null, 10)

drawStep(7, 'Fill In the Listing Details', [
  '• Title — clear and descriptive (e.g. "Panch Pokhari Trek – 6 days")',
  '• Region and District — used for map placement and search',
  '• Description — tell the story of your place or route (200+ words)',
  '• Difficulty (treks only): Easy / Moderate / Hard / Expert',
  '• Duration in days',
  '• Maximum group size (be realistic — don\'t overbook)',
  '• Price per person per night (homestay) or per day (guide)',
], ['Write your description in Nepali if that is easier — our team will help with English translation.'], 10)

drawStep(8, 'Add Photos', [
  '• Upload at least 3 photos (minimum required for listing approval)',
  '• Include: the route/exterior, a room or trail highlight, your family/team',
  '• Portrait (vertical) photos work best on the card feed',
  '• Tap and hold a photo to reorder; tap the star to set the cover image',
], ['Good lighting makes a huge difference. Take photos in the morning or late afternoon.'], 10)

drawStep(9, 'Set Inclusions, Exclusions & Cultural Note', [
  '• Inclusions: what is covered in the price (meals, permits, guide, etc.)',
  '• Exclusions: what the traveler must bring or pay separately',
  '• Cultural Note: any dress codes, religious etiquette, photography rules',
  '  — This is displayed prominently on the listing and reassures travelers',
], null, 10)

drawStep(10, 'Set Best Months', [
  '• Select the months when your listing is best experienced',
  '• These appear as a calendar on the listing detail and in search filters',
  '• Be honest — recommending monsoon months for a high-altitude trek',
  '  will result in bad reviews',
], null, 10)

drawStep(11, 'Submit for Review', [
  '• Tap  Submit Listing',
  '• Our editorial team reviews it within 48 hours',
  '• You will receive a notification when it goes live',
  '• You can edit the listing at any time after approval',
], null, 10)

// Page 11 — Managing bookings + calendar
doc.addPage()
drawContentHeader('Part 2 — Host & Guide Guide', OCHRE)
drawFooter(11)

drawSectionHeading('📬', 'Managing Booking Requests', 'Respond promptly — guests book hosts with fast response times', '#FFF7ED', OCHRE)

drawStep(12, 'Receive a Booking Request', [
  '• You receive a push notification and SMS when a new request arrives',
  '• Go to  Dashboard  (home tab when logged in as host)',
  '• Under  Pending Requests, tap the request to view full details:',
  '  — Traveler name, country, and profile',
  '  — Requested dates and number of guests',
  '  — Message from the traveler (if they left one)',
], null, 11)

drawStep(13, 'Accept or Decline a Request', [
  '• Tap  Accept ✓  to confirm the booking',
  '  — The dates are automatically blocked in your calendar',
  '  — The traveler is charged immediately',
  '  — You both receive a confirmation notification',
  '• Tap  Decline ✗  if you are unavailable or the dates don\'t work',
  '  — Select a reason (optional) — the traveler is notified',
  '• Requests auto-decline after 48 hours if you don\'t respond',
], ['Respond within a few hours if possible. Fast responses improve your search ranking.'], 11)

drawStep(14, 'Communicate With the Traveler', [
  '• After accepting, go to  Inbox  to message your guest',
  '• Set the meeting point, confirm arrival time, ask about dietary needs',
  '• Messages are auto-translated — you can write in Nepali',
  '• Tap the 🌐 icon to toggle translation on/off',
], null, 11)

drawSectionHeading('📅', 'Managing Your Calendar', 'Block dates to prevent overbooking', '#FFF7ED', OCHRE)

drawStep(15, 'Block or Unblock Dates', [
  '• Go to  Dashboard → Edit calendar',
  '• Tap any date to toggle it between Available and Blocked',
  '• Blocked dates (grey) cannot be booked by travelers',
  '• Already-booked dates (green) are blocked automatically',
  '• Useful for: festivals, family events, trail maintenance, rest days',
], ['Block dates well in advance of major Nepal festivals (Dashain, Tihar) if you plan to close.'], 11)

// Page 12 — Running the trip + getting paid
doc.addPage()
drawContentHeader('Part 2 — Host & Guide Guide', OCHRE)
drawFooter(12)

drawSectionHeading('🥾', 'Running the Trip', 'From check-in to completion', '#FFF7ED', OCHRE)

drawStep(16, 'Check In Your Guest', [
  '• When your guest arrives at the meeting point:',
  '  → Open  Dashboard → Upcoming Guests',
  '  → Tap the booking → tap  Check In Guest',
  '  → Show the QR code for the guest to scan, OR tap location-based check-in',
  '• This officially starts the trip',
  '• The payment is released from escrow to your wallet at this point',
], ['If the guest uses "Pay on arrival", collect cash first, then check them in.'], 12)

drawStep(17, 'Post Daily Logs', [
  '• Every evening during the trip, go to  Trips → Current Trip → Daily Log',
  '• Tap  + Add Log',
  '• Upload a photo from today (from your camera or gallery)',
  '• Write a short note (up to 150 characters) — e.g. "Day 3: Reached base camp. All well."',
  '• Tap  Post',
  '• The log is visible to the traveler AND their emergency contact',
  '• If you skip a day, the platform will send you a reminder',
], ['Daily logs are a core safety feature. They take 1 minute and give the traveler\'s family peace of mind.'], 12)

drawStep(18, 'Submit Trail Reports', [
  '• If you encounter a hazard (landslide, washed-out bridge, weather event):',
  '  → Go to  Dashboard → Submit Trail Report',
  '  → Select severity: Low / Medium / High / Critical',
  '  → Describe the issue and location',
  '• All travelers with upcoming bookings on your route are notified',
  '• You can mark the issue as resolved once it is safe',
], null, 12)

drawStep(19, 'Mark Trip Completed', [
  '• On the final day of the trip, go to  Trips → Current Trip',
  '• Tap  Mark as Completed',
  '• The traveler receives a review prompt',
  '• Your earnings are confirmed in your wallet',
], null, 12)

drawSectionHeading('💸', 'Getting Paid', 'Earnings in your wallet within 48 hours of check-in', '#FFF7ED', OCHRE)

drawStep(20, 'View Your Earnings', [
  '• Go to  Profile → Wallet & Payments',
  '• Your balance shows confirmed earnings from completed check-ins',
  '• Pending earnings (pre-check-in) are shown separately',
  '• Tap any transaction to see the booking it relates to',
], null, 12)

drawStep(21, 'Withdraw Your Earnings', [
  '• Tap  Withdraw Earnings  in the Wallet screen',
  '• Choose your payout method:',
  '  → eSewa wallet — credited within 24 hours',
  '  → Khalti wallet — credited within 24 hours',
  '  → Bank account — credited within 48 hours',
  '• Minimum withdrawal: NPR 500',
  '• Link your eSewa/Khalti account in  Profile → Wallet → Add Account',
], ['If you need help linking your eSewa account, call our Nepal support line. We can walk you through it.'], 12)

// ─── QUICK REFERENCE ────────────────────────────────────────────────────────
doc.addPage()
drawContentHeader('Quick Reference', MID_GREY)
drawFooter(13)

doc.save().fontSize(20).font('Helvetica-Bold').fillColor(CHARCOAL).text('Quick Reference', MARGIN, currentY).restore()
currentY += 30

// Tab navigation table
doc.save().fontSize(12).font('Helvetica-Bold').fillColor(CHARCOAL).text('Bottom Navigation Tabs', MARGIN, currentY).restore()
currentY += 18

const tabs = [
  ['🧭', 'Discover', 'Browse listings, search, and find hidden gems'],
  ['🗺️', 'Map',      'See all experiences on an interactive map'],
  ['🎒', 'Trips',    'Manage upcoming and past bookings'],
  ['💬', 'Inbox',    'Chat with guides, hosts, and support'],
  ['👤', 'Profile',  'Badges, wallet, emergency contacts, settings'],
]
tabs.forEach(([emoji, name, desc], i) => {
  const bg = i % 2 === 0 ? '#F9FAFB' : WHITE
  doc.save().rect(MARGIN, currentY, CONTENT_W, 26).fill(bg).restore()
  doc.save().fontSize(13).text(emoji, MARGIN + 10, currentY + 6).restore()
  doc.save().fontSize(10).font('Helvetica-Bold').fillColor(CHARCOAL).text(name, MARGIN + 32, currentY + 8).restore()
  doc.save().fontSize(10).font('Helvetica').fillColor(MID_GREY).text(desc, MARGIN + 100, currentY + 8).restore()
  currentY += 26
})
currentY += 16

// SOS
doc.save().fontSize(12).font('Helvetica-Bold').fillColor(RED).text('🆘  Emergency SOS', MARGIN, currentY).restore()
currentY += 18
drawInfoBox('⚠️', 'Hold the red SOS button for 3 seconds. The app will call emergency services AND send an SMS with your GPS location to your registered emergency contact. Works without mobile data.', '#FFF0F0', RED)

const sosSteps = [
  '1. Open the Trips tab during an active trek',
  '2. Tap Trip Detail',
  '3. Press and hold the red  SOS  button for 3 full seconds',
  '4. The app dials 112 (Nepal emergency) via your phone dialer',
  '5. An SMS is sent with: your name, booking ID, guide\'s phone, GPS coordinates',
  '6. To cancel: tap  Cancel SOS  within 10 seconds of activation',
]
sosSteps.forEach((line) => {
  ensureSpace(18)
  doc.save().fontSize(10).font('Helvetica').fillColor(CHARCOAL).text(line, MARGIN + 12, currentY, { width: CONTENT_W - 12 }).restore()
  currentY += 18
})

currentY += 8

// Offline mode
doc.save().fontSize(12).font('Helvetica-Bold').fillColor(CHARCOAL).text('📡  Offline Mode — What Works Without Signal', MARGIN, currentY).restore()
currentY += 16

const offlineItems = [
  ['✅ Works offline', [
    'GPX trail map and route markers',
    'Emergency contacts (guide, hospital, police)',
    'Meeting point details',
    '30 Nepali phrases with transliteration',
    'Your booking summary and itinerary',
    'Last 50 chat messages per conversation',
    'SOS via device SMS (no internet needed)',
  ]],
  ['⚠️ Needs internet', [
    'Browsing new listings',
    'Making a new booking or payment',
    'Receiving new chat messages in real time',
    'Weather forecast updates',
    'Posting daily logs (queued & sent on reconnect)',
  ]],
]

offlineItems.forEach(([header, items]) => {
  ensureSpace(30 + items.length * 16)
  const isOk = header.startsWith('✅')
  doc.save().fontSize(10).font('Helvetica-Bold').fillColor(isOk ? GREEN : OCHRE).text(header, MARGIN, currentY).restore()
  currentY += 16
  items.forEach((item) => {
    doc.save().fontSize(9).font('Helvetica').fillColor(MID_GREY)
      .text('• ' + item, MARGIN + 12, currentY, { width: CONTENT_W - 12 })
    .restore()
    currentY += 15
  })
  currentY += 8
})

// Page 14 — Payments
doc.addPage()
drawContentHeader('Quick Reference', MID_GREY)
drawFooter(14)

doc.save().fontSize(20).font('Helvetica-Bold').fillColor(CHARCOAL).text('Payment Methods', MARGIN, currentY).restore()
currentY += 28

const payments = [
  { icon: '💳', name: 'Credit / Debit Card', sub: 'Visa, Mastercard, Amex', notes: 'Secured by Stripe. Charged immediately at booking. Refund in 5 business days if cancelled.', who: 'Travelers only' },
  { icon: '📱', name: 'eSewa',               sub: 'Nepal digital wallet', notes: 'Redirects to the eSewa app. Instant confirmation.', who: 'Travelers & hosts (payouts)' },
  { icon: '📱', name: 'Khalti',              sub: 'Nepal digital wallet', notes: 'Redirects to the Khalti app. Instant confirmation.', who: 'Travelers & hosts (payouts)' },
  { icon: '🏦', name: 'Bank Transfer',       sub: 'Direct to account',   notes: 'Details emailed after booking. Allow 1–2 business days.', who: 'Travelers only' },
  { icon: '💵', name: 'Pay on Arrival',      sub: 'Cash — remote areas', notes: 'No upfront charge. Host checks in guest to confirm receipt.', who: 'Remote listings only' },
]

payments.forEach((p, i) => {
  ensureSpace(70)
  const bg = i % 2 === 0 ? '#F9FAFB' : WHITE
  doc.save().roundedRect(MARGIN, currentY, CONTENT_W, 58, 8).fill(bg).restore()
  doc.save().fontSize(22).text(p.icon, MARGIN + 12, currentY + 10).restore()
  doc.save().fontSize(12).font('Helvetica-Bold').fillColor(CHARCOAL).text(p.name, MARGIN + 46, currentY + 10).restore()
  doc.save().fontSize(9).font('Helvetica').fillColor(MID_GREY).text(p.sub, MARGIN + 46, currentY + 26).restore()
  doc.save().fontSize(9).font('Helvetica').fillColor(CHARCOAL).text(p.notes, MARGIN + 46, currentY + 38, { width: CONTENT_W - 120 }).restore()
  doc.save().fontSize(9).font('Helvetica-Bold').fillColor(GREEN)
    .text(p.who, W - MARGIN - 120, currentY + 10, { width: 112, align: 'right' })
  .restore()
  currentY += 66
})

currentY += 12
drawInfoBox('💚', 'Hosts keep 88–90% of every booking. The platform fee (10%) is the only charge. No monthly subscription, no hidden fees.', GREEN_PALE, GREEN)

// ─── Back cover ──────────────────────────────────────────────────────────────
doc.addPage()
filledRect(0, 0, W, H, GREEN)
doc.save().circle(W / 2, H / 2, 220).fillOpacity(0.06).fill(WHITE).restore()
doc.save().circle(W / 2, H / 2, 150).fillOpacity(0.05).fill(WHITE).restore()

doc.save().fontSize(48).text('🏔️', W / 2 - 30, H / 2 - 90).restore()

doc.save().fontSize(26).font('Helvetica-Bold').fillColor(WHITE)
  .text('Nepal Untrodden', MARGIN, H / 2 - 20, { width: CONTENT_W, align: 'center' })
.restore()
doc.save().fontSize(13).font('Helvetica').fillColor('rgba(255,255,255,0.75)')
  .text('Venture Beyond the Trails', MARGIN, H / 2 + 14, { width: CONTENT_W, align: 'center' })
.restore()

doc.save().moveTo(W / 2 - 60, H / 2 + 42).lineTo(W / 2 + 60, H / 2 + 42).strokeColor('rgba(255,255,255,0.3)').lineWidth(1).stroke().restore()

doc.save().fontSize(11).font('Helvetica').fillColor('rgba(255,255,255,0.65)')
  .text('http://localhost:3100', MARGIN, H / 2 + 56, { width: CONTENT_W, align: 'center' })
.restore()

doc.save().fontSize(10).font('Helvetica').fillColor('rgba(255,255,255,0.45)')
  .text('App Navigation Guide  ·  Version 1.0  ·  April 2026', MARGIN, H - 48, { width: CONTENT_W, align: 'center' })
.restore()

// ─── Finalise ────────────────────────────────────────────────────────────────
doc.end()
stream.on('finish', () => {
  console.log(`✅  PDF created: ${outFile}`)
})
stream.on('error', (err) => {
  console.error('❌  PDF error:', err)
  process.exit(1)
})
