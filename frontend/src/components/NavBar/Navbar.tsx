import styles from "./Navbar.module.css";
import Button from "../Button/Button";
import logo from "../../assets/logo.png";

type NavProps = {
    feature: () => void;
    about: () => void;
    sign_up: () => void;
    sign_in: () => void;
}

function NavBar({feature, about, sign_up, sign_in}: NavProps) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <img src={logo} alt="Task Board Logo" style={{ height: "100px" }} />
        <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginLeft: "0.5rem" }}>Task Board</h3>
        <div style={{ width: "2rem" }}></div>
        <Button priority="third" onClick={feature}>Features</Button>
        <Button priority="third" onClick={about}>About</Button>
      </div>
      <div className={styles.right}>
        <Button priority="second" onClick={sign_in}>Sign In</Button>
        <Button priority="first" onClick={sign_up}>Sign Up</Button>  
      </div>
    </nav>
  );
}

export default NavBar;
