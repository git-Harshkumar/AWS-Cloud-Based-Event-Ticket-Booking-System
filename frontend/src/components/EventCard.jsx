import { Link } from "react-router-dom";
import { EventArtwork, Icon } from "./DesignSystem";

export default function EventCard({ event }) {
  const date = new Date(event.eventDate);
  const past = date < new Date();
  const soldOut = Number(event.availableSeats) <= 0;
  return (
    <Link className="event-card card group" to={`/events/${event.id}`}>
      <div className="event-card-visual">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}
        <EventArtwork category={event.category} title={event.title} />
        <span className="event-date">
          <b>{date.toLocaleDateString("en-US", { day: "2-digit" })}</b>
          <span>{date.toLocaleDateString("en-US", { month: "short" })}</span>
        </span>
        <span className="event-category">{event.category}</span>
      </div>
      <div className="event-card-body">
        <h3>{event.title}</h3>
        <p className="event-meta">
          <Icon name="calendar" />
          <time dateTime={event.eventDate}>
            {date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </p>
        <p className="event-meta">
          <Icon name="location" />
          <span>{event.location}</span>
        </p>
        <div className="event-card-bottom">
          <span className="event-price">
            {Number(event.ticketPrice) === 0
              ? "Free"
              : `$${Number(event.ticketPrice).toFixed(2)}`}
            <small>
              {Number(event.ticketPrice) === 0 ? "entry" : "/ ticket"}
            </small>
          </span>
          <span
            className={`event-availability ${past || soldOut ? "unavailable" : ""}`}
          >
            {past ? (
              "Event ended"
            ) : soldOut ? (
              "Sold out"
            ) : (
              <>
                <i className="tiny-dot" />
                {event.availableSeats} left
              </>
            )}
          </span>
          <span className="event-card-arrow">
            <Icon name="arrow" />
          </span>
        </div>
      </div>
    </Link>
  );
}
