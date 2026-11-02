'use client'

import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { Download, ArrowLeft, BookOpen, Filter, ArrowUpRight, FileText, Check, Mail } from 'lucide-react'
import { generateWhitePaperPdf } from '../lib/generatePdf'

/* ───────────────────────── NAVIGATION ───────────────────────── */

export type View = 'landing' | 'white-paper' | 'thinkroom'

const NavCtx = createContext<{
  view: View
  navigate: (to: View) => void
}>({
  view: 'landing',
  navigate: () => {},
})

export function useNav() {
  return useContext(NavCtx)
}

/* ───────────────────────── THEME ───────────────────────── */

type Theme = 'dark' | 'light'

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} })

function useTheme() {
  return useContext(ThemeCtx)
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem('ui-theme') as Theme) || 'light'
  })

  useEffect(() => {
    localStorage.setItem('ui-theme', theme)
    document.documentElement.style.colorScheme = theme
  }, [theme])

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>
}

function v(theme: Theme) {
  const d = theme === 'dark'
  return {
    bg:          d ? '#000000' : '#FFFFFF',
    text:        d ? '#FFFFFF' : '#000000',
    muted:       d ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
    faint:       d ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
    ghost:       d ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
    divider:     d ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    navBg:       d ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
    forestHome:  d ? 'rgba(205, 155, 105, 0.38)' : 'rgba(145, 95, 45, 0.32)',
    forestWP:    d ? 'rgba(100, 200, 130, 0.38)' : 'rgba(45, 135, 65, 0.32)',
  }
}

/* ───────────────────────── TOGGLE (top-right) ───────────────────────── */

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const col = v(theme)
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      className="fixed cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        top: '0.85rem',
        right: '1rem',
        width: '2.25rem',
        height: '2.25rem',
        borderRadius: '50%',
        background: 'transparent',
        border: `1px solid ${col.divider}`,
        zIndex: 9999,
      }}
      aria-label="Toggle theme"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke={col.text}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isDark ? (
          <>
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </>
        ) : (
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        )}
      </svg>
    </button>
  )
}

/* ───────────────────────── TOP NAVIGATION ───────────────────────── */

