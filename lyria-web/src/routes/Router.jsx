import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/InitialScreen";
import RegistrationAndLogin from "../pages/RegistrationAndLoginScreen";
import Chat from "../pages/ChatScreen";
import LoadingScreen from "../components/LoadingScreen";
import GalaxyLayout from "../components/GalaxyLayout"; // 1. Importe o layout

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* 2. Crie uma rota pai que usa o GalaxyLayout como elemento */}
        <Route element={<GalaxyLayout />}>
          {/* 3. Coloque todas as rotas que precisam do fundo como filhas */}
          <Route path="/" element={<Home />} />
          <Route path="/loading" element={<LoadingScreen />} />
          <Route path="/RegistrationAndLogin" element={<RegistrationAndLogin />}/>
          <Route path="/chat" element={<Chat />} />
        </Route>
      </Routes>
    </Router>
  );
}