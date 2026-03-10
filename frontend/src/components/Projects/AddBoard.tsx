import type { SubmitEventHandler } from 'react';
import Button from '../Button/Button';
import styles from './CreateProject.module.css';

interface Props {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  handleAdd: SubmitEventHandler;
  setShowAddModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddBoard({
  name,
  setName,
  handleAdd,
  setShowAddModal,
}: Props) {
  return (
    <div>
      <h2
        style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          fontWeight: '700',
        }}
      >
        Add a New Board
      </h2>

      <form className={styles.createForm} onSubmit={handleAdd}>
        <div className={styles.inputArea}>
          <label htmlFor="name" className={styles.label}>
            Board Name
          </label>
          <input
            type="text"
            placeholder="e.g. SVG Editor"
            onChange={(e) => setName(e.target.value)}
            name="name"
            id="name"
            value={name}
            required
            className={styles.formControl}
          />
        </div>

        <div className={styles.buttonGroup}>
          <Button
            priority="second"
            type="button"
            onClick={() => setShowAddModal(false)}
          >
            Cancel
          </Button>
          <Button priority="first" type="submit">
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}
