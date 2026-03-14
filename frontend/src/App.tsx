import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage/Homepage.tsx';
import SignupPage from './pages/Auth/Signuppage.tsx';
import LoginPage from './pages/Auth/Loginpage.tsx';
import DashBoard from './pages/Dashboard/Dashboard.tsx';
import NavBar from './components/NavBar/Navbar.tsx';
import { AuthProvider } from './context/AuthProvider.tsx';
import Loader from './components/ui/Loader.tsx';
import ProjectPage from './pages/project.page.tsx';
import { ProjectProvider } from './context/ProjectProvider.tsx';
import TaskPage from './pages/task.page.tsx';
import { taskLoader } from './utils/task.utils.ts';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Loader />
        <NavBar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route
            path="/project/:pid"
            element={
              <ProjectProvider>
                <ProjectPage>
                </ProjectPage>
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
