import styles from "./Loginpage.module.css";
import Button from "../../components/Button/Button";
import type { SubmitEvent } from "react";

async function submitLogin(e: SubmitEvent) {
  e.preventDefault(); // To prevent default form behaviour
  const form_data = new FormData(e.currentTarget as HTMLFormElement);
  const response = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: form_data.get("email"),
      password: form_data.get("password"),
    }),
  });
  console.log(response.ok);
  const data = await response.json();
  console.log("Data: ", data);
}

function LoginPage() {
  return (
    <div className={styles.loginpage}>
      <h1>Log in to Task Board</h1>
      <p>Enter your email and password in the given fields.</p>
      <div style={{ height: "30px" }}></div>
      <form onSubmit={submitLogin}>
        <div className = {styles.inputfield}>
          <label>Email: </label> 
          <br />
          <input type="email" name="email" required />
        </div>
        <div style={{ height: "20px" }}></div>
        <div className = {styles.inputfield}>
          <label>Password: </label> 
          <br />
          <input type="password" name="password" required />
        </div>
        <div style={{ height: "40px" }}></div>
        <Button priority="first" type="submit">Log In</Button>
      </form>
      <p>Don't have an account? <a href="/register">Register here</a>.</p>
    </div>
  );
}

export default LoginPage;