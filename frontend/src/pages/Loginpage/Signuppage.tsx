import styles from "./Loginpage.module.css";
import Button from "../../components/Button/Button";
import type { SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignupPage() {
  const Navigate = useNavigate();

  async function submitRegister(e: SubmitEvent) {
    e.preventDefault(); // To prevent default form behaviour
    const form_data = new FormData(e.currentTarget as HTMLFormElement);
    const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        name: form_data.get("name"),
        email: form_data.get("email"),
        password: form_data.get("password"),
        }),
    });
    const data = await response.json();
    if(response.ok){
        Navigate("/signin");
    }
    console.log("Status: ", response.status);
    console.log("Data: ", data);
  }

  return (
    <div className={styles.loginform}>
        <div className={styles.formcontainer}>
          <h1>Sign up to Task Board</h1>
          <p style={{ fontSize: "1.1em" }}>Enter your name, email and password in the given fields.</p>
          <div style={{ height: "30px" }}></div>
          <form className={styles.form} onSubmit={submitRegister}>
            <div className = {styles.input}>
              <label>Name: </label> 
              <br />
              <input type="text" name="name" required className={styles.inputfield}/>
            </div>
            <div style={{ height: "20px" }}></div>
            <div className = {styles.input}>
              <label>Email: </label> 
              <br />
              <input type="email" name="email" required className={styles.inputfield}/>
            </div>
            <div style={{ height: "20px" }}></div>
            <div className = {styles.input}>
              <label>Password: </label> 
              <br />
              <input type="password" name="password" required className={styles.inputfield}/>
            </div>
            <div style={{ height: "40px" }}></div>
            <Button priority="first" type="submit">Sign Up</Button>
          </form>
          <div style={{ height: "20px" }}></div>
          <p style={{ fontSize: "1.1em" }}>Already have an account? <Link to="/signin">Log in here</Link>.</p>
        </div>
      </div>
  );
}

export default SignupPage;