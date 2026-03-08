import { useState, useContext } from "react";
import styles from "./auth.module.css";
import Button from "../../components/Button/Button";
import { DispatchContext } from "../../user_data/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import type { SubmitEvent } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useContext(DispatchContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    setError(null);
    setIsLoading(true);

    try {
      const loginRes = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        throw new Error(`Login failed (${loginRes.status})`);
      }

      // console.log("Hello World!");

      const loginData = await loginRes.json();

      const userRes = await fetch(`http://localhost:3000/api/auth/${loginData.userId}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      console.log("Hello World!");

      if (!userRes.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await userRes.json();

      dispatch({
        type: "LOGIN",
        data: {
          user: {
            userId: loginData.userId,
            name: userData.data.personalData.name,
            email: userData.data.personalData.email,
            role: userData.data.personalData.globalRole,
            projects: userData.data.projectData,
            avatar: userData.data.personalData.avatar,
          }, isLoading: false,
          // refreshToken: loginData.refreshToken,
          // authenticated: true,
        },
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginform}>
      <div className={styles.formcontainer}>
        <h1>Log in to Task Board</h1>
        <p style={{ fontSize: "1.1em" }}>
          Enter your email and password in the given fields.
        </p>
        <div style={{ height: "30px" }} />

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

          <div className={styles.input}>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.inputfield}
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div style={{ height: "20px" }} />

          <div className={styles.input}>
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.inputfield}
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <div style={{ height: "40px" }} />

          <Button
            priority="first"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <div style={{ height: "20px" }} />
        <p style={{ fontSize: "1.1em" }}>
          Don't have an account? <Link to="/signup">Register here</Link>.
        </p>
      </div>
    </div>
  );
}