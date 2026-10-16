'use client'

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './invitation-opening.css'

type Props = {
  children: ReactNode
  firstName: string
  secondName: string
  date: string
  /** Change this per invitation when embedding in Written Dearly. */
  invitationId?: string
  /** Default: show on every visit, so templates can be previewed repeatedly. */
  oncePerSession?: boolean
  artworkSrc?: string
  bowSrc?: string
}

export function InvitationOpening({ children, firstName, secondName, date,
  invitationId = 'default', oncePerSession = false,
  artworkSrc = '/invitation-art/botanical-linen.webp',
  bowSrc = '/invitation-art/silk-bow.webp',
}: Props) {
  const root = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const openButton = useRef<HTMLButtonElement>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const running = useRef(false)
  const [active, setActive] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [opening, setOpening] = useState(false)
  const storageKey = `written-dearly:opened:${invitationId}`

  const finish = useCallback((focus = true) => {
    timeline.current?.kill()
    timeline.current = null
    running.current = false
    if (oncePerSession) {
      try { sessionStorage.setItem(storageKey, 'yes') } catch { /* Storage is optional. */ }
    }
    // Remove inert before moving focus, including on Skip during the animation.
    if (content.current) {
      content.current.inert = false
      gsap.set(content.current, { clearProps: 'transform,opacity,visibility' })
      const targets = content.current.querySelectorAll('.hero-content > *, .nav, .scroll-cue')
      gsap.set(targets, { clearProps: 'transform,opacity,visibility' })
      if (focus) content.current.focus({ preventScroll: true })
    }
    setActive(false)
  }, [oncePerSession, storageKey])

  useEffect(() => {
    setMounted(true)
    if (oncePerSession) {
      try { if (sessionStorage.getItem(storageKey) === 'yes') { finish(false); return } } catch { /* Ignore. */ }
    }
    openButton.current?.focus({ preventScroll: true })
  }, [finish, oncePerSession, storageKey])

  useEffect(() => {
    if (!active) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => { if (reducedMotion.matches && running.current) finish() }
    reducedMotion.addEventListener('change', onChange)
    return () => {
      document.body.style.overflow = previousOverflow
      reducedMotion.removeEventListener('change', onChange)
      timeline.current?.kill()
    }
  }, [active, finish])

  const open = () => {
    if (running.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return }
    running.current = true
    setOpening(true)
    const scope = gsap.utils.selector(root)
    const hero = content.current?.querySelectorAll('.hero-content > *, .nav, .scroll-cue')
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: () => finish() })
    timeline.current = tl
    if (hero?.length) gsap.set(hero, { autoAlpha: 0, y: 18 })
    tl.to(scope('.wd-lettering, .wd-open, .wd-imprint'), { opacity: 0, y: -8, duration: .45 }, 0)
      .to(scope('.wd-bow'), { scale: 1.045, duration: .4 }, 0)
      .to(scope('.wd-bow-left'), { x: '-52vw', y: '-6vh', rotation: -16, opacity: 0, duration: 1.15, ease: 'power3.in' }, .35)
      .to(scope('.wd-bow-right'), { x: '52vw', y: '6vh', rotation: 20, opacity: 0, duration: 1.15, ease: 'power3.in' }, .4)
      .to(scope('.wd-band'), { scaleX: 0, duration: 1, ease: 'power3.inOut' }, .55)
      .to(scope('.wd-seam'), { opacity: 0, duration: .3 }, 1.15)
      .to(scope('.wd-door-left'), { rotationY: -100, xPercent: -12, duration: 2.2, ease: 'power3.inOut' }, 1.2)
      .to(scope('.wd-door-right'), { rotationY: 100, xPercent: 12, duration: 2.2, ease: 'power3.inOut' }, 1.2)
      .to(scope('.wd-door-shade'), { opacity: .38, duration: 1.4 }, 1.4)
      .to(scope('.wd-door'), { opacity: 0, duration: .6 }, 2.75)
      .to(scope('.wd-skip'), { opacity: 0, duration: .3 }, 3.05)
    if (hero?.length) tl.to(hero, { autoAlpha: 1, y: 0, duration: 1.05, stagger: .09, ease: 'power2.out' }, 2.25)
  }

  return <div className="wd-experience" ref={root}>
    <noscript><style>{`.wd-opening{display:none!important}`}</style></noscript>
    <div ref={content} className="wd-page" tabIndex={-1} inert={active && mounted}>{children}</div>
    {active && <div className="wd-opening" role="dialog" aria-modal="true" aria-label={`An invitation from ${firstName} and ${secondName}`}
      onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); finish() }
        if (event.key === 'Tab') {
          const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
          const first = buttons[0], last = buttons[buttons.length - 1]
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
        }
      }}>
      <div className="wd-stage" aria-hidden="true">
        {(['left', 'right'] as const).map(side => <div className={`wd-door wd-door-${side}`} key={side}>
          <img className="wd-cover-art" src={artworkSrc} alt="" fetchPriority="high" draggable={false} />
          <div className="wd-door-shade" />
        </div>)}
        <div className="wd-seam" />
        <div className="wd-band wd-band-left" /><div className="wd-band wd-band-right" />
        <div className="wd-bow wd-bow-left"><img src={bowSrc} alt="" fetchPriority="high" draggable={false} /></div>
        <div className="wd-bow wd-bow-right"><img src={bowSrc} alt="" fetchPriority="high" draggable={false} /></div>
      </div>
      <div className="wd-lettering">
        <p className="wd-eyebrow">Together with our families</p>
        <h2>{firstName}<span>&</span>{secondName}</h2>
        <p className="wd-date">{date}</p>
      </div>
      <button className="wd-open" ref={openButton} onClick={open} aria-disabled={opening}>
        <span className="wd-open-icon" aria-hidden="true">↗</span>
        <span>Open your invitation</span>
        <small>A celebration of love, a lifetime in the making</small>
      </button>
      <span className="wd-imprint">Written Dearly</span>
      <button className="wd-skip" onClick={() => finish()}>Skip intro <span aria-hidden="true">→</span></button>
      <span className="wd-sr-only" role="status">{opening ? 'Opening your invitation' : ''}</span>
    </div>}
  </div>
}