function TopNav() {
  const { view, navigate } = useNav()
  const { theme } = useTheme()
  const s = v(theme)

  const navItems: { id: View; label: string }[] = [
    { id: 'landing', label: 'Home' },
    { id: 'white-paper', label: 'White Paper' },
    { id: 'thinkroom', label: 'Think Room' },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 px-4 sm:px-8 md:px-12 py-3.5 sm:py-4 flex items-center justify-between no-print transition-colors duration-500"
      style={{
        background: s.navBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${s.divider}`,
        zIndex: 50,
      }}
    >
      {/* Brand logo / home link */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('landing')}
          className="transition-opacity duration-300 cursor-pointer text-left truncate hover:opacity-80"
          style={{
            color: s.text,
            fontSize: '0.6875rem',
            letterSpacing: '0.2em',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            background: 'none',
            border: 'none',
          }}
        >
          <span className="hidden sm:inline">Upstream Institute</span>
          <span className="sm:hidden tracking-wider font-semibold">Upstream</span>
        </button>
      </div>

      {/* Primary Navigation: Home, White Paper, Think Room */}
      <nav className="flex items-center gap-1 sm:gap-2 md:gap-4 pr-12 sm:pr-14" aria-label="Main Navigation">
        {navItems.map(item => {
          const isActive = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className="px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer rounded whitespace-nowrap"
              style={{
                color: isActive ? s.text : s.muted,
                fontWeight: isActive ? 600 : 400,
                borderBottom: isActive ? `2px solid ${s.text}` : '2px solid transparent',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.color = s.text
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.color = s.muted
              }}
            >
              {item.label}
            </button>
          )
        })}
      </nav>
    </header>
  )
}

/* ───────────────────────── NORDIC FOREST ───────────────────────── */

function NordicForest({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <svg
        className="absolute bottom-0 left-0 w-full"
        style={{ height: '75vh' }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        <g stroke={color} strokeWidth="0.7" opacity="0.45">
          <line x1="60" y1="900" x2="60" y2="580" />
          <polygon points="60,580 42,660 78,660" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="160" y1="900" x2="160" y2="560" />
          <polygon points="160,560 140,645 180,645" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="240" y1="900" x2="240" y2="590" />
          <polygon points="240,590 224,665 256,665" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="320" y1="900" x2="320" y2="570" />
          <polygon points="320,570 302,650 338,650" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="420" y1="900" x2="420" y2="550" />
          <polygon points="420,550 400,640 440,640" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="500" y1="900" x2="500" y2="600" />
          <polygon points="500,600 485,670 515,670" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="580" y1="900" x2="580" y2="565" />
          <polygon points="580,565 562,648 598,648" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="680" y1="900" x2="680" y2="575" />
          <polygon points="680,575 660,655 700,655" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="760" y1="900" x2="760" y2="555" />
          <polygon points="760,555 742,640 778,640" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="860" y1="900" x2="860" y2="585" />
          <polygon points="860,585 844,660 876,660" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="940" y1="900" x2="940" y2="560" />
          <polygon points="940,560 920,645 960,645" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="1020" y1="900" x2="1020" y2="595" />
          <polygon points="1020,595 1005,668 1035,668" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="1120" y1="900" x2="1120" y2="570" />
          <polygon points="1120,570 1102,652 1138,652" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="1200" y1="900" x2="1200" y2="550" />
          <polygon points="1200,550 1180,638 1220,638" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="1300" y1="900" x2="1300" y2="580" />
          <polygon points="1300,580 1284,658 1316,658" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="1380" y1="900" x2="1380" y2="565" />
          <polygon points="1380,565 1362,648 1398,648" fill="none" stroke={color} strokeWidth="0.6" />
        </g>
        <g stroke={color} strokeWidth="1" opacity="0.7">
          <line x1="40" y1="900" x2="40" y2="490" />
          <polygon points="40,490 10,605 70,605" fill="none" stroke={color} strokeWidth="0.8" />
          <polygon points="40,560 20,640 60,640" fill="none" stroke={color} strokeWidth="0.8" />
          <line x1="120" y1="900" x2="120" y2="460" />
          <polygon points="120,460 88,585 152,585" fill="none" stroke={color} strokeWidth="0.8" />
          <polygon points="120,535 100,625 140,625" fill="none" stroke={color} strokeWidth="0.8" />
          <line x1="200" y1="900" x2="200" y2="480" />
          <polygon points="200,480 170,600 230,600" fill="none" stroke={color} strokeWidth="0.8" />
          <polygon points="200,550 182,635 218,635" fill="none" stroke={color} strokeWidth="0.8" />
          <line x1="280" y1="900" x2="280" y2="470" />
          <polygon points="280,470 252,595 308,595" fill="none" stroke={color} strokeWidth="0.8" />
          <polygon points="280,540 264,625 296,625" fill="none" stroke={color} strokeWidth="0.8" />
          <line x1="360" y1="900" x2="360" y2="500" />
          <polygon points="360,500 335,605 385,605" fill="none" stroke={color} strokeWidth="0.8" />
          <polygon points="360,565 345,635 375,635" fill="none" stroke={color} strokeWidth="0.8" />
        </g>
        <g stroke={color} strokeWidth="1.3" opacity="0.9">
          <line x1="80" y1="900" x2="80" y2="360" />
          <polygon points="80,360 40,500 120,500" fill="none" stroke={color} strokeWidth="1" />
          <polygon points="80,430 55,535 105,535" fill="none" stroke={color} strokeWidth="1" />
          <polygon points="80,500 62,580 98,580" fill="none" stroke={color} strokeWidth="1" />
          <line x1="230" y1="900" x2="230" y2="340" />
          <polygon points="230,340 190,480 270,480" fill="none" stroke={color} strokeWidth="1" />
          <polygon points="230,410 208,520 252,520" fill="none" stroke={color} strokeWidth="1" />
          <polygon points="230,480 215,565 245,565" fill="none" stroke={color} strokeWidth="1" />
          <line x1="360" y1="900" x2="360" y2="375" />
          <polygon points="360,375 325,505 395,505" fill="none" stroke={color} strokeWidth="1" />
          <polygon points="360,445 340,540 380,540" fill="none" stroke={color} strokeWidth="1" />
          <polygon points="360,515 348,585 372,585" fill="none" stroke={color} strokeWidth="1" />
        </g>
      </svg>
    </div>
  )
}

/* ───────────────────────── GRAIN ───────────────────────── */

function Grain() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        opacity: 0.018,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px',
      }}
    />
  )
}

/* ───────────────────────── COMING SOON ───────────────────────── */

function ComingSoon() {
  const { theme } = useTheme()
  const { navigate } = useNav()
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const s = v(theme)
  const isDark = theme === 'dark'

  const glow = isDark
    ? '0 0 40px rgba(255,255,255,0.15), 0 0 80px rgba(255,255,255,0.08)'
    : '0 0 40px rgba(0,0,0,0.12), 0 0 80px rgba(0,0,0,0.06)'

  const btnGlow = isDark
    ? '0 0 20px rgba(255,255,255,0.08)'
    : '0 0 20px rgba(0,0,0,0.06)'

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-16 relative transition-colors duration-500"
      style={{ background: s.bg, color: s.text }}
    >
      <NordicForest color={s.forestHome} />
      <Grain />

      <div className={`flex flex-col items-center transition-all duration-[2000ms] ease-out relative ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ zIndex: 2 }}
      >
        <h1
          className="tracking-[0.35em] uppercase text-center select-none"
          style={{
            fontSize: 'clamp(1.25rem, 3.5vw, 2.25rem)',
            fontWeight: 300,
            letterSpacing: '0.35em',
            lineHeight: 1.4,
            textShadow: glow,
          }}
        >
          Upstream<br />Institute
        </h1>

        <div className="w-12 my-8" style={{ height: '1px', background: s.divider }} />

        <p className="text-center max-w-xs"
          style={{ color: s.muted, fontSize: 'clamp(0.7rem, 1.2vw, 0.8125rem)', fontWeight: 300, letterSpacing: '0.08em', lineHeight: 1.7 }}
        >
          Reimagining Thought<br />for intergenerational impact
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm justify-center">
          <button
            onClick={() => navigate('white-paper')}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-full sm:w-auto cursor-pointer transition-all duration-300"
            style={{
              padding: '0.7rem 1.75rem',
              border: `1px solid ${hovered ? s.text : s.muted}`,
              borderRadius: '2px',
              background: 'transparent',
              color: s.text,
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              boxShadow: hovered ? btnGlow : 'none',
            }}
          >
            Read Think Upstream
          </button>
          <button
            onClick={() => navigate('thinkroom')}
            className="w-full sm:w-auto cursor-pointer transition-all duration-300"
            style={{
              padding: '0.7rem 1.75rem',
              border: `1px solid ${s.divider}`,
              borderRadius: '2px',
              background: 'transparent',
              color: s.muted,
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = s.text
              e.currentTarget.style.borderColor = s.muted
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = s.muted
              e.currentTarget.style.borderColor = s.divider
            }}
          >
            Think Room
          </button>
        </div>

        <div className="mt-8 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: s.text, animation: 'pulse 2.5s ease-in-out infinite' }} />
          <span className="uppercase"
            style={{ color: s.faint, fontSize: '0.625rem', letterSpacing: '0.2em', fontWeight: 400 }}
          >
            Helsinki, 2026
          </span>
        </div>
      </div>

      <div className="absolute bottom-6" style={{ zIndex: 2 }}>
        <span style={{ color: s.ghost, fontSize: '0.5rem', letterSpacing: '0.15em', fontWeight: 300 }}>&reg;</span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </main>
  )
}

/* ───────────────────────── WHITE PAPER ───────────────────────── */

const TOC = [
  { id: 'where-thoughts', label: 'Where Do Thoughts Come From?' },
  { id: 'losing-agency', label: 'Losing Agency of Thought' },
  { id: 'finance-disconnect', label: 'The Finance Disconnect' },
  { id: 'institutions-fail', label: 'Why Existing Institutions Fail' },
  { id: 'esg-lip-service', label: 'ESG: Lip Service' },
  { id: 'bohm-implicate', label: 'Bohm\'s Implicate Order' },
  { id: 'think-upstream', label: 'Think Upstream' },
  { id: 'physical-space', label: 'The Physical Space: Upstream and Downstream' },
  { id: 'thought-initiators', label: 'About the Authors' },
]

