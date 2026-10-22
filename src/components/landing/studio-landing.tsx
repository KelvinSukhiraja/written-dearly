"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap, useGSAP } from "@/lib/gsap-client";
import monogram from "@/app/icon.png";
import s from "./studio-landing.module.css";

gsap.registerPlugin(ScrollTrigger);

function Arrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1" /></svg>;
}

export function StudioLanding() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add({ motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 800px)" }, (context) => {
      if (!context.conditions?.motion) return;
      const wide = context.conditions.wide;
      gsap.timeline({ defaults: { ease: "power4.out" } })
        .from("[data-opening-line]", { yPercent: 115, rotate: 4, duration: 1.65, stagger: .14 })
        .from("[data-seal-intro]", { scale: .15, rotationY: -160, rotationZ: -20, opacity: 0, duration: 2 }, .35)
        .from("[data-opening-detail]", { opacity: 0, y: 12, duration: 1.1, stagger: .08 }, .85);
      gsap.timeline({ scrollTrigger: {
        trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: 1.2,
      } })
        .to("[data-drift-left]", { xPercent: -14, ease: "none" }, 0)
        .to("[data-drift-right]", { xPercent: 14, ease: "none" }, 0)
        .to("[data-seal-scroll]", { rotationY: 155, rotationZ: 20, y: 65, ease: "none" }, 0);
      gsap.timeline({ scrollTrigger: {
        trigger: "[data-scene]", start: "top 85%", end: "bottom top", scrub: 1.3,
      } })
        .fromTo("[data-scene-frame]", { clipPath: wide ? "inset(10% 18% 10% 18%)" : "inset(6% 5% 6% 5%)" },
          { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: .45 }, 0)
        .fromTo("[data-scene-photo]", { scale: 1.2, yPercent: -6 }, { scale: 1.05, yPercent: 6, ease: "none", duration: 1 }, 0)
        .fromTo("[data-invitation]", { y: 100, rotation: 12 }, { y: -60, rotation: -7, ease: "none", duration: 1 }, 0)
        .fromTo("[data-scene-type]", { y: 55 }, { y: -55, ease: "none", duration: 1 }, 0);
      gsap.utils.toArray<HTMLElement>("[data-reveal-studio]").forEach((el) => {
        gsap.from(el, { y: 32, opacity: 0, duration: 1.2,
          scrollTrigger: { trigger: el, start: "top 93%", toggleActions: "play none none reverse" },
        });
      });
      gsap.fromTo("[data-small-photo]", { y: 35, rotation: 7 }, { y: -35, rotation: -5, ease: "none",
        scrollTrigger: { trigger: "[data-manifesto]", start: "top bottom", end: "bottom top", scrub: 1.5 },
      });
      gsap.fromTo("[data-closing-type]", { xPercent: -4 }, { xPercent: 4, ease: "none",
        scrollTrigger: { trigger: "[data-closing]", start: "top bottom", end: "bottom top", scrub: 1.8 },
      });
      let active = true;
      document.fonts.ready.then(() => { if (active) ScrollTrigger.refresh(); });
      return () => { active = false; };
    });
    return () => media.revert();
  }, { scope: root });

  return (
    <div ref={root} className={s.page}>
      <a className={s.skip} href="#main">Skip to content</a>
      <header className={s.header}>
        <a href="#studio" className={s.headerLink}>The studio <span aria-hidden="true">+</span></a>
        <Link href="/" aria-label="Written Dearly home" className={s.brand}>Written <em>Dearly</em><span>AN INVITATION STUDIO</span></Link>
        <Link href="/login" className={s.headerLink}>Log in <span aria-hidden="true">↗</span></Link>
      </header>
      <main id="main">
        <section className={s.hero} data-hero aria-labelledby="hero-title">
          <p className={s.heroLabel} data-opening-detail>Considered details. Unforgettable beginnings.</p>
          <h1 id="hero-title" className={s.heroTitle} aria-label="For the love of a lifetime.">
            <span className={s.titleRow} aria-hidden="true"><span data-drift-left><span data-opening-line>FOR THE</span></span></span>
            <span className={[s.titleRow, s.middleRow].join(" ")} aria-hidden="true">
              <span data-drift-right><span data-opening-line>LOVE</span></span>
              <span className={s.sealSpace}><span className={s.sealScroll} data-seal-scroll><span className={s.seal} data-seal-intro>
                <span className={s.sealFace}><Image src={monogram} alt="" width={90} height={90} /><span>WITH LOVE</span></span>
              </span></span></span>
              <span data-drift-right><span data-opening-line>OF</span></span>
            </span>
            <span className={[s.titleRow, s.lastRow].join(" ")} aria-hidden="true"><span data-drift-left><span data-opening-line>A LIFETIME.</span></span></span>
          </h1>
          <div className={s.heroBottom} data-opening-detail>
            <p>Wedding invitations, made digital.<br /><em>Every bit as personal.</em></p>
            <a href="#studio" className={s.scrollCue} aria-label="Discover the studio"><span>SCROLL TO UNFOLD</span><span className={s.scrollLine} /></a>
            <Link href="/signup" className={s.beginLink}><span>Begin your story</span><span className={s.arrowCircle}><Arrow /></span></Link>
          </div>
        </section>
        <section id="studio" className={s.studio} aria-labelledby="studio-title">
          <div className={s.scene} data-scene>
            <div className={s.sceneFrame} data-scene-frame>
              <div className={s.scenePhoto} data-scene-photo><Image src="/landing-index/floral-paper.png" alt="White flowers resting on textured ivory paper in afternoon sunlight" fill sizes="100vw" preload /></div>
              <div className={s.sceneShade} />
              <p className={s.sceneLabel}>THE ART OF ASKING YOU TO BE THERE</p>
              <h2 id="studio-title" className={s.sceneTitle} data-scene-type>A moment.<br /><em>Made yours.</em></h2>
              <div className={s.invitation} data-invitation aria-label="Illustrative invitation design: Together is a beautiful place to be">
                <div className={s.invitationBorder}>
                  <Image src={monogram} alt="" width={42} height={42} />
                  <span className={s.invitationLabel}>A CELEBRATION OF LOVE</span>
                  <p>Together<br /><em>is a beautiful<br />place to be.</em></p>
                  <span className={s.invitationRule} />
                  <span className={s.invitationLabel}>YOU ARE DEARLY INVITED</span>
                </div>
              </div>
              <span className={s.sceneFooter}>01 — THE FIRST IMPRESSION</span>
            </div>
          </div>
          <div className={s.manifesto} data-manifesto>
            <p className={s.eyebrow} data-reveal-studio>A NOTE FROM THE STUDIO</p>
            <div className={s.manifestoHeading} data-reveal-studio>Some days deserve<br />more than <em>an invitation.</em>
              <div className={s.smallPhoto} data-small-photo role="img" aria-label="A couple walking together on their wedding day" />
            </div>
            <div className={s.manifestoBottom}>
              <span className={s.edition} aria-hidden="true">W / D<br /><em>Thoughtfully composed.</em></span>
              <div data-reveal-studio><p>They deserve a feeling. A first glimpse of your world, a little anticipation, a reason to keep the date close.</p><p>We create digital wedding invitations that feel like you. Choose your design, tell your story, and bring your favourite people together.</p><Link href="/signup" className={s.textLink}>Make it yours <Arrow /></Link></div>
            </div>
          </div>
        </section>
        <section className={s.closing} data-closing aria-labelledby="closing-title">
          <div className={s.closingTop}><span>YOUR NEXT CHAPTER STARTS HERE</span><span>WITH LOVE, ALWAYS.</span></div>
          <h2 id="closing-title" data-closing-type>Yours, <em>dearly.</em></h2>
          <div className={s.closingBottom} data-reveal-studio><p>A beautiful beginning<br />is only a few words away.</p><Link href="/signup" className={s.beginLink}><span>Create your account</span><span className={s.arrowCircle}><Arrow /></span></Link></div>
        </section>
      </main>
      <footer className={s.footer}><span>© {new Date().getFullYear()} WRITTEN DEARLY</span><Link href="/login">Already part of the story? <span>Log in ↗</span></Link><a href="#main">BACK TO TOP ↑</a></footer>
    </div>
  );
}
