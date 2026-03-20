import styles from './boards.module.css';
import type { Task } from '../../types/boards.types';
import Modal from '../Modal/Modal';
import { TaskCard } from './TaskCard';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import BoardTransitionsModal from './BoardTransitionsModal';
import type { BoardsModalStackProps } from './BoardsView.types';

function ShowChildrenModal({ children }: { children: Task[] | null }) {
  if (!children) return [];
  return (
    <>
      <div className={styles.childContainer}>
        {children.map((child) =>
          <TaskCard
            key={child.id}
            task={child}
            showDelete={false}
            showSettings={false}
            draggable={false}
            dragstartHandler={() => { }}
          />
        )}
      </div>
    </>
  );
}

export default function BoardsModalStack({
  showAddTaskModal,
  setShowAddTaskModal,
  showViewEdgesModal,
  setShowViewEdgesModal,
  editModal,
  setEditModal,
  setCurrentTaskId,
  showChild,
  setShowChild,
  showChildOf,
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
  taskId,
  setParent,
  setSetParent,
  edges,
  workflowState,
  projectId,
  activeBoard,
  setEdges,
  isAddingEdge,
  setIsAddingEdge,
  fromEdgeName,
  setFromEdgeName,
  toEdgeName,
  setToEdgeName,
  boardHandlers,
}: BoardsModalStackProps) {
  return (
    <>
      <AddTaskModal
        show={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onSubmit={boardHandlers.handleAdd}
        taskName={taskName}
        setTaskName={setTaskName}
        taskDescription={taskDescription}
        setTaskDescription={setTaskDescription}
        taskType={taskType}
        setTaskType={setTaskType}
        priority={priority}
        setPriority={setPriority}
        assignee={assignee}
        setAssignee={setAssignee}
        dueDate={dueDate}
        setDueDate={setDueDate}
        setParent={setParent}
        setSetParent={setSetParent}
        taskId={taskId}
      />
      <EditTaskModal
        show={editModal}
        onClose={() => {
          setEditModal(false);
          setCurrentTaskId(null);
        }}
        onSubmit={boardHandlers.handleEdit}
        taskName={taskName}
        setTaskName={setTaskName}
        taskDescription={taskDescription}
        setTaskDescription={setTaskDescription}
        taskType={taskType}
        setTaskType={setTaskType}
        priority={priority}
        setPriority={setPriority}
        assignee={assignee}
        setAssignee={setAssignee}
        dueDate={dueDate}
        setDueDate={setDueDate}
        setParent={setParent}
        setSetParent={setSetParent}
        taskId={taskId}
      />
      <BoardTransitionsModal
        show={showViewEdgesModal}
        onClose={() => setShowViewEdgesModal(false)}
        onSubmit={boardHandlers.handleAddEdge}
        edges={edges}
        workflowState={workflowState}
        projectId={projectId}
        activeBoard={activeBoard}
        setEdges={setEdges}
        isAddingEdge={isAddingEdge}
        setIsAddingEdge={setIsAddingEdge}
        fromEdgeName={fromEdgeName}
        setFromEdgeName={setFromEdgeName}
        toEdgeName={toEdgeName}
        setToEdgeName={setToEdgeName}
      />
      {showChild && <Modal onclick={() => setShowChild(false)}>
        <ShowChildrenModal children={showChildOf} />
      </Modal>}
    </>
  );
}
