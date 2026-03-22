import type { Dispatch, SetStateAction, SubmitEventHandler } from 'react';
import type { EdgeConstraint, Workflow } from '../../types/boards.types';
import type { Board } from '../../types/project.types';
import { IconDelete } from './boards.images';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import { FormControl, InputArea, Label } from '../Form/Form';

interface Props {
  show: boolean;
  onClose: () => void;
  onSubmit: SubmitEventHandler<HTMLFormElement>;
  edges: EdgeConstraint[];
  workflowState: Workflow[];
  projectId: string | undefined;
  activeBoard: Board;
  setEdges: Dispatch<SetStateAction<EdgeConstraint[]>>;
  isAddingEdge: boolean;
  setIsAddingEdge: Dispatch<SetStateAction<boolean>>;
  fromEdgeName: string;
  setFromEdgeName: Dispatch<SetStateAction<string>>;
  toEdgeName: string;
  role: string | undefined;
  setToEdgeName: Dispatch<SetStateAction<string>>;
}

export default function BoardTransitionsModal({
  show,
  onClose,
  onSubmit,
  edges,
  workflowState,
  projectId,
  activeBoard,
  setEdges,
  isAddingEdge,
  setIsAddingEdge,
  fromEdgeName,
  setFromEdgeName,
  role,
  toEdgeName,
  setToEdgeName,
}: Props) {
  if (!show) {
    return null;
  }

  return (
    <Modal onclick={onClose}>
      <div style={{ minWidth: '320px' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2>Board Transitions</h2>
          {role === 'PROJECT_ADMIN' && (
            <Button
              onClick={() => {
                setIsAddingEdge(true);
              }}
            >
              Add Transition
            </Button>
          )}
        </div>
        {edges.length === 0 && <p>No transitions added for this board yet.</p>}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          {edges.map((edge) => {
            const from = workflowState.find(
              (workflow) => workflow.id === edge.uId,
            );
            const to = workflowState.find(
              (workflow) => workflow.id === edge.vId,
            );
            return (
              <div
                key={edge.id.toString()}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: '0.25rem',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              >
                <strong>
                  {from?.name.toUpperCase() ?? edge.uId} -&gt;{' '}
                  {to?.name.toUpperCase() ?? edge.vId}
                </strong>
                {role === 'PROJECT_ADMIN' && (
                  <span
                    onClick={async () => {
                      const res = await fetch(
                        `http://localhost:3000/api/project/${projectId}/board/${activeBoard.id}/remove-edge/${edge.id}`,
                        {
                          method: 'DELETE',
                          credentials: 'include',
                        },
                      );
                      const data = await res.json();
                      console.log('delete response: ', data);
                      const updatedEdges = edges.filter(
                        (e) => e.id !== edge.id,
                      );
                      setEdges(updatedEdges);
                      activeBoard.edges = updatedEdges;
                    }}
                  >
                    <IconDelete size={20} />
                  </span>
                )}
              </div>
            );
          })}
          {isAddingEdge && (
            <div
              key="add-edge"
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: '0.25rem',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            >
              <form
                onSubmit={onSubmit}
                style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem' }}
              >
                <div>
                  <InputArea>
                    <Label htmlFor="from">From:</Label>
                    <FormControl
                      type="text"
                      value={fromEdgeName}
                      onChange={(e) => {
                        setFromEdgeName(e.target.value);
                      }}
                      placeholder="e.g. To Do"
                    />
                  </InputArea>
                </div>
                <div>
                  <InputArea>
                    <Label htmlFor="to">To:</Label>
                    <FormControl
                      type="text"
                      value={toEdgeName}
                      onChange={(e) => {
                        setToEdgeName(e.target.value);
                      }}
                      placeholder="e.g. In Progress"
                    />
                  </InputArea>
                </div>
                <Button type="submit">Add</Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
