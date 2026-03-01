# Task Board

## 1. Setup

## 2. Directory Structure
```
backend/
├── src/
│   ├── app.ts
│   ├── index.ts  

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
    