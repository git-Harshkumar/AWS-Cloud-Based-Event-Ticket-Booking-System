import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

// Browser checks use API-contract fixtures. They do not contact AWS or create real bookings.
const base = "http://127.0.0.1:3010";
const out = process.env.SCREENSHOT_DIR || "test-results/screenshots";
await mkdir(out, { recursive: true });
const server = spawn(
  "node",
  [
    "node_modules/vite/bin/vite.js",
    "--host",
    "127.0.0.1",
    "--port",
    "3010",
    "--strictPort",
  ],
  { stdio: "pipe" },
);
let browser;
const tests = [],
  errors = [],
  accessibility = [];
const check = (name, value) => {
  assert.ok(value, name);
  tests.push(name);
  console.log("PASS", name);
};
const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 40).toISOString();
const events = [
  {
    id: "event-1",
    title: "A night in good company",
    description:
      "An intimate evening of independent music, good conversation and performances worth being there for. Doors open thirty minutes before the first set.",
    category: "Music",
    location: "The Courtyard, New Delhi",
    eventDate: future,
    ticketPrice: 35,
    totalSeats: 120,
    availableSeats: 84,
    imageUrl: null,
  },
  {
    id: "event-2",
    title: "Small ideas. Big conversations.",
    description:
      "A day for makers and curious people to share their ideas, meet new collaborators and discover what comes next.",
    category: "Conference",
    location: "Studio House, Bengaluru",
    eventDate: future,
    ticketPrice: 49,
    totalSeats: 200,
    availableSeats: 56,
    imageUrl: null,
  },
  {
    id: "event-3",
    title: "Make something with your hands",
    description:
      "A hands-on workshop for anyone looking to slow down and make something meaningful. Materials are included.",
    category: "Workshop",
    location: "The Workshop, Mumbai",
    eventDate: future,
    ticketPrice: 25,
    totalSeats: 30,
    availableSeats: 12,
    imageUrl: null,
  },
];
const user = {
  id: "user-1",
  name: "Alex Morgan",
  email: "alex@example.test",
  role: "USER",
};
const booking = {
  id: "booking-1",
  bookingReference: "8f743c92-8ba1-4cc6-a0d3-f153106d973c",
  userId: user.id,
  eventId: "event-1",
  quantity: 2,
  totalAmount: 70,
  status: "CONFIRMED",
  createdAt: new Date().toISOString(),
  event: events[0],
  user,
};
let bookings = [booking],
  role = "USER",
  apiCalls = [],
  mode = "normal";
const fulfill = (route, data, pagination, status = 200) =>
  route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify({
      success: status < 400,
      data,
      ...(pagination ? { pagination } : {}),
    }),
  });
