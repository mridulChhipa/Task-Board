import styles from "./Loginpage.module.css";
import Button from "../../components/Button/Button";
import type { SubmitEvent } from "react";

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
      role: form_data.get("role"),
      email: form_data.get("email"),
      password: form_data.get("password"),
    }),
  });
  const data = await response.json();
  console.log("Status: ", response.status);
  console.log("Data: ", data);
}

function SignupPage() {
  return (
    <div className={styles.loginpage}>
      <h1>Sign up to Task Board</h1>
      <p>Enter your name, role, email and password in the given fields.</p>
      <div style={{ height: "30px" }}></div>
      <form onSubmit={submitRegister}>
        <div className = {styles.inputfield}>
          <label>Full Name: </label> 
          <br />
          <input type="text" name="name" required />
        </div>
        <div style={{ height: "20px" }}></div>
        <div className = {styles.inputfield}>
          <label>Role: </label> 
          <br />
          
            <input type={"radio"} id="GAdmin" name="role" value="GAdmin" required />
            <label htmlFor="GAdmin">Global Admin</label>
            <br />
            <input type={"radio"} id="PAdmin" name="role" value="PAdmin" required />
            <label htmlFor="PAdmin">Project Admin</label>
            <br />
            <input type={"radio"} id="PMember" name="role" value="PMember" required />
            <label htmlFor="PMember">Project Member</label>
            <br />
            <input type={"radio"} id="PViewer" name="role" value="PViewer" required />
            <label htmlFor="PViewer">Project Viewer</label>
        
        </div>
        <div style={{ height: "20px" }}></div>
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
        <Button priority="first" type="submit">Sign Up</Button>
      </form>
    </div>
  );
}

export default SignupPage;