import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage/Homepage.tsx";
import SignupPage from "./pages/Auth/Signuppage.tsx";
import LoginPage from "./pages/Auth/Loginpage.tsx";
import DashBoard from "./pages/Dashboard/Dashboard.tsx";
import NavBar from "./components/NavBar/Navbar.tsx";
import { AuthProvider } from "./user_data/AuthProvider.tsx";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashBoard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
