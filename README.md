# Task Board

## 1. Setup
- Follow the given instruction separately for backend:
  1. `cd backend`
  2. `npm install`
  3. `npx prisma init --datasource-provider postgresql --output ../generated/prisma`
      - This will generate some files and .env 
      - update the .env file [PORT=3000, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, DATABASE_URL]
  4. `npx prisma migrate reset`
  5. `npx prisma migrate dev`
  6. `npx prisma migrate`

## 2. Running the server
- The server resided in the backend
  1. `cd backend`
  2. `npm run dev` -> this runs the server

- Below are some useful commands 
  - `npm run test`-> this runs tests
  - `npm run format` -> applies prettier
  - `npm run lint` -> return a lint check
  
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
    
Since you are already using `req.cookies` throughout your controllers and services, the best approach is to write a **custom middleware** that mimics `cookie-parser`.

If you name the property on the `req` object exactly the same (`req.cookies`), your existing logic will continue to work without changing a single line in your services or controllers.

### 1. Create a "Replacer" Middleware

Create a file (e.g., `middlewares/customCookieParser.ts`). This function parses the raw header string into an object and attaches it to the request.

```typescript
import { Request, Response, NextFunction } from 'express';

export const customCookieParser = (req: Request, res: Response, next: NextFunction) => {
  const cookieHeader = req.headers.cookie;
  const cookies: Record<string, string> = {};

  if (cookieHeader) {
    // 1. Split by ';' to get individual pairs
    // 2. Split by '=' to get key and value
    cookieHeader.split(';').forEach(cookie => {
      const [parts, ...rest] = cookie.split('=');
      const name = parts.trim();
      if (!name) return;
      
      // Join the rest in case the value itself contains an '='
      const value = rest.join('=').trim();
      
      // Decode the URI component (handles spaces, @, etc.)
      cookies[name] = decodeURIComponent(value);
    });
  }

  // Assign to req.cookies so existing code works
  req.cookies = cookies;
  next();
};

```

### 2. Swap the Import in `app.ts`

Now, instead of importing the library, import your own function. This is the only place you'll need to change code.

**Before:**

```typescript
import cookieParser from 'cookie-parser';
app.use(cookieParser());

```

**After:**

```typescript
import { customCookieParser } from './middlewares/customCookieParser';
app.use(customCookieParser);

```

### 3. Fixing the TypeScript Errors

Because `req.cookies` isn't natively part of the Express `Request` type (it's usually added by the `@types/cookie-parser` package), TypeScript might complain.

You can fix this globally by creating a `types.d.ts` file in your project root:

```typescript
import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      // This tells TS that req.cookies exists even without the library
      cookies: Record<string, string>;
    }
  }
}
```

### Why this works perfectly:

* **No Controller Changes:** Since your controllers call `req.cookies['sessionID']`, they won't know the difference between the library and your manual function.
* **Standard Compliance:** It handles multiple cookies and URI decoding, which is what the library does under the hood for basic cookies.
* **Assignment Safe:** You aren't using a "forbidden" library, but you're still using the clean "middleware" pattern expected in professional Express apps.
