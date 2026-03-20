import type { Project } from '../../types/project.types';
import type { Operation } from './dashboard.types';

export async function createProjectAction(
  name: string,
  description: string,
): Promise<Project> {
  const res = await fetch('http://localhost:3000/api/project/create', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  const resJson = await res.json();
  return resJson.data as Project;
}

export async function updateProjectAction(
  currProject: string,
  updatedName: string,
  updatedDesc: string,
  updatedIsArchived: boolean,
): Promise<Project> {
  const res = await fetch(`http://localhost:3000/api/project/update/${currProject}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: updatedName,
      description: updatedDesc,
      isArchived: updatedIsArchived,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update project: ${res.status} ${res.statusText}`);
  }
  return (await res.json()).data as Project;
}

export async function modifyProjectUserAction(
  operation: Operation,
  currProject: string,
  userToAdd: string,
  newRole: string,
) {
  const route = operation === 'Add'
    ? 'assign-user'
    : operation === 'Edit'
    ? 'update-role'
    : 'remove-user';
  const method = operation === 'Edit' ? 'PATCH' : 'POST';
  const body = operation === 'Remove'
    ? { userMail: userToAdd }
    : { userMail: userToAdd, role: newRole };

  const res = await fetch(`http://localhost:3000/api/project/${route}/${currProject}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Failed to modify project user: ${res.status} ${res.statusText}`);
  }
}

export async function addGlobalAdminAction(globalAdminEmail: string) {
  await fetch('http://localhost:3000/api/auth/update-user', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: globalAdminEmail, globalRole: 'GLOBAL_ADMIN' }),
  });
}
