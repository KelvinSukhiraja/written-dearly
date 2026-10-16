'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { InvitationOpening } from '@/components/invitation-opening'

const invitation = {
  couple: { first: 'Eleanor', second: 'James' },
  date: 'October 18, 2025',
  dateIso: '2025-10-18T15:00:00',
  story: {
    heading: 'The beginning of always',
    copy: 'We met on a rainy Tuesday at a little bookshop in the city. What began with a shared umbrella and a conversation about our favorite novels has grown into a life filled with long walks, Sunday mornings, and more laughter than we ever imagined.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
    imageAlt: 'Couple walking together outdoors',
  },
  events: [
    { label: 'The ceremony', time: '3:00 PM', venue: 'The Willow Garden', address: '48 Orchard Lane, Hudson Valley', map: 'https://maps.google.com/?q=Hudson+Valley' },
    { label: 'The reception', time: '5:00 PM', venue: 'The Glasshouse', address: '12 River Road, Hudson Valley', map: 'https://maps.google.com/?q=Hudson+Valley' },
  ],
  gallery: [
    ['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=85', 'Couple embracing at sunset'],
    ['https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85', 'Wedding rings and flowers'],
    ['https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=85', 'Couple walking through a field'],
    ['https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=900&q=85', 'Couple sharing a quiet moment'],
    ['https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=900&q=85', 'Hands holding with flowers'],
    ['https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=85', 'Wedding bouquet detail'],
  ],
}

function Countdown() {
  const target = useMemo(() => new Date(invitation.dateIso).getTime(), [])
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    setRemaining(Math.max(0, target - Date.now()))
    const timer = window.setInterval(() => setRemaining(Math.max(0, target - Date.now())), 1000)
    return () => window.clearInterval(timer)
  }, [target])

  const days = Math.floor(remaining / 86400000)
  const hours = Math.floor((remaining % 86400000) / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)

  return (
    <div className="countdown" aria-label={`${days} days until the wedding`}>
      {[['days', days], ['hours', hours], ['minutes', minutes], ['seconds', seconds]].map(([label, value]) => (
        <div className="countdown-item" key={label}>
          <strong>{String(value).padStart(2, '0')}</strong><span>{label}</span>
        </div>
      ))}
    </div>
  )
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="section-heading"><span>{eyebrow}</span><h2>{title}</h2></div>
}

export default function Page() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <InvitationOpening firstName={invitation.couple.first} secondName={invitation.couple.second} date={invitation.date} invitationId="eleanor-james">
    <main>
      <section className="hero" aria-labelledby="wedding-title">
        <div className="hero-overlay" />
        <nav className="nav" aria-label="Main navigation">
          <a href="#top" className="monogram" aria-label="Back to top">E <i>&</i> J</a>
          <div className="nav-links"><a href="#story">Our story</a><a href="#details">Details</a><a href="#rsvp">RSVP</a></div>
        </nav>
        <div className="hero-content" id="top">
          <p className="eyebrow light">Together with their families</p>
          <h1 id="wedding-title"><span>{invitation.couple.first}</span><em>&</em><span>{invitation.couple.second}</span></h1>
          <div className="hero-rule" />
          <p className="hero-date">{invitation.date}</p>
          <Countdown />
        </div>
        <a href="#story" className="scroll-cue" aria-label="Scroll to our story"><span>Scroll to explore</span><i /></a>
      </section>

      <section className="story section" id="story">
        <div className="story-copy"><SectionHeading eyebrow="Chapter one" title={invitation.story.heading} /><p>{invitation.story.copy}</p><span className="signature">E <i>&</i> J</span></div>
        <div className="story-image"><img src={invitation.story.image} alt={invitation.story.imageAlt} /></div>
      </section>

      <section className="details section" id="details">
        <SectionHeading eyebrow="Join us" title="The details" />
        <div className="event-grid">
          {invitation.events.map((event) => <article className="event-card" key={event.label}><span className="event-label">{event.label}</span><h3>{event.venue}</h3><p className="event-time">{event.time}</p><p>{event.address}</p><a href={event.map} target="_blank" rel="noreferrer">View on map <span aria-hidden="true">↗</span></a></article>)}
        </div>
      </section>

      <section className="gallery section" aria-labelledby="gallery-title">
        <SectionHeading eyebrow="A few favorite moments" title="Our gallery" />
        <div className="gallery-grid">{invitation.gallery.map(([src, alt], index) => <figure className={`gallery-item gallery-${index + 1}`} key={src}><img src={src} alt={alt} loading="lazy" /></figure>)}</div>
      </section>

      <section className="rsvp section" id="rsvp">
        <div className="rsvp-inner"><SectionHeading eyebrow="We hope you can join us" title="Kindly RSVP" />
          {submitted ? <div className="confirmation"><span className="confirmation-mark">✓</span><h3>Thank you, we have your reply.</h3><p>We can&apos;t wait to celebrate with you.</p><button type="button" onClick={() => setSubmitted(false)}>Edit response</button></div> : <form onSubmit={handleSubmit}><div className="form-row"><label>Guest name<input required name="name" placeholder="Your name" /></label><label>Will you attend?<select name="attending" defaultValue="yes"><option value="yes">Joyfully accepts</option><option value="no">Regretfully declines</option></select></label></div><label>Number attending<select name="number" defaultValue="1"><option>1 guest</option><option>2 guests</option><option>3 guests</option><option>4 guests</option></select></label><label>Leave a message <span>(optional)</span><textarea name="message" placeholder="Share a note with us..." rows={4} /></label><button className="submit-button" type="submit">Send your RSVP <span aria-hidden="true">→</span></button></form>}
        </div>
      </section>

      <footer><p>With love and gratitude</p><div>{invitation.couple.first} <i>&</i> {invitation.couple.second}</div><span>October 18, 2025 · Hudson Valley</span></footer>
    </main>
    </InvitationOpening>
  )
}
