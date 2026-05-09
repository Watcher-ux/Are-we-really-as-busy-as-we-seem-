'use client'
import { useRef } from 'react'

type Props = {
  data: {
    perceived_free_hours: number
    perceived_screen_pct: number
    feel_busy_freq: string
    avg_pickup_duration: string
    screen_intentionality: string
    actual_screen_hours: string
    actual_pickups: string
  }
  onDashboard: () => void
}

export default function ResultCard({ data, onDashboard }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  const perceivedScreenHours = parseFloat(
    ((data.perceived_free_hours * data.perceived_screen_pct) / 100).toFixed(1)
  )
  const actualHours = data.actual_screen_hours ? parseFloat(data.actual_screen_hours) : null
  const gap = actualHours !== null ? (actualHours - perceivedScreenHours).toFixed(1) : null

  const nationalAvg = 5.2

  const linkedinText = encodeURIComponent(
    `I just reflected on how I actually spend my free time — and the gap between what I estimated and reality is uncomfortable.\n\nAre we pretending to be busy, or are we actually time-poor?\n\nTake 2 minutes (anonymous): ${typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.vercel.app'}\n\n#DigitalWellbeing #TimeAwareness #Focus`
  )

  function copyLink() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin)
        .then(() => alert('Link copied!'))
    }
  }

  return (
    <main style={{ minHeight: '100vh', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: 600, width: '100%' }}>
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--navy)', marginBottom: 8 }}>
            Here's your reflection
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>No judgment — just a mirror.</p>
        </div>

        {/* Main stat card */}
        <div ref={cardRef} className="card fade-up" style={{ marginBottom: 20, border: '2px solid var(--orange)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--orange)' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24, paddingTop: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--navy)' }}>{data.perceived_free_hours}h</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Free time you estimated</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--orange)' }}>{perceivedScreenHours}h</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Estimated on screens ({data.perceived_screen_pct}%)</div>
            </div>
          </div>

          {actualHours !== null && (
            <div style={{ background: 'rgba(232,115,42,0.07)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--dark)' }}>{actualHours}h</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Actual screen time</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: parseFloat(gap!) > 0 ? '#dc2626' : '#22c55e' }}>
                    {parseFloat(gap!) > 0 ? '+' : ''}{gap}h
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Gap (actual vs estimate)</div>
                </div>
              </div>
              {parseFloat(gap!) > 1 && (
                <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
                  You used screens <strong style={{ color: 'var(--orange)' }}>{gap} more hours</strong> than you thought.
                  The national average gap is ~3 hours.
                </p>
              )}
            </div>
          )}

          {actualHours === null && (
            <div style={{ background: 'rgba(26,60,94,0.05)', borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                Among people who reported similar schedules, average actual phone screen time is{' '}
                <strong style={{ color: 'var(--orange)' }}>{nationalAvg} hours/day</strong> — compared to an estimated {perceivedScreenHours}h.
                That's a gap of ~{(nationalAvg - perceivedScreenHours).toFixed(1)} hours.
              </p>
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <p style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
              "What would you do with {actualHours ? gap : '2–3'} hours a day if you noticed them?"
            </p>
          </div>
        </div>

        {/* Summary pills */}
        <div className="card fade-up" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--navy)', marginBottom: 16 }}>Your responses</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              { label: 'Feels busy', value: data.feel_busy_freq },
              { label: 'Avg pickup', value: data.avg_pickup_duration },
              { label: 'Screen use', value: data.screen_intentionality },
              ...(data.actual_pickups ? [{ label: 'Phone pickups', value: `${data.actual_pickups}× yesterday` }] : [])
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'rgba(26,60,94,0.07)', borderRadius: 50, padding: '6px 14px', fontSize: 13 }}>
                <span style={{ color: 'var(--muted)' }}>{label}: </span>
                <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Context note */}
        <div style={{ background: 'rgba(45,125,70,0.07)', border: '1px solid rgba(45,125,70,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: '#2d7d46', lineHeight: 1.6 }}>
          💡 Screen time isn't inherently good or bad. What matters is whether it aligns with what you actually value.
        </div>

        {/* Share */}
        <div className="card fade-up" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>Pass it on</h3>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
            Most people who see this haven't asked themselves this question. Share it.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}&summary=${linkedinText}`}
              target="_blank" rel="noopener noreferrer"
              style={{ background: '#0077b5', color: 'white', padding: '12px 24px', borderRadius: 50, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Share on LinkedIn
            </a>
            <button className="btn-secondary" onClick={copyLink} style={{ padding: '12px 24px', fontSize: 14 }}>
              Copy link
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
          <button className="btn-primary" onClick={onDashboard}>
            See everyone's data →
          </button>
        </div>
      </div>
    </main>
  )
}
