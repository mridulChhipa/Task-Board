import { IconPlus } from './boards.images';
import styles from './boards.module.css';
import { FormControl } from '../Form/Form';
import Button from '../Button/Button';
import { addWorkflow } from '../../utils/board.utils';
import type { Workflow } from '../../types/boards.types';
import type { Board } from '../../types/project.types';
import type { Dispatch, SetStateAction } from 'react';

interface Props {
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  boardName: string;
  setBoardName: Dispatch<SetStateAction<string>>;
  boardLimit: number;
  setBoardLimit: Dispatch<SetStateAction<number>>;
  activeBoard: Board;
  workflowState: Workflow[];
  setWorkflowState: Dispatch<SetStateAction<Workflow[]>>;
  projectId: string | undefined;
  dragHighlight: boolean[];
  setDragHighlight: Dispatch<SetStateAction<boolean[]>>;
  boards: Board[];
  activeIndex: number;
}

export default function EditWorkflowButton({
  isAdding,
  setIsAdding,
  boardName,
  setBoardName,
  boardLimit,
  setBoardLimit,
  activeBoard,
  workflowState,
  setWorkflowState,
  projectId,
  dragHighlight,
  setDragHighlight,
  boards,
  activeIndex,
}: Props) {
  return (
    <>
      <button
        className={styles.columnAddBtn}
        onClick={() => {
          setIsAdding(!isAdding);
        }}
      >
        <IconPlus />
      </button>
      {isAdding && (
        <div className={styles.addColumnMenu}>
          <FormControl
            name="col-name"
            type="text"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            placeholder="Column Name"
          />
          <FormControl
            placeholder="Limit"
            type="number"
            value={boardLimit}
            name="limit"
            onChange={(e) => setBoardLimit(e.target.valueAsNumber)}
          />
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <Button
              onClick={() => {
                if (boardName === '') {
                  setIsAdding(false);
                  return;
                }
                let ret = false;
                activeBoard.workflows.map((workflow) => {
                  if (workflow.name.toLowerCase() === boardName.toLowerCase()) {
                    ret = true;
                  }
                });
                if (ret) {
                  setIsAdding(false);
                  return;
                }
                addWorkflow(
                  activeBoard.id,
                  boardName.toLowerCase(),
                  workflowState.length,
                  projectId ?? '',
                  boardLimit,
                )
                  .then((column) => {
                    setWorkflowState([...workflowState, column]);
                    setDragHighlight([...dragHighlight, false]);
                    boards[activeIndex].workflows = [...workflowState, column];
                  })
                  .finally(() => {
                    setBoardName('');
                    setBoardLimit(0);
                  });
                setIsAdding(false);
              }}
            >
              Add
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
