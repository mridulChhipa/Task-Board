import styles from './Navbar.module.css';
import logo from '../../assets/logo.png';
import { Link, NavLink } from 'react-router';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import settingsIcon from '../../assets/settingsIcon.svg';
import { useLogout } from '../../utils/auth.utils';

function NavBar() {
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const userData = useContext(AuthContext);
  const logout = useLogout();

  // console.log('From Nav,', userData);

  return (
    <nav className={styles.navbar}>
      <div className={styles.containerFluid}>
        <div className={styles.navLogo}>
          <Link className={styles.logo_link} to="/">
            <img src={logo} alt="Task Board Logo" />
          </Link>
          <button
            className={styles.navbarToggler}
            onClick={() => setOpen(!open)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="24"
              height="24"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
        <div
          className={`${styles.collapse} ${styles.navbarCollapse} ${
            open ? styles.show : ''
          }`}
        >
          <div className={styles.navbarNav}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              onClick={() => {
                document
                  .getElementById('features')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Features
            </NavLink>

            <NavLink
              to="/"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              onClick={() => {
                document
                  .getElementById('about')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              About
            </NavLink>

            {!userData.user?.email ? (
              <>
                <NavLink
                  to="/signin"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ''}`
                  }
                >
                  Login {userData.user?.email}
                </NavLink>

                <NavLink
                  to="/signup"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ''}`
                  }
                >
                  Signup
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ''}`
                  }
                >
                  Dashboard
                </NavLink>

                <span className={styles.userSettingsContainer}>
                  <button
                    className={styles.userSettings}
                    onClick={() => {
                      setDropOpen(!dropOpen);
                    }}
                  >
                    <img src={settingsIcon} />
                  </button>

                  {dropOpen && (
                    <ul className={styles.dropdown}>
                      <li className={styles.dropItem}>
                        <NavLink to="/account">Account</NavLink>
                      </li>
                      <li className={styles.dropItem}>
                        <NavLink to="/projects">Projects</NavLink>
                      </li>
                      <hr />
                      <li className={styles.dropItem}>
                        <span className={styles.logout} onClick={logout}>
                          Logout
                        </span>
                      </li>
                    </ul>
                  )}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
