import Link from 'next/link'
import { Mountain } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy — Nepal Untrodden',
  description: 'How Nepal Untrodden collects, uses, and protects your personal information.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-neutral-charcoal mb-3 pb-2 border-b border-neutral-100" style={{ fontFamily: 'Lora, serif' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-brand-green-pale">
            {headers.map(h => (
              <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-neutral-charcoal uppercase tracking-wide border border-neutral-light">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-pale/40'}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-neutral-charcoal border border-neutral-light align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-brand-green py-8 px-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Mountain size={20} className="text-white" />
          </Link>
          <div>
            <p className="text-brand-green-pale text-xs font-medium">Nepal Untrodden</p>
            <h1 className="text-white text-2xl font-bold" style={{ fontFamily: 'Lora, serif' }}>Privacy Policy</h1>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-card p-6 md:p-10">

          {/* Meta */}
          <div className="text-xs text-neutral-mid mb-8 space-y-0.5">
            <p><span className="font-semibold">Effective Date:</span> May 1, 2026</p>
            <p><span className="font-semibold">Last Updated:</span> May 1, 2026</p>
            <p><span className="font-semibold">Developer:</span> Nepal Untrodden (Binaya Rajbhandari)</p>
            <p><span className="font-semibold">Contact:</span>{' '}
              <a href="mailto:privacy@nepaluntrodden.com" className="text-brand-green underline">privacy@nepaluntrodden.com</a>
            </p>
          </div>

          {/* 1 */}
          <Section title="1. Introduction">
            <p className="text-sm text-neutral-mid leading-relaxed">
              Nepal Untrodden (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. <strong className="text-neutral-charcoal">Please read this policy carefully.</strong> By using the app, you consent to the data practices described here.
            </p>
          </Section>

          {/* 2 */}
          <Section title="2. Information We Collect">
            <p className="text-sm text-neutral-mid mb-3">Information you provide directly:</p>
            <Table
              headers={['Category', 'Examples', 'Purpose']}
              rows={[
                ['Account Information', 'Name, email, phone, profile photo', 'Authentication, personalisation'],
                ['Booking Information', 'Trek dates, group size, preferences', 'Process bookings'],
                ['Payment Information', 'Via Stripe / eSewa / Khalti — we never store full card details', 'Payment processing'],
                ['Communication', 'Messages to hosts/guides, reviews', 'Facilitate bookings'],
                ['Verification Documents', 'Government ID, certifications (hosts/guides only)', 'Identity verification'],
              ]}
            />
            <p className="text-sm text-neutral-mid mb-3 mt-4">Information collected automatically:</p>
            <Table
              headers={['Category', 'Examples', 'Purpose']}
              rows={[
                ['Location Data', 'GPS coordinates (with permission)', 'Offline maps, SOS, trek tracking'],
                ['Device Information', 'Device model, OS version', 'App optimisation, debugging'],
                ['Usage Data', 'Pages viewed, features used', 'Improve experience'],
              ]}
            />
          </Section>

          {/* 3 */}
          <Section title="3. How We Use Your Information">
            <ul className="text-sm text-neutral-mid space-y-2 list-none">
              {[
                ['Process bookings and enable host–traveller communication', ''],
                ['Handle payments securely through Stripe, eSewa, and Khalti', ''],
                ['Enable SOS alerts and share location with emergency contacts when triggered', ''],
                ['Cache maps, itineraries, and essential data for remote trekking areas', ''],
                ['Analyse usage, fix bugs, and improve performance', ''],
                ['Send booking confirmations and customer support messages', ''],
                ['Fulfil legal obligations and prevent fraud', ''],
              ].map(([text]) => (
                <li key={text} className="flex gap-2">
                  <span className="text-brand-green shrink-0">✓</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* 4 */}
          <Section title="4. Data Storage and Security">
            <Table
              headers={['Data Type', 'Storage Location']}
              rows={[
                ['User profiles, bookings, listings', 'Supabase (AWS ap-south-1, Mumbai, India)'],
                ['Photos and documents', 'AWS S3 + CloudFront CDN'],
                ['Local cache (offline)', 'Your device (SQLite database)'],
              ]}
            />
            <p className="text-sm text-neutral-mid leading-relaxed mt-3">
              Security measures include TLS 1.3 encryption in transit, AES-256 encryption at rest, JWT authentication via Supabase Auth, and API rate limiting.
            </p>
          </Section>

          {/* 5 */}
          <Section title="5. Location Data">
            <p className="text-sm text-neutral-mid leading-relaxed mb-3">
              Location access is used for trek tracking, emergency SOS, and nearby recommendations. You can disable location services anytime in your device settings — offline navigation and SOS will be limited.
            </p>
            <p className="text-sm text-neutral-mid leading-relaxed">
              When you download offline packs, GPS routes and map tiles are stored locally on your device. We cannot access this data — it remains on your device until you delete the app or remove the pack.
            </p>
          </Section>

          {/* 6 */}
          <Section title="6. Information Sharing">
            <Table
              headers={['Recipient', 'What We Share', 'Why']}
              rows={[
                ['Hosts / guides', 'Name, booking dates, preferences', 'Arrange your trek'],
                ['Payment processors', 'Payment amount, booking reference', 'Process payments'],
                ['Emergency contacts', 'Your location (only when you trigger SOS)', 'Emergency assistance'],
                ['Legal authorities', 'As required by law', 'Legal compliance'],
              ]}
            />
            <p className="text-sm text-neutral-mid mt-3">
              We <strong className="text-neutral-charcoal">never</strong> share your card details, private messages, location without consent, or personal data with advertisers.
            </p>
          </Section>

          {/* 7 */}
          <Section title="7. Your Rights">
            <Table
              headers={['Right', 'How to Exercise']}
              rows={[
                ['Access your data', 'Profile → Settings → Download My Data'],
                ['Correct inaccurate data', 'Edit your profile in the app'],
                ['Delete your account', 'Profile → Settings → Delete Account'],
                ['Opt out of marketing', 'Unsubscribe link in emails or notification settings'],
                ['Revoke location access', 'Device settings → Nepal Untrodden → Location → Never'],
                ['Export your data', 'Email privacy@nepaluntrodden.com'],
              ]}
            />
            <p className="text-sm text-neutral-mid mt-3">
              We retain your data as long as your account is active, and for up to 30 days after deletion for backup and fraud prevention. Location data from SOS events is deleted after 30 days.
            </p>
          </Section>

          {/* 8 */}
          <Section title="8. Children's Privacy">
            <p className="text-sm text-neutral-mid leading-relaxed">
              Nepal Untrodden is not intended for users under 18. We do not knowingly collect data from children under 18. Contact us immediately at{' '}
              <a href="mailto:privacy@nepaluntrodden.com" className="text-brand-green underline">privacy@nepaluntrodden.com</a>{' '}
              if you believe we have done so.
            </p>
          </Section>

          {/* 9 */}
          <Section title="9. Third-Party Services">
            <div className="text-sm text-neutral-mid leading-relaxed mb-3">
              Our app integrates with the following services, each with their own privacy policy:
            </div>
            <Table
              headers={['Service', 'Purpose']}
              rows={[
                ['Supabase', 'Authentication, database'],
                ['Stripe', 'Card payments'],
                ['eSewa / Khalti', 'Nepal digital wallets'],
                ['Mapbox', 'Offline maps'],
                ['Twilio', 'SMS for SOS / OTP'],
                ['Firebase Cloud Messaging', 'Push notifications'],
                ['Resend', 'Transactional emails'],
                ['Sentry', 'Error tracking'],
              ]}
            />
          </Section>

          {/* 10 */}
          <Section title="10. Regulatory Compliance">
            <p className="text-sm text-neutral-mid leading-relaxed mb-2">
              <strong className="text-neutral-charcoal">Nepal:</strong> User data is stored in AWS ap-south-1 (Mumbai) to comply with data residency requirements.
            </p>
            <p className="text-sm text-neutral-mid leading-relaxed mb-2">
              <strong className="text-neutral-charcoal">GDPR (EU travellers):</strong> You have the right to data portability, erasure, and restriction of processing. Contact{' '}
              <a href="mailto:privacy@nepaluntrodden.com" className="text-brand-green underline">privacy@nepaluntrodden.com</a>.
            </p>
            <p className="text-sm text-neutral-mid leading-relaxed">
              <strong className="text-neutral-charcoal">CCPA (California):</strong> California residents may request information about our data sharing practices by email.
            </p>
          </Section>

          {/* 11 */}
          <Section title="11. Changes to This Policy">
            <p className="text-sm text-neutral-mid leading-relaxed">
              We may update this policy periodically. Significant changes will be communicated via in-app notification or email. Continued use of the app after changes constitutes acceptance.
            </p>
          </Section>

          {/* Contact */}
          <div className="mt-8 bg-brand-green-pale border border-brand-green/20 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-neutral-charcoal mb-3">Contact Us</h2>
            <div className="text-sm text-neutral-mid space-y-1">
              <p>Email: <a href="mailto:privacy@nepaluntrodden.com" className="text-brand-green underline">privacy@nepaluntrodden.com</a></p>
              <p>Support: <a href="mailto:support@nepaluntrodden.com" className="text-brand-green underline">support@nepaluntrodden.com</a></p>
              <p>Address: Nepal Untrodden, Kathmandu, Nepal</p>
              <p>Response time: Within 7 business days</p>
            </div>
          </div>

          <p className="text-xs text-neutral-mid text-center mt-8">
            By using Nepal Untrodden, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
