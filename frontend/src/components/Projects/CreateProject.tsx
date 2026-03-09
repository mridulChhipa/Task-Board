import type { SubmitEventHandler } from 'react';
import Button from '../Button/Button';
import styles from './CreateProject.module.css';

interface Props {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  handleCreate: SubmitEventHandler;
  setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CreateProject({
  name,
  setName,
  description,
  setDescription,
  handleCreate,
  setShowCreateModal,
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
        Create a New Project
      </h2>

      <form className={styles.createForm} onSubmit={handleCreate}>
        <div className={styles.inputArea}>
          <label htmlFor="name" className={styles.label}>
            Project Name
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

        <div className={styles.inputArea}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            name="description"
            id="description"
            placeholder="What is this project about?"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.formControl}
          />
        </div>

        <div className={styles.buttonGroup}>
          <Button
            priority="second"
            type="button"
            onClick={() => setShowCreateModal(false)}
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
