import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventCard from "./EventCard";
import { DataError, EventMedia, TicketSculpture } from "./DesignSystem";

const event = {
  id: "a",
  title: "Test gathering",
  category: "Music",
  location: "Test venue",
  eventDate: "2099-06-01T18:00:00Z",
  availableSeats: 5,
  ticketPrice: 12.5,
};
function draw(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}
beforeEach(() => vi.clearAllMocks());
afterEach(() => cleanup());

describe("Event card", () => {
  it("links to the actual event", () => {
    draw(<EventCard event={event} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/events/a");
  });
  it("shows the numeric ticket price and remaining seats", () => {
    draw(<EventCard event={event} />);
    expect(screen.getByText("$12.50")).toBeInTheDocument();
    expect(screen.getByText("5 left")).toBeInTheDocument();
  });
  it("labels zero-price events as free", () => {
    draw(<EventCard event={{ ...event, ticketPrice: 0 }} />);
    expect(screen.getByText("Free")).toBeInTheDocument();
  });
  it("does not advertise availability when sold out", () => {
    draw(<EventCard event={{ ...event, availableSeats: 0 }} />);
    expect(screen.getByText("Sold out")).toBeInTheDocument();
    expect(screen.queryByText("0 left")).not.toBeInTheDocument();
  });
  it("labels an event in the past", () => {
    draw(<EventCard event={{ ...event, eventDate: "2000-01-01T10:00:00Z" }} />);
    expect(screen.getByText("Event ended")).toBeInTheDocument();
  });
  it("renders category illustration if there is no photo", () => {
    draw(<EventCard event={event} />);
    expect(screen.getByRole("img")).toHaveAccessibleName(
      "Music illustration for Test gathering",
    );
  });
});

describe("Shared materials", () => {
  it("uses a supplied event image", () => {
    draw(<EventMedia event={{ ...event, imageUrl: "/test.jpg" }} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/test.jpg");
  });
  it("falls back to clay illustration after a photo fails", () => {
    draw(<EventMedia event={{ ...event, imageUrl: "/missing.jpg" }} />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByRole("img")).toHaveAccessibleName(
      "Music illustration for Test gathering",
    );
  });
  it("lets the user retry a failed data load", () => {
    const retry = vi.fn();
    draw(<DataError onRetry={retry} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Your data has not been changed",
    );
  });
  it("keeps decorative ticket art out of the accessibility tree", () => {
    const { container } = draw(<TicketSculpture />);
    expect(container.querySelector(".ticket-sculpture")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
