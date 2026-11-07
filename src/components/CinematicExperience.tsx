import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Droplets,
  Gauge,
  Search,
  ShieldCheck,
  Sparkles,
  SprayCan,
  WandSparkles,
  X,
} from "lucide-react";
import { StatusTimeline } from "@/components/StatusTimeline";
import {
  SERVICES,
  lookupJob,
  type Job,
  type Service,
} from "@/lib/jobs-store";
import "./CinematicExperience.css";

const SERVICE_DETAILS: Record<
  Service,
  { description: string; duration: string; detail: string; icon: typeof Droplets }
> = {
  "Exterior Wash": {
    description: "A careful exterior refresh that brings back a clean, sharp finish.",
    duration: "30–45 min",
    detail: "Body wash · Wheel cleaning · Exterior dry",
    icon: Droplets,
  },
  "Interior Deep Clean": {
    description: "A detailed cabin clean for a fresher, more comfortable drive.",
    duration: "60–90 min",
    detail: "Vacuum · Surface care · Interior finish",
    icon: SprayCan,
  },
  "Full Wash & Interior": {
    description: "A complete inside-and-out clean for your everyday vehicle.",
    duration: "75–120 min",
    detail: "Exterior wash · Cabin clean · Final inspection",
    icon: Sparkles,
  },
  "Polish & Wax": {
    description: "Bring depth and clarity back to your paintwork with a refined finish.",
    duration: "90–150 min",
    detail: "Paint preparation · Polish · Protective wax",
    icon: WandSparkles,
  },
  "Full Detailing": {
    description: "A comprehensive vehicle refresh with attention to the small details.",
    duration: "3–5 hours",
    detail: "Exterior detail · Interior detail · Quality check",
    icon: Gauge,
  },
  "Ceramic Coating": {
    description: "A high-gloss protective finish designed to make maintenance easier.",
    duration: "By assessment",
    detail: "Paint preparation · Coating application · Curing",
    icon: ShieldCheck,
  },
};

function VehicleArtwork() {
  return (
    <svg
      className="cinematic-car"
      viewBox="0 0 560 210"
      role="img"
      aria-label="Illustration of a premium car driving into the wash studio"
    >
      <defs>
        <linearGradient id="carBody" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f5e7bd" />
          <stop offset="45%" stopColor="#b99a5b" />
          <stop offset="100%" stopColor="#5e4825" />
        </linearGradient>
        <linearGradient id="carGlass" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#81909b" />
          <stop offset="100%" stopColor="#17212a" />
        </linearGradient>
        <filter id="carGlow" x="-30%" y="-80%" width="160%" height="260%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <ellipse cx="280" cy="174" rx="218" ry="17" fill="#d6b66e" opacity=".25" filter="url(#carGlow)" />
      <path
        d="M65 139 L87 112 Q103 99 151 93 L207 47 Q226 31 267 31 L365 34 Q394 36 417 65 L463 101 Q492 109 510 127 L516 153 Q516 166 499 169 L60 169 Q43 165 48 150 Z"
        fill="url(#carBody)"
        stroke="#f1d99c"
        strokeWidth="3"
      />
      <path
        d="M169 91 L220 52 Q233 44 263 44 L357 47 Q378 48 394 70 L411 94 Z"
        fill="url(#carGlass)"
        stroke="#d6c18e"
        strokeWidth="3"
      />
      <path d="M284 45 L282 94" stroke="#d6c18e" strokeWidth="3" opacity=".7" />
      <path d="M75 128 Q116 117 163 118 L434 118" stroke="#f7e9c4" strokeWidth="3" opacity=".55" fill="none" />
      <path d="M466 111 L498 127 L499 137 L469 135 Z" fill="#fff0bd" />
      <path d="M53 139 L84 132 L77 148 L50 151 Z" fill="#f9e7ae" />
      <path d="M109 160 L451 160" stroke="#fff2d1" strokeWidth="3" opacity=".45" />
      <circle cx="155" cy="161" r="35" fill="#111316" stroke="#9d8657" strokeWidth="5" />
      <circle cx="155" cy="161" r="19" fill="#a7a9a8" stroke="#e3d3ac" strokeWidth="4" />
      <circle cx="155" cy="161" r="6" fill="#22272b" />
      <circle cx="414" cy="161" r="35" fill="#111316" stroke="#9d8657" strokeWidth="5" />
      <circle cx="414" cy="161" r="19" fill="#a7a9a8" stroke="#e3d3ac" strokeWidth="4" />
      <circle cx="414" cy="161" r="6" fill="#22272b" />
    </svg>
  );
}

