# EventFlow clay frontend handoff

The React frontend has been redesigned around the approved ivory/lavender clay direction. The existing event-booking app, its routes, authentication and API contracts remain in place. This is working frontend source, not the earlier illustrative cloud-dashboard concept.

## Start locally

Use Node.js 18 or later and npm. Run from the project root:

```bash
cd frontend
npm ci
cp .env.example .env
# Set VITE_API_URL to the existing backend API, ending in /api.
npm run dev
```

Vite uses port 3000. Without a VITE_API_URL override, `/api` is proxied to `http://localhost:5000` in development. The backend still needs its existing PostgreSQL database and server configuration. Backend setup is described in the original README. No backend files or database schema were changed.

For a production build:

```bash
cd frontend
npm ci
npm run build
npm run preview
```

The deployable output is `frontend/dist`. Configure VITE_API_URL before building if the API is on another origin. The API's CORS settings must allow the frontend origin. Static hosting must send application routes such as `/events/...` and `/booking/...` to `index.html`. No AWS deployment, account changes or paid resources were created.

## What changed

- Original clay ticket illustration built with CSS and SVG, not an image-generation placeholder.
- New responsive landing page, search, category controls and API-driven event cards.
- Ivory/lavender design tokens, restrained sage and peach accents, sculpted buttons/cards and inset form fields.
- Unified event artwork when photos are absent, and a fallback when an event photo fails to load.
- Booking, confirmation, history, user dashboard, admin screens and infrastructure demo use the same materials.
- Real mobile navigation, visible keyboard focus, skip link, reduced-motion treatment and print cleanup.
- Event pagination now requests the selected page. URL filters synchronize with the filter inputs.
- Login returns a guest to the selected booking instead of losing their place.
- Removed a duplicate authentication provider.
- Booking quantity input is bounded by availability and the existing ten-ticket limit.
- Cancelled bookings remain in history instead of disappearing.
- Failed dashboard/history/admin requests show a retry state instead of misleading empty or zero data.
- Added the missing admin bookings page, using the existing read-only `/api/admin/bookings` endpoint and its status filter.
- Admin tables become labeled phone cards, with actions and booking data visible without horizontal scrolling.
- Event editor preserves a zero ticket price and displays local wall-clock time correctly.
- Removed unsupported marketing claims about live customer counts, email delivery, QR tickets, payment processing and a 24-hour cancellation policy. Those capabilities were not implemented by the supplied API.
- Fonts are served locally with their license. Admin charts load separately from the public app bundle.

## Verification

Completed on the delivered source:

- `npm run build`: passed, no large-chunk warning.
- `npm run lint`: passed.
- `npm test`: 10 component tests passed.
- `CHECK_A11Y=1 npm run test:ui`: 55 checks passed, including five automated WCAG A/AA scans with no reported violations on the scanned screens.
- Direct pixel inspection of desktop, 390px phone and 320px phone layouts. Fixed hero clipping, cramped tables, missing mobile navigation and low-contrast text during review.

The browser suite covers search, filters, pagination, authentication return-to-booking, ticket quantities/totals, booking submission and confirmation, cancellation history, role protection, admin event create/edit, booking status filters, loading errors/retry, empty states and all application routes. It uses API-contract fixtures intercepted inside the test browser. It does not add a mock data mode to the application, contact AWS, send email, charge money or create real bookings.

For browser tests, use an installed Chrome/Chromium via CHROME_BIN, or install Playwright's Chromium:

```bash
cd frontend
npx playwright install chromium
npm run test:ui
# To include the five automated accessibility scans:
CHECK_A11Y=1 npm run test:ui
```

CHROME_BIN is optional. On systems with `/usr/bin/google-chrome-stable`, the test runner uses that browser. Otherwise it uses Playwright's installed Chromium.

Automated accessibility checks are a useful baseline, not certification or a replacement for assistive-technology testing. Some React Router v6 future-version notices appear in the component test output; they are not test failures.

## What remains outside this handoff

- Live backend/PostgreSQL integration and deployed AWS verification were not performed. No running backend URL or database environment was supplied.
- This frontend does not add payment collection, email notifications or a QR admission system. Existing booking behavior is preserved.
- Direct delivery to the original repository was authorized by the collaborator after the source was prepared. No fork or pull request is needed; the existing repository audience is unchanged.
- Existing backend security, concurrency, hosting and deployment settings were not audited or modified.

## Get the source

Use the repository's `main` branch. In an existing clean checkout, run `git pull --ff-only`, then follow the frontend setup above. Review local changes first rather than overwriting them. The optional source ZIP and patch were prepared against base commit `fca0fd1261f1723f302d97509e9490574b84682a` before repository delivery.

Screenshots in the separate preview package use fictional local test data, not live events or bookings.
