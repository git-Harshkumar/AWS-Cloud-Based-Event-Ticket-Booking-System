import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Icon, TicketSculpture } from "../components/DesignSystem";
import EventCard from "../components/EventCard";

const categories = [
  { name: "Music", icon: "music", tone: "lilac", line: "Find your rhythm" },
  { name: "Conference", icon: "mic", tone: "sage", line: "Meet a new idea" },
  { name: "Workshop", icon: "workshop", tone: "peach", line: "Make something" },
  { name: "Sports", icon: "sports", tone: "sage", line: "Be part of the roar" },
  { name: "Theater", icon: "ticket", tone: "lilac", line: "Take your seat" },
  {
    name: "Food & Drink",
    icon: "food",
    tone: "peach",
    line: "A taste of something",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let active = true;
    api
      .get("/events?limit=3&sortBy=eventDate&sortOrder=asc")
      .then(({ data }) => {
        if (!active) return;
        const payload = data?.data || data;
        setEvents(Array.isArray(payload) ? payload : payload?.events || []);
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, []);
  const searchEvents = (e) => {
    e.preventDefault();
    navigate(
      `/events${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""}`,
    );
  };
  return (
    <>
      <section className="home-hero container-main">
        <div className="hero-surface">
          <div className="hero-copy">
            <span className="eyebrow">
              <i className="tiny-dot" /> LESS SCROLLING. MORE LIVING.
            </span>
            <h1>
              Good times.
              <br />
              <span>Great company.</span>
              <br />
              You're invited.
            </h1>
            <p>
              Find your kind of crowd. From the front row to a fresh idea, your
              next memorable moment starts here.
            </p>
            <form className="hero-search" onSubmit={searchEvents}>
              <label htmlFor="home-search" className="sr-only">
                Search events
              </label>
              <Icon name="search" />
              <input
                id="home-search"
                type="search"
                placeholder="What are you into?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn-primary" type="submit">
                Find events <Icon name="arrow" />
              </button>
            </form>
            <div className="hero-note">
              <Icon name="ticket" /> Your plans, tickets and little moments. All
              in one place.
            </div>
          </div>
          <TicketSculpture />
        </div>
      </section>
      <section className="container-main home-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FOLLOW YOUR CURIOSITY</span>
            <h2>A little of what you love.</h2>
          </div>
          <Link className="subtle-link" to="/events">
            All experiences <Icon name="arrow" />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/events?category=${encodeURIComponent(category.name)}`}
              className="category-card"
            >
              <span className={`category-icon tone-${category.tone}`}>
                <Icon name={category.icon} />
              </span>
              <h3>
                {category.name === "Conference"
                  ? "Conferences"
                  : category.name === "Workshop"
                    ? "Workshops"
                    : category.name}
              </h3>
              <p>{category.line}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="container-main home-section events-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">MAKE IT A PLAN</span>
            <h2>Something to look forward to.</h2>
          </div>
          <Link className="subtle-link" to="/events">
            Browse events <Icon name="arrow" />
          </Link>
        </div>
        {status === "loading" ? (
          <div
            className="grid md:grid-cols-3 gap-6"
            aria-label="Loading events"
            aria-busy="true"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="card h-80 animate-pulse bg-secondary-100"
              />
            ))}
          </div>
        ) : events.length ? (
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="quiet-state">
            <span className="category-icon tone-lilac">
              <Icon name="calendar" />
            </span>
            <div>
              <h3>
                {status === "error"
                  ? "The next good thing is worth a refresh."
                  : "The calendar has room for something good."}
              </h3>
              <p>
                {status === "error"
                  ? "We could not reach the events service. Browse events to try again."
                  : "No events are listed yet. Check back when the next ones are added."}
              </p>
            </div>
            <Link to="/events" className="btn-secondary">
              Explore events <Icon name="arrow" />
            </Link>
          </div>
        )}
      </section>
      <section className="container-main home-section">
        <div className="how-it-works">
          <div>
            <span className="eyebrow">A LITTLE LESS EFFORT</span>
            <h2>
              From we should
              <br />
              to see you there.
            </h2>
            <Link to="/events" className="subtle-link">
              Let's make a plan <Icon name="arrow" />
            </Link>
          </div>
          <div className="steps-list">
            {[
              {
                title: "Find your thing",
                text: "Search the calendar or follow a category that feels like you.",
                icon: "search",
              },
              {
                title: "Make it official",
                text: "Choose your event, check availability and book your tickets.",
                icon: "ticket",
              },
              {
                title: "Just show up",
                text: "Keep your booking details together in your personal space.",
                icon: "calendar",
              },
            ].map((step, i) => (
              <div className="how-step" key={step.title}>
                <span className="step-number">0{i + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
                <Icon name={step.icon} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="container-main">
        <div className="cloud-note">
          <Icon name="cloud" />
          <div>
            <b>Good experiences, thoughtful infrastructure.</b>
            <span>
              Explore how this project uses AWS to connect every part of the
              booking flow.
            </span>
          </div>
          <Link to="/infrastructure" className="subtle-link">
            Take a look <Icon name="arrow" />
          </Link>
        </div>
      </div>
    </>
  );
}
