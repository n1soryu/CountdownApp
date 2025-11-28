import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Clock,
  Heart,
  Moon,
  Plus,
  Sparkles,
} from 'lucide-react'
import clsx from 'clsx'
import { addDays, format, isValid, parseISO } from 'date-fns'

const STORAGE_KEY = 'ldr-events'

const seedEvents = [
  {
    id: 'next-trip',
    title: 'Next Flight to Her',
    date: addDays(new Date(), 32).toISOString(),
  },
  {
    id: 'anniversary',
    title: 'Anniversary',
    date: addDays(new Date(), 95).toISOString(),
  },
  {
    id: 'holiday',
    title: 'NYE Together',
    date: addDays(new Date(), 215).toISOString(),
  },
]

const getCountdownParts = (targetDate, now) => {
  const diff = Math.max(targetDate.getTime() - now.getTime(), 0)
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, isPast: diff === 0 }
}

const loadEvents = () => {
  if (typeof window === 'undefined') return seedEvents
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedEvents
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return seedEvents
    return parsed
  } catch {
    return seedEvents
  }
}

const randomId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `evt-${Date.now()}`

const parseEvent = (event) => {
  try {
    const parsed = parseISO(event.date)
    if (!isValid(parsed)) return null
    return { ...event, dateObj: parsed }
  } catch {
    return null
  }
}

const blurBackdrop =
  'bg-white/10 border border-white/15 backdrop-blur-2xl shadow-[0_20px_120px_rgba(76,29,149,0.35)]'

const CountdownUnit = ({ label, value }) => (
  <div className="flex flex-col text-center">
    <span className="text-4xl md:text-6xl font-semibold tracking-tight">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-sm uppercase tracking-[0.3em] text-slate-300">
      {label}
    </span>
  </div>
)

const FloatingIcon = ({ Icon, className }) => (
  <div
    className={clsx(
      'absolute rounded-full bg-white/8 p-3 text-indigo-200 backdrop-blur-xl border border-white/20',
      className,
    )}
  >
    <Icon size={20} />
  </div>
)

