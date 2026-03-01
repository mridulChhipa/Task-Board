# Task Board

## 1. Setup


## 5. Directory Structure
```
backend/
├── .env                  # Environment variables (DB credentials, JWT secrets)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── Dockerfile            # Docker configuration for deployment
├── src/
│   ├── index.ts          # Application entry point (server initialization)
│   ├── app.ts            # Express app setup (middlewares, routes)
│   │
│   ├── config/           # App configurations
│   │   ├── database.ts   # Database connection pool setup
│   │   └── env.ts        # Environment variable validation
│   │
│   ├── routes/           # API route definitions (mapping endpoints to controllers)
│   │   ├── auth.routes.ts
│   │   ├── project.routes.ts
│   │   ├── board.routes.ts
│   │   └── issue.routes.ts
│   │
│   ├── controllers/      # Extracting req/res, calling services, sending JSON
│   │   ├── auth.controller.ts
│   │   ├── project.controller.ts
│   │   └── issue.controller.ts
│   │
│   ├── services/         # Core Business Logic (WIP limits, hierarchy checks live here)
│   │   ├── auth.service.ts
│   │   ├── board.service.ts
│   │   ├── issue.service.ts
│   │   └── notification.service.ts
│   │
│   ├── repositories/     # Direct database interactions (SQL queries / ORM calls)
│   │   ├── user.repository.ts
│   │   ├── issue.repository.ts
│   │   └── audit.repository.ts
│   │
│   ├── middlewares/      # Interceptors for requests
│   │   ├── auth.guard.ts # Verifies JWT
│   │   ├── rbac.guard.ts # Checks Global/Project Roles
│   │   └── error.handler.ts 
│   │
│   ├── events/           # Internal event pub/sub (Decouples logic)
│   │   ├── eventBus.ts   # Event emitter setup
│   │   └── listeners/    # Listens for 'IssueMoved' to trigger audits/notifications
│   │
│   ├── utils/            # Helper functions
│   │   ├── jwt.utils.ts
│   │   └── hash.utils.ts
│   │
│   └── types/            # TypeScript interfaces/types
│       └── express.d.ts  # Extending Express Request object (e.g., req.user)
│
└── tests/                # Unit and integration tests
    ├── services/
    └── controllers/

frontend/
├── .env                  # API URLs (e.g., VITE_API_BASE_URL)
├── package.json          
├── vite.config.ts        # Build tool configuration
├── src/
│   ├── main.tsx          # React application mount point
│   ├── App.tsx           # Root component (Routing wrapper)
│   │
│   ├── assets/           # Static files (images, global CSS)
│   │
│   ├── components/       # Global, reusable, "dumb" UI components
│   │   ├── ui/           # Buttons, Inputs, Modals, Avatars
│   │   └── layout/       # Sidebar, TopNav, AppLayout
│   │
│   ├── config/           # Axios setup, constants
│   │   └── api.ts        # Axios instance with JWT interceptors (handles refresh tokens)
│   │
│   ├── features/         # Domain-specific modules (The core of the app)
│   │   ├── auth/         # Login, Register, Session management
│   │   │   ├── components/
│   │   │   ├── api/      # Auth-specific API calls
│   │   │   └── store/    # Auth global state
│   │   │
│   │   ├── projects/     # Project creation, settings, role management
│   │   │
│   │   ├── boards/       # Kanban board logic
│   │   │   ├── components/ 
│   │   │   │   ├── Board.tsx       # Drag-and-drop context provider
│   │   │   │   └── Column.tsx      # Renders tasks, handles WIP limit UI warnings
│   │   │   └── hooks/
│   │   │       └── useDragAndDrop.ts 
│   │   │
│   │   ├── issues/       # Issue creation, editing, details modal
│   │   │   ├── components/
│   │   │   │   ├── IssueCard.tsx
│   │   │   │   └── IssueDetailModal.tsx # Handles Comments and Sub-tasks
│   │   │   └── api/
│   │   │
│   │   └── notifications/ # Polling logic, Notification center UI
│   │
│   ├── hooks/            # Global reusable hooks (e.g., useClickOutside)
│   │
│   ├── routes/           # Application routing logic
│   │   ├── ProtectedRoute.tsx # Redirects to login if no JWT
│   │   └── index.tsx     # Route definitions mapped to Pages
│   │
│   ├── pages/            # Top-level views combining layouts and features
│   │   ├── LoginPage.tsx
│   │   ├── ProjectDashboardPage.tsx
│   │   └── BoardPage.tsx
│   │
│   ├── store/            # Global state (Zustand or Redux) for non-feature-specific data
│   │
│   ├── types/            # Global TypeScript interfaces
│   │
│   └── utils/            # Formatting dates, text truncation
│
└── tests/                # React Testing Library setups
```
    