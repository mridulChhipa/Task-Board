import { API_URL } from '../config';
import { type SubmitEvent, type Dispatch, type SetStateAction } from 'react';
import type { User } from '../context/AuthContext';
import type { Operation } from '../pages/Dashboard/Dashboard';

export interface ProjectMember {
  email: string;
  role: string;
}

interface Props {
  operation: Operation;
  setOperation: Dispatch<SetStateAction<Operation>>;
  userToAdd: string;
  setUserToAdd: Dispatch<SetStateAction<string>>;
  newRole: string;
  setNewRole: Dispatch<SetStateAction<string>>;
  setAddUser: Dispatch<SetStateAction<boolean>>;
  currProject: string;
  globalAdminEmail: string;
  handleError: (message: string) => void;
}

export async function handleAdd(e: SubmitEvent, props: Props) {
  e.preventDefault();
  if (props.operation === 'Add') {
    try {
      console.log(
        'Adding user to project with email: ',
        props.userToAdd,
        ' and role: ',
        props.newRole,
      );
      const res = await fetch(
        `${API_URL}/api/project/assign-user/${props.currProject}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userMail: props.userToAdd,
            role: props.newRole,
          }),
        },
      );

      if (!res.ok) {
        const test = await res.text();
        throw new Error(
          `Failed to assign user: ${res.status} ${res.statusText} - ${test}`,
        );
      }
    } catch (err) {
      throw new Error('Error adding user to project', { cause: err });
    } finally {
      props.setAddUser(false);
      props.setUserToAdd('');
      props.setNewRole('PROJECT_VIEWER');
      props.setOperation('Add');
    }
  } else if (props.operation === 'Edit') {
    try {
      const res = await fetch(
        `${API_URL}/api/project/update-role/${props.currProject}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userMail: props.userToAdd,
            role: props.newRole,
          }),
        },
      );
      if (!res.ok) {
        const test = await res.text();
        throw new Error(
          `Failed to edit user role: ${res.status} ${res.statusText} - ${test}`,
        );
      }
    } catch (err) {
      throw new Error('Error editing user role', { cause: err });
    } finally {
      props.setAddUser(false);
      props.setUserToAdd('');
      props.setNewRole('PROJECT_VIEWER');
      props.setOperation('Add');
    }
  } else {
    try {
      const res = await fetch(
        `${API_URL}/api/project/remove-user/${props.currProject}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userMail: props.userToAdd,
          }),
        },
      );

      if (!res.ok) {
        const test = await res.text();
        throw new Error(
          `Failed to remove user: ${res.status} ${res.statusText} - ${test}`,
        );
      }
    } catch (err) {
      throw new Error('Error removing user from project', { cause: err });
    } finally {
      props.setAddUser(false);
      props.setUserToAdd('');
      props.setNewRole('PROJECT_VIEWER');
      props.setOperation('Add');
    }
  }
}

export async function addGlobal(e: SubmitEvent, props: Props) {
  e.preventDefault();
  try {
    await fetch(`${API_URL}/api/auth/update-user`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: props.globalAdminEmail,
        globalRole: 'GLOBAL_ADMIN',
      }),
    });
  } catch (err) {
    props.handleError('Error adding global admin');
    throw new Error('Error adding global admin', { cause: err });
  }
}

export async function getMembers(props: Props): Promise<ProjectMember[]> {
  async function getEmail(userId: number): Promise<string> {
    try {
      const res = await fetch(`${API_URL}/api/auth/${userId}`, {
        method: 'GET',
        credentials: 'include',
      });
      const userData = await res.json();
      return userData.data.personalData.email;
    } catch (err) {
      props.handleError('Could not find email of user');
      throw new Error('Error finding email of user', { cause: err });
    }
  }
  try {
    const res = await fetch(`${API_URL}/api/project/${props.currProject}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    const users = data.data.members;
    const projectMembers: ProjectMember[] = await Promise.all(
      users.map(async (user: User) => ({
        email: await getEmail(user.userId),
        role: user.role,
      })),
    );
    return projectMembers;
  } catch (err) {
    props.handleError('Error fetching project members');
    throw new Error('Error fetching project members', { cause: err });
  }
}
