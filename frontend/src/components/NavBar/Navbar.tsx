import styles from "./Navbar.module.css";
import Button from "../Button/Button";
import logo from "../../assets/logo.png";

function NavBar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <img src={logo} alt="Task Board Logo" style={{ height: "100px" }} />
        <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginLeft: "0.5rem" }}>Task Board</h3>
        <Button priority="third" onClick={() => console.log("Features")}>Features</Button>
        <Button priority="third" onClick={() => console.log("About")}>About</Button>
      </div>
      <div className={styles.right}>
        <Button priority="second" onClick={() => console.log("Sign In")}>Sign In</Button>
        <Button priority="first" onClick={() => console.log("Sign Up")}>Sign Up</Button>  
      </div>
    </nav>
  );
}

export default NavBar;
