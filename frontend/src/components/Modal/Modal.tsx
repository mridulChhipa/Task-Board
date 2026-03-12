import styles from './Modal.module.css';
import type { ReactNode } from 'react';

function Modal({
  children,
  onclick,
}: {
  children: ReactNode;
  onclick?: () => void;
}) {
  return (
    <div className={styles.modalOverlay} onClick={onclick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
      <form>
        
      </form>
    </div>
  );
}

export default Modal;
