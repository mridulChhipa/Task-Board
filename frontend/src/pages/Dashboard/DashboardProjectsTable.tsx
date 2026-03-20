import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button';
import { IconSettings } from '../../components/Boards/boards.images';
import type { Project } from '../../types/project.types';
import styles from './Dashboard.module.css';

type DashboardProjectsTableProps = {
  projects: Project[];
  onCreateProject: () => void;
  onManageMembers: (project: Project) => void;
  onOpenProjectSettings: (project: Project) => void;
};

function DashboardProjectsTable({
  projects,
  onCreateProject,
  onManageMembers,
  onOpenProjectSettings,
}: DashboardProjectsTableProps) {
  return (
    <div className={styles.dashboard}>
      <div className={styles.projectHeader}>
        <h2>Projects</h2>
        <Button onClick={onCreateProject}>Create Project</Button>
      </div>
      <table className={styles.projectTable}>
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Role</th>
            <th>Description</th>
            <th>Members</th>
            <th>More Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => (
            <tr
              key={project.id}
              style={{ cursor: 'pointer' }}
              className={index % 2 === 0 ? styles.evenRow : styles.oddRow}
            >
              <td>
                <Link className={styles.projectLink} to={`/project/${project.id}`}>
                  {project.name}
                </Link>
              </td>
              <td>{project.role}</td>
              <td>{project.description}</td>
              <td style={{ position: 'relative' }}>
                <Button onClick={() => onManageMembers(project)}>Manage</Button>
              </td>
              <td
                style={{
                  verticalAlign: 'middle',
                  textAlign: 'center',
                  height: '100%',
                }}
              >
                <button
                  type='button'
                  onClick={() => onOpenProjectSettings(project)}
                  aria-label={`Settings for ${project.name}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconSettings size={25} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DashboardProjectsTable;
