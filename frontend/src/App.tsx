import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { useContext } from 'react';
import { PopupContext, triggerPopup } from './context/PopupProvider.tsx';

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
          <Route path="/dashboard" element={<DashBoard />} />
          <Route
            path="/project/:pid"
            element={
              <ProjectProvider>
                <ProjectPage></ProjectPage>
              </ProjectProvider>
            }
          />

          <Route
            path="/project/:pid/task/:tid"
            element={
              <ProjectProvider>
                <TaskPage />
              </ProjectProvider>
            }
          />
          <Route path="/account" element={<Account />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export async function handleNotification(
  senderId: number,
  notification: string,
) {
  const res = await fetch(`http://localhost:3000/api/auth/${senderId}`, {
    method: 'GET',
    credentials: 'include',
  });
  const user = await res.json();
  const sender = user.data.personalData.name;
  triggerPopup(sender, notification, false);
}

export async function handleError(message: string) {
  triggerPopup('ERROR', message, true);
}

export default App;
