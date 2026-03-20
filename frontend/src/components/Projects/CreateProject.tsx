import type { SubmitEventHandler } from 'react';
import Button from '../Button/Button';
import styles from './CreateProject.module.css';
import Form, {
  FormControl,
  InputArea,
  Label,
  TextAreaControl,
} from '../Form/Form';

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

      <Form onSubmit={handleCreate}>
        <InputArea>
          <Label htmlFor="name">Project Name</Label>
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

        <InputArea>
          <Label htmlFor="description">Description</Label>
          <TextAreaControl
            name="description"
            id="description"
            placeholder="What is this project about?"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </InputArea>

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
      </Form>
    </div>
  );
}