function App() {
  const [events, setEvents] = useState(loadEvents)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formValues, setFormValues] = useState({ title: '', date: '' })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  }, [events])

  const parsedEvents = useMemo(
    () =>
      events
        .map(parseEvent)
        .filter(Boolean)
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()),
    [events],
  )

  const upcomingEvents = parsedEvents.filter(
    (event) => event.dateObj.getTime() >= currentTime.getTime(),
  )

  const heroEvent = upcomingEvents[0] ?? parsedEvents.at(-1) ?? null
  const gridEvents = upcomingEvents.filter((evt) => evt.id !== heroEvent?.id)

  const heroCountdown =
    heroEvent && getCountdownParts(heroEvent.dateObj, currentTime)

  const handleSubmit = (event) => {
    event.preventDefault()
    setFormError('')

    if (!formValues.title.trim() || !formValues.date) {
      setFormError('Please add a title and date.')
      return
    }

    const parsedDate = parseISO(formValues.date)
    if (!isValid(parsedDate) || parsedDate.getTime() <= Date.now()) {
      setFormError('Choose a future date.')
      return
    }

    setEvents((prev) => [
      ...prev,
      { id: randomId(), title: formValues.title.trim(), date: parsedDate.toISOString() },
    ])
    setFormValues({ title: '', date: '' })
    setIsModalOpen(false)
  }

  const emptyState = !heroEvent

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950" />
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(99,102,241,0.25),_rgba(67,56,202,0))] blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(236,72,153,0.2),_rgba(67,56,202,0))] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 text-sm tracking-wide text-indigo-200 uppercase">
              <Heart size={16} /> Long Distance Countdown
            </p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl">
              Counting down to our next hello.
            </h1>
            <p className="max-w-xl text-base text-slate-300">
              Track every reunion, anniversary, and special milestone. Your events stay safe in your browser so you can keep the anticipation alive anywhere.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-full border border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-500/20 to-indigo-500/30 px-6 py-3 text-sm font-semibold tracking-wide text-fuchsia-100 transition hover:scale-[1.02] hover:from-fuchsia-500/30 hover:to-indigo-500/40"
          >
            <Plus size={18} /> Add Event
          </button>
        </header>

        {emptyState ? (
          <div
            className={clsx(
              'flex flex-1 flex-col items-center justify-center gap-6 rounded-3xl p-10 text-center fade-in-up',
              blurBackdrop,
            )}
          >
            <Sparkles className="text-fuchsia-200" size={48} />
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-white">
                Ready for your first countdown?
              </h2>
              <p className="text-slate-300">
                Add your next visit, anniversary, or surprise date to begin the countdown journey together.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition hover:bg-white/20"
            >
              Create Event
            </button>
          </div>
        ) : (
          <>
            {heroEvent && (
              <section
                className={clsx(
                  'relative overflow-hidden rounded-3xl p-8 md:p-12 fade-in-up',
                  blurBackdrop,
                )}
              >
                <FloatingIcon Icon={Moon} className="left-10 top-10 animate-pulse" />
                <FloatingIcon Icon={Heart} className="right-10 top-16 animate-spin-slow" />
                <FloatingIcon Icon={CalendarDays} className="bottom-10 left-1/2 -translate-x-1/2" />

                <div className="relative z-10 space-y-6 text-center md:text-left">
                  <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200">
                    Next up
                  </p>
                  <div className="space-y-2">
                    <h2 className="text-4xl font-semibold text-white md:text-5xl">
                      {heroEvent.title}
                    </h2>
                    <p className="text-slate-300">
                      {format(heroEvent.dateObj, 'EEEE, MMMM d, yyyy · p')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                    <CountdownUnit label="Days" value={heroCountdown.days} />
                    <CountdownUnit label="Hours" value={heroCountdown.hours} />
                    <CountdownUnit label="Minutes" value={heroCountdown.minutes} />
                    <CountdownUnit label="Seconds" value={heroCountdown.seconds} />
                  </div>
                </div>
              </section>
            )}

            {!!gridEvents.length && (
              <section className="mt-10 grid gap-6 md:grid-cols-2">
                {gridEvents.map((event) => {
                  const countdown = getCountdownParts(event.dateObj, currentTime)
                  return (
                    <article
                      key={event.id}
                      className={clsx(
                        'flex flex-col gap-4 rounded-2xl p-6 fade-in-up',
                        blurBackdrop,
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-semibold text-white">
                            {event.title}
                          </h3>
                          <p className="text-sm text-slate-300">
                            {format(event.dateObj, 'MMMM d, yyyy')}
                          </p>
                        </div>
                        <div className="rounded-full bg-white/5 p-3 text-sm text-indigo-200">
                          <Clock size={18} />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-center text-slate-200">
                        <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-3">
                          <p className="text-3xl font-semibold">
                            {String(countdown.days).padStart(2, '0')}
                          </p>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                            Days
                          </p>
                        </div>
                        <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-3">
                          <p className="text-xl font-semibold">
                            {String(countdown.hours).padStart(2, '0')}h {String(countdown.minutes).padStart(2, '0')}m
                          </p>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                            Closer
                          </p>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </section>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-10">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-3xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                  New Event
                </p>
                <h3 className="text-2xl font-semibold text-white">Add a date</h3>
              </div>
              <button
                onClick={() => {
                  setFormError('')
                  setIsModalOpen(false)
                }}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="space-y-2 text-sm text-slate-300">
                Title
                <input
                  type="text"
                  name="title"
                  placeholder="Reunion in Paris"
                  value={formValues.title}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-fuchsia-400 focus:outline-none"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300">
                Date & time
                <input
                  type="datetime-local"
                  name="date"
                  value={formValues.date}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                />
              </label>

              {formError && (
                <p className="text-sm text-rose-300">{formError}</p>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg shadow-indigo-900/40 transition hover:scale-[1.01]"
              >
                <Plus size={16} />
                Save event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
