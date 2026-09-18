"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Manrope, Space_Grotesk } from "next/font/google";
import Image from "next/image";
import PackageTracker from "./components/packageTracker/packageTracker";
import styles from "./home.module.css";

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["600", "700"] });

const logisticsSteps = [
  {
    title: "Book",
    text: "Instant booking via our app or WhatsApp. Get a quote in seconds.",
  },
  {
    title: "Pickup",
    text: "Our verified couriers arrive at your location within minutes.",
  },
  {
    title: "Secure",
    text: "Encrypted tracking and OTP verification at every handover point.",
  },
  {
    title: "Confirm",
    text: "Instant notification and digital proof of delivery for peace of mind.",
  },
];

const cities = ["Harare", "Bulawayo", "Mutare", "Gweru"];

const securityLayers = [
  {
    title: "OTP Verification",
    text: "Secure handover with one-time codes sent directly to recipient phones.",
  },
  {
    title: "QR Scanning",
    text: "Parcel identity verified at every depot through instant QR code logging.",
  },
  {
    title: "Verified Couriers",
    text: "Every Movo rider is background checked and biometric verified.",
  },
  {
    title: "Encrypted Tracking",
    text: "End-to-end encryption protects package movement and customer metadata.",
  },
];

const testimonials = [
  {
    quote:
      "Sending spare parts to customers has become a breeze. Movo reliably delivers parts when the customer needs them. Their same-day turnaround cut delivery complaints by over 40%.",
    name: "Boss Tino",
    role: "Spare Parts Shop Owner, Kaguvi Str Harare",
    rating: 5,
  },
  {
    quote:
      "Ever since I started using Movo, my orders doubled because I could deliver to my customers faster than ever. I can now sell clothes to my customers in Harare and they receive them the same day.",
    name: "Chipo",
    role: "Clothes Boutique Owner, CBD Harare",
    rating: 4,
  },
  {
    quote:
      "Our company can now send documents to our clients in Harare and have confidence in receiving them. Movo has made our business more efficient and our clients happier.",
    name: "Adv Mudima",
    role: "Lawyer, Harare",
    rating: 5,
  },
];

type TrackingResult = {
  tracking_number?: string
  package_code?: string
  status?: string
  package_status?: string
  current_status?: string
  location?: string
  current_location?: string
  sender_name?: string
  receiver_name?: string
  updated_at?: string
  last_updated?: string
  delivery_stage?: string
  message?: string
}

type Suburb = {
  id: number
  name: string
  city: number
  city_name: string
}

type PackagePrice = {
  city_id: number
  distance_km: number
  is_fast_delivery: boolean
  amount: string
}


const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
const WHATSAPP_URL = "https://wa.me/263000000000?text=Hi%20MOVO%2C%20I%20want%20to%20send%20a%20package."

function displayValue(value?: string) {
  return value && value.trim().length > 0 ? value : "-"
}

type SuburbComboboxProps = {
  id: string
  label: string
  suburbs: Suburb[]
  loading: boolean
  error: string
  onSelect: (suburb: Suburb) => void
}

