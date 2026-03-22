# Task Board
## A Project Management Application

**Overview**
Task Board is a project management and issue-tracking application inspired by Jira. It enables teams to plan, track, and manage work using boards, issues, workflows, and more.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
* **Node.js** (v18 or higher recommended)
* **npm** (Package manager)
* **PostgreSQL** (Ensure the local server is running and you have your credentials)
* **Git**

## Setup & Installation

### Clone the Repository
```bash
git clone https://github.com/mridulChhipa/Task-Board.git
cd 'task-board'
```
## Setup
- Follow the given instruction separately for backend:
  1. `cd backend`
  2. `npm install`
  3. `npx prisma init --datasource-provider postgresql --output ../generated/prisma`
      - This will generate some files and .env 
      - update the .env file [PORT=3000, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, DATABASE_URL]
  4. `npx prisma migrate reset`
  5. `npx prisma migrate dev`
  6. `npx prisma generate`
  7. `npm run dummy`
  8. `npm run dev`
  9. `cd .. && cd frontend`
  10. `npm install`

## Running the server and frontend
- The server resided in the `\backend`
  1. `cd backend`
  2. `npm run dev` -> this runs the express server

- The UI resides in `\frontend`
  1. `cd frontend`
  2. `npm run dev` -> starts react frontend

  - Follow the urls that appear in console / terminal.

- Below are some useful commands 
  - `npm run test`-> this runs tests
  - `npm run format` -> applies prettier
  - `npm run lint` -> return a lint check

## API Documentation

The backend exposes a RESTful API with authentication handled via JSON Web Tokens (JWT) stored in HTTP-only cookies. All endpoints require authentication except for registration and login.

### Authentication & User Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate user & set HTTP-only cookie |
| `PATCH` | `/api/auth/refresh` | Refresh access token |
| `POST` | `/api/auth/logout` | Logout user & invalidate token |
| `GET` | `/api/auth/me` | Get current user info |

### Projects
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/project/create` | Create a new project | Global Admin |
| `GET` | `/api/project/all-projects/global` | Get all projects (admin only) | Global Admin |
| `GET` | `/api/project/:projectId` | Get project details | Viewer+ |
| `PATCH` | `/api/project/update/:projectId` | Update project info | Project Admin |
| `PATCH` | `/api/project/set-archive-status/:projectId` | Archive/unarchive project | Project Admin |
| `DELETE` | `/api/project/:projectId` | Delete project | Project Admin |
| `POST` | `/api/project/assign-user/:projectId` | Assign user to project | Project Admin |
| `POST` | `/api/project/remove-user/:projectId` | Remove user from project | Project Admin |
| `PATCH` | `/api/project/update-role/:projectId` | Update user role in project | Project Admin |

### Boards & Columns
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/project/:projectId/board/create` | Create a new board | Project Admin |
| `GET` | `/api/project/:projectId/board/:boardId` | Get board with columns | Viewer+ |
| `PATCH` | `/api/project/:projectId/board/update/:boardId` | Update board | Project Admin |
| `DELETE` | `/api/project/:projectId/board/delete/:boardId` | Delete board | Project Admin |
| `POST` | `/api/project/:projectId/board/add-column/:boardId` | Add column to board | Member+ |
| `DELETE` | `/api/project/:projectId/board/:boardId/remove-column/:columnId` | Remove column | Member+ |
| `PUT` | `/api/project/:projectId/board/:boardId/update-column/:columnId` | Update column | Member+ |
| `GET` | `/api/project/:projectId/board/column/:colId` | Get column details | Viewer+ |
| `POST` | `/api/project/:projectId/board/:boardId/create-edge` | Create workflow edge | Member+ |
| `DELETE` | `/api/project/:projectId/board/:boardId/remove-edge/:edgeId` | Remove workflow edge | Member+ |

### Tasks
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/task/create` | Create a new task | Member+ |
| `GET` | `/api/task/:taskId` | Get task details | Viewer+ |
| `PUT` | `/api/task/update/:taskId` | Update task | Member+ |
| `DELETE` | `/api/task/delete/:taskId` | Delete task | Project Admin |

### Comments & Threads
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/comment/create-thread` | Create comment thread | Member+ |
| `POST` | `/api/comment/create-comment` | Add comment to thread | Member+ |
| `PATCH` | `/api/comment/update-thread/:tid` | Update thread (author only) | Comment Author |
| `PATCH` | `/api/comment/update-comment/:cid` | Update comment (author only) | Comment Author |
| `PATCH` | `/api/comment/delete-thread/:tid` | Delete thread (author only) | Comment Author |
| `PATCH` | `/api/comment/delete-comment/:cid` | Delete comment (author only) | Comment Author |

### Notifications
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/notification/create` | Create notification |
| `GET` | `/api/notification/:nid` | Get notification |
| `PATCH` | `/api/notification/:nid` | Mark notification as read |
| `DELETE` | `/api/notification/:nid` | Delete notification |
