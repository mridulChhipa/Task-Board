import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage/Homepage.tsx";
import SignupPage from "./pages/Loginpage/Signuppage.tsx";
import LoginPage from "./pages/Loginpage/Loginpage.tsx";
import UserDataProvider from "./user_data/UserDataWrapper.tsx";
import DashBoard from "./pages/Dashboard/Dashboard.tsx";

function App() {
  return (
    <UserDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashBoard />} />
        </Routes>
      </BrowserRouter>
    </UserDataProvider>
  );
}

export default App;
