import { Link } from "react-router-dom";
import { Brand, Icon } from "./DesignSystem";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-main">
        <div className="footer-top">
          <div>
            <Brand />
            <p>
              A little less planning.
              <br />A lot more being there.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <Link to="/events">Find an event</Link>
            <Link to="/my-bookings">My tickets</Link>
            <Link to="/infrastructure">
              Explore the infrastructure <Icon name="arrow" />
            </Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} EventFlow</span>
          <span>
            <Icon name="cloud" /> Built for good times. Powered by the cloud.
          </span>
        </div>
      </div>
    </footer>
  );
}
