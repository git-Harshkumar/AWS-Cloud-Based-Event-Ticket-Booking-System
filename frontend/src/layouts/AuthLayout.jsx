import { Outlet, Link } from "react-router-dom";
import { Brand, TicketSculpture } from "../components/DesignSystem";

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <Brand />
        <span className="eyebrow">YOUR INVITATION TO SOMETHING GOOD</span>
        <h2>
          Less one day.
          <br />
          More I was there.
        </h2>
        <p>
          A room full of new ideas. A song you know by heart. Make space for the
          moments that stay.
        </p>
        <TicketSculpture />
      </aside>
      <Link className="auth-back" to="/events">
        Back to discovering ↗
      </Link>
      <main id="main-content" className="auth-form-wrap">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
