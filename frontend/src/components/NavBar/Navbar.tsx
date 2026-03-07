import styles from "./Navbar.module.css";
import logo from "../../assets/logo.png";
import { Link, NavLink } from "react-router";
import { useContext, useState } from "react";
import { UserContext } from "../../user_data/UserDataContext";

function NavBar() {
  const [open, setOpen] = useState(false);
  const userData = useContext(UserContext);

  return (
    <nav className={styles.navbar}>
      <div className={styles.containerFluid}>
        <Link className={styles.navLogo} to='/'>
          <img src={logo} alt="Task Board Logo" />
          <button className={styles.navbarToggler} onClick={() => setOpen(!open)}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              width="24"
              height="24"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </Link>
        <div
          className={`${styles.collapse} ${styles.navbarCollapse} ${open ? styles.show : ""
            }`}
        >
          <div className={styles.navbarNav}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }

              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Features
            </NavLink>

            <NavLink
              to="/"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }

              onClick={() => {
                document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              About
            </NavLink>

            <NavLink
              to="/signin"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              Login
            </NavLink>

            <NavLink
              to="/signup"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
            >
              Signup
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
