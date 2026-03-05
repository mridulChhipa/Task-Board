import styles from "./Loginpage.module.css";
import Button from "../../components/Button/Button";
import type { SubmitEvent } from "react";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import { UserDispatchContext } from "../../user_data/UserDataContext";

function LoginPage() {
  const Navigate = useNavigate();
  const [resetForm, setResetForm] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const userDataDispatch = useContext(UserDispatchContext);

  async function submitLogin(e: SubmitEvent) {
    e.preventDefault(); // To prevent default form behaviour
    const form_data = new FormData(e.currentTarget as HTMLFormElement);
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: form_data.get("email"),
        password: form_data.get("password")
      }),
    });
    if(response.ok){
      const data = await response.json();
      console.log(data);
      const userResponse = await fetch(`http://localhost:3000/api/auth/${data.userId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const userData = await userResponse.json();
      console.log(userData);
      userDataDispatch({
        action_type: "LOGIN",
        data: {
          userId: data.userId,
          name: userData.data.personalData.name,
          email: userData.data.personalData.email,
          role: userData.data.personalData.email === "admin@taskboard.com" ? "GLOBAL_ADMIN" : "USER",
          projects: userData.data.projectData,
          avatar: userData.data.personalData.avatar,
          refreshToken: data.refreshToken
        }
      });
      Navigate("/dashboard");
    }
    else{
      console.log("Login failed with status: ", response.status);
      setResetForm(true);
      setAttempted(true);
    }
  }

  return (
      <div className={styles.loginform}>
        <div className={styles.formcontainer}>
          <h1>Log in to Task Board</h1>
          <p style={{ fontSize: "1.1em" }}>Enter your email and password in the given fields.</p>
          <div style={{ height: "30px" }}></div>
          <form className={styles.form} onSubmit={submitLogin} key={resetForm.toString()}>
            {attempted && <p style={{color: "red"}}>Login failed. Please try again.</p>}
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
            <Button priority="first" type="submit">Log In</Button>
          </form>
          <div style={{ height: "20px" }}></div>
          <p style={{ fontSize: "1.1em" }}>Don't have an account? <Link to="/signup">Register here</Link>.</p>
        </div>
      </div>
  );
}

export default LoginPage;