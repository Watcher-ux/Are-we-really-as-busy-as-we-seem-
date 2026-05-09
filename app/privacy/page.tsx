export default function Privacy() {
  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '60px 24px', fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--dark)', lineHeight: 1.7 }}>
      <a href="/" style={{ color: 'var(--orange)', fontSize: 14, textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>← Back to home</a>

      <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--navy)', marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 40 }}>Last updated: January 2025. Plain language — no legalese.</p>

      {[
        {
          title: 'Who is collecting this data?',
          body: 'This is an independent research project run by an individual researcher. It is not affiliated with any company or institution. Contact: [your email here]'
        },
        {
          title: 'What do we collect?',
          body: 'We collect only what you type into the quiz: your perceived free time estimate, estimated screen percentage, frequency of feeling busy, average pickup duration, and how you describe your screen use. If you choose Layer 3, we also collect your actual screen time figure, pickup count, age range, occupation type, and most-used app category. We do NOT collect your name, email, IP address, device ID, or any identifier that could link responses to you.'
        },
        {
          title: 'What do we NOT collect?',
          body: 'No names, emails, or phone numbers. No IP addresses stored. No device identifiers (IMEI, MAC address). No app-level usage (which specific apps you use). No message content. No location data. No tracking pixels or advertising cookies.'
        },
        {
          title: 'How is data stored?',
          body: 'Data is stored in a Supabase database (PostgreSQL) hosted on secure cloud infrastructure. Each submission is stored as an anonymous row with no identity link. A session hash is kept for 24 hours only (to prevent duplicate submissions), then discarded. The database uses row-level security — only the application can read/write data.'
        },
        {
          title: 'How long is data retained?',
          body: 'Raw submission rows are retained during the active study period. After the study closes, raw rows will be deleted and only aggregate summaries (average values, distributions) will be retained for publication. A public notice will be posted here when deletion occurs.'
        },
        {
          title: 'Who can see the data?',
          body: 'Only the researcher has access to the raw database. The public dashboard shows only aggregated, anonymized statistics — no individual rows are ever displayed publicly. The data is not sold, licensed, or shared with any third party.'
        },
        {
          title: 'Your rights (DPDP Act 2023 & GDPR)',
          body: 'Since all submissions are anonymous, we cannot identify or retrieve your individual record. However, if you saved your withdrawal token (shown after submission), you can email us within 24 hours to request deletion of your record. After 24 hours, the token is discarded and your record cannot be individually identified or deleted — only aggregate deletion at study close is possible.'
        },
        {
          title: 'Cookies & analytics',
          body: 'This site uses no advertising cookies and no third-party tracking. We use privacy-respecting analytics (Plausible or similar) that do not identify individuals, do not use cookies, and do not send data to advertising platforms.'
        },
        {
          title: 'Changes to this policy',
          body: 'Any material changes will be noted at the top of this page with a new date. Since we do not have your email, we cannot notify you directly — check this page if you are a repeat visitor.'
        }
      ].map(({ title, body }) => (
        <section key={title} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>{title}</h2>
          <p style={{ fontSize: 15, color: 'var(--dark)' }}>{body}</p>
        </section>
      ))}
    </main>
  )
}
