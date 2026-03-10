import type { SubmitEventHandler } from 'react';
import Button from '../Button/Button';
import styles from './CreateProject.module.css';

interface Props {
  updatedName: string;
  setUpdatedName: React.Dispatch<React.SetStateAction<string>>;
  updatedDesc: string;
  setUpdatedDesc: React.Dispatch<React.SetStateAction<string>>;
  setUpdatedArc: React.Dispatch<React.SetStateAction<boolean>>;
  updatedArc: boolean;
  handleUpdate: SubmitEventHandler;
  setShowUpdateModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function UpdateProject({
  updatedName,
  setUpdatedName,
  updatedDesc,
  setUpdatedDesc,
  handleUpdate,
  setShowUpdateModal,
  updatedArc,
  setUpdatedArc,
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
        Update Project
      </h2>

      <form className={styles.createForm} onSubmit={handleUpdate}>
        <div className={styles.inputArea}>
          <label htmlFor="name" className={styles.label}>
            Project Name
          </label>
          <input
            type="text"
            placeholder="e.g. SVG Editor"
            onChange={(e) => setUpdatedName(e.target.value)}
            name="name"
            id="name"
            value={updatedName}
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
            value={updatedDesc}
            onChange={(e) => setUpdatedDesc(e.target.value)}
            className={styles.formControl}
          />
        </div>

        <div className={styles.isArc}>
          <label htmlFor="description" className={styles.label}>
            Archive
          </label>
          <input
            type="checkbox"
            name="description"
            id="description"
            placeholder="What is this project about?"
            checked={updatedArc}
            onChange={(e) => setUpdatedArc(e.target.checked)}
            className={styles.checkbox}
          />
        </div>

        <div className={styles.buttonGroup}>
          <Button
            priority="second"
            type="button"
            onClick={() => setShowUpdateModal(false)}
          >
            Cancel
          </Button>
          <Button priority="first" type="submit">
            Update
          </Button>
        </div>
      </form>
    </div>
  );
}
