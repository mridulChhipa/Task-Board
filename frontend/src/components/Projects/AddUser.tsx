import { type SubmitEventHandler } from 'react';
import Button from '../Button/Button';
import styles from './CreateProject.module.css';
import tableStyles from '../../pages/Dashboard/Dashboard.module.css';
import type { Operation } from '../../pages/Dashboard/Dashboard';
import type { ProjectMember } from '../../utils/users.handler';
import Form, { FormControl, InputArea, Label } from '../Form/Form';

interface Props {
  operation: Operation;
  setOperation: React.Dispatch<React.SetStateAction<Operation>>;
  userToAdd: string;
  setUserToAdd: React.Dispatch<React.SetStateAction<string>>;
  newRole: string;
  setNewRole: React.Dispatch<React.SetStateAction<string>>;
  handleAdd: SubmitEventHandler;
  setAddUser: React.Dispatch<React.SetStateAction<boolean>>;
  projectMembers: ProjectMember[];
  canManageUsers: boolean;
}

export default function AddUser({
  operation,
  setOperation,
  userToAdd,
  setUserToAdd,
  newRole,
  setNewRole,
  handleAdd,
  setAddUser,
  projectMembers,
  canManageUsers,
}: Props) {
  return (
    <>
      <select
        value={operation}
        onChange={(e) => setOperation(e.target.value as Operation)}
      >
        <option value="View">View Users</option>
        <option value="Add" disabled={!canManageUsers}>
          Add User
        </option>
        <option value="Edit" disabled={!canManageUsers}>
          Edit User Role
        </option>
        <option value="Remove" disabled={!canManageUsers}>
          Remove User
        </option>
      </select>
      <h2
        style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          fontWeight: '700',
        }}
      >
        {operation === 'Add' && 'Add User'}
        {operation === 'Edit' && 'Edit User Role'}
        {operation === 'Remove' && 'Remove User'}
        {operation === 'View' && 'View Users'}
      </h2>
      {operation !== 'View' && (
        <Form onSubmit={handleAdd}>
          <InputArea>
            <Label htmlFor="name">User e-mail:</Label>
            <FormControl
              name="email"
              type="email"
              placeholder="e.g. john_doe@taskboard.com"
              value={userToAdd}
              onChange={(e) => setUserToAdd(e.target.value)}
              disabled={!canManageUsers}
              required
            />
          </InputArea>

          {operation !== 'Remove' && (
            <InputArea>
              <Label htmlFor="newRole">Project Role:</Label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                disabled={!canManageUsers}
              >
                <option value="PROJECT_ADMIN">Admin</option>
                <option value="PROJECT_MEMBER">Member</option>
                <option value="PROJECT_VIEWER">Viewer</option>
              </select>
            </InputArea>
          )}

          <div className={styles.buttonGroup}>
            <Button
              priority="second"
              type="button"
              onClick={() => setAddUser(false)}
            >
              Cancel
            </Button>
            <Button priority="first" type="submit" disabled={!canManageUsers}>
              {operation === 'Add' && 'Add User'}
              {operation === 'Edit' && 'Edit User Role'}
              {operation === 'Remove' && 'Remove User'}
            </Button>
          </div>
        </Form>
      )}
      {operation === 'View' && (
        <table className={tableStyles.projectTable}>
          <thead>
            <tr>
              <th>Member e-mail</th>
              <th>Member role</th>
            </tr>
          </thead>
          <tbody>
            {projectMembers.map((member, memIdx) => (
              <tr key={memIdx}>
                <td>{member.email}</td>
                <td>{member.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
