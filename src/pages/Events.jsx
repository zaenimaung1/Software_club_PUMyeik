import { useEffect } from 'react'
import { useEventStore } from '../store/eventStore'

export default function Events() {
  const { events, isLoading, loadFromApi } = useEventStore()

  useEffect(() => {
    loadFromApi()
  }, [loadFromApi])

  return (
    <main className="page">
      <section className="page-hero">
        <div>
          <span className="eyebrow">Event Calendar</span>
          <h1>Upcoming events</h1>
          <p>
            Workshops, demo days, and meetups. Reserve your seat and bring your
            builds.
          </p>
        </div>
        <div className="hero-panel">
          <h3>What to expect</h3>
          <ul>
            <li>Hands-on labs and live coding.</li>
            <li>Peer review and mentorship.</li>
            <li>Portfolio-ready demos.</li>
          </ul>
        </div>
      </section>

      <section className="grid-events">
        {isLoading ? (
          [0, 1, 2, 3].map((item) => (
            <div key={item} className="event-card skeleton-card">
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" />
            </div>
          ))
        ) : events.length ? (
          events.map((event) => (
            <article key={event.id} className="event-card">
              <div className="event-date">{event.date}</div>
              <h2>{event.title}</h2>
              <p>{event.description}</p>
              <div className="event-footer">
                <span>{event.location}</span>
                <button className="button ghost" type="button">
                  Add to calendar
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="muted">No events available yet.</p>
        )}
      </section>
    </main>
  )
}
