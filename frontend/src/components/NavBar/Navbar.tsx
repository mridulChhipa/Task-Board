import styles from "./Navbar.module.css";
import logo from "../../assets/logo.png";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";

type NavItem = {
    item: ReactNode;
    onClick: () => void;
}

type NavProps = {
    left_list: NavItem[];
    right_list: NavItem[];
}

function NavBar({left_list, right_list}: NavProps) {
  const navigate = useNavigate();
  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <img src={logo} alt="Task Board Logo" style={{ height: "60px" }} onClick={() => {navigate("/")}} />
        <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginLeft: "0.5rem" }} onClick={() => {navigate("/")}}>Task Board</h3>
        <div style={{ width: "2rem" }}></div>
        {left_list.map((item, index) => (
          <div key={index} onClick={item.onClick} className={styles.nav_item}>
            {item.item}
          </div>
        ))}
      </div>
      <div className={styles.right}>
        {right_list.map((item, index) => (
          <div key={index} onClick={item.onClick} className={styles.nav_item}>
            {item.item}
          </div>
        ))}
      </div>
    </nav>
  );
}

export default NavBar;
export type { NavItem };
