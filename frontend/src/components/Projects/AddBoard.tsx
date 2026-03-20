import type { SubmitEventHandler } from 'react';
import Button from '../Button/Button';
import styles from './CreateProject.module.css';
import Form, { FormControl, InputArea, Label } from '../Form/Form';

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

      <Form onSubmit={handleAdd}>
        <InputArea>
          <Label htmlFor="name">Board Name</Label>
          <FormControl
            type="text"
            placeholder="e.g. SVG Editor"
            onChange={(e) => setName(e.target.value)}
            name="name"
            id="name"
            value={name}
            required
          />
        </InputArea>

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
      </Form>
    </div>
  );
}
