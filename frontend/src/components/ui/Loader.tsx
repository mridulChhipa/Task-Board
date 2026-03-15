import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Loader() {
  const authContext = useContext(AuthContext);

  if (authContext.isLoading) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'blue',
          color: 'white',
          fontSize: '5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        Loading...
      </div>
    );
  } else {
    return <></>;
  }
}