function WhitePaper() {
  const { theme } = useTheme()
  const { navigate } = useNav()
  const [ready, setReady] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const s = v(theme)

  const handleDownload = async () => {
    try {
      setDownloading(true)
      await generateWhitePaperPdf()
      setDownloading(false)
      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 3500)
    } catch (err) {
      console.error('Direct PDF download error:', err)
      setDownloading(false)
      try {
        window.print()
      } catch (printErr) {
        console.error('Print call blocked or failed:', printErr)
      }
    }
  }

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    const timer = setTimeout(() => setReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`min-h-screen relative transition-colors duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
      style={{ transitionProperty: 'opacity, background-color, color', background: s.bg, color: s.text }}
    >
      <NordicForest color={s.forestWP} />
      <Grain />

      {/* Hero */}
      <header className="pt-24 pb-8 sm:pt-32 sm:pb-12 md:pt-36 md:pb-16 px-4 sm:px-6 md:px-12 max-w-3xl mx-auto text-center">
        <p className="uppercase mb-6 sm:mb-8"
          style={{ color: s.muted, fontSize: '0.625rem', letterSpacing: '0.3em', fontWeight: 600 }}
        >
          Think Upstream
        </p>
        <h1 style={{ fontSize: 'clamp(1.75rem, 6vw, 3.25rem)', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
          Where Do Thoughts Come From?
        </h1>
        <p className="mt-4 sm:mt-5 max-w-lg mx-auto px-2"
          style={{ color: s.muted, fontSize: 'clamp(0.8125rem, 2vw, 1rem)', fontWeight: 300, letterSpacing: '0.01em', lineHeight: 1.65 }}
        >
          A New School of Thought for Finance, Policy, Planetary Regeneration, Science, and Technology
        </p>
        <div className="flex items-center justify-center gap-4 sm:gap-7 mt-8 sm:mt-10 flex-wrap"
          style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.03em', lineHeight: 1.6, color: s.text }}
        >
          <div className="inline-flex items-center gap-2.5">
            <img
              src="/assets/aistudio/ST_-_Black_Japan_6033a488.png"
              alt="Sagar Tandon"
              className="w-8 h-8 rounded-full object-cover ring-1 shadow-sm"
              style={{ borderColor: s.divider }}
            />
            <div className="text-left">
              <span className="whitespace-nowrap font-medium block">Sagar Tandon</span>
              <a
                href="mailto:s@threadsunite.xyz"
                className="text-[11px] block transition-opacity hover:opacity-80 underline decoration-dotted"
                style={{ color: s.muted }}
              >
                s@threadsunite.xyz
              </a>
            </div>
          </div>
          <span style={{ color: s.ghost }}>&bull;</span>
          <div className="inline-flex items-center gap-2.5">
            <img
              src="/assets/aistudio/Paavo_02c44543.webp"
              alt="Paavo Pylkkänen"
              className="w-8 h-8 rounded-full object-cover ring-1 shadow-sm"
              style={{ borderColor: s.divider }}
            />
            <div className="text-left">
              <span className="whitespace-nowrap font-medium block">Paavo Pylkk&auml;nen</span>
              <a
                href="mailto:paavo.pylkkanen@helsinki.fi"
                className="text-[11px] block transition-opacity hover:opacity-80 underline decoration-dotted"
                style={{ color: s.muted }}
              >
                paavo.pylkkanen@helsinki.fi
              </a>
            </div>
          </div>
          <span style={{ color: s.ghost }}>&bull;</span>
          <div className="inline-flex items-center gap-2.5">
            <img
              src="/assets/aistudio/Elina_49532e99.webp"
              alt="Elina Pylkkänen"
              className="w-8 h-8 rounded-full object-cover ring-1 shadow-sm"
              style={{ borderColor: s.divider }}
            />
            <div className="text-left">
              <span className="whitespace-nowrap font-medium block">Elina Pylkk&auml;nen</span>
              <a
                href="mailto:ElinaAP@proton.me"
                className="text-[11px] block transition-opacity hover:opacity-80 underline decoration-dotted"
                style={{ color: s.muted }}
              >
                ElinaAP@proton.me
              </a>
            </div>
          </div>
        </div>
        <p className="mt-3" style={{ color: s.faint, fontSize: '0.6875rem', fontWeight: 300, letterSpacing: '0.04em' }}>
          Helsinki, Finland
        </p>

        {/* Action button bar */}
        <div className="mt-7 flex items-center justify-center gap-3 sm:gap-4 flex-wrap no-print">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            style={{
              background: s.text,
              color: s.bg,
              border: `1px solid ${s.text}`,
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
            }}
          >
            {downloading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check size={14} />
                <span>PDF Downloaded!</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Download White Paper (PDF)</span>
              </>
            )}
          </button>
          <button
            onClick={() => navigate('thinkroom')}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded transition-all duration-300"
            style={{
              background: 'transparent',
              color: s.muted,
              border: `1px solid ${s.divider}`,
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = s.text
              e.currentTarget.style.color = s.text
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = s.divider
              e.currentTarget.style.color = s.muted
            }}
          >
            <span>Explore Think Room &rarr;</span>
          </button>
        </div>

        <p className="mt-3 text-[11px] no-print" style={{ color: s.faint }}>
          Direct PDF download &bull;{' '}
          <button
            onClick={() => {
              try {
                window.print()
              } catch (e) {
                console.error('Print call blocked:', e)
              }
            }}
            className="underline hover:opacity-80 cursor-pointer"
            style={{ background: 'none', border: 'none', color: s.muted, fontSize: 'inherit', padding: 0 }}
          >
            or print via browser
          </button>
        </p>
      </header>

      {/* Table of Contents */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-12 mb-12 sm:mb-16">
        <div style={{ borderTop: `1px solid ${s.divider}`, borderBottom: `1px solid ${s.divider}` }} className="py-6 sm:py-8">
          <p className="uppercase mb-4 sm:mb-5" style={{ color: s.faint, fontSize: '0.625rem', letterSpacing: '0.2em', fontWeight: 600 }}>Index</p>
          <ol className="space-y-2 sm:space-y-3">
            {TOC.map((item, i) => (
              <li key={item.id}>
                <button
                  onClick={e => { e.preventDefault(); scrollTo(item.id) }}
                  className="transition-colors duration-300 cursor-pointer text-left w-full py-1.5 px-1 rounded sm:rounded-none"
                  style={{ color: s.muted, fontSize: '0.8125rem', fontWeight: 400, letterSpacing: '0.02em', lineHeight: 1.5, background: 'none', border: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = s.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = s.muted)}
                >
                  <span style={{ color: s.faint, marginRight: '0.75rem', fontSize: '0.75rem' }}>{String(i + 1).padStart(2, '0')}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Body */}
      <article
        className="max-w-2xl mx-auto px-4 sm:px-6 md:px-12 pb-24 sm:pb-32"
        style={{ fontSize: 'clamp(0.9375rem, 2.2vw, 1.0625rem)', fontWeight: 300, lineHeight: 1.85, color: s.text }}
      >
        <WPSection id="where-thoughts" title="Where Do Thoughts Come From?">
          <WPChart src="/charts/thought-starting-point.png" alt="Thought as the Starting Point" />
          <p>Where do thoughts come from? How do thoughts define the physical world we live in? Do we even think critically about our thoughts before jumping on the bandwagon to research basic sciences, innovate, create, and scale technologies, or even finance the sciences and technologies and seek returns from that?</p>
          <p>As David Bohm eloquently put it,</p>
          <blockquote className="my-6 pl-5 italic" style={{ borderLeft: `1px solid ${s.divider}`, color: s.muted }}>
            <p>&ldquo;Thought is the ultimate origin or source; if we don&rsquo;t do anything about thought, we won&rsquo;t get anywhere. We may momentarily relieve the population problem, the ecological problem, and so on, but they will come back in another way.&rdquo;</p>
          </blockquote>
          <p>Thought is the starting point; if we put thought out of the window while trying to do research, innovate, or create something, we are not really going beyond the thought that is already embedded in our conscious/unconscious mind, and that affects everything; hence, the abstractions we get out of the thoughts will be affected, and hence overall perception will be affected too.</p>
        </WPSection>

        <WPSection id="losing-agency" title="Losing Agency of Thought">
          <WPChart src="/charts/losing-agency.png" alt="Losing Agency of Thought" />
          <p>With the advent of mindless scrolling because of social media, dopamine hits and instant gratification from LLMs, agents, and chatbots are numbing us; it is slowing the thinking process but most importantly it is damaging our thoughts to even refresh or reboot, and challenge the assumptions of our own thoughts and start a thought process from scratch. We are slowly handing over agency of thought to the machine, in the name of artificial intelligence, that is still nothing but 0s and 1s, a black box to recognize patterns to spit out a cohesive-sounding sentence, but it is not thought, and if it is not, worth contemplating on as it misses the human ingenuity. The discoveries are not made on just some data and previous thoughts, but breakthroughs come to live when we can push boundaries of thought.</p>
        </WPSection>

        <WPSection id="finance-disconnect" title="The Finance Disconnect">
          <WPChart src="/charts/great-divorce.png" alt="The Great Divorce" />
          <p>The world of finance that I come from is not just a passive culprit, but actively involved in destroying the very essence of human principles, not because it is inherently evil, but rather because of the thought, or the lack of challenging, the status quo. Several assumptions about the current form of finance and capitalism are purely based on the opinions of neo-liberal economists like Milton Friedman, which have been overly amplified and adopted without knowing the facts or challenging the thoughts not just enough, but not at all, and that is the core issue, which has rotten the field of finance. With time, it has become more and more disconnected from the real world and the reality that humans live in and where nature exists.</p>
          <p>Think tanks have become key in propagating a certain way of thinking, and it affects not just policymakers and capitalists but also ordinary people; it is so deeply entrenched now that we have lost the ability to think. From quantum computers to basic science, innovation and technological advancement have loosened our grip on thinking; as a result, we haphazardly fund abstractions, which shapes our worldview of the real world and the reality we live in.</p>
          <p>We are living through the &ldquo;Great Divorce&rdquo;: the decoupling of the capital markets from the productive, real-world economy. When the Price-to-Earnings (PE) ratio rises to historically high levels, the real-world disconnect happens. And right now, that disconnect is threatening to send net real value creation &ldquo;into the toilet.&rdquo;</p>
          <p>In the race between labor and capital, capital is lapping the field. Last year, real wages &mdash; the actual purchasing power of the average American worker &mdash; fell by 0.3% in a single month, reversing years of hard-won gains. Meanwhile, those sitting on assets saw a windfall. If you had your money in the S&amp;P 500, you enjoyed an 18% return. To put that in human terms: the passive return on a $50,000 portfolio generated more income last year than the annual raise of a median worker. This is value extraction over value creation.</p>
          <p>This has adverse effects on everything in the real world we live in&mdash;the world that is getting shaped by flawed thoughts, hence abstractions, overall affecting our perceptions.</p>
        </WPSection>

        <WPSection id="institutions-fail" title="Why Existing Institutions Fail">
          <WPChart src="/charts/institutions-fail.png" alt="Why Existing Institutions Fail" />
          <p>Institutions like the Hoover Institution, the Cato Institute, and the Brookings Institution operate on assumptions and ideas largely rooted in the Newtonian paradigm. They view the economy as a mechanistic system, devoid of humans and nature, and as independent agents, which is further from the truth. They optimize for maximum extraction in the name of shareholder value creation, as if that is the ultimate motto for human existence, survival, and purpose, which affects humanity in profound ways, as it challenges not only the role of the state but also challenges the role of even humans. It is based on the premise of only one thought, shareholder increase in dollar terms, which is a very short-sighted thing to do as it could be argued they support long-term shareholder destruction in value, as there is no value for the shareholder when there is no stable state to live, humans not flourishing and nature is dying.</p>
          <p>These institutions seek to make extraction more palatable, not to replace extraction with regeneration, by looking at the interconnectedness of the system, and that the system change starts with the one thought, as it is the starting point, that affects the inner system and hence affects the whole system essentially, as everything is entangled with each other in profound ways.</p>
        </WPSection>

        <WPSection id="esg-lip-service" title="ESG: Lip Service">
          <WPChart src="/charts/esg-lip-service.png" alt="ESG: Lip Service" />
          <p>To me, the response to these neo-liberal thoughts in the form of ESG and impact investing is nothing but lip service, as this is often fragmented thought in action, applying a thin ethical veneer to the same extractive capital structures, which are based on one thought of shareholder optimization in the short term, forgetting what will happen in a generation or so. They accept a false dichotomy that doing good requires sacrificing financial return; this is also a fear-based assumption, not a factual one. They lack a rigorous philosophical arm; hence, they deploy capital without challenging the legal and ontological frameworks that make extraction possible in the first place.</p>
        </WPSection>

        <WPSection id="bohm-implicate" title="Bohm's Implicate Order — Entanglement">
          <p>David Bohm didn&rsquo;t see reality as individual parts bumping into each other; rather, he saw them as one cohesive system, entangled with each other, like one unbroken, flowing whole, like a river, which he essentially called an implicate order. In essence, our thoughts and the world are not two different things; they are essentially one and deeply entangled. They are ONE system: the inner system&mdash;our thoughts, assumptions, perceptions, and abstraction&mdash;and the outer system i.e., finance, society, nature, technology) are not separate, but are deeply entangled.</p>
          <p>Most of us try to change the outer system without realizing the underlying thought hasn&rsquo;t changed; the outer system just rearranges itself into the same old patterns because we haven&rsquo;t effectively changed our inner system of thoughts. If we shift the inner system, it reshapes the whole outer system. Also, when we change the outer system, it changes the inner system and feeds back into thought; it becomes a loop, not a line.</p>
          <p style={{ fontWeight: 500 }}>We can&rsquo;t fix the world without fixing the thought first.</p>
          <p>That&rsquo;s the whole point&mdash;we need to go upstream to the source; there is no other alternative.</p>
        </WPSection>

        <WPSection id="think-upstream" title="Think Upstream">
          <p>We need to think upstream: fuse philosophy with rigorous research through challenging thought and dialogue, and deploy capital in ways that push science beyond the current limits of our thinking, fund breakthroughs, and compound impact for humanity and nature.</p>
          <p>Essentially, Upstream Institute has three legs:</p>
          <WPChart src="/charts/three-legs.png" alt="Upstream Institute Three Legs" />
          
          <WPSubSection title="Think & Dialogue">
            <WPChart src="/charts/leg1-think-dialogue.png" alt="Leg 1: Think and Dialogue" />
            <p>Pushing the boundaries of thought by bringing dialogue back.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Content &mdash; Books, Podcasts</li>
              <li>Research Papers, White Papers</li>
              <li>Event Properties</li>
            </ul>
          </WPSubSection>

          <WPSubSection title="Social Policy Lab">
            <WPChart src="/charts/leg2-social-policy.png" alt="Leg 2: Social Policy Lab" />
            <p>Leveraging Finland&rsquo;s/Nordics unique administrative infrastructure, the Lab treats the nation as a living laboratory to experiment with ideas.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Population-Scale Testing</li>
              <li>Environmental-Scale Testing</li>
            </ul>
          </WPSubSection>

          <WPSubSection title="Capital Deployment">
            <WPChart src="/charts/leg3-capital-deployment.png" alt="Leg 3: Capital Deployment" />
            <p>That funds the research, basic sciences, innovation, and technology.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Funds researchers &mdash; basic sciences and philosophers in the form of grants</li>
              <li>Outcome Bonds to prove entanglement in the form of debt linked to impact outcomes</li>
              <li>SME Patient Capital Vehicles: Debt and equity hybrids that provide permanent capital to small and medium enterprises, prioritizing community resilience over extractive buyouts.</li>
              <li>Funding the Deep-tech in unusual ways with a long-term mindset and value creation for humanity and nature.</li>
            </ul>
          </WPSubSection>

          <WPChart src="/charts/causal-chain.png" alt="Full Causal Chain: From Problem to Solution" />
        </WPSection>

        <WPSection id="physical-space" title="The Physical Space: Upstream and Downstream">
          <p>The physical space we have acquired can be divided into two parts:</p>
          <WPChart src="/assets/aistudio/Spatial_layout_b50cf1a8.png" alt="Spatial Layout: Upstream Lab (Think), The Bridge, and Downstream Lab (Do)" />

          {/* Aerial Sanctuary Photo */}
          <figure className="my-8 sm:my-10 -mx-2 sm:-mx-4 md:-mx-6">
            <img
              src="/assets/aistudio/27_Ilmakuva_talo_ja_jarvi_36164b51.jpg"
              alt="The Upstream Sanctuary: Lakeside estate and Finnish forest"
              className="w-full rounded shadow-sm object-cover max-h-[500px]"
              style={{ border: `1px solid ${s.divider}` }}
              loading="lazy"
            />
            <figcaption className="text-center text-xs mt-2.5 italic" style={{ color: s.muted }}>
              The Upstream Sanctuary: Lakeside estate surrounded by Finnish pine forest for contemplative thinking and dialogue.
            </figcaption>
          </figure>

          <WPSubSection title="Upstream Lab - Think">
            <p>
              Think &amp; Dialogue Forum will run workshops in cohorts of 15-25 people, wherein Paavo will focus on using principles of David Bohm to conduct dialogue exercises to allow us to activate our thoughts and help us decouple from our biases and memory so that we can start the thinking process from scratch, from zero, from singularity. Additionally, Paavo will use other great philosophers&rsquo; and scientists&rsquo; works to activate the thinking process, as David Bohm pointed out that thoughts are the root cause of all our problems.
            </p>
            <p>
              Ideal participants will be philanthropists, large capital owners, corporate C-suite leaders, economists, scientists, and politicians.
            </p>
            <p>
              The Upstream Lab is critical before anything we do because we have become slaves to thought; thought is like fire: it is a good servant but a bad master.
            </p>

            {/* Living Salon Photo */}
            <figure className="my-6">
              <img
                src="/assets/aistudio/5_Olohuone_c5ff14de.jpg"
                alt="Upstream Dialogue Salon"
                className="w-full rounded shadow-sm object-cover max-h-[440px]"
                style={{ border: `1px solid ${s.divider}` }}
                loading="lazy"
              />
              <figcaption className="text-center text-xs mt-2 italic" style={{ color: s.muted }}>
                Upstream Dialogue Salon: Facilitating Bohmian dialogue and deep reflection with views of forest and water.
              </figcaption>
            </figure>
          </WPSubSection>

          <WPSubSection title="Downstream Lab - Do">
            <p>
              Sagar and Elina will complement Paavo to bring back from the upstream thinking process to downstream, practical issues, wherein, with new, fresh thoughts and thinking, the participants will delve into working on potential solutions and try to connect the dots with the real-world issues that are being faced by society, the environment, and nature at large. They will also explore how we can push the boundaries of science and technology in ways that serve humanity rather than become a destructive force.
            </p>

            {/* Creative Studio Photo */}
            <figure className="my-6">
              <img
                src="/assets/aistudio/23_Studio_6e886580.jpg"
                alt="Downstream Lab Creative Studio"
                className="w-full rounded shadow-sm object-cover max-h-[440px]"
                style={{ border: `1px solid ${s.divider}` }}
                loading="lazy"
              />
              <figcaption className="text-center text-xs mt-2 italic" style={{ color: s.muted }}>
                Downstream Studio &amp; Lab: Active prototyping, multi-disciplinary media, science, and practical synthesis.
              </figcaption>
            </figure>

            <p>
              We can&rsquo;t mindlessly have policies, science, and technology advancement without upstream thinking, as Bohm rightly pointed out in the book, <em>Changing Consciousness</em>:
            </p>
            <blockquote className="my-6 px-4 text-center italic" style={{ color: s.text, fontStyle: 'italic' }}>
              &ldquo;The more we automate industry, the more we isolate people, and the more routine, on the whole, people&rsquo;s work becomes, producing less satisfaction for people in their work and less meaning in their lives.&rdquo;
            </blockquote>
            <p className="text-center font-bold mt-6" style={{ fontWeight: 700, color: s.text }}>
              From Finland, we invite the world to think upstream.
            </p>
          </WPSubSection>
        </WPSection>

        {/* Authors - at the END */}
        <section id="thought-initiators" className="mb-14 sm:mb-20 md:mb-24" style={{ scrollMarginTop: '5rem' }}>
          <h2 className="mb-6 sm:mb-8" style={{ fontSize: 'clamp(1.125rem, 4vw, 1.375rem)', fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1.35 }}>
            About the Authors
          </h2>

          <div className="space-y-6 sm:space-y-8">
            {/* Sagar Tandon */}
            <div
              className="p-6 sm:p-7 rounded-lg transition-all duration-300"
              style={{
                border: `1px solid ${s.divider}`,
                background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
              }}
            >
              <div className="flex items-center gap-4 sm:gap-5 mb-4">
                <img
                  src="/assets/aistudio/ST_-_Black_Japan_6033a488.png"
                  alt="Sagar Tandon"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0 shadow-md ring-2"
                  style={{ borderColor: s.divider }}
                />
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl leading-tight" style={{ color: s.text }}>
                    Sagar Tandon
                  </h3>
                  <a
                    href="mailto:s@threadsunite.xyz"
                    className="inline-flex items-center gap-1.5 mt-1.5 text-xs sm:text-sm transition-colors hover:underline"
                    style={{ color: s.muted }}
                  >
                    <Mail size={13} className="opacity-70 flex-shrink-0" />
                    <span>s@threadsunite.xyz</span>
                  </a>
                </div>
              </div>
              <p className="text-sm sm:text-[15px] leading-relaxed" style={{ color: s.muted }}>
                Sagar is an impact investor and capital allocator with more than a decade of global experience (emerging and developed markets) building impact funds, investing in more than 25+ impact ventures, and an active board member in three companies in the EU and one in South Korea.
              </p>
            </div>

            {/* Paavo Pylkkänen */}
            <div
              className="p-6 sm:p-7 rounded-lg transition-all duration-300"
              style={{
                border: `1px solid ${s.divider}`,
                background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
              }}
            >
              <div className="flex items-center gap-4 sm:gap-5 mb-4">
                <img
                  src="/assets/aistudio/Paavo_02c44543.webp"
                  alt="Paavo Pylkkänen"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0 shadow-md ring-2"
                  style={{ borderColor: s.divider }}
                />
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl leading-tight" style={{ color: s.text }}>
                    Paavo Pylkk&auml;nen
                  </h3>
                  <a
                    href="mailto:paavo.pylkkanen@helsinki.fi"
                    className="inline-flex items-center gap-1.5 mt-1.5 text-xs sm:text-sm transition-colors hover:underline"
                    style={{ color: s.muted }}
                  >
                    <Mail size={13} className="opacity-70 flex-shrink-0" />
                    <span>paavo.pylkkanen@helsinki.fi</span>
                  </a>
                </div>
              </div>
              <p className="text-sm sm:text-[15px] leading-relaxed" style={{ color: s.muted }}>
                Paavo is a distinguished philosopher whose decades of work on physicist David Bohm&rsquo;s theories of quantum physics and consciousness provide the ontological foundation for the Upstream Institute. He has extensively researched the concept of the &ldquo;Implicate Order&rdquo;&mdash;the view that reality is an unbroken, flowing whole rather than a collection of isolated parts. At the Institute, Paavo directs intellectual coherence, ensuring that all research, policy design, and capital deployment transcend the limitations of fragmented, mechanical thought.
              </p>
            </div>

            {/* Elina Pylkkänen */}
            <div
              className="p-6 sm:p-7 rounded-lg transition-all duration-300"
              style={{
                border: `1px solid ${s.divider}`,
                background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
              }}
            >
              <div className="flex items-center gap-4 sm:gap-5 mb-4">
                <img
                  src="/assets/aistudio/Elina_49532e99.webp"
                  alt="Elina Pylkkänen"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0 shadow-md ring-2"
                  style={{ borderColor: s.divider }}
                />
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl leading-tight" style={{ color: s.text }}>
                    Elina Pylkk&auml;nen
                  </h3>
                  <a
                    href="mailto:ElinaAP@proton.me"
                    className="inline-flex items-center gap-1.5 mt-1.5 text-xs sm:text-sm transition-colors hover:underline"
                    style={{ color: s.muted }}
                  >
                    <Mail size={13} className="opacity-70 flex-shrink-0" />
                    <span>ElinaAP@proton.me</span>
                  </a>
                </div>
              </div>
              <p className="text-sm sm:text-[15px] leading-relaxed" style={{ color: s.muted }}>
                Elina is a distinguished economist currently serving as Under-Secretary of State at Finland&rsquo;s Ministry of Economic Affairs and Employment. She holds a PhD in Economics and has previously served as Director of the Labor Institute for Economic Research (LABORE), Senior Economist at the OECD in Paris, and Visiting Scholar at Stanford University. Elina brings unparalleled expertise in labor markets, taxation, and social policy design. She leads the Upstream Nordic Social Policy Research Lab, translating philosophical frameworks into rigorous, population-scale economic interventions.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Back & Nav Buttons */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 no-print">
          <button
            onClick={() => navigate('landing')}
            className="w-full sm:w-auto cursor-pointer transition-all duration-300"
            style={{
              padding: '0.7rem 2rem',
              border: `1px solid ${s.muted}`,
              borderRadius: '2px',
              background: 'transparent',
              color: s.text,
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = s.text)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = s.muted)}
          >
            &larr; Back to Home
          </button>
          <button
            onClick={() => navigate('thinkroom')}
            className="w-full sm:w-auto cursor-pointer transition-all duration-300"
            style={{
              padding: '0.7rem 2rem',
              border: `1px solid ${s.divider}`,
              borderRadius: '2px',
              background: 'transparent',
              color: s.muted,
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = s.text
              e.currentTarget.style.color = s.text
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = s.divider
              e.currentTarget.style.color = s.muted
            }}
          >
            Explore Think Room &rarr;
          </button>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-8" style={{ borderTop: `1px solid ${s.divider}` }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p style={{ color: s.text, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em' }}>
                The Upstream Institute
              </p>
              <p style={{ color: s.faint, fontSize: '0.6875rem', fontWeight: 300 }}>
                Helsinki, Finland
              </p>
            </div>
            <p style={{ color: s.faint, fontSize: '0.6875rem', fontWeight: 300, letterSpacing: '0.04em' }}>
              A New School of Thought &bull; Intergenerational Impact
            </p>
          </div>
        </footer>
      </article>
    </div>
  )
}

/* ───────────────────────── WHITE PAPER COMPONENTS ───────────────────────── */

function WPChart({ src, alt }: { src: string; alt: string }) {
  const { theme } = useTheme()
  const s = v(theme)
  return (
    <figure className="wp-chart-container my-8 sm:my-10 -mx-2 sm:-mx-4 md:-mx-6">
      <img
        src={src}
        alt={alt}
        className="w-full rounded"
        style={{ border: `1px solid ${s.divider}` }}
        loading="lazy"
      />
    </figure>
  )
}

function WPSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 sm:mb-16 md:mb-20" style={{ scrollMarginTop: '5rem' }}>
      <h2 className="mb-6 sm:mb-8" style={{ fontSize: 'clamp(1.125rem, 4vw, 1.375rem)', fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1.35 }}>
        {title}
      </h2>
      <div className="space-y-4 sm:space-y-5">{children}</div>
    </section>
  )
}

function WPSubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 sm:mb-8 last:mb-0">
      <h3 className="mb-2.5 sm:mb-3" style={{ fontSize: 'clamp(0.9375rem, 2.8vw, 1.0625rem)', fontWeight: 600, letterSpacing: '0.01em', lineHeight: 1.45 }}>
        {title}
      </h3>
      <div className="space-y-3.5 sm:space-y-4">{children}</div>
    </div>
  )
}

function WPAuthor({ name, role, children }: { name: string; role?: string; children: React.ReactNode }) {
  const { theme } = useTheme()
  const s = v(theme)
  return (
    <div className="wp-author-card mb-6 sm:mb-8 last:mb-0">
      <p className="flex flex-wrap items-baseline gap-x-2" style={{ fontWeight: 600, lineHeight: 1.5 }}>
        <span dangerouslySetInnerHTML={{ __html: name }} />
        {role ? <span style={{ color: s.faint, fontSize: '0.875em' }}>| {role}</span> : null}
      </p>
      <p className="mt-2">{children}</p>
    </div>
  )
}

/* ───────────────────────── THINK ROOM ───────────────────────── */

const THINK_ROOM_AUTHORS = [
  { id: 'all', name: 'All Authors', photo: null },
  { id: 'sagar', name: 'Sagar Tandon', photo: '/assets/aistudio/ST_-_Black_Japan_6033a488.png' },
  { id: 'paavo', name: 'Paavo Pylkk\u00e4nen', photo: '/assets/aistudio/Paavo_02c44543.webp' },
  { id: 'elina', name: 'Elina Pylkk\u00e4nen', photo: '/assets/aistudio/Elina_49532e99.webp' },
]

function ThinkRoom() {
  const { theme } = useTheme()
  const { navigate } = useNav()
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all')
  const [ready, setReady] = useState(false)
  const s = v(theme)

  useEffect(() => {
    window.scrollTo(0, 0)
    const timer = setTimeout(() => setReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const currentAuthor = THINK_ROOM_AUTHORS.find(a => a.id === selectedAuthor) || THINK_ROOM_AUTHORS[0]

  return (
    <div
      className={`min-h-screen relative transition-colors duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
      style={{ transitionProperty: 'opacity, background-color, color', background: s.bg, color: s.text }}
    >
      <NordicForest color={s.forestWP} />
      <Grain />

      {/* Main Container */}
      <main className="pt-24 pb-24 sm:pt-32 sm:pb-32 px-4 sm:px-6 md:px-12 max-w-4xl mx-auto relative" style={{ zIndex: 2 }}>
        {/* Header */}
        <header className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
          <p className="uppercase mb-4"
            style={{ color: s.muted, fontSize: '0.625rem', letterSpacing: '0.3em', fontWeight: 600 }}
          >
            Upstream Archive
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.15 }}>
            Think Room
          </h1>
          <p className="mt-4 max-w-lg mx-auto"
            style={{ color: s.muted, fontSize: 'clamp(0.875rem, 2vw, 1.05rem)', fontWeight: 300, letterSpacing: '0.01em', lineHeight: 1.7 }}
          >
            A salon of active thought, dialogue transcripts, and field writings exploring the root of thought, capital allocation, and planetary regeneration.
          </p>
        </header>

        {/* Author Filters */}
        <div className="max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4"
            style={{ borderBottom: `1px solid ${s.divider}` }}
          >
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold" style={{ color: s.faint }}>
              Filter by Author
            </span>
            <span className="text-xs" style={{ color: s.muted }}>
              {selectedAuthor === 'all' ? 'All contributors' : `Filtered by: ${currentAuthor.name}`}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {THINK_ROOM_AUTHORS.map(author => {
              const isActive = selectedAuthor === author.id
              return (
                <button
                  key={author.id}
                  onClick={() => setSelectedAuthor(author.id)}
                  className="cursor-pointer transition-all duration-200 px-3.5 py-1.5 rounded-full text-xs tracking-wider uppercase font-medium flex items-center gap-1.5"
                  style={{
                    background: isActive ? s.text : 'transparent',
                    color: isActive ? s.bg : s.muted,
                    border: `1px solid ${isActive ? s.text : s.divider}`,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = s.muted
                      e.currentTarget.style.color = s.text
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = s.divider
                      e.currentTarget.style.color = s.muted
                    }
                  }}
                >
                  {isActive && <Check size={12} className="stroke-[2.5]" />}
                  {author.photo && (
                    <img
                      src={author.photo}
                      alt={author.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  )}
                  <span>{author.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Empty State Card */}
        <section
          className="max-w-2xl mx-auto p-8 sm:p-12 md:p-14 text-center rounded border transition-colors duration-300"
          style={{
            borderColor: s.divider,
            background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
          }}
        >
          <div
            className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-6"
            style={{ border: `1px solid ${s.divider}`, color: s.muted }}
          >
            <BookOpen size={20} className="stroke-[1.5]" />
          </div>

          <p className="uppercase text-[11px] font-semibold tracking-[0.25em] mb-3" style={{ color: s.faint }}>
            Inquiries in Progress
          </p>

          <h2 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: s.text }}>
            {selectedAuthor === 'all'
              ? 'No essays published yet'
              : `No essays published yet by ${currentAuthor.name}`}
          </h2>

          <p className="text-sm leading-relaxed max-w-md mx-auto mb-8 font-light" style={{ color: s.muted }}>
            {selectedAuthor === 'all' && (
              <>
                The Think Room is currently empty while our initial dialogue papers and field inquiries are being prepared. Forthcoming essays by Sagar Tandon, Paavo Pylkk&auml;nen, and Elina Pylkk&auml;nen will appear here.
              </>
            )}
            {selectedAuthor === 'sagar' && (
              <>
                Sagar Tandon&rsquo;s upcoming writings on catalytic capital allocation, venture ecosystems, and bridging upstream philosophical inquiry with downstream systemic impact will be published here.
              </>
            )}
            {selectedAuthor === 'paavo' && (
              <>
                Paavo Pylkk&auml;nen&rsquo;s upcoming essays delving into David Bohm&rsquo;s implicate order, philosophy of physics and mind, and dialogue exercises to decouple thought from memory will appear here.
              </>
            )}
            {selectedAuthor === 'elina' && (
              <>
                Elina Pylkk&auml;nen&rsquo;s upcoming papers addressing economic frameworks, labor dynamics, and public policy through holistic systems thinking will be archived here.
              </>
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
            style={{ borderTop: `1px solid ${s.divider}` }}
          >
            <button
              onClick={() => navigate('white-paper')}
              className="cursor-pointer transition-all duration-300 px-4 py-2 rounded text-xs uppercase tracking-wider font-medium"
              style={{
                border: `1px solid ${s.text}`,
                background: s.text,
                color: s.bg,
              }}
            >
              Read Think Upstream White Paper
            </button>
            <a
              href="mailto:s@threadsunite.xyz"
              className="transition-colors duration-300 px-4 py-2 rounded text-xs uppercase tracking-wider font-medium text-center"
              style={{
                border: `1px solid ${s.divider}`,
                color: s.muted,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = s.text
                e.currentTarget.style.color = s.text
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = s.divider
                e.currentTarget.style.color = s.muted
              }}
            >
              Inquire / Propose Dialogue
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-2xl mx-auto mt-20 pt-8" style={{ borderTop: `1px solid ${s.divider}` }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p style={{ color: s.text, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em' }}>
                The Upstream Institute
              </p>
              <p style={{ color: s.faint, fontSize: '0.6875rem', fontWeight: 300 }}>
                Helsinki, Finland
              </p>
            </div>
            <p style={{ color: s.faint, fontSize: '0.6875rem', fontWeight: 300, letterSpacing: '0.04em' }}>
              Think Room Archive &bull; Active Thought
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}

/* ───────────────────────── ROUTER ───────────────────────── */

function getInitialView(): View {
  if (typeof window === 'undefined') return 'landing'
  const path = window.location.pathname.toLowerCase()
  const hash = window.location.hash.toLowerCase()
  if (path.includes('/thinkroom') || hash === '#thinkroom') return 'thinkroom'
  if (hash === '#white-paper' || path.includes('/white-paper')) return 'white-paper'
  return 'landing'
}

export default function Home() {
  const [view, setView] = useState<View>(getInitialView)

  const navigate = useCallback((to: View) => {
    setView(to)
    if (typeof window !== 'undefined') {
      if (to === 'thinkroom') {
        window.history.pushState({}, '', '/thinkroom')
      } else if (to === 'white-paper') {
        window.history.pushState({}, '', '/#white-paper')
      } else {
        window.history.pushState({}, '', '/')
      }
      window.scrollTo(0, 0)
    }
  }, [])

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase()
      const hash = window.location.hash.toLowerCase()
      if (path.includes('/thinkroom') || hash === '#thinkroom') {
        setView('thinkroom')
      } else if (hash === '#white-paper' || path.includes('/white-paper')) {
        setView('white-paper')
      } else {
        setView('landing')
      }
    }

    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [])

  return (
    <ThemeProvider>
      <NavCtx.Provider value={{ view, navigate }}>
        <TopNav />
        <ThemeToggle />
        {view === 'white-paper' && <WhitePaper />}
        {view === 'thinkroom' && <ThinkRoom />}
        {view === 'landing' && <ComingSoon />}
      </NavCtx.Provider>
    </ThemeProvider>
  )
}