function SuburbCombobox({ id, label, suburbs, loading, error, onSelect }: SuburbComboboxProps) {
  const [query, setQuery] = useState("")
  const [selectedLabel, setSelectedLabel] = useState("")
  const [open, setOpen] = useState(false)

  const filtered = suburbs.filter((suburb) => {
    const term = query.trim().toLowerCase()
    if (!term) return true
    return (
      suburb.name.toLowerCase().includes(term) ||
      suburb.city_name.toLowerCase().includes(term)
    )
  })

  return (
    <div className={styles.suburbField}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        placeholder="Search suburb..."
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          setQuery("")
          setOpen(true)
        }}
        onBlur={() => {
          setTimeout(() => {
            setOpen(false)
            setQuery(selectedLabel)
          }, 150)
        }}
        autoComplete="off"
      />
      {open && (
        <ul className={styles.suburbDropdown}>
          {loading && <li className={styles.suburbEmpty}>Loading suburbs...</li>}
          {!loading && error && <li className={styles.suburbEmpty}>{error}</li>}
          {!loading && !error && filtered.length === 0 && (
            <li className={styles.suburbEmpty}>No suburbs found</li>
          )}
          {!loading &&
            !error &&
            filtered.map((suburb) => (
              <li key={suburb.id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    const nextLabel = `${suburb.name}, ${suburb.city_name}`
                    onSelect(suburb)
                    setSelectedLabel(nextLabel)
                    setQuery(nextLabel)
                    setOpen(false)
                  }}
                >
                  {suburb.name} <span>{suburb.city_name}</span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}

export default function Home() {
  const [trackingOpen, setTrackingOpen] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [trackingError, setTrackingError] = useState("")
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null)

  const [suburbs, setSuburbs] = useState<Suburb[]>([])
  const [suburbsLoading, setSuburbsLoading] = useState(false)
  const [suburbsError, setSuburbsError] = useState("")
  const [fromSuburb, setFromSuburb] = useState<Suburb | null>(null)
  const [toSuburb, setToSuburb] = useState<Suburb | null>(null)
  const [priceResult, setPriceResult] = useState<PackagePrice | null>(null)
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceError, setPriceError] = useState("")

  useEffect(() => {
    let cancelled = false

    const loadSuburbs = async () => {
      setSuburbsLoading(true)
      setSuburbsError("")

      try {
        const response = await fetch(`${API_BASE}/api/users/suburbs/`)
        if (!response.ok) throw new Error("Failed to load suburbs")

        const data = await response.json()
        if (!cancelled) setSuburbs(Array.isArray(data) ? data : [])
      } catch (error) {
        if (!cancelled) {
          setSuburbsError(error instanceof Error ? error.message : "Failed to load suburbs")
        }
      } finally {
        if (!cancelled) setSuburbsLoading(false)
      }
    }

    loadSuburbs()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!fromSuburb || !toSuburb) {
      setPriceResult(null)
      setPriceError("")
      return undefined
    }

    let cancelled = false

    const lookupPrice = async () => {
      setPriceLoading(true)
      setPriceError("")
      setPriceResult(null)

      try {
        const response = await fetch(`${API_BASE}/api/intracity/package-price/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city_id: fromSuburb.city,
            from_suburb_id: fromSuburb.id,
            to_suburb_id: toSuburb.id,
            is_fast_delivery: false,
          }),
        })

        const data = await response.json().catch(() => null)
        if (!response.ok) throw new Error(data?.error || data?.detail || "Failed to fetch price. Check your internet.")
        if (!cancelled) setPriceResult(data)
      } catch (error) {
        if (!cancelled) {
          setPriceError(error instanceof Error ? error.message : "Failed to fetch price. Check your internet.")
        }
      } finally {
        if (!cancelled) setPriceLoading(false)
      }
    }

    lookupPrice()
    return () => {
      cancelled = true
    }
  }, [fromSuburb, toSuburb])

  useEffect(() => {
    if (!trackingOpen) return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTrackingOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [trackingOpen])

  const openTrackingModal = () => setTrackingOpen(true)
  const closeTrackingModal = () => {
    setTrackingOpen(false)
    setTrackingError("")
  }

  const handleTrackingSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = trackingNumber.trim()

    if (!query) {
      setTrackingError("Enter a tracking number to continue.")
      return
    }

    setTrackingLoading(true)
    setTrackingError("")
    setTrackingResult(null)

    try {
      const searchUrls = [
        `${API_BASE}/api/track-package/?tracking_number=${encodeURIComponent(query)}`,
        `${API_BASE}/api/track-package/?package_code=${encodeURIComponent(query)}`,
      ]

      let lastError = "Tracking number not found"

      for (const url of searchUrls) {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await response.json().catch(() => null)

        if (response.ok) {
          setTrackingResult(data)
          return
        }

        lastError = data?.error || data?.detail || lastError
      }

      throw new Error(lastError)
    } catch (error) {
      setTrackingError(error instanceof Error ? error.message : "Failed to load package status")
    } finally {
      setTrackingLoading(false)
    }
  }

  const resolvedStatus = trackingResult?.status ?? trackingResult?.package_status ?? trackingResult?.current_status
  const resolvedLocation = trackingResult?.location ?? trackingResult?.current_location
  const resolvedUpdatedAt = trackingResult?.updated_at ?? trackingResult?.last_updated

  const openWhatsApp = () => {
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer")
  }

  return (
    <div className={`${manrope.className} ${styles.page}`}>
      <header className={styles.topNav}>
        <div className={styles.brandRow}>
          <Image
            src="/movo_logo.png"
            alt="MOVO"
            width={120}
            height={44}
            className={styles.brandLogo}
            priority
          />
        </div>
        <nav className={styles.navLinks} aria-label="Primary">
          <a href="#services">Services</a>
          <a href="#pricing">Pricing</a>
          <a href="#coverage">Coverage</a>
          <a href="#security">Security</a>
        </nav>
        <div className={styles.navCtas}>
          <button type="button" className={styles.headerWhatsAppBtn} onClick={openWhatsApp}>
            Send on WhatsApp
          </button>
          <button className={styles.solidBtn}>Download the App Now</button>
        </div>
      </header>

      <main>
        <section className={styles.hero} id="services">
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>Harare Same-Day Courier</p>
            <h1 className={spaceGrotesk.className}>Lowest Delivery Prices in Harare. Period.</h1>
            <p>
              Experience precision and velocity with Zimbabwe&apos;s most secure courier network.
              Starting at just $1.00, we deliver excellence from your door to their hands.
            </p>
            <div className={styles.heroCtas}>
              <button className={styles.lightBtn}>Download the App Now</button>
              <button type="button" className={`${styles.heroWhatsappBtn} ${styles.headerWhatsAppBtn}`} onClick={openWhatsApp}>
                Send on WhatsApp
              </button>
            </div>
          </div>

          <aside className={styles.valueBanner} aria-label="Service highlights">
            <div className={styles.valueItem}>
              <span className={styles.valueIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M12 3l7 3v5c0 4.5-2.7 7.9-7 10-4.3-2.1-7-5.5-7-10V6l7-3z" />
                </svg>
              </span>
              <strong>Reliable</strong>
            </div>
            <div className={styles.valueItem}>
              <span className={styles.valueIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M12 3v18M16.5 7.5c0-1.9-2-3.5-4.5-3.5S7.5 5.6 7.5 7.5 9.5 11 12 11s4.5 1.6 4.5 3.5S14.5 18 12 18s-4.5-1.6-4.5-3.5" />
                </svg>
              </span>
              <strong>Affordable</strong>
            </div>
            <div className={styles.valueItem}>
              <span className={styles.valueIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
                </svg>
              </span>
              <strong>Fast</strong>
            </div>
            <div className={styles.valueBannerTracker}>
              <PackageTracker />
            </div>
          </aside>
        </section>

        <section className={styles.section}>
          <h2 className={spaceGrotesk.className}>Precision Logistics in 4 Steps</h2>
          <p className={styles.sectionLead}>
            Our streamlined process ensures your package moves with speed and absolute security.
          </p>
          <div className={styles.stepsGrid}>
            {logisticsSteps.map((step, index) => (
              <article key={step.title} className={styles.stepCard}>
                <p className={styles.stepIndex}>{index + 1}</p>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.priceLookupSection} id="price-lookup">
          <p className={styles.priceLookupSubtitle}>Find out what it will cost to send your package</p>
          <div className={styles.suburbSelectors}>
            <SuburbCombobox
              id="fromSuburb"
              label="From Area"
              suburbs={suburbs}
              loading={suburbsLoading}
              error={suburbsError}
              onSelect={setFromSuburb}
            />
            <SuburbCombobox
              id="toSuburb"
              label="To Area"
              suburbs={suburbs}
              loading={suburbsLoading}
              error={suburbsError}
              onSelect={setToSuburb}
            />
          </div>
          <div className={styles.priceDisplay}>
            {priceLoading && <p className={styles.priceStatus}>Calculating price...</p>}
            {!priceLoading && priceError && <p className={styles.priceStatus}>{priceError}</p>}
            {!priceLoading && !priceError && priceResult && (
              <p className={styles.priceAmount}>${Number(priceResult.amount).toFixed(2)}</p>
            )}
            {!priceLoading && !priceError && !priceResult && (
              <p className={styles.pricePlaceholder}>Select both suburbs to see the price</p>
            )}
          </div>
        </section>

        <section className={`${styles.section} ${styles.valueSection}`} id="pricing">
          <div className={styles.valueCopy}>
            <h2 className={spaceGrotesk.className}>Unbeatable Value. No Hidden Fees.</h2>
            <p>
              We optimized our routes to provide Harare&apos;s most competitive delivery rates without
              compromising on security or speed.
            </p>
            <ul>
              <li>No fuel surcharges</li>
              <li>Real-time dynamic pricing</li>
              <li>Enterprise discounts available</li>
            </ul>
          </div>

          <div className={styles.priceTable}>
            <div className={styles.tableHeaderRow}>
              <span>Service Layer</span>
              <span>Competitors</span>
              <span>Movo</span>
            </div>
            <div className={styles.tableRow}>
              <span>Starting Price</span>
              <span>$3.00 - $6.00</span>
              <strong>$1.00</strong>
            </div>
            <div className={styles.tableRow}>
              <span>Insurance Incl.</span>
              <span>Additional Fee</span>
              <strong>Included</strong>
            </div>
            <div className={styles.tableRow}>
              <span>Live GPS</span>
              <span>Limited</span>
              <strong>Standard</strong>
            </div>
            <div className={styles.tableRow}>
              <span>Security OTP</span>
              <span>Rare</span>
              <strong>Standard</strong>
            </div>
          </div>
        </section>



        <section className={`${styles.section} ${styles.coverageSection}`} id="coverage">
          <div className={styles.mapCard}>
            <div className={styles.mapMock}>
              <Image
                src="/map.jpeg"
                alt="Movo delivery coverage map"
                fill
                className={styles.mapImage}
                sizes="(max-width: 900px) 100vw, 50vw"
              />
            </div>
            <div className={styles.reliabilityBadge}>Extremely Reliable</div>
          </div>

          <div className={styles.coverageListWrap}>
            <h2 className={spaceGrotesk.className}>Expanding Velocity Across Zimbabwe</h2>
            <ul className={styles.coverageList}>
              {cities.map((city, i) => (
                <li key={city}>
                  <span>{city}</span>
                  <span>{i === 0 ? "Live Now" : "Coming Soon"}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>


        <section className={styles.securitySection} id="security">
          <h2 className={spaceGrotesk.className}>Absolute Security. Guaranteed.</h2>
          <p>We deliver packages safely, on time, and at a fair price.</p>
          <div className={styles.securityGrid}>
            {securityLayers.map((layer) => (
              <article key={layer.title} className={styles.securityCard}>
                <h3>{layer.title}</h3>
                <p>{layer.text}</p>
              </article>
            ))}
          </div>
        </section>



        <section className={styles.section}>
          <h2 className={spaceGrotesk.className}>Trusted by Harare&apos;s Leading Businesses. Join them.</h2>
          <div className={styles.testimonialGrid}>
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className={styles.testimonialCard}>
                <div className={styles.reviewStars} aria-label={`${testimonial.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <span
                      key={`${testimonial.name}-star-${index}`}
                      className={index < testimonial.rating ? styles.starActive : styles.starInactive}
                      aria-hidden="true"
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className={styles.testimonialQuote}>{testimonial.quote}</p>
                <div>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.appSection}>
          <div className={styles.appCopy}>
            <h2 className={spaceGrotesk.className}>Movo in Your Pocket.</h2>
            <p>
              Download our sleek mobile app for premium tracking, instant booking, and professional
              courier support in one tap. 
            </p>
            <p>
              Or, send your package directly through WhatsApp for a seamless experience without leaving your chat.
            </p>
            <div className={styles.storeButtons}>
              <button>App Store</button>
              <button>Google Play</button>
            </div>
            <button className={styles.whatsappBtn} type="button" onClick={openWhatsApp}>
              Send on WhatsApp
            </button>
          </div>
          <div className={styles.appVisuals}>
            <Image
              src="/whatsapp.png"
              alt="WhatsApp booking preview"
              width={540}
              height={1080}
              className={styles.appVisualImage}
              sizes="(max-width: 1080px) 90vw, 320px"
            />
            <Image
              src="/movo_app.png"
              alt="Movo app interface preview"
              width={540}
              height={1080}
              className={`${styles.appVisualImage} ${styles.appVisualImageShrink}`}
              sizes="(max-width: 1080px) 90vw, 320px"
            />
          </div>
        </section>
      </main>

      {trackingOpen && (
        <div className={styles.modalBackdrop} role="presentation" onClick={closeTrackingModal}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tracking-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>Track a package</p>
                <h2 id="tracking-modal-title" className={spaceGrotesk.className}>
                  Enter your tracking number
                </h2>
              </div>
              <button type="button" className={styles.modalClose} onClick={closeTrackingModal}>
                Close
              </button>
            </div>

            <form className={styles.modalForm} onSubmit={handleTrackingSearch}>
              <label className={styles.modalField}>
                <span>Tracking number</span>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(event) => setTrackingNumber(event.target.value)}
                  placeholder="e.g. MOVO-48291"
                  autoComplete="off"
                />
              </label>

              <button type="submit" className={styles.modalSubmit} disabled={trackingLoading}>
                {trackingLoading ? "Searching..." : "Check Status"}
              </button>
            </form>

            {trackingError && <p className={styles.modalError}>{trackingError}</p>}

            {trackingResult && (
              <div className={styles.statusPanel}>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Status</span>
                  <strong>{displayValue(resolvedStatus)}</strong>
                </div>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Tracking number</span>
                  <strong>{displayValue(trackingResult.tracking_number ?? trackingResult.package_code)}</strong>
                </div>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Location</span>
                  <strong>{displayValue(resolvedLocation)}</strong>
                </div>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Sender</span>
                  <strong>{displayValue(trackingResult.sender_name)}</strong>
                </div>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Receiver</span>
                  <strong>{displayValue(trackingResult.receiver_name)}</strong>
                </div>
                <div className={styles.statusRow}>
                  <span className={styles.statusLabel}>Updated</span>
                  <strong>{displayValue(resolvedUpdatedAt)}</strong>
                </div>
                {trackingResult.delivery_stage && (
                  <div className={styles.statusRow}>
                    <span className={styles.statusLabel}>Stage</span>
                    <strong>{trackingResult.delivery_stage}</strong>
                  </div>
                )}
                {trackingResult.message && <p className={styles.statusMessage}>{trackingResult.message}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <div>
          <Image
            src="/movo_logo.png"
            alt="MOVO"
            width={180}
            height={44}
            className={styles.footerBrandLogo}
          />
          <p>Redefining urban logistics with precision, velocity, and absolute security across Zimbabwe.</p>
        </div>
        <div>
          <h3>Company</h3>
          <a href="/about-us">About Us</a>
          <a href="/careers">Careers</a>
        </div>
        <div>
          <h3>Legal</h3>
          <a href="/terms-of-service">Terms of Service</a>
          <a href="/privacy-policy">Privacy Policy</a>
        </div>
        <div>
          <h3>Support</h3>
          <a href="mailto:support@movo.co.zw">Contact Support</a>
          <a href="/help-center">Help Center</a>
        </div>
      </footer>
    </div>
  );
}
