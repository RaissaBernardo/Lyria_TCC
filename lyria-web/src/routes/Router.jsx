import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/InitialScreen";
import RegistrationAndLogin from "../pages/RegistrationAndLoginScreen";
import Chat from "../pages/ChatScreen";
import Profile from "../pages/ProfileScreen";
import LoadingScreen from "../components/LoadingScreen";
import GalaxyLayout from "../components/GalaxyLayout";
import AnimatedPage from "../components/AnimatedPage";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route element={<GalaxyLayout />}>
          <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
          <Route path="/loading" element={<LoadingScreen />} />
          <Route path="/RegistrationAndLogin" element={<RegistrationAndLogin />}/>
          <Route path="/chat" element={<AnimatedPage><Chat /></AnimatedPage>} />
          <Route path="/profile" element={<AnimatedPage><Profile /></AnimatedPage>} />
        </Route>
      </Routes>
    </Router>
  );
}