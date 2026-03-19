import { useState, useContext, useEffect } from 'react';
import styles from './auth.module.css';
import Button from '../../components/Button/Button';
import { AuthContext, DispatchContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import type { SubmitEvent } from 'react';
import Form, {
  FormControl,
  InputArea,
  Label,
} from '../../components/Forms/Form';
import { NotificationWebSocket } from '../../utils/Websockets.utils';
import { handleNotification } from '../../App';

export default function LogInPage() {
  const navigate = useNavigate();
  const dispatch = useContext(DispatchContext);
  const authContext = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    setError(null);
    setIsLoading(true);

    try {
      const loginRes = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        throw new Error(`Login failed (${loginRes.status})`);
      }

      const loginData = await loginRes.json();

      const userRes = await fetch(
        `http://localhost:3000/api/auth/${loginData.userId}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      console.log('Hello World!');

      if (!userRes.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userRes.json();

      console.log(userData);

      dispatch({
        type: 'LOGIN',
        payload: {
          user: {
            userId: loginData.userId,
            name: userData.data.personalData.name,
            email: userData.data.personalData.email,
            role: userData.data.personalData.globalRole,
            projects: userData.data.projectData,
            avatar: userData.data.personalData.avatar,
            notifications: userData.data.notifications,
          },
          isLoading: false,
        },
      });

      new NotificationWebSocket(loginData.userId, handleNotification);

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  }
  
  useEffect(() => {
    if (authContext.user) {
      navigate('/dashboard');
    }
  }, [authContext.user, navigate]);

  return (
    <div className={styles.loginform}>
      <div className={styles.formcontainer}>
        <h1>Log in to Task Board</h1>
        <Form className={styles.form} onSubmit={handleSubmit}>
          {error && (
            <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
          )}

          <InputArea>
            <Label htmlFor="email">Email:</Label>
            <FormControl
              id="email"
              type="email"
              name="email"
              value={email}
              placeholder="Email e.g. email@provider.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputArea>
          <InputArea>
            <Label htmlFor="password">Password:</Label>
            <FormControl
              id="password"
              type="password"
              name="password"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputArea>

          <Button priority="first" type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>
        </Form>
        Don't have an account? <Link to="/signup">Register here</Link>.
      </div>
    </div>
  );
}
