import { API_URL } from '../../config';
import styles from './auth.module.css';
import Button from '../../components/Button/Button';
import type { SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Form, {
  FormControl,
  InputArea,
  Label,
} from '../../components/Form/Form';

function SignUpPage() {
  const navigate = useNavigate();

  async function submitRegister(e: SubmitEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
      }),
    });
    const data = await response.json();
    if (response.ok) {
      navigate('/signin');
    }
    console.log('Status: ', response.status);
    console.log('Data: ', data);
  }

  return (
    <div className={styles.loginform}>
      <div className={styles.formcontainer}>
        <h1>Sign up to Task Board</h1>
        <Form onSubmit={submitRegister}>
          <InputArea>
            <Label htmlFor="name">Name: </Label>
            <FormControl
              type="text"
              name="name"
              id="name"
              required
              onChange={() => {}}
              placeholder="Name"
            />
          </InputArea>
          <InputArea>
            <Label htmlFor="email">Email: </Label>
            <FormControl
              type="email"
              name="email"
              id="email"
              required
              placeholder="Email"
              onChange={() => {}}
            />
          </InputArea>
          <InputArea>
            <Label htmlFor="password">Password: </Label>
            <FormControl
              type="password"
              name="password"
              id="password"
              required
              placeholder="Password"
            />
          </InputArea>
          <Button priority="first" type="submit">
            Sign Up
          </Button>
        </Form>
        Already have an account? <Link to="/signin">Log in here</Link>.
      </div>
    </div>
  );
}

export default SignUpPage;