async function fixtures(context) {
  await context.route("**/api/**", async (route) => {
    const req = route.request(),
      url = new URL(req.url()),
      p = url.pathname.replace("/api", ""),
      method = req.method();
    apiCalls.push({ p, search: url.search, method, body: req.postDataJSON() });
    if (p === "/auth/me") return fulfill(route, { user: { ...user, role } });
    if (p === "/auth/login" || p === "/auth/register")
      return fulfill(route, {
        user: { ...user, role },
        token: "local-test-token",
      });
    if (p === "/events" && method === "GET") {
      if (mode === "error")
        return fulfill(
          route,
          { message: "Fixture: service unavailable" },
          null,
          503,
        );
      if (mode === "empty")
        return fulfill(route, [], { page: 1, total: 0, totalPages: 0 });
      let data = events;
      if (url.searchParams.get("category"))
        data = data.filter(
          (e) => e.category === url.searchParams.get("category"),
        );
      if (url.searchParams.get("search"))
        data = data.filter((e) =>
          e.title
            .toLowerCase()
            .includes(url.searchParams.get("search").toLowerCase()),
        );
      if (url.searchParams.get("page") === "2")
        data = [
          { ...events[1], id: "event-page-2", title: "Page two gathering" },
        ];
      return fulfill(route, data, {
        page: Number(url.searchParams.get("page")) || 1,
        limit: 12,
        total: 15,
        totalPages: 2,
      });
    }
    if (p.startsWith("/events/") && method === "GET")
      return fulfill(
        route,
        events.find((e) => e.id === p.split("/")[2]) || events[0],
      );
    if (p === "/bookings/my") return fulfill(route, bookings);
    if (p === "/bookings" && method === "POST") {
      const data = req.postDataJSON();
      bookings = [
        {
          ...booking,
          quantity: data.quantity,
          totalAmount: data.quantity * 35,
        },
      ];
      return fulfill(route, { booking: bookings[0] }, null, 201);
    }
    if (p.endsWith("/cancel")) {
      bookings = bookings.map((b) => ({ ...b, status: "CANCELLED" }));
      return fulfill(route, bookings[0]);
    }
    if (p.startsWith("/bookings/")) return fulfill(route, bookings[0]);
    if (p === "/admin/events")
      return fulfill(route, events, { page: 1, total: 3, totalPages: 1 });
    if (p === "/admin/bookings")
      return fulfill(route, bookings, { page: 1, total: 1, totalPages: 1 });
    if (p === "/admin/dashboard/charts")
      return fulfill(route, {
        revenueByMonth: [
          { month: "Oct", revenue: 150 },
          { month: "Nov", revenue: 250 },
        ],
        bookingsByStatus: [
          { status: "CONFIRMED", count: 5 },
          { status: "CANCELLED", count: 1 },
        ],
      });
    if (p === "/admin/dashboard")
      return fulfill(route, {
        totalUsers: 8,
        totalEvents: 3,
        totalBookings: 6,
        totalTicketsSold: 12,
        totalRevenue: 400,
      });
    if (p === "/instance")
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          instanceId: "backend-instance-1",
          hostname: "local-test-fixture",
          message: "Fixture response",
          timestamp: new Date().toISOString(),
        }),
      });
    if (p === "/health")
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          status: "healthy",
          uptime: 125,
          memory: { heapUsed: 12345678 },
          version: "1.0.0",
        }),
      });
    if (
      (p === "/events" && method === "POST") ||
      method === "PUT" ||
      method === "DELETE"
    )
      return fulfill(route, { ...events[0], ...req.postDataJSON() });
    return fulfill(route, {});
  });
}
async function snapshot(
  page,
  name,
  path,
  { width = 1440, height = 1000 } = {},
) {
  await page.setViewportSize({ width, height });
  await page.goto(base + path);
  await page.waitForTimeout(path === "/admin" ? 1300 : 450);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  if (
    process.env.CHECK_A11Y &&
    [
      "home-desktop",
      "events-desktop",
      "booking-mobile",
      "login-desktop",
      "admin-desktop",
    ].includes(name)
  ) {
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    check(
      `${name}: automated accessibility scan`,
      result.violations.length === 0,
    );
    accessibility.push({
      screen: name,
      violations: result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    });
  }
  const overflow = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    view: innerWidth,
    offenders: [...document.querySelectorAll("body *")]
      .filter(
        (el) =>
          el.getBoundingClientRect().right > innerWidth + 2 &&
          getComputedStyle(el).position !== "absolute",
      )
      .slice(0, 8)
      .map((el) => ({
        tag: el.tagName,
        cls: el.className,
        right: el.getBoundingClientRect().right,
      })),
  }));
  check(`${name}: no page overflow`, overflow.doc <= overflow.view + 1);
  return overflow;
}
try {
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  browser = await chromium.launch({
    executablePath:
      process.env.CHROME_BIN ||
      (existsSync("/usr/bin/google-chrome-stable")
        ? "/usr/bin/google-chrome-stable"
        : undefined),
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext();
  await fixtures(context);
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await snapshot(page, "home-desktop", "/");
  check(
    "Original event clay illustration present",
    (await page.locator(".ticket-front").count()) === 1,
  );
  await snapshot(page, "home-mobile", "/", { width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu" }).click();
  check(
    "Mobile navigation expands",
    (await page
      .getByRole("button", { name: "Close menu" })
      .getAttribute("aria-expanded")) === "true",
  );
  await page
    .locator("#mobile-nav")
    .getByRole("link", { name: "Discover", exact: true })
    .click();
  check(
    "Mobile navigation routes to discovery",
    new URL(page.url()).pathname === "/events",
  );
  await snapshot(page, "home-small", "/", { width: 320, height: 800 });
  await page.locator("#home-search").fill("good company");
  await page.locator(".hero-search button").click();
  await page.waitForTimeout(250);
  check(
    "Hero search passes query",
    new URL(page.url()).searchParams.get("search") === "good company",
  );
  await snapshot(page, "events-desktop", "/events");
  await page.getByRole("button", { name: "Next page" }).click();
  await page.waitForTimeout(250);
  check(
    "Event pagination fetches next page",
    apiCalls.some((c) => c.p === "/events" && c.search.includes("page=2")) &&
      (await page.getByText("Page two gathering").count()) > 0,
  );
  await snapshot(page, "events-mobile", "/events", { width: 390, height: 844 });
  await page.locator("#category").selectOption("Music");
  await page.getByRole("button", { name: "Apply Filters" }).click();
  await page.waitForTimeout(250);
  check(
    "Category filter applied to API",
    apiCalls.some((c) => c.search.includes("category=Music")),
  );
  await snapshot(page, "detail-desktop", "/events/event-1");
  await snapshot(page, "detail-mobile", "/events/event-1", {
    width: 390,
    height: 844,
  });
  await page.getByRole("button", { name: "Book Tickets" }).click();
  await page.waitForURL("**/login");
  await page.locator("#email").fill("alex@example.test");
  await page.locator("#password").fill("fixture-only-value");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await page.waitForURL("**/booking/event-1");
  check(
    "Login returns to selected event booking",
    new URL(page.url()).pathname === "/booking/event-1",
  );
  await snapshot(page, "booking-desktop", "/booking/event-1");
  await snapshot(page, "booking-mobile", "/booking/event-1", {
    width: 390,
    height: 844,
  });
  await page.getByRole("button", { name: "Increase quantity" }).click();
  check(
    "Ticket total updates",
    (await page
      .getByRole("button", { name: "Confirm Booking - $70.00" })
      .count()) === 1,
  );
  await page.getByRole("button", { name: "Confirm Booking - $70.00" }).click();
  await page.waitForURL("**/booking/confirmation/booking-1");
  check(
    "Booking submits actual event and quantity",
    apiCalls.some(
      (c) =>
        c.method === "POST" &&
        c.p === "/bookings" &&
        c.body.eventId === "event-1" &&
        c.body.quantity === 2,
    ),
  );
  await snapshot(
    page,
    "confirmation-mobile",
    "/booking/confirmation/booking-1",
    { width: 390, height: 844 },
  );
  await snapshot(page, "dashboard-desktop", "/dashboard");
  await snapshot(page, "dashboard-mobile", "/dashboard", {
    width: 390,
    height: 844,
  });
  await snapshot(page, "bookings-mobile", "/my-bookings", {
    width: 390,
    height: 844,
  });
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.waitForTimeout(250);
  check(
    "Cancellation retains history with cancelled status",
    (await page.getByText("CANCELLED", { exact: true }).count()) === 1,
  );
  await snapshot(page, "infrastructure-desktop", "/infrastructure");
  await snapshot(page, "infrastructure-mobile", "/infrastructure", {
    width: 390,
    height: 844,
  });
  role = "ADMIN";
  await snapshot(page, "admin-desktop", "/admin");
  await snapshot(page, "admin-mobile", "/admin", { width: 390, height: 844 });
  await snapshot(page, "manage-events-mobile", "/admin/events", {
    width: 390,
    height: 844,
  });
  await snapshot(page, "event-form-desktop", "/admin/events/create");
  await snapshot(page, "event-form-mobile", "/admin/events/create", {
    width: 390,
    height: 844,
  });
  await page.locator("#title").fill("A new test event");
  await page
    .locator("#description")
    .fill(
      "A test description long enough to pass the actual validation rules.",
    );
  await page.locator("#category").selectOption("Music");
  await page.locator("#location").fill("Local test venue");
  await page.locator("#ticketPrice").fill("0");
  await page.locator("#totalSeats").fill("40");
  await page.getByRole("button", { name: "Create Event", exact: true }).click();
  await page.waitForURL("**/admin/events");
  check(
    "Admin can submit a free event",
    apiCalls.some(
      (c) =>
        c.method === "POST" &&
        c.p === "/events" &&
        c.body.ticketPrice === 0 &&
        c.body.title === "A new test event",
    ),
  );
  await snapshot(page, "event-edit-mobile", "/admin/events/event-1/edit", {
    width: 390,
    height: 844,
  });
  await page.locator("#title").fill("Updated test event");
  await page.getByRole("button", { name: "Update Event", exact: true }).click();
  await page.waitForURL("**/admin/events");
  check(
    "Admin event edit preserves API update contract",
    apiCalls.some(
      (c) =>
        c.method === "PUT" &&
        c.p === "/events/event-1" &&
        c.body.title === "Updated test event",
    ),
  );
  await snapshot(page, "admin-bookings-mobile", "/admin/bookings", {
    width: 390,
    height: 844,
  });
  await page.locator("#booking-status").selectOption("CANCELLED");
  await page.waitForTimeout(200);
  check(
    "Admin booking status filters use API",
    apiCalls.some(
      (c) => c.p === "/admin/bookings" && c.search.includes("status=CANCELLED"),
    ),
  );
  await snapshot(page, "manage-events-small", "/admin/events", {
    width: 320,
    height: 800,
  });
  await snapshot(page, "booking-small", "/booking/event-1", {
    width: 320,
    height: 800,
  });
  await snapshot(
    page,
    "confirmation-small",
    "/booking/confirmation/booking-1",
    { width: 320, height: 800 },
  );
  role = "USER";
  await page.goto(base + "/admin");
  await page.waitForTimeout(400);
  check(
    "User role cannot access admin routes",
    new URL(page.url()).pathname === "/dashboard",
  );
  mode = "error";
  await snapshot(page, "events-error-mobile", "/events", {
    width: 390,
    height: 844,
  });
  check(
    "Event request failure shows retry, not invented cards",
    (await page.getByRole("button", { name: "Retry", exact: true }).count()) ===
      1,
  );
  mode = "normal";
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await page.waitForTimeout(250);
  check(
    "Event retry recovers data",
    (await page.locator(".event-card").count()) === 3,
  );
  mode = "empty";
  await snapshot(page, "events-empty-mobile", "/events", {
    width: 390,
    height: 844,
  });
  check(
    "Empty events have an explicit empty state",
    (await page.getByText("No events found", { exact: true }).count()) === 1,
  );
  mode = "normal";

  await context.clearCookies();
  await page.evaluate(() => localStorage.clear());
  await snapshot(page, "login-desktop", "/login");
  await snapshot(page, "login-mobile", "/login", { width: 390, height: 844 });
  await snapshot(page, "register-mobile", "/register", {
    width: 390,
    height: 844,
  });
  await page.getByRole("button", { name: "Create Account" }).click();
  check(
    "Registration validation visible",
    (await page.getByText("Name is required").count()) === 1,
  );
  await snapshot(page, "not-found-mobile", "/missing", {
    width: 390,
    height: 844,
  });
  check("No JavaScript runtime errors", errors.length === 0);
  await writeFile(
    `${out}/../browser-results.json`,
    JSON.stringify(
      { tests, errors, accessibility, fixtureOnly: true },
      null,
      2,
    ),
  );
  console.log(
    `${tests.length} checks passed. Fixture-only browser test; no real backend or AWS calls.`,
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
