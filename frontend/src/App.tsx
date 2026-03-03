import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage/Homepage.tsx";
import SignupPage from "./pages/Loginpage/Signuppage.tsx";
import LoginPage from "./pages/Loginpage/Loginpage.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
