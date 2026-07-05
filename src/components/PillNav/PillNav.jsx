import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import './PillNav.css';

const PillNav = ({
  logo,
  logoAlt = 'Logo',
  items = [],
  activeHref,
  className = '',
  ease = 'power3.easeOut',
  baseColor = 'var(--card)', 
  pillColor = 'var(--bg-secondary)', 
  hoveredPillTextColor = '#FFFFFF', 
  pillTextColor = 'var(--text)', 
  onMobileMenuClick,
  initialLoadAnimation = true
}) => {
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const logoTweenRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    // Initial scale and opacity load animation
    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const navItems = navItemsRef.current;
      if (logoEl) {
        gsap.set(logoEl, { scale: 0, opacity: 0 });
        gsap.to(logoEl, { scale: 1, opacity: 1, duration: 0.6, ease });
      }
      if (navItems) {
        gsap.set(navItems, { opacity: 0 });
        gsap.to(navItems, { opacity: 1, duration: 0.6, ease });
      }
    }
  }, [initialLoadAnimation, ease]);

  // Clear cached timelines on resize so they are correctly recomputed on next hover
  useEffect(() => {
    const handleResize = () => {
      tlRefs.current = [];
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEnter = i => {
    let tl = tlRefs.current[i];

    // Compute and cache timeline on first hover to ensure DOM layout is stable
    if (!tl) {
      const circle = circleRefs.current[i];
      if (circle && circle.parentElement) {
        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 4;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 2;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;
        
        gsap.set(circle, { transformOrigin: `50% ${originY}px`, scale: 0, xPercent: -50 });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        tl = gsap.timeline({ paused: true });
        tl.to(circle, { scale: 1.25, xPercent: -50, duration: 0.38, ease: 'power2.out' }, 0);
        if (label) {
          tl.fromTo(label, { y: 0 }, { y: -(h + 8), duration: 0.38, ease: 'power2.out' }, 0);
        }
        if (white) {
          tl.fromTo(white, { y: h + 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.38, ease: 'power2.out' }, 0);
        }
        tlRefs.current[i] = tl;
      }
    }

    if (tl) {
      tl.play();
    }
  };

  const handleLeave = i => {
    const tl = tlRefs.current[i];
    if (tl) {
      tl.reverse();
    }
  };

  const handleLogoEnter = () => {
    const logoEl = logoRef.current;
    if (!logoEl) return;
    logoTweenRef.current?.kill();
    logoTweenRef.current = gsap.to(logoEl, { scale: 1.05, duration: 0.2, ease: 'power2.out' });
  };

  const handleLogoLeave = () => {
    const logoEl = logoRef.current;
    if (!logoEl) return;
    logoTweenRef.current?.kill();
    logoTweenRef.current = gsap.to(logoEl, { scale: 1, duration: 0.2, ease: 'power2.out' });
  };

  const isExternalLink = href =>
    href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//') ||
    href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#'));

  const isRouterLink = href => href && !isExternalLink(href);

  const cssVars = {
    ['--base']: baseColor,
    ['--pill-bg']: pillColor,
    ['--hover-text']: hoveredPillTextColor,
    ['--pill-text']: pillTextColor
  };

  const homeItem = items[0] || { href: '/' };

  return (
    <div className="pill-nav-container">
      <nav className={`pill-nav ${className}`} aria-label="Primary" style={cssVars}>
        {isRouterLink(homeItem.href) ? (
          <Link 
            className="pill-logo" 
            to={homeItem.href} 
            aria-label="Home" 
            onMouseEnter={handleLogoEnter}
            onMouseLeave={handleLogoLeave}
            role="menuitem" 
            ref={logoRef}
          >
            <span className="font-display font-black tracking-tight select-none">
              <span className="text-[var(--pill-text)]">EBOOK</span>
              <span className="text-[var(--accent,#0A84FF)]">VALA</span>
            </span>
          </Link>
        ) : (
          <a 
            className="pill-logo" 
            href={homeItem.href || '#'} 
            aria-label="Home" 
            onMouseEnter={handleLogoEnter}
            onMouseLeave={handleLogoLeave}
            ref={logoRef}
          >
            <span className="font-display font-black tracking-tight select-none">
              <span className="text-[var(--pill-text)]">EBOOK</span>
              <span className="text-[var(--accent,#0A84FF)]">VALA</span>
            </span>
          </a>
        )}

        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {items.map((item, i) => (
              <li key={item.label ? `nav-${item.label.replace(/\s+/g, '-').toLowerCase()}` : `item-${i}`} role="none">
                {item.onClick ? (
                  <button
                    role="menuitem"
                    onClick={item.onClick}
                    className={`pill cursor-pointer${activeHref === item.href ? ' is-active' : ''}`}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span className="hover-circle" aria-hidden="true" ref={el => { circleRefs.current[i] = el; }} />
                    <span className="label-stack">
                      <span className="pill-label">{item.label}</span>
                      <span className="pill-label-hover" aria-hidden="true">{item.label}</span>
                    </span>
                  </button>
                ) : isRouterLink(item.href) ? (
                  <Link
                    role="menuitem"
                    to={item.href}
                    className={`pill${activeHref === item.href ? ' is-active' : ''}`}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span className="hover-circle" aria-hidden="true" ref={el => { circleRefs.current[i] = el; }} />
                    <span className="label-stack">
                      <span className="pill-label">{item.label}</span>
                      <span className="pill-label-hover" aria-hidden="true">{item.label}</span>
                    </span>
                  </Link>
                ) : (
                  <a
                    role="menuitem"
                    href={item.href || '#'}
                    className={`pill${activeHref === item.href ? ' is-active' : ''}`}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span className="hover-circle" aria-hidden="true" ref={el => { circleRefs.current[i] = el; }} />
                    <span className="label-stack">
                      <span className="pill-label">{item.label}</span>
                      <span className="pill-label-hover" aria-hidden="true">{item.label}</span>
                    </span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default PillNav;
