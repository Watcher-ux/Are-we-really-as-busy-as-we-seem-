'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, CartesianGrid, Cell
} from 'recharts'

type AggData = {
  totalResponses: number
  avgPerceivedFreeHours: number
  avgPerceivedScreenPct: number
  avgActualScreenHours: number | null
  avgPickups: number | null
  perceptionGap: number | null
  feelBusyDist: { name: string; count: number }[]
  intentionalityDist: { name: string; count: number }[]
  screenHoursDist: { range: string; count: number }[]
  pickupDist: { range: string; count: number }[]
}

export default function LiveDashboard({ onBack, onReflect }: { onBack: () => void; onReflect: () => void }) {
  const [data, setData] = useState<AggData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  async function fetchData() {
    const { data: rows, error } = await supabase
      .from('responses')
      .select('perceived_free_hours,perceived_screen_pct,actual_screen_hours,actual_pickups,feel_busy_freq,screen_intentionality,avg_pickup_duration')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (error || !rows || rows.length === 0) {
      setLoading(false)
      return
    }

    const n = rows.length
    const avgFree = rows.reduce((s, r) => s + r.perceived_free_hours, 0) / n
    const avgPct = rows.reduce((s, r) => s + r.perceived_screen_pct, 0) / n

    const withActual = rows.filter(r => r.actual_screen_hours !== null)
    const avgActual = withActual.length > 0
      ? withActual.reduce((s, r) => s + (r.actual_screen_hours || 0), 0) / withActual.length
      : null
    const avgPerceivedScreen = (avgFree * avgPct) / 100
    const gap = avgActual !== null ? avgActual - avgPerceivedScreen : null

    const withPickups = rows.filter(r => r.actual_pickups !== null)
    const avgPickups = withPickups.length > 0
      ? withPickups.reduce((s, r) => s + (r.actual_pickups || 0), 0) / withPickups.length
      : null

    const busyLabels = ['Daily', 'A few times', 'Rarely', 'Never']
    const feelBusyDist = busyLabels.map(name => ({
      name,
      count: rows.filter(r => r.feel_busy_freq === name).length
    }))

    const intentLabels = ['Mostly purposeful', 'Mix of both', 'Mostly habitual scrolling']
    const intentionalityDist = intentLabels.map(name => ({
      name: name === 'Mostly habitual scrolling' ? 'Habitual' : name === 'Mix of both' ? 'Mixed' : 'Purposeful',
      count: rows.filter(r => r.screen_intentionality === name).length
    }))

    const screenBuckets = ['0–2h', '2–4h', '4–6h', '6–8h', '8h+']
    const screenHoursDist = screenBuckets.map((range, i) => ({
      range,
      count: withActual.filter(r => {
        const h = r.actual_screen_hours || 0
        return i === 0 ? h < 2 : i === 1 ? h < 4 : i === 2 ? h < 6 : i === 3 ? h < 8 : h >= 8
      }).length
    }))

    const pickupBuckets = ['< 5 min', '5–20 min', '20–60 min', '1+ hour']
    const pickupDist = pickupBuckets.map(range => ({
      range: range.replace(' min', 'm').replace(' hour', 'h'),
      count: rows.filter(r => r.avg_pickup_duration === range).length
    }))

    setData({
      totalResponses: n,
      avgPerceivedFreeHours: Math.round(avgFree * 10) / 10,
      avgPerceivedScreenPct: Math.round(avgPct),
      avgActualScreenHours: avgActual !== null ? Math.round(avgActual * 10) / 10 : null,
      avgPickups: avgPickups !== null ? Math.round(avgPickups) : null,
      perceptionGap: gap !== null ? Math.round(gap * 10) / 10 : null,
      feelBusyDist,
      intentionalityDist,
      screenHoursDist,
      pickupDist,
    })
    setLastUpdated(new Date())
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const COLORS = ['#1a3c5e', '#e8732a', '#2d7d46', '#7c3aed', '#dc2626']

  return (
    <main style={{ minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy)' }}>Live data</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span className="live-dot" />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                Updates every 60s
                {lastUpdated && ` · Last: ${lastUpdated.toLocaleTimeString()}`}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={onBack} style={{ padding: '10px 18px', fontSize: 14 }}>← Home</button>
            <button className="btn-primary" onClick={onReflect} style={{ padding: '10px 20px', fontSize: 14 }}>Reflect →</button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
            Loading data...
          </div>
        ) : !data || data.totalResponses === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>
              Be the first to reflect
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
              No one has submitted yet. The dashboard will populate once people start responding.
            </p>
            <button className="btn-primary" onClick={onReflect}>Start reflecting →</button>
          </div>
        ) : (
          <>
            {/* Key stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 24 }}>
              {[
                { value: data.totalResponses.toLocaleString(), label: 'Total reflections', highlight: false },
                { value: `${data.avgPerceivedFreeHours}h`, label: 'Avg estimated free time', highlight: false },
                { value: data.avgActualScreenHours ? `${data.avgActualScreenHours}h` : 'N/A', label: 'Avg actual screen time', highlight: true },
                { value: data.perceptionGap !== null ? `+${data.perceptionGap}h` : 'N/A', label: 'Avg perception gap', highlight: true },
                { value: data.avgPickups ? `${data.avgPickups}×` : 'N/A', label: 'Avg daily pickups', highlight: false },
              ].map(({ value, label, highlight }) => (
                <div key={label} className="card" style={{ textAlign: 'center', padding: '18px 12px' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: highlight ? 'var(--orange)' : 'var(--navy)' }}>{value}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, lineHeight: 1.4 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Perception gap bar */}
            {data.avgActualScreenHours && (
              <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)', marginBottom: 16 }}>
                  The perception gap — estimated vs actual screen use
                </h3>
                <div style={{ marginBottom: 12 }}>
                  {[
                    { label: 'What people estimate', hours: (data.avgPerceivedFreeHours * data.avgPerceivedScreenPct / 100), color: '#1a3c5e', max: 10 },
                    { label: 'What device data shows', hours: data.avgActualScreenHours, color: '#e8732a', max: 10 },
                  ].map(({ label, hours, color, max }) => (
                    <div key={label} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                        <span style={{ color: 'var(--dark)' }}>{label}</span>
                        <span style={{ fontWeight: 600, color }}>{Math.round(hours * 10) / 10}h</span>
                      </div>
                      <div style={{ height: 10, background: 'var(--border)', borderRadius: 5 }}>
                        <div style={{ height: '100%', borderRadius: 5, background: color, width: `${Math.min((hours / max) * 100, 100)}%`, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Average gap: <strong style={{ color: 'var(--orange)' }}>{data.perceptionGap}h/day</strong> — people underestimate their screen use significantly.
                </p>
              </div>
            )}

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {/* Feels busy */}
              <div className="card">
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 16 }}>
                  "I wish I had more time" — how often
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data.feelBusyDist} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {data.feelBusyDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Intentionality */}
              <div className="card">
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 16 }}>
                  How people describe their screen use
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data.intentionalityDist} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {data.intentionalityDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Screen hours distribution */}
            {data.screenHoursDist.some(d => d.count > 0) && (
              <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)', marginBottom: 16 }}>
                  Actual screen time distribution
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.screenHoursDist} margin={{ top: 0, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`${v} people`, 'Responses']} />
                    <Bar dataKey="count" fill="#e8732a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Pickup duration */}
            {data.pickupDist.some(d => d.count > 0) && (
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)', marginBottom: 16 }}>
                  When picked up without reason, how long do people stay on phone?
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data.pickupDist} margin={{ top: 0, right: 10, bottom: 0, left: -10 }}>
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`${v} people`, 'Responses']} />
                    <Bar dataKey="count" fill="#1a3c5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Methodological note */}
            <div style={{ background: 'rgba(26,60,94,0.05)', borderRadius: 12, padding: '16px 20px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--navy)' }}>Data note:</strong> All responses are self-reported and anonymous. 
              Actual screen time figures are voluntary and represent a subset of respondents. 
              This is a volunteer convenience sample — results are indicative, not statistically representative.
              Raw data is deleted after the study closes; only aggregate summaries are retained.
            </div>
          </>
        )}
      </div>
    </main>
  )
}
