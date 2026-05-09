'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ResultCard from '@/components/ResultCard'
import LiveDashboard from '@/components/LiveDashboard'

type FormData = {
  perceived_free_hours: number
  perceived_screen_pct: number
  feel_busy_freq: string
  avg_pickup_duration: string
  screen_intentionality: string
  actual_screen_hours: string
  actual_pickups: string
  top_app_category: string
  age_range: string
  occupation_type: string
  consent1: boolean
  consent2: boolean
  consent3: boolean
}

const INITIAL: FormData = {
  perceived_free_hours: 3,
  perceived_screen_pct: 50,
  feel_busy_freq: '',
  avg_pickup_duration: '',
  screen_intentionality: '',
  actual_screen_hours: '',
  actual_pickups: '',
  top_app_category: '',
  age_range: '',
  occupation_type: '',
  consent1: false,
  consent2: false,
  consent3: false,
}

export default function Home() {
  const [step, setStep] = useState<'landing' | 'consent' | 'quiz' | 'layer3' | 'result' | 'dashboard'>('landing')
  const [form, setForm] = useState<FormData>(INITIAL)
  const [quizStep, setQuizStep] = useState(0)
  const [totalResponses, setTotalResponses] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submittedData, setSubmittedData] = useState<FormData | null>(null)

  useEffect(() => {
    supabase.from('responses').select('id', { count: 'exact', head: true })
      .then(({ count }) => { if (count !== null) setTotalResponses(count) })
  }, [])

  const weekNumber = Math.ceil((new Date().getTime() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000))

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError('')
    try {
      const payload = {
        perceived_free_hours: form.perceived_free_hours,
        perceived_screen_pct: form.perceived_screen_pct,
        feel_busy_freq: form.feel_busy_freq,
        avg_pickup_duration: form.avg_pickup_duration,
        screen_intentionality: form.screen_intentionality,
        actual_screen_hours: form.actual_screen_hours ? parseFloat(form.actual_screen_hours) : null,
        actual_pickups: form.actual_pickups ? parseInt(form.actual_pickups) : null,
        top_app_category: form.top_app_category || null,
        age_range: form.age_range || null,
        occupation_type: form.occupation_type || null,
        week_number: weekNumber,
      }
      const { error } = await supabase.from('responses').insert(payload)
      if (error) throw error
      setSubmittedData(form)
      setStep('result')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong. Please try again.'
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const setField = (key: keyof FormData, val: string | number | boolean) =>
    setForm(f => ({ ...f, [key]: val }))

  const quizQuestions = [
    {
      key: 'perceived_free_hours' as keyof FormData,
      label: 'Yesterday, roughly how many hours did you feel you had "for yourself" — not work, study, chores, or commute?',
      type: 'slider',
      min: 0, max: 12, unit: 'hrs',
    },
    {
      key: 'perceived_screen_pct' as keyof FormData,
      label: 'How much of that free time do you think you spent on your phone or screen?',
      type: 'slider',
      min: 0, max: 100, unit: '%',
    },
    {
      key: 'feel_busy_freq' as keyof FormData,
      label: 'In the last week, how often did you feel "I wish I had more time for myself"?',
      type: 'radio',
      options: ['Daily', 'A few times', 'Rarely', 'Never'],
    },
    {
      key: 'avg_pickup_duration' as keyof FormData,
      label: 'When you pick up your phone without a specific reason, how long do you usually stay on it?',
      type: 'radio',
      options: ['< 5 minutes', '5–20 minutes', '20–60 minutes', '1+ hour'],
    },
    {
      key: 'screen_intentionality' as keyof FormData,
      label: 'How would you honestly describe most of your screen time?',
      type: 'radio',
      options: ['Mostly purposeful', 'Mix of both', 'Mostly habitual scrolling'],
    },
  ]

  const currentQ = quizQuestions[quizStep]
  const quizDone = quizStep >= quizQuestions.length

  function RadioGroup({ q }: { q: typeof quizQuestions[0] }) {
    if (q.type !== 'radio') return null
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options!.map(opt => (
          <button key={opt}
            className={`radio-option${form[q.key] === opt ? ' selected' : ''}`}
            onClick={() => setField(q.key, opt)}>
            <span className="radio-dot" />
            {opt}
          </button>
        ))}
      </div>
    )
  }

  function SliderGroup({ q }: { q: typeof quizQuestions[0] }) {
    if (q.type !== 'slider') return null
    const val = form[q.key] as number
    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 48, fontWeight: 800, color: 'var(--orange)' }}>{val}</span>
          <span style={{ fontSize: 20, color: 'var(--muted)', marginLeft: 4 }}>{q.unit}</span>
        </div>
        <input type="range" min={q.min} max={q.max} value={val}
          onChange={e => setField(q.key, parseInt(e.target.value))} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>
          <span>{q.min}{q.unit}</span><span>{q.max}{q.unit}</span>
        </div>
      </div>
    )
  }

  const canAdvanceQuiz = () => {
    if (!currentQ) return false
    const val = form[currentQ.key]
    if (currentQ.type === 'slider') return true
    return val !== ''
  }

  // ── LANDING ────────────────────────────────────────────────────────────────
  if (step === 'landing') return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', letterSpacing: '0.05em' }}>BUSY?</span>
        <button className="btn-secondary" style={{ padding: '8px 20px', fontSize: 14 }}
          onClick={() => setStep('dashboard')}>See live data →</button>
      </nav>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
        <div className="fade-up" style={{ maxWidth: 680 }}>
          {totalResponses !== null && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,115,42,0.1)', borderRadius: 50, padding: '6px 16px', fontSize: 13, color: 'var(--orange)', fontWeight: 500, marginBottom: 32 }}>
              <span className="live-dot" />
              {totalResponses.toLocaleString()} people have reflected so far
            </div>
          )}

          <h1 style={{ fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 800, lineHeight: 1.1, color: 'var(--navy)', marginBottom: 24 }}>
            Are we pretending<br />to be busy?
          </h1>

          <p style={{ fontSize: 'clamp(17px, 2.5vw, 20px)', color: 'var(--muted)', maxWidth: 520, margin: '0 auto 16px', lineHeight: 1.7 }}>
            Most people feel constantly rushed. Yet screens absorb 4–7 hours of their day — often without them noticing.
          </p>
          <p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 48 }}>
            No sign-up. No judgment. 2 minutes. Fully anonymous.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => setStep('consent')}>
              Reflect on your time →
            </button>
            <button className="btn-secondary" onClick={() => setStep('dashboard')}>
              See what others said
            </button>
          </div>
        </div>

        <div style={{ marginTop: 80, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, maxWidth: 700, width: '100%' }}>
          {[
            { stat: '5.2 hrs', label: 'Avg daily phone use globally' },
            { stat: '2 hrs', label: 'How much people think they use it' },
            { stat: '80×', label: 'Avg daily phone pickups' },
          ].map(({ stat, label }) => (
            <div key={stat} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--orange)' }}>{stat}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <footer style={{ textAlign: 'center', padding: '20px', fontSize: 12, color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
        Anonymous research project · No personal data collected ·{' '}
        <a href="/privacy" style={{ color: 'var(--orange)', textDecoration: 'none' }}>Privacy policy</a>
      </footer>
    </main>
  )

  // ── CONSENT ────────────────────────────────────────────────────────────────
  if (step === 'consent') return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div className="card fade-up" style={{ maxWidth: 560, width: '100%' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>Before you start</h2>
        <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
          This is an anonymous research project. Here is exactly what happens with your responses:
        </p>

        {[
          { key: 'consent1' as keyof FormData, text: 'I understand this is a research study on perceived vs actual discretionary time. My responses are anonymous — no name, email, or identifier is collected.' },
          { key: 'consent2' as keyof FormData, text: 'I agree my self-reported estimates may be stored in anonymized aggregate form and used in public research summaries.' },
          { key: 'consent3' as keyof FormData, text: '(Optional) I am willing to share my actual device screen-time figure. I understand this is completely optional and I can skip it.' },
        ].map(({ key, text }) => (
          <label key={key} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18, cursor: 'pointer' }}>
            <div style={{
              width: 22, height: 22, border: `2px solid ${form[key] ? 'var(--orange)' : 'var(--border)'}`,
              borderRadius: 6, background: form[key] ? 'var(--orange)' : 'transparent',
              flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s'
            }}>
              {form[key] && <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 14, color: 'var(--dark)', lineHeight: 1.6 }}
              onClick={() => setField(key, !form[key])}>{text}</span>
          </label>
        ))}

        <div style={{ background: 'rgba(232,115,42,0.06)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: 'var(--muted)' }}>
          🔒 No IP addresses, names, or device identifiers are stored. Raw data is deleted after the study closes. Governed by India's DPDP Act 2023 and GDPR principles.
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-secondary" onClick={() => setStep('landing')} style={{ flex: 1 }}>Back</button>
          <button className="btn-primary" onClick={() => setStep('quiz')}
            disabled={!form.consent1 || !form.consent2}
            style={{ flex: 2, opacity: (!form.consent1 || !form.consent2) ? 0.5 : 1 }}>
            I agree — start →
          </button>
        </div>
      </div>
    </main>
  )

  // ── QUIZ ───────────────────────────────────────────────────────────────────
  if (step === 'quiz') return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 560, width: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Question {Math.min(quizStep + 1, quizQuestions.length)} of {quizQuestions.length}</span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{Math.round((quizStep / quizQuestions.length) * 100)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(quizStep / quizQuestions.length) * 100}%` }} />
          </div>
        </div>

        {!quizDone ? (
          <div key={quizStep} className="card fade-up">
            <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--navy)', marginBottom: 28, lineHeight: 1.5 }}>
              {currentQ.label}
            </p>
            {currentQ.type === 'slider' ? <SliderGroup q={currentQ} /> : <RadioGroup q={currentQ} />}

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button className="btn-secondary" onClick={() => setQuizStep(s => Math.max(0, s - 1))}
                style={{ padding: '12px 20px' }}>← Back</button>
              <button className="btn-primary" onClick={() => setQuizStep(s => s + 1)}
                disabled={!canAdvanceQuiz()}
                style={{ flex: 1, opacity: !canAdvanceQuiz() ? 0.5 : 1 }}>
                {quizStep === quizQuestions.length - 1 ? 'See my result →' : 'Next →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="card fade-up">
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>
              Want to compare with your real numbers?
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 20, lineHeight: 1.6 }}>
              This part is completely optional. Check your device settings and enter your actual screen time.
            </p>

            <div style={{ background: 'rgba(26,60,94,0.04)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 13 }}>
              <strong style={{ display: 'block', marginBottom: 6 }}>How to find your screen time:</strong>
              <span style={{ color: 'var(--muted)' }}>
                📱 Android: Settings → Digital Wellbeing → Dashboard<br />
                🍎 iPhone: Settings → Screen Time → tap "Last 7 Days" ÷ 7
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                  Screen time yesterday (hours)
                </label>
                <input type="number" min="0" max="24" step="0.5" placeholder="e.g. 5.5"
                  value={form.actual_screen_hours}
                  onChange={e => setField('actual_screen_hours', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 16, background: 'var(--card-bg)', color: 'var(--dark)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                  Phone pickups yesterday
                </label>
                <input type="number" min="0" max="500" placeholder="e.g. 80"
                  value={form.actual_pickups}
                  onChange={e => setField('actual_pickups', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 16, background: 'var(--card-bg)', color: 'var(--dark)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { key: 'age_range' as keyof FormData, label: 'Age range', opts: ['Under 18', '18–24', '25–34', '35–44', '45+'] },
                { key: 'occupation_type' as keyof FormData, label: 'Occupation', opts: ['Student', 'Working professional', 'Freelancer', 'Business owner', 'Other'] },
                { key: 'top_app_category' as keyof FormData, label: 'Most used app type', opts: ['Social media', 'Entertainment', 'Work tools', 'Messaging', 'Other'] },
              ].map(({ key, label, opts }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{label}</label>
                  <select value={form[key] as string} onChange={e => setField(key, e.target.value)}
                    style={{ width: '100%', padding: '10px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 13, background: 'var(--card-bg)', color: 'var(--dark)' }}>
                    <option value="">Select</option>
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {submitError && (
              <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
                {submitError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-secondary" onClick={handleSubmit} disabled={submitting}
                style={{ flex: 1 }}>
                {submitting ? 'Saving...' : 'Skip & see result'}
              </button>
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting}
                style={{ flex: 2, opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Saving...' : 'Submit & see result →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (step === 'result' && submittedData) return (
    <ResultCard data={submittedData} onDashboard={() => setStep('dashboard')} />
  )

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  if (step === 'dashboard') return (
    <LiveDashboard onBack={() => setStep('landing')} onReflect={() => setStep('consent')} />
  )

  return null
}