export function CinematicExperience() {
  const [skipIntro, setSkipIntro] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [loading, setLoading] = useState(false);

  async function trackVehicle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trackingCode.trim()) return;
    setLoading(true);
    setLookupError("");
    setJob(null);
    try {
      const result = await lookupJob(trackingCode);
      if (result) {
        setJob(result);
      } else {
        setLookupError("We couldn't find a vehicle with that tracking code.");
      }
    } catch (error) {
      setLookupError(
        error instanceof Error ? error.message : "Tracking is temporarily unavailable. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={`cinematic-page ${skipIntro ? "intro-skipped" : ""}`}>
      <header className="cinematic-header">
        <a className="brand-lockup" href="#home" aria-label="Lavage International home">
          <span className="brand-mark"><span /></span>
          <span>
            <strong>LAVAGE</strong>
            <small>INTERNATIONAL · AUTO CARE</small>
          </span>
        </a>
        <nav className="cinematic-nav" aria-label="Main navigation">
          <a href="#services">Our services</a>
          <button type="button" onClick={() => setShowTracking((value) => !value)}>
            Track vehicle
          </button>
          <Link to="/staff" className="staff-link">Staff portal <ArrowUpRight size={14} /></Link>
        </nav>
      </header>

      <section id="home" className="cinematic-hero">
        <div className="hero-copy">
          <p className="eyebrow"><span /> A higher standard of vehicle care</p>
          <h1>Every arrival<br />deserves <em>the best.</em></h1>
          <p className="hero-description">
            Precision care for the vehicle you love. Choose your service and let our team take it from here.
          </p>
          <a className="hero-cta" href="#services">
            Explore services <ArrowRight size={17} />
          </a>
        </div>

        <div className="drive-scene" aria-label="A car arriving at the Lavage International studio">
          <div className="scene-skyline" />
          <div className="studio-building">
            <div className="studio-sign"><span className="sign-symbol">L</span><span>LAVAGE <small>INTERNATIONAL</small></span></div>
            <div className="studio-bay">
              <div className="bay-light" />
              <div className="bay-floor" />
            </div>
            <div className="studio-window" />
          </div>
          <div className="road">
            <span className="road-line road-line-one" />
            <span className="road-line road-line-two" />
            <span className="road-glow" />
          </div>
          <div className="car-light-trail" />
          <VehicleArtwork />
          <div className="scene-caption"><span className="caption-dot" /> ARRIVING AT THE STUDIO</div>
          <button className="skip-intro" type="button" onClick={() => setSkipIntro(true)}>Skip intro <X size={12} /></button>
        </div>

        <div className="hero-footnote">
          <span>01 / THE ARRIVAL</span>
          <span>CRAFTED CARE. EVERY DETAIL.</span>
          <span>GRAND-BASSAM · CÔTE D’IVOIRE</span>
        </div>
      </section>

      <section id="services" className="services-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span /> THE SERVICE MENU</p>
            <h2>Choose your <em>experience.</em></h2>
          </div>
          <p>Thoughtful treatments. Professional finish.<br />A better feeling every time you drive away.</p>
        </div>

        <div className="service-grid">
          {SERVICES.map((service, index) => {
            const details = SERVICE_DETAILS[service];
            const Icon = details.icon;
            const active = selectedService === service;
            return (
              <button
                type="button"
                key={service}
                className={`service-card ${active ? "service-card-active" : ""}`}
                aria-pressed={active}
                onClick={() => setSelectedService(active ? null : service)}
              >
                <span className="service-index">0{index + 1}</span>
                <span className="service-icon"><Icon size={21} strokeWidth={1.5} /></span>
                <span className="service-name">{service}</span>
                <span className="service-description">{details.description}</span>
                <span className="service-meta"><Clock3 size={13} /> {details.duration}</span>
                <span className="service-arrow">{active ? <Check size={17} /> : <ArrowUpRight size={17} />}</span>
              </button>
            );
          })}
        </div>

        {selectedService && (
          <div className="selection-panel" aria-live="polite">
            <div>
              <p className="eyebrow"><span /> YOUR SELECTED SERVICE</p>
              <h3>{selectedService}</h3>
              <p>{SERVICE_DETAILS[selectedService].detail}</p>
            </div>
            <button type="button" onClick={() => setShowTracking(true)}>
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}
        <p className="service-note">Service selection is an introduction to our care options. Booking and vehicle intake are completed with the Lavage team.</p>
      </section>

      {showTracking && (
        <section className="tracking-section" id="tracking" aria-labelledby="tracking-title">
          <div className="tracking-heading">
            <div>
              <p className="eyebrow"><span /> YOUR VEHICLE, IN VIEW</p>
              <h2 id="tracking-title">Track your <em>vehicle.</em></h2>
            </div>
            <button className="close-tracking" type="button" onClick={() => setShowTracking(false)} aria-label="Close tracking"><X size={18} /></button>
          </div>
          <form className="tracking-form" onSubmit={trackVehicle}>
            <label htmlFor="tracking-code">Enter your tracking code</label>
            <div className="tracking-input-row">
              <input
                id="tracking-code"
                value={trackingCode}
                onChange={(event) => setTrackingCode(event.target.value.toUpperCase())}
                placeholder="LAV-1001"
                autoCapitalize="characters"
                autoComplete="off"
              />
              <button type="submit" disabled={loading}><Search size={16} /> {loading ? "Searching" : "Find vehicle"}</button>
            </div>
            {lookupError && <p className="tracking-error" role="alert">{lookupError}</p>}
          </form>
          {job && (
            <div className="tracking-result">
              <div className="tracking-result-top">
                <div><small>VEHICLE</small><h3>{job.vehicle}</h3><p>{job.plate} · {job.trackingCode}</p></div>
                <span>{job.status}</span>
              </div>
              <p className="tracking-service-label">SERVICE · {job.service}</p>
              <StatusTimeline job={job} />
            </div>
          )}
        </section>
      )}

      <footer className="cinematic-footer">
        <div className="footer-brand"><span className="brand-mark"><span /></span><strong>LAVAGE INTERNATIONAL</strong></div>
        <p>Care in every detail.</p>
        <span>© {new Date().getFullYear()} LAVAGE INTERNATIONAL</span>
      </footer>
    </main>
  );
}
