import { type SubmitEvent, type Dispatch, type SetStateAction } from 'react';
import type { Project } from '../types/project.types';
import type { DispatchType, User } from '../context/AuthContext';

interface Props {
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  setShowCreateModal: Dispatch<SetStateAction<boolean>>;
  currProject: string;
  updatedName: string;
  setUpdatedName: Dispatch<SetStateAction<string>>;
  updatedDesc: string;
  setUpdatedDesc: Dispatch<SetStateAction<string>>;
  updatedIsArchived: boolean;
  setUpdatedIsArchived: Dispatch<SetStateAction<boolean>>;
  setShowUpdateModal: Dispatch<SetStateAction<boolean>>;
  user: User | null;
  dispatch: Dispatch<DispatchType>;
  handleError: (message: string) => void;
}

export async function handleCreate(e: SubmitEvent, props: Props) {
  e.preventDefault();

  try {
    await fetch('http://localhost:3000/api/project/create', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: props.name,
        description: props.description,
      }),
    })
      .then((res) => res.json())
      .then(async (resJson) => {
        const project: Project = resJson.data;

        const newProj: Project = {
          name: project.name,
          description: project.description,
          role: 'PROJECT_ADMIN',
          members: [],
          id: project.id,
          isArchived: false,
          boards: [],
        };

        if (props.user) {
          const updatedUser = {
            ...props.user,
            projects: [...props.user.projects, newProj],
          };

          props.dispatch({
            type: 'PROJECT_CREATED',
            payload: {
              user: updatedUser,
              isLoading: false,
            },
          });

          await fetch(
            `http://localhost:3000/api/project/assign-user/${project.id}`,
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userMail: props.user.email,
                role: 'PROJECT_ADMIN',
              }),
            },
          );
        }
      })
      .catch((err) => {
        props.handleError('Could not create project');
        throw new Error('Error creating project', { cause: err });
      })
      .finally(() => {
        props.setShowCreateModal(false);
        props.setName('');
        props.setDescription('');
      });
  } catch (err) {
    throw new Error('Can createz: ', { cause: err });
  } finally {
    props.setShowCreateModal(false);
  }
}

export async function handleUpdate(e: SubmitEvent, props: Props) {
  e.preventDefault();

  try {
    const res = await fetch(
      `http://localhost:3000/api/project/update/${props.currProject}`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: props.updatedName,
          description: props.updatedDesc,
          isArchived: props.updatedIsArchived,
        }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Failed to update project: ${res.status} ${res.statusText} - ${text}`,
      );
    }

    const resJson = await res.json();
    const project: Project = resJson.data;

    const updatedProj: Project = {
      id: project.id,
      name: project.name,
      description: project.description,
      role: project.role ?? 'PROJECT_ADMIN',
      members: project.members ?? [],
      isArchived: project.isArchived,
      boards: [],
    };

    if (props.user) {
      const updatedUser = {
        ...props.user,
        projects: props.user.projects.map((p) =>
          p.id === updatedProj.id ? updatedProj : p,
        ),
      };

      props.dispatch({
        type: 'PROJECT_UPDATED',
        payload: {
          user: updatedUser,
          isLoading: false,
        },
      });
    }

    return project;
  } catch (err) {
    props.handleError('Could not update project');
    console.error('Error updating project:', err);
    throw err instanceof Error
      ? err
      : new Error('Error updating project', { cause: err });
  } finally {
    props.setShowUpdateModal(false);
    props.setName('');
    props.setDescription('');
  }
}
