import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { EventPage } from "./pages/EventPage";
import { OrganizerDashboard } from "./pages/OrganizerDashboard";
import { Scanner } from "./pages/Scanner";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<EventPage />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/scanner" element={<Scanner />} />
      </Routes>
    </Layout>
  );
}
