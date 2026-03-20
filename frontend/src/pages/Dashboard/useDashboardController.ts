import { useContext, useEffect, useState, type SubmitEvent } from 'react';
import { AuthContext, DispatchContext } from '../../context/AuthContext';
import type { Project } from '../../types/project.types';
import { useFetchUser } from '../../utils/auth.utils';
import { handleError } from '../../App';
import type { NotifDisplay, Operation, ProjectMember } from './dashboard.types';
import { addGlobalAdminAction, createProjectAction, modifyProjectUserAction, updateProjectAction } from './dashboard.actions';
import { fetchNotificationDisplayData, fetchProjectMembers } from './dashboard.utils';

function useDashboardController() {
  const { user } = useContext(AuthContext);
  const dispatch = useContext(DispatchContext);
  const fetchUser = useFetchUser();

  const [currProject, setCurrProject] = useState('');
  const [updatedName, setUpdatedName] = useState('');
  const [updatedDesc, setUpdatedDesc] = useState('');
  const [updatedIsArchived, setUpdatedIsArchived] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [operation, setOperation] = useState<Operation>('Add');
  const [addUser, setAddUser] = useState(false);
  const [userToAdd, setUserToAdd] = useState('');
  const [newRole, setNewRole] = useState('PROJECT_VIEWER');
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifs, setNotifs] = useState<NotifDisplay[]>([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [globalAdminEmail, setGlobalAdminEmail] = useState('');

  const projects = (user?.projects as Project[]) ?? [];
  const userId = user?.userId;

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [fetchUser]);

  useEffect(() => {
    if (user?.notifications) {
      void fetchNotificationDisplayData(user.notifications).then(setNotifs);
    }
  }, [user?.notifications]);

  async function handleCreate(e: SubmitEvent) {
    e.preventDefault();
    try {
      const project = await createProjectAction(name, description);
      const newProj: Project = {
        name: project.name,
        description: project.description,
        role: 'PROJECT_ADMIN',
        members: [],
        id: project.id,
        isArchived: false,
        boards: [],
      };
      if (user) {
        dispatch({
          type: 'PROJECT_CREATED',
          payload: { user: { ...user, projects: [...user.projects, newProj] }, isLoading: false },
        });
      }
    } catch (err) {
      handleError('Could not create project');
      throw new Error('Error creating project', { cause: err });
    } finally {
      setShowCreateModal(false);
      setName('');
      setDescription('');
    }
  }

  async function handleUpdate(e: SubmitEvent) {
    e.preventDefault();
    try {
      const project = await updateProjectAction(
        currProject,
        updatedName,
        updatedDesc,
        updatedIsArchived,
      );
      const updatedProj: Project = {
        id: project.id,
        name: project.name,
        description: project.description,
        role: project.role ?? 'PROJECT_ADMIN',
        members: project.members ?? [],
        isArchived: project.isArchived,
        boards: [],
      };
      if (user) {
        dispatch({
          type: 'PROJECT_UPDATED',
          payload: {
            user: {
              ...user,
              projects: user.projects.map((p) => (p.id === updatedProj.id ? updatedProj : p)),
            },
            isLoading: false,
          },
        });
      }
      return project;
    } catch (err) {
      handleError('Could not update project');
      throw err instanceof Error ? err : new Error('Error updating project', { cause: err });
    } finally {
      setShowUpdateModal(false);
      setName('');
      setDescription('');
    }
  }

  async function handleAdd(e: SubmitEvent) {
    e.preventDefault();
    try {
      await modifyProjectUserAction(operation, currProject, userToAdd, newRole);
    } catch (err) {
      throw new Error('Error modifying project user', { cause: err });
    } finally {
      setAddUser(false);
      setUserToAdd('');
      setNewRole('PROJECT_VIEWER');
      setOperation('Add');
    }
  }

  async function addGlobal(e: SubmitEvent) {
    e.preventDefault();
    try {
      await addGlobalAdminAction(globalAdminEmail);
    } catch (err) {
      handleError('Error adding global admin');
      throw new Error('Error adding global admin', { cause: err });
    }
  }

  async function openManageMembers(projectId: string) {
    setAddUser(true);
    setCurrProject(projectId);
    try {
      setProjectMembers(await fetchProjectMembers(projectId));
    } catch (err) {
      handleError('Error fetching project members');
      setProjectMembers([]);
      throw new Error('Error fetching project members', { cause: err });
    }
  }

  function openProjectSettings(project: Project) {
    setCurrProject(project.id);
    setUpdatedDesc(project.description);
    setUpdatedName(project.name);
    setUpdatedIsArchived(project.isArchived);
    setShowUpdateModal(true);
  }

  return {
    user,
    projects,
    notifs,
    setShowCreateModal,
    setShowNotifications,
    setShowAdminModal,
    openManageMembers,
    openProjectSettings,
    modalProps: {
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
    },
  };
}

export default useDashboardController;
