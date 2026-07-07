import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Homepage/Homepage.tsx';
import DashBoard from './pages/Dashboard/Dashboard.tsx';
import NavBar from './components/NavBar/Navbar.tsx';
import { AuthProvider } from './context/AuthProvider.tsx';
import Loader from './components/ui/Loader.tsx';
import ProjectPage from './pages/Projects/project.page.tsx';
import { ProjectProvider } from './context/ProjectProvider.tsx';
import TaskPage from './pages/Tasks/task.page.tsx';
import LogInPage from './pages/Auth/Loginpage.tsx';
import SignUpPage from './pages/Auth/Signuppage.tsx';
import Account from './pages/Account/Account.tsx';
import { useContext, type ReactNode } from 'react';
import { PopupContext, triggerPopup } from './context/PopupProvider.tsx';
import { AuthContext } from './context/AuthContext.ts';

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

function App() {
  const showPopup = useContext(PopupContext);
  if (!showPopup) {
    throw new Error('PopupContext not found');
  }
  return (
    <AuthProvider>
      <BrowserRouter>
        <Loader />
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<LogInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashBoard />
              </RequireAuth>
            }
          />
          <Route
            path="/project/:pid"
            element={
              <RequireAuth>
                <ProjectProvider>
                  <ProjectPage></ProjectPage>
                </ProjectProvider>
              </RequireAuth>
            }
          />

          <Route
            path="/project/:pid/task/:tid"
            element={
              <RequireAuth>
                <ProjectProvider>
                  <TaskPage />
                </ProjectProvider>
              </RequireAuth>
            }
          />
          <Route
            path="/account"
            element={
              <RequireAuth>
                <Account />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export async function handleError(message: string) {
  triggerPopup('ERROR', message, true);
}

export default App;
