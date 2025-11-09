import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminEventRequests from "./pages/AdminEventRequests";
import UserPanel from "./pages/UserPanel";
import LoginPage from "./pages/LoginPage";
import RequestEvent from "./pages/RequestEvent";
import AboutPage from "./pages/AboutPage";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EventDetails from "./pages/EventDetails";
import CricketTeamRegistration from "./pages/CricketTeamRegistration";
import EventLanding from "./pages/EventLanding";
import EventMatches from "./pages/EventMatches";
import LiveMatchView from "./pages/LiveMatchView";
import MatchResult from "./pages/MatchResult";
import ScorerDashboard from "./pages/ScorerDashboard";
import RegisteredTeams from './pages/RegisteredTeams';
import PointsTable from "./pages/PointsTable";
import PlayerProfile from './pages/PlayerProfile';
import TeamDetails from "./pages/TeamDetails";






// make sure import matches usage

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      {/* <Route path="/admin" element={<AdminEventRequests />} /> */}
      <Route path="/user" element={<UserPanel />} />
      <Route path="/request-event" element={<RequestEvent />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/event/:eventId" element={<EventDetails />} />
      <Route path="/register-team" element={<CricketTeamRegistration />} />
      <Route path="/EventLanding" element={<EventLanding />} />
      <Route path="/EventMatches" element={<EventMatches />} />
      <Route path="/live-match/:matchId" element={<LiveMatchView />} />
      <Route path="/match-result/:matchId" element={<MatchResult />} />
      <Route path="/ScorerDashboard" element={<ScorerDashboard />} /> 

      <Route path="/registered-teams/:eventId" element={<RegisteredTeams />} />
      <Route path="/points-table" element={<PointsTable />} />
      <Route path="/players/:id" element={<PlayerProfile />} />
      <Route path="/team/:teamId" element={<TeamDetails />} />


      

      {/* Protected Admin Route */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminEventRequests />
          </ProtectedAdminRoute>
        }
      />
    </Routes>
  );
}

export default App;
