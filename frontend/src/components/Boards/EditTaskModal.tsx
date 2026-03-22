import type { Dispatch, SetStateAction, SubmitEventHandler } from 'react';
import formStyles from '../Projects/CreateProject.module.css';
import type { Priority, TaskType } from '../../types/boards.types';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import Form, { FormControl, InputArea, Label } from '../Form/Form';

interface Props {
  show: boolean;
  onClose: () => void;
  onSubmit: SubmitEventHandler<HTMLFormElement>;
  taskName: string;
  setTaskName: Dispatch<SetStateAction<string>>;
  taskDescription: string;
  setTaskDescription: Dispatch<SetStateAction<string>>;
  taskType: TaskType;
  setTaskType: Dispatch<SetStateAction<TaskType>>;
  priority: Priority;
  setPriority: Dispatch<SetStateAction<Priority>>;
  assignee: string;
  setAssignee: Dispatch<SetStateAction<string>>;
  dueDate: string;
  setDueDate: Dispatch<SetStateAction<string>>;
  isResolved: boolean;
  setIsResolved: Dispatch<SetStateAction<boolean>>;
  isClosed: boolean;
  setIsClosed: Dispatch<SetStateAction<boolean>>;
  setParent: boolean;
  setSetParent: Dispatch<SetStateAction<boolean>>;
  taskId: string;
}

export default function EditTaskModal({
  show,
  onClose,
  onSubmit,
  taskName,
  setTaskName,
  taskDescription,
  setTaskDescription,
  taskType,
  setTaskType,
  priority,
  setPriority,
  assignee,
  setAssignee,
  dueDate,
  setDueDate,
  isResolved,
  setIsResolved,
  isClosed,
  setIsClosed,
  setParent,
  setSetParent,
  taskId,
}: Props) {
  if (!show) {
    return null;
  }

  return (
    <Modal onclick={onClose}>
      <div>
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '1.5rem',
            fontWeight: '700',
          }}
        >
          Edit Task
        </h2>
        <Form onSubmit={onSubmit}>
          <InputArea>
            <Label htmlFor="name">Task Name</Label>
            <FormControl
              type="text"
              placeholder="e.g. Create QGraphicsScene"
              name="taskName"
              id="taskName"
              onChange={(e) => setTaskName(e.target.value)}
              required
              value={taskName}
            />
          </InputArea>
          <InputArea>
            <Label htmlFor="description">Description</Label>
            <FormControl
              type="text"
              placeholder="e.g. Create QGraphicsScene for rendering SVG elements"
              name="taskDescription"
              id="taskDescription"
              onChange={(e) => setTaskDescription(e.target.value)}
              required
              value={taskDescription}
            />
          </InputArea>
          <InputArea>
            <label htmlFor="taskType">Task Type</label>
            <select
              name="taskType"
              id="taskType"
              onChange={(e) => setTaskType(e.target.value as TaskType)}
              value={taskType}
            >
              <option value="STORY">Story</option>
              <option value="TASK">Task</option>
              <option value="BUG">Bug</option>
            </select>
          </InputArea>
          <InputArea>
            <label htmlFor="taskPriority">Priority</label>
            <select
              name="taskPriority"
              id="taskPriority"
              onChange={(e) => setPriority(e.target.value as Priority)}
              value={priority}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </InputArea>
          <InputArea>
            <Label htmlFor="assignee">Assignee</Label>
            <FormControl
              type="email"
              placeholder="e.g. johndoe@taskboard.com"
              name="assignee"
              id="assignee"
              onChange={(e) => setAssignee(e.target.value)}
              required
              value={assignee}
            />
          </InputArea>
          <InputArea>
            <Label htmlFor="dueDate">Due Date</Label>
            <FormControl
              type="date"
              name="dueDate"
              id="dueDate"
              onChange={(e) => setDueDate(e.target.value)}
              value={dueDate}
            />
          </InputArea>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem' }}>
            <Label htmlFor="isResolved">Resolved</Label>
            <input
              type="checkbox"
              name="isResolved"
              checked={isResolved}
              onChange={(e) => {
                const nextResolved = e.target.checked;
                setIsResolved(nextResolved);
                if (!nextResolved) {
                  setIsClosed(false);
                }
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem' }}>
            <Label htmlFor="isClosed">Closed</Label>
            <input
              type="checkbox"
              name="isClosed"
              checked={isClosed}
              onChange={(e) => setIsClosed(e.target.checked)}
              disabled={!isResolved}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem' }}>
            <Label htmlFor="showParent">
              Set parent story (uncheck to keep same parent)
            </Label>
            <input
              type="checkbox"
              name="showParent"
              checked={setParent}
              onChange={(e) => setSetParent(e.target.checked)}
              disabled={taskType === 'STORY'}
            />
          </div>
          <InputArea>
            <Label htmlFor="parentTask">
              parentTask (contains last copied task ID)
            </Label>
            <FormControl
              type="string"
              name="parentTask"
              id="parentTask"
              value={taskType === 'STORY' ? '' : taskId}
              disabled
            />
          </InputArea>
          <div className={formStyles.buttonGroup}>
            <Button priority="second" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button priority="first" type="submit">
              Edit Task
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
