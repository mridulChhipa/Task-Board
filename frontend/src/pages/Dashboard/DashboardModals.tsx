import type { Dispatch, SetStateAction, SubmitEvent } from 'react';
import Button from '../../components/Button/Button';
import Form, { FormControl, InputArea, Label } from '../../components/Form/Form';
import Modal from '../../components/Modal/Modal';
import AddUser from '../../components/Projects/AddUser';
import CreateProject from '../../components/Projects/CreateProject';
import UpdateProject from '../../components/Projects/UpdateProject';
import type { NotifDisplay, Operation, ProjectMember } from './dashboard.types';
import DashboardNotificationsModal from './DashboardNotificationsModal';

type DashboardModalsProps = {
  showCreateModal: boolean;
  setShowCreateModal: Dispatch<SetStateAction<boolean>>;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  handleCreate: (e: SubmitEvent) => Promise<void>;
  showUpdateModal: boolean;
  setShowUpdateModal: Dispatch<SetStateAction<boolean>>;
  updatedName: string;
  setUpdatedName: Dispatch<SetStateAction<string>>;
  updatedDesc: string;
  setUpdatedDesc: Dispatch<SetStateAction<string>>;
  updatedIsArchived: boolean;
  setUpdatedIsArchived: Dispatch<SetStateAction<boolean>>;
  handleUpdate: (e: SubmitEvent) => Promise<unknown>;
  addUser: boolean;
  setAddUser: Dispatch<SetStateAction<boolean>>;
  operation: Operation;
  setOperation: Dispatch<SetStateAction<Operation>>;
  userToAdd: string;
  setUserToAdd: Dispatch<SetStateAction<string>>;
  newRole: string;
  setNewRole: Dispatch<SetStateAction<string>>;
  handleAdd: (e: SubmitEvent) => Promise<void>;
  projectMembers: ProjectMember[];
  showNotifications: boolean;
  setShowNotifications: Dispatch<SetStateAction<boolean>>;
  notifs: NotifDisplay[];
  setNotifs: Dispatch<SetStateAction<NotifDisplay[]>>;
  showAdminModal: boolean;
  setShowAdminModal: Dispatch<SetStateAction<boolean>>;
  globalAdminEmail: string;
  setGlobalAdminEmail: Dispatch<SetStateAction<string>>;
  addGlobal: (e: SubmitEvent) => Promise<void>;
};

function DashboardModals(props: DashboardModalsProps) {
  const {
    showCreateModal,
    setShowCreateModal,
    name,
    setName,
    description,
    setDescription,
    handleCreate,
    showUpdateModal,
    setShowUpdateModal,
    updatedName,
    setUpdatedName,
    updatedDesc,
    setUpdatedDesc,
    updatedIsArchived,
    setUpdatedIsArchived,
    handleUpdate,
    addUser,
    setAddUser,
    operation,
    setOperation,
    userToAdd,
    setUserToAdd,
    newRole,
    setNewRole,
    handleAdd,
    projectMembers,
    showNotifications,
    setShowNotifications,
    notifs,
    setNotifs,
    showAdminModal,
    setShowAdminModal,
    globalAdminEmail,
    setGlobalAdminEmail,
    addGlobal,
  } = props;

  return (
    <>
      {showCreateModal && (
        <Modal onclick={() => setShowCreateModal(false)}>
          <CreateProject
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            setShowCreateModal={setShowCreateModal}
            handleCreate={handleCreate}
          />
        </Modal>
      )}

      {showUpdateModal && (
        <Modal onclick={() => setShowUpdateModal(false)}>
          <UpdateProject
            updatedName={updatedName}
            setUpdatedName={setUpdatedName}
            updatedDesc={updatedDesc}
            setUpdatedDesc={setUpdatedDesc}
            updatedArc={updatedIsArchived}
            setUpdatedArc={setUpdatedIsArchived}
            setShowUpdateModal={setShowUpdateModal}
            handleUpdate={handleUpdate}
          />
        </Modal>
      )}

      {addUser && (
        <Modal onclick={() => setAddUser(false)}>
          <AddUser
            operation={operation}
            setOperation={setOperation}
            userToAdd={userToAdd}
            setUserToAdd={setUserToAdd}
            newRole={newRole}
            setNewRole={setNewRole}
            handleAdd={handleAdd}
            setAddUser={setAddUser}
            projectMembers={projectMembers}
          />
        </Modal>
      )}

      <DashboardNotificationsModal
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        notifs={notifs}
        setNotifs={setNotifs}
      />

      {showAdminModal && (
        <Modal onclick={() => setShowAdminModal(false)}>
          <h2>Add Global Administrators</h2>
          <Form onSubmit={addGlobal}>
            <InputArea>
              <Label htmlFor='email'>User Email</Label>
              <FormControl
                type='email'
                placeholder='e.g. admin@example.com'
                name='email'
                required
                value={globalAdminEmail}
                onChange={(e) => setGlobalAdminEmail(e.target.value)}
              />
            </InputArea>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button priority='second' type='button' onClick={() => setShowAdminModal(false)}>
                Cancel
              </Button>
              <Button priority='first' type='submit'>
                Add Global Admin
              </Button>
            </div>
          </Form>
        </Modal>
      )}
    </>
  );
}

export default DashboardModals;
