import { useEffect, useRef, useState } from 'react';
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
  initialLoadAnimation = true
}) => {
  const logoRef = useRef(null);
  const centerRef = useRef(null);
  const rightRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Scroll event listener to toggle floating glassmorphic state
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Clean initial load fade-in and slide-up animations
    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const centerEl = centerRef.current;
      const rightEl = rightRef.current;
      
      const tl = gsap.timeline();
      
      if (logoEl) {
        gsap.set(logoEl, { opacity: 0, y: -10 });
        tl.to(logoEl, { opacity: 1, y: 0, duration: 0.5, ease }, 0);
      }
      if (centerEl) {
        gsap.set(centerEl, { opacity: 0, y: -10 });
        tl.to(centerEl, { opacity: 1, y: 0, duration: 0.5, ease }, 0.1);
      }
      if (rightEl) {
        gsap.set(rightEl, { opacity: 0, y: -10 });
        tl.to(rightEl, { opacity: 1, y: 0, duration: 0.5, ease }, 0.2);
      }
    }
  }, [initialLoadAnimation, ease]);

  const isExternalLink = href =>
    href && (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//') ||
    href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#'));

  const isRouterLink = href => href && !isExternalLink(href);

  // Split navigation items: center core routes vs right action items
  const centerItems = items.filter(item => 
    !["Log In", "Register", "Log Out", "Toggle Theme"].some(label => item.label.includes(label))
  );
  
  const rightItems = items.filter(item => 
    ["Log In", "Register", "Log Out", "Toggle Theme"].some(label => item.label.includes(label))
  );

  const homeItem = items[0] || { href: '/' };

  return (
    <div className={`pill-nav-container ${className}`}>
      <nav className={`pill-nav ${scrolled ? 'is-scrolled' : ''}`} aria-label="Primary">
        
        {/* Left: Two-tone premium text logo */}
        <div ref={logoRef}>
          {isRouterLink(homeItem.href) ? (
            <Link className="pill-logo-text" to={homeItem.href} aria-label="Home">
              <span className="font-display font-black tracking-tight select-none text-xl">
                <span className="text-brand-text">EBOOK</span>
                <span className="text-[#3B82F6]">VALA</span>
              </span>
            </Link>
          ) : (
            <a className="pill-logo-text" href={homeItem.href || '#'} aria-label="Home">
              <span className="font-display font-black tracking-tight select-none text-xl">
                <span className="text-brand-text">EBOOK</span>
                <span className="text-[#3B82F6]">VALA</span>
              </span>
            </a>
          )}
        </div>

        {/* Center: Combined pill shaped navigation container */}
        <div className="pill-nav-center" ref={centerRef}>
          {centerItems.map((item, i) => {
            const isActive = activeHref === item.href;
            const key = item.label ? `nav-center-${item.label.replace(/\s+/g, '-').toLowerCase()}` : `center-${i}`;
            
            return (
              <div key={key} role="none">
                {item.onClick ? (
                  <button
                    role="menuitem"
                    onClick={item.onClick}
                    className={`pill-nav-link ${isActive ? 'is-active' : ''}`}
                    aria-label={item.ariaLabel || item.label}
                  >
                    {item.label}
                  </button>
                ) : isRouterLink(item.href) ? (
                  <Link
                    role="menuitem"
                    to={item.href}
                    className={`pill-nav-link ${isActive ? 'is-active' : ''}`}
                    aria-label={item.ariaLabel || item.label}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    role="menuitem"
                    href={item.href || '#'}
                    className={`pill-nav-link ${isActive ? 'is-active' : ''}`}
                    aria-label={item.ariaLabel || item.label}
                  >
                    {item.label}
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Actions menu (Toggle Theme, Login/Register, Log Out) */}
        <div className="pill-nav-right" ref={rightRef}>
          {rightItems.map((item, i) => {
            const isRegister = item.label === "Register";
            const IconComponent = item.icon;
            const key = item.label ? `nav-right-${item.label.replace(/\s+/g, '-').toLowerCase()}` : `right-${i}`;
            return (
              <div key={key} role="none">
                {item.onClick ? (
                  <button
                    role="menuitem"
                    onClick={item.onClick}
                    className={"pill-nav-right-link" + (IconComponent ? " flex items-center justify-center" : "")}
                    aria-label={item.ariaLabel || item.label}
                  >
                    {IconComponent ? <IconComponent className="h-4.5 w-4.5" /> : item.label}
                  </button>
                ) : isRouterLink(item.href) ? (
                  <Link
                    role="menuitem"
                    to={item.href}
                    className={isRegister ? "pill-register-btn" : "pill-nav-right-link" + (IconComponent ? " flex items-center justify-center" : "")}
                    aria-label={item.ariaLabel || item.label}
                  >
                    {IconComponent ? <IconComponent className="h-4.5 w-4.5" /> : item.label}
                  </Link>
                ) : (
                  <a
                    role="menuitem"
                    href={item.href || '#'}
                    className={isRegister ? "pill-register-btn" : "pill-nav-right-link" + (IconComponent ? " flex items-center justify-center" : "")}
                    aria-label={item.ariaLabel || item.label}
                  >
                    {IconComponent ? <IconComponent className="h-4.5 w-4.5" /> : item.label}
                  </a>
                )}
              </div>
            );
          })}
        </div>

      </nav>
    </div>
  );
};

export default PillNav;
