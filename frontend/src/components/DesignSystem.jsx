import { useState } from "react";
import { Link } from "react-router-dom";

export function Icon({ name = "ticket", className = "", ...props }) {
  const paths = {
    ticket: (
      <>
        <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4z" />
        <path d="M15 5v2m0 3v4m0 3v2" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    music: (
      <>
        <path d="M9 18V5l12-2v13M9 8l12-2" />
        <ellipse cx="6" cy="18" rx="3" ry="3" />
        <ellipse cx="18" cy="16" rx="3" ry="3" />
      </>
    ),
    mic: (
      <>
        <rect x="8" y="2" width="8" height="13" rx="4" />
        <path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8" />
      </>
    ),
    workshop: (
      <>
        <path d="m9 7-5 5 5 5m6-10 5 5-5 5m-2-14-2 18" />
      </>
    ),
    sports: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3v18M5 5c9 3 11 5 14 14M19 5C10 8 8 10 5 19" />
      </>
    ),
    art: (
      <>
        <path d="M12 3c-13 0-13 18 0 18 5 0 1-5 5-5 8 0 6-13-5-13Z" />
        <circle cx="7" cy="10" r=".8" />
        <circle cx="11" cy="6" r=".8" />
        <circle cx="17" cy="8" r=".8" />
      </>
    ),
    food: (
      <>
        <path d="M4 3v6c0 4 6 4 6 0V3M7 3v18M19 21V3c-5 3-5 11 0 11" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 2v6m10-6v6M3 11h18m-11 4h4" />
      </>
    ),
    location: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    cloud: <path d="M6 18a5 5 0 0 1-1-10 7 7 0 0 1 13-1 5.5 5.5 0 1 1 1 11Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    chevron: <path d="m9 5 7 7-7 7" />,
  };
  return (
    <svg
      className={`ef-icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.ticket}
    </svg>
  );
}

export function Brand({ compact = false }) {
  return (
    <Link to="/" className="brand" aria-label="EventFlow home">
      <span className="brand-mark">
        <Icon />
      </span>
      {!compact && (
        <span>
          eventflow<span className="brand-dot">.</span>
        </span>
      )}
    </Link>
  );
}

export function TicketSculpture({ small = false }) {
  return (
    <div
      className={`ticket-sculpture ${small ? "ticket-small" : ""}`}
      aria-hidden="true"
    >
      <div className="sculpt-orbit orbit-one" />
      <div className="sculpt-orbit orbit-two" />
      <div className="sculpt-spark spark-one">✦</div>
      <div className="sculpt-spark spark-two">✦</div>
      <div className="clay-ticket ticket-back">
        <Icon name="music" />
        <div className="ticket-rule" />
      </div>
      <div className="clay-ticket ticket-front">
        <div className="ticket-heading">
          GOOD TIMES
          <br />
          <b>ADMIT ONE</b>
        </div>
        <span className="ticket-symbol">
          <Icon name="ticket" />
        </span>
        <div className="ticket-perforation" />
        <div className="ticket-stub">
          <span>
            MAKE A<br />
            MEMORY.
          </span>
          <div className="ticket-barcode" />
        </div>
      </div>
      <div className="sculpt-chip">
        <span className="tiny-dot" /> Your next story starts here
      </div>
    </div>
  );
}

export function EventArtwork({ category, title, className = "" }) {
  const styles = {
    Music: ["music", "lilac"],
    Conference: ["mic", "sage"],
    Workshop: ["workshop", "peach"],
    Sports: ["sports", "sage"],
    Theater: ["ticket", "lilac"],
    "Food & Drink": ["food", "peach"],
    Art: ["art", "peach"],
  };
  const [name, tone] = styles[category] || ["ticket", "lilac"];
  return (
    <div
      className={`event-artwork art-${tone} ${className}`}
      role="img"
      aria-label={`${category || "Event"} illustration for ${title || "this event"}`}
    >
      <span className="art-orbit" />
      <span className="art-object">
        <Icon name={name} />
      </span>
      <span className="art-spark">✦</span>
      <span className="art-caption">{category || "Something good awaits"}</span>
    </div>
  );
}

export function EventMedia({ event, className = "", imageClassName = "" }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`event-media ${className}`}>
      {event.imageUrl && !failed ? (
        <img
          src={event.imageUrl}
          alt={event.title}
          className={imageClassName}
          onError={() => setFailed(true)}
        />
      ) : (
        <EventArtwork category={event.category} title={event.title} />
      )}
    </div>
  );
}

export function DataError({ title = "This part needs another try.", onRetry }) {
  return (
    <div className="card data-error" role="alert">
      <span className="category-icon tone-lilac">
        <Icon name="cloud" />
      </span>
      <h2>{title}</h2>
      <p>We could not reach the service. Your data has not been changed.</p>
      <button className="btn-primary" onClick={onRetry}>
        Try again <Icon name="arrow" />
      </button>
    </div>
  );
}
