import { API_URL } from '../../config';
import { useContext, useState, type SubmitEvent } from 'react';
import { AuthContext, DispatchContext } from '../../context/AuthContext';
import styles from './Account.module.css';
import Button from '../../components/Button/Button';
import defaultAvatar from '../../assets/legacy/default_avatar.png';

export default function Account() {
  const { user } = useContext(AuthContext);
  const dispatch = useContext(DispatchContext);
  const [name, setName] = useState(user?.name || '');
  const [avatarURL, setAvatarURL] = useState(user?.avatar || '');

  async function updateUser(e: SubmitEvent) {
    e.preventDefault();
    if (!user) {
      return;
    }
    const res = await fetch(`${API_URL}/api/auth/update-user`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        avatar: avatarURL,
        email: user?.email,
      }),
    });
    await res.json();
    setName('');
    setAvatarURL('');
    dispatch({
      type: 'UPDATE_USER',
      payload: {
        isLoading: false,
        user: { ...user, name: name, avatar: avatarURL },
      },
    });
  }

  return (
    <div className={styles.accountPage}>
      <h1>Account Page</h1>
      <div className={styles.upper}>
        <img
          src={user?.avatar ? user.avatar : defaultAvatar}
          alt="User avatar"
          className={styles.avatar}
        />
      </div>
      <form onSubmit={updateUser} className={styles.createForm}>
        <div className={styles.inputArea}>
          <label className={styles.label}>Name:</label>
          <input
            type="text"
            defaultValue={user?.name}
            name="name"
            id="name"
            className={styles.formControl}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className={styles.inputArea}>
          <label className={styles.label}>Email:</label>
          <input
            type="email"
            defaultValue={user?.email}
            name="email"
            id="email"
            className={styles.formControl}
            readOnly
          />
        </div>
        <div className={styles.inputArea}>
          <label className={styles.label}>Avatar URL:</label>
          <input
            type="text"
            defaultValue={user?.avatar}
            name="avatarURL"
            id="avatarURL"
            className={styles.formControl}
            onChange={(e) => setAvatarURL(e.target.value)}
          />
        </div>
        <Button type="submit">Update Details</Button>
      </form>
    </div>
  );
}
